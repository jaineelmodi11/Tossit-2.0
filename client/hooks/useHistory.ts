"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { subscribeToHistory } from "@/lib/firebase/firestore";
import type { HistoryEntry } from "@/types";

export function useHistory() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = subscribeToHistory(user.uid, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user?.uid]);

  return { entries, loading };
}
