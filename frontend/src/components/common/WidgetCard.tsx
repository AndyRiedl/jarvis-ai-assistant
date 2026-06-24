import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';
import type { WidgetConfig } from '@/types';

interface WidgetCardProps {
  config: WidgetConfig;
  children: ReactNode;
  onMinimize?: () => void;
  onClose?: () => void;
  dragHandleProps?: Record<string, unknown> | null;
  isDragging?: boolean;
  accentColor?: string;
  icon?: ReactNode;
}

export function WidgetCard({
  config,
  children,
  onMinimize,
  onClose,
  dragHandleProps,
  isDragging = false,
  accentColor = '#00d4ff',
  icon,
}: WidgetCardProps) {
  return (
    <div
      className={`jarvis-card flex flex-col transition-all duration-200 ${
        isDragging ? 'widget-dragging' : ''
      }`}
      style={{
        borderColor: isDragging ? accentColor : undefined,
      }}
    >
      {/* Header */}
      <div className="jarvis-card-header select-none">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <span
            {...dragHandleProps}
            className="text-[#3a6b8a] hover:text-[#00d4ff] cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </span>

          {/* Icon */}
          {icon && (
            <span style={{ color: accentColor }}>{icon}</span>
          )}

          {/* Title */}
          <h3
            className="text-sm font-semibold tracking-widest uppercase font-mono"
            style={{ color: accentColor }}
          >
            {config.title}
          </h3>

          {/* Status dot */}
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-cyan"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 text-[#3a6b8a] hover:text-[#00d4ff] transition-colors rounded"
              title={config.minimized ? 'Expand' : 'Minimize'}
            >
              {config.minimized ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#3a6b8a] hover:text-[#ff3366] transition-colors rounded"
              title="Remove widget"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!config.minimized && (
        <div className="flex-1 overflow-hidden">{children}</div>
      )}
    </div>
  );
}
