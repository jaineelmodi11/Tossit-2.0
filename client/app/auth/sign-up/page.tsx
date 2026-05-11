"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/firebase/auth";
import { initUserDoc } from "@/lib/firebase/firestore";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { user } = await signUp(trimmedEmail, password);
      await initUserDoc(user.uid);
      router.replace("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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

        <h1 className="text-[#1E232C] text-4xl font-bold mb-2">Create account</h1>
        <p className="text-gray-400 text-base mb-10">
          Start reducing your waste footprint today.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
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
          <div className="bg-gray-100 rounded-2xl px-4 h-16 flex items-center gap-3">
            <span className="text-gray-400 text-lg">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min. 6 characters)"
              autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="bg-gray-100 rounded-2xl px-4 h-16 flex items-center gap-3 mb-4">
            <span className="text-gray-400 text-lg">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 bg-transparent text-gray-800 text-base outline-none placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl py-5 font-bold text-white text-lg transition-colors"
            style={{ backgroundColor: loading ? "#a8d49a" : "#68ac53" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="flex justify-center gap-1 mt-8">
          <span className="text-gray-400 text-base">Already have an account?</span>
          <Link
            href="/auth/sign-in"
            className="text-[#68ac53] font-semibold text-base hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
