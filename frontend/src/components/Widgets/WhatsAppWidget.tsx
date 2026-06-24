import { MessageCircle, CheckCheck } from 'lucide-react';
import type { WidgetConfig, WhatsAppMessage } from '@/types';
import { WidgetCard } from '@/components/common/WidgetCard';

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_MESSAGES: WhatsAppMessage[] = [
  {
    id: 'w1',
    contact: 'Sarah Chen',
    contactPhone: '+49 170 1234567',
    lastMessage: 'Hey! Did you get a chance to review the Q4 report? It\'s important for tomorrow\'s meeting.',
    receivedAt: '3m ago',
    isRead: false,
    unreadCount: 3,
    avatarInitials: 'SC',
    priority: 'high',
  },
  {
    id: 'w2',
    contact: 'Team JARVIS Dev',
    lastMessage: 'Build successful ✅ Dashboard deployed to staging',
    receivedAt: '18m ago',
    isRead: false,
    unreadCount: 7,
    avatarInitials: 'TJ',
    priority: 'medium',
  },
  {
    id: 'w3',
    contact: 'Max Müller',
    lastMessage: 'Kannst du morgen um 10 Uhr?',
    receivedAt: '1h ago',
    isRead: true,
    unreadCount: 0,
    avatarInitials: 'MM',
    priority: 'medium',
  },
  {
    id: 'w4',
    contact: 'Anna Schmidt',
    lastMessage: 'Invoice sent! Please confirm receipt.',
    receivedAt: '2h ago',
    isRead: true,
    unreadCount: 0,
    avatarInitials: 'AS',
    priority: 'high',
    status: 'read',
  },
  {
    id: 'w5',
    contact: 'Newsletter Bot',
    lastMessage: 'Your weekly digest is ready 📊',
    receivedAt: '4h ago',
    isRead: true,
    unreadCount: 0,
    avatarInitials: 'NB',
    priority: 'low',
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ff3366',
  medium: '#ffaa00',
  low: '#3a6b8a',
};

interface WhatsAppWidgetProps {
  config: WidgetConfig;
  onMinimize?: () => void;
  onClose?: () => void;
  dragHandleProps?: Record<string, unknown> | null;
  isDragging?: boolean;
}

export function WhatsAppWidget({ config, onMinimize, onClose, dragHandleProps, isDragging }: WhatsAppWidgetProps) {
  const unread = MOCK_MESSAGES.filter(m => !m.isRead).length;
  const totalUnread = MOCK_MESSAGES.reduce((sum, m) => sum + m.unreadCount, 0);

  return (
    <WidgetCard
      config={config}
      onMinimize={onMinimize}
      onClose={onClose}
      dragHandleProps={dragHandleProps}
      isDragging={isDragging}
      accentColor="#00ff88"
      icon={<MessageCircle size={14} />}
    >
      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a2d50]">
        <span className="text-xs font-mono text-[#7ab8d4]">
          {unread} CHATS · {totalUnread} MESSAGES
        </span>
        <span
          className="text-xs font-mono font-semibold"
          style={{ color: '#00ff88' }}
        >
          CONNECTED
        </span>
      </div>

      {/* Chat list */}
      <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
        {MOCK_MESSAGES.map(msg => (
          <div
            key={msg.id}
            className="flex items-start gap-3 px-3 py-2.5 border-b border-[#1a2d50]
                       hover:bg-[#132040] transition-colors cursor-pointer"
          >
            {/* Avatar */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono"
              style={{
                backgroundColor: `${PRIORITY_COLORS[msg.priority]}22`,
                border: `1px solid ${PRIORITY_COLORS[msg.priority]}44`,
                color: PRIORITY_COLORS[msg.priority],
              }}
            >
              {msg.avatarInitials}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs font-semibold truncate ${!msg.isRead ? 'text-[#e0f4ff]' : 'text-[#7ab8d4]'}`}>
                  {msg.contact}
                </span>
                <span className="text-[10px] font-mono text-[#3a6b8a] flex-shrink-0">
                  {msg.receivedAt}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {msg.status === 'read' && (
                  <CheckCheck size={10} className="flex-shrink-0" style={{ color: '#00ff88' }} />
                )}
                <p className={`text-xs truncate ${!msg.isRead ? 'text-[#7ab8d4]' : 'text-[#3a6b8a]'}`}>
                  {msg.lastMessage}
                </p>
              </div>
            </div>

            {/* Unread badge */}
            {msg.unreadCount > 0 && (
              <span
                className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center
                           text-[9px] font-bold font-mono text-[#0a1428]"
                style={{ backgroundColor: '#00ff88' }}
              >
                {msg.unreadCount > 9 ? '9+' : msg.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
