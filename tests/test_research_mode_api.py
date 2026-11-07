
from io import BytesIO
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


@pytest.fixture
def client():
    # Simulate a request from the local computer.
    return TestClient(
        app,
        client=("127.0.0.1", 50000),
    )


def make_test_image():
    buffer = BytesIO()

    Image.new(
        "RGB",
        (32, 32),
        color=(120, 120, 120),
    ).save(buffer, format="PNG")

    return buffer.getvalue()


def send_request(client, endpoint, acknowledged):
    url = endpoint

    if acknowledged:
        url += "?research_acknowledged=true"

    return client.post(
        url,
        files={
            "file": (
                "test_image.png",
                make_test_image(),
                "image/png",
            )
        },
    )


@pytest.mark.parametrize(
    "endpoint",
    ["/api/predict", "/api/explain"],
)
def test_research_disabled_rejects_new_image(
    client, monkeypatch, endpoint
):
    monkeypatch.setenv(
        "ENABLE_LOCAL_RESEARCH_MODE", "0"
    )

    response = send_request(
        client, endpoint, acknowledged=True
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    "endpoint",
    ["/api/predict", "/api/explain"],
)
def test_research_requires_acknowledgement(
    client, monkeypatch, endpoint
):
    monkeypatch.setenv(
        "ENABLE_LOCAL_RESEARCH_MODE", "1"
    )

    response = send_request(
        client, endpoint, acknowledged=False
    )

    assert response.status_code == 422


def test_local_research_prediction_allowed(
    client, monkeypatch
):
    monkeypatch.setenv(
        "ENABLE_LOCAL_RESEARCH_MODE", "1"
    )

    fake_result = {
        "predicted_class": "Benign",
        "model_scores": {
            "Benign": 0.7,
            "Malignant": 0.2,
            "Normal": 0.1,
        },
        "medical_notice": "Research only.",
    }

    with patch(
        "app.api.predictions.predict_image",
        return_value=fake_result,
    ) as predictor:
        response = send_request(
            client,
            "/api/predict",
            acknowledged=True,
        )

    assert response.status_code == 200
    assert response.json()["analysis_performed"] is True
    predictor.assert_called_once()


def test_local_research_gradcam_allowed(
    client, monkeypatch
):
    monkeypatch.setenv(
        "ENABLE_LOCAL_RESEARCH_MODE", "1"
    )

    fake_png = b"\x89PNG\r\n\x1a\n"

    with patch(
        "app.api.explanations.generate_gradcam_png",
        return_value=(fake_png, "Benign"),
    ) as generator:
        response = send_request(
            client,
            "/api/explain",
            acknowledged=True,
        )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    generator.assert_called_once()
