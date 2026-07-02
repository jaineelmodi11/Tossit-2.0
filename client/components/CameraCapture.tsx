"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
}

/**
 * Full-screen camera viewfinder. Shows a live preview so the user can aim,
 * and only captures once the video is actually delivering frames.
 */
export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
      } catch {
        if (!cancelled) {
          setError(
            "Couldn't access the camera. Check browser permissions, or upload a photo instead."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(new File([blob], "photo.jpg", { type: "image/jpeg" }));
          onClose();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center px-8">
            <p className="text-white/80 text-sm text-center leading-6">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <button
          onClick={onClose}
          aria-label="Close camera"
          className="absolute top-4 right-4 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold hover:bg-black/70 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="bg-black py-6 flex items-center justify-center">
        {error ? (
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-white/10 text-white font-semibold"
          >
            Close
          </button>
        ) : (
          <button
            onClick={capture}
            disabled={!ready}
            aria-label="Take photo"
            className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors disabled:opacity-40"
          />
        )}
      </div>
    </div>
  );
}
