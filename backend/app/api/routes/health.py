"""
Health Check Endpoint
Monitor system status and dependencies
"""

import logging
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint
    Returns application status and dependency health
    """
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "JARVIS AI Assistant",
            "version": "0.1.0",
            "dependencies": {
                "database": "checking...",
                "redis": "checking...",
                "ollama": "checking...",
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")


@router.get("/ready")
async def readiness_check() -> Dict[str, str]:
    """
    Readiness check endpoint
    Returns whether the service is ready to handle requests
    """
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat(),
    }
