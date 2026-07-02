import type { WasteCategory, ClassificationResult } from "../../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const VALID_CATEGORIES: WasteCategory[] = ["Recycling", "Organic", "Garbage"];

/** The model consumes 224x224; anything larger than this just slows the upload. */
const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.85;
const REQUEST_TIMEOUT_MS = 20_000;

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Downscales the image to MAX_DIMENSION on the long edge and re-encodes as
 * JPEG. A 12 MP phone photo drops from ~5 MB of base64 to ~50 KB. Falls back
 * to the original file if the browser can't decode it (e.g. exotic formats).
 */
async function toCompressedDataUrl(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return fileToDataUrl(file);
  }
}

export async function classifyImage(file: File): Promise<ClassificationResult> {
  const dataUrl = await toCompressedDataUrl(file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataUrl }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new Error("The classification server took too long to respond. Try again.");
    }
    throw new Error(
      "Could not reach the classification server. Make sure it's running and try again."
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.json())?.detail ?? "";
    } catch {
      // non-JSON error body; fall through to the generic message
    }
    if (response.status >= 400 && response.status < 500) {
      throw new Error(detail || "The server couldn't process that image. Try another photo.");
    }
    throw new Error(detail || `The classification server returned an error (${response.status}).`);
  }

  const result = await response.json();
  const predicted = result.class as string;

  if (!VALID_CATEGORIES.includes(predicted as WasteCategory)) {
    throw new Error(`Unexpected classification result: "${predicted}"`);
  }

  return {
    category: predicted as WasteCategory,
    confidence: typeof result.confidence === "number" ? result.confidence : undefined,
  };
}
