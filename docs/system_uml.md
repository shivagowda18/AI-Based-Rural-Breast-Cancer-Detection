
# UML Sequence Diagram

## AI-Based Rural Breast Cancer Detection

This diagram shows how the frontend and backend interact during ultrasound image analysis.

```mermaid
sequenceDiagram
    autonumber

    actor User
    participant React as React Frontend
    participant API as FastAPI Backend
    participant Guard as SHA-256 Image Guard
    participant Model as MobileNetV3-Small
    participant CAM as Grad-CAM Service

    User->>React: Select an image
    React->>React: Check file type and size
    React->>React: Display image preview

    User->>React: Confirm ultrasound image
    User->>React: Request AI analysis

    React->>API: POST /api/predict
    API->>API: Validate image contents
    API->>Guard: Check image fingerprint

    alt Image not approved
        Guard-->>API: Reject image
        API-->>React: HTTP 422
        React-->>User: Display restriction message
    else Image approved
        Guard-->>API: Permit analysis
        API->>Model: Run inference
        Model-->>API: Class and model scores
        API-->>React: Prediction JSON
        React-->>User: Display research result
    end

    User->>React: Request Grad-CAM

    React->>API: POST /api/explain
    API->>API: Validate image contents
    API->>Guard: Check image fingerprint

    alt Image not approved
        Guard-->>API: Reject image
        API-->>React: HTTP 422
        React-->>User: Display restriction message
    else Image approved
        Guard-->>API: Permit explanation
        API->>CAM: Generate Grad-CAM
        CAM-->>API: PNG heatmap
        API-->>React: PNG image response
        React-->>User: Display heatmap
    end
```

## UML Explanation

1. The user selects an image in the React interface.
2. React checks the basic file type and size.
3. The user confirms the image before requesting AI analysis.
4. FastAPI validates the uploaded image.
5. The SHA-256 guard checks membership in the approved BUSI demonstration allowlist.
6. Unapproved images receive HTTP 422.
7. Approved images can be processed by MobileNetV3-Small.
8. The prediction result contains the class and research model scores.
9. Grad-CAM uses a separate API endpoint with the same allowlist restriction.
10. The frontend displays the generated heatmap.

## Medical Limitation

This is an academic research workflow, not a clinically validated medical diagnosis system.
