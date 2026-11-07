
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import csv

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

PROCESSED = PROJECT / "data" / "processed"

with open(
    PROCESSED / "busi_splits.csv",
    newline="",
    encoding="utf-8"
) as file:
    records = list(csv.DictReader(file))

SIZE = (224, 224)
classes = ["normal", "benign", "malignant"]

canvas = Image.new("RGB", (620, 900), "white")
draw = ImageDraw.Draw(canvas)

for index, category in enumerate(classes):
    sample = next(
        row for row in records
        if row["label"] == category
        and row["split"] == "train"
    )

    path = DATASET / sample["image_path"]

    with Image.open(path) as source:
        original_size = source.size
        original = source.convert("RGB")

    # Resize while preserving aspect ratio.
    resized = ImageOps.contain(
        original,
        SIZE,
        method=Image.Resampling.LANCZOS
    )

    # Center image on a 224 x 224 canvas.
    processed = Image.new("RGB", SIZE, (0, 0, 0))
    processed.paste(
        resized,
        (
            (224 - resized.width) // 2,
            (224 - resized.height) // 2
        )
    )

    assert processed.size == SIZE

    y = index * 300

    preview = ImageOps.contain(
        original, (320, 224)
    )

    canvas.paste(preview, (10, y + 35))
    canvas.paste(processed, (380, y + 35))

    draw.text(
        (10, y + 10),
        f"{category.upper()} | Original: {original_size}",
        fill="black"
    )

    draw.text(
        (380, y + 265),
        "Processed: 224 x 224",
        fill="black"
    )

output = PROCESSED / "busi_preprocessing_preview.jpg"
canvas.save(output, quality=95)

print("Preprocessing preview completed.")
print("Categories:", ", ".join(classes))
print("Target dimensions: 224 x 224")
print("Aspect ratio preserved: Yes")
print("Original dataset modified: No")
print("Saved to:", output)
