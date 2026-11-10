
from io import BytesIO
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def make_image(format="PNG", size=(100, 100)):
    image = Image.new("RGB", size, "white")
    buffer = BytesIO()
    image.save(buffer, format=format)
    return buffer.getvalue()


def send_prediction(content, filename, content_type):
    return client.post(
        "/api/predict",
        files={
            "file": (filename, content, content_type)
        },
    )


def fake_prediction(image):
    assert isinstance(image, BytesIO)

    return {
        "predicted_class": "benign",
        "model_scores": {
            "benign": 0.8,
            "malignant": 0.15,
            "normal": 0.05,
        },
        "medical_notice": (
            "Research prototype only. "
            "Not a medical diagnosis."
        ),
    }


# Test 1 and 2: Valid images
@pytest.mark.parametrize(
    "format,filename,content_type",
    [
        ("PNG", "test.png", "image/png"),
        ("JPEG", "test.jpg", "image/jpeg"),
    ],
)
def test_valid_prediction_image(
    format, filename, content_type
):
    content = make_image(format)

    # Mock AI inference to test the API independently.
    with (
        patch("app.api.predictions.require_approved_demo_image"),
        patch(
            "app.api.predictions.predict_image",
            side_effect=fake_prediction,
        ) as predictor,
    ):
        response = send_prediction(
            content, filename, content_type
        )

    assert response.status_code == 200

    data = response.json()

    assert data["analysis_performed"] is True
    assert data["stored"] is False
    assert data["predicted_class"] == "benign"
    assert "model_scores" in data
    assert "medical_notice" in data

    predictor.assert_called_once()


# Test 3: Unsupported file
def test_unsupported_file():
    response = send_prediction(
        b"Hello world",
        "test.txt",
        "text/plain",
    )

    assert response.status_code == 400


# Test 4: Corrupted image
def test_corrupted_image():
    response = send_prediction(
        b"not a real image",
        "broken.jpg",
        "image/jpeg",
    )

    assert response.status_code == 400


# Test 5: Empty image
def test_empty_image():
    response = send_prediction(
        b"",
        "empty.png",
        "image/png",
    )

    assert response.status_code == 400


# Test 6: File larger than 10 MiB
def test_oversized_image():
    content = b"x" * (10 * 1024 * 1024 + 1)

    response = send_prediction(
        content,
        "large.jpg",
        "image/jpeg",
    )

    assert response.status_code == 413


# Test 7: Mismatched content type
def test_mismatched_format():
    content = make_image("JPEG")

    response = send_prediction(
        content,
        "wrong.png",
        "image/png",
    )

    assert response.status_code == 400


# Test 8: Excessive image dimensions
def test_excessive_dimensions():
    content = make_image(
        "JPEG",
        size=(5000, 4001),
    )

    response = send_prediction(
        content,
        "large_dimensions.jpg",
        "image/jpeg",
    )

    assert response.status_code == 400


# Test 9: Missing image
def test_missing_image():
    response = client.post("/api/predict")

    assert response.status_code == 422


# Test 10: AI model unavailable
def test_model_unavailable():
    content = make_image("PNG")

    with (
        patch("app.api.predictions.require_approved_demo_image"),
        patch(
            "app.api.predictions.predict_image",
            side_effect=RuntimeError("Model unavailable"),
        ),
    ):
        response = send_prediction(
            content,
            "test.png",
            "image/png",
        )

    assert response.status_code == 503

    assert response.json()["detail"] == (
        "AI prediction is temporarily unavailable."
    )

@pytest.mark.parametrize("service_error", [
    ValueError("Invalid checkpoint configuration"),
    OSError("Model checkpoint cannot be read"),
])
def test_predictor_internal_error_is_not_reported_as_bad_image(service_error):
    content = make_image("PNG")

    with (
        patch("app.api.predictions.require_approved_demo_image"),
        patch(
            "app.api.predictions.predict_image",
            side_effect=service_error,
        ),
    ):
        response = send_prediction(content, "test.png", "image/png")

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "AI prediction is temporarily unavailable."
    )
