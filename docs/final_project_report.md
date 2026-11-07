# AI-Based Rural Breast Cancer Detection

**Complete Academic Project Report — Consolidated Draft**
**Project:** PS:51 — AI-Based Rural Breast Cancer Detection
**Scope:** Controlled research prototype, not a medical diagnostic product

## Abstract

This project develops a research-oriented web application that combines breast ultrasound image classification, visual explanation of model predictions, and multilingual breast-health education. The application uses a React and TypeScript frontend, a Python FastAPI backend, and a PyTorch MobileNetV3-Small classifier to distinguish three research labels: benign, malignant, and normal. Grad-CAM heatmaps show image regions that influence individual predictions. Separate educational modules provide breast-health awareness, symptom guidance, and risk-factor information in English, Kannada, and Hindi.

The BUSI dataset originally contained 780 ultrasound images. Following a documented quality and similarity audit, 766 images were retained for model development and partitioned into 536 training, 115 validation, and 115 held-out test images. On the held-out test set, the selected MobileNetV3-Small model achieved 77.39% accuracy, 76.87% macro F1-score, and 74.19% malignant recall. It misclassified eight of 31 malignant examples, demonstrating a substantial safety limitation. For a controlled demonstration, the backend restricts AI analysis to exact image fingerprints from the original BUSI dataset. This restriction identifies approved files rather than recognizing arbitrary ultrasound scans.

The prototype demonstrates end-to-end research software integration and multilingual educational access. It is **not clinically validated** and must not be used for independent breast cancer screening, medical diagnosis, or decisions to delay clinical care.

---

## Chapter 1 — Introduction

### 1.1 Background

Breast cancer assessment relies on professional clinical evaluation and, when indicated, medical imaging such as ultrasound and mammography. Ultrasound helps clinicians examine breast abnormalities, but image interpretation requires expertise. Deep learning is being investigated as a research approach for identifying patterns in ultrasound images. Explainable AI methods, including Grad-CAM, can help visualize which parts of an image influence a classifier; they do not establish medically verified lesion boundaries.

For users in rural or underserved settings, language, access to specialist services, device constraints, and health-information literacy may affect access to breast-health information. A web-based educational interface can make general awareness information easier to reach. However, a website cannot acquire a medical ultrasound image using an ordinary phone camera, and classification software cannot replace an ultrasound examination or professional assessment.

### 1.2 Problem Statement

Design and evaluate an academic research prototype that integrates a lightweight breast ultrasound classifier with explainable AI and multilingual breast-health guidance in a mobile-responsive web application. The ultrasound image-analysis pathway must remain distinct from the symptom-awareness pathway, and all outputs must communicate their research-only status.

### 1.3 Objectives

1. Audit and prepare the BUSI breast ultrasound dataset for reproducible experimentation.
2. Train and compare lightweight transfer-learning models for three-class image classification.
3. Evaluate the selected model on an untouched held-out test set, including malignant recall and confusion-matrix errors.
4. Generate Grad-CAM visualizations to illustrate model attention.
5. Integrate prediction, visualization, and image-format validation using FastAPI endpoints.
6. Develop a React interface with English, Kannada, and Hindi content, basic mobile responsiveness, and educational guidance.
7. Add controlled input restrictions, privacy-conscious handling, warnings, and automated software tests.
8. Document limitations, technical architecture, evaluation results, and future improvements.

### 1.4 Project Scope

The implemented prototype accepts selected JPG/PNG files for basic file validation. Actual AI prediction and Grad-CAM are restricted to exact BUSI demonstration files that match a local SHA-256 allowlist. The application also provides breast-health awareness and general symptom/risk-factor information. It does **not** generate a validated individual cancer-risk score, provide a diagnosis, perform lesion segmentation, obtain medical scans, or support unrestricted clinical uploads.

---

## Chapter 2 — Literature Survey

### 2.1 Overview

The reviewed literature explores transfer learning, image classification, segmentation, and explainable AI for breast ultrasound analysis. Three papers are especially relevant to the architecture choices and limitations of this prototype. Their published metrics refer to the authors' own datasets, task definitions, and validation protocols; those metrics are not directly comparable with our results.

### 2.2 Latha et al. (2024): EfficientNet-B7 and Explainable AI

