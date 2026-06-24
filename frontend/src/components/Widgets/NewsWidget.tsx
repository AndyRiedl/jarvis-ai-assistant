import { useState } from 'react';
import { Newspaper, ExternalLink, TrendingUp } from 'lucide-react';
import type { WidgetConfig, NewsArticle } from '@/types';
import { WidgetCard } from '@/components/common/WidgetCard';

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'OpenAI releases GPT-5 with unprecedented reasoning capabilities',
    source: 'TechCrunch',
    publishedAt: '12m ago',
    url: '#',
    category: 'AI',
    summary: 'OpenAI has unveiled GPT-5, claiming significant improvements in multi-step reasoning and code generation tasks.',
  },
  {
    id: 'n2',
    title: 'Apple unveils Vision Pro 2 with 8K micro-OLED displays',
    source: 'The Verge',
    publishedAt: '1h ago',
    url: '#',
    category: 'Tech',
    summary: 'The second generation of Apple\'s spatial computing headset features dramatically improved display resolution.',
  },
  {
    id: 'n3',
    title: 'EU AI Act enforcement begins — what businesses need to know',
    source: 'Reuters',
    publishedAt: '2h ago',
    url: '#',
    category: 'Regulation',
    summary: 'Companies operating in Europe must now comply with the world\'s first comprehensive AI law.',
  },
  {
    id: 'n4',
    title: 'Mistral releases Mixtral 8x22B open-source LLM',
    source: 'Wired',
    publishedAt: '3h ago',
    url: '#',
    category: 'AI',
    summary: 'The French AI startup continues its push for open-source LLMs with a new state-of-the-art model.',
  },
  {
    id: 'n5',
    title: 'Bitcoin surpasses $100k again amid institutional inflows',
    source: 'Bloomberg',
    publishedAt: '4h ago',
    url: '#',
    category: 'Finance',
    summary: 'Major ETF providers report record inflows as Bitcoin hits another all-time high.',
  },
  {
    id: 'n6',
    title: 'React 20 roadmap: what\'s coming next for the frontend framework',
    source: 'Dev.to',
    publishedAt: '5h ago',
    url: '#',
    category: 'Dev',
    summary: 'The React core team shared the roadmap for the next major version focusing on server components.',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  AI: '#00d4ff',
  Tech: '#7ab8d4',
  Regulation: '#ffaa00',
  Finance: '#00ff88',
  Dev: '#ff6b35',
  Default: '#3a6b8a',
};

interface NewsWidgetProps {
  config: WidgetConfig;
  onMinimize?: () => void;
  onClose?: () => void;
  dragHandleProps?: Record<string, unknown> | null;
  isDragging?: boolean;
}

export function NewsWidget({ config, onMinimize, onClose, dragHandleProps, isDragging }: NewsWidgetProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(MOCK_NEWS.map(n => n.category)));
  const filtered = activeCategory ? MOCK_NEWS.filter(n => n.category === activeCategory) : MOCK_NEWS;

  return (
    <WidgetCard
      config={config}
      onMinimize={onMinimize}
      onClose={onClose}
      dragHandleProps={dragHandleProps}
      isDragging={isDragging}
      accentColor="#ffaa00"
      icon={<Newspaper size={14} />}
    >
      {/* Category filter */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1a2d50] overflow-x-auto">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
            activeCategory === null
              ? 'border-[#ffaa00] text-[#ffaa00] bg-[#ffaa0015]'
              : 'border-[#1a2d50] text-[#3a6b8a] hover:border-[#3a6b8a]'
          }`}
        >
          ALL
        </button>
        {categories.map(cat => {
          const color = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Default'];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className="flex-shrink-0 text-[9px] font-mono px-2 py-0.5 rounded border transition-colors"
              style={{
                borderColor: isActive ? color : '#1a2d50',
                color: isActive ? color : '#3a6b8a',
                backgroundColor: isActive ? `${color}15` : undefined,
              }}
            >
              {cat.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Trending indicator */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#1a2d50]">
        <TrendingUp size={10} className="text-[#ffaa00]" />
        <span className="text-[10px] font-mono text-[#3a6b8a]">
          {filtered.length} STORIES · LIVE FEED
        </span>
      </div>

      {/* Article list */}
      <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
        {filtered.map(article => {
          const color = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS['Default'];
          return (
            <div
              key={article.id}
              className="px-3 py-2.5 border-b border-[#1a2d50] hover:bg-[#132040] transition-colors group"
            >
              {/* Category + source */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                  style={{ color, borderColor: `${color}44`, backgroundColor: `${color}11` }}
                >
                  {article.category}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono text-[#3a6b8a]">{article.source}</span>
                  <span className="text-[9px] font-mono text-[#1a2d50]">·</span>
                  <span className="text-[9px] font-mono text-[#3a6b8a]">{article.publishedAt}</span>
                </div>
              </div>

              {/* Title */}
              <a
                href={article.url}
                className="flex items-start gap-1 group-hover:text-[#00d4ff] transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <p className="text-xs text-[#e0f4ff] leading-snug flex-1">{article.title}</p>
                <ExternalLink
                  size={10}
                  className="flex-shrink-0 mt-0.5 text-[#3a6b8a] group-hover:text-[#00d4ff] transition-colors"
                />
              </a>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
