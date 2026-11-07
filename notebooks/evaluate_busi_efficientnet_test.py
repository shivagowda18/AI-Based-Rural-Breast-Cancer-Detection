
from pathlib import Path
import csv

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import efficientnet_b0
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)

# Project paths
ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "artifacts/models/busi_efficientnetb0_best.pth"
TEST_DIR = ROOT / "data/processed/images/test"
OUTPUT_DIR = ROOT / "artifacts/evaluation"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Load saved checkpoint safely
checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)

assert checkpoint["model_name"] == "efficientnet_b0"

class_to_idx = checkpoint["class_to_idx"]
classes = [
    name for name, idx in sorted(
        class_to_idx.items(), key=lambda item: item[1]
    )
]

image_size = checkpoint["image_size"]

# Match preprocessing used for model validation
eval_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(
        mean=checkpoint["mean"],
        std=checkpoint["std"],
    ),
])

test_data = datasets.ImageFolder(
    TEST_DIR,
    transform=eval_transform,
)

if test_data.class_to_idx != class_to_idx:
    raise ValueError("Test class mapping does not match checkpoint.")

if len(test_data) != 115:
    raise ValueError(
        f"Expected 115 test images, found {len(test_data)}."
    )

# Confirm images have the expected dimensions
from PIL import Image

for path, _ in test_data.samples:
    with Image.open(path) as img:
        if img.size != (image_size, image_size):
            raise ValueError(
                f"Unexpected image size: {path} = {img.size}"
            )

test_loader = DataLoader(
    test_data,
    batch_size=16,
    shuffle=False,
    num_workers=0,
)

# Reconstruct EfficientNet-B0
model = efficientnet_b0(weights=None)

in_features = model.classifier[1].in_features
model.classifier[1] = nn.Linear(
    in_features,
    len(classes),
)

model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

# Run predictions on held-out test images
y_true = []
y_pred = []

with torch.inference_mode():
    for images, labels in test_loader:
        outputs = model(images)
        predictions = outputs.argmax(dim=1)

        y_true.extend(labels.tolist())
        y_pred.extend(predictions.tolist())

# Calculate evaluation metrics
accuracy = accuracy_score(y_true, y_pred)

report = classification_report(
    y_true,
    y_pred,
    labels=list(range(len(classes))),
    target_names=classes,
    zero_division=0,
    digits=4,
    output_dict=True,
)

matrix = confusion_matrix(
    y_true,
    y_pred,
    labels=list(range(len(classes))),
)

print("\nEFFICIENTNET-B0 TEST EVALUATION")
print("=" * 45)
print("Checkpoint epoch:", checkpoint["epoch"])
print("Test images:", len(test_data))
print("Classes:", classes)
print(f"Test accuracy: {accuracy * 100:.2f}%")

print("\nCLASSIFICATION REPORT")
print(
    classification_report(
        y_true,
        y_pred,
        labels=list(range(len(classes))),
        target_names=classes,
        zero_division=0,
        digits=4,
    )
)

print("CONFUSION MATRIX")
print(matrix)

# Save classification metrics
metrics_path = OUTPUT_DIR / "efficientnetb0_test_metrics.csv"

with open(metrics_path, "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(
        ["class", "precision", "recall", "f1_score", "support"]
    )

    for name in classes + ["macro avg", "weighted avg"]:
        values = report[name]
        writer.writerow([
            name,
            values["precision"],
            values["recall"],
            values["f1-score"],
            values["support"],
        ])

    writer.writerow(["accuracy", accuracy, "", "", len(test_data)])

# Save confusion matrix
matrix_path = OUTPUT_DIR / "efficientnetb0_test_matrix.csv"

with open(matrix_path, "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["actual/predicted"] + classes)

    for name, row in zip(classes, matrix):
        writer.writerow([name] + row.tolist())

print("\nEvaluation completed.")
print("Metrics saved:", metrics_path)
print("Matrix saved:", matrix_path)
