"use client";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{
        background: "linear-gradient(135deg, #68ac53 0%, #4a8a3a 50%, #2d5c22 100%)",
      }}
    >
      {/* Header */}
      <div className="text-center mt-8">
        <h1 className="text-white text-5xl font-bold tracking-tight">Tossit</h1>
        <p className="text-white/80 text-lg mt-2">Smart waste classification</p>
      </div>

      {/* Illustration */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-48 h-48 rounded-full bg-white/15 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-6xl">♻️</span>
          </div>
        </div>
        <p className="text-white/90 text-center mt-6 text-base leading-7 max-w-xs">
          Take a photo of any waste item and instantly know whether it&apos;s
          recyclable, organic, or landfill.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-4 mb-4">
        <Link
          href="/auth/sign-in"
          className="block w-full text-center bg-white rounded-2xl py-4 font-bold text-[#68ac53] text-lg shadow-md hover:bg-white/90 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/sign-up"
          className="block w-full text-center border-2 border-white/60 rounded-2xl py-4 font-bold text-white text-lg hover:bg-white/10 transition-colors"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
