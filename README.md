# 🤖 JARVIS - Personal AI Assistant

Ein privater, lokal gehosteter KI-Assistent für E-Mail-Management, Social Media und Software-Entwicklung.

## 🎯 Features (Phase 1)

- **Chat-Interface** - Konversation mit lokalen LLM
- **Email-Management** - Email-Verwaltung mit KI-Beantwortungsvorschlägen
- **Instagram Management** - Content-Planung, Posting, Analytics
- **WhatsApp Business** - Integration für Messaging
- **LinkedIn Integration** - Post-Management und Analytics
- **Sichere Infrastruktur** - Vollständig verschlüsselt, nur lokal

## 🛠 Tech-Stack

- **Backend**: FastAPI (Python 3.11+)
- **LLM**: Ollama + Mistral-7B
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Encryption**: cryptography + python-dotenv
- **Containerization**: Docker & Docker Compose
- **Frontend**: React + TypeScript (Phase 2)

## 📋 System-Anforderungen

- **Hardware**: MacBook Pro M3 Pro, 18GB RAM (optimiert)
- **Speicher**: ~125GB frei
- **OS**: macOS 13+
- **Docker**: Docker Desktop für Mac

## 🚀 Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/AndyRiedl/jarvis-ai-assistant.git
cd jarvis-ai-assistant

# 2. Umgebungsvariablen kopieren
cp .env.example .env

# 3. Docker-Container starten
docker-compose up -d

# 4. System initialisieren
python scripts/init_system.py

# 5. API verfügbar unter
# http://localhost:8000
# WebUI (Phase 2): http://localhost:3000
```

## 📁 Projektstruktur

```
jarvis-ai-assistant/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API Endpoints
│   │   ├── core/           # Config, Security
│   │   ├── services/       # Business Logic
│   │   ├── models/         # DB Models
│   │   └── integrations/   # API Integrations
│   ├── tests/
│   └── requirements.txt
├── frontend/               # React Frontend (Phase 2)
├── infrastructure/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── nginx/
├── scripts/               # Initialization & Utils
├── docs/                  # Documentation
├── .env.example
└── README.md
```

## 🔐 Sicherheit

- ✅ Lokale Ausführung nur
- ✅ Alle API-Keys verschlüsselt
- ✅ Keine externe Datenübertragung
- ✅ JWT-basierte interne Auth
- ✅ HTTPS für lokale APIs

## 📚 Dokumentation

- [Setup-Anleitung](docs/SETUP.md)
- [API-Dokumentation](docs/API.md)
- [Integrations-Guide](docs/INTEGRATIONS.md)
- [Sicherheits-Richtlinien](docs/SECURITY.md)

## 🗓 Roadmap

### Phase 1 (2-3 Monate)
- [x] Projekt-Setup
- [ ] Lokales LLM (Ollama)
- [ ] Chat-API
- [ ] Email-Integration (Read/Send)
- [ ] Instagram Content-Planung
- [ ] Basis-WebUI

### Phase 2 (2-3 Monate)
- [ ] WhatsApp Business Integration
- [ ] LinkedIn Advanced Features
- [ ] Video/Reels Generierung
- [ ] Analytics Dashboard

### Phase 3 (3-4 Monate)
- [ ] Code-Generation & Review
- [ ] Multi-Platform Publishing
- [ ] Advanced RAG System

## 📝 Lizenz

Privat - Keine öffentliche Lizenz

## 👤 Author

Andy Riedl

---

**Status**: 🟢 In aktiver Entwicklung (Phase 1)
