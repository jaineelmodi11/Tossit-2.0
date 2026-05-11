"""
One-time script to convert model.h5 (TensorFlow) → model.onnx (ONNX Runtime).

Run once after setting up the environment:
    pip install tensorflow tf2onnx
    python convert_model.py

After conversion, update requirements.txt to use onnxruntime instead of tensorflow.
"""

import os
import sys


def convert():
    h5_path = "./model.h5"
    saved_model_dir = "./model_saved"
    onnx_path = "./model.onnx"

    if not os.path.exists(h5_path):
        print(f"Error: {h5_path} not found.")
        sys.exit(1)

    print("Step 1: Loading model.h5 with TensorFlow…")
    try:
        import tensorflow as tf
        os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
    except ImportError:
        print("Error: tensorflow is not installed. Run: pip install tensorflow")
        sys.exit(1)

    model = tf.keras.models.load_model(h5_path)
    print(f"  Input shape:  {model.input_shape}")
    print(f"  Output shape: {model.output_shape}")

    print(f"Step 2: Saving as SavedModel to {saved_model_dir}…")
    model.save(saved_model_dir)

    print(f"Step 3: Converting SavedModel → {onnx_path} with tf2onnx…")
    try:
        import subprocess
        result = subprocess.run(
            [
                sys.executable, "-m", "tf2onnx.convert",
                "--saved-model", saved_model_dir,
                "--output", onnx_path,
                "--opset", "13",
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print("tf2onnx output:")
            print(result.stderr)
            sys.exit(1)
    except FileNotFoundError:
        print("Error: tf2onnx is not installed. Run: pip install tf2onnx")
        sys.exit(1)

    size_mb = os.path.getsize(onnx_path) / 1_000_000
    print(f"\nDone! Saved to {onnx_path} ({size_mb:.1f} MB)")
    print("You can now start the server with: python main.py")


if __name__ == "__main__":
    convert()
