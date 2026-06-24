"""
WhatsApp API Routes
Conversation listing, message sending, and webhook handling
"""

import logging

from fastapi import APIRouter, HTTPException, Query, Request, Response
from pydantic import BaseModel

from app.services.whatsapp_service import whatsapp_service

logger = logging.getLogger(__name__)
router = APIRouter()


class SendMessageRequest(BaseModel):
    phone: str  # E.164 format, e.g. "+4917612345678"
    message: str


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/conversations")
async def get_conversations():
    """Return conversation summaries built from incoming webhook events"""
    try:
        conversations = await whatsapp_service.get_conversations()
        return {"conversations": conversations, "count": len(conversations)}
    except Exception as e:
        logger.error(f"WhatsApp get_conversations failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/send")
async def send_message(request: SendMessageRequest):
    """Send a text message to a WhatsApp number"""
    try:
        result = await whatsapp_service.send_text_message(request.phone, request.message)
        return {"status": "sent", "result": result}
    except Exception as e:
        logger.error(f"WhatsApp send_message failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/webhook")
async def verify_webhook(
    request: Request,
):
    """Meta webhook verification handshake"""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    result = whatsapp_service.verify_webhook(mode or "", token or "", challenge or "")
    if result is not None:
        return Response(content=result, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhook")
async def receive_webhook(payload: dict):
    """Receive and process incoming WhatsApp messages"""
    try:
        events = whatsapp_service.parse_webhook_payload(payload)
        for event in events:
            if event.get("type") == "text" and event.get("text"):
                await whatsapp_service.record_incoming_message(
                    contact=event["name"],
                    phone=event["from"],
                    message_text=event["text"],
                )
        logger.info(f"WhatsApp webhook processed {len(events)} event(s)")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"WhatsApp webhook processing failed: {e}")
        # Always return 200 to Meta to prevent retries
        return {"status": "error", "detail": str(e)}
