
# System Flowchart
## AI-Based Rural Breast Cancer Detection

The following flowchart represents the image upload, validation, prediction and Grad-CAM workflow.

```mermaid
flowchart TD
    A["User opens React website"]
    B["Select JPG or PNG image"]
    C{"Valid file type and size?"}
    D["Display file error"]
    E["Preview selected image"]
    F{"Choose action"}

    A --> B
    B --> C
    C -->|"No"| D
    C -->|"Yes"| E
    E --> F

    F -->|"Validate image"| G["POST /api/images/upload"]
    G --> H{"Image format and dimensions valid?"}
    H -->|"No"| I["Display validation error"]
    H -->|"Yes"| J["Display format and dimensions only"]

    F -->|"AI prediction or Grad-CAM"| K{"Confirmation checked?"}
    K -->|"No"| L["AI buttons disabled"]
    K -->|"Yes"| M["Send image to FastAPI"]

    M --> N{"Backend image validation passes?"}
    N -->|"No"| O["Display validation error"]
    N -->|"Yes"| P{"SHA-256 in approved BUSI allowlist?"}

    P -->|"No"| Q["HTTP 422: Image not approved"]
    P -->|"Yes"| R{"Requested operation"}

    R -->|"Prediction"| S["MobileNetV3-Small inference"]
    S --> T["Display predicted class, scores and disclaimer"]

    R -->|"Grad-CAM"| U["Generate explanation heatmap"]
    U --> V["Display PNG heatmap and disclaimer"]
```

## Flowchart Explanation

1. The user selects a JPG or PNG image.
2. The frontend checks basic file type and size.
3. The user can request file-format validation.
4. AI analysis requires ultrasound confirmation.
5. The backend validates the image contents.
6. The SHA-256 guard checks membership in the approved BUSI demo-image allowlist.
7. Unapproved images receive HTTP 422.
8. Approved images can be processed by MobileNetV3-Small or Grad-CAM.
9. The website displays research outputs with medical disclaimers.

**Important:** The image allowlist identifies exact approved files. It does not independently detect breast ultrasound images or establish clinical reliability.
