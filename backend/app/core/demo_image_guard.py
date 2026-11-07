
import os
from hashlib import sha256
from pathlib import Path

from fastapi import HTTPException


# Approved original BUSI demonstration images.
ALLOWLIST_PATH = Path(__file__).with_name(
    "approved_demo_sha256.txt"
)

APPROVED_DEMO_SHA256: frozenset[str] = frozenset(
    line.strip().lower()
    for line in ALLOWLIST_PATH.read_text(
        encoding="utf-8"
    ).splitlines()
    if line.strip()
)


def require_approved_demo_image(
    contents: bytes,
    *,
    research_acknowledged: bool = False,
    client_host: str | None = None,
) -> None:
    """
    Demo mode:
        Accept only approved BUSI images.

    Local research mode:
        Permit additional experimental images only
        when explicitly enabled, acknowledged,
        and requested from the local computer.

    Neither mode verifies medical image suitability.
    """

    image_hash = sha256(contents).hexdigest()

    # Existing approved images always remain available.
    if image_hash in APPROVED_DEMO_SHA256:
        return

    # Explicit, local-only research access.
    research_enabled = (
        os.getenv("ENABLE_LOCAL_RESEARCH_MODE", "0") == "1"
    )

    local_request = client_host in {
        "127.0.0.1",
        "::1",
    }

    if (
        research_enabled
        and research_acknowledged
        and local_request
    ):
        return

    raise HTTPException(
        status_code=422,
        detail=(
            "This research demonstration currently accepts "
            "only pre-approved breast ultrasound example images. "
            "The uploaded file is not approved for AI analysis. "
            "Experimental analysis of additional images requires "
            "explicitly enabled local research mode."
        ),
    )