
from pathlib import Path
from time import perf_counter
from statistics import median

import torch
from torch import nn
from PIL import Image
from torchvision import transforms
from torchvision.models import (
    mobilenet_v3_small,
    efficientnet_b0,
)

PROJECT = Path(__file__).resolve().parents[1]
MODEL_DIR = PROJECT / "artifacts" / "models"
VAL_DIR = PROJECT / "data" / "processed" / "images" / "val"

sample_path = next(VAL_DIR.rglob("*.png"))

models = [
    (
        "MobileNetV3-Small",
        MODEL_DIR / "busi_mobilenetv3_best.pth",
        mobilenet_v3_small,
    ),
    (
        "EfficientNet-B0",
        MODEL_DIR / "busi_efficientnetb0_best.pth",
        efficientnet_b0,
    ),
]

print("CPU MODEL SPEED BENCHMARK")
print("-" * 45)
print("Sample:", sample_path.name)
print("Device: CPU")
print("Test dataset used: No")
print("-" * 45)

for name, path, build_model in models:
    checkpoint = torch.load(
        path, map_location="cpu", weights_only=True
    )

    model = build_model(weights=None)

    input_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(input_features, 3)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(
            checkpoint["mean"], checkpoint["std"]
        ),
    ])

    with Image.open(sample_path) as image:
        tensor = transform(image.convert("RGB")).unsqueeze(0)

    # Warm up before measuring.
    with torch.inference_mode():
        for _ in range(5):
            model(tensor)

        timings = []

        for _ in range(30):
            start = perf_counter()
            model(tensor)
            elapsed = (perf_counter() - start) * 1000
            timings.append(elapsed)

    size_mib = path.stat().st_size / (1024 * 1024)

    print(name)
    print(f"Checkpoint size: {size_mib:.2f} MiB")
    print(f"Median inference time: {median(timings):.2f} ms")
    print(f"Average inference time: {sum(timings)/len(timings):.2f} ms")
    print("-" * 45)

print("BENCHMARK COMPLETED")
