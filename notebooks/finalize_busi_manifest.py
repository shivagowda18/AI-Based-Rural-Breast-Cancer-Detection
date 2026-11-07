
from pathlib import Path
from collections import Counter
import csv

PROJECT = Path(__file__).resolve().parents[1]
PROCESSED = PROJECT / "data" / "processed"

MANIFEST = PROCESSED / "busi_manifest.csv"
GROUPS = PROCESSED / "busi_similarity_groups.csv"
OUTPUT = PROCESSED / "busi_manifest_reviewed.csv"

with open(MANIFEST, newline="", encoding="utf-8") as f:
    records = list(csv.DictReader(f))

with open(GROUPS, newline="", encoding="utf-8") as f:
    groups = list(csv.DictReader(f))

conflicting_images = {
    row["image_path"]
    for row in groups
    if row["cross_label_conflict"].lower() == "true"
}

assert len(records) == 780
assert len(conflicting_images) == 12

for record in records:
    if record["status"] == "excluded":
        record["exclusion_reason"] = (
            "exact_duplicate_conflicting_label"
        )

    elif record["image_path"] in conflicting_images:
        record["status"] = "excluded"
        record["exclusion_reason"] = (
            "suspected_near_duplicate_conflicting_label"
        )

    else:
        record["exclusion_reason"] = ""

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=[
            "image_path",
            "label",
            "status",
            "exclusion_reason"
        ]
    )
    writer.writeheader()
    writer.writerows(records)

included = [
    r for r in records if r["status"] == "included"
]

excluded = [
    r for r in records if r["status"] == "excluded"
]

assert len(included) == 766
assert len(excluded) == 14

print("BUSI REVIEWED MANIFEST")
print("-" * 45)
print("Original images:", len(records))
print("Included images:", len(included))
print("Excluded images:", len(excluded))

counts = Counter(r["label"] for r in included)

for label in ["normal", "benign", "malignant"]:
    print(f"{label}: {counts[label]}")

print("Saved to:", OUTPUT)
print("Manifest review completed.")
