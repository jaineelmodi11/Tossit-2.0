import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { UserWasteDocument, WasteCategory, WasteTotals, HistoryEntry } from "../../types";

export const initUserDoc = (uid: string) =>
  setDoc(
    doc(db, "users", uid),
    { Organic: 0, Garbage: 0, Recycling: 0 },
    { merge: true }
  );

export const subscribeToUserDoc = (
  uid: string,
  callback: (data: UserWasteDocument) => void
) =>
  onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as UserWasteDocument);
    }
  });

export const recordClassification = async (
  uid: string,
  category: WasteCategory
) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return;

  const data = snap.data() as UserWasteDocument;

  const today = new Date().toLocaleString().split(" ")[0].slice(0, -1);
  const lineData = data.linegraph ?? {};
  const todayEntry: WasteTotals = lineData[today] ?? {
    Recycling: 0,
    Organic: 0,
    Garbage: 0,
  };

  const updatedEntry = {
    ...todayEntry,
    [category]: (todayEntry[category] ?? 0) + 1,
  };

  await setDoc(
    doc(db, "users", uid),
    {
      [category]: (data[category] ?? 0) + 1,
      linegraph: { ...lineData, [today]: updatedEntry },
    },
    { merge: true }
  );

  await updateDoc(doc(db, "users", uid), { Timestamp: serverTimestamp() });

  await addDoc(collection(db, "users", uid, "history"), {
    category,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToHistory = (
  uid: string,
  callback: (entries: HistoryEntry[]) => void
) => {
  const q = query(
    collection(db, "users", uid, "history"),
    orderBy("timestamp", "desc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const entries: HistoryEntry[] = snap.docs.map((d) => ({
      id: d.id,
      category: d.data().category as WasteCategory,
      timestamp: (d.data().timestamp as Timestamp)?.toDate() ?? new Date(),
    }));
    callback(entries);
  });
};
