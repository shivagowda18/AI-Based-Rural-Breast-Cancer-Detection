
from pathlib import Path

ROOT = (
    Path(__file__).resolve().parents[1]
    / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

classes = ["benign", "malignant", "normal"]

total_images = 0
total_masks = 0

print("BUSI DATASET VERIFICATION")
print("-" * 40)

for name in classes:
    folder = ROOT / name

    if not folder.is_dir():
        print(f"{name}: FOLDER NOT FOUND")
        continue

    files = [
        f for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in {".png", ".jpg", ".jpeg"}
    ]

    images = [f for f in files if "_mask" not in f.stem.lower()]
    masks = [f for f in files if "_mask" in f.stem.lower()]

    print(f"{name}: {len(images)} images, {len(masks)} masks")

    total_images += len(images)
    total_masks += len(masks)

print("-" * 40)
print("Total ultrasound images:", total_images)
print("Total segmentation masks:", total_masks)
