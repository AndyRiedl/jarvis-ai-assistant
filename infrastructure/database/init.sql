-- JARVIS Database Initialization

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- Core Tables
-- ==========================================

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    tokens_used INT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Email Integration Tables
-- ==========================================

-- Email Accounts Table
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL, -- 'microsoft', 'gmail', etc
    email_address VARCHAR(255) NOT NULL UNIQUE,
    encrypted_credentials TEXT NOT NULL, -- Encrypted OAuth tokens or App Password
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emails Table
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    cc VARCHAR(1000),
    subject VARCHAR(1000),
    body TEXT,
    html_body TEXT,
    external_id VARCHAR(255), -- Message ID from provider
    is_read BOOLEAN DEFAULT FALSE,
    ai_response_suggestion TEXT,
    ai_response_confidence FLOAT,
    received_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Instagram Integration Tables
-- ==========================================

-- Instagram Accounts Table
CREATE TABLE IF NOT EXISTS instagram_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_account_id VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255),
    encrypted_access_token TEXT NOT NULL,
    followers_count INT,
    following_count INT,
    posts_count INT,
    biography TEXT,
    profile_picture_url TEXT,
    last_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instagram Posts Table
CREATE TABLE IF NOT EXISTS instagram_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    caption TEXT,
    image_url TEXT,
    video_url TEXT,
    external_post_id VARCHAR(255),
    like_count INT,
    comment_count INT,
    reach INT,
    impressions INT,
    posted_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'posted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instagram Comments Table
CREATE TABLE IF NOT EXISTS instagram_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES instagram_posts(id) ON DELETE CASCADE,
    author_username VARCHAR(255),
    comment_text TEXT,
    external_comment_id VARCHAR(255),
    ai_response_suggestion TEXT,
    is_responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- LinkedIn Integration Tables
-- ==========================================

-- LinkedIn Accounts Table
CREATE TABLE IF NOT EXISTS linkedin_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id VARCHAR(255) NOT NULL UNIQUE,
    organization_name VARCHAR(255),
    encrypted_access_token TEXT NOT NULL,
    followers_count INT,
    last_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LinkedIn Posts Table
CREATE TABLE IF NOT EXISTS linkedin_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES linkedin_accounts(id) ON DELETE CASCADE,
    content TEXT,
    external_post_id VARCHAR(255),
    like_count INT,
    comment_count INT,
    share_count INT,
    posted_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WhatsApp Integration Tables
-- ==========================================

-- WhatsApp Business Accounts Table
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_account_id VARCHAR(255) NOT NULL UNIQUE,
    phone_number_id VARCHAR(255),
    encrypted_access_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    message_text TEXT,
    external_message_id VARCHAR(255),
    direction VARCHAR(20), -- 'inbound' or 'outbound'
    ai_response_suggestion TEXT,
    is_responded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Content Planning Tables
-- ==========================================

-- Content Ideas Table
CREATE TABLE IF NOT EXISTS content_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'linkedin', etc
    title VARCHAR(255),
    description TEXT,
    suggested_content TEXT,
    ai_generated BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'posted'
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Indexes for Performance
-- ==========================================

CREATE INDEX idx_emails_account_id ON emails(account_id);
CREATE INDEX idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX idx_instagram_posts_account_id ON instagram_posts(account_id);
CREATE INDEX idx_instagram_posts_status ON instagram_posts(status);
CREATE INDEX idx_linkedin_posts_account_id ON linkedin_posts(account_id);
CREATE INDEX idx_whatsapp_messages_account_id ON whatsapp_messages(account_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_content_ideas_platform ON content_ideas(platform);
