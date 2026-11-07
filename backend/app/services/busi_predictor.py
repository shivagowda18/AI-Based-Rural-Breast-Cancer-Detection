
from pathlib import Path
from functools import lru_cache
import argparse

import torch
from torch import nn
from PIL import Image, ImageOps
from torchvision import transforms
from torchvision.models import mobilenet_v3_small


PROJECT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT / "artifacts" / "models"
    / "busi_mobilenetv3_best.pth"
)

MEDICAL_NOTICE = (
    "Research prototype only. This result is not "
    "a medical diagnosis or a reliable cancer risk "
    "estimate. Consult a qualified healthcare "
    "professional for medical assessment."
)


@lru_cache(maxsize=1)
def load_model():
    checkpoint = torch.load(
        MODEL_PATH,
        map_location="cpu",
        weights_only=True,
    )

    class_to_idx = checkpoint["class_to_idx"]

    assert class_to_idx == {
        "benign": 0,
        "malignant": 1,
        "normal": 2,
    }

    model = mobilenet_v3_small(weights=None)

    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, 3)

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.eval()

    return model, checkpoint


def predict_image(image_path):
    model, checkpoint = load_model()

    # Apply the same preprocessing used in training.
    size = checkpoint["image_size"]

    with Image.open(image_path) as image:
        rgb = image.convert("RGB")

        resized = ImageOps.contain(
            rgb,
            (size, size),
            method=Image.Resampling.LANCZOS,
        )

        padded = Image.new(
            "RGB", (size, size), (0, 0, 0)
        )

        x = (size - resized.width) // 2
        y = (size - resized.height) // 2

        padded.paste(resized, (x, y))

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(
            checkpoint["mean"],
            checkpoint["std"],
        ),
    ])

    tensor = transform(padded).unsqueeze(0)

    with torch.inference_mode():
        logits = model(tensor)
        scores = torch.softmax(logits, dim=1)[0]

    class_to_idx = checkpoint["class_to_idx"]

    classes = sorted(
        class_to_idx,
        key=class_to_idx.get,
    )

    predicted_index = int(scores.argmax().item())

    return {
        "predicted_class": classes[predicted_index],
        "model_scores": {
            name: round(float(scores[i]), 4)
            for i, name in enumerate(classes)
        },
        "medical_notice": MEDICAL_NOTICE,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path")
    args = parser.parse_args()

    result = predict_image(args.image_path)

    print("BREAST ULTRASOUND MODEL INFERENCE")
    print("-" * 45)
    print("Prediction:", result["predicted_class"])
    print("Model scores:")

    for label, score in result["model_scores"].items():
        print(f"  {label}: {score:.4f}")

    print("-" * 45)
    print(result["medical_notice"])
    print("INFERENCE COMPLETED")
