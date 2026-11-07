
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


def send_explanation(content, filename, content_type):
    return client.post(
        "/api/explain",
        files={
            "file": (filename, content, content_type)
        },
    )


def fake_gradcam(image_source):
    assert isinstance(image_source, BytesIO)
    return make_image("PNG", (224, 224)), "benign"


# Tests 1 and 2: Valid PNG and JPEG
@pytest.mark.parametrize(
    "format,filename,content_type",
    [
        ("PNG", "test.png", "image/png"),
        ("JPEG", "test.jpg", "image/jpeg"),
    ],
)
def test_valid_explanation(format, filename, content_type):
    content = make_image(format)

    with (
        patch("app.api.explanations.require_approved_demo_image"),
        patch(
            "app.api.explanations.generate_gradcam_png",
            side_effect=fake_gradcam,
        ) as generator,
    ):
        response = send_explanation(
            content, filename, content_type
        )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.headers["x-predicted-class"] == "benign"
    assert response.headers["cache-control"] == "no-store"

    with Image.open(BytesIO(response.content)) as image:
        assert image.format == "PNG"
        assert image.size == (224, 224)
        image.verify()

    generator.assert_called_once()


# Test 3: Unsupported file type
def test_unsupported_file():
    response = send_explanation(
        b"Hello world", "test.txt", "text/plain"
    )
    assert response.status_code == 400


# Test 4: Corrupted image
def test_corrupted_image():
    response = send_explanation(
        b"not an image", "broken.png", "image/png"
    )
    assert response.status_code == 400


# Test 5: Empty image
def test_empty_image():
    response = send_explanation(
        b"", "empty.png", "image/png"
    )
    assert response.status_code == 400


# Test 6: Image larger than 10 MiB
def test_oversized_image():
    content = b"x" * (10 * 1024 * 1024 + 1)

    response = send_explanation(
        content, "large.png", "image/png"
    )
    assert response.status_code == 413


# Test 7: Mismatched image type
def test_mismatched_format():
    content = make_image("JPEG")

    response = send_explanation(
        content, "wrong.png", "image/png"
    )
    assert response.status_code == 400


# Test 8: Excessive image dimensions
def test_excessive_dimensions():
    content = make_image("JPEG", (5000, 4001))

    response = send_explanation(
        content, "large.jpg", "image/jpeg"
    )
    assert response.status_code == 400


# Test 9: Missing image
def test_missing_image():
    response = client.post("/api/explain")
    assert response.status_code == 422


# Test 10: Grad-CAM service unavailable
def test_gradcam_unavailable():
    content = make_image("PNG")

    with (
        patch("app.api.explanations.require_approved_demo_image"),
        patch(
            "app.api.explanations.generate_gradcam_png",
            side_effect=RuntimeError("Model unavailable"),
        ),
    ):
        response = send_explanation(
            content, "test.png", "image/png"
        )

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "Grad-CAM is temporarily unavailable."
    )
