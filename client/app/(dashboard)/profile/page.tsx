"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useWasteStore } from "@/store/wasteStore";
import { signOutUser } from "@/lib/firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { totals } = useWasteStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const totalItems = totals.Recycling + totals.Organic + totals.Garbage;
  const recyclingRate =
    totalItems > 0 ? Math.round((totals.Recycling / totalItems) * 100) : 0;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      router.replace("/auth/welcome");
    } catch {
      setSigningOut(false);
      setShowConfirm(false);
    }
  };

  const stats = [
    { label: "Total Items", value: totalItems, emoji: "📦" },
    { label: "Recycled", value: totals.Recycling, emoji: "♻️" },
    { label: "Organic", value: totals.Organic, emoji: "🌱" },
    { label: "Garbage", value: totals.Garbage, emoji: "🗑️" },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-2xl mx-auto px-5 py-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[#1E232C] text-2xl font-bold">Profile</h1>
        </div>

        {/* Avatar + info */}
        <div className="bg-white rounded-3xl p-6 mb-5 flex flex-col items-center shadow-sm">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#68ac53" }}
          >
            <span className="text-white text-3xl font-bold">
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <p className="text-[#1E232C] font-bold text-lg">
            {user?.email?.split("@")[0] ?? "User"}
          </p>
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Recycling rate */}
        <div
          className="rounded-3xl p-5 mb-5 shadow-sm"
          style={{ backgroundColor: "#68ac53" }}
        >
          <p className="text-white/80 text-sm mb-1">Your Recycling Rate</p>
          <p className="text-white text-4xl font-bold">{recyclingRate}%</p>
          <p className="text-white/70 text-xs mt-1">
            {totals.Recycling} of {totalItems} items recycled
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map(({ label, value, emoji }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-[#1E232C] text-2xl font-bold">{value}</div>
              <div className="text-gray-400 text-xs mt-0.5 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Account section */}
        <div className="bg-white rounded-3xl overflow-hidden mb-5 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest px-5 pt-4 pb-2">
            Account
          </p>
          <div className="px-5 py-3 border-b border-gray-50">
            <p className="text-gray-400 text-xs">Signed in as</p>
            <p className="text-[#1E232C] text-sm font-medium mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-red-500 font-semibold text-base">Sign Out</span>
            <span className="text-gray-300">→</span>
          </button>
        </div>

        {/* App info */}
        <div className="flex items-center justify-center py-4">
          <p className="text-gray-300 text-xs">Tossit v2.0 • Built with ♻️</p>
        </div>
      </div>

      {/* Sign out confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-[#1E232C] text-lg font-bold mb-2">Sign Out</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
