"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { subscribeToHistory } from "@/lib/firebase/firestore";
import type { HistoryEntry } from "@/types";

export function useHistory() {
  const uid = useAuthStore((s) => s.user?.uid);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToHistory(
      uid,
      (data) => {
        setEntries(data);
        setLoading(false);
      },
      () => {
        setError("Couldn't load your scan history. Please try again later.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [uid]);

  return { entries, loading, error };
}
