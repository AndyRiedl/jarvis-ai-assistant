"""
JARVIS - Personal AI Assistant
Main FastAPI Application Entry Point
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.api.routes import health, chat, email, instagram, whatsapp, news

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


def _run_alembic_migrations() -> None:
    """Run Alembic migrations synchronously (must be called from a thread)."""
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    logger.info("🤖 JARVIS AI Assistant starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Run Alembic migrations in a thread so asyncio.run() inside alembic/env.py
    # doesn't conflict with the already-running FastAPI event loop.
    try:
        await asyncio.to_thread(_run_alembic_migrations)
        logger.info("✅ Database migrations applied")
    except Exception as e:
        logger.warning(f"⚠️  Alembic migration failed (continuing): {e}")

    yield

    logger.info("🤖 JARVIS AI Assistant shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="JARVIS AI Assistant",
    description="Personal AI Assistant for Email, Social Media & Software Development",
    version="0.1.0",
    docs_url="/docs" if settings.ENABLE_API_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_API_DOCS else None,
    openapi_url="/openapi.json" if settings.ENABLE_API_DOCS else None,
    lifespan=lifespan,
)

# ==========================================
# Middleware Configuration
# ==========================================

# CORS - Only localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host - Only localhost
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"],
)


# ==========================================
# Exception Handlers
# ==========================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for logging"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ==========================================
# API Routes
# ==========================================

# Health check
app.include_router(health.router, tags=["Health"])

# Chat API (Phase 1)
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])

# Email API (Phase 1)
app.include_router(email.router, prefix="/api/v1/email", tags=["Email"])

# Instagram API (Phase 1)
app.include_router(instagram.router, prefix="/api/v1/instagram", tags=["Instagram"])

# WhatsApp API (Phase 2)
app.include_router(whatsapp.router, prefix="/api/v1/whatsapp", tags=["WhatsApp"])

# News API
app.include_router(news.router, prefix="/api/v1/news", tags=["News"])

# LinkedIn API (Phase 2)
# app.include_router(linkedin.router, prefix="/api/v1/linkedin", tags=["LinkedIn"])


# ==========================================
# Root Endpoint
# ==========================================

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "🤖 JARVIS AI Assistant",
        "version": "0.1.0",
        "status": "operational",
        "docs": "/docs" if settings.ENABLE_API_DOCS else None,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        workers=settings.API_WORKERS,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
