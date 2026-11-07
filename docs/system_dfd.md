
# Data Flow Diagrams (DFD)

## AI-Based Rural Breast Cancer Detection

## 1. DFD Level 0 — Context Diagram

This diagram shows the system as one process and its interactions with the user.

```mermaid
flowchart LR
    U["User"]

    S["0.0 AI-Based Rural Breast Cancer Detection System"]

    U -->|"Ultrasound image and analysis requests"| S
    U -->|"Language selection and symptom answers"| S

    S -->|"Image validation details"| U
    S -->|"AI classification and model scores"| U
    S -->|"Grad-CAM heatmap"| U
    S -->|"Multilingual awareness and symptom guidance"| U
```

### Explanation

The user interacts with the research application through
a browser.

Inputs include:
- Selected ultrasound image
- Image validation and analysis requests
- Language selection
- Symptom questionnaire answers

Outputs include:
- Image file validation details
- Research classification results
- Grad-CAM explanations
- Educational breast health information
- General symptom guidance

No medical diagnosis is provided.

---

## 2. DFD Level 1 — Detailed Data Flow

This diagram divides the system into its main processes.

```mermaid
flowchart TD
    U["User / Web Browser"]

    P1["1.0 React User Interface"]
    P2["2.0 Image File Validation"]
    P3["3.0 Approved Image Guard"]
    P4["4.0 MobileNetV3 Prediction"]
    P5["5.0 Grad-CAM Generation"]
    P6["6.0 Educational Guidance"]

    D1[("D1: Approved BUSI SHA-256 Hashes")]
    D2[("D2: Trained Model Checkpoint")]

    U -->|"Image, selected action and language"| P1

    P1 -->|"File validation request"| P2
    P2 -->|"Format, dimensions or validation error"| P1

    P1 -->|"Prediction or explanation request"| P3

    D1 -->|"Approved fingerprints"| P3

    P3 -->|"File not approved: HTTP 422"| P1
    P3 -->|"Approved prediction request"| P4
    P3 -->|"Approved explanation request"| P5

    D2 -->|"Model weights and configuration"| P4
    D2 -->|"Model weights and configuration"| P5

    P4 -->|"Class, model scores and notice"| P1
    P5 -->|"PNG heatmap"| P1

    P1 -->|"Language and symptom answers"| P6
    P6 -->|"Translated information and general guidance"| P1

    P1 -->|"Results and educational information"| U
```

### Explanation

**Process 1.0 — React User Interface**

Receives the user's image, selections and requests.
Displays results, explanations and educational content.

**Process 2.0 — Image File Validation**

Checks supported format, maximum upload size,
image integrity and dimensions.

The separate upload-validation endpoint reports
file properties without performing AI analysis.

**Process 3.0 — Approved Image Guard**

Checks whether the exact file fingerprint belongs
to the approved BUSI demonstration image list.

Unapproved images receive HTTP 422.

This is not a general ultrasound detector.

**Process 4.0 — MobileNetV3 Prediction**

Uses the trained model checkpoint to generate
research classification results.

Classes:
- Benign
- Malignant
- Normal

**Process 5.0 — Grad-CAM Generation**

Generates an explanation heatmap for an approved
image using the trained model.

**Process 6.0 — Educational Guidance**

Provides:
- Breast health awareness
- General symptom guidance
- Risk factor information
- English, Kannada and Hindi content

This educational processing runs in the frontend.

### Data Stores

**D1 — Approved Image Fingerprints**

File: backend/app/core/approved_demo_sha256.txt

Contains SHA-256 fingerprints of approved BUSI
demonstration images.

**D2 — Trained Model Checkpoint**

File: artifacts/models/busi_mobilenetv3_best.pth

Contains the saved MobileNetV3-Small model
parameters and configuration.

The application does not use a persistent
patient-record database.

## 3. Privacy and Limitations

- Prediction and Grad-CAM endpoints process
  uploaded images without intentionally saving them.
- Temporary server-side buffering may occur.
- Uploaded image suitability is restricted
  through exact-file approval.
- Model scores are not validated cancer probabilities.
- Educational guidance is not medical diagnosis.

## 4. Conclusion

The Level 0 diagram represents the whole system.

The Level 1 diagram shows the internal data flow
between the frontend, image validation,
approved-image guard, AI prediction, Grad-CAM
and educational components.

This is an academic research prototype, not a
clinically validated diagnostic application.
