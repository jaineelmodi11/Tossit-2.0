# TossIt 2.0 - Waste Analytics Software
TossIt 2.0 is a full rebuild of the original [TossIt](https://github.com/jaineelmodi11/Tossit) project as a modern web application. It lets you take a photo of any waste item and instantly know whether it's recyclable, organic, or landfill — with a personal dashboard that tracks your habits over time.

- **Smart Classification:** Browser camera or file upload → ML model → bin advice in seconds.
- **Personal Dashboard:** Recycling rate, category breakdown, and 7-day trend charts updated in real time.
- **Scan History:** Every item you've classified, grouped by day with exact timestamps.
- **Accounts & Sync:** Firebase Auth keeps your data across devices via Firestore.

## Why 2.0?

The original TossIt was built on React Native + Expo. It worked great conceptually but ran into toolchain issues — Expo's build system is complex and fragile across different machines and environments.

TossIt 2.0 is a complete rewrite as a web app that runs with a single `npm run dev`. Same Firebase project, same ML model, same idea — just actually works now.

## Why "TossIt"?

**Problem:** A lot of industrial and commercial kitchens have a waste management issue — especially small businesses. Personally, the cafe my parents own faces this constantly. Some weeks my dad makes several Costco trips; other weeks none. Better waste data would help optimize purchasing and reduce loss.

At the household level, waste analytics usually only happens at the industrial scale. If individuals had real data on their own waste, they could be incentivized (say, by municipalities) to reduce it. TossIt is the data-collection layer that makes that possible.

**Solution:** A cheap sensor (or your phone camera) captures an image of the item you're throwing away. The image is classified by an ML model, the result is recorded, and the data surfaces on your personal dashboard.

## ⭐ Key Features

**Waste Classification**
Take a photo or upload from your library — the ML model classifies the item as Recycling, Organic, or Garbage and tells you which bin it belongs in.

**Real-Time Dashboard**
Recycling rate hero card, per-category counts, all-time pie chart, and last 7 days line chart — all live-updating via Firestore `onSnapshot`.

**Scan History Feed**
Every individual scan stored with a server timestamp, displayed as a grouped feed (Today / Yesterday / date) with emoji, label, and exact time.

**Firebase Auth**
Email/password sign-up and sign-in. Your waste data is private to your account.

## 🧰 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)

**Web Client (`client/`)**

| Concern | Tech |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth & DB | Firebase Auth + Firestore |
| State | Zustand |
| Charts | Recharts |

**ML Backend (`server/`)**

| Concern | Tech |
|---|---|
| API server | Python FastAPI + Uvicorn |
| Inference | ONNX Runtime (converted from Keras .h5) |
| Image processing | Pillow + NumPy |

## 🏗 Architecture & Flow

```
┌─────────────────────────────────────┐
│           Browser (Next.js)         │
│  ┌─────────┐    ┌────────────────┐  │
│  │  Pages  │───▶│  Zustand Store │  │
│  └─────────┘    └────────────────┘  │
│       │                 ▲           │
│  fetch/FileReader        │           │
│       │          Firestore onSnapshot│
│       ▼                 │           │
│  ┌──────────────────────────────┐   │
│  │  lib/api/classify.ts         │   │
│  │  lib/firebase/firestore.ts   │   │
│  └──────────────┬───────────────┘   │
└─────────────────┼───────────────────┘
                  │ POST /predict (base64 image)
                  ▼
     ┌────────────────────────┐
     │  FastAPI Server (:8000)│
     │  ONNX Runtime          │
     │  model.onnx (224×224)  │
     └────────────────────────┘
                  │
           Firestore (Firebase)
    users/{uid}/totals + linegraph + history
```

**Scan flow:**
1. User selects image (camera or file picker)
2. `FileReader` converts to base64 → `POST /predict`
3. FastAPI runs ONNX inference → returns `{ class: "Recycling" | "Organic" | "Garbage" }`
4. `recordClassification` writes to Firestore totals, linegraph, and history subcollection
5. Firestore `onSnapshot` listeners update the dashboard in real time

## 🚀 Getting Started

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

Place your `model.onnx` in the `server/` directory. To convert an existing `model.h5`:

```bash
pip install tf2onnx onnxruntime
python -m tf2onnx.convert --keras server/model.h5 --output server/model.onnx --opset 13
```

Find the original model and training notebook at:
- Notebook: https://colab.research.google.com/drive/1lKhuDRrNifkCcQJYwR6jhOxjfU-8rV1z?usp=sharing
- Dataset: https://www.kaggle.com/datasets/vyomkapadia/tossit

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

## 🔮 Future

- Hardware sensor that captures images automatically — no phone needed
- Recognizing multiple items in one image (people like to throw things away simultaneously 😅)
- Carbon footprint calculator based on your personal waste history
- Dollar value of perishable food waste — how much money are you actually losing?
- Map of nearest recycling facilities, donation centers, and drop-off locations
- Municipality rewards system to incentivize households to reduce waste
- Streaks and badges to gamify good recycling habits
