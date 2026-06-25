"""
Health Check Endpoints
Real dependency checks for PostgreSQL, Redis, and Ollama
"""

import logging
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, HTTPException

from app.core.database import check_database
from app.core.redis_client import check_redis
from app.core import ollama_client

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.
    Verifies connectivity to all critical dependencies (PostgreSQL, Redis, Ollama).
    Returns HTTP 503 if any dependency is unhealthy.
    """
    db_ok, redis_ok, ollama_ok = False, False, False

    try:
        db_ok = await check_database()
    except Exception as e:
        logger.warning(f"DB health check exception: {e}")

    try:
        redis_ok = await check_redis()
    except Exception as e:
        logger.warning(f"Redis health check exception: {e}")

    try:
        ollama_ok = await ollama_client.check_ollama()
    except Exception as e:
        logger.warning(f"Ollama health check exception: {e}")

    all_healthy = db_ok and redis_ok and ollama_ok

    status_payload = {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "JARVIS AI Assistant",
        "version": "0.1.0",
        "dependencies": {
            "database": "ok" if db_ok else "unavailable",
            "redis": "ok" if redis_ok else "unavailable",
            "ollama": "ok" if ollama_ok else "unavailable",
        },
    }

    if not all_healthy:
        raise HTTPException(status_code=503, detail=status_payload)

    return status_payload


@router.get("/ready")
async def readiness_check() -> Dict[str, Any]:
    """
    Readiness check – returns 200 as soon as the FastAPI process is up.
    Does not wait for dependencies (use /health for that).
    """
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat(),
    }
