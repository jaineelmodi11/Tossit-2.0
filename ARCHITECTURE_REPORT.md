# TossIt 2.0 — System Architecture Report

**Audit date:** July 2026 · **Auditor:** Principal-architect review (Claude)
**Scope:** full repo — `client/` (Next.js web app) and `server/` (FastAPI ML backend)

---

## 1. Architectural Flaws

### 1.1 Correctness bugs (highest priority)

| # | Flaw | Where | Impact |
|---|------|-------|--------|
| F1 | **Locale-dependent Firestore date keys.** `new Date().toLocaleString().split(" ")[0].slice(0, -1)` produces `"7/2/2026"` only on US-English devices. On `en-GB` it yields `"02/07/2026"`, on `de-DE` `"02.07.2026,"`-style strings, and on some locales the comma assumption breaks the `slice(-1)` entirely. | `lib/firebase/firestore.ts`, `lib/utils/dateHelpers.ts` | Daily chart data written on one device silently never renders on another; two devices in different locales fragment the same user's data under different keys. |
| F2 | **Read-modify-write race in `recordClassification`.** The function does `getDoc` → compute → `setDoc` → `updateDoc` → `addDoc` (3 sequential round-trips, no transaction). Two rapid scans can read the same snapshot and lose an increment. It also silently no-ops (`if (!snap.exists()) return`) for users whose doc was never initialized. | `lib/firebase/firestore.ts` | Lost counts, 3× write latency, silent data loss for pre-existing auth users. |
| F3 | **Camera capture grabs a frame before one exists.** `takePhoto()` opens the stream and immediately draws `video` to a canvas. On most browsers `videoWidth` is still `0` (or the first frame is black) → a 0×0 canvas → `toBlob` returns `null` → the tap silently does nothing. There is no viewfinder at all: the user cannot see what they are photographing. | `hooks/useClassify.ts` | The app's core interaction is unreliable and confusing. |
| F4 | **`next/image` with `blob:` URLs.** The scan preview feeds an object URL into `<Image fill>`, which routes through the Next image optimizer that cannot fetch `blob:` schemes. | `app/(dashboard)/scan/page.tsx` | Broken/erroring preview depending on Next version; a plain `<img>` is the correct tool for a local object URL. |
| F5 | **"Saved to your dashboard" is shown unconditionally.** If the Firestore write fails (rules, offline), the result card still claims the scan was saved. | `app/(dashboard)/scan/page.tsx` + `hooks/useClassify.ts` | Users trust a dashboard that never received the data. |
| F6 | **No `onSnapshot` error callbacks.** If security rules deny a read, the dashboard and history pages show skeletons/zeros forever with no error surfaced. | `hooks/useWasteData.ts`, `hooks/useHistory.ts`, `lib/firebase/firestore.ts` | Silent failure mode; impossible to debug from the UI. |
| F7 | **Object-URL leak.** `processFile` creates a new `URL.createObjectURL` per image but only `reset()` revokes; picking image B after image A leaks A. | `hooks/useClassify.ts` | Slow memory growth during a scanning session. |

### 1.2 Backend flaws

| # | Flaw | Where | Impact |
|---|------|-------|--------|
| B1 | **Invalid CORS configuration.** `allow_origins=["*", …]` combined with `allow_credentials=True` is contradictory (the spec forbids wildcard + credentials; Starlette quietly degrades) and `"*"` as a *default* is wide open. | `server/config.py` / `main.py` | Any website can call the API in the default config. |
| B2 | **Every error is HTTP 500.** `except (ValueError, Exception)` (a redundant tuple) turns bad client input — malformed data URI, corrupt image — into a server error, and leaks internal exception text to the client. | `server/main.py` | Wrong semantics; no way for the client to distinguish "your image is bad" from "server broke". |
| B3 | **No payload bound.** The predict endpoint accepts arbitrarily large base64 bodies. | `server/main.py` | Trivial memory-exhaustion vector. |
| B4 | **Model output treated as argmax-only.** The softmax confidence is computed and discarded; the UI can never say "87% sure". | `server/model.py` | Lost product value for free. |
| B5 | **Deprecated pydantic-settings v1 style.** `class Config:` inner class instead of `model_config = SettingsConfigDict(...)`. | `server/config.py` | Deprecation warnings; will break on pydantic v3. |
| B6 | **Stale pins.** FastAPI 0.115 (mid-2024) vs 0.139 current, uvicorn 0.30 vs 0.49, Pillow 10.4 vs 12.3, numpy 1.26 vs 2.5. `python-multipart` is required but no endpoint uses multipart. | `server/requirements.txt` | Missing 2 years of security/perf fixes; dead dependency. |

### 1.3 Technical debt & repo hygiene

