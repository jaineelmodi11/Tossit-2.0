# TossIt 2.0 - Waste Analytics Software
Source code for Toss It 2.0 — a complete rebuild of the original [TossIt](https://github.com/jaineelmodi11/Tossit) project as a modern web application.

## Problem:

A lot of industrial/commercial kitchens have an inventory management issue (especially if they are a local and small business). A lot of food gets wasted sometimes, whereas there is a shortage of food/inventory during other times. It is hard to keep track of which items need to be purchased or should be purchased less of because there are a lot of higher priority items.

Personally, the cafe that my parents own faces these issues. In certain weeks, my dad makes several Costco trips whereas in other weeks, he makes none! This problem could be helped if there was data that could give you insights into how to optimize your business.

Sure you can hire someone for that, but why not use technology?

Another problem is that waste analytics usually occurs at the industrial waste management level. If households were given data and analytics into their individual waste, households could be incentivized to reduce their waste through a rewards system sponsored by the municipality. However, this requires waste data at the household level. In order to track the waste, our solution could be implemented.

- You might be wondering what is stopping households from not using the system and making it seem like they are getting rid of less waste?
- To that point I would say, good question lol...still gotta figure out the logistics

## Why 2.0?

The original TossIt was built on React Native + Expo. It worked great conceptually but ran into toolchain issues — Expo's build system is complex and fragile across different machines. 

TossIt 2.0 is a full rewrite as a web app. It runs with a single `npm run dev`, works on any device with a browser, and keeps every feature from the original plus a few new ones. Same Firebase project, same ML model, same idea — just actually works now.

## Proposed Solution:

Creating a waste management system that collects data and provides real-time data/insights into your waste disposal.

### How will it work?

You take a photo of the item you are throwing away — either using your device's camera directly in the browser or by uploading a photo from your library.

This image is then fed into an ML model to identify:

- Whether the item is **Recycling**, **Organic**, or **Garbage**

The system then tells you which bin the item should go into.

This data is processed and showcased on a dashboard accessible through any web browser. Every scan is saved to your personal account so you can track your habits over time.

### Features of the dashboard:

1) A **pie chart** showcasing your all-time waste breakdown by category

2) A **line graph** indicating waste per day over the last 7 days (recycling, organic, and garbage)

3) A **recycling rate** — your overall percentage of recyclable waste front and center

4) A **scan history feed** showing every item you've classified, grouped by day with exact timestamps

5) A **profile page** with your full stats — total items scanned, count per category, recycling rate

## Project Plan:

1) ✅ Training a machine learning model to classify waste into Recycling, Organic, or Garbage
   - Find the model at https://colab.research.google.com/drive/1lKhuDRrNifkCcQJYwR6jhOxjfU-8rV1z?usp=sharing
   - Find the data at https://www.kaggle.com/datasets/vyomkapadia/tossit

2) ✅ Serving the model via a FastAPI backend (converted to ONNX Runtime for lightweight, dependency-free inference)

3) ✅ Web app where you take or upload a photo and it tells you which bin the item should go into

4) ✅ Every scan updates your personal dashboard in real time via Firestore

## Getting Started:

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

## Tech Stack:

| Layer | Tech |
|---|---|
| Web app | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Auth & database | Firebase Auth + Firestore |
| State management | Zustand |
| Charts | Recharts |
| ML backend | FastAPI + ONNX Runtime |

## Future:

- Creating the hardware component (sensor) that captures images automatically — no phone needed
- Recognizing multiple items in one image (people like to throw away things simultaneously 😅)
- Carbon footprint calculator based on your personal waste data
- A dollar value of perishable food being thrown away — how much money are you actually wasting?
- Nearest recycling/dumping facilities and donation centers shown on a map
- A rewards system where municipalities incentivize households to reduce waste
- Streaks and badges to gamify good recycling habits