Latha and colleagues investigated three-class breast ultrasound classification using EfficientNet-B7 on the BUSI dataset. Their work describes preprocessing, augmentation, fine-tuning, early stopping, and Grad-CAM explanations. The paper reports **99.14% classification accuracy** in its experimental setting [2]. The study is relevant because it demonstrates a classification-plus-explainability workflow. Our project uses a smaller MobileNetV3-Small architecture for a lightweight demonstration and obtained substantially lower held-out test performance under its own evaluation procedure. The published result does not validate our system.

### 2.3 Abbadi et al. (2025): Multi-Dataset Transfer Learning

Abbadi and colleagues compared classical machine-learning methods with deep architectures such as ResNet-18, GoogLeNet, and EfficientNet-B0. Their preprint discusses BUSI, BUS-BRA, and other breast ultrasound datasets, preprocessing, Grad-CAM, and generalization. The authors report a **99.7% headline accuracy for ResNet-18** and describe a separate external-image evaluation with **95.2% accuracy** [3]. The paper underscores the importance of model comparisons and testing beyond a single source. Its unusually high reported results should be read in the context of the authors' specific experimental protocol, rather than assumed to generalize to our deployment.

### 2.4 Bruno et al. (2025): Dual-Stage Segmentation and Classification

Bruno, Macrì, and Dodaro proposed a modular two-stage system: first segment breast masses, then classify extracted regions as benign or malignant. They evaluated segmentation backbones and classifiers including MobileNetV3-Small and EfficientNet-B0. In their reported **Scenario A**, the approach achieved **95.2% binary classification accuracy** and a MobileNetV3-Small configuration achieved **0.990 AUC** in their ROI-based classification experiments [4]. Their setting differs from our **three-class, image-level classification without a segmentation stage**, so direct accuracy rankings would be misleading. Their work motivates lightweight classifier evaluation and highlights external-domain performance considerations.

### 2.5 Comparison and Research Gap

| Study | Main method | Reported finding | Difference from this project |
|---|---|---|---|
| Latha et al. [2] | EfficientNet-B7 + Grad-CAM | 99.14% accuracy, paper-specific setting | Larger architecture; our focus includes lightweight integration and education |
| Abbadi et al. [3] | Multi-model transfer learning | ResNet-18 headline accuracy 99.7% | Different datasets and evaluation; our test outcomes cannot be equated |
| Bruno et al. [4] | Segmentation then binary ROI classification | Scenario A accuracy 95.2% | Our pipeline has no segmentation and uses three classes |
| Present project | MobileNetV3-Small + Grad-CAM | 77.39% held-out test accuracy | Integrated multilingual academic demo; no clinical validation |

The project addresses a **software-integration and educational-accessibility gap**: joining a lightweight research classifier with a browser interface, explainability, three-language awareness material, and an explicit controlled-input policy. It does not claim a new clinical diagnostic breakthrough or superior medical accuracy.

---

## Chapter 3 — Existing System and Research Gap

### 3.1 Existing Clinical and Research Approaches

Clinical breast assessment may involve history-taking, physical examination, professional ultrasound interpretation, mammography, and tissue sampling when indicated. Existing AI research systems commonly study CNN classifiers, lesion segmentation, or hybrid workflows. Image-only research classifiers normally require an already acquired medical scan.

### 3.2 Challenges

- **Data quality and representation:** Small datasets, class imbalance, possible duplicates, and incomplete patient metadata can distort evaluation.
- **Generalization:** Models trained on one dataset may perform differently with unfamiliar scanners, acquisition methods, and patient populations.
- **Missed malignant cases:** False negatives are especially concerning; model accuracy alone is an insufficient evaluation summary.
- **Compute and usability:** Resource-intensive architectures can complicate low-cost demonstrations and deployment.
- **Interpretability:** Prediction labels alone provide little insight into model attention; Grad-CAM is useful but limited.
- **Accessibility:** Educational material may be less useful without local-language support and phone-friendly design.
- **Input safety:** File validation cannot determine whether an image is an appropriate breast ultrasound scan.

### 3.3 Identified Gap and Proposed Response

The application combines separate pathways for (a) controlled ultrasound-image analysis and (b) general breast-health education. A small neural network performs research classification, and Grad-CAM visualizes influential regions. The frontend displays medical cautions and supports English, Kannada, and Hindi. The software rejects files not in the approved BUSI demonstration set before inference. The aim is an understandable, reproducible **academic prototype**, rather than a deployable clinical tool.

### 3.4 Boundaries

