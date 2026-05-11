"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useWasteStore } from "../store/wasteStore";
import { subscribeToUserDoc } from "../lib/firebase/firestore";

export function useWasteData() {
  const { user } = useAuthStore();
  const { totals, linegraph, setWasteData } = useWasteStore();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserDoc(user.uid, setWasteData);
    return unsubscribe;
  }, [user?.uid]);

  return { totals, linegraph };
}
