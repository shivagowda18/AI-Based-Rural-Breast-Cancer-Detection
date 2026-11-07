
# BUSI Dataset Quality and Split Audit

## Original Dataset
- Ultrasound images: 780
- Segmentation masks: 798
- Classes: Normal, Benign, Malignant
- Corrupted images detected: 0

## Duplicate and Similarity Analysis
- Exact duplicate groups detected: 1
- Exact conflicting-label images excluded: 2
- dHash similarity candidate pairs: 158
- Candidate similarity groups: 113
- Cross-label candidate groups: 5
- Additional images provisionally excluded: 12
- Total excluded images: 14

## Reviewed Dataset
- Total retained: 766
- Benign: 429
- Malignant: 206
- Normal: 131

## Dataset Split
- Random seed: 42
- Training: 536
- Validation: 115
- Testing: 115
- Flagged similarity pairs crossing splits: 0

## Important Limitations
- Patient identifiers were not available for
  verifying patient-independent splitting.
- Perceptual hash matches are similarity
  candidates, not confirmed patient matches.
- Conflicting-label exclusions are provisional.
- The dataset has class imbalance.
- Image dimensions vary.
- Original images remain unchanged.

## Planned Safeguards
- Aspect-ratio-aware image preprocessing.
- Augmentation and class balancing on
  training data only.
- Evaluation of malignant sensitivity,
  macro-F1 and confusion matrices.
- External validation when feasible.
- No clinical diagnostic claims without
  appropriate validation.
