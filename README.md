# TossIt 2.0 - Waste Analytics Software
TossIt 2.0 is a full rebuild of the original [TossIt](https://github.com/jaineelmodi11/Tossit) project. Point your camera at whatever you're about to throw away, and it tells you: recycling bin, green bin, or garbage. Every scan gets saved to your personal dashboard so you can actually see your habits over time.

- **Classification:** Browser camera or file upload feeds into the ML model and you get a bin recommendation in seconds.
- **Dashboard:** Recycling rate, category breakdown, 7-day trend charts, all live-updating.
- **Scan History:** A log of every item you've classified, grouped by day with the exact time of each scan.
- **Accounts:** Firebase Auth ties your data to your account so it follows you across devices.

## Why 2.0?

The original TossIt was React Native + Expo. The idea was solid but Expo's build system kept breaking on different machines. Native toolchains are a nightmare to maintain, and spending hours debugging a Metro bundler error instead of building features gets old fast.

2.0 is a web app. It runs with `npm run dev`. No Xcode, no Android Studio, no simulator setup. Same Firebase project, same ML model, all the original features plus a scan history feed.

## The Problem

My parents own a small cafe. Some weeks my dad drives to Costco three times; other weeks, not at all. A lot of that comes down to not knowing what got wasted the week before. Without data you're just guessing, and guessing at scale is expensive.

Waste analytics as a concept exists, but it lives at the industrial level. City trucks get weighed, municipal stats get published, and the individual household sees none of it. The gap is at the source: nobody's tracking what actually goes in the bin. TossIt is meant to fill that gap. Give people their own waste data and you've got something to work with, whether that's a small business trying to cut food costs or a city trying to build a recycling incentive program.

There are obvious problems with this approach too. What stops someone from not scanning things? Honestly, no clue yet. That's a logistics problem for later.

## ⭐ Key Features

**Waste Classification**
Take a photo or upload one. The model classifies it as Recycling, Organic, or Garbage. You get the bin color, an emoji, and a one-line disposal tip.

**Real-Time Dashboard**
The recycling rate card sits front and center. Below it: per-category counts, an all-time pie chart, and a line graph of the past 7 days. Firestore's `onSnapshot` keeps everything current without a page refresh.

**Scan History Feed**
Each scan writes an individual timestamped record to Firestore. The history page groups them by Today, Yesterday, and earlier dates. If you scanned something at 11:47pm last Tuesday, it's there.

**Firebase Auth**
Email and password. Nothing fancy, but your data is yours and stays private.

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
| Inference | ONNX Runtime (converted from Keras .h5 via tf2onnx) |
| Image processing | Pillow + NumPy |

## 🏗 Architecture & Flow

```
┌─────────────────────────────────────┐
│           Browser (Next.js)         │
│  ┌─────────┐    ┌────────────────┐  │
│  │  Pages  │───>│  Zustand Store │  │
│  └─────────┘    └────────────────┘  │
│       │                 ^           │
│  fetch/FileReader        │           │
│       │          Firestore onSnapshot│
│       v                 │           │
│  ┌──────────────────────────────┐   │
│  │  lib/api/classify.ts         │   │
│  │  lib/firebase/firestore.ts   │   │
│  └──────────────┬───────────────┘   │
└─────────────────┼───────────────────┘
                  │ POST /predict (base64 image)
                  v
     ┌────────────────────────┐
     │  FastAPI Server (:8000)│
     │  ONNX Runtime          │
     │  model.onnx (224x224)  │
     └────────────────────────┘
                  │
           Firestore (Firebase)
    users/{uid}: totals + linegraph + history
```

What actually happens when you scan something:

1. You pick an image from your library or capture one with the camera
2. `FileReader` converts it to base64 and it gets sent to `POST /predict`
3. FastAPI runs the image through the ONNX model at 224x224 and returns `{ class: "Recycling" | "Organic" | "Garbage" }`
4. `recordClassification` writes to three places in Firestore: the running totals, the daily linegraph, and the history subcollection
5. The `onSnapshot` listeners on the dashboard pick up the changes and re-render without any manual refresh

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

Drop `model.onnx` into the `server/` directory. If you only have the original `model.h5`, convert it:

```bash
pip install tf2onnx onnxruntime
python -m tf2onnx.convert --keras server/model.h5 --output server/model.onnx --opset 13
```

The original training notebook and dataset:
- Notebook: https://colab.research.google.com/drive/1lKhuDRrNifkCcQJYwR6jhOxjfU-8rV1z?usp=sharing
- Dataset: https://www.kaggle.com/datasets/vyomkapadia/tossit

### 3. Run

```bash
# Terminal 1 - ML backend
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 - Web app
cd client
npm install
npm run dev
# open http://localhost:3000
```

## 🔮 Future

- A physical sensor that sits above the bin and captures the image without you doing anything
- Classifying multiple items in one photo (people throw several things away at once 😅)
- Carbon footprint numbers based on your actual scan history
- Dollar estimates on food waste, specifically perishables that expired or got left over
- A map of nearby recycling drop-offs, donation centers, and special waste facilities
- Some kind of municipal rewards system where good recycling habits earn points or discounts
- Streaks, badges, anything that makes it feel less like a chore
