# Tossit 2.0

Smart waste classification — take a photo of any waste item and instantly know whether it's recyclable, organic, or landfill.

## Stack

| Layer | Tech |
|---|---|
| Web app | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Auth & DB | Firebase Auth + Firestore |
| State | Zustand |
| Charts | Recharts |
| ML backend | FastAPI + ONNX Runtime |

## Getting started

### 1. Environment variables

Create `client/.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 2. ML model

Place your `model.onnx` (or `model.h5`) in the `server/` directory.  
To convert an existing `.h5` to ONNX:

```bash
pip install tf2onnx onnxruntime
python -m tf2onnx.convert --keras server/model.h5 --output server/model.onnx --opset 13
```

### 3. Run

```bash
# Terminal 1 — ML backend
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Web app
cd client
npm install
npm run dev
# → http://localhost:3000
```

## Features

- **Dashboard** — recycling rate, category breakdown, pie + line charts
- **Scan** — browser camera or file upload → ML classification saved to Firestore
- **History** — per-scan log grouped by day with exact timestamps
- **Profile** — stats, recycling rate, sign out
