
from pathlib import Path
from collections import defaultdict, Counter
import csv
import random

PROJECT = Path(__file__).resolve().parents[1]
PROCESSED = PROJECT / "data" / "processed"

MANIFEST = PROCESSED / "busi_manifest_reviewed.csv"
GROUPS = PROCESSED / "busi_similarity_groups.csv"
PAIRS = PROCESSED / "busi_similar_pairs_review.csv"
OUTPUT = PROCESSED / "busi_splits.csv"

SEED = 42
RATIOS = {"train": 0.70, "val": 0.15, "test": 0.15}
CLASSES = ["normal", "benign", "malignant"]

rng = random.Random(SEED)


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


manifest = read_csv(MANIFEST)
group_rows = read_csv(GROUPS)
pair_rows = read_csv(PAIRS)

included = [
    row for row in manifest
    if row["status"] == "included"
]

assert len(included) == 766
assert len({r["image_path"] for r in included}) == 766

# Map each included image to its similarity group.
group_lookup = {}

for row in group_rows:
    group_lookup[row["image_path"]] = row["group_id"]

# Images without candidate matches become singletons.
groups = defaultdict(list)

for row in included:
    path = row["image_path"]

    group_id = group_lookup.get(
        path, "single:" + path
    )

    groups[group_id].append(row)

# Make sure no retained group has conflicting labels.
for group_id, members in groups.items():
    labels = {row["label"] for row in members}

    if len(labels) != 1:
        raise ValueError(
            f"Conflicting labels remain in {group_id}"
        )

output_rows = []

for category in CLASSES:
    category_groups = [
        (group_id, members)
        for group_id, members in groups.items()
        if members[0]["label"] == category
    ]

    rng.shuffle(category_groups)
    category_groups.sort(key=lambda item: -len(item[1]))

    total = sum(
        len(members) for _, members in category_groups
    )

    targets = {
        split: total * ratio
        for split, ratio in RATIOS.items()
    }

    counts = {split: 0 for split in RATIOS}

    for group_id, members in category_groups:
        group_size = len(members)

        # Assign the whole group to the split that
        # best preserves the intended class ratios.
        def score(candidate):
            return sum(
                (
                    counts[split]
                    + (group_size if split == candidate else 0)
                    - targets[split]
                ) ** 2 / max(targets[split], 1)
                for split in RATIOS
            )

        selected_split = min(RATIOS, key=score)
        counts[selected_split] += group_size

        for row in members:
            output_rows.append({
                "image_path": row["image_path"],
                "label": category,
                "split": selected_split,
                "group_id": group_id,
            })

# Verify every retained image appears exactly once.
assert len(output_rows) == 766

split_lookup = {
    row["image_path"]: row["split"]
    for row in output_rows
}

assert len(split_lookup) == 766

# Check that flagged similar pairs were never
# separated between training, validation and testing.
leakage_pairs = []

for pair in pair_rows:
    a, b = pair["image_1"], pair["image_2"]

    if a in split_lookup and b in split_lookup:
        if split_lookup[a] != split_lookup[b]:
            leakage_pairs.append((a, b))

assert not leakage_pairs, (
    f"Similarity pair leakage: {leakage_pairs[:5]}"
)

output_rows.sort(
    key=lambda row: (row["split"], row["label"], row["image_path"])
)

with open(OUTPUT, "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=[
            "image_path", "label", "split", "group_id"
        ]
    )
    writer.writeheader()
    writer.writerows(output_rows)

print("BUSI DATASET SPLITTING RESULTS")
print("-" * 48)

for split in RATIOS:
    subset = [
        row for row in output_rows
        if row["split"] == split
    ]

    counts = Counter(row["label"] for row in subset)

    print(f"\n{split.upper()}: {len(subset)} images")

    for category in CLASSES:
        print(f"  {category}: {counts[category]}")

print("\nTotal included images:", len(output_rows))
print("Similarity pair leakage:", len(leakage_pairs))
print("Random seed:", SEED)
print("Saved to:", OUTPUT)
print("Dataset splitting completed.")
