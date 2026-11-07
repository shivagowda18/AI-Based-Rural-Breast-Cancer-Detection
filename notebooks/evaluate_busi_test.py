
from pathlib import Path
import csv

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_small

PROJECT = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    PROJECT / "artifacts" / "models"
    / "busi_mobilenetv3_best.pth"
)

TEST_DIR = (
    PROJECT / "data" / "processed"
    / "images" / "test"
)

OUTPUT_DIR = PROJECT / "artifacts" / "evaluation"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Load selected checkpoint
checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)

class_to_idx = checkpoint["class_to_idx"]
classes = sorted(class_to_idx, key=class_to_idx.get)

# Identical preprocessing to validation
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(
        checkpoint["mean"],
        checkpoint["std"],
    ),
])

test_data = datasets.ImageFolder(
    TEST_DIR,
    transform=transform,
)

assert len(test_data) == 115
assert test_data.class_to_idx == class_to_idx

loader = DataLoader(
    test_data,
    batch_size=16,
    shuffle=False,
    num_workers=0,
)

# Reconstruct MobileNetV3-Small
model = mobilenet_v3_small(weights=None)

in_features = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(
    in_features,
    len(classes),
)

model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

# Confusion matrix: rows actual, columns predicted
matrix = torch.zeros(
    (len(classes), len(classes)),
    dtype=torch.int64,
)

with torch.inference_mode():
    for images, labels in loader:
        outputs = model(images)
        predictions = outputs.argmax(dim=1)

        for actual, predicted in zip(
            labels.tolist(),
            predictions.tolist(),
        ):
            matrix[actual, predicted] += 1

correct = matrix.diag().sum().item()
total = matrix.sum().item()
accuracy = 100 * correct / total

print("FINAL HELD-OUT TEST EVALUATION")
print("-" * 45)
print("Model: MobileNetV3-Small")
print("Selected checkpoint epoch:", checkpoint["epoch"])
print("Test images:", total)
print("Classes:", classes)
print("Confusion matrix:")
print(matrix)
print(f"Test accuracy: {accuracy:.2f}%")
print("-" * 45)

f1_scores = []
metric_rows = []

for i, name in enumerate(classes):
    tp = matrix[i, i].item()
    support = matrix[i].sum().item()
    predicted_count = matrix[:, i].sum().item()

    precision = (
        tp / predicted_count
        if predicted_count else 0.0
    )

    recall = (
        tp / support
        if support else 0.0
    )

    f1 = (
        2 * precision * recall / (precision + recall)
        if precision + recall else 0.0
    )

    f1_scores.append(f1)

    metric_rows.append({
        "class": name,
        "support": support,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    })

    print(
        f"{name}: "
        f"Precision={precision * 100:.2f}% | "
        f"Recall={recall * 100:.2f}% | "
        f"F1={f1 * 100:.2f}%"
    )

macro_f1 = 100 * sum(f1_scores) / len(f1_scores)

malignant = class_to_idx["malignant"]
missed_malignant = (
    matrix[malignant].sum()
    - matrix[malignant, malignant]
).item()

print("-" * 45)
print(f"Macro-F1: {macro_f1:.2f}%")
print("Missed malignant images:", missed_malignant)

# Save confusion matrix
matrix_path = OUTPUT_DIR / "mobilenetv3_test_matrix.csv"

with open(matrix_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Actual / Predicted", *classes])

    for i, name in enumerate(classes):
        writer.writerow([name, *matrix[i].tolist()])

# Save per-class metrics
metrics_path = OUTPUT_DIR / "mobilenetv3_test_metrics.csv"

with open(metrics_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=["class", "support", "precision", "recall", "f1"],
    )
    writer.writeheader()
    writer.writerows(metric_rows)

print("Confusion matrix saved:", matrix_path)
print("Metrics saved:", metrics_path)
print("FINAL TEST EVALUATION COMPLETED")
