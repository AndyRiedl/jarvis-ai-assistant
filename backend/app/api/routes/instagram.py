"""
Instagram API Routes
Post management and AI-powered content generation
"""

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, HttpUrl

from app.services.instagram_service import instagram_service

logger = logging.getLogger(__name__)
router = APIRouter()


class CreatePostRequest(BaseModel):
    image_url: str
    caption: str


class GenerateCaptionRequest(BaseModel):
    topic: str
    style: str = "inspirational"
    hashtags: bool = True


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/posts")
async def get_posts(
    limit: int = Query(default=20, ge=1, le=100),
):
    """Fetch published posts from the Instagram Business account"""
    try:
        posts = await instagram_service.get_posts(limit=limit)
        return {"posts": posts, "count": len(posts)}
    except Exception as e:
        logger.error(f"Instagram get_posts failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/posts")
async def create_post(request: CreatePostRequest):
    """Create and publish a new Instagram image post"""
    try:
        result = await instagram_service.create_image_post(
            image_url=request.image_url,
            caption=request.caption,
        )
        return result
    except Exception as e:
        logger.error(f"Instagram create_post failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/posts/{post_id}/insights")
async def get_post_insights(post_id: str):
    """Fetch engagement insights for a specific post"""
    try:
        insights = await instagram_service.get_insights(post_id)
        return {"post_id": post_id, "insights": insights}
    except Exception as e:
        logger.error(f"Instagram insights failed for {post_id}: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/generate-caption")
async def generate_caption(request: GenerateCaptionRequest):
    """Generate an AI-powered Instagram caption and hashtag suggestions"""
    try:
        result = await instagram_service.generate_caption(
            topic=request.topic,
            style=request.style,
            hashtags=request.hashtags,
        )
        return result
    except Exception as e:
        logger.error(f"Caption generation failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/webhook")
async def instagram_webhook(payload: dict):
    """Receive Instagram webhook events (comments, mentions, DMs)"""
    logger.info(f"Instagram webhook received: {list(payload.keys())}")
    # TODO: parse and route events (comments → AI response, mentions → alert)
    return {"status": "received"}
