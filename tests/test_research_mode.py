
from hashlib import sha256

import pytest
from fastapi import HTTPException

import app.core.demo_image_guard as guard


APPROVED_IMAGE = b"approved-test-image"
NEW_IMAGE = b"new-test-image"


@pytest.fixture(autouse=True)
def setup_research_tests(monkeypatch):
    # Use test-only hashes, not actual medical images.
    monkeypatch.setattr(
        guard,
        "APPROVED_DEMO_SHA256",
        frozenset({
            sha256(APPROVED_IMAGE).hexdigest()
        }),
    )
    monkeypatch.delenv(
        "ENABLE_LOCAL_RESEARCH_MODE",
        raising=False,
    )


def test_approved_image_works_in_demo_mode():
    guard.require_approved_demo_image(
        APPROVED_IMAGE
    )


def test_new_image_rejected_by_default():
    with pytest.raises(HTTPException) as exc:
        guard.require_approved_demo_image(
            NEW_IMAGE,
            research_acknowledged=True,
            client_host="127.0.0.1",
        )

    assert exc.value.status_code == 422


def test_research_mode_requires_acknowledgement(monkeypatch):
    monkeypatch.setenv(
        "ENABLE_LOCAL_RESEARCH_MODE", "1"
    )

    with pytest.raises(HTTPException) as exc:
        guard.require_approved_demo_image(
            NEW_IMAGE,
            research_acknowledged=False,
            client_host="127.0.0.1",
        )

    assert exc.value.status_code == 422


def test_research_mode_rejects_remote_clients(monkeypatch):
    monkeypatch.setenv(
        "ENABLE_LOCAL_RESEARCH_MODE", "1"
    )

    with pytest.raises(HTTPException) as exc:
        guard.require_approved_demo_image(
            NEW_IMAGE,
            research_acknowledged=True,
            client_host="192.168.1.50",
        )

    assert exc.value.status_code == 422


def test_research_mode_accepts_local_request(monkeypatch):
    monkeypatch.setenv(
        "ENABLE_LOCAL_RESEARCH_MODE", "1"
    )

    guard.require_approved_demo_image(
        NEW_IMAGE,
        research_acknowledged=True,
        client_host="127.0.0.1",
    )
