"""
Chat API Routes
Conversational interface with the local Ollama LLM.
Supports standard HTTP request/response and WebSocket streaming.
"""

import logging
import uuid
from typing import AsyncIterator, Optional

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.core.config import settings
from app.core import ollama_client

logger = logging.getLogger(__name__)
router = APIRouter()

JARVIS_SYSTEM_PROMPT = (
    "Du bist JARVIS, ein persönlicher KI-Assistent. "
    "Du hilfst bei E-Mail-Management, Social Media und Software-Entwicklung. "
    "Antworte präzise, hilfreich und auf Deutsch, sofern nicht anders gewünscht."
)


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str
    conversation_id: Optional[str] = None
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    conversation_id: str
    status: str = "success"


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest) -> ChatResponse:
    """
    Send a message and get an AI response from the local Ollama LLM.

    - **message**: User message text
    - **conversation_id**: Optional conversation ID to continue an existing chat
    - **system_prompt**: Optional custom system prompt (overrides the default JARVIS prompt)
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    conversation_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:12]}"
    system_prompt = request.system_prompt or JARVIS_SYSTEM_PROMPT

    logger.info(f"Chat [{conversation_id}] user: {request.message[:80]}")

    try:
        reply = await ollama_client.chat(
            message=request.message.strip(),
            conversation_id=conversation_id,
            system_prompt=system_prompt,
        )
        logger.info(f"Chat [{conversation_id}] assistant: {reply[:80]}")
        return ChatResponse(
            response=reply,
            conversation_id=conversation_id,
            status="success",
        )
    except Exception as e:
        logger.error(f"Ollama call failed [{conversation_id}]: {e}")
        raise HTTPException(status_code=503, detail=f"LLM unavailable: {str(e)}")


@router.get("/history/{conversation_id}")
async def get_history(conversation_id: str):
    """Return the stored conversation history for a given conversation ID"""
    history = await ollama_client.get_conversation_history(conversation_id)
    return {"conversation_id": conversation_id, "messages": history, "count": len(history)}


@router.delete("/history/{conversation_id}")
async def clear_history(conversation_id: str):
    """Clear the conversation history for a given conversation ID"""
    await ollama_client.save_conversation_history(conversation_id, [])
    return {"status": "cleared", "conversation_id": conversation_id}


@router.get("/status")
async def chat_status():
    """Get LLM system status"""
    ollama_ok = await ollama_client.check_ollama()
    return {
        "status": "operational" if ollama_ok else "degraded",
        "model": settings.OLLAMA_MODEL,
        "ollama_url": settings.OLLAMA_URL,
        "ollama_available": ollama_ok,
    }


@router.websocket("/ws/{conversation_id}")
async def chat_websocket(websocket: WebSocket, conversation_id: str):
    """
    WebSocket endpoint for streaming chat responses.

    Client sends: JSON {"message": "...", "system_prompt": "..."}
    Server streams: text chunks as they arrive, then sends {"done": true}
    """
    await websocket.accept()
    logger.info(f"WebSocket connected: {conversation_id}")

    try:
        while True:
            data = await websocket.receive_json()
            user_message = data.get("message", "").strip()
            system_prompt = data.get("system_prompt") or JARVIS_SYSTEM_PROMPT

            if not user_message:
                await websocket.send_json({"error": "Empty message"})
                continue

            try:
                async for token in ollama_client.chat_stream(
                    message=user_message,
                    conversation_id=conversation_id,
                    system_prompt=system_prompt,
                ):
                    await websocket.send_text(token)

                await websocket.send_json({"done": True})

            except Exception as e:
                logger.error(f"Streaming error [{conversation_id}]: {e}")
                await websocket.send_json({"error": str(e), "done": True})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {conversation_id}")
