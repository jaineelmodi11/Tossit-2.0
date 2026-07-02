"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Sends signed-in users straight to their dashboard. Renders nothing, so the
 * landing page stays fully server-rendered and crawlable for everyone else.
 */
export function AuthRedirect() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/home");
    }
  }, [user, isLoading, router]);

  return null;
}
