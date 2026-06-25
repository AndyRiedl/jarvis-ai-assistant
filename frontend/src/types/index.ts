// ==========================================
// Widget System Types
// ==========================================

export type WidgetType =
  | 'email'
  | 'whatsapp'
  | 'jarvis-hub'
  | 'news'
  | 'instagram';

export type WidgetColumn = 'left' | 'center' | 'right';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  column: WidgetColumn;
  order: number;
  visible: boolean;
  minimized: boolean;
  settings?: Record<string, unknown>;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  savedAt?: string;
}

// ==========================================
// Email Types
// ==========================================

export type EmailPriority = 'high' | 'medium' | 'low';

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  receivedAt: string;
  isRead: boolean;
  priority: EmailPriority;
  hasAttachment?: boolean;
  labels?: string[];
}

// ==========================================
// WhatsApp Types
// ==========================================

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'pending';

export interface WhatsAppMessage {
  id: string;
  contact: string;
  contactPhone?: string;
  lastMessage: string;
  receivedAt: string;
  isRead: boolean;
  unreadCount: number;
  avatarInitials: string;
  status?: MessageStatus;
  priority: EmailPriority;
}

// ==========================================
// News Types
// ==========================================

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary?: string;
  category: string;
  imageUrl?: string;
}

// ==========================================
// Instagram Types
// ==========================================

export type PostStatus = 'scheduled' | 'published' | 'draft' | 'failed';

export interface InstagramPost {
  id: string;
  caption: string;
  scheduledFor: string;
  status: PostStatus;
  mediaType: 'image' | 'video' | 'carousel' | 'reel';
  imageUrl?: string;
  hashtags?: string[];
  estimatedReach?: number;
}

// ==========================================
// JARVIS Hub Types
// ==========================================

export type JarvisStatus = 'online' | 'thinking' | 'offline' | 'alert';

export interface SystemMetric {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
}

export interface JarvisHubState {
  status: JarvisStatus;
  uptime: string;
  lastSync: string;
  metrics: SystemMetric[];
  activeModules: string[];
}

// ==========================================
// Chat / Voice Types
// ==========================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  perPage: number;
}
