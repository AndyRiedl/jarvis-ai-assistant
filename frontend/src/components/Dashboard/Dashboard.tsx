import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { EmailWidget } from '@/components/Widgets/EmailWidget';
import { WhatsAppWidget } from '@/components/Widgets/WhatsAppWidget';
import { JarvisHub } from '@/components/Widgets/JarvisHub';
import { NewsWidget } from '@/components/Widgets/NewsWidget';
import { InstagramWidget } from '@/components/Widgets/InstagramWidget';
import { WidgetManager } from '@/components/WidgetManager/WidgetManager';
import { useWidgets } from '@/hooks/useWidgets';
import type { WidgetConfig, WidgetColumn, WidgetType } from '@/types';

// ── Widget renderer ─────────────────────────────────────────────────────────
function renderWidget(
  widget: WidgetConfig,
  onMinimize: () => void,
  onClose: () => void,
  dragHandleProps: Record<string, unknown> | null,
  isDragging: boolean,
) {
  const sharedProps = { config: widget, onMinimize, onClose, dragHandleProps, isDragging };

  switch (widget.type) {
    case 'email':
      return <EmailWidget {...sharedProps} />;
    case 'whatsapp':
      return <WhatsAppWidget {...sharedProps} />;
    case 'jarvis-hub':
      return <JarvisHub config={widget} />;
    case 'news':
      return <NewsWidget {...sharedProps} />;
    case 'instagram':
      return <InstagramWidget {...sharedProps} />;
    default:
      return null;
  }
}

// ── Column ──────────────────────────────────────────────────────────────────
interface ColumnProps {
  column: WidgetColumn;
  widgets: WidgetConfig[];
  onMinimize: (id: string) => void;
  onClose: (id: string) => void;
  className?: string;
}

function DashboardColumn({ column, widgets, onMinimize, onClose, className = '' }: ColumnProps) {
  const isCenter = column === 'center';

  return (
    <Droppable droppableId={column}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex flex-col gap-3 h-full transition-all duration-200
            ${snapshot.isDraggingOver ? 'bg-[#00d4ff08] rounded-lg' : ''}
            ${className}`}
        >
          {widgets.map((widget, index) => (
            <Draggable key={widget.id} draggableId={widget.id} index={index}>
              {(drag, dragSnapshot) => (
                <div
                  ref={drag.innerRef}
                  {...drag.draggableProps}
                  className={`${isCenter ? 'flex-1' : ''}`}
                >
                  {renderWidget(
                    widget,
                    () => onMinimize(widget.id),
                    () => onClose(widget.id),
                   drag.dragHandleProps as unknown as Record<string, unknown> | null,
                    dragSnapshot.isDragging,
                  )}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export function Dashboard() {
  const { byColumn, addWidget, removeWidget, toggleMinimized, moveWidget, resetLayout } = useWidgets();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    moveWidget(draggableId, destination.droppableId as WidgetColumn, destination.index);
  };

  const currentTime = new Date();

  return (
    <div className="flex flex-col h-full bg-[#0a1428] bg-grid">
      {/* ── Top Nav Bar ───────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#1a2d50] flex-shrink-0">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse"
            style={{ boxShadow: '0 0 8px #00d4ff' }}
          />
          <span className="font-mono text-sm font-bold text-[#00d4ff] tracking-[0.25em] glow-text">
            J.A.R.V.I.S
          </span>
          <span className="text-[10px] font-mono text-[#3a6b8a] tracking-wider hidden sm:inline">
            PERSONAL AI DASHBOARD
          </span>
        </div>

        {/* Center: date */}
        <div className="text-[10px] font-mono text-[#3a6b8a] tracking-wider">
          {currentTime.toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).toUpperCase()}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#1a2d50]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00ff88]">ONLINE</span>
          </div>
          <WidgetManager
            onAddWidget={(type: WidgetType, column: WidgetColumn) => addWidget(type, column)}
            onResetLayout={resetLayout}
          />
        </div>
      </header>

      {/* ── Main Grid ─────────────────────────────────────────────── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="flex-1 flex gap-3 p-4 overflow-hidden min-h-0">
          {/* Left Sidebar */}
          <aside className="w-80 flex-shrink-0 overflow-y-auto">
            <DashboardColumn
              column="left"
              widgets={byColumn('left')}
              onMinimize={toggleMinimized}
              onClose={removeWidget}
            />
          </aside>

          {/* Center */}
          <section className="flex-1 overflow-y-auto">
            <div
              className="h-full jarvis-card"
              style={{ boxShadow: '0 0 40px rgba(0,212,255,0.1)' }}
            >
              <DashboardColumn
                column="center"
                widgets={byColumn('center')}
                onMinimize={toggleMinimized}
                onClose={removeWidget}
                className="h-full"
              />
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="w-80 flex-shrink-0 overflow-y-auto">
            <DashboardColumn
              column="right"
              widgets={byColumn('right')}
              onMinimize={toggleMinimized}
              onClose={removeWidget}
            />
          </aside>
        </main>
      </DragDropContext>

      {/* ── Status Bar ────────────────────────────────────────────── */}
      <footer className="flex items-center justify-between px-6 py-1.5 border-t border-[#1a2d50] flex-shrink-0">
        <div className="flex items-center gap-4">
          {[
            { label: 'API', status: true },
            { label: 'DB', status: true },
            { label: 'REDIS', status: true },
            { label: 'LLM', status: true },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full"
                style={{
                  backgroundColor: status ? '#00ff88' : '#ff3366',
                  boxShadow: `0 0 4px ${status ? '#00ff88' : '#ff3366'}`,
                }}
              />
              <span className="text-[9px] font-mono text-[#3a6b8a]">{label}</span>
            </div>
          ))}
        </div>

        <div className="text-[9px] font-mono text-[#1a2d50]">
          JARVIS AI ASSISTANT · v0.1.0 · SECURE LOCAL DEPLOYMENT
        </div>

        <div className="text-[9px] font-mono text-[#3a6b8a]">
          DRAG WIDGETS TO REARRANGE
        </div>
      </footer>
    </div>
  );
}
