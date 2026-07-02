# TossIt 2.0 → 2.1 Migration Guide

This guide documents every change made in the `modernize-2.1` branch: what changed, why it changed, and how to maintain the result. The full flaw analysis that motivated these changes is in `ARCHITECTURE_REPORT.md`.

**Verified by:** `npm run lint`, `npm run typecheck`, `npm run build` (all clean), plus a live server smoke test in a fresh venv with the new pins — `/health` returned `model_loaded: true`, a real image returned `{"class": "Garbage", "confidence": 0.6591}`, and malformed payloads correctly returned HTTP 400.

---

## 1. Data layer (Firestore)

### 1.1 Date keys are now `YYYY-MM-DD` (breaking-ish, with a compat shim)

**Before:** `new Date().toLocaleString().split(" ")[0].slice(0, -1)` — a US-English-locale hack. On any non-US device it produced a different (or broken) key, so the 7-day chart silently lost data.

**After:** `toDateKey()` in `client/lib/utils/dateHelpers.ts` emits local-time `2026-07-02`-style keys. They're locale-independent and sort lexicographically.

**Your existing data:** old keys like `"7/2/2026"` are still read. `WasteLineChart` looks up the ISO key first, then falls back to `toLegacyDateKey()`. Once all charted data is more than 7 days old (i.e. one week after deploying), the fallback is dead weight and you can delete `toLegacyDateKey` and its call site if you want.

### 1.2 `recordClassification` is now one atomic batch

**Before:** `getDoc` → compute new totals in JS → `setDoc` → `updateDoc` → `addDoc`. Three round-trips, a lost-update race between concurrent scans, and a silent no-op if the user doc didn't exist.

**After:** a single `writeBatch` using `increment(1)` for the category total and the daily linegraph bucket, plus the history entry. No pre-read, no race, works even if the doc doesn't exist yet (thanks to `setDoc(..., { merge: true })`).

**Field change:** the user doc's last-activity marker is now `lastScanAt` (was the awkwardly-named `Timestamp`). Nothing reads either field today; old docs keep their `Timestamp` field harmlessly.

### 1.3 Security rules are now in the repo

`firestore.rules` (repo root) restricts `users/{uid}` and its `history` subcollection to the authenticated owner. Deploy with:

```bash
firebase deploy --only firestore:rules
```

**Maintenance:** any new collection you add must get a matching rule here — the default is deny.

### 1.4 Snapshot listeners surface errors

`subscribeToUserDoc` / `subscribeToHistory` accept an optional `onError` callback, and `useWasteData` / `useHistory` expose an `error` string that the Dashboard and History pages render. Previously a rules denial meant an infinite skeleton.

## 2. Classification pipeline

### 2.1 Client-side image downscaling

`lib/api/classify.ts` now resizes images to max 512 px (JPEG, q=0.85) via `createImageBitmap` + canvas before upload. The model input is 224×224, so nothing is lost, and a 12 MP photo shrinks from ~5 MB of base64 to ~50 KB — classification is now effectively network-latency-free. Unsupported formats fall back to sending the original file.

### 2.2 Timeouts and honest errors

