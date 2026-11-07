
from pathlib import Path
import csv

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_small

PROJECT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT / "data" / "processed" / "images"
MODEL_PATH = (
    PROJECT / "artifacts" / "models"
    / "busi_mobilenetv3_best.pth"
)

OUTPUT = (
    PROJECT / "artifacts" / "training_logs"
    / "mobilenetv3_val_confusion_matrix.csv"
)

# Load our best checkpoint.
checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)

class_to_idx = checkpoint["class_to_idx"]
classes = sorted(class_to_idx, key=class_to_idx.get)

# Same deterministic preprocessing used in training.
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(
        checkpoint["mean"],
        checkpoint["std"],
    ),
])

dataset = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=transform,
)

assert len(dataset) == 115
assert dataset.class_to_idx == class_to_idx

loader = DataLoader(
    dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0,
)

# Reconstruct the model.
model = mobilenet_v3_small(weights=None)

in_features = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(
    in_features,
    len(classes),
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)
model.eval()

# Rows = actual labels, columns = predicted labels.
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

print("BEST MODEL VALIDATION EVALUATION")
print("-" * 45)
print("Saved epoch:", checkpoint["epoch"])
print("Classes:", classes)
print("Confusion matrix:")
print(matrix)

correct = matrix.diag().sum().item()
total = matrix.sum().item()
accuracy = 100 * correct / total

print(f"Accuracy: {accuracy:.2f}%")
print("-" * 45)

f1_scores = []

for i, name in enumerate(classes):
    tp = matrix[i, i].item()
    actual_total = matrix[i].sum().item()
    predicted_total = matrix[:, i].sum().item()

    precision = tp / predicted_total if predicted_total else 0
    recall = tp / actual_total if actual_total else 0

    f1 = (
        2 * precision * recall / (precision + recall)
        if precision + recall else 0
    )

    f1_scores.append(f1)

    print(
        f"{name}: "
        f"Precision={precision * 100:.2f}% | "
        f"Recall={recall * 100:.2f}% | "
        f"F1={f1 * 100:.2f}%"
    )

macro_f1 = 100 * sum(f1_scores) / len(f1_scores)

malignant_idx = class_to_idx["malignant"]
missed_malignant = (
    matrix[malignant_idx].sum()
    - matrix[malignant_idx, malignant_idx]
).item()

print("-" * 45)
print(f"Macro-F1: {macro_f1:.2f}%")
print("Missed malignant cases:", missed_malignant)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Actual / Predicted", *classes])

    for i, name in enumerate(classes):
        writer.writerow([name, *matrix[i].tolist()])

print("Confusion matrix saved:", OUTPUT)
print("Test dataset used: No")
print("VALIDATION EVALUATION COMPLETED")
