import { Camera, Image, Video, Layers, PlayCircle, Clock, CheckCircle2, AlertTriangle, FileEdit } from 'lucide-react';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import type { WidgetConfig, InstagramPost } from '@/types';
import { WidgetCard } from '@/components/common/WidgetCard';

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_POSTS: InstagramPost[] = [
  {
    id: 'ig1',
    caption: '🚀 Exciting news! Our JARVIS AI assistant is live! The future of personal productivity is here. #AI #Tech #Innovation',
    scheduledFor: 'Today, 10:00',
    status: 'scheduled',
    mediaType: 'image',
    hashtags: ['#AI', '#Tech', '#Innovation'],
    estimatedReach: 2400,
  },
  {
    id: 'ig2',
    caption: 'Behind the scenes: building a cyberpunk dashboard with React + TypeScript 🛠️ #Dev #ReactJS #WebDev',
    scheduledFor: 'Today, 14:00',
    status: 'scheduled',
    mediaType: 'reel',
    hashtags: ['#Dev', '#ReactJS', '#WebDev'],
    estimatedReach: 5100,
  },
  {
    id: 'ig3',
    caption: '5 tips for better code architecture 💡',
    scheduledFor: 'Yesterday, 09:30',
    status: 'published',
    mediaType: 'carousel',
    hashtags: ['#SoftwareDev', '#CleanCode'],
    estimatedReach: 3200,
  },
  {
    id: 'ig4',
    caption: 'Morning routine for developers ☕',
    scheduledFor: 'Yesterday, 18:00',
    status: 'published',
    mediaType: 'image',
    hashtags: ['#DevLife'],
    estimatedReach: 1800,
  },
  {
    id: 'ig5',
    caption: 'Docker tutorial – containerise your apps 🐳',
    scheduledFor: 'Tomorrow, 11:00',
    status: 'draft',
    mediaType: 'video',
    hashtags: ['#Docker', '#DevOps'],
    estimatedReach: 3900,
  },
  {
    id: 'ig6',
    caption: 'Weekend hackathon results: we won! 🏆',
    scheduledFor: 'Jun 20, 20:00',
    status: 'failed',
    mediaType: 'image',
    hashtags: ['#Hackathon'],
    estimatedReach: 0,
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  scheduled: { label: 'Scheduled', color: '#00d4ff', icon: <Clock size={10} /> },
  published: { label: 'Published', color: '#00ff88', icon: <CheckCircle2 size={10} /> },
  draft: { label: 'Draft', color: '#ffaa00', icon: <FileEdit size={10} /> },
  failed: { label: 'Failed', color: '#ff3366', icon: <AlertTriangle size={10} /> },
};

const MEDIA_ICONS: Record<string, React.ReactNode> = {
  image: <Image size={11} />,
  video: <Video size={11} />,
  carousel: <Layers size={11} />,
  reel: <PlayCircle size={11} />,
};

interface InstagramWidgetProps {
  config: WidgetConfig;
  onMinimize?: () => void;
  onClose?: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
}

export function InstagramWidget({ config, onMinimize, onClose, dragHandleProps, isDragging }: InstagramWidgetProps) {
  const scheduled = MOCK_POSTS.filter(p => p.status === 'scheduled').length;
  const published = MOCK_POSTS.filter(p => p.status === 'published').length;
  const totalReach = MOCK_POSTS.reduce((sum, p) => sum + (p.estimatedReach ?? 0), 0);

  return (
    <WidgetCard
      config={config}
      onMinimize={onMinimize}
      onClose={onClose}
      dragHandleProps={dragHandleProps}
      isDragging={isDragging}
      accentColor="#ff6b35"
      icon={<Camera size={14} />}
    >
      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-[#1a2d50] border-b border-[#1a2d50]">
        {[
          { label: 'Scheduled', value: scheduled, color: '#00d4ff' },
          { label: 'Published', value: published, color: '#00ff88' },
          { label: 'Est. Reach', value: `${(totalReach / 1000).toFixed(1)}k`, color: '#ff6b35' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center py-2">
            <span className="text-sm font-mono font-bold" style={{ color }}>{value}</span>
            <span className="text-[9px] font-mono text-[#3a6b8a] tracking-wider">{label.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {/* Post list */}
      <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
        {MOCK_POSTS.map(post => {
          const statusConf = STATUS_CONFIG[post.status];
          return (
            <div
              key={post.id}
              className="px-3 py-2.5 border-b border-[#1a2d50] hover:bg-[#132040] transition-colors"
            >
              {/* Row 1: media type + scheduled time + status */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#7ab8d4]">{MEDIA_ICONS[post.mediaType]}</span>
                  <span className="text-[9px] font-mono text-[#3a6b8a] uppercase tracking-wider">
                    {post.mediaType}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono text-[#3a6b8a]">{post.scheduledFor}</span>
                  <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-mono"
                    style={{
                      color: statusConf.color,
                      borderColor: `${statusConf.color}44`,
                      backgroundColor: `${statusConf.color}11`,
                    }}
                  >
                    {statusConf.icon}
                    <span className="ml-0.5">{statusConf.label}</span>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <p className="text-xs text-[#7ab8d4] line-clamp-2 leading-snug">{post.caption}</p>

              {/* Hashtags + reach */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-1 overflow-hidden">
                  {post.hashtags?.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] font-mono text-[#ff6b35] opacity-70 truncate">
                      {tag}
                    </span>
                  ))}
                  {(post.hashtags?.length ?? 0) > 2 && (
                    <span className="text-[9px] font-mono text-[#3a6b8a]">
                      +{(post.hashtags?.length ?? 0) - 2}
                    </span>
                  )}
                </div>
                {post.estimatedReach != null && post.estimatedReach > 0 && (
                  <span className="text-[9px] font-mono text-[#3a6b8a]">
                    ~{post.estimatedReach.toLocaleString()} reach
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