The app cannot classify a phone photograph into a meaningful breast-cancer category, does not obtain ultrasound data from phones, does not verify arbitrary external scans, and cannot determine whether an individual needs screening from the educational questionnaire. No validated symptom-based cancer-risk prediction model has been built.

---

## Chapter 4 — Proposed System and Architecture

### 4.1 Architecture Overview

The system has a **React/TypeScript frontend**, a **FastAPI backend**, and **PyTorch services** for MobileNetV3-Small prediction and Grad-CAM. The frontend communicates with API routes under `/api`. In development, Vite proxies `/api` traffic to FastAPI. In local demo mode (`APP_ENV=demo`), FastAPI serves the built frontend and API at the same `127.0.0.1:8000` origin.

### 4.2 Major Components

| Component | Role |
|---|---|
| React interface | Image selection, preview, language selection, warnings, results, educational modules |
| Upload-validation API | Check MIME type, file size, image integrity, actual format, and pixel dimensions |
| SHA-256 allowlist guard | Permit AI requests only for exact approved BUSI example files |
| MobileNetV3-Small service | Run pretrained/fine-tuned three-class research inference |
| Grad-CAM service | Generate an in-memory PNG overlay indicating model attention |
| Educational components | Breast-awareness content, symptom guidance, and risk-factor information |
| Model checkpoint | Store selected trained model weights and preprocessing parameters |

### 4.3 Data Flow

1. The user selects a JPG or PNG image; the browser shows a local preview.
2. Basic client-side type/size checks are performed, and the image-selection state clears prior results.
3. A standalone upload-validation request can confirm file properties; it **does not** establish ultrasound suitability.
4. For prediction or explanation, the user must check a confirmation box. This is a UI safeguard, not objective image verification.
5. FastAPI checks the incoming file size, format, dimensions, and integrity.
6. The backend computes SHA-256 and rejects non-allowlisted files with HTTP 422.
7. For an allowed prediction request, MobileNetV3-Small returns class scores and a non-diagnostic notice.
8. For an allowed explanation request, Grad-CAM returns a PNG heatmap without intentionally saving it to persistent storage.
9. React renders the result or a clear rejection message. Symptom and awareness modules remain separate from image analysis.

### 4.4 API Endpoints

| HTTP method and path | Function | Main output |
|---|---|---|
| `GET /api/health` | Server status | JSON health status |
| `POST /api/images/upload` | File validation only | Format, image dimensions, file size, `stored: false` |
| `POST /api/predict` | Allowlisted image prediction | Research class, scores, warning |
| `POST /api/explain` | Allowlisted Grad-CAM | PNG overlay and predicted-class header |

The backend sets `Cache-Control: no-store` on image-related API responses and `X-Content-Type-Options: nosniff`. There is no established authentication or rate limiting for unrestricted public access.

### 4.5 System Diagrams

The following separately saved diagrams document the same implementation and can be inserted as figures when the report is formatted:

- System architecture: `docs/system_architecture.md`
- System flowchart: `docs/system_flowchart.md`
- UML sequence diagram: `docs/system_uml.md`
- DFD Level 0 and Level 1: `docs/system_dfd.md`

---

## Chapter 5 — Dataset and Methodology

### 5.1 Dataset

The project uses the BUSI breast ultrasound image dataset [1]. The available source folder contained **780 original ultrasound images** across three class folders, plus **798 segmentation-mask files**. The observed original class counts were 437 benign, 210 malignant, and 133 normal. Masks were available as research annotations but were **not** used as outputs of a lesion-segmentation module in this deployed prototype.

### 5.2 Quality and Similarity Audit

No corrupted original images were detected. The audit found one exact duplicate group, two conflicting-label exact images provisionally excluded, 158 perceptual-hash candidate pairs, 113 candidate similarity groups, and five cross-label candidate groups. Twelve additional images were provisionally excluded, for **14 exclusions overall**. Similarity does not prove two images belong to the same patient, and exclusions were not independently clinically adjudicated.

The retained modeling dataset contains **766 images**: benign 429, malignant 206, and normal 131. The split uses random seed 42 and similarity-aware grouping. Flagged similarity candidates were not split across subsets, but patient identifiers were unavailable, so patient-independent partitions cannot be guaranteed.

| Split | Images |
|---|---:|
| Training | 536 |
| Validation | 115 |
| Held-out testing | 115 |
| **Total** | **766** |

