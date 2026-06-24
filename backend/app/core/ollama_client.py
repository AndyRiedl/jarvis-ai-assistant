"""
Ollama HTTP Client
Async client for the local Ollama LLM service with conversation-history management.
Conversation history is stored in Redis (keyed by conversation_id) so it survives
process restarts and multiple uvicorn workers.
"""

import json
import logging
from typing import AsyncIterator, List, Optional

import httpx

from app.core.config import settings
from app.core.redis_client import cache_get, cache_set

logger = logging.getLogger(__name__)

HISTORY_TTL = 60 * 60 * 24  # 24 h


def _history_key(conversation_id: str) -> str:
    return f"chat:history:{conversation_id}"


async def get_conversation_history(conversation_id: str) -> List[dict]:
    """Load message history from Redis"""
    return await cache_get(_history_key(conversation_id)) or []


async def save_conversation_history(conversation_id: str, messages: List[dict]) -> None:
    """Persist message history to Redis"""
    await cache_set(_history_key(conversation_id), messages, ttl=HISTORY_TTL)


async def chat(
    message: str,
    conversation_id: str,
    system_prompt: Optional[str] = None,
    stream: bool = False,
) -> str:
    """
    Send a user message to Ollama and return the assistant reply.

    Automatically loads + saves the conversation history from/to Redis so
    multi-turn conversations work across requests.
    """
    history = await get_conversation_history(conversation_id)

    # Build message list
    messages: List[dict] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "options": {
            "temperature": settings.LLM_TEMPERATURE,
            "num_predict": settings.LLM_MAX_TOKENS,
            "num_ctx": settings.LLM_CONTEXT_WINDOW,
        },
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.OLLAMA_URL}/api/chat",
                json=payload,
            )
            resp.raise_for_status()

        data = resp.json()
        reply: str = data["message"]["content"]

        # Update history (keep last 20 exchanges = 40 messages to stay within context)
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})
        history = history[-40:]
        await save_conversation_history(conversation_id, history)

        return reply

    except httpx.HTTPStatusError as e:
        logger.error(f"Ollama HTTP error {e.response.status_code}: {e.response.text}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Ollama connection error: {e}")
        raise


async def chat_stream(
    message: str,
    conversation_id: str,
    system_prompt: Optional[str] = None,
) -> AsyncIterator[str]:
    """
    Streaming variant – yields text chunks as they arrive from Ollama.
    History is saved once the stream is complete.
    """
    history = await get_conversation_history(conversation_id)

    messages: List[dict] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.extend(history)
    messages.append({"role": "user", "content": message})

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "options": {
            "temperature": settings.LLM_TEMPERATURE,
            "num_predict": settings.LLM_MAX_TOKENS,
            "num_ctx": settings.LLM_CONTEXT_WINDOW,
        },
        "stream": True,
    }

    full_reply = ""
    async with httpx.AsyncClient(timeout=300.0) as client:
        async with client.stream(
            "POST",
            f"{settings.OLLAMA_URL}/api/chat",
            json=payload,
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line:
                    continue
                try:
                    chunk = json.loads(line)
                    token = chunk.get("message", {}).get("content", "")
                    if token:
                        full_reply += token
                        yield token
                except json.JSONDecodeError:
                    continue

    # Persist history after streaming is done
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": full_reply})
    history = history[-40:]
    await save_conversation_history(conversation_id, history)


async def check_ollama() -> bool:
    """Check whether Ollama is reachable and has the configured model available"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            resp.raise_for_status()
            models = [m["name"] for m in resp.json().get("models", [])]
            return settings.OLLAMA_MODEL in models or any(
                settings.OLLAMA_MODEL.split(":")[0] in m for m in models
            )
    except Exception as e:
        logger.warning(f"Ollama health check failed: {e}")
        return False


async def generate_text(prompt: str, system_prompt: Optional[str] = None) -> str:
    """
    Single-turn text generation (no conversation history).
    Useful for AI-assisted tasks like email reply suggestions, caption generation.
    """
    messages: List[dict] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "options": {
            "temperature": settings.LLM_TEMPERATURE,
            "num_predict": settings.LLM_MAX_TOKENS,
        },
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{settings.OLLAMA_URL}/api/chat", json=payload)
        resp.raise_for_status()

    return resp.json()["message"]["content"]
