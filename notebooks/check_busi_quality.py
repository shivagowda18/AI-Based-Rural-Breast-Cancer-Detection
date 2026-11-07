
from pathlib import Path
from collections import defaultdict
import hashlib

from PIL import Image

ROOT = (
    Path(__file__).resolve().parents[1]
    / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

CLASSES = ["benign", "malignant", "normal"]
EXTENSIONS = {".png", ".jpg", ".jpeg"}

images = []
masks = []

for category in CLASSES:
    folder = ROOT / category

    for path in folder.iterdir():
        if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
            continue

        if "_mask" in path.stem.lower():
            masks.append(path)
        else:
            images.append(path)

print("BUSI DATASET QUALITY CHECK")
print("-" * 45)

invalid = []
hashes = defaultdict(list)

for path in images + masks:
    try:
        with Image.open(path) as img:
            img.verify()

    except Exception as error:
        invalid.append((path, str(error)))
        continue

    if path in images:
        hasher = hashlib.sha256()

        with open(path, "rb") as file:
            for chunk in iter(lambda: file.read(1024 * 1024), b""):
                hasher.update(chunk)

        hashes[hasher.hexdigest()].append(path)

duplicates = [
    group for group in hashes.values()
    if len(group) > 1
]

image_names = {
    (p.parent.name, p.stem.lower())
    for p in images
}

mask_names = {
    (p.parent.name, p.stem.lower().split("_mask")[0])
    for p in masks
}

missing_masks = image_names - mask_names
orphan_masks = mask_names - image_names

print("Total ultrasound images:", len(images))
print("Total masks:", len(masks))
print("Unreadable/corrupted files:", len(invalid))
print("Exact duplicate image groups:", len(duplicates))
print("Images without masks:", len(missing_masks))
print("Masks without matching images:", len(orphan_masks))

if invalid:
    print("\nUNREADABLE FILES:")
    for path, error in invalid[:10]:
        print(path.name, error)

if duplicates:
    print("\nEXACT DUPLICATE GROUPS:")
    for group in duplicates[:10]:
        print([str(p.relative_to(ROOT)) for p in group])

print("\nQuality check completed.")
