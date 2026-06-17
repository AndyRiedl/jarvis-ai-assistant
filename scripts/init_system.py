#!/usr/bin/env python3
"""
JARVIS System Initialization Script
Generates encryption keys and initializes the system
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.core.security import generate_encryption_key


def main():
    """Initialize the system"""
    print("=" * 60)
    print("🤖 JARVIS AI Assistant - System Initialization")
    print("=" * 60)
    
    env_file = Path(".env")
    
    if env_file.exists():
        print("\n⚠️  .env file already exists!")
        response = input("Do you want to regenerate it? (y/n): ").strip().lower()
        if response != 'y':
            print("Keeping existing .env file.")
            return
    
    # Generate encryption keys
    print("\n🔐 Generating encryption keys...")
    
    encryption_key = generate_encryption_key()
    jwt_secret_key = generate_encryption_key()
    
    print(f"✓ Encryption key generated")
    print(f"✓ JWT secret key generated")
    
    # Create .env from template
    env_example = Path(".env.example")
    if not env_example.exists():
        print(f"\n❌ .env.example not found!")
        return
    
    print("\n📝 Creating .env file...")
    
    with open(env_example, 'r') as f:
        env_content = f.read()
    
    # Replace placeholder keys
    env_content = env_content.replace(
        "ENCRYPTION_KEY=your-generated-encryption-key-here",
        f"ENCRYPTION_KEY={encryption_key}"
    )
    env_content = env_content.replace(
        "JWT_SECRET_KEY=your-jwt-secret-key-here",
        f"JWT_SECRET_KEY={jwt_secret_key}"
    )
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print(f"✓ .env file created: {env_file}")
    
    # Create logs directory
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    print(f"✓ Logs directory created: {logs_dir}")
    
    # Print next steps
    print("\n" + "=" * 60)
    print("✅ Initialization Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Review and edit .env file with your API credentials")
    print("2. Run: docker-compose up -d")
    print("3. Visit: http://localhost:8000/docs (API documentation)")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
