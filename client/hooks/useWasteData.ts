"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useWasteStore } from "../store/wasteStore";
import { subscribeToUserDoc } from "../lib/firebase/firestore";

export function useWasteData() {
  const uid = useAuthStore((s) => s.user?.uid);
  const { totals, linegraph, setWasteData } = useWasteStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToUserDoc(uid, setWasteData, () => {
      setError("Couldn't load your dashboard data. Please try again later.");
    });
    return unsubscribe;
  }, [uid, setWasteData]);

  return { totals, linegraph, error };
}
