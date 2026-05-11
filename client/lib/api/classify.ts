import type { WasteCategory } from "../../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const VALID_CATEGORIES: WasteCategory[] = ["Recycling", "Organic", "Garbage"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function classifyImage(file: File): Promise<WasteCategory> {
  const base64 = await fileToBase64(file);

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: base64 }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const result = await response.json();
  const predicted = result.class as string;

  if (!VALID_CATEGORIES.includes(predicted as WasteCategory)) {
    throw new Error(`Unexpected classification result: "${predicted}"`);
  }

  return predicted as WasteCategory;
}
