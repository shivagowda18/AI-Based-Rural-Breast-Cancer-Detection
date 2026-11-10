"""Small local concurrency smoke checks for API request handling.

These tests deliberately avoid model inference. They are not a model-load
benchmark or a guarantee of production scalability.
"""

from concurrent.futures import ThreadPoolExecutor

import pytest
from fastapi.testclient import TestClient

from app.main import app


def _health_request(_: int) -> tuple[int, str]:
    with TestClient(app) as client:
        response = client.get('/api/health')
    return response.status_code, response.json().get('status', '')


def _invalid_image_request(path: str) -> tuple[int, str]:
    # Invalid JPEG bytes exercise validation without loading the AI model.
    with TestClient(app) as client:
        response = client.post(
            path,
            files={'file': ('invalid.jpg', b'not-an-image', 'image/jpeg')},
        )
    return response.status_code, response.json().get('detail', '')


def test_eight_concurrent_health_checks():
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(_health_request, range(8)))
    assert results == [(200, 'healthy')] * 8


@pytest.mark.parametrize('path', [
    '/api/images/upload', '/api/predict', '/api/explain',
])
def test_eight_concurrent_invalid_image_requests(path):
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(_invalid_image_request, [path] * 8))
    assert len(results) == 8
    for status, detail in results:
        assert status == 400
        assert detail == 'Invalid or corrupted image.'


@pytest.mark.parametrize('path', [
    '/api/images/upload', '/api/predict', '/api/explain',
])
def test_api_error_responses_have_no_store_and_nosniff(path):
    with TestClient(app) as client:
        response = client.post(path, files={
            'file': ('invalid.jpg', b'not-an-image', 'image/jpeg')
        })
    assert response.status_code == 400
    assert response.headers['cache-control'] == 'no-store'
    assert response.headers['x-content-type-options'] == 'nosniff'
