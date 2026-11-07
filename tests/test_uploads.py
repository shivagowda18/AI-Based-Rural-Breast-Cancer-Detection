
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def make_image(format="PNG", size=(100, 100)):
    image = Image.new("RGB", size, "white")
    buffer = BytesIO()
    image.save(buffer, format=format)
    return buffer.getvalue()


def send_image(content, filename, content_type):
    return client.post(
        "/api/images/upload",
        files={
            "file": (filename, content, content_type)
        }
    )


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_valid_png():
    content = make_image("PNG")

    response = send_image(
        content, "test.png", "image/png"
    )

    assert response.status_code == 200
    assert response.json()["format"] == "PNG"
    assert response.json()["stored"] is False
    assert response.json()["analysis_performed"] is False


def test_valid_jpeg():
    content = make_image("JPEG")

    response = send_image(
        content, "test.jpg", "image/jpeg"
    )

    assert response.status_code == 200
    assert response.json()["format"] == "JPEG"


def test_unsupported_file():
    response = send_image(
        b"Hello world", "test.txt", "text/plain"
    )

    assert response.status_code == 400


def test_corrupted_image():
    response = send_image(
        b"not a real image", "broken.jpg", "image/jpeg"
    )

    assert response.status_code == 400


def test_empty_image():
    response = send_image(
        b"", "empty.png", "image/png"
    )

    assert response.status_code == 400


def test_oversized_image():
    content = b"x" * (10 * 1024 * 1024 + 1)

    response = send_image(
        content, "large.jpg", "image/jpeg"
    )

    assert response.status_code == 413


def test_mismatched_image_format():
    content = make_image("JPEG")

    response = send_image(
        content, "wrong.png", "image/png"
    )

    assert response.status_code == 400


def test_excessive_image_dimensions():
    content = make_image("JPEG", (5000, 4001))

    response = send_image(
        content, "large_dimensions.jpg", "image/jpeg"
    )

    assert response.status_code == 400
