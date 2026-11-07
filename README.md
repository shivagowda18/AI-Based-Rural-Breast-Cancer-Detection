
# AI-Based Rural Breast Cancer Detection

An academic research prototype for breast ultrasound
image classification, explainable AI and multilingual
breast-health awareness.

## Main Features

- Breast ultrasound classification using MobileNetV3-Small
- Three research classes: Benign, Malignant, Normal
- Grad-CAM visual explanations
- React and FastAPI integration
- English, Kannada and Hindi support
- Breast Health Awareness
- Symptom Guidance
- Breast Cancer Risk Awareness
- Mobile-responsive interface
- Controlled BUSI demonstration-image allowlist

## Technology Stack

Frontend:
- React
- TypeScript
- Vite
- CSS

Backend:
- Python
- FastAPI
- PyTorch
- Torchvision
- Pillow

## Dataset

BUSI (Breast Ultrasound Images)

- Original ultrasound images: 780
- Retained for model development: 766
- Training images: 536
- Validation images: 115
- Test images: 115

See `docs/busi_dataset_audit.md` for limitations.

## Model Evaluation

Selected model: MobileNetV3-Small

Held-out test results:
- Accuracy: 77.39%
- Macro F1-score: 76.87%
- Malignant recall: 74.19%

The model missed 8 of 31 malignant test images.

See `docs/model_evaluation.md`.

## Initial Setup on Windows

Recommended development environment:
- Python 3.13
- Node.js and npm
- Windows 64-bit

From the project root, create a Python virtual environment:

```cmd
py -3.13 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install --upgrade pip
```

Install the required Python packages:

```cmd
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

The requirements pin CPU versions of PyTorch and
Torchvision. If pip cannot locate those CPU builds,
follow the official PyTorch installation instructions
for Windows, Pip and CPU:
https://pytorch.org/get-started/locally/

Install and build the frontend:

```cmd
cd frontend
npm ci
npm run build
cd ..
```

Before running AI predictions, obtain the trained
MobileNetV3-Small checkpoint from the project team
and place it at:

artifacts/models/busi_mobilenetv3_best.pth

The model checkpoint is intentionally excluded from Git.
Without it, AI inference and Grad-CAM cannot run.

## Local Development

Start the backend from the project root:

```cmd
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Start the frontend in a separate terminal:

```cmd
cd frontend
npm run dev
```

The Vite development server forwards `/api` requests
to FastAPI running on port 8000.

## Single-Server Demonstration

First, build the frontend:

```cmd
cd frontend
npm run build
```

Then start FastAPI in demo mode:

```cmd
cd ..\backend
set APP_ENV=demo
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open:

http://127.0.0.1:8000/

Only one server can use port 8000 at a time.

## Required Local Model Files

The selected model checkpoint must be available at:

artifacts/models/busi_mobilenetv3_best.pth

Approved demonstration-image fingerprints must be at:

backend/app/core/approved_demo_sha256.txt

The approved demonstration-image fingerprint file is included
in the Git repository.

The trained model checkpoint is intentionally excluded from Git.
It must be supplied separately by the project team and placed at
artifacts/models/busi_mobilenetv3_best.pth before AI inference
or Grad-CAM generation can work.

Do not redistribute model weights or dataset images without
checking the applicable permissions and licenses.

The allowlist can be generated from a locally available
BUSI dataset using:

```cmd
backend\.venv\Scripts\python.exe notebooks\build_demo_allowlist.py
```

The image guard recognizes exact approved BUSI files,
not arbitrary breast ultrasound scans.

## Research Testing Mode

The application provides two image-analysis modes:

### Demo Mode (Default)

- Accepts only approved BUSI demonstration images.
- Unapproved images are rejected with HTTP 422.
- Research Mode is disabled by default.

### Research Testing Mode

Allows experimental processing of additional images during
supervised local academic testing.

Requirements:
- ENABLE_LOCAL_RESEARCH_MODE=1
- Explicit research acknowledgement in the website
- Requests from the local loopback interface

To enable Research Mode, start the backend with:

```cmd
cd backend
set APP_ENV=demo
set ENABLE_LOCAL_RESEARCH_MODE=1
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

To disable Research Mode, stop the server and restart
with ENABLE_LOCAL_RESEARCH_MODE=0.

Research Mode does not verify whether an image is actually
a breast ultrasound. Model predictions and Grad-CAM outputs
are experimental, not medical diagnoses.

Only authorized, de-identified research images should be used.
This local access control is not suitable for public deployment.

## Testing


From the backend directory:

```cmd
.venv\Scripts\python.exe -m pytest ..\tests -q
```

Latest verified result: 44 tests passed.

From the frontend directory:

```cmd
npm run lint
npm run build
```

## Privacy and Limitations

- The application is an academic research prototype.
- AI model scores are not calibrated cancer probabilities.
- The system is not clinically validated.
- Uploaded images are not intentionally persisted
  by the current prediction and explanation endpoints.
- Uploaded files may be temporarily buffered by the server.
- Public deployment requires additional security review.
- Symptom guidance does not provide a diagnosis.
- Grad-CAM does not establish a medically confirmed lesion.
- Medical assessment must be performed by qualified
  healthcare professionals.

## Research Documentation

- Dataset audit: docs/busi_dataset_audit.md
- Model evaluation: docs/model_evaluation.md

## Disclaimer

This application is for academic research and
educational demonstration only.

It must not replace professional breast cancer
screening, medical examination or diagnosis.
