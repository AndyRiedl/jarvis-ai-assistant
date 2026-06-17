"""
Security Module
Encryption, Authentication and Security Utilities
"""

import logging
from typing import Optional
from datetime import datetime, timedelta

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class TokenData(BaseModel):
    """JWT Token Payload"""
    sub: str
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None


class EncryptionManager:
    """Handles encryption and decryption of sensitive data"""
    
    def __init__(self, key: str = None):
        """Initialize encryption manager"""
        self.key = key or settings.ENCRYPTION_KEY
        if not self.key:
            raise ValueError("ENCRYPTION_KEY not configured!")
        
        try:
            self.cipher = Fernet(self.key.encode() if isinstance(self.key, str) else self.key)
        except Exception as e:
            logger.error(f"Failed to initialize encryption: {str(e)}")
            raise
    
    def encrypt(self, plaintext: str) -> str:
        """Encrypt plaintext string"""
        try:
            if isinstance(plaintext, str):
                plaintext = plaintext.encode()
            encrypted = self.cipher.encrypt(plaintext)
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise
    
    def decrypt(self, ciphertext: str) -> str:
        """Decrypt ciphertext string"""
        try:
            if isinstance(ciphertext, str):
                ciphertext = ciphertext.encode()
            decrypted = self.cipher.decrypt(ciphertext)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise


class JWTManager:
    """Handles JWT token generation and validation"""
    
    @staticmethod
    def create_access_token(
        subject: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT access token"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                hours=settings.JWT_EXPIRATION_HOURS
            )
        
        to_encode = {
            "sub": subject,
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[TokenData]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            subject: str = payload.get("sub")
            if subject is None:
                return None
            return TokenData(sub=subject)
        except JWTError:
            logger.warning(f"Invalid token: {token[:20]}...")
            return None


# Global encryption manager instance
encryption_manager = EncryptionManager()


def generate_encryption_key() -> str:
    """Generate a new Fernet encryption key (for setup)"""
    return Fernet.generate_key().decode()
