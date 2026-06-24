import { useRef, useEffect, useMemo, useState, useCallback, type FormEvent } from 'react';
import { Cpu, Wifi, Zap, Shield, Activity, Mic, MicOff, Send, Trash2 } from 'lucide-react';
import type { WidgetConfig } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';
import { useVoice } from '@/hooks/useVoice';
import { useChat } from '@/hooks/useChat';
import type { ChatMessage } from '@/types';

interface JarvisHubProps {
  config: WidgetConfig;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  Email: <Zap size={11} />,
  WhatsApp: <Wifi size={11} />,
  News: <Activity size={11} />,
  Instagram: <Cpu size={11} />,
};

// ── Voice state label shown in hub center ────────────────────────────────────
const VOICE_LABEL: Record<string, string> = {
  inactive: 'OFFLINE',
  'wake-listening': 'ONLINE',
  'active-listening': 'LISTEN',
  processing: 'THINK',
};

export function JarvisHub({ config }: JarvisHubProps) {
  const { hubState, currentTime } = useDashboard();
  const chat = useChat();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Stable ref to voice actions — avoids circular dependency between
  // handleCommand (needs voice.speak) and useVoice (needs handleCommand)
  const voiceActionsRef = useRef<{
    speak: (text: string) => void;
    deactivateListening: () => void;
  } | null>(null);

  const handleCommand = useCallback(async (text: string) => {
    const reply = await chat.sendMessage(text);
    voiceActionsRef.current?.speak(reply);
    voiceActionsRef.current?.deactivateListening();
  }, [chat]);

  const voice = useVoice({
    onWakeWord: () => { /* status visual handled via voiceState */ },
    onCommand: handleCommand,
  });

  // Keep ref in sync with current voice methods every render
  voiceActionsRef.current = { speak: voice.speak, deactivateListening: voice.deactivateListening };

  // ── Derive hub status from voice + chat state ──────────────────────────────
  const effectiveStatus = useMemo(() => {
    if (!voice.isSupported || voice.voiceState === 'inactive') return hubState.status;
    if (voice.voiceState === 'active-listening') return 'alert' as const;
    if (voice.voiceState === 'processing' || chat.isLoading || voice.isSpeaking) return 'thinking' as const;
    return 'online' as const;
  }, [voice.isSupported, voice.voiceState, chat.isLoading, voice.isSpeaking, hubState.status]);

  const statusColor = {
    online: '#00ff88',
    thinking: '#ffaa00',
    offline: '#ff3366',
    alert: '#ff6b35',
  }[effectiveStatus];

  const statusLabel = VOICE_LABEL[voice.voiceState] ?? effectiveStatus.toUpperCase();

  // ── Auto-scroll chat to bottom ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // ── Text input submit ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || chat.isLoading) return;
    setInputText('');
    const reply = await chat.sendMessage(text);
    voice.speak(reply);
  }, [inputText, chat, voice]);

  if (config.minimized) return null;

  return (
    <div className="flex flex-col h-full select-none">

      {/* ── Hub Visualization (compact, fixed height) ────────────────────── */}
      <div className="flex flex-col items-center gap-3 pt-4 px-4 flex-shrink-0">
        {/* Time */}
        <div className="text-center">
          <div className="font-mono text-3xl font-bold text-[#00d4ff] glow-text tracking-widest">
            {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="font-mono text-[10px] text-[#3a6b8a] tracking-widest mt-0.5">
            {currentTime.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        {/* Animated Hub */}
        <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>
          <div
            className="absolute rounded-full border border-[#00d4ff] opacity-20 animate-spin-reverse"
            style={{ width: 148, height: 148, borderStyle: 'dashed' }}
          />
          <div
            className="absolute rounded-full border-2 border-[#00d4ff] opacity-30 animate-rotate-slow"
            style={{ width: 134, height: 134 }}
          />
          <div className="absolute overflow-hidden rounded-full" style={{ width: 134, height: 134 }}>
            <div
              className="animate-scan absolute left-0 right-0 h-0.5 opacity-60"
              style={{ background: 'linear-gradient(transparent, #00d4ff, transparent)' }}
            />
          </div>
          <div
            className="absolute rounded-full border border-[#00d4ff] opacity-50"
            style={{ width: 112, height: 112 }}
          />
          <div
            className="absolute rounded-full border border-[#00d4ff] animate-pulse-cyan"
            style={{ width: 90, height: 90 }}
          />
          <div
            className="absolute rounded-full animate-pulse"
            style={{
              width: 68,
              height: 68,
              background: `radial-gradient(circle, ${statusColor}20 0%, ${statusColor}08 60%, transparent 80%)`,
            }}
          />
          {/* Center circle */}
          <div
            className="relative z-10 flex flex-col items-center justify-center rounded-full border-2"
            style={{
              width: 60,
              height: 60,
              borderColor: statusColor,
              backgroundColor: `${statusColor}15`,
              boxShadow: `0 0 16px ${statusColor}40, 0 0 32px ${statusColor}20`,
            }}
          >
            {voice.voiceState === 'active-listening' ? (
              <Mic size={16} style={{ color: statusColor }} className="animate-pulse" />
            ) : (
              <Shield size={16} style={{ color: statusColor }} className="animate-glow-pulse" />
            )}
            <span className="text-[8px] font-mono font-bold tracking-widest mt-0.5" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
          {/* Orbit dots */}
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#00d4ff]"
              style={{
                width: 4,
                height: 4,
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateX(65px) translateY(-50%)`,
                opacity: 0.7,
                boxShadow: '0 0 6px #00d4ff',
              }}
            />
          ))}
        </div>

        {/* Label + uptime row */}
        <div className="flex items-center gap-6 w-full justify-center">
          <div className="text-center">
            <h1 className="font-mono text-lg font-bold text-[#00d4ff] glow-text tracking-[0.3em]">J.A.R.V.I.S</h1>
            <p className="text-[9px] font-mono text-[#3a6b8a] tracking-widest">PERSONAL AI ASSISTANT v0.1.0</p>
          </div>
        </div>

        {/* Compact metrics */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          {hubState.metrics.map(metric => {
            const val = typeof metric.value === 'number' ? Math.round(metric.value) : metric.value;
            const barColor = metric.status === 'warning' ? '#ffaa00' : metric.status === 'critical' ? '#ff3366' : '#00d4ff';
            return (
              <div key={metric.label} className="flex flex-col items-center gap-1 p-1.5 rounded border border-[#1a2d50] bg-[#0d1a35]">
                <span className="text-[8px] font-mono text-[#3a6b8a]">{metric.label}</span>
                <span className="text-xs font-mono font-bold" style={{ color: barColor }}>
                  {val}{metric.unit ?? ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active modules */}
        <div className="flex flex-wrap gap-1 justify-center w-full">
          {hubState.activeModules.map(module => (
            <div key={module} className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#1a2d50] bg-[#0d1a35]">
              <span className="text-[#00d4ff]">{MODULE_ICONS[module] ?? <Zap size={10} />}</span>
              <span className="text-[9px] font-mono text-[#7ab8d4]">{module}</span>
              <span className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse" />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#1a2d50]" />
      </div>

      {/* ── Chat Area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 gap-2">

        {/* Message history */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 py-2 pr-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1a2d50 transparent' }}
        >
          {chat.messages.length === 0 && (
            <div className="text-center text-[10px] font-mono text-[#3a6b8a] mt-4">
              {voice.isSupported
                ? <>Sage <span className="text-[#00d4ff]">"aufwachen Jarvis"</span> oder tippe eine Nachricht</>
                : 'Tippe eine Nachricht um zu starten'}
            </div>
          )}
          {chat.messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {/* Interim transcript while speaking */}
          {voice.transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] px-3 py-2 rounded-lg bg-[#00d4ff18] border border-[#00d4ff40]">
                <p className="text-xs font-mono text-[#00d4ff80] italic">{voice.transcript}</p>
              </div>
            </div>
          )}
          {/* Loading indicator */}
          {chat.isLoading && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-lg bg-[#0d1a35] border border-[#1a2d50]">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-[#00d4ff] animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice status banner */}
        {voice.voiceState === 'active-listening' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#ff6b3540] bg-[#ff6b3510]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-pulse" />
            <span className="text-[10px] font-mono text-[#ff6b35]">HÖRE ZU … sprich jetzt</span>
            <button
              onClick={voice.deactivateListening}
              className="ml-auto text-[10px] font-mono text-[#3a6b8a] hover:text-[#ff3366] transition-colors"
            >
              ABBRECHEN
            </button>
          </div>
        )}

        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Nachricht tippen…"
            disabled={chat.isLoading}
            className="flex-1 min-w-0 bg-[#0d1a35] border border-[#1a2d50] rounded px-3 py-2
              text-xs font-mono text-[#7ab8d4] placeholder-[#3a6b8a]
              focus:outline-none focus:border-[#00d4ff80]
              disabled:opacity-50 transition-colors"
          />

          {/* Mic button */}
          {voice.isSupported && (
            <button
              type="button"
              onClick={() => {
                if (voice.voiceState === 'active-listening') {
                  voice.deactivateListening();
                } else {
                  voice.activateListening();
                }
              }}
              title={voice.voiceState === 'active-listening' ? 'Zuhören stoppen' : 'Sprachbefehl geben'}
              className="flex-shrink-0 p-2 rounded border transition-colors"
              style={{
                borderColor: voice.voiceState === 'active-listening' ? '#ff6b35' : '#1a2d50',
                backgroundColor: voice.voiceState === 'active-listening' ? '#ff6b3518' : '#0d1a35',
                color: voice.voiceState === 'active-listening' ? '#ff6b35' : '#3a6b8a',
              }}
            >
              {voice.voiceState === 'active-listening'
                ? <MicOff size={14} />
                : <Mic size={14} />}
            </button>
          )}

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputText.trim() || chat.isLoading}
            title="Senden"
            className="flex-shrink-0 p-2 rounded border border-[#1a2d50] bg-[#0d1a35]
              text-[#3a6b8a] disabled:opacity-30 hover:border-[#00d4ff80] hover:text-[#00d4ff]
              transition-colors"
          >
            <Send size={14} />
          </button>

          {/* Clear chat */}
          {chat.messages.length > 0 && (
            <button
              type="button"
              onClick={chat.clearMessages}
              title="Chat leeren"
              className="flex-shrink-0 p-2 rounded border border-[#1a2d50] bg-[#0d1a35]
                text-[#3a6b8a] hover:border-[#ff336660] hover:text-[#ff3366] transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </form>

        {/* Wake-word hint */}
        {voice.isSupported && voice.voiceState === 'wake-listening' && (
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[9px] font-mono text-[#3a6b8a]">
              Wake-Word aktiv · sage <span className="text-[#00d4ff]">"aufwachen Jarvis"</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat bubble sub-component ────────────────────────────────────────────────
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] px-3 py-2 rounded-lg"
        style={{
          backgroundColor: isUser ? '#00d4ff15' : '#0d1a35',
          border: `1px solid ${isUser ? '#00d4ff40' : '#1a2d50'}`,
        }}
      >
        {!isUser && (
          <div className="text-[8px] font-mono text-[#00d4ff] tracking-widest mb-1">JARVIS</div>
        )}
        <p className="text-xs font-mono text-[#7ab8d4] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className="text-[8px] font-mono text-[#1a2d50] mt-1 text-right">
          {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
