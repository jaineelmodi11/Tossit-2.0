"""
Tossit — Waste Classification API
FastAPI 0.115 | Modernized from original FastAPI 0.68 version

Key improvements over the original:
- Model loads once at startup via lifespan, not at import time
- Images processed in-memory (io.BytesIO) — no disk writes
- Proper HTTP 500 with error details instead of swallowing exceptions
- Typed Pydantic request body
- CORS origins configurable via environment variables
"""

from __future__ import annotations

import io
import logging
import os
from base64 import b64decode
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

from config import settings
from model import WasteClassifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

classifier: WasteClassifier | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global classifier
    logger.info("Loading waste classification model…")
    classifier = WasteClassifier(
        onnx_path=settings.onnx_model_path,
        tf_path=settings.tf_model_path,
    )
    logger.info("Model ready.")
    yield
    classifier = None
    logger.info("Model unloaded.")


app = FastAPI(
    title="Tossit Classification API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


class PredictRequest(BaseModel):
    # Expects: "data:image/jpeg;base64,<payload>"
    data: str


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": classifier is not None}


@app.post("/predict")
async def predict(body: PredictRequest):
    if classifier is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")

    try:
        # Strip "data:image/...;base64," prefix
        if "," not in body.data:
            raise ValueError("Invalid data URI format — expected 'data:<mime>;base64,<payload>'")

        _, b64_payload = body.data.split(",", 1)
        image_bytes = b64decode(b64_payload)

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        label = classifier.predict(img)

        return {"class": label}

    except (ValueError, Exception) as exc:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False,
    )
