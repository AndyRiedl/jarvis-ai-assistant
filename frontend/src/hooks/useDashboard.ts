import { useState, useEffect } from 'react';
import type { JarvisHubState } from '@/types';

const UPTIME_START = Date.now();

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function useDashboard() {
  const [hubState, setHubState] = useState<JarvisHubState>({
    status: 'online',
    uptime: '00:00:00',
    lastSync: new Date().toLocaleTimeString(),
    metrics: [
      { label: 'CPU', value: 12, unit: '%', status: 'good' },
      { label: 'RAM', value: 3.2, unit: 'GB', status: 'good' },
      { label: 'NET', value: 42, unit: 'ms', status: 'good' },
      { label: 'TEMP', value: 48, unit: '°C', status: 'good' },
    ],
    activeModules: ['Email', 'WhatsApp', 'News', 'Instagram'],
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setHubState(prev => ({
        ...prev,
        uptime: formatUptime(Date.now() - UPTIME_START),
        metrics: prev.metrics.map(m => ({
          ...m,
          value:
            m.label === 'CPU'
              ? Math.max(5, Math.min(80, Number(m.value) + (Math.random() - 0.5) * 6))
              : m.label === 'NET'
              ? Math.max(10, Math.min(100, Number(m.value) + (Math.random() - 0.5) * 10))
              : m.value,
        })),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { hubState, currentTime };
}
