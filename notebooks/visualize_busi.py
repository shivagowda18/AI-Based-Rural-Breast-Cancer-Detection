
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
import csv
import random

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

MANIFEST = PROJECT / "data" / "processed" / "busi_manifest.csv"
OUTPUT = PROJECT / "data" / "processed" / "busi_sample_grid.jpg"

with open(MANIFEST, newline="", encoding="utf-8") as file:
    rows = list(csv.DictReader(file))

classes = ["normal", "benign", "malignant"]
rng = random.Random(42)

cell_width = 260
cell_height = 230

canvas = Image.new(
    "RGB",
    (cell_width * 3, cell_height * 3),
    "white"
)

draw = ImageDraw.Draw(canvas)

for row_index, category in enumerate(classes):
    images = [
        row for row in rows
        if row["label"] == category
        and row["status"] == "included"
    ]

    samples = rng.sample(images, 3)

    for col_index, sample in enumerate(samples):
        image_path = DATASET / sample["image_path"]

        with Image.open(image_path) as original:
            image = ImageOps.contain(
                original.convert("RGB"),
                (240, 185)
            )

        x = col_index * cell_width
        y = row_index * cell_height

        canvas.paste(image, (
            x + (cell_width - image.width) // 2,
            y + 10
        ))

        draw.text(
            (x + 10, y + 200),
            f"{category.upper()}: {image_path.name}",
            fill="black"
        )

canvas.save(OUTPUT, quality=90)

print("Dataset visualization completed.")
print("Classes:", ", ".join(classes))
print("Sample images:", 9)
print("Saved to:", OUTPUT)
