
from pathlib import Path
from collections import Counter
import csv
import random

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import (
    efficientnet_b0,
    EfficientNet_B0_Weights,
)

PROJECT = Path(__file__).resolve().parents[1]
DATA = PROJECT / "data" / "processed" / "images"

MODEL_DIR = PROJECT / "artifacts" / "models"
LOG_DIR = PROJECT / "artifacts" / "training_logs"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "busi_efficientnetb0_best.pth"
LOG_PATH = LOG_DIR / "efficientnetb0_training_history.csv"

SEED = 42
MAX_EPOCHS = 10
PATIENCE = 3
BATCH_SIZE = 16

random.seed(SEED)
torch.manual_seed(SEED)

device = torch.device("cpu")

mean = [0.485, 0.456, 0.406]
std = [0.229, 0.224, 0.225]

train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(7),
    transforms.ToTensor(),
    transforms.Normalize(mean, std),
])

eval_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean, std),
])

train_data = datasets.ImageFolder(
    DATA / "train", transform=train_transform
)

val_data = datasets.ImageFolder(
    DATA / "val", transform=eval_transform
)

assert len(train_data) == 536
assert len(val_data) == 115

assert train_data.class_to_idx == val_data.class_to_idx
assert train_data.class_to_idx == {
    "benign": 0,
    "malignant": 1,
    "normal": 2,
}

classes = train_data.classes

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

# Class weights from training data only
counts = Counter(train_data.targets)

class_weights = torch.tensor([
    len(train_data) / (len(classes) * counts[i])
    for i in range(len(classes))
], dtype=torch.float32)

# Load pretrained EfficientNet-B0
model = efficientnet_b0(
    weights=EfficientNet_B0_Weights.DEFAULT
)

# Freeze the pretrained feature extractor
for parameter in model.features.parameters():
    parameter.requires_grad = False

# Replace classifier for 3 BUSI classes
in_features = model.classifier[-1].in_features
model.classifier[-1] = nn.Linear(
    in_features, len(classes)
)

model = model.to(device)

criterion = nn.CrossEntropyLoss(
    weight=class_weights.to(device)
)

optimizer = torch.optim.Adam(
    model.classifier.parameters(),
    lr=0.0005,
)

best_loss = float("inf")
best_epoch = 0
no_improvement = 0
history = []

print("EFFICIENTNET-B0 TRAINING", flush=True)
print("-" * 45)
print("Device:", device)
print("Classes:", train_data.class_to_idx)
print("Training images:", len(train_data))
print("Validation images:", len(val_data))
print("Maximum epochs:", MAX_EPOCHS)
print("Test images used: No")
print("-" * 45, flush=True)

for epoch in range(1, MAX_EPOCHS + 1):
    print(
        f"Epoch {epoch}/{MAX_EPOCHS} - Training...",
        flush=True,
    )

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
    matrix = torch.zeros(
        (len(classes), len(classes)),
        dtype=torch.int64,
    )

    with torch.inference_mode():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device)

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

    train_acc = (
        100 * train_correct / len(train_data)
    )

    val_acc = (
        100 * matrix.diag().sum().item()
        / len(val_data)
    )

    recalls = {}
    f1_scores = []

    for i, name in enumerate(classes):
        tp = matrix[i, i].item()
        actual = matrix[i].sum().item()
        predicted = matrix[:, i].sum().item()

        precision = tp / predicted if predicted else 0
        recall = tp / actual if actual else 0

        f1 = (
            2 * precision * recall / (precision + recall)
            if precision + recall else 0
        )

        recalls[name] = recall * 100
        f1_scores.append(f1)

    macro_f1 = 100 * sum(f1_scores) / len(f1_scores)

    malignant_idx = train_data.class_to_idx["malignant"]

    missed_malignant = (
        matrix[malignant_idx].sum()
        - matrix[malignant_idx, malignant_idx]
    ).item()

    print(f"Train accuracy: {train_acc:.2f}%")
    print(f"Validation loss: {avg_val_loss:.4f}")
    print(f"Validation accuracy: {val_acc:.2f}%")
    print(f"Macro-F1: {macro_f1:.2f}%")
    print(f"Malignant recall: {recalls['malignant']:.2f}%")
    print("Missed malignant cases:", missed_malignant)

    history.append({
        "epoch": epoch,
        "train_accuracy": train_acc,
        "val_loss": avg_val_loss,
        "val_accuracy": val_acc,
        "macro_f1": macro_f1,
        "malignant_recall": recalls["malignant"],
        "missed_malignant": missed_malignant,
    })

    if avg_val_loss < best_loss - 0.0001:
        best_loss = avg_val_loss
        best_epoch = epoch
        no_improvement = 0

        torch.save({
            "model_state_dict": model.state_dict(),
            "class_to_idx": train_data.class_to_idx,
            "model_name": "efficientnet_b0",
            "image_size": 224,
            "mean": mean,
            "std": std,
            "epoch": epoch,
            "val_loss": avg_val_loss,
            "val_accuracy": val_acc,
            "val_macro_f1": macro_f1,
            "val_recalls": recalls,
        }, MODEL_PATH)

        print("Best checkpoint saved.")
    else:
        no_improvement += 1
        print("No validation loss improvement.")

    print("-" * 45, flush=True)

    if no_improvement >= PATIENCE:
        print("Early stopping triggered.")
        break

with open(
    LOG_PATH, "w", newline="", encoding="utf-8"
) as file:
    writer = csv.DictWriter(
        file, fieldnames=history[0].keys()
    )
    writer.writeheader()
    writer.writerows(history)

print("EFFICIENTNET-B0 TRAINING COMPLETED")
print("Best epoch:", best_epoch)
print("Best validation loss:", round(best_loss, 4))
print("Model saved:", MODEL_PATH)
print("History saved:", LOG_PATH)
print("Test dataset used: No")
