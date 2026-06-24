import { useState } from 'react';
import { Mail, Paperclip, Star, AlertCircle } from 'lucide-react';
import type { WidgetConfig, Email } from '@/types';
import { WidgetCard } from '@/components/common/WidgetCard';

// ── Mock data (replace with API call) ──────────────────────────────────────
const MOCK_EMAILS: Email[] = [
  {
    id: 'e1',
    from: 'Sarah Chen',
    fromEmail: 's.chen@partner.com',
    subject: 'Q4 Strategy Review - Action Required',
    preview: 'Please review the attached Q4 strategy document and provide your feedback by EOD Friday.',
    receivedAt: '2m ago',
    isRead: false,
    priority: 'high',
    hasAttachment: true,
    labels: ['Work', 'Urgent'],
  },
  {
    id: 'e2',
    from: 'GitHub',
    fromEmail: 'noreply@github.com',
    subject: 'New pull request: feat/dashboard-ui',
    preview: 'AndyRiedl opened a pull request: Build JARVIS dashboard interface',
    receivedAt: '15m ago',
    isRead: false,
    priority: 'medium',
    labels: ['Dev'],
  },
  {
    id: 'e3',
    from: 'Max Müller',
    fromEmail: 'max@client.de',
    subject: 'Project update & next steps',
    preview: 'Hi Andy, following up on our last call. I would like to schedule a follow-up meeting.',
    receivedAt: '1h ago',
    isRead: true,
    priority: 'high',
    hasAttachment: false,
  },
  {
    id: 'e4',
    from: 'Newsletter',
    fromEmail: 'news@techcrunch.com',
    subject: 'This week in AI: GPT-5 & beyond',
    preview: 'The latest developments in artificial intelligence and what they mean for developers.',
    receivedAt: '3h ago',
    isRead: true,
    priority: 'low',
  },
  {
    id: 'e5',
    from: 'Anna Schmidt',
    fromEmail: 'a.schmidt@agency.com',
    subject: 'Invoice #2024-089 - Due in 3 days',
    preview: 'Please find attached invoice #2024-089 for the services rendered in November.',
    receivedAt: '5h ago',
    isRead: false,
    priority: 'high',
    hasAttachment: true,
    labels: ['Finance'],
  },
];

const PRIORITY_STYLES: Record<string, { dot: string; border: string }> = {
  high: { dot: 'bg-[#ff3366] priority-high', border: 'border-l-[#ff3366]' },
  medium: { dot: 'bg-[#ffaa00]', border: 'border-l-[#ffaa00]' },
  low: { dot: 'bg-[#3a6b8a]', border: 'border-l-transparent' },
};

interface EmailWidgetProps {
  config: WidgetConfig;
  onMinimize?: () => void;
  onClose?: () => void;
  dragHandleProps?: Record<string, unknown> | null;
  isDragging?: boolean;
}

export function EmailWidget({ config, onMinimize, onClose, dragHandleProps, isDragging }: EmailWidgetProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const unread = MOCK_EMAILS.filter(e => !e.isRead).length;

  return (
    <WidgetCard
      config={config}
      onMinimize={onMinimize}
      onClose={onClose}
      dragHandleProps={dragHandleProps}
      isDragging={isDragging}
      accentColor="#00d4ff"
      icon={<Mail size={14} />}
    >
      {/* Unread count */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a2d50]">
        <span className="text-xs font-mono text-[#7ab8d4]">
          {unread} UNREAD · {MOCK_EMAILS.length} TOTAL
        </span>
        <span className="text-xs font-mono text-[#ff3366] font-semibold">
          {MOCK_EMAILS.filter(e => e.priority === 'high').length} URGENT
        </span>
      </div>

      {/* Email list */}
      <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
        {MOCK_EMAILS.map(email => {
          const ps = PRIORITY_STYLES[email.priority];
          const isSelected = selected === email.id;
          return (
            <button
              key={email.id}
              onClick={() => setSelected(isSelected ? null : email.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-[#1a2d50] border-l-2 
                transition-all duration-150 hover:bg-[#132040] focus:outline-none
                ${ps.border} ${isSelected ? 'bg-[#132040]' : ''}`}
            >
              <div className="flex items-start gap-2">
                {/* Priority dot */}
                <span className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${ps.dot}`} />

                <div className="flex-1 min-w-0">
                  {/* From + time */}
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-semibold truncate ${!email.isRead ? 'text-[#e0f4ff]' : 'text-[#7ab8d4]'}`}>
                      {email.from}
                    </span>
                    <span className="text-[10px] font-mono text-[#3a6b8a] flex-shrink-0">
                      {email.receivedAt}
                    </span>
                  </div>

                  {/* Subject */}
                  <p className={`text-xs truncate ${!email.isRead ? 'text-[#00d4ff] font-medium' : 'text-[#7ab8d4]'}`}>
                    {email.subject}
                  </p>

                  {/* Preview */}
                  {isSelected && (
                    <p className="text-[11px] text-[#3a6b8a] mt-1 line-clamp-2 leading-relaxed">
                      {email.preview}
                    </p>
                  )}

                  {/* Labels + attachments */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {email.hasAttachment && (
                      <Paperclip size={10} className="text-[#3a6b8a]" />
                    )}
                    {email.priority === 'high' && (
                      <AlertCircle size={10} className="text-[#ff3366]" />
                    )}
                    {email.labels?.map(label => (
                      <span
                        key={label}
                        className="text-[9px] font-mono px-1 rounded border border-[#1a2d50] text-[#3a6b8a]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Unread star */}
                {!email.isRead && (
                  <Star size={10} className="flex-shrink-0 mt-1 text-[#00d4ff] fill-[#00d4ff]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </WidgetCard>
  );
}