### 5.3 Preprocessing

Images were converted to RGB, resized while preserving aspect ratio, padded to **224 × 224 pixels**, and normalized using ImageNet channel mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`. Training-only augmentation used horizontal flips and small rotations (approximately ±7°). Class-weighted training addressed the unequal label distribution. Validation and test images did not receive training augmentation.

### 5.4 Model Selection

Two pretrained transfer-learning architectures were evaluated: **MobileNetV3-Small** and **EfficientNet-B0**. The MobileNetV3-Small baseline achieved **83.48% validation accuracy** and approximately **83.53% validation macro F1**, compared with **72.17% accuracy** and approximately **71.71% macro F1** for EfficientNet-B0 in the recorded validation experiments. A later fine-tuning experiment did not improve the selected baseline, so the validation-selected MobileNetV3-Small checkpoint was retained. The selected checkpoint was saved at epoch 3 with validation loss approximately 0.4937.

In the recorded local CPU benchmark (excluding image input and preprocessing overhead), MobileNetV3-Small had a checkpoint size around **5.93 MiB** and median inference time around **15.61 ms**; EfficientNet-B0 had a checkpoint size around **15.59 MiB** and median time around **40.60 ms**. These measurements are environment-specific and are not mobile-device or clinical latency guarantees.

### 5.5 Held-Out Evaluation Protocol

The final chosen MobileNetV3-Small checkpoint was evaluated once on a held-out 115-image test partition. Reported metrics include overall accuracy, per-class precision, recall, F1-score, macro F1-score, and confusion matrix. The model should **not** be tuned again using these test results, because doing so would compromise the independence of the final evaluation.

### 5.6 Controlled Demonstration Input Policy

A file of SHA-256 fingerprints was generated from 780 original BUSI source images, yielding **779 unique approved fingerprints**. This demo allowlist can include source images that were provisionally excluded from the 766-image modeling set; therefore, allowlist membership must **not** be confused with validation-split membership, expert medical approval, or clinical suitability. Nonmatching files receive HTTP 422 before inference. Arbitrary ultrasound images, including valid scans from another dataset, will be rejected unless explicitly approved through a separately justified process.

---

## Chapter 6 — System Implementation

### 6.1 Frontend

The user interface is built with React, TypeScript, Vite, and CSS. It provides navigation, image preview, upload validation, model prediction, Grad-CAM overlay, medical cautions, and language selection. CSS media queries reorganize navigation, content cards, and upload controls for small screens. Responsive browser checks have been performed; full real-device accessibility testing remains pending.

### 6.2 Multilingual Health Education

English, Kannada, and Hindi translations are available for main interface areas and educational modules. Breast-health awareness covers possible warning signs, familiarity with normal breast changes, when to seek healthcare advice, and links to medical resources. Symptom guidance asks about a new lump/swelling, nipple discharge, skin/nipple changes, and persistent pain, then provides **general educational guidance**, not a diagnosis. Risk-factor awareness covers selected nonmodifiable and modifiable factors and encourages professional discussion where appropriate. Questionnaire answers are managed in the browser interface; the current implementation has no persistent patient questionnaire database.

Translations and educational content require independent clinical and language review before broader distribution. A report of no symptoms does not rule out breast cancer.

### 6.3 Backend and AI Integration

The FastAPI backend uses Pillow to check uploaded image files (PNG/JPEG, **10 MiB** maximum, **20 million pixels** maximum). The prediction endpoint loads the selected checkpoint into a cached PyTorch model and performs inference in memory. The Grad-CAM endpoint uses model features and gradients to generate a PNG overlay; the API returns its bytes rather than intentionally saving the uploaded image or generated heatmap to disk.

The standalone Grad-CAM command-line utility can optionally save an output file when explicitly requested. FastAPI upload handling can use temporary disk-backed buffers, so this behavior should not be described as a guarantee that images never touch disk.

### 6.4 Input Rejection and User Feedback

Prediction and Grad-CAM share a SHA-256 approved-file restriction. Original BUSI examples are accepted; unapproved files receive HTTP 422. The frontend presents a dedicated message in English, Kannada, or Hindi. When the selected image changes, previous predictions, heatmaps, errors, and the checkbox state are cleared. The image-confirmation checkbox reduces accidental use but cannot itself verify medical-image suitability.

### 6.5 Local Demonstration Setup

For development, run FastAPI and Vite separately, with Vite proxying `/api` to port 8000. For the consolidated local demo, first run `npm run build` in `frontend`, then start FastAPI from `backend` with `APP_ENV=demo`. The demo runs on `http://127.0.0.1:8000/` and serves the compiled frontend and API together. The model checkpoint and approved fingerprint file must be present locally. This arrangement was tested as a **localhost research demo**, not a production public website.

