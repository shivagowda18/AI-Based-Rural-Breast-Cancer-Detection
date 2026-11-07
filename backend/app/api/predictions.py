
from io import BytesIO
import logging

from app.core.demo_image_guard import require_approved_demo_image
from fastapi import (
    APIRouter, File, HTTPException,
    Query, Request, UploadFile,
)
from fastapi.concurrency import run_in_threadpool
from PIL import Image, UnidentifiedImageError

from app.api.uploads import ALLOWED_TYPES, MAX_IMAGE_SIZE
from app.services.busi_predictor import predict_image

router = APIRouter(prefix="/api", tags=["AI Predictions"])
logger = logging.getLogger(__name__)


@router.post("/predict")
async def predict_ultrasound(
    request: Request,
    file: UploadFile = File(...),
    research_acknowledged: bool = Query(False),
):
    try:
        # Check allowed file type.
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Only JPG and PNG images are allowed.",
            )

        # Read no more than the permitted file size.
        contents = await file.read(MAX_IMAGE_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image must be 10 MiB or less.",
            )

        # Validate image contents.
        with Image.open(BytesIO(contents)) as image:
            image_format = image.format
            width, height = image.size

            if width * height > 20_000_000:
                raise HTTPException(
                    status_code=400,
                    detail="Image dimensions are too large.",
                )

            image.verify()

        # Confirm file content matches declared type.
        if image_format != ALLOWED_TYPES[file.content_type]:
            raise HTTPException(
                status_code=400,
                detail="Image format does not match file type.",
            )

        # Check approved image or permitted local research mode.
        require_approved_demo_image(
            contents,
            research_acknowledged=research_acknowledged,
            client_host=(
                request.client.host
                if request.client
                else None
            ),
        )
        # Predict directly from memory.
        # No uploaded image is saved to disk.
        result = await run_in_threadpool(
            predict_image,
            BytesIO(contents),
        )

        return {
            "analysis_performed": True,
            "stored": False,
            **result,
        }

    except HTTPException:
        raise

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
        Image.DecompressionBombError,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image.",
        )

    except Exception:
        logger.exception("AI prediction failed")
        raise HTTPException(
            status_code=503,
            detail="AI prediction is temporarily unavailable.",
        )

    finally:
        await file.close()
