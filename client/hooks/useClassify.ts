"use client";
import { useState, useRef, useCallback } from "react";
import { classifyImage } from "../lib/api/classify";
import { recordClassification } from "../lib/firebase/firestore";
import { useAuthStore } from "../store/authStore";
import type { ClassificationResult } from "../types";

export function useClassify() {
  const { user } = useAuthStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setResult(null);
      setSaved(false);
      setError(null);
      setLoading(true);
      try {
        const classification = await classifyImage(file);
        setResult(classification);
        if (user) {
          try {
            await recordClassification(user.uid, classification.category);
            setSaved(true);
          } catch {
            setError("Classified, but the result couldn't be saved to your dashboard.");
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Classification failed");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const pickFromLibrary = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const reset = () => {
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResult(null);
    setSaved(false);
    setError(null);
  };

  return {
    imageUrl,
    result,
    saved,
    loading,
    error,
    processFile,
    pickFromLibrary,
    onFileChange,
    reset,
    fileInputRef,
  };
}
