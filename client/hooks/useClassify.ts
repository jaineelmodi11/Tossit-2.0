"use client";
import { useState, useRef } from "react";
import { classifyImage } from "../lib/api/classify";
import { recordClassification } from "../lib/firebase/firestore";
import { useAuthStore } from "../store/authStore";
import type { WasteCategory } from "../types";

export function useClassify() {
  const { user } = useAuthStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<WasteCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageFile(file);
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const category = await classifyImage(file);
      setResult(category);
      if (user) {
        await recordClassification(user.uid, category);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  const pickFromLibrary = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());

      canvas.toBlob(
        (blob) => {
          if (blob) processFile(new File([blob], "photo.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.8
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Camera access failed");
    }
  };

  const reset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  return {
    imageUrl,
    imageFile,
    result,
    loading,
    error,
    pickFromLibrary,
    onFileChange,
    takePhoto,
    reset,
    fileInputRef,
  };
}
