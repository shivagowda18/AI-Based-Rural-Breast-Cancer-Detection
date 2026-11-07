
from pathlib import Path
from collections import Counter
import csv
import random

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights,
)

PROJECT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT / "data" / "processed" / "images"
MODEL_DIR = PROJECT / "artifacts" / "models"
LOG_DIR = PROJECT / "artifacts" / "training_logs"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "busi_mobilenetv3_best.pth"
LOG_PATH = LOG_DIR / "mobilenetv3_training_history.csv"

SEED = 42
EPOCHS = 10
PATIENCE = 3
BATCH_SIZE = 16

random.seed(SEED)
torch.manual_seed(SEED)
device = torch.device("cpu")

MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=7),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

eval_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

train_dataset = datasets.ImageFolder(
    DATA_DIR / "train",
    transform=train_transform,
)

val_dataset = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=eval_transform,
)

assert len(train_dataset) == 536
assert len(val_dataset) == 115
assert train_dataset.class_to_idx == val_dataset.class_to_idx
assert train_dataset.class_to_idx == {
    "benign": 0,
    "malignant": 1,
    "normal": 2,
}

classes = train_dataset.classes
counts = Counter(train_dataset.targets)

weights = torch.tensor(
    [
        len(train_dataset) / (len(classes) * counts[i])
        for i in range(len(classes))
    ],
    dtype=torch.float32,
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
)

model = mobilenet_v3_small(
    weights=MobileNet_V3_Small_Weights.DEFAULT
)

for parameter in model.features.parameters():
    parameter.requires_grad = False

in_features = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(
    in_features,
    len(classes),
)

model = model.to(device)

criterion = nn.CrossEntropyLoss(weight=weights.to(device))

optimizer = torch.optim.Adam(
    (p for p in model.parameters() if p.requires_grad),
    lr=0.0005,
)

best_loss = float("inf")
best_epoch = 0
epochs_without_improvement = 0
history = []

print("MOBILENETV3 BASELINE TRAINING", flush=True)
print("Training:", len(train_dataset))
print("Validation:", len(val_dataset))
print("Classes:", train_dataset.class_to_idx)
print("Device:", device)
print("Maximum epochs:", EPOCHS)
print("Test images used: No")
print("-" * 45, flush=True)

for epoch in range(1, EPOCHS + 1):
    print(f"Epoch {epoch}/{EPOCHS} - Training...", flush=True)

    model.train()
    model.features.eval()

    train_loss = 0.0
    train_correct = 0

    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device)

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
    val_correct = 0

    class_correct = Counter()
    class_total = Counter()

    with torch.inference_mode():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            predictions = outputs.argmax(1)

            val_loss += loss.item() * labels.size(0)
            val_correct += (
                predictions == labels
            ).sum().item()

            for actual, predicted in zip(
                labels.tolist(),
                predictions.tolist(),
            ):
                class_total[actual] += 1

                if actual == predicted:
                    class_correct[actual] += 1

    avg_train_loss = train_loss / len(train_dataset)
    avg_val_loss = val_loss / len(val_dataset)

    train_accuracy = (
        100 * train_correct / len(train_dataset)
    )
    val_accuracy = (
        100 * val_correct / len(val_dataset)
    )

    recalls = {
        name: 100 * class_correct[i] / class_total[i]
        for i, name in enumerate(classes)
    }

    history.append({
        "epoch": epoch,
        "train_loss": avg_train_loss,
        "val_loss": avg_val_loss,
        "train_accuracy": train_accuracy,
        "val_accuracy": val_accuracy,
        "benign_recall": recalls["benign"],
        "malignant_recall": recalls["malignant"],
        "normal_recall": recalls["normal"],
    })

    print(f"Train loss: {avg_train_loss:.4f}")
    print(f"Train accuracy: {train_accuracy:.2f}%")
    print(f"Validation loss: {avg_val_loss:.4f}")
    print(f"Validation accuracy: {val_accuracy:.2f}%")

    for name in classes:
        print(f"{name} recall: {recalls[name]:.2f}%")

    if avg_val_loss < best_loss - 0.0001:
        best_loss = avg_val_loss
        best_epoch = epoch
        epochs_without_improvement = 0

        torch.save({
            "model_state_dict": model.state_dict(),
            "class_to_idx": train_dataset.class_to_idx,
            "model_name": "mobilenet_v3_small",
            "image_size": 224,
            "mean": MEAN,
            "std": STD,
            "epoch": epoch,
            "val_loss": avg_val_loss,
            "val_accuracy": val_accuracy,
            "val_recalls": recalls,
        }, MODEL_PATH)

        print("Best checkpoint saved.")
    else:
        epochs_without_improvement += 1

    print("-" * 45, flush=True)

    if epochs_without_improvement >= PATIENCE:
        print("Early stopping triggered.")
        break

with open(LOG_PATH, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=history[0].keys())
    writer.writeheader()
    writer.writerows(history)

print("TRAINING COMPLETED")
print("Best epoch:", best_epoch)
print("Best validation loss:", round(best_loss, 4))
print("Best model:", MODEL_PATH)
print("Training history:", LOG_PATH)
print("Test dataset used: No")
