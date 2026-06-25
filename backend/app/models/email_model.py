"""
Email Record Model
Persists fetched emails so the UI can query them without hitting IMAP every time
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Text, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EmailRecord(Base):
    __tablename__ = "emails"

    id: Mapped[str] = mapped_column(
        String(255), primary_key=True  # UID from IMAP server
    )
    from_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    from_email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(1000), nullable=False, default="(No Subject)")
    body_plain: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[str] = mapped_column(String(16), default="medium")  # high | medium | low
    has_attachment: Mapped[bool] = mapped_column(Boolean, default=False)
    labels: Mapped[str | None] = mapped_column(String(500), nullable=True)  # comma-separated
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
