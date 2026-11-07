
from pathlib import Path
import csv

from PIL import Image, ImageDraw, ImageOps

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

INPUT = (
    PROJECT / "data" / "processed"
    / "busi_cross_label_review.csv"
)

OUTPUT = (
    PROJECT / "data" / "processed"
    / "busi_conflict_review_grid.jpg"
)

with open(INPUT, newline="", encoding="utf-8") as f:
    pairs = list(csv.DictReader(f))

PANEL_WIDTH = 340
ROW_HEIGHT = 270

canvas = Image.new(
    "RGB",
    (PANEL_WIDTH * 2, ROW_HEIGHT * len(pairs)),
    "white"
)

draw = ImageDraw.Draw(canvas)

for index, pair in enumerate(pairs):
    y = index * ROW_HEIGHT

    draw.text(
        (12, y + 8),
        f"PAIR {index + 1} | Hash distance: {pair['hash_distance']}",
        fill="black"
    )

    for column, key in enumerate(["image_1", "image_2"]):
        path = DATASET / pair[key]

        with Image.open(path) as original:
            image = ImageOps.contain(
                original.convert("RGB"),
                (320, 200)
            )

        x = column * PANEL_WIDTH

        canvas.paste(
            image,
            (x + (PANEL_WIDTH - image.width) // 2, y + 30)
        )

        draw.text(
            (x + 10, y + 240),
            pair[key],
            fill="black"
        )

    draw.line(
        (0, y + ROW_HEIGHT - 2,
         PANEL_WIDTH * 2, y + ROW_HEIGHT - 2),
        fill="gray",
        width=1
    )

canvas.save(OUTPUT, quality=92)

print("Review completed.")
print("Candidate pairs:", len(pairs))
print("Review image saved:", OUTPUT)
