"""
Logging Configuration
Structured logging setup for JSON format in production
"""

import logging
import logging.handlers
import sys
from pathlib import Path

from app.core.config import settings


def setup_logging():
    """Configure logging for the application"""
    
    # Create logs directory
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL)
    
    # Remove existing handlers
    root_logger.handlers = []
    
    # Format
    if settings.LOG_FORMAT == "json":
        log_format = "%(name)s - %(levelname)s - %(message)s"
    else:
        log_format = "[%(asctime)s] %(levelname)s - %(name)s - %(message)s"
    
    formatter = logging.Formatter(log_format)
    
    # Console handler (always enabled)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(settings.LOG_LEVEL)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler
    try:
        file_handler = logging.handlers.RotatingFileHandler(
            settings.LOG_FILE,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
        )
        file_handler.setLevel(settings.LOG_LEVEL)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    except OSError as exc:
        logging.getLogger(__name__).warning(
            "Could not open log file %s (%s); logging to console only.",
            settings.LOG_FILE,
            exc,
        )
    
    # Suppress noisy loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    return root_logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a module"""
    return logging.getLogger(name)
