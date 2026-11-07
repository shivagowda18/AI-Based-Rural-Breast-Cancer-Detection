
from pathlib import Path
from hashlib import sha256

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

OUTPUT = (
    PROJECT / "backend" / "app" / "core"
    / "approved_demo_sha256.txt"
)

images = []

for label in ("benign", "malignant", "normal"):
    folder = DATASET / label

    if not folder.is_dir():
        raise SystemExit(f"Dataset folder not found: {folder}")

    for image_path in folder.glob("*.png"):
        # Exclude segmentation masks.
        if "_mask" in image_path.stem.lower():
            continue

        images.append(image_path)

hashes = sorted({
    sha256(path.read_bytes()).hexdigest()
    for path in images
})

OUTPUT.write_text(
    "\n".join(hashes) + "\n",
    encoding="utf-8",
)

print("BUSI original images found:", len(images))
print("Unique approved hashes:", len(hashes))
print("Allowlist saved:", OUTPUT)
