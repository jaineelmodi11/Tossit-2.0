"""
Tossit - Waste Classification API

- Model loads once at startup via lifespan and lives on app.state
- Images processed in-memory (io.BytesIO) - no disk writes
- 400 for bad client input, 500 only for genuine server faults
- Payload size cap on the base64 body
- Returns the softmax confidence alongside the predicted class
"""

from __future__ import annotations

import io
import logging
from base64 import b64decode
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

from config import settings
from model import WasteClassifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ~10 MB of image data once base64-decoded (base64 inflates by 4/3).
MAX_DATA_URI_CHARS = 14_000_000


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading waste classification model...")
    app.state.classifier = WasteClassifier(
        onnx_path=settings.onnx_model_path,
        tf_path=settings.tf_model_path,
    )
    logger.info("Model ready.")
    yield
    app.state.classifier = None
    logger.info("Model unloaded.")


app = FastAPI(
    title="Tossit Classification API",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


class PredictRequest(BaseModel):
    # Expects: "data:image/jpeg;base64,<payload>"
    data: str = Field(max_length=MAX_DATA_URI_CHARS)


class PredictResponse(BaseModel):
    class_: str = Field(serialization_alias="class")
    confidence: float


@app.get("/health")
async def health(request: Request):
    classifier = getattr(request.app.state, "classifier", None)
    return {"status": "ok", "model_loaded": classifier is not None}


@app.post("/predict", response_model=PredictResponse)
async def predict(body: PredictRequest, request: Request):
    classifier: WasteClassifier | None = getattr(request.app.state, "classifier", None)
    if classifier is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")

    # Strip "data:image/...;base64," prefix
    if "," not in body.data:
        raise HTTPException(
            status_code=400,
            detail="Invalid data URI format - expected 'data:<mime>;base64,<payload>'.",
        )

    _, b64_payload = body.data.split(",", 1)
    try:
        image_bytes = b64decode(b64_payload, validate=True)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except (ValueError, UnidentifiedImageError):
        raise HTTPException(
            status_code=400, detail="Could not decode the image. Try another photo."
        )

    try:
        label, confidence = classifier.predict(img)
    except Exception:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Model inference failed.")

    return PredictResponse(class_=label, confidence=round(confidence, 4))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False,
    )
