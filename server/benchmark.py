"""Measure the waste classifier against real photographs.

The training accuracy quoted for this model was measured on a held-out split of
its own dataset. This script asks a different question: how does it do on
photographs it has never seen, from TrashNet.

TrashNet labels six materials. Five of them belong in recycling and one is
general waste, so they map onto two of this model's three classes. TrashNet has
no organic category, so Organic is not measured here.

Run:
    pip install datasets onnxruntime pillow numpy
    python benchmark.py
"""
import collections
import random

import numpy as np
import onnxruntime as ort
from datasets import load_dataset

MODEL = "./model.onnx"
CLASSES = ["Recycling", "Organic", "Garbage"]
TRASHNET = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]
MAPPING = {
    "cardboard": "Recycling", "glass": "Recycling", "metal": "Recycling",
    "paper": "Recycling", "plastic": "Recycling", "trash": "Garbage",
}
PER_CLASS = 30
SEED = 11


def probabilities(session, input_name, image):
    array = np.array(image.resize((224, 224)).convert("RGB"), dtype=np.float32) / 255.0
    raw = np.array(session.run(None, {input_name: np.expand_dims(array, 0)})[0]).reshape(-1)
    if np.all(raw >= 0) and abs(raw.sum() - 1.0) < 1e-3:
        return raw
    exp = np.exp(raw - raw.max())
    return exp / exp.sum()


def main():
    session = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    data = load_dataset("kuchidareo/small_trashnet", split="train")
    by_class = collections.defaultdict(list)
    for index, label in enumerate(data["label"]):
        by_class[TRASHNET[label]].append(index)

    random.seed(SEED)
    predicted = collections.Counter()
    results = {}
    for name in TRASHNET:
        sample = random.sample(by_class[name], min(PER_CLASS, len(by_class[name])))
        expected = MAPPING[name]
        correct = 0
        for index in sample:
            probs = probabilities(session, input_name, data[index]["image"])
            guess = CLASSES[int(np.argmax(probs))]
            predicted[guess] += 1
            correct += guess == expected
        results[name] = (correct, len(sample))

    print(f"{'trashnet class':14} {'should be':11} {'correct':>10}")
    total = hits = 0
    for name in TRASHNET:
        correct, count = results[name]
        total += count
        hits += correct
        print(f"{name:14} {MAPPING[name]:11} {correct:>5}/{count}")

    recycling_total = sum(c for n, (_, c) in results.items() if MAPPING[n] == "Recycling")
    print(f"\noverall {hits}/{total} = {100 * hits / total:.1f}%")
    print(f"always answering Recycling would score "
          f"{recycling_total}/{total} = {100 * recycling_total / total:.1f}%")
    print(f"predictions made: {dict(predicted)}")


if __name__ == "__main__":
    main()
