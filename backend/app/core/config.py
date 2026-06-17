"""
Configuration Management
Centralized settings from environment variables with encryption support
"""

from typing import List
from functools import lru_cache

from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application Settings"""

    # ==========================================
    # Core Settings
    # ==========================================
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    SECRET_KEY: str = Field(default="change-me", env="SECRET_KEY")

    # ==========================================
    # Server Settings
    # ==========================================
    API_HOST: str = Field(default="0.0.0.0", env="API_HOST")
    API_PORT: int = Field(default=8000, env="API_PORT")
    API_WORKERS: int = Field(default=4, env="API_WORKERS")
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        env="CORS_ORIGINS"
    )

    # ==========================================
    # Database Settings
    # ==========================================
    DATABASE_URL: str = Field(
        default="postgresql://jarvis:jarvis_password@db:5432/jarvis",
        env="DATABASE_URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=10, env="DATABASE_POOL_SIZE")
    DATABASE_POOL_MAX_OVERFLOW: int = Field(default=20, env="DATABASE_POOL_MAX_OVERFLOW")

    # ==========================================
    # Redis Settings
    # ==========================================
    REDIS_URL: str = Field(
        default="redis://redis:6379/0",
        env="REDIS_URL"
    )
    REDIS_CACHE_TTL: int = Field(default=3600, env="REDIS_CACHE_TTL")

    # ==========================================
    # Encryption & Security
    # ==========================================
    ENCRYPTION_KEY: str = Field(default="", env="ENCRYPTION_KEY")
    JWT_SECRET_KEY: str = Field(default="", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRATION_HOURS: int = Field(default=24, env="JWT_EXPIRATION_HOURS")

    # ==========================================
    # LLM / Ollama Settings
    # ==========================================
    OLLAMA_URL: str = Field(default="http://ollama:11434", env="OLLAMA_URL")
    OLLAMA_MODEL: str = Field(default="mistral:latest", env="OLLAMA_MODEL")
    LLM_TEMPERATURE: float = Field(default=0.7, env="LLM_TEMPERATURE")
    LLM_MAX_TOKENS: int = Field(default=2048, env="LLM_MAX_TOKENS")
    LLM_CONTEXT_WINDOW: int = Field(default=4096, env="LLM_CONTEXT_WINDOW")

    # ==========================================
    # Email Settings - Microsoft/Outlook
    # ==========================================
    EMAIL_PROVIDER: str = Field(default="microsoft", env="EMAIL_PROVIDER")
    EMAIL_ADDRESS: str = Field(default="", env="EMAIL_ADDRESS")
    EMAIL_TENANT_ID: str = Field(default="", env="EMAIL_TENANT_ID")
    EMAIL_CLIENT_ID: str = Field(default="", env="EMAIL_CLIENT_ID")
    EMAIL_CLIENT_SECRET: str = Field(default="", env="EMAIL_CLIENT_SECRET")
    EMAIL_CHECK_INTERVAL: int = Field(default=300, env="EMAIL_CHECK_INTERVAL")
    
    # Office365 Direct Connection
    OFFICE365_SMTP_HOST: str = Field(default="smtp.office365.com", env="OFFICE365_SMTP_HOST")
    OFFICE365_SMTP_PORT: int = Field(default=587, env="OFFICE365_SMTP_PORT")
    OFFICE365_IMAP_HOST: str = Field(default="imap.office365.com", env="OFFICE365_IMAP_HOST")
    OFFICE365_IMAP_PORT: int = Field(default=993, env="OFFICE365_IMAP_PORT")
    OFFICE365_APP_PASSWORD: str = Field(default="", env="OFFICE365_APP_PASSWORD")

    # ==========================================
    # Instagram Settings
    # ==========================================
    INSTAGRAM_BUSINESS_ACCOUNT_ID: str = Field(default="", env="INSTAGRAM_BUSINESS_ACCOUNT_ID")
    INSTAGRAM_ACCESS_TOKEN: str = Field(default="", env="INSTAGRAM_ACCESS_TOKEN")
    INSTAGRAM_GRAPH_API_VERSION: str = Field(default="v18.0", env="INSTAGRAM_GRAPH_API_VERSION")

    # ==========================================
    # WhatsApp Business Settings
    # ==========================================
    WHATSAPP_BUSINESS_ACCOUNT_ID: str = Field(default="", env="WHATSAPP_BUSINESS_ACCOUNT_ID")
    WHATSAPP_ACCESS_TOKEN: str = Field(default="", env="WHATSAPP_ACCESS_TOKEN")
    WHATSAPP_PHONE_NUMBER_ID: str = Field(default="", env="WHATSAPP_PHONE_NUMBER_ID")
    WHATSAPP_API_VERSION: str = Field(default="v18.0", env="WHATSAPP_API_VERSION")
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str = Field(default="", env="WHATSAPP_WEBHOOK_VERIFY_TOKEN")

    # ==========================================
    # LinkedIn Settings
    # ==========================================
    LINKEDIN_CLIENT_ID: str = Field(default="", env="LINKEDIN_CLIENT_ID")
    LINKEDIN_CLIENT_SECRET: str = Field(default="", env="LINKEDIN_CLIENT_SECRET")
    LINKEDIN_ACCESS_TOKEN: str = Field(default="", env="LINKEDIN_ACCESS_TOKEN")
    LINKEDIN_ORGANIZATION_ID: str = Field(default="", env="LINKEDIN_ORGANIZATION_ID")

    # ==========================================
    # Content Generation
    # ==========================================
    DAILY_CONTENT_MIN: int = Field(default=1, env="DAILY_CONTENT_MIN")
    DAILY_CONTENT_MAX: int = Field(default=3, env="DAILY_CONTENT_MAX")
    CONTENT_GENERATION_SCHEDULE: str = Field(
        default="09:00,13:00,18:00",
        env="CONTENT_GENERATION_SCHEDULE"
    )

    # ==========================================
    # Logging
    # ==========================================
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="logs/jarvis.log", env="LOG_FILE")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")

    # ==========================================
    # Security
    # ==========================================
    ALLOWED_IPS: str = Field(default="127.0.0.1,localhost", env="ALLOWED_IPS")
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=3600, env="RATE_LIMIT_WINDOW")
    ENABLE_API_DOCS: bool = Field(default=True, env="ENABLE_API_DOCS")

    # ==========================================
    # Feature Flags
    # ==========================================
    FEATURE_EMAIL: bool = Field(default=True, env="FEATURE_EMAIL")
    FEATURE_INSTAGRAM: bool = Field(default=True, env="FEATURE_INSTAGRAM")
    FEATURE_WHATSAPP: bool = Field(default=True, env="FEATURE_WHATSAPP")
    FEATURE_LINKEDIN: bool = Field(default=True, env="FEATURE_LINKEDIN")
    FEATURE_CODE_GENERATION: bool = Field(default=False, env="FEATURE_CODE_GENERATION")
    FEATURE_VIDEO_GENERATION: bool = Field(default=False, env="FEATURE_VIDEO_GENERATION")

    class Config:
        env_file = ".env"
        case_sensitive = True

    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @validator("ALLOWED_IPS", pre=True)
    def parse_allowed_ips(cls, v):
        """Parse allowed IPs from string"""
        if isinstance(v, str):
            return [ip.strip() for ip in v.split(",")]
        return v


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
