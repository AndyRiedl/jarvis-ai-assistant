# 🚀 JARVIS Setup Guide

Complete setup guide for running JARVIS on your MacBook Pro M3 Pro with Microsoft-managed email.

## Prerequisites

- ✅ MacBook Pro with Apple M3 Pro
- ✅ 18GB+ RAM
- ✅ 125GB+ free storage
- ✅ Docker Desktop for Mac (with Apple Silicon support)
- ✅ Git

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/AndyRiedl/jarvis-ai-assistant.git
cd jarvis-ai-assistant
```

### 2. Initialize System

```bash
python3 scripts/init_system.py
```

This will:
- Generate encryption keys
- Create `.env` file with secure settings
- Set up required directories

### 3. Configure API Credentials

Edit `.env` file with your API credentials:

```bash
nano .env
```

#### Microsoft Outlook/Exchange Email Setup:

**Option 1: OAuth2 (Recommended for managed mail)**
```
EMAIL_PROVIDER=microsoft
EMAIL_ADDRESS=your-email@company.onmicrosoft.com
EMAIL_TENANT_ID=your-tenant-id
EMAIL_CLIENT_ID=your-client-id
EMAIL_CLIENT_SECRET=your-client-secret
```

[Get Microsoft OAuth Credentials](https://learn.microsoft.com/en-us/graph/auth-register-app-v2)

**Option 2: Direct IMAP/SMTP (Alternative)**
```
OFFICE365_SMTP_HOST=smtp.office365.com
OFFICE365_SMTP_PORT=587
OFFICE365_IMAP_HOST=imap.office365.com
OFFICE365_IMAP_PORT=993
OFFICE365_APP_PASSWORD=your-app-specific-password
```

[Create Office 365 App Password](https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-dont-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944)

#### Other Required Credentials:

**Instagram:**
```
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-account-id
INSTAGRAM_ACCESS_TOKEN=your-long-lived-token
```

**LinkedIn:**
```
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-secret
LINKEDIN_ACCESS_TOKEN=your-token
```

**WhatsApp Business:**
```
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
WHATSAPP_ACCESS_TOKEN=your-token
```

### 4. Start Docker Containers

```bash
docker-compose up -d
```

**First run will take 10-15 minutes** (downloading Ollama + Mistral model)

### 5. Verify Installation

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f api

# Test API
curl http://localhost:8000/health
```

### 6. Access API

- **API Base**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Docker Container Details

| Service | Port | Purpose |
|---------|------|----------|
| **API** | 8000 | FastAPI Backend |
| **Database** | 5432 | PostgreSQL |
| **Redis** | 6379 | Cache & Sessions |
| **Ollama** | 11434 | Local LLM Service |
| **Nginx** | 80 | Reverse Proxy |

## Resource Optimization (M3 Pro)

Docker Compose is configured for M3 Pro optimization:

```yaml
ollama:
  deploy:
    resources:
      limits:
        memory: 12G
      reservations:
        memory: 8G
```

- **Ollama**: 8-12GB RAM
- **API**: 1-2GB RAM
- **Database**: 1GB RAM
- **Redis**: 512MB

**Total**: ~11-15GB typical usage

## Troubleshooting

### Container won't start

```bash
# Check Docker logs
docker-compose logs ollama

# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Ollama model download stuck

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Manual model pull
docker exec jarvis-ollama ollama pull mistral:latest
```

### Database connection error

```bash
# Reset database
docker-compose down -v postgres_data
docker-compose up -d db
```

### Out of memory errors

Reduce resource limits in `docker-compose.yml`:

```yaml
ollama:
  deploy:
    resources:
      limits:
        memory: 8G  # Reduce from 12G
```

### Email Connection Issues

**Microsoft/Outlook OAuth:**
- Ensure tenant ID matches your organization
- Check app registration permissions
- Verify client credentials

**Office 365 IMAP/SMTP:**
- Verify IMAP/SMTP are enabled in mailbox
- Use App Password (not regular password)
- Check firewall if using corporate network

## Production Deployment

For production use:

1. Set `ENVIRONMENT=production` in `.env`
2. Set `DEBUG=false`
3. Enable SSL certificates in nginx config
4. Use strong `SECRET_KEY` and JWT keys
5. Configure regular backups for PostgreSQL

See [Security Guide](./SECURITY.md) for details.

## Next Steps

- [API Documentation](./API.md)
- [Integration Setup](./INTEGRATIONS.md)
- [Security Guide](./SECURITY.md)

## Support

For issues, check logs:

```bash
# API logs
docker-compose logs -f api

# Database logs
docker-compose logs -f db

# All logs
docker-compose logs -f
```
