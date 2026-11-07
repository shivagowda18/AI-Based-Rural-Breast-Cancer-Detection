
from pathlib import Path
from collections import defaultdict
import csv

PROJECT = Path(__file__).resolve().parents[1]
PROCESSED = PROJECT / "data" / "processed"

MANIFEST = PROCESSED / "busi_manifest.csv"
PAIRS = PROCESSED / "busi_similar_pairs_review.csv"
OUTPUT = PROCESSED / "busi_similarity_groups.csv"

with open(MANIFEST, newline="", encoding="utf-8") as f:
    records = [
        row for row in csv.DictReader(f)
        if row["status"] == "included"
    ]

with open(PAIRS, newline="", encoding="utf-8") as f:
    pairs = list(csv.DictReader(f))

labels = {r["image_path"]: r["label"] for r in records}
parent = {path: path for path in labels}


def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]


def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[rb] = ra


for pair in pairs:
    a = pair["image_1"]
    b = pair["image_2"]
    union(a, b)

groups = defaultdict(list)

for path in labels:
    groups[find(path)].append(path)

candidate_groups = [
    sorted(members)
    for members in groups.values()
    if len(members) > 1
]

candidate_groups.sort(key=lambda g: (-len(g), g[0]))

rows = []
conflict_count = 0
conflict_images = set()

for index, members in enumerate(candidate_groups, 1):
    group_id = f"G{index:03d}"
    group_labels = {labels[p] for p in members}
    conflict = len(group_labels) > 1

    if conflict:
        conflict_count += 1
        conflict_images.update(members)

    for path in members:
        rows.append({
            "group_id": group_id,
            "image_path": path,
            "label": labels[path],
            "group_size": len(members),
            "cross_label_conflict": conflict,
            "review_status": "needs_review",
        })

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=[
            "group_id",
            "image_path",
            "label",
            "group_size",
            "cross_label_conflict",
            "review_status",
        ],
    )
    writer.writeheader()
    writer.writerows(rows)

print("BUSI SIMILARITY GROUP AUDIT")
print("-" * 45)
print("Images analyzed:", len(records))
print("Candidate pairs:", len(pairs))
print("Candidate groups:", len(candidate_groups))
print("Cross-label groups:", conflict_count)
print("Images in cross-label groups:", len(conflict_images))
print("Images in all candidate groups:", len(rows))
print("Report saved:", OUTPUT)
print("Grouping completed.")
