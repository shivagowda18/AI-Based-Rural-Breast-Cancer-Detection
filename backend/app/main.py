
import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles

from app.api.uploads import router as upload_router
from app.api.predictions import router as prediction_router
from app.api.explanations import router as explanation_router


APP_ENV = os.getenv(
    "APP_ENV", "development"
).lower()

IS_PRODUCTION = APP_ENV == "production"
IS_DEMO = APP_ENV == "demo"

PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"


app = FastAPI(
    title="AI-Based Rural Breast Cancer Detection API",
    description=(
        "Research prototype for breast ultrasound analysis."
    ),
    version="1.0.0",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"

    if request.url.path in {
        "/api/images/upload",
        "/api/predict",
        "/api/explain",
    }:
        response.headers["Cache-Control"] = "no-store"

    return response


# Existing API endpoints
app.include_router(upload_router)
app.include_router(prediction_router)
app.include_router(explanation_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "backend",
    }


# Local demonstration mode
if IS_DEMO:
    if not (FRONTEND_DIST / "index.html").is_file():
        raise RuntimeError(
            "Frontend build missing. Run npm run build "
            "inside the frontend folder first."
        )

    app.mount(
        "/",
        StaticFiles(
            directory=str(FRONTEND_DIST),
            html=True,
        ),
        name="frontend",
    )

else:
    @app.get("/")
    def home():
        return {
            "message": (
                "AI-Based Rural Breast Cancer Detection API"
            ),
            "status": "running",
        }
