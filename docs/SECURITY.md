# 🔐 Security Guide

Security considerations and best practices for JARVIS.

## Encryption

### API Key Encryption

All sensitive credentials are encrypted at rest:

```python
from app.core.security import encryption_manager

# Encrypt
encrypted = encryption_manager.encrypt("sensitive_data")

# Decrypt
decrypted = encryption_manager.decrypt(encrypted)
```

### Encryption Key Generation

Generated during system initialization with:

```bash
python3 scripts/init_system.py
```

**Never share your encryption key!** Store it securely:

```bash
# Option 1: Keep in .env (Git ignored)
# Option 2: Use external secret manager (Phase 2)
# Option 3: Environment variable only
```

## Authentication

### JWT Tokens

Internal authentication uses JWT:

```python
from app.core.security import JWTManager

# Create token
token = JWTManager.create_access_token(subject="admin")

# Verify token
token_data = JWTManager.verify_token(token)
```

### API Access Control

- ✅ **Localhost only** (default)
- ✅ **Rate limiting**: 100 req/min
- ✅ **CORS restrictions**: localhost:3000, localhost:8000

## Database Security

### Connection

- Uses encrypted PostgreSQL connections
- Pool with max 10 connections
- Automatic reconnection handling

### Data at Rest

- PostgreSQL encryption supported (advanced setup)
- All sensitive fields encrypted with Fernet

## Sensitive Data Handling

### Microsoft Email Credentials

**Option 1: OAuth2 (Recommended)**
- Uses refresh tokens (more secure)
- No password stored locally
- Automatic token rotation

**Option 2: App Password**
```
✅ CORRECT: 16-character app-specific password
❌ WRONG: Your regular Microsoft password
```

[Create Office 365 App Password](https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-dont-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944)

### API Tokens

Store as environment variables only:

```bash
# .env (Git ignored)
INSTAGRAM_ACCESS_TOKEN=your_token_here

# Never log or expose
logger.info(f"Token: {token}")  # ❌ BAD
logger.info("Token configured")  # ✅ GOOD
```

## Network Security

### Localhost Only (Default)

JARVIS only accepts connections from:
- `127.0.0.1`
- `localhost`

No external access by default.

### SSL/TLS (Advanced)

For local HTTPS:

1. Generate self-signed certificate:
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

2. Configure in `.env`:
```
SSL_ENABLED=true
SSL_CERT_PATH=/app/cert.pem
SSL_KEY_PATH=/app/key.pem
```

## Data Privacy

### Data Retention

- **Emails**: 90 days (configurable)
- **Chat History**: 180 days (configurable)
- **Social Media Logs**: 30 days

### GDPR Compliance

Although JARVIS runs locally, follow best practices:

- Delete data when no longer needed
- Support user data export
- Log all data access
- Encrypt sensitive fields

## Backup & Recovery

### Database Backup

```bash
# Manual backup
docker exec jarvis-db pg_dump -U jarvis jarvis > backup.sql

# Automated daily backup
# Add to crontab or use Docker volume backup
```

### Recovery

```bash
docker exec -i jarvis-db psql -U jarvis jarvis < backup.sql
```

## Security Checklist

- [ ] Generate unique encryption key
- [ ] Use Microsoft App Password (not regular password)
- [ ] Keep `.env` file private (Git ignored)
- [ ] Never commit credentials to Git
- [ ] Regular backups of database
- [ ] Monitor logs for suspicious activity
- [ ] Update dependencies regularly
- [ ] Use strong JWT secret

## Incident Response

### If credentials compromised:

1. **Immediately rotate credentials**:
```bash
# Office 365: Delete app password
# Instagram: Regenerate token
# LinkedIn: Revoke access
```

2. **Update `.env`** with new credentials

3. **Restart containers**:
```bash
docker-compose restart
```

4. **Check logs** for unauthorized access:
```bash
docker-compose logs api | grep ERROR
```

## Monitoring

Enable security logging:

```
LOG_LEVEL=INFO
LOG_FORMAT=json
```

Monitor for:
- Failed authentication attempts
- API rate limit violations
- Database errors
- External network access attempts

## Compliance

- ✅ No data leaves your machine
- ✅ All encryption keys stored locally
- ✅ No telemetry or phone-home
- ✅ Fully auditable operations

See [Privacy Policy](./PRIVACY.md) for details.
