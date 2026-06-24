"""
Redis Client
Async Redis connection and helper utilities
"""

import logging
import json
from typing import Any, Optional

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[aioredis.Redis] = None


def get_redis() -> aioredis.Redis:
    """Return (and lazily create) the shared async Redis client"""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=5,
        )
    return _redis_client


async def check_redis() -> bool:
    """Ping Redis to verify connectivity"""
    try:
        client = get_redis()
        return await client.ping()
    except Exception as e:
        logger.warning(f"Redis health check failed: {e}")
        return False


async def cache_get(key: str) -> Optional[Any]:
    """Get a JSON-serialised value from Redis"""
    try:
        client = get_redis()
        raw = await client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as e:
        logger.warning(f"Redis GET failed for key={key}: {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = None) -> bool:
    """Store a JSON-serialised value in Redis"""
    try:
        client = get_redis()
        ttl = ttl if ttl is not None else settings.REDIS_CACHE_TTL
        await client.set(key, json.dumps(value, default=str), ex=ttl)
        return True
    except Exception as e:
        logger.warning(f"Redis SET failed for key={key}: {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Delete a key from Redis"""
    try:
        client = get_redis()
        await client.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Redis DELETE failed for key={key}: {e}")
        return False
