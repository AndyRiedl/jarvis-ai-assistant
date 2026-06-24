import { useState } from 'react';
import { Plus, X, Mail, MessageCircle, Cpu, Newspaper, Camera, RotateCcw } from 'lucide-react';
import type { WidgetType, WidgetColumn } from '@/types';

interface WidgetTemplate {
  type: WidgetType;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultColumn: WidgetColumn;
  color: string;
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'email',
    label: 'Email Inbox',
    description: 'Prioritized email notifications',
    icon: <Mail size={16} />,
    defaultColumn: 'left',
    color: '#00d4ff',
  },
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    description: 'WhatsApp Business messages',
    icon: <MessageCircle size={16} />,
    defaultColumn: 'left',
    color: '#00ff88',
  },
  {
    type: 'jarvis-hub',
    label: 'JARVIS Hub',
    description: 'Central AI assistant hub',
    icon: <Cpu size={16} />,
    defaultColumn: 'center',
    color: '#00d4ff',
  },
  {
    type: 'news',
    label: 'News Feed',
    description: 'Live news & tech updates',
    icon: <Newspaper size={16} />,
    defaultColumn: 'right',
    color: '#ffaa00',
  },
  {
    type: 'instagram',
    label: 'Instagram',
    description: 'Content calendar & schedule',
    icon: <Camera size={16} />,
    defaultColumn: 'right',
    color: '#ff6b35',
  },
];

interface WidgetManagerProps {
  onAddWidget: (type: WidgetType, column: WidgetColumn) => void;
  onResetLayout: () => void;
}

export function WidgetManager({ onAddWidget, onResetLayout }: WidgetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<WidgetColumn>('left');

  const handleAdd = (type: WidgetType) => {
    const tmpl = WIDGET_TEMPLATES.find(t => t.type === type);
    onAddWidget(type, tmpl?.defaultColumn ?? selectedColumn);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1a2d50] text-xs font-mono
                   text-[#7ab8d4] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all duration-200"
        title="Add widget"
      >
        {isOpen ? <X size={13} /> : <Plus size={13} />}
        <span>{isOpen ? 'Close' : 'Add Widget'}</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="absolute top-10 right-0 z-50 w-72 rounded-lg border border-[#1a2d50] bg-[#0d1a35] shadow-2xl"
          style={{ boxShadow: '0 0 30px rgba(0,212,255,0.15)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2d50]">
            <span className="text-xs font-mono text-[#00d4ff] tracking-widest">WIDGET LIBRARY</span>
            <button
              onClick={onResetLayout}
              className="flex items-center gap-1 text-[9px] font-mono text-[#3a6b8a] hover:text-[#ffaa00] transition-colors"
              title="Reset to default layout"
            >
              <RotateCcw size={10} />
              RESET LAYOUT
            </button>
          </div>

          {/* Column selector */}
          <div className="flex border-b border-[#1a2d50]">
            {(['left', 'center', 'right'] as WidgetColumn[]).map(col => (
              <button
                key={col}
                onClick={() => setSelectedColumn(col)}
                className={`flex-1 py-1.5 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                  selectedColumn === col
                    ? 'text-[#00d4ff] border-b-2 border-[#00d4ff]'
                    : 'text-[#3a6b8a] hover:text-[#7ab8d4]'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Widget templates */}
          <div className="p-2 flex flex-col gap-1">
            {WIDGET_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.type}
                onClick={() => handleAdd(tmpl.type)}
                className="flex items-center gap-3 px-3 py-2.5 rounded border border-[#1a2d50]
                           hover:border-[#00d4ff] hover:bg-[#132040] transition-all duration-150 text-left group"
              >
                <span
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded border"
                  style={{
                    color: tmpl.color,
                    borderColor: `${tmpl.color}44`,
                    backgroundColor: `${tmpl.color}11`,
                  }}
                >
                  {tmpl.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-semibold text-[#e0f4ff] group-hover:text-[#00d4ff] transition-colors">
                    {tmpl.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#3a6b8a]">{tmpl.description}</div>
                </div>
                <Plus size={11} className="text-[#3a6b8a] group-hover:text-[#00d4ff] transition-colors" />
              </button>
            ))}
          </div>

          <div className="px-4 py-2 border-t border-[#1a2d50]">
            <p className="text-[9px] font-mono text-[#3a6b8a] text-center">
              Widgets are added to their default column. Drag to rearrange.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
