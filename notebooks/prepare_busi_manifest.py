
from pathlib import Path
import csv

PROJECT = Path(__file__).resolve().parents[1]

DATASET = (
    PROJECT / "data" / "raw" / "BUSI"
    / "Dataset_BUSI_with_GT"
)

OUTPUT = PROJECT / "data" / "processed"
OUTPUT.mkdir(parents=True, exist_ok=True)

EXCLUDED = {
    "benign/benign (433).png",
    "malignant/malignant (145).png",
}

rows = []

for label in ["benign", "malignant", "normal"]:
    for image in sorted((DATASET / label).glob("*.png")):
        if "_mask" in image.stem.lower():
            continue

        relative_path = image.relative_to(DATASET).as_posix()

        rows.append({
            "image_path": relative_path,
            "label": label,
            "status": (
                "excluded"
                if relative_path in EXCLUDED
                else "included"
            ),
        })

output_file = OUTPUT / "busi_manifest.csv"

with open(output_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f, fieldnames=["image_path", "label", "status"]
    )
    writer.writeheader()
    writer.writerows(rows)

included = [r for r in rows if r["status"] == "included"]
excluded = [r for r in rows if r["status"] == "excluded"]

print("Original images:", len(rows))
print("Included images:", len(included))
print("Excluded images:", len(excluded))

for label in ["benign", "malignant", "normal"]:
    count = sum(r["label"] == label for r in included)
    print(f"{label}: {count}")

print("Manifest saved:", output_file)
