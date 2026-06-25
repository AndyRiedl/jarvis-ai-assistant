"""
News Service
Aggregates news from RSS feeds using feedparser.
Falls back to a NewsAPI.org call if NEWS_API_KEY is configured.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import feedparser
import httpx

from app.core.config import settings
from app.core.redis_client import cache_get, cache_set

logger = logging.getLogger(__name__)

NEWS_CACHE_TTL = 60 * 30  # 30 minutes

DEFAULT_FEEDS: Dict[str, List[str]] = {
    "technology": [
        "https://feeds.feedburner.com/TechCrunch",
        "https://www.theverge.com/rss/index.xml",
        "https://rss.golem.de/rss.php?feed=ATOM1.0",
    ],
    "ai": [
        "https://venturebeat.com/category/ai/feed/",
        "https://www.heise.de/thema/KI-Kuenstliche-Intelligenz.rss",
    ],
    "business": [
        "https://feeds.reuters.com/reuters/businessNews",
        "https://www.handelsblatt.com/contentexport/feed/schlagzeilen",
    ],
    "general": [
        "https://feeds.reuters.com/reuters/topNews",
        "https://rss.sueddeutsche.de/rss/TopThemen",
    ],
}


def _entry_to_article(entry: Any, category: str, source: str) -> Dict:
    """Convert a feedparser entry to our NewsArticle dict"""
    # Publication date
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        pub_dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
    else:
        pub_dt = datetime.now(timezone.utc)

    # Summary (strip HTML tags via simple regex)
    import re
    summary_raw = getattr(entry, "summary", "") or ""
    summary = re.sub(r"<[^>]+>", "", summary_raw)[:500]

    # Image
    image_url = None
    if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
        image_url = entry.media_thumbnail[0].get("url")
    elif hasattr(entry, "links"):
        for link in entry.links:
            if link.get("type", "").startswith("image"):
                image_url = link.get("href")
                break

    return {
        "id": getattr(entry, "id", entry.link),
        "title": getattr(entry, "title", "Untitled"),
        "source": source,
        "published_at": pub_dt.isoformat(),
        "url": getattr(entry, "link", ""),
        "summary": summary or None,
        "category": category,
        "image_url": image_url,
    }


class NewsService:
    """Fetches and aggregates news from RSS feeds"""

    async def get_news(
        self,
        category: Optional[str] = None,
        limit: int = 20,
    ) -> List[Dict]:
        """
        Return news articles.  Results are cached in Redis for 30 minutes.
        category: one of technology | ai | business | general | None (= all)
        """
        cache_key = f"news:{category or 'all'}:{limit}"
        cached = await cache_get(cache_key)
        if cached is not None:
            return cached

        feeds: Dict[str, List[str]] = {}
        if category and category in DEFAULT_FEEDS:
            feeds[category] = DEFAULT_FEEDS[category]
        else:
            feeds = DEFAULT_FEEDS

        articles: List[Dict] = []

        for cat, urls in feeds.items():
            for url in urls:
                try:
                    parsed = feedparser.parse(url)
                    source = parsed.feed.get("title", url)
                    for entry in parsed.entries[:10]:
                        articles.append(_entry_to_article(entry, cat, source))
                except Exception as e:
                    logger.warning(f"Failed to fetch feed {url}: {e}")

        # Sort by date (newest first) and apply limit
        articles.sort(key=lambda a: a.get("published_at", ""), reverse=True)
        articles = articles[:limit]

        await cache_set(cache_key, articles, ttl=NEWS_CACHE_TTL)
        return articles

    async def get_categories(self) -> List[str]:
        """Return the available news categories"""
        return list(DEFAULT_FEEDS.keys())


news_service = NewsService()
