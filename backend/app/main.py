"""
PolyVoice AI — FastAPI Application Entry Point
"""

from __future__ import annotations

import logging
import time

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import get_settings

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("polyvoice")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="PolyVoice AI",
        description="Smart Language Detection, Translation & Voice Studio API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS — allow the Vite dev server and any configured origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = round((time.perf_counter() - start) * 1000, 1)
        response.headers["X-Process-Time-Ms"] = str(elapsed)
        return response

    # Global exception handler for unhandled errors
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception at %s", request.url)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Internal server error", "detail": str(exc)},
        )

    # Mount all API routes under /api
    app.include_router(router, prefix="/api")

    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "app": "PolyVoice AI",
            "docs": "/docs",
            "health": "/api/health",
        }

    return app


app = create_app()
