# Literature Review and Research Gap Analysis

## PS:51 — AI-Based Rural Breast Cancer Detection

**Document type:** Literature survey for an academic research prototype
**Evidence base:** Three supplied research papers, plus the project's recorded experiments and implementation.
**Scope:** Breast ultrasound image classification, explainable AI, lightweight inference, and accessibility.
**Important qualification:** The reviewed papers report results under different datasets, label definitions, preprocessing pipelines, splits, and evaluation methods. Their reported metrics are **not directly comparable** with this project's held-out test results.

## 1. Introduction

Breast ultrasound can support the assessment of breast abnormalities, but image interpretation requires clinical expertise. The research reviewed here investigates machine-learning and deep-learning methods for classifying ultrasound images, sometimes combined with lesion segmentation and Grad-CAM explanations. Common themes are transfer learning, class imbalance, generalization across datasets, interpretability, and computational requirements.

Our project adopts a more modest objective: demonstrate a lightweight, **three-class** MobileNetV3-Small research classifier on a curated BUSI subset, with Grad-CAM, a FastAPI backend, a responsive React interface, and educational modules in English, Kannada, and Hindi. It is **not** a clinically validated breast cancer screening or diagnostic system.

## 2. Review of Selected Papers

### Paper 1 — EfficientNet-B7 with Explainable AI