---

## Chapter 7 — Testing, Results and Discussion

### 7.1 Automated Software Tests

The recorded backend pytest suite included **33 passing tests**: nine upload-validation tests, ten prediction-route tests, ten Grad-CAM-route tests, and four approved-image rejection regression tests. Some endpoint tests mock inference and allowlist checks to isolate API behaviors; they are not replacements for medical or predictive-performance evaluation. A separate smoke test showed approved BUSI image prediction and Grad-CAM functioning end to end. Frontend `npm run lint` and `npm run build` also completed successfully in the recorded checks.

### 7.2 Browser and Integration Tests

The browser tests verified successful prediction and Grad-CAM generation for original BUSI examples including `benign (2).png`, `malignant (2).png`, `normal (1).png`, and `benign (87).png`. An unrelated JPG photograph was rejected by both AI endpoints with HTTP 422, and the frontend displayed a translated restriction message. Switching images cleared the old prediction and heatmap, reset the confirmation checkbox, and refreshed the preview. The consolidated FastAPI demo server served the website and processed a BUSI example at `127.0.0.1:8000`.

These examples confirm selected **functional workflows** only. They do not provide additional independent statistical evidence of diagnostic performance.

### 7.3 Held-Out Model Results

The evaluation dataset contained **115 held-out BUSI images**, of which **89 were classified correctly** and **26 incorrectly**.

| Class | Support | Precision | Recall | F1-score |
|---|---:|---:|---:|---:|
| Benign | 64 | 83.05% | 76.56% | 79.67% |
| Malignant | 31 | 69.70% | 74.19% | 71.88% |
| Normal | 20 | 73.91% | 85.00% | 79.07% |

**Overall accuracy:** 77.39%. **Macro F1-score:** 76.87%.

### 7.4 Confusion Matrix

Rows represent actual labels; columns represent predicted labels.

| Actual / Predicted | Benign | Malignant | Normal |
|---|---:|---:|---:|
| Benign | 49 | 10 | 5 |
| Malignant | 7 | 23 | 1 |
| Normal | 3 | 0 | 17 |

Seven malignant images were predicted benign, and one malignant image was predicted normal. Therefore, the classifier **missed eight of 31 malignant examples** in this test partition. Ten benign examples were flagged malignant, illustrating the opposite type of classification error.

### 7.5 Interpretation

The test performance is substantially below what would be needed to justify independent screening. A small single-source dataset, unknown patient overlap, class imbalance, and no external clinical validation limit confidence in generalization. Softmax values indicate relative model outputs but are **not calibrated individual cancer probabilities**. Grad-CAM overlays indicate image regions contributing to predictions, not medically proven tumor segmentation or localization.

### 7.6 Security and Privacy Checks

Implemented controls include file integrity/size/dimension checks, an allowlist for image-analysis requests, response headers (`nosniff`, `no-store` for image API responses), and a `stored: false` API response where appropriate. A preliminary source scan did not reveal common hardcoded-secret patterns in scanned directories. Git ignore rules exclude raw datasets, trained checkpoints, and generated explanation images from normal staging. These are **basic controls**, not a comprehensive security audit; the demo has no verified production authentication, rate limiting, TLS termination, or full logging/privacy assessment.

---

## Chapter 8 — Limitations and Future Scope

### 8.1 Limitations

1. **Clinical readiness:** No prospective clinical validation or regulatory assessment has been performed. The system must not be used for real clinical decisions.
2. **Missed malignant cases:** Eight of 31 malignant test examples were misclassified.
3. **Data limitations:** BUSI is relatively small, class-imbalanced, and may not represent all scanners, patients, or settings. Patient independence was not verifiable.
4. **Restricted inputs:** The SHA-256 allowlist approves exact BUSI examples only; it is not an ultrasound-type detector.
5. **No medical imaging acquisition:** The software requires a previously acquired ultrasound scan and cannot create one from a camera photograph.
6. **Limited explanatory validity:** Grad-CAM has not been independently validated as a lesion-localization tool.
7. **Educational, not diagnostic guidance:** The symptom questionnaire and risk cards do not calculate a validated cancer risk or determine whether examination is unnecessary.
8. **Security and usability gaps:** Full accessibility review, independent translation review, public-hosting security, and privacy-policy work remain.
9. **Dependency and distribution constraints:** The model checkpoint and approved hash file must be available for local demos; raw medical-image datasets require appropriate licensing and handling.

