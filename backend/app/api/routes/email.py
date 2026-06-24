"""
Email API Routes
Inbox management with AI-assisted reply suggestions
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.email_service import email_service

logger = logging.getLogger(__name__)
router = APIRouter()


class ReplyRequest(BaseModel):
    body: str


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────


@router.get("/inbox")
async def get_inbox(
    limit: int = Query(default=50, ge=1, le=200),
    unread_only: bool = Query(default=False),
):
    """
    Fetch emails from the INBOX.

    - **limit**: Maximum number of emails to return (default 50)
    - **unread_only**: When true, only return unread emails
    """
    try:
        emails = await email_service.get_inbox(limit=limit, unread_only=unread_only)
        return {"emails": emails, "count": len(emails)}
    except Exception as e:
        logger.error(f"Failed to fetch inbox: {e}")
        raise HTTPException(status_code=503, detail=f"IMAP error: {str(e)}")


@router.get("/{email_id}")
async def get_email(email_id: str):
    """Fetch a single email by UID"""
    try:
        email = await email_service.get_email(email_id)
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
        return email
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch email {email_id}: {e}")
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/{email_id}/reply")
async def reply_to_email(email_id: str, request: ReplyRequest):
    """Send a reply to an email"""
    try:
        await email_service.send_reply(email_id, request.body)
        return {"status": "sent", "email_id": email_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to send reply for {email_id}: {e}")
        raise HTTPException(status_code=503, detail=f"SMTP error: {str(e)}")


@router.post("/{email_id}/suggest-reply")
async def suggest_reply(email_id: str):
    """Generate an AI reply suggestion for an email"""
    try:
        suggestion = await email_service.suggest_reply(email_id)
        return {"email_id": email_id, "suggestion": suggestion}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate reply suggestion for {email_id}: {e}")
        raise HTTPException(status_code=503, detail=str(e))
