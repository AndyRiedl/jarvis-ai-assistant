import { Cpu, Wifi, Zap, Shield, Activity, Clock } from 'lucide-react';
import type { WidgetConfig } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface JarvisHubProps {
  config: WidgetConfig;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Email: <Zap size={11} />,
  WhatsApp: <Wifi size={11} />,
  News: <Activity size={11} />,
  Instagram: <Cpu size={11} />,
};

export function JarvisHub({ config }: JarvisHubProps) {
  const { hubState, currentTime } = useDashboard();

  if (config.minimized) return null;

  const statusColor = {
    online: '#00ff88',
    thinking: '#ffaa00',
    offline: '#ff3366',
    alert: '#ff6b35',
  }[hubState.status];

  return (
    <div className="flex flex-col items-center gap-6 p-6 select-none">
      {/* ── Time Display ─────────────────────────────────────────── */}
      <div className="text-center">
        <div className="font-mono text-4xl font-bold text-[#00d4ff] glow-text tracking-widest">
          {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="font-mono text-xs text-[#3a6b8a] tracking-widest mt-1">
          {currentTime.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
        </div>
      </div>

      {/* ── Animated Hub ─────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {/* Outermost ring */}
        <div
          className="absolute rounded-full border border-[#00d4ff] opacity-20 animate-spin-reverse"
          style={{ width: 196, height: 196, borderStyle: 'dashed' }}
        />

        {/* Outer ring */}
        <div
          className="absolute rounded-full border-2 border-[#00d4ff] opacity-30 animate-rotate-slow"
          style={{ width: 180, height: 180 }}
        />

        {/* Scan line inside outer ring */}
        <div className="absolute overflow-hidden rounded-full" style={{ width: 180, height: 180 }}>
          <div
            className="animate-scan absolute left-0 right-0 h-0.5 opacity-60"
            style={{ background: 'linear-gradient(transparent, #00d4ff, transparent)' }}
          />
        </div>

        {/* Middle ring */}
        <div
          className="absolute rounded-full border border-[#00d4ff] opacity-50"
          style={{ width: 150, height: 150, animationDuration: '4s' }}
        />

        {/* Inner ring */}
        <div
          className="absolute rounded-full border border-[#00d4ff] animate-pulse-cyan"
          style={{ width: 120, height: 120 }}
        />

        {/* Core glow */}
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: 90,
            height: 90,
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 60%, transparent 80%)',
          }}
        />

        {/* Center circle */}
        <div
          className="relative z-10 flex flex-col items-center justify-center rounded-full border-2"
          style={{
            width: 80,
            height: 80,
            borderColor: statusColor,
            backgroundColor: `${statusColor}15`,
            boxShadow: `0 0 20px ${statusColor}40, 0 0 40px ${statusColor}20`,
          }}
        >
          <Shield size={22} style={{ color: statusColor }} className="animate-glow-pulse" />
          <span
            className="text-[9px] font-mono font-bold tracking-widest mt-0.5"
            style={{ color: statusColor }}
          >
            {hubState.status.toUpperCase()}
          </span>
        </div>

        {/* Orbit dots */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#00d4ff]"
            style={{
              width: 5,
              height: 5,
              top: '50%',
              left: '50%',
              transform: `rotate(${deg}deg) translateX(87px) translateY(-50%)`,
              opacity: 0.7,
              boxShadow: '0 0 6px #00d4ff',
            }}
          />
        ))}
      </div>

      {/* ── System Label ─────────────────────────────────────────── */}
      <div className="text-center">
        <h1 className="font-mono text-2xl font-bold text-[#00d4ff] glow-text tracking-[0.3em]">
          J.A.R.V.I.S
        </h1>
        <p className="text-xs font-mono text-[#3a6b8a] tracking-widest">
          PERSONAL AI ASSISTANT v0.1.0
        </p>
      </div>

      {/* ── Uptime & Sync ─────────────────────────────────────────── */}
      <div className="flex items-center gap-6 text-center">
        <div>
          <div className="flex items-center gap-1 text-[#3a6b8a]">
            <Clock size={10} />
            <span className="text-[10px] font-mono uppercase tracking-wider">Uptime</span>
          </div>
          <div className="font-mono text-sm text-[#00d4ff] font-semibold">{hubState.uptime}</div>
        </div>
        <div className="w-px h-8 bg-[#1a2d50]" />
        <div>
          <div className="flex items-center gap-1 text-[#3a6b8a]">
            <Wifi size={10} />
            <span className="text-[10px] font-mono uppercase tracking-wider">Last Sync</span>
          </div>
          <div className="font-mono text-sm text-[#00d4ff] font-semibold">{hubState.lastSync}</div>
        </div>
      </div>

      {/* ── System Metrics ─────────────────────────────────────────── */}
      <div className="w-full grid grid-cols-4 gap-2">
        {hubState.metrics.map(metric => {
          const val = typeof metric.value === 'number' ? Math.round(metric.value) : metric.value;
          const pct = metric.unit === '%' ? Number(val) : null;
          const barColor = metric.status === 'warning' ? '#ffaa00' : metric.status === 'critical' ? '#ff3366' : '#00d4ff';
          return (
            <div
              key={metric.label}
              className="flex flex-col items-center gap-1.5 p-2 rounded border border-[#1a2d50] bg-[#0d1a35]"
            >
              <span className="text-[9px] font-mono text-[#3a6b8a] tracking-widest">{metric.label}</span>
              <span className="text-sm font-mono font-bold" style={{ color: barColor }}>
                {val}{metric.unit && metric.unit !== '%' ? metric.unit : ''}
                {metric.unit === '%' ? '%' : ''}
              </span>
              {pct !== null && (
                <div className="w-full h-0.5 bg-[#1a2d50] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Active Modules ─────────────────────────────────────────── */}
      <div className="w-full">
        <div className="text-[9px] font-mono text-[#3a6b8a] tracking-widest mb-2 text-center">
          ACTIVE MODULES
        </div>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {hubState.activeModules.map(module => (
            <div
              key={module}
              className="flex items-center gap-1 px-2 py-1 rounded border border-[#1a2d50] bg-[#0d1a35]"
            >
              <span className="text-[#00d4ff]">{MODULE_ICONS[module] ?? <Zap size={11} />}</span>
              <span className="text-[10px] font-mono text-[#7ab8d4]">{module}</span>
              <span className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