### 8.2 Possible Future Improvements

- Obtain appropriately licensed, diverse ultrasound datasets and verified patient-level groupings.
- Conduct independent external validation and evaluate performance by scanner, institution, and population before any clinical claims.
- Study calibrated model outputs, malignant-sensitivity tradeoffs, uncertainty handling, and expert-reviewed failure analyses.
- Research a validated image-suitability mechanism for accepting new ultrasound images; do not rely on grayscale-only heuristics.
- Explore independently validated lesion segmentation if the project later requires lesion localization rather than attention visualization.
- Obtain qualified medical review of awareness materials and professional translations in all three languages.
- Evaluate true low-bandwidth mobile use, readability, keyboard navigation, screen-reader compatibility, and deployment costs.
- Add authentication, access control, rate limiting, HTTPS, retention rules, consent processes, and security tests before any public pilot.

### 8.3 Ethical and Safety Considerations

Both false-negative and false-positive predictions can be harmful if misunderstood. The interface should preserve non-diagnostic notices near AI outputs, reject unsupported files, and direct users to qualified healthcare professionals for breast symptoms or concerns. Dataset labels and published research metrics should not be represented as patient-specific medical advice. Academic demonstrations should use permitted, non-identifying examples.

---

## Chapter 9 — Conclusion

The AI-Based Rural Breast Cancer Detection project demonstrates an integrated academic workflow combining a lightweight breast ultrasound classifier, Grad-CAM explanation, a React/FastAPI interface, and multilingual breast-health awareness. The project included a documented BUSI dataset audit, a comparison of MobileNetV3-Small and EfficientNet-B0, an untouched held-out test evaluation, a controlled BUSI file allowlist, and software integration tests. The selected model achieved **77.39% held-out accuracy** and **74.19% malignant recall**, missing eight malignant examples out of 31. These findings establish important limitations rather than clinical readiness.

The current deliverable is a functioning **controlled local research demonstration** with educational capabilities. It is not a diagnostic service, is not able to analyze arbitrary external ultrasound scans, and must not replace professional examination, screening, or treatment decisions. Future work should prioritize independent validation, input suitability, clinician-reviewed information, broader accessibility, and secure deployment.

---

## References

[1] W. Al-Dhabyani, M. Gomaa, H. Khaled, and A. Fahmy, “Dataset of breast ultrasound images,” *Data in Brief*, vol. 28, 104863, 2020. https://doi.org/10.1016/j.dib.2019.104863

[2] M. Latha et al., “Revolutionizing breast ultrasound diagnostics with EfficientNet-B7 and Explainable AI,” *BMC Medical Imaging*, vol. 24, article 230, 2024. https://doi.org/10.1186/s12880-024-01404-3

[3] M. Abbadi, Y. Himeur, S. Atalla, and W. Mansoor, “Interpretable Deep Transfer Learning for Breast Ultrasound Cancer Detection: A Multi-Dataset Study,” *arXiv* preprint arXiv:2509.05004v1, 2025. https://arxiv.org/abs/2509.05004

[4] P. Bruno, M. Macrì, and C. Dodaro, “A Dual-stage Deep Learning Framework for Breast Ultrasound Image Segmentation and Classification,” *Journal of Medical Systems*, vol. 49, article 162, 2025. https://doi.org/10.1007/s10916-025-02298-6

### Supporting project records

- `docs/busi_dataset_audit.md` — dataset exclusions and split caveats.
- `docs/model_evaluation.md` — class-wise test metrics and confusion matrix.
- `docs/literature_review.md` — longer review of the three uploaded papers.
- `docs/system_architecture.md`, `docs/system_flowchart.md`, `docs/system_uml.md`, and `docs/system_dfd.md` — saved technical diagrams.
- `docs/api_documentation.md` and `docs/testing_and_validation.md` — API and test documentation.

**Document status:** Consolidated content draft. Insert figures/screenshots and required institution-specific title-page formatting before formal submission. No clinical validation or certification is claimed.