**Reference:** M. Latha, P. Santhosh Kumar, R. Roopa Chandrika, T. R. Mahesh, V. Vinoth Kumar, and S. Guluwadi, “Revolutionizing breast ultrasound diagnostics with EfficientNet-B7 and Explainable AI,” *BMC Medical Imaging*, vol. 24, article 230, 2024. DOI: [10.1186/s12880-024-01404-3](https://doi.org/10.1186/s12880-024-01404-3).
**Local PDF:** `docs/research_papers/s12880-024-01404-3.pdf`.

**Objective.** Improve the three-class classification of breast ultrasound images while making deep-learning predictions more interpretable.

**Dataset and method.** The authors study the BUSI dataset (780 original images) with the classes benign, malignant, and normal. They describe a 70%/15%/15% train/validation/test division, resizing to 256 × 256, transfer learning with EfficientNet-B7, data augmentation (horizontal flipping, rotation, and color jitter), early stopping, and Grad-CAM visualization (paper pp. 5–6 and 12–15).

**Reported findings.** The article reports **99.14% classification accuracy** for EfficientNet-B7 and displays class-wise precision, recall, and F1 results and Grad-CAM examples (abstract; results section, pp. 13–15). These are the **authors' reported results**, not a benchmark replicated by our project.

**Strengths.** Directly relevant three-class BUSI classification; attention to class imbalance and interpretability; detailed model-training and evaluation discussion.

**Limitations and cautions.** EfficientNet-B7 may demand substantial computational resources; the authors note data-diversity concerns, Grad-CAM interpretation difficulties, and the need for further validation (p. 17). The provided paper does not establish that its impressive numerical results will transfer to our particular curated split, rural setting, or unseen ultrasound devices. Do not reuse its Grad-CAM images or figures in a redistributed report without checking the paper's CC BY-NC-ND 4.0 conditions.

**Relevance to our work.** Supports using transfer learning, augmentation, held-out evaluation, and Grad-CAM. Our work prioritizes a smaller MobileNetV3-Small model and openly reports lower measured performance rather than claiming comparable accuracy.

### Paper 2 — Interpretable Deep Transfer Learning: A Multi-Dataset Study

**Reference:** M. Abbadi, Y. Himeur, S. Atalla, and W. Mansoor, “Interpretable Deep Transfer Learning for Breast Ultrasound Cancer Detection: A Multi-Dataset Study,” *arXiv* preprint arXiv:2509.05004v1, 5 September 2025. [arXiv link](https://arxiv.org/abs/2509.05004).
**Local PDF:** `docs/research_papers/2509.05004v1.pdf`.

**Objective.** Compare classical machine-learning models and transfer-learned CNNs for breast ultrasound classification, with interpretability and examination of generalization.

**Dataset and method.** The preprint discusses BUSI, BUS-BRA, BrEaST-Lesions USG and other image collections. It explicitly says the principal performance results come from **BUSI and BUS-BRA**; other sources serve additional evaluation or supporting roles. It investigates SVM and KNN (handcrafted and deep features) alongside CNNs including ResNet-18, GoogLeNet, AlexNet, and EfficientNet-B0. Preprocessing includes normalization, median filtering, resizing, optional lesion-region extraction, and augmentation. Grad-CAM is used for visualization (pp. 1–3).

**Reported findings.** The authors report **99.7% accuracy for ResNet-18** in a three-class comparison (Table I, p. 5 in the PDF's pagination may differ by viewer; see the results/discussion section) and **95.2% accuracy on a separate external set**, according to their narrative. These are author-reported findings, not independently replicated results.

**Strengths.** Compares conventional and CNN-based methods, highlights malignant recall, considers domain shift, and uses external-source evaluation rather than relying solely on a single dataset.

**Limitations and cautions.** The authors acknowledge curated datasets, deployment domain shifts, the need for automated lesion localization, and limits of Grad-CAM's fine-grained explanation. **The figure titled ROC curves is visibly marked “Simulated”** in the supplied PDF; it should not be cited as an independently measured clinical ROC evaluation. The narrative's “95.2% accuracy” on “100 images” is not straightforward to interpret as a single integer-count classification accuracy; the exact computation would need clarification. The document is an **arXiv preprint**, not evidence here of peer review or independent clinical validation.

**Relevance to our work.** Motivates reporting malignant recall, class-wise errors, data-splitting limitations, and model size/latency. It also reinforces that in-domain performance is not enough to claim rural or real-world clinical suitability.

### Paper 3 — Dual-Stage Segmentation and Classification

**Reference:** P. Bruno, M. Macrì, and C. Dodaro, “A Dual-stage Deep Learning Framework for Breast Ultrasound Image Segmentation and Classification,” *Journal of Medical Systems*, vol. 49, article 162, 2025. DOI: [10.1007/s10916-025-02298-6](https://doi.org/10.1007/s10916-025-02298-6).
**Local PDF:** `docs/research_papers/s10916-025-02298-6.pdf`.

**Objective.** Develop a modular two-stage pipeline that first segments breast lesions and then classifies cropped regions as **benign or malignant**.

**Dataset and method.** The work uses BUSI and Breast-Lesions-USG. It compares segmentation configurations (including DeepLabV3+ and U-Net variants) and classification backbones such as MobileNetV3-Small and EfficientNet-B0. It describes patient-level data splitting in its experiments and training-only augmentation (pp. 3–5).

**Reported findings.** For Scenario A, the best reported segmentation setup (DeepLabV3+ with ResNet34 encoder) has **Dice 0.769** and **IoU 0.625**. The MobileNetV3-Small ROI classifier reports **AUC 0.990, F1 0.944, precision 0.966, and recall 0.924**, while the complete pipeline's **binary classification accuracy is 0.952** (Tables 1–3, pp. 5–9). In the cross-dataset Scenario C, classification accuracy declines to **0.802**, F1 to **0.795**, and AUC to **0.876** (Table 3, p. 9).

**Strengths.** Evaluates segmentation separately from classification; tests cross-dataset transfer; provides detailed performance measures; demonstrates that MobileNetV3-Small can be useful as a lightweight backbone.

**Limitations and cautions.** The classifier is evaluated on **segmented/cropped lesion regions** and only **two labels**. Our current prototype analyzes the full ultrasound image and predicts **three labels**. Its 95.2% binary accuracy cannot be compared numerically as an equal-task benchmark to our 77.39% three-class accuracy. Performance degradation in Scenario C highlights the domain-shift problem; implementing robust lesion segmentation would add complexity and would require separate validation.

**Relevance to our work.** Directly supports exploring MobileNetV3-Small as a lightweight architecture, while showing that ROI segmentation is a potential **future enhancement**, not an existing feature of our project.

## 3. Comparative Literature Table

| Study | Classification task | Main approach | Author-reported key result | Important comparison caveat |
|---|---|---|---|---|
| Latha et al. (2024) | Three-class BUSI | EfficientNet-B7 + augmentation + Grad-CAM | 99.14% accuracy | Different split/training conditions; computationally larger architecture |
| Abbadi et al. (2025, preprint) | Three-class, mainly BUSI/BUS-BRA | ML versus transfer-learned CNNs; ResNet-18; Grad-CAM | 99.7% ResNet-18 accuracy | Preprint; different evaluation protocol; simulated ROC figure |
| Bruno et al. (2025) | **Binary**, cropped lesion ROIs | Segmentation then MobileNetV3-Small / other classifiers | 95.2% binary accuracy in Scenario A; MobileNetV3-Small F1 0.944 | Requires segmentation; not the same three-class task |
| **Our project** | **Three-class**, full BUSI images | MobileNetV3-Small + Grad-CAM + multilingual educational interface | **77.39% test accuracy; 76.87% macro F1; 74.19% malignant recall** | 115-image local held-out test; no independent external/patient-level validation |

**Comparison rule:** Do **not** interpret the differences between the percentages as evidence that one implementation is better or worse under identical conditions. Dataset membership, patient separation, preprocessing, masking/ROI use, label counts, and evaluation splits vary substantially.

## 4. Identified Research and Implementation Gaps

1. **Clinical generalization remains unresolved.** The reviewed studies themselves discuss external-source degradation or the need for broader validation. Our prototype has no external clinical validation, and patient-independent splitting could not be confirmed.
2. **Lightweight access versus high model complexity.** High-capacity models can require more resources. Our selected MobileNetV3-Small checkpoint is approximately **5.93 MiB** and had approximately **15.61 ms median CPU model-inference latency** in our recorded local benchmark (excluding file I/O and image preprocessing). These measurements are hardware- and setup-specific, not phone benchmarks.
3. **Explainability is not clinical localization.** Grad-CAM explains a model's spatial response; it does not independently confirm lesion boundaries or pathology. We implement a heatmap but not a validated lesion-segmentation model.
4. **Health guidance and accessibility are separate from image classification.** The reviewed algorithmic papers focus mainly on medical-image modeling. Our integrated academic demonstrator additionally provides multilingual awareness, symptom guidance, and risk-factor education. We have **not** evaluated their clinical effectiveness, translation quality with qualified reviewers, or usability with rural users.
5. **Input safety remains a limitation.** The API currently uses a SHA-256 allowlist of exact original BUSI files for controlled demonstration. This protects against arbitrary unapproved photographs but is **not** a general medical-image suitability detector; it cannot validate new clinical scans.
6. **Sensitivity matters more than a single accuracy number.** Our model misclassified **8 of 31 malignant held-out examples**. This is a significant reason not to frame the prototype as independent screening, even if a particular example receives a high model score.

## 5. How Our Project Differs

| Area | Current project implementation | What is **not** claimed |
|---|---|---|
| Research model | MobileNetV3-Small, full-image, benign/malignant/normal | No clinical-grade detection or calibrated risk estimate |
| Dataset | 766 curated BUSI images; 536 train, 115 validation, 115 test | No verified patient-independent or multisite external split |
| Evaluation | Held-out accuracy, per-class metrics, confusion matrix, CPU benchmark | No direct head-to-head replication of the reviewed papers |
| Explainability | Grad-CAM PNG overlays | No validated tumor segmentation/localization |
| Web application | React/TypeScript + FastAPI, single-server local demo mode | No public healthcare deployment or production security certification |
| Accessibility | English/Kannada/Hindi educational content and mobile-responsive UI | No measured rural-user outcomes, formal accessibility audit, or expert translation validation |
| Input guard | Exact BUSI file SHA-256 allowlist | No automatic recognition of arbitrary ultrasound scans |

## 6. Our Experimental Findings and Their Meaning

The project used the BUSI image collection and audited possible duplicates or visually similar images. Fourteen originals were provisionally excluded from model development, retaining **766 images**. Similarity-aware grouping prevented *flagged* similarity pairs from crossing train, validation, and test splits, but patient identities were unavailable.

The selected MobileNetV3-Small checkpoint achieved on the local 115-image held-out test set:

- **Accuracy:** 77.39% (89/115)
- **Macro F1:** 76.87%
- **Malignant precision:** 69.70%
- **Malignant recall:** 74.19% (23/31)
- **Missed malignant examples:** 8/31

The local comparison model EfficientNet-B0 was explored on the validation set; the MobileNetV3-Small baseline was selected using validation performance, **not** the held-out test results. The held-out test results were recorded after model selection. Because false-negative malignant predictions remain substantial, the system must not be used to reassure patients or guide actual clinical decisions.

For full class-wise figures and the confusion matrix see `docs/model_evaluation.md`; for duplicate and split limitations see `docs/busi_dataset_audit.md`.

## 7. Conclusion

The three selected papers show why transfer learning, data management, interpretability, segmentation, model efficiency, and external validation matter in breast ultrasound research. They also illustrate why unusually high published accuracy should not be applied uncritically to a different pipeline.

Our contribution is an **integrated academic demonstration** of lightweight ultrasound classification, Grad-CAM explanations, a functioning web/API architecture, and multilingual breast-health education. The held-out evaluation and safety restrictions are documented transparently. The work is **not** a medically validated screening system, and improved dataset integrity, external validation, input-suitability assessment, clinical review, and real-user evaluation remain future work.

## 8. References and Source Traceability

1. Latha, M., et al. (2024). “Revolutionizing breast ultrasound diagnostics with EfficientNet-B7 and Explainable AI.” *BMC Medical Imaging*, **24**, 230. https://doi.org/10.1186/s12880-024-01404-3 — Uploaded source: `s12880-024-01404-3.pdf` (18 pages).
2. Abbadi, M., Himeur, Y., Atalla, S., and Mansoor, W. (2025). “Interpretable Deep Transfer Learning for Breast Ultrasound Cancer Detection: A Multi-Dataset Study.” *arXiv* preprint **2509.05004v1**. https://arxiv.org/abs/2509.05004 — Uploaded source: `2509.05004v1.pdf` (6 pages).
3. Bruno, P., Macrì, M., and Dodaro, C. (2025). “A Dual-stage Deep Learning Framework for Breast Ultrasound Image Segmentation and Classification.” *Journal of Medical Systems*, **49**, 162. https://doi.org/10.1007/s10916-025-02298-6 — Uploaded source: `s10916-025-02298-6.pdf` (11 pages).

**Source integrity note:** Figures and paragraphs from the published papers are **not reproduced** in this Markdown document. Claims attributed to those papers reflect the supplied PDFs, whereas numbers for *our project* are from its own test logs and previous dataset audit. The original BUSI dataset publication can be added as a separately verified reference when producing the final research paper.
