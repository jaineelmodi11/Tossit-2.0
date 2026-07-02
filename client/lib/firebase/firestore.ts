import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  increment,
  writeBatch,
  Timestamp,
  type FirestoreError,
} from "firebase/firestore";
import { db } from "./config";
import { toDateKey } from "../utils/dateHelpers";
import type { UserWasteDocument, WasteCategory, HistoryEntry } from "../../types";

export const initUserDoc = (uid: string) =>
  setDoc(
    doc(db, "users", uid),
    { Organic: 0, Garbage: 0, Recycling: 0 },
    { merge: true }
  );

export const subscribeToUserDoc = (
  uid: string,
  callback: (data: UserWasteDocument) => void,
  onError?: (error: FirestoreError) => void
) =>
  onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserWasteDocument);
      } else {
        // Accounts created before initUserDoc existed have no doc yet.
        callback({ Recycling: 0, Organic: 0, Garbage: 0 });
      }
    },
    onError
  );

/**
 * Records one classification atomically in a single round-trip:
 * category total, daily linegraph bucket, and a history entry.
 * increment() makes concurrent scans race-free without a pre-read.
 */
export const recordClassification = async (
  uid: string,
  category: WasteCategory
) => {
  const userRef = doc(db, "users", uid);
  const historyRef = doc(collection(db, "users", uid, "history"));
  const dateKey = toDateKey();

  const batch = writeBatch(db);
  batch.set(
    userRef,
    {
      [category]: increment(1),
      linegraph: { [dateKey]: { [category]: increment(1) } },
      lastScanAt: serverTimestamp(),
    },
    { merge: true }
  );
  batch.set(historyRef, { category, timestamp: serverTimestamp() });
  await batch.commit();
};

export const subscribeToHistory = (
  uid: string,
  callback: (entries: HistoryEntry[]) => void,
  onError?: (error: FirestoreError) => void
) => {
  const q = query(
    collection(db, "users", uid, "history"),
    orderBy("timestamp", "desc"),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const entries: HistoryEntry[] = snap.docs.map((d) => ({
        id: d.id,
        category: d.data().category as WasteCategory,
        timestamp: (d.data().timestamp as Timestamp)?.toDate() ?? new Date(),
      }));
      callback(entries);
    },
    onError
  );
};
