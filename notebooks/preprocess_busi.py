
from pathlib import Path
from collections import Counter
from PIL import Image, ImageOps
import csv

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

PROCESSED = PROJECT / "data" / "processed"
SPLITS = PROCESSED / "busi_splits.csv"
OUTPUT = PROCESSED / "images"
MANIFEST = PROCESSED / "busi_preprocessed_manifest.csv"

TARGET = (224, 224)

with open(SPLITS, newline="", encoding="utf-8") as file:
    records = list(csv.DictReader(file))

assert len(records) == 766, "Unexpected image count"

expected = {"train": 536, "val": 115, "test": 115}
counts = Counter(row["split"] for row in records)

assert dict(counts) == expected, "Split counts changed"

output_rows = []

print("BUSI IMAGE PREPROCESSING")
print("-" * 45)

for index, record in enumerate(records, start=1):
    split = record["split"]
    label = record["label"]
    source = DATASET / record["image_path"]

    assert split in expected
    assert label in {"normal", "benign", "malignant"}
    assert source.is_file()
    assert source.parent.name == label

    destination = OUTPUT / split / label / source.name
    destination.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        original_width, original_height = image.size
        rgb = image.convert("RGB")

        resized = ImageOps.contain(
            rgb,
            TARGET,
            method=Image.Resampling.LANCZOS
        )

        canvas = Image.new("RGB", TARGET, (0, 0, 0))

        x = (TARGET[0] - resized.width) // 2
        y = (TARGET[1] - resized.height) // 2

        canvas.paste(resized, (x, y))
        canvas.save(destination, format="PNG")

    output_rows.append({
        "source_path": record["image_path"],
        "processed_path": destination.relative_to(PROJECT).as_posix(),
        "label": label,
        "split": split,
        "group_id": record["group_id"],
        "original_width": original_width,
        "original_height": original_height,
        "resized_width": resized.width,
        "resized_height": resized.height,
        "pad_left": x,
        "pad_top": y,
        "width": 224,
        "height": 224,
    })

    if index % 100 == 0:
        print(f"Processed {index}/766 images")

with open(MANIFEST, "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=output_rows[0].keys()
    )
    writer.writeheader()
    writer.writerows(output_rows)

print("-" * 45)
print("PREPROCESSING COMPLETED")
print("Training images:", counts["train"])
print("Validation images:", counts["val"])
print("Testing images:", counts["test"])
print("Total processed:", len(output_rows))
print("Output size: 224 x 224")
print("Aspect ratio preserved: Yes")
print("Original images modified: No")
print("Manifest saved:", MANIFEST)
