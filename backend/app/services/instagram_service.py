"""
Instagram Service
Facebook Graph API v18.0 integration for Instagram Business accounts.
Supports fetching posts, creating media containers, publishing, and AI caption generation.
"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.ollama_client import generate_text

logger = logging.getLogger(__name__)

GRAPH_BASE = f"https://graph.facebook.com/{settings.INSTAGRAM_GRAPH_API_VERSION}"


class InstagramService:
    """Wrapper around the Instagram Graph API"""

    def __init__(self):
        self.account_id = settings.INSTAGRAM_BUSINESS_ACCOUNT_ID
        self.access_token = settings.INSTAGRAM_ACCESS_TOKEN

    def _params(self, extra: Dict[str, Any] = None) -> Dict[str, Any]:
        params = {"access_token": self.access_token}
        if extra:
            params.update(extra)
        return params

    async def _get(self, path: str, params: Dict[str, Any] = None) -> Dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{GRAPH_BASE}/{path}", params=self._params(params)
            )
            resp.raise_for_status()
            return resp.json()

    async def _post(self, path: str, data: Dict[str, Any]) -> Dict:
        payload = {**data, "access_token": self.access_token}
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{GRAPH_BASE}/{path}", data=payload)
            resp.raise_for_status()
            return resp.json()

    # ------------------------------------------------------------------
    # Posts
    # ------------------------------------------------------------------

    async def get_posts(
        self, limit: int = 20, status_filter: Optional[str] = None
    ) -> List[Dict]:
        """
        Return published posts from the Instagram Business account.
        The Graph API only returns published content; scheduled posts are managed locally.
        """
        fields = "id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count"
        data = await self._get(
            f"{self.account_id}/media",
            params={"fields": fields, "limit": limit},
        )
        posts = []
        for item in data.get("data", []):
            posts.append({
                "id": item.get("id"),
                "caption": item.get("caption", ""),
                "media_type": item.get("media_type", "IMAGE").lower(),
                "image_url": item.get("media_url") or item.get("thumbnail_url"),
                "published_at": item.get("timestamp"),
                "permalink": item.get("permalink"),
                "status": "published",
                "like_count": item.get("like_count", 0),
                "comments_count": item.get("comments_count", 0),
            })
        return posts

    async def create_image_post(
        self, image_url: str, caption: str
    ) -> Dict:
        """
        Create and publish a single-image post.
        Step 1: Create media container.
        Step 2: Publish the container.
        """
        # Step 1: create container
        container = await self._post(
            f"{self.account_id}/media",
            {"image_url": image_url, "caption": caption},
        )
        container_id = container.get("id")
        if not container_id:
            raise ValueError(f"Failed to create media container: {container}")

        # Step 2: publish
        result = await self._post(
            f"{self.account_id}/media_publish",
            {"creation_id": container_id},
        )
        logger.info(f"Instagram post published: {result}")
        return {"id": result.get("id"), "status": "published"}

    async def get_insights(self, media_id: str) -> Dict:
        """Fetch engagement insights for a specific post"""
        data = await self._get(
            f"{media_id}/insights",
            params={"metric": "impressions,reach,engagement,saved"},
        )
        return {item["name"]: item["values"][0]["value"] for item in data.get("data", [])}

    # ------------------------------------------------------------------
    # AI Content Generation
    # ------------------------------------------------------------------

    async def generate_caption(
        self, topic: str, style: str = "inspirational", hashtags: bool = True
    ) -> Dict[str, Any]:
        """Generate an AI-powered Instagram caption + hashtag suggestions"""
        system_prompt = (
            "Du bist ein kreativer Social-Media-Texter, spezialisiert auf Instagram. "
            "Erstelle ansprechende, authentische Captions, die Engagement fördern."
        )
        hashtag_instruction = (
            " Füge am Ende 10–15 relevante Hashtags hinzu." if hashtags else ""
        )
        prompt = (
            f"Erstelle eine Instagram Caption für folgenden Inhalt:\n"
            f"Thema: {topic}\n"
            f"Stil: {style}\n"
            f"Sprache: Deutsch{hashtag_instruction}"
        )
        generated = await generate_text(prompt, system_prompt=system_prompt)

        # Split off hashtags if present
        lines = generated.strip().split("\n")
        caption_lines = []
        hashtag_list = []
        for line in lines:
            tags = [w for w in line.split() if w.startswith("#")]
            if tags:
                hashtag_list.extend(tags)
            else:
                caption_lines.append(line)

        return {
            "caption": "\n".join(caption_lines).strip(),
            "hashtags": hashtag_list,
            "full_text": generated,
        }


instagram_service = InstagramService()