- **Dead UI kit.** `components/ui/` (avatar, badge, button, card, dialog, input, label), `components.json`, and `lib/utils.ts` are imported by **zero** application files. They drag in five unused dependencies: `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `shadcn` (a CLI, wrongly a runtime dep), `tailwind-merge`, `tw-animate-css`. ~90 % of `globals.css` is shadcn token plumbing no page reads. Meanwhile the profile page *hand-rolls* a modal instead of using the dialog component that ships in the repo — the worst of both worlds.
- **React-Native fossils tracked in git:** `server/.expo/`, `server/image.png`.
- **Triplicated `CATEGORY_CONFIG`.** Home, Scan, and History each define their own copy with drifting labels (`"Organic"` vs `"Organic / Compost"`) and colors.
- **Brand color scattered as magic hex.** `#68ac53` appears as inline `style=` and arbitrary `text-[#68ac53]` classes across 8 files; `globals.css` even defines `.bg-brand-green` utilities that nothing uses. No single source of truth for the design system.
- **No Firestore security rules in the repo.** The data model is per-user, but nothing versions the rules that enforce it.
- **No `typecheck` script, no tests, no CI.**

### 1.4 UX / UI friction

- **Raw Firebase errors shown to users:** `"Firebase: Error (auth/invalid-credential)."` on a failed login.
- **No password-reset path.** A forgotten password is a dead end; the sign-in page even renders an "— or —" divider with nothing under it (a dangling affordance).
- **No camera viewfinder** (see F3) — users shoot blind.
- **Multi-megapixel uploads.** A 12 MP phone photo (~4 MB → ~5.3 MB as base64) is shipped to a model that consumes 224×224 px. Classification latency is dominated by upload time.
- **No confidence shown** — the result card asserts certainty the model doesn't have.

## 2. Modernization Strategy

The stack itself (Next.js 16 App Router, React 19, Tailwind 4, Zustand, FastAPI, ONNX Runtime) is current and well-chosen — **no framework migration is warranted**. The modernization is surgical:

1. **Data layer:** canonical `YYYY-MM-DD` (local) date keys with a read-time fallback for legacy US-locale keys; single atomic `writeBatch` + `increment()` for scan recording (1 round-trip, race-free, no pre-read).
2. **Perf:** client-side image downscale (max 512 px JPEG) before upload — typically a 10–30× payload reduction; request timeout via `AbortSignal.timeout`.
3. **Camera:** a real `CameraCapture` viewfinder component (live `<video>` preview, capture button, proper frame-readiness wait, track cleanup).
4. **API:** `/predict` returns `{class, confidence}`; 400 vs 500 error semantics; payload size cap; locked-down CORS defaults; pydantic-settings v2 idiom; latest stable pins.
5. **Design system:** brand tokens (`--color-brand`, `--color-ink`, …) in the Tailwind 4 `@theme`, replacing every magic hex; one shared `CATEGORY_CONFIG`.
6. **Trust & safety:** friendly auth-error mapping, password reset flow, honest "saved" indicator, `onSnapshot` error surfacing, versioned `firestore.rules`.
7. **Hygiene:** delete dead UI kit + 7 unused deps + RN fossils + boilerplate SVGs; add `typecheck` script; bump all deps to latest stable.

## 3. User Flow Audit

```
Welcome ──► Sign In ──► Dashboard (/home) ◄──── live onSnapshot
   │            │            │
   └► Sign Up ──┘        Scan ──► result ──► (auto-saved) ──► History
```

| Flow | Friction found | Fix |
|------|----------------|-----|
| **First launch → Welcome** | OK — clear CTA pair. | — |
| **Sign in** | Raw Firebase error strings; no way to recover a forgotten password; dead "or" divider implies a social login that doesn't exist. | Error mapping, "Forgot password?" reset flow, divider removed. |
| **Sign up** | Client validates 6-char minimum but server-side errors again surface raw. | Same error mapping. |
| **Scan (camera)** | Tap "Take Photo" → nothing visible happens → maybe a black photo appears. User cannot aim. | Live viewfinder modal with an explicit shutter button. |
| **Scan (upload)** | Multi-MB upload with a spinner that can hang forever if the API is down; error says `Server error: 500` even when the *image* was the problem. | Downscale + 20 s timeout + human-readable, cause-specific errors. |
| **Scan result** | "Saved to your dashboard" even when the save failed. No confidence signal. | Honest save state (`Saved` / `Couldn't save`), confidence percentage. |
| **Dashboard** | Charts silently empty for non-US users (F1) or on rule denials (F6). | ISO keys + legacy fallback; error banners. |
| **History** | Infinite skeleton on error; otherwise solid. | Error state added. |
| **Profile → Sign out** | Hand-rolled modal is fine; kept, simplified with brand tokens. | — |

## 4. Verification

The modernized code was verified by: `npm run build` (production build), `npm run lint`, `npx tsc --noEmit`, and an end-to-end server smoke test (fresh venv with the new pins, `/health`, and a real `/predict` against `model.onnx`).

See `MIGRATION_GUIDE.md` for the complete change-by-change breakdown.
