
# Breast Ultrasound AI — Model Evaluation

## 1. Selected Model

- Architecture: MobileNetV3-Small
- Task: Three-class breast ultrasound classification
- Classes: Benign, Malignant, Normal
- Dataset: BUSI
- Input size: 224 × 224 pixels
- Intended use: Academic research prototype only

## 2. Dataset Preparation

- Original ultrasound images: 780
- Excluded during quality review: 14
- Retained images: 766
- Training: 536
- Validation: 115
- Test: 115
- Random seed: 42

Similarity-aware grouping was used during splitting.
Patient-independent splitting could not be verified
because patient identifiers were unavailable.

## 3. Held-Out Test Results

- Test images: 115
- Correct predictions: 89
- Incorrect predictions: 26
- Overall accuracy: 77.39%
- Macro F1-score: 76.87%

| Class | Precision | Recall | F1-score |
|---|---:|---:|---:|
| Benign | 83.05% | 76.56% | 79.67% |
| Malignant | 69.70% | 74.19% | 71.88% |
| Normal | 73.91% | 85.00% | 79.07% |

## 4. Confusion Matrix

Rows represent actual labels.
Columns represent predicted labels.

| Actual / Predicted | Benign | Malignant | Normal |
|---|---:|---:|---:|
| Benign | 49 | 10 | 5 |
| Malignant | 7 | 23 | 1 |
| Normal | 3 | 0 | 17 |

## 5. Major Findings

- The model correctly classified 89 of 115 test images.
- It correctly identified 23 of 31 malignant images.
- Eight malignant images were misclassified.
- The small held-out test set limits confidence
  in generalization to other populations and scanners.
- Model scores are not calibrated clinical probabilities.

## 6. Explainability

Grad-CAM was implemented to visualize image
regions influencing model predictions.

Grad-CAM highlights model attention, not medically
verified cancer locations.

## 7. Input Suitability

The demonstration backend currently checks exact
image fingerprints against an approved BUSI allowlist.

This is a dataset-membership restriction, not a
general ultrasound suitability detector.

## 8. Limitations and Future Work

- Limited dataset size and class imbalance.
- Patient-independent splitting not confirmed.
- No independent external clinical validation.
- Additional image-suitability validation required.
- Performance is insufficient for standalone
  medical diagnosis or screening.

## 9. Conclusion

MobileNetV3-Small provides a lightweight academic
research baseline for breast ultrasound classification.

The prototype demonstrates preprocessing,
classification, explainability, multilingual access,
and API integration.

It is not clinically validated and must not replace
professional medical assessment.