- Requests abort after 20 s (`AbortSignal.timeout`) instead of hanging forever.
- Network failure, timeout, 4xx, and 5xx each produce a distinct human-readable message (the server's `detail` field is used when present).

### 2.3 The API returns confidence

`POST /predict` now responds `{"class": "...", "confidence": 0.97}` (softmax probability of the predicted class). The scan result card shows "Model confidence: 97%". The client treats `confidence` as optional, so old servers still work.

### 2.4 Camera capture is a real viewfinder

**Before:** `takePhoto()` grabbed a frame the instant the stream opened — usually before the camera delivered one, producing black photos or a silent no-op, with no way to aim.

**After:** `components/CameraCapture.tsx` renders a full-screen live `<video>` preview with a shutter button that stays disabled until frames flow (`onCanPlay`), guards `videoWidth === 0`, and always releases camera tracks on close/unmount.

### 2.5 Honest "saved" state

The result card only says "Saved to your dashboard" after the Firestore batch actually commits (`saved` state in `useClassify`). If classification succeeds but the save fails, you now see "Classified, but the result couldn't be saved…". Also fixed: object-URL leak when scanning multiple items in a row.

### 2.6 Scan preview uses `<img>` instead of `next/image`

Object URLs (`blob:`) can't pass through the Next image optimizer. A plain `<img>` is the correct tool for a local preview; the eslint rule is disabled on that one line intentionally.

## 3. Auth UX

- **Friendly error messages:** `lib/firebase/errors.ts` maps Firebase codes (`auth/invalid-credential`, `auth/email-already-in-use`, …) to plain English. Add new codes to `AUTH_ERROR_MESSAGES` as Firebase introduces them.
- **Password reset:** "Forgot password?" on the sign-in page sends a reset email via `sendPasswordResetEmail` and confirms inline. No more dead-end for forgotten passwords.
- **Removed** the dangling "— or —" divider on sign-in that implied a social login that doesn't exist.

## 4. Design system

- Brand colors are Tailwind 4 `@theme` tokens in `app/globals.css`: `--color-brand` (#68ac53), `--color-brand-dark`, `--color-brand-deep`, `--color-ink` (#1E232C). Every inline `style={{ backgroundColor: "#68ac53" }}` and arbitrary `text-[#68ac53]` class was replaced with `bg-brand` / `text-brand` / `text-ink` etc. **To rebrand, edit the four tokens — nothing else.**
- One shared `CATEGORY_CONFIG` in `lib/categories.ts` (labels, emoji, colors, disposal tips) replaces three drifting copies in Home/Scan/History. New categories get added there once.
- Recycling chart color changed from `#ADD8E6` (near-invisible light blue) to `#60A5FA` to match the `blue-50/blue-700` card palette.

## 5. Dead code & dependency removal

Deleted (all confirmed unused by any page):

| Removed | Why |
|---|---|
| `client/components/ui/` (7 components), `components.json`, `lib/utils.ts` | shadcn/ui scaffolding no page ever imported |
| deps: `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `shadcn`, `tailwind-merge`, `tw-animate-css` | only referenced by the dead UI kit (`shadcn` is a CLI and was wrongly a runtime dep) |
| ~110 lines of shadcn token CSS in `globals.css` | nothing consumed the tokens |
| `server/.expo/`, `server/image.png` | React-Native-era fossils tracked in git |
| `client/public/*.svg` (next/vercel boilerplate) | unused |

If you want shadcn/ui back later: `npx shadcn@latest init` and re-add components on demand — but only when a page actually uses them.

## 6. Dependency updates

**Client** (`client/package.json`, `npm install` regenerated the lockfile):

| Package | Before | After |
|---|---|---|
| next / eslint-config-next | 16.2.6 | 16.2.10 |
| react / react-dom | 19.2.4 | 19.2.7 |
| firebase | ^12.13.0 | ^12.15.0 |
| recharts | ^3.8.1 | ^3.9.1 |
| zustand | ^5.0.13 | ^5.0.14 |
| tailwindcss / @tailwindcss/postcss | ^4 (4.3.0) | ^4.3.2 |
| @types/node | ^20 | ^22 (matches Node 22 runtime) |

Deliberately **not** taken: `eslint` 10 (not yet supported by `eslint-config-next`) and `typescript` 6 (Next 16's plugin targets TS 5.x). Revisit both on the next Next.js major.

Known-open: `npm audit` reports a moderate advisory in `postcss` via `next` itself — every stable Next release ≤16.2.x pins it; it will clear when Next ships the bump. Do **not** run `npm audit fix --force` (it downgrades Next to a canary).

**Server** (`server/requirements.txt`):

| Package | Before | After |
|---|---|---|
| fastapi | 0.115.0 | 0.139.0 |
| uvicorn | 0.30.0 | 0.49.0 |
| pillow | 10.4.0 | 12.3.0 |
| numpy | 1.26.4 | 2.5.0 |
| pydantic-settings | 2.3.0 | 2.14.2 |
| onnxruntime | >=1.19.2 | 1.27.0 (exact pin) |
| python-multipart | 0.0.9 | **removed** — no multipart endpoint exists |

## 7. Server API changes

- **`config.py`:** pydantic-settings v2 idiom (`model_config = SettingsConfigDict(env_file=".env")` replaces the deprecated `class Config`). CORS default changed from `["*", …]` to localhost origins only — **set `ALLOWED_ORIGINS` in `server/.env` when you deploy** (comma/JSON list). The invalid `allow_credentials=True`-with-wildcard combo is gone (no cookies are used).
- **`main.py`:**
  - Classifier lives on `app.state` instead of a module global.
  - Bad client input (malformed data URI, corrupt base64, undecodable image) → **HTTP 400** with a safe message; only genuine inference faults → 500, and internal exception text is no longer leaked to the client.
  - Request body capped at ~14 M chars of base64 (~10 MB of image) via pydantic `Field(max_length=…)`.
  - Response is a typed `PredictResponse` (`class`, `confidence`).
- **`model.py`:** `predict()` returns `(label, confidence)`. `_to_probabilities` handles both softmax heads and raw logits. Removed the pointless `model.compile(...)` on the TF fallback path (compilation is for training, not inference).

## 8. How to run (unchanged, for reference)

```bash
# Terminal 1 - ML backend
cd server
python3 -m venv .venv && source .venv/bin/activate   # .venv/ is gitignored
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 - Web app
cd client
npm install
npm run dev
```

## 9. Maintenance checklist

- `npm run lint && npm run typecheck && npm run build` before every merge — all three are clean on this branch and should stay that way.
- New user-facing colors: add a token in `globals.css`, never an inline hex.
- New waste categories: extend `WasteCategory` in `types/index.ts`, `CATEGORY_CONFIG` in `lib/categories.ts`, `CLASSES` in `server/model.py`, and retrain/reconvert the model.
- New Firestore collections: add owner-scoped rules to `firestore.rules` and redeploy them.
- Dependency refresh cadence: `npm outdated` / `pip index versions <pkg>` quarterly; patch/minor bumps are safe to take blind, majors deserve a changelog read.
- One week after deploying, optionally delete the legacy date-key fallback (`toLegacyDateKey` in `dateHelpers.ts` and its use in `WasteLineChart.tsx`).
