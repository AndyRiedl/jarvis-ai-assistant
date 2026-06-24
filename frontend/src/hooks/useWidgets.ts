import { useState, useCallback } from 'react';
import type { WidgetConfig, WidgetColumn, WidgetType } from '@/types';

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'email-1', type: 'email', title: 'Email Inbox', column: 'left', order: 0, visible: true, minimized: false },
  { id: 'whatsapp-1', type: 'whatsapp', title: 'WhatsApp', column: 'left', order: 1, visible: true, minimized: false },
  { id: 'jarvis-hub-1', type: 'jarvis-hub', title: 'JARVIS Hub', column: 'center', order: 0, visible: true, minimized: false },
  { id: 'news-1', type: 'news', title: 'News Feed', column: 'right', order: 0, visible: true, minimized: false },
  { id: 'instagram-1', type: 'instagram', title: 'Instagram', column: 'right', order: 1, visible: true, minimized: false },
];

const STORAGE_KEY = 'jarvis-dashboard-layout';

function loadFromStorage(): WidgetConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as WidgetConfig[];
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_WIDGETS;
}

function saveToStorage(widgets: WidgetConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch {
    // ignore storage errors
  }
}

export function useWidgets() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadFromStorage);

  const updateWidgets = useCallback((updated: WidgetConfig[]) => {
    setWidgets(updated);
    saveToStorage(updated);
  }, []);

  const toggleMinimized = useCallback((id: string) => {
    setWidgets(prev => {
      const next = prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w);
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const next = prev.filter(w => w.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const addWidget = useCallback((type: WidgetType, column: WidgetColumn) => {
    const typeLabels: Record<WidgetType, string> = {
      email: 'Email Inbox',
      whatsapp: 'WhatsApp',
      'jarvis-hub': 'JARVIS Hub',
      news: 'News Feed',
      instagram: 'Instagram',
    };

    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type,
      title: typeLabels[type],
      column,
      order: widgets.filter(w => w.column === column).length,
      visible: true,
      minimized: false,
    };

    setWidgets(prev => {
      const next = [...prev, newWidget];
      saveToStorage(next);
      return next;
    });
  }, [widgets]);

  const moveWidget = useCallback((id: string, toColumn: WidgetColumn, toIndex: number) => {
    setWidgets(prev => {
      const widget = prev.find(w => w.id === id);
      if (!widget) return prev;

      // Remove from old position
      const without = prev.filter(w => w.id !== id);

      // Re-order within the target column
      const columnWidgets = without.filter(w => w.column === toColumn);
      const others = without.filter(w => w.column !== toColumn);

      columnWidgets.splice(toIndex, 0, { ...widget, column: toColumn });

      const reordered = [
        ...others,
        ...columnWidgets.map((w, i) => ({ ...w, order: i })),
      ];

      saveToStorage(reordered);
      return reordered;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    saveToStorage(DEFAULT_WIDGETS);
  }, []);

  const byColumn = useCallback((column: WidgetColumn): WidgetConfig[] => {
    return widgets
      .filter(w => w.column === column && w.visible)
      .sort((a, b) => a.order - b.order);
  }, [widgets]);

  return {
    widgets,
    byColumn,
    addWidget,
    removeWidget,
    toggleMinimized,
    moveWidget,
    resetLayout,
    updateWidgets,
  };
}
