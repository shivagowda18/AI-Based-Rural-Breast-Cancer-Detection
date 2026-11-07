
from pathlib import Path
import csv

from PIL import Image

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

MANIFEST = PROJECT / "data" / "processed" / "busi_manifest.csv"
OUTPUT = PROJECT / "data" / "processed" / "busi_similar_pairs_review.csv"


def dhash(path):
    with Image.open(path) as image:
        small = image.convert("L").resize(
            (9, 8), Image.Resampling.LANCZOS
        )
        pixels = list(small.tobytes())

    result = 0

    for y in range(8):
        for x in range(8):
            left = pixels[y * 9 + x]
            right = pixels[y * 9 + x + 1]
            result = (result << 1) | int(left > right)

    return result


with open(MANIFEST, newline="", encoding="utf-8") as file:
    records = [
        row for row in csv.DictReader(file)
        if row["status"] == "included"
    ]

assert len(records) == 778, "Unexpected dataset size"

print("BUSI SIMILARITY CHECK")
print("-" * 45)

hashes = []

for record in records:
    image_path = DATASET / record["image_path"]
    hashes.append(dhash(image_path))

similar_pairs = []

for i in range(len(records)):
    for j in range(i + 1, len(records)):
        distance = (hashes[i] ^ hashes[j]).bit_count()

        if distance <= 3:
            similar_pairs.append({
                "image_1": records[i]["image_path"],
                "label_1": records[i]["label"],
                "image_2": records[j]["image_path"],
                "label_2": records[j]["label"],
                "hash_distance": distance,
            })

similar_pairs.sort(key=lambda row: row["hash_distance"])

with open(OUTPUT, "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=[
            "image_1", "label_1",
            "image_2", "label_2",
            "hash_distance"
        ]
    )
    writer.writeheader()
    writer.writerows(similar_pairs)

print("Images checked:", len(records))
print("Candidate similar pairs:", len(similar_pairs))

for pair in similar_pairs[:10]:
    print(
        pair["image_1"], "<->",
        pair["image_2"],
        "| Distance:", pair["hash_distance"]
    )

print("-" * 45)
print("Review file saved:", OUTPUT)
print("Similarity check completed.")
