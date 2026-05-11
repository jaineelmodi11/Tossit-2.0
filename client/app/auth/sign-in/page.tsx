"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/firebase/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await signIn(trimmedEmail, password);
      router.replace("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-8 max-w-lg mx-auto w-full">
        {/* Back */}
        <Link
          href="/auth/welcome"
          className="inline-flex items-center justify-center w-12 h-12 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors mt-4 mb-8"
        >
          ←
        </Link>

        <h1 className="text-[#1E232C] text-4xl font-bold mb-2">Welcome back!</h1>
        <p className="text-gray-400 text-base mb-10">
          Sign in to continue tracking your waste.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          {/* Email */}
          <div className="bg-gray-100 rounded-2xl px-4 h-16 flex items-center gap-3">
            <span className="text-gray-400 text-lg">✉️</span>
            <input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 text-base outline-none placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div className="bg-gray-100 rounded-2xl px-4 h-16 flex items-center gap-3 mb-4">
            <span className="text-gray-400 text-lg">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 text-base outline-none placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-gray-400 text-sm hover:text-gray-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl py-5 font-bold text-white text-lg transition-colors"
            style={{ backgroundColor: loading ? "#a8d49a" : "#68ac53" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="flex items-center my-6 gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex justify-center gap-1 mt-4">
          <span className="text-gray-400 text-base">Don&apos;t have an account?</span>
          <Link
            href="/auth/sign-up"
            className="text-[#68ac53] font-semibold text-base hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
