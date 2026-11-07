
from pathlib import Path
import csv

PROJECT = Path(__file__).resolve().parents[1]
PROCESSED = PROJECT / "data" / "processed"

INPUT = PROCESSED / "busi_similar_pairs_review.csv"
OUTPUT = PROCESSED / "busi_cross_label_review.csv"

with open(INPUT, newline="", encoding="utf-8") as f:
    pairs = list(csv.DictReader(f))

conflicts = []

for pair in pairs:
    if pair["label_1"] != pair["label_2"]:
        conflicts.append({
            **pair,
            "review_status": "needs_manual_review"
        })

conflicts.sort(key=lambda p: int(p["hash_distance"]))

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    fields = [
        "image_1", "label_1",
        "image_2", "label_2",
        "hash_distance", "review_status"
    ]

    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(conflicts)

print("BUSI CONFLICT REVIEW")
print("-" * 45)
print("Total candidate pairs:", len(pairs))
print("Cross-label candidate pairs:", len(conflicts))

print("\nFirst 10 cross-label candidates:")

for pair in conflicts[:10]:
    print(
        pair["image_1"], "<->",
        pair["image_2"],
        "| Distance:", pair["hash_distance"]
    )

print("\nReview report saved:", OUTPUT)
