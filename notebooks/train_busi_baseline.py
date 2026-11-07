
from pathlib import Path
from collections import Counter
import random

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import (
    mobilenet_v3_small,
    MobileNet_V3_Small_Weights,
)

# ----------------------------------------
# STEP 12: BUSI BASELINE MODEL TRAINING
# ----------------------------------------

PROJECT = Path(__file__).resolve().parents[1]

DATA_DIR = PROJECT / "data" / "processed" / "images"
MODEL_DIR = PROJECT / "artifacts" / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "busi_mobilenetv3_pilot.pth"

# Training settings
SEED = 42
EPOCHS = 1
BATCH_SIZE = 16
DEVICE = torch.device("cpu")

random.seed(SEED)
torch.manual_seed(SEED)

# ImageNet normalization
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

# Training transformations
train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=7),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

# Validation transformations
val_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

# Load training and validation datasets
train_dataset = datasets.ImageFolder(
    DATA_DIR / "train",
    transform=train_transform,
)

val_dataset = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=val_transform,
)

# Verify dataset counts
assert len(train_dataset) == 536
assert len(val_dataset) == 115

assert (
    train_dataset.class_to_idx
    == val_dataset.class_to_idx
)

assert train_dataset.class_to_idx == {
    "benign": 0,
    "malignant": 1,
    "normal": 2,
}

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

# Calculate class weights using training data
counts = Counter(train_dataset.targets)
classes = train_dataset.classes

class_weights = torch.tensor(
    [
        len(train_dataset) / (
            len(classes) * counts[i]
        )
        for i in range(len(classes))
    ],
    dtype=torch.float32,
)

# Load pretrained model
model = mobilenet_v3_small(
    weights=MobileNet_V3_Small_Weights.DEFAULT
)

# Freeze feature extractor
for parameter in model.features.parameters():
    parameter.requires_grad = False

# Change output layer to 3 classes
in_features = model.classifier[-1].in_features

model.classifier[-1] = nn.Linear(
    in_features,
    len(classes),
)

model = model.to(DEVICE)

# Weighted loss
criterion = nn.CrossEntropyLoss(
    weight=class_weights.to(DEVICE)
)

# Optimizer
optimizer = torch.optim.Adam(
    filter(
        lambda p: p.requires_grad,
        model.parameters()
    ),
    lr=0.0001,
)

print("BUSI BASELINE TRAINING")
print("-" * 45)
print("Model: MobileNetV3-Small")
print("Device:", DEVICE)
print("Classes:", train_dataset.class_to_idx)
print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))
print("Class weights:", class_weights.tolist())
print("Epochs:", EPOCHS)
print("-" * 45)

# ----------------------------------------
# TRAINING
# ----------------------------------------

for epoch in range(EPOCHS):

    model.train()

    # Prevent updates to frozen BatchNorm statistics
    model.features.eval()

    train_loss = 0.0
    train_correct = 0

    for images, labels in train_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        train_loss += loss.item() * labels.size(0)

        train_correct += (
            outputs.argmax(dim=1) == labels
        ).sum().item()

    # ------------------------------------
    # VALIDATION
    # ------------------------------------

    model.eval()

    val_loss = 0.0
    val_correct = 0

    class_correct = Counter()
    class_total = Counter()

    with torch.inference_mode():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)
            loss = criterion(outputs, labels)

            predictions = outputs.argmax(dim=1)

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

    train_acc = (
        100 * train_correct / len(train_dataset)
    )

    val_acc = (
        100 * val_correct / len(val_dataset)
    )

    print(f"Epoch {epoch + 1}/{EPOCHS}")
    print(f"Train loss: {avg_train_loss:.4f}")
    print(f"Train accuracy: {train_acc:.2f}%")
    print(f"Validation loss: {avg_val_loss:.4f}")
    print(f"Validation accuracy: {val_acc:.2f}%")

    for index, name in enumerate(classes):

        recall = (
            100 * class_correct[index]
            / class_total[index]
        )

        print(f"{name} recall: {recall:.2f}%")

# ----------------------------------------
# SAVE TRAINED PILOT MODEL
# ----------------------------------------

torch.save(
    {
        "model_state_dict": model.state_dict(),
        "class_to_idx": train_dataset.class_to_idx,
        "image_size": 224,
        "mean": MEAN,
        "std": STD,
        "epochs": EPOCHS,
        "validation_accuracy": val_acc,
    },
    MODEL_PATH,
)

print("-" * 45)
print("PILOT TRAINING COMPLETED")
print("Checkpoint saved:", MODEL_PATH)
print("Test dataset used: No")
