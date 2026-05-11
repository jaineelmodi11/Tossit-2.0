"""
Waste classification model wrapper.

Supports two backends:
  1. ONNX Runtime (preferred): fast, lightweight, requires model.onnx
     Convert once with: python convert_model.py
  2. TensorFlow (fallback): works directly with model.h5

The classifier auto-detects which backend to use based on which model file exists.
"""

from __future__ import annotations

import io
import os
import logging
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

CLASSES = ["Recycling", "Organic", "Garbage"]
INPUT_SIZE = (224, 224)


def _preprocess(img: Image.Image) -> np.ndarray:
    """Resize, normalize and add batch dimension."""
    img = img.resize(INPUT_SIZE).convert("RGB")
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)


class WasteClassifier:
    def __init__(self, onnx_path: str = "./model.onnx", tf_path: str = "./model.h5"):
        self._session = None
        self._tf_model = None

        if os.path.exists(onnx_path):
            logger.info(f"Loading ONNX model from {onnx_path}")
            try:
                import onnxruntime as ort
                self._session = ort.InferenceSession(
                    onnx_path,
                    providers=["CPUExecutionProvider"],
                )
                self._input_name = self._session.get_inputs()[0].name
                logger.info("ONNX model loaded successfully.")
                return
            except ImportError:
                logger.warning("onnxruntime not installed, falling back to TensorFlow.")

        if os.path.exists(tf_path):
            logger.info(f"Loading TensorFlow model from {tf_path}")
            try:
                import tensorflow as tf  # type: ignore
                os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
                self._tf_model = tf.keras.models.load_model(tf_path)
                self._tf_model.compile(
                    optimizer="adam",
                    loss="categorical_crossentropy",
                    metrics=["accuracy"],
                )
                logger.info("TensorFlow model loaded successfully.")
                return
            except ImportError:
                logger.error("tensorflow not installed.")

        raise RuntimeError(
            f"No model found. Expected one of:\n  {onnx_path}\n  {tf_path}\n"
            "Run 'python convert_model.py' to convert model.h5 to model.onnx."
        )

    def predict(self, img: Image.Image) -> str:
        tensor = _preprocess(img)

        if self._session is not None:
            outputs = self._session.run(None, {self._input_name: tensor})
            idx = int(np.argmax(outputs[0]))
        elif self._tf_model is not None:
            preds = self._tf_model.predict(tensor, verbose=0)
            idx = int(np.argmax(preds))
        else:
            raise RuntimeError("Classifier is not initialized.")

        return CLASSES[idx]
