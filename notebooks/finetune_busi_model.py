
from pathlib import Path
from collections import Counter
import csv
import random

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import mobilenet_v3_small

PROJECT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT / "data" / "processed" / "images"
MODEL_DIR = PROJECT / "artifacts" / "models"
LOG_DIR = PROJECT / "artifacts" / "training_logs"

SOURCE_MODEL = MODEL_DIR / "busi_mobilenetv3_best.pth"
OUTPUT_MODEL = MODEL_DIR / "busi_mobilenetv3_finetuned_best.pth"
LOG_FILE = LOG_DIR / "mobilenetv3_finetuning_history.csv"

LOG_DIR.mkdir(parents=True, exist_ok=True)

SEED = 42
MAX_EPOCHS = 6
PATIENCE = 3
BATCH_SIZE = 16

random.seed(SEED)
torch.manual_seed(SEED)

checkpoint = torch.load(
    SOURCE_MODEL,
    map_location="cpu",
    weights_only=True,
)

MEAN = checkpoint["mean"]
STD = checkpoint["std"]
CLASS_TO_IDX = checkpoint["class_to_idx"]
CLASSES = sorted(CLASS_TO_IDX, key=CLASS_TO_IDX.get)

train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=7),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

val_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

train_data = datasets.ImageFolder(
    DATA_DIR / "train",
    transform=train_transform,
)

val_data = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=val_transform,
)

assert len(train_data) == 536
assert len(val_data) == 115
assert train_data.class_to_idx == CLASS_TO_IDX
assert val_data.class_to_idx == CLASS_TO_IDX

train_loader = DataLoader(
    train_data,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
)

val_loader = DataLoader(
    val_data,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
)

counts = Counter(train_data.targets)

class_weights = torch.tensor([
    len(train_data) / (len(CLASSES) * counts[i])
    for i in range(len(CLASSES))
], dtype=torch.float32)

# Restore the previously saved best model.
model = mobilenet_v3_small(weights=None)

in_features = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(
    in_features,
    len(CLASSES),
)

model.load_state_dict(checkpoint["model_state_dict"])

# Freeze everything initially.
for parameter in model.parameters():
    parameter.requires_grad = False

# Fine-tune only the last two feature blocks.
for parameter in model.features[-2:].parameters():
    parameter.requires_grad = True

# Keep the classifier trainable.
for parameter in model.classifier.parameters():
    parameter.requires_grad = True

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)

optimizer = torch.optim.Adam([
    {
        "params": model.features[-2:].parameters(),
        "lr": 0.00001,
    },
    {
        "params": model.classifier.parameters(),
        "lr": 0.00005,
    },
])

# New model must beat the original validation loss.
best_loss = float(checkpoint["val_loss"])
best_epoch = None
no_improvement = 0
history = []

print("BUSI MODEL FINE-TUNING", flush=True)
print("-" * 45)
print("Model: MobileNetV3-Small")
print("Starting from saved epoch:", checkpoint["epoch"])
print("Original validation loss:", round(best_loss, 4))
print("Training images:", len(train_data))
print("Validation images:", len(val_data))
print("Fine-tuned feature blocks: Last 2")
print("Maximum epochs:", MAX_EPOCHS)
print("Test dataset used: No")
print("-" * 45, flush=True)

for epoch in range(1, MAX_EPOCHS + 1):
    print(
        f"Epoch {epoch}/{MAX_EPOCHS} - Training...",
        flush=True,
    )

    model.train()

    # Frozen ImageNet BatchNorm statistics.
    model.features.eval()

    train_loss = 0.0
    train_correct = 0

    for images, labels in train_loader:
        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        train_loss += loss.item() * labels.size(0)
        train_correct += (
            outputs.argmax(1) == labels
        ).sum().item()

    model.eval()

    val_loss = 0.0
    matrix = torch.zeros(
        (len(CLASSES), len(CLASSES)),
        dtype=torch.int64,
    )

    with torch.inference_mode():
        for images, labels in val_loader:
            outputs = model(images)
            loss = criterion(outputs, labels)
            predictions = outputs.argmax(1)

            val_loss += loss.item() * labels.size(0)

            for actual, predicted in zip(
                labels.tolist(),
                predictions.tolist(),
            ):
                matrix[actual, predicted] += 1

    avg_train_loss = train_loss / len(train_data)
    avg_val_loss = val_loss / len(val_data)

    train_accuracy = (
        100 * train_correct / len(train_data)
    )

    val_accuracy = (
        100 * matrix.diag().sum().item()
        / len(val_data)
    )

    recalls = {}
    f1_scores = []

    for i, name in enumerate(CLASSES):
        tp = matrix[i, i].item()
        actual_total = matrix[i].sum().item()
        predicted_total = matrix[:, i].sum().item()

        precision = (
            tp / predicted_total
            if predicted_total else 0.0
        )

        recall = (
            tp / actual_total
            if actual_total else 0.0
        )

        f1 = (
            2 * precision * recall / (precision + recall)
            if precision + recall else 0.0
        )

        recalls[name] = recall * 100
        f1_scores.append(f1)

    macro_f1 = 100 * sum(f1_scores) / len(f1_scores)

    history.append({
        "epoch": epoch,
        "train_loss": avg_train_loss,
        "val_loss": avg_val_loss,
        "train_accuracy": train_accuracy,
        "val_accuracy": val_accuracy,
        "macro_f1": macro_f1,
        "benign_recall": recalls["benign"],
        "malignant_recall": recalls["malignant"],
        "normal_recall": recalls["normal"],
    })

    print(f"Train accuracy: {train_accuracy:.2f}%")
    print(f"Validation loss: {avg_val_loss:.4f}")
    print(f"Validation accuracy: {val_accuracy:.2f}%")
    print(f"Macro-F1: {macro_f1:.2f}%")

    for name in CLASSES:
        print(f"{name} recall: {recalls[name]:.2f}%")

    malignant = CLASS_TO_IDX["malignant"]
    missed = (
        matrix[malignant].sum()
        - matrix[malignant, malignant]
    ).item()

    print("Missed malignant cases:", missed)

    if avg_val_loss < best_loss - 0.0001:
        best_loss = avg_val_loss
        best_epoch = epoch
        no_improvement = 0

        torch.save({
            "model_state_dict": model.state_dict(),
            "class_to_idx": CLASS_TO_IDX,
            "model_name": "mobilenet_v3_small",
            "image_size": 224,
            "mean": MEAN,
            "std": STD,
            "epoch": epoch,
            "val_loss": avg_val_loss,
            "val_accuracy": val_accuracy,
            "val_macro_f1": macro_f1,
            "val_recalls": recalls,
        }, OUTPUT_MODEL)

        print("Improved checkpoint saved.")
    else:
        no_improvement += 1
        print("No improvement in validation loss.")

    print("-" * 45, flush=True)

    if no_improvement >= PATIENCE:
        print("Early stopping triggered.")
        break

with open(
    LOG_FILE,
    "w",
    newline="",
    encoding="utf-8",
) as file:
    writer = csv.DictWriter(
        file,
        fieldnames=history[0].keys(),
    )
    writer.writeheader()
    writer.writerows(history)

print("FINE-TUNING COMPLETED")

if best_epoch is not None:
    print("Improved model found at epoch:", best_epoch)
    print("Best validation loss:", round(best_loss, 4))
    print("New model:", OUTPUT_MODEL)
else:
    print("No improvement over original baseline.")
    print("Keep original model:", SOURCE_MODEL)

print("Training history:", LOG_FILE)
print("Test dataset used: No")
