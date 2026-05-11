"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { href: "/home", label: "Dashboard", icon: "📊" },
  { href: "/scan", label: "Scan", icon: "📷" },
  { href: "/history", label: "History", icon: "🕓" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/welcome");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#68ac53] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex-col py-8 px-4 z-10">
        <div className="px-3 mb-10">
          <h2 className="text-[#68ac53] text-2xl font-bold tracking-tight">Tossit</h2>
          <p className="text-gray-400 text-xs mt-0.5">Smart waste classification</p>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-colors ${
                  active
                    ? "bg-[#68ac53]/10 text-[#68ac53]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="text-xl">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3">
          <p className="text-gray-300 text-xs">Tossit v2.0 • Built with ♻️</p>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-60 flex-1 flex flex-col">
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden z-10">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                active ? "text-[#68ac53]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
