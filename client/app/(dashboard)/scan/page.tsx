"use client";
import { useState } from "react";
import { useClassify } from "@/hooks/useClassify";
import { CameraCapture } from "@/components/CameraCapture";
import { CATEGORY_CONFIG } from "@/lib/categories";

export default function ScanPage() {
  const {
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
  } = useClassify();
  const [cameraOpen, setCameraOpen] = useState(false);

  const config = result ? CATEGORY_CONFIG[result.category] : null;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-ink text-2xl font-bold">Scan Waste</h1>
          <p className="text-gray-400 text-sm mt-1">
            Take or upload a photo to classify your item
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        {/* Image preview */}
        <div className="mb-5">
          {imageUrl ? (
            <div className="relative">
              <div className="relative w-full h-64 rounded-3xl overflow-hidden">
                {/* Plain img: object URLs can't go through the Next image optimizer */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Selected waste item"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {!loading && (
                <button
                  onClick={reset}
                  aria-label="Clear image"
                  className="absolute top-3 right-3 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-bold hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
              <span className="text-5xl mb-3">📸</span>
              <p className="text-gray-400 text-sm text-center px-4">
                No image selected.
                <br />
                Use the buttons below to get started.
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-5 mb-5 flex items-center gap-4 shadow-sm">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-ink font-semibold">Classifying...</p>
              <p className="text-gray-400 text-xs mt-0.5">Sending to ML model</p>
            </div>
          </div>
        )}

        {/* Result card */}
        {result && config && !loading && (
          <div className={`${config.bg} rounded-3xl p-6 mb-5 shadow-sm`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{config.emoji}</span>
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                  Classification Result
                </p>
                <p className={`${config.text} text-2xl font-bold`}>
                  {config.longLabel}
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-5">{config.description}</p>
            {typeof result.confidence === "number" && (
              <p className="text-gray-400 text-xs mt-2">
                Model confidence: {Math.round(result.confidence * 100)}%
              </p>
            )}
            {saved && (
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-green-600 text-xs font-medium">
                  Saved to your dashboard
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 rounded-2xl p-4 mb-5 border border-red-100">
            <p className="text-red-600 text-sm font-medium">⚠️ Something went wrong</p>
            <p className="text-red-400 text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={() => setCameraOpen(true)}
            disabled={loading}
            className="w-full rounded-2xl py-5 flex items-center justify-center gap-3 shadow-sm font-bold text-white text-base bg-brand hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            <span className="text-xl">📷</span>
            Take Photo
          </button>

          <button
            onClick={pickFromLibrary}
            disabled={loading}
            className="w-full rounded-2xl py-5 flex items-center justify-center gap-3 bg-white border border-gray-200 shadow-sm font-bold text-gray-700 text-base hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">🖼️</span>
            Choose from Library
          </button>
        </div>
      </div>

      {cameraOpen && (
        <CameraCapture
          onCapture={processFile}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}
