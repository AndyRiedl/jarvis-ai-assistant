"""
News API Routes
RSS-based news aggregation with category filtering
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.news_service import news_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("")
async def get_news(
    category: Optional[str] = Query(default=None, description="Filter by category: technology | ai | business | general"),
    limit: int = Query(default=20, ge=1, le=100),
):
    """
    Fetch aggregated news from RSS feeds.

    - **category**: Optional category filter (technology, ai, business, general)
    - **limit**: Maximum number of articles to return
    """
    try:
        articles = await news_service.get_news(category=category, limit=limit)
        return {"articles": articles, "count": len(articles), "category": category}
    except Exception as e:
        logger.error(f"News fetch failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/categories")
async def get_categories():
    """Return available news categories"""
    categories = await news_service.get_categories()
    return {"categories": categories}
