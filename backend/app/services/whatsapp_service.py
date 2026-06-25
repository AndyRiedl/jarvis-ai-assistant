"""
WhatsApp Business Service
Meta Cloud API integration for WhatsApp Business messaging.
Supports listing conversations (from webhook cache) and sending messages.
"""

import logging
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings
from app.core.redis_client import cache_get, cache_set

logger = logging.getLogger(__name__)

WA_BASE = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}"
CONVERSATIONS_CACHE_KEY = "whatsapp:conversations"
CONVERSATION_TTL = 60 * 60 * 12  # 12 h


class WhatsAppService:
    """Wrapper around WhatsApp Business Cloud API"""

    def __init__(self):
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN
        self.verify_token = settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN

    def _headers(self) -> Dict[str, str]:
        token = self.access_token
        return {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
        }

    # ------------------------------------------------------------------
    # Conversations (assembled from webhook events stored in Redis)
    # ------------------------------------------------------------------

    async def get_conversations(self) -> List[Dict]:
        """Return conversation summaries cached from incoming webhook events"""
        data = await cache_get(CONVERSATIONS_CACHE_KEY)
        if data is None:
            return []
        return list(data.values())

    async def record_incoming_message(self, contact: str, phone: str, message_text: str) -> None:
        """Called by webhook handler to persist an incoming message summary"""
        convos = await cache_get(CONVERSATIONS_CACHE_KEY) or {}

        from datetime import datetime, timezone
        now = datetime.now(timezone.utc).isoformat()

        if contact not in convos:
            convos[contact] = {
                "id": f"wa_{phone.replace('+', '')}",
                "contact": contact,
                "contact_phone": phone,
                "last_message": message_text,
                "received_at": now,
                "is_read": False,
                "unread_count": 1,
                "avatar_initials": contact[:2].upper(),
                "status": "delivered",
                "priority": "medium",
            }
        else:
            convos[contact]["last_message"] = message_text
            convos[contact]["received_at"] = now
            convos[contact]["is_read"] = False
            convos[contact]["unread_count"] = convos[contact].get("unread_count", 0) + 1

        await cache_set(CONVERSATIONS_CACHE_KEY, convos, ttl=CONVERSATION_TTL)

    # ------------------------------------------------------------------
    # Sending
    # ------------------------------------------------------------------

    async def send_text_message(self, phone: str, message: str) -> Dict:
        """Send a plain-text message to a WhatsApp number"""
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "text",
            "text": {"preview_url": False, "body": message},
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{WA_BASE}/{self.phone_number_id}/messages",
                headers=self._headers(),
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    async def send_template_message(
        self, phone: str, template_name: str, language_code: str = "de", components: Optional[List] = None
    ) -> Dict:
        """Send a pre-approved template message"""
        payload: Dict[str, Any] = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
            },
        }
        if components:
            payload["template"]["components"] = components

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{WA_BASE}/{self.phone_number_id}/messages",
                headers=self._headers(),
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    # ------------------------------------------------------------------
    # Webhook verification
    # ------------------------------------------------------------------

    def verify_webhook(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """Verify the Meta webhook subscription handshake"""
        if mode == "subscribe" and token == self.verify_token:
            return challenge
        return None

    def parse_webhook_payload(self, payload: Dict) -> List[Dict]:
        """
        Parse a WhatsApp webhook payload and return a flat list of message events.
        Each event: {"from": phone, "name": display_name, "text": message_text, ...}
        """
        events = []
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                contacts = {c["wa_id"]: c.get("profile", {}).get("name", c["wa_id"]) for c in value.get("contacts", [])}
                for msg in value.get("messages", []):
                    phone = msg.get("from", "")
                    events.append({
                        "from": phone,
                        "name": contacts.get(phone, phone),
                        "type": msg.get("type"),
                        "text": msg.get("text", {}).get("body") if msg.get("type") == "text" else None,
                        "timestamp": msg.get("timestamp"),
                        "message_id": msg.get("id"),
                    })
        return events


whatsapp_service = WhatsAppService()
