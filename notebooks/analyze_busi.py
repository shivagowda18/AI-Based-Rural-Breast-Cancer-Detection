
from pathlib import Path
from collections import Counter
from statistics import median
import csv

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

MANIFEST = PROJECT / "data" / "processed" / "busi_manifest.csv"
OUTPUT = PROJECT / "data" / "processed" / "busi_statistics.csv"

with open(MANIFEST, newline="", encoding="utf-8") as f:
    records = [
        row for row in csv.DictReader(f)
        if row["status"] == "included"
    ]

results = []

for row in records:
    path = DATASET / row["image_path"]

    from PIL import Image

    with Image.open(path) as img:
        width, height = img.size
        image_format = img.format
        image_mode = img.mode

    results.append({
        "image_path": row["image_path"],
        "label": row["label"],
        "width": width,
        "height": height,
        "aspect_ratio": round(width / height, 3),
        "format": image_format,
        "mode": image_mode
    })

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=results[0].keys())
    writer.writeheader()
    writer.writerows(results)

print("BUSI DATASET STATISTICAL ANALYSIS")
print("=" * 45)
print("Total included images:", len(results))

for category in ["normal", "benign", "malignant"]:
    subset = [r for r in results if r["label"] == category]

    widths = [r["width"] for r in subset]
    heights = [r["height"] for r in subset]

    print(f"\nCATEGORY: {category.upper()}")
    print("Images:", len(subset))
    print("Percentage:", round(len(subset) / len(results) * 100, 2), "%")
    print("Width min/median/max:", min(widths), median(widths), max(widths))
    print("Height min/median/max:", min(heights), median(heights), max(heights))

dimensions = Counter(
    (r["width"], r["height"]) for r in results
)

print("\nMost common image dimensions:")
for size, count in dimensions.most_common(5):
    print(f"{size[0]} x {size[1]}: {count} images")

print("\nImage formats:")
print(dict(Counter(r["format"] for r in results)))

print("\nImage modes:")
print(dict(Counter(r["mode"] for r in results)))

print("\nAnalysis completed successfully.")
print("Saved to:", OUTPUT)
