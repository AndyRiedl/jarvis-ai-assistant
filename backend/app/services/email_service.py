"""
Email Service
IMAP inbox fetching and SMTP reply sending for Office365/Outlook.
AI-generated reply suggestions are provided via the Ollama client.
"""

import email as email_lib
import logging
import re
from datetime import datetime, timezone
from email.header import decode_header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional

import imapclient
import aiosmtplib

from app.core.config import settings
from app.core.ollama_client import generate_text

logger = logging.getLogger(__name__)


def _decode_header_value(raw: str | bytes | None) -> str:
    """Decode an RFC 2047-encoded e-mail header value to a plain string"""
    if raw is None:
        return ""
    parts = decode_header(str(raw))
    decoded = []
    for part, charset in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(str(part))
    return "".join(decoded)


def _classify_priority(subject: str, from_email: str) -> str:
    """Heuristic priority classification"""
    subject_lower = subject.lower()
    if any(k in subject_lower for k in ("urgent", "asap", "important", "kritisch", "dringend")):
        return "high"
    if any(k in subject_lower for k in ("newsletter", "unsubscribe", "noreply", "no-reply")):
        return "low"
    if "noreply" in from_email.lower() or "newsletter" in from_email.lower():
        return "low"
    return "medium"


class EmailService:
    """Handles IMAP fetching and SMTP sending for Office365"""

    def __init__(self):
        self.imap_host = settings.OFFICE365_IMAP_HOST
        self.imap_port = settings.OFFICE365_IMAP_PORT
        self.smtp_host = settings.OFFICE365_SMTP_HOST
        self.smtp_port = settings.OFFICE365_SMTP_PORT
        self.email_address = settings.EMAIL_ADDRESS
        self.app_password = settings.OFFICE365_APP_PASSWORD

    # ------------------------------------------------------------------
    # IMAP helpers
    # ------------------------------------------------------------------

    def _imap_connect(self) -> imapclient.IMAPClient:
        client = imapclient.IMAPClient(self.imap_host, port=self.imap_port, ssl=True)
        client.login(self.email_address, self.app_password)
        return client

    def _parse_message(self, uid: int, raw_message: bytes) -> dict:
        """Parse a raw IMAP message into a dict"""
        msg = email_lib.message_from_bytes(raw_message)

        from_header = _decode_header_value(msg.get("From", ""))
        # Extract name and email
        match = re.match(r"^(.+?)\s*<(.+?)>$", from_header)
        if match:
            from_name = match.group(1).strip('" ')
            from_email = match.group(2)
        else:
            from_name = None
            from_email = from_header.strip()

        subject = _decode_header_value(msg.get("Subject", "(No Subject)"))

        # Date
        date_str = msg.get("Date", "")
        try:
            from email.utils import parsedate_to_datetime
            received_at = parsedate_to_datetime(date_str)
        except Exception:
            received_at = datetime.now(timezone.utc)

        # Body extraction
        body_plain = None
        body_html = None
        has_attachment = False

        if msg.is_multipart():
            for part in msg.walk():
                ct = part.get_content_type()
                disp = str(part.get("Content-Disposition", ""))
                if "attachment" in disp:
                    has_attachment = True
                elif ct == "text/plain" and body_plain is None:
                    body_plain = part.get_payload(decode=True).decode("utf-8", errors="replace")
                elif ct == "text/html" and body_html is None:
                    body_html = part.get_payload(decode=True).decode("utf-8", errors="replace")
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body_plain = payload.decode("utf-8", errors="replace")

        priority = _classify_priority(subject, from_email)
        preview = (body_plain or "").strip()[:200]

        return {
            "id": str(uid),
            "from_name": from_name,
            "from_email": from_email,
            "subject": subject,
            "preview": preview,
            "body_plain": body_plain,
            "body_html": body_html,
            "received_at": received_at.isoformat(),
            "is_read": False,
            "priority": priority,
            "has_attachment": has_attachment,
            "labels": [],
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def get_inbox(self, limit: int = 50, unread_only: bool = False) -> List[dict]:
        """Fetch recent messages from the INBOX"""
        try:
            client = self._imap_connect()
            client.select_folder("INBOX")

            criteria = ["UNSEEN"] if unread_only else ["ALL"]
            uids = client.search(criteria)
            uids = sorted(uids, reverse=True)[:limit]

            if not uids:
                client.logout()
                return []

            messages = []
            raw_messages = client.fetch(uids, ["RFC822", "FLAGS"])
            for uid, data in raw_messages.items():
                raw = data.get(b"RFC822")
                if not raw:
                    continue
                parsed = self._parse_message(uid, raw)
                flags = data.get(b"FLAGS", ())
                parsed["is_read"] = b"\\Seen" in flags
                messages.append(parsed)

            client.logout()
            return messages

        except Exception as e:
            logger.error(f"IMAP fetch failed: {e}")
            raise

    async def get_email(self, email_id: str) -> Optional[dict]:
        """Fetch a single email by its UID"""
        try:
            client = self._imap_connect()
            client.select_folder("INBOX")
            uid = int(email_id)
            raw_messages = client.fetch([uid], ["RFC822", "FLAGS"])
            if uid not in raw_messages:
                client.logout()
                return None
            data = raw_messages[uid]
            parsed = self._parse_message(uid, data[b"RFC822"])
            parsed["is_read"] = b"\\Seen" in data.get(b"FLAGS", ())
            client.logout()
            return parsed
        except Exception as e:
            logger.error(f"IMAP fetch single email failed: {e}")
            raise

    async def send_reply(self, email_id: str, reply_body: str) -> bool:
        """
        Send a plain-text reply to an existing email.
        Fetches the original to build proper In-Reply-To / Subject headers.
        """
        original = await self.get_email(email_id)
        if not original:
            raise ValueError(f"Email {email_id} not found")

        msg = MIMEMultipart("alternative")
        msg["From"] = self.email_address
        msg["To"] = original["from_email"]
        msg["Subject"] = (
            original["subject"]
            if original["subject"].startswith("Re:")
            else f"Re: {original['subject']}"
        )

        msg.attach(MIMEText(reply_body, "plain", "utf-8"))

        smtp_kwargs = dict(
            hostname=self.smtp_host,
            port=self.smtp_port,
            username=self.email_address,
            start_tls=True,
        )
        smtp_kwargs["password"] = self.app_password
        await aiosmtplib.send(msg, **smtp_kwargs)
        logger.info(f"Reply sent to {original['from_email']}")
        return True

    async def suggest_reply(self, email_id: str) -> str:
        """Generate an AI reply suggestion for the given email"""
        original = await self.get_email(email_id)
        if not original:
            raise ValueError(f"Email {email_id} not found")

        system_prompt = (
            "Du bist ein professioneller Assistent, der E-Mail-Antworten formuliert. "
            "Antworte präzise, höflich und professionell. Schreibe die Antwort auf Deutsch, "
            "sofern die Original-E-Mail auf Deutsch ist."
        )
        prompt = (
            f"Bitte formuliere eine passende Antwort auf folgende E-Mail:\n\n"
            f"Von: {original['from_name'] or original['from_email']}\n"
            f"Betreff: {original['subject']}\n\n"
            f"{original['body_plain'] or '(kein Text)'}"
        )

        return await generate_text(prompt, system_prompt=system_prompt)


email_service = EmailService()
