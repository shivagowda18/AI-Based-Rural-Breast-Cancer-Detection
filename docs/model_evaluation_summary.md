
# Breast Ultrasound Model Evaluation

## Project
AI-Based Rural Breast Cancer Detection (PS:51)

## Dataset
BUSI — Breast Ultrasound Images

Images included in the prepared dataset: 766

- Training: 536
- Validation: 115
- Testing: 115

Classes: Benign, Malignant, Normal

## Models Evaluated

### MobileNetV3-Small
- Test accuracy: 77.39%
- Correct predictions: 89/115
- Malignant recall: 74.19%
- Malignant cases missed: 8/31

### EfficientNet-B0
- Test accuracy: 71.30%
- Correct predictions: 82/115
- Malignant recall: 67.74%
- Malignant cases missed: 10/31

## Comparison

MobileNetV3-Small achieved higher test accuracy
and malignant recall than EfficientNet-B0 on
the evaluated BUSI test set.

Accuracy difference: 6.09 percentage points.

MobileNetV3-Small is currently the preferred
candidate for the research prototype.

## Dataset Verification

- Duplicate image paths: 0
- Group IDs crossing data splits: 0
- Patient-level independence: Not fully verified
- Original BUSI count: Commonly reported as 780
- Prepared dataset count: 766
- Reason for excluding 14 images: To be verified

## Research Limitations

1. The test dataset contains only 115 images.
2. Both models incorrectly classified malignant images.
3. External dataset evaluation has not been completed.
4. Patient-level independence requires further verification.
5. The models are not clinically validated.
6. The application cannot replace professional diagnosis.

## Conclusion

MobileNetV3-Small demonstrated better performance
than EfficientNet-B0 under the current evaluation.

Further testing, external validation, and error
analysis are required before making broader
generalization or clinical performance claims.
