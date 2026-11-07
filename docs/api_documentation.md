
# API Documentation

## AI-Based Rural Breast Cancer Detection

### 1. Overview

The backend uses FastAPI to provide image
validation, research AI predictions, Grad-CAM
explanations and service health information.

Local demo URL:
http://127.0.0.1:8000

The API is intended for academic demonstration.

## 2. Health Check

Endpoint: GET /api/health

Purpose:
Verify that the backend is responding.

Example response:

{
  "status": "healthy",
  "service": "backend"
}

## 3. Image File Validation

Endpoint: POST /api/images/upload

Request:
- Content type: multipart/form-data
- Field name: file
- Supported formats: JPG, JPEG, PNG
- Maximum file size: 10 MiB
- Maximum pixels: 20 million

Purpose:
Validate image integrity and return file details.

Response includes:
- Filename
- File size
- Image format
- Width and height
- stored: false
- analysis_performed: false

Important:
Validating image format does not verify
that the image is a breast ultrasound.

## 4. AI Prediction

Endpoint: POST /api/predict

Request:
- multipart/form-data
- Field name: file

Processing:
1. Validate image format and dimensions.
2. Verify its SHA-256 fingerprint against
   the approved BUSI demo-image allowlist.
3. Run MobileNetV3-Small inference.
4. Return research classification results.

Successful response includes:
- analysis_performed: true
- stored: false
- predicted_class
- model_scores
- medical_notice

Possible predicted classes:
- Benign
- Malignant
- Normal

The model scores are not clinically
validated cancer probabilities.

## 5. Grad-CAM Explanation

Endpoint: POST /api/explain

Request:
- multipart/form-data
- Field name: file

Processing:
1. Validate the image.
2. Check the approved BUSI allowlist.
3. Generate the Grad-CAM explanation.

Successful response:
- HTTP 200
- Content-Type: image/png
- X-Predicted-Class header
- Cache-Control: no-store

Grad-CAM illustrates model attention,
not medically verified lesion locations.

## 6. API Error Handling

Common HTTP responses:

- 200: Request completed successfully
- 400: Invalid file or image format
- 413: File exceeds the upload-size limit
- 422: Unapproved image or invalid request
- 503: AI service temporarily unavailable

## 7. Security and Privacy

Implemented protections:
- Image type and size checks
- Maximum pixel count
- Approved demonstration-image fingerprints
- Cache-Control: no-store on image API responses
- X-Content-Type-Options: nosniff

The API does not intentionally save uploaded
images permanently during prediction or
Grad-CAM processing.

Temporary server-side buffering may occur.

## 8. Limitations

- Only exact approved BUSI image files can
  be analyzed in the controlled demonstration.
- The system does not recognize arbitrary
  breast ultrasound images.
- No clinical validation has been completed.
- Public deployment requires further
  security measures and access controls.

## 9. Conclusion

The FastAPI backend supports image validation,
research classification and Grad-CAM
visualization through REST endpoints.

The system is designed for academic
research and demonstration only.
