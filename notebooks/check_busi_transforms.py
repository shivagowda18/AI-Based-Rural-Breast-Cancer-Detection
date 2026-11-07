
from pathlib import Path
from collections import Counter

import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

PROJECT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT / "data" / "processed" / "images"

MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

# Random transformations for training only.
train_transform = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=7),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

# Fixed transformations for validation/testing.
eval_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])

train = datasets.ImageFolder(
    DATA_DIR / "train",
    transform=train_transform
)

val = datasets.ImageFolder(
    DATA_DIR / "val",
    transform=eval_transform
)

test = datasets.ImageFolder(
    DATA_DIR / "test",
    transform=eval_transform
)

assert len(train) == 536
assert len(val) == 115
assert len(test) == 115

assert train.class_to_idx == val.class_to_idx
assert train.class_to_idx == test.class_to_idx

loader = DataLoader(
    train,
    batch_size=8,
    shuffle=True,
    num_workers=0
)

images, labels = next(iter(loader))

assert images.shape == (8, 3, 224, 224)
assert torch.isfinite(images).all()

# Evaluation must be deterministic.
first, _ = val[0]
second, _ = val[0]
assert torch.equal(first, second)

print("IMAGE TRANSFORM VERIFICATION")
print("-" * 40)
print("Classes:", train.class_to_idx)
print("Training images:", len(train))
print("Validation images:", len(val))
print("Testing images:", len(test))
print("Training class counts:",
      dict(Counter(train.targets)))
print("Batch shape:", images.shape)
print("Normalization: ImageNet")
print("Random augmentation: Training only")
print("Validation deterministic: Yes")
print("-" * 40)
print("VERIFICATION PASSED")
