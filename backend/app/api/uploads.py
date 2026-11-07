
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

router = APIRouter(prefix="/api/images", tags=["Images"])

MAX_IMAGE_SIZE = 10 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
}


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Only JPG and PNG images are allowed."
            )

        contents = await file.read(MAX_IMAGE_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty."
            )

        if len(contents) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image must be 10 MiB or less."
            )

        try:
            with Image.open(BytesIO(contents)) as image:
                image_format = image.format
                width, height = image.size

                if width * height > 20_000_000:
                    raise HTTPException(
                        status_code=400,
                        detail="Image dimensions are too large."
                    )

                image.verify()

        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombError,
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted image."
            )

        if image_format != ALLOWED_TYPES[file.content_type]:
            raise HTTPException(
                status_code=400,
                detail="Image format does not match file type."
            )

        return {
            "message": "Image validated successfully",
            "filename": file.filename,
            "size_bytes": len(contents),
            "format": image_format,
            "width": width,
            "height": height,
            "stored": False,
            "analysis_performed": False
        }

    finally:
        await file.close()
