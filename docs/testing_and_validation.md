
# Testing and Validation Report

## AI-Based Rural Breast Cancer Detection

### 1. Objective

To verify the functionality of the React frontend,
FastAPI backend, AI prediction service, Grad-CAM,
image restrictions and educational modules.

The project is an academic research prototype
and has not undergone clinical validation.

## 2. Automated Backend Testing

Framework: Pytest

Test files:
- test_uploads.py
- test_predictions.py
- test_explanations.py
- test_demo_image_guard.py

Total test cases: 33

Latest recorded result:
33 passed in 11.88 seconds.

Command (from backend directory):

    .venv\Scripts\python.exe -m pytest ..\tests -q

The tests cover image validation, API behavior,
mocked model operations, error responses and
approved-image restrictions.

## 3. Frontend Testing

Technology:
- React
- TypeScript
- Vite
- ESLint

Verified:
- npm run lint completed without errors.
- npm run build completed successfully.
- Image previews update when files change.
- Previous predictions and heatmaps are cleared
  when a new image is selected.
- The ultrasound confirmation checkbox resets.
- Mobile-responsive layout was tested in
  Chrome's responsive preview.

## 4. AI Integration Testing

The following original BUSI images were
tested through the browser:

| Test Image | Model Output | Grad-CAM |
|---|---|---|
| benign (2).png | Benign | Generated |
| malignant (2).png | Malignant | Generated |
| normal (1).png | Normal | Generated |
| benign (87).png | Benign | Generated |

These examples demonstrate functional integration.
They do not establish overall diagnostic reliability.

## 5. Image Safety Testing

The backend uses an allowlist of SHA-256
fingerprints generated from the original BUSI
demonstration images.

Verified behavior:
- Approved BUSI images can be analyzed.
- An unrelated photograph receives HTTP 422.
- The same restriction applies to Grad-CAM.
- No AI prediction is returned for rejected images.
- The frontend displays a restriction message.

The allowlist identifies approved file content,
not whether arbitrary new images are ultrasounds.

## 6. Multilingual and Educational Features

Implemented:
- English interface
- Kannada interface
- Hindi interface
- Breast Health Awareness
- Breast Symptom Guidance
- Breast Cancer Risk Awareness

Basic browser checks were performed.

Complete language, accessibility and medical
content review remain necessary before public use.

## 7. Single-Server Demonstration

Demo address:
http://127.0.0.1:8000/

Verified:
- FastAPI serves the compiled React interface.
- Website assets load.
- Backend health endpoint responds.
- AI prediction and Grad-CAM work locally.

This is a local demonstration only.

## 8. Model Evaluation

Dataset: BUSI

Model-development images: 766
Training: 536
Validation: 115
Testing: 115

Selected architecture: MobileNetV3-Small

Held-out test performance:
- Accuracy: 77.39%
- Macro F1-score: 76.87%
- Malignant recall: 74.19%

Eight out of 31 malignant test examples were
misclassified.

Patient-independent splitting was not confirmed,
and no independent external clinical validation
has been completed.

## 9. Limitations and Pending Verification

- Not suitable for medical diagnosis or screening.
- Only exact approved demonstration images
  are supported by the AI endpoints.
- Model scores are not calibrated clinical risks.
- Full accessibility testing remains pending.
- Additional browser and device testing is needed.
- Public deployment requires access control,
  HTTPS, rate limiting and security review.
- Temporary upload buffering and production
  infrastructure need further privacy review.
- Dataset licensing and distribution requirements
  must be checked before release.

## 10. Conclusion

The prototype passed its recorded automated
backend tests, frontend code-quality checks
and selected end-to-end browser demonstrations.

These results support a controlled academic
software demonstration, not clinical deployment.
