
from io import BytesIO
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


client = TestClient(app)


def make_unapproved_image(image_format: str) -> bytes:
    buffer = BytesIO()

    image = Image.new("RGB", (64, 64), (120, 90, 60))
    image.save(buffer, format=image_format)

    return buffer.getvalue()


@pytest.mark.parametrize(
    "image_format,content_type",
    [
        ("PNG", "image/png"),
        ("JPEG", "image/jpeg"),
    ],
)
def test_prediction_rejects_unapproved_images(
    image_format, content_type
):
    content = make_unapproved_image(image_format)

    with patch("app.api.predictions.predict_image") as predictor:
        response = client.post(
            "/api/predict",
            files={
                "file": (
                    "unapproved_image",
                    content,
                    content_type,
                )
            },
        )

    assert response.status_code == 422
    assert "not approved" in response.json()["detail"].lower()
    predictor.assert_not_called()


@pytest.mark.parametrize(
    "image_format,content_type",
    [
        ("PNG", "image/png"),
        ("JPEG", "image/jpeg"),
    ],
)
def test_gradcam_rejects_unapproved_images(
    image_format, content_type
):
    content = make_unapproved_image(image_format)

    with patch(
        "app.api.explanations.generate_gradcam_png"
    ) as generator:
        response = client.post(
            "/api/explain",
            files={
                "file": (
                    "unapproved_image",
                    content,
                    content_type,
                )
            },
        )

    assert response.status_code == 422
    assert "not approved" in response.json()["detail"].lower()
    generator.assert_not_called()
