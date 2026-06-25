/**
 * useVoice – Browser-native Speech Recognition + TTS hook
 *
 * States:
 *  inactive        – mic not available / permission denied
 *  wake-listening  – always-on, waiting for "aufwachen Jarvis"
 *  active-listening – actively recording a user command
 *  processing      – command sent, waiting for response
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceState = 'inactive' | 'wake-listening' | 'active-listening' | 'processing';

/** Phrases that activate JARVIS (matched as substrings, case-insensitive) */
const WAKE_PHRASES = ['aufwachen jarvis', 'aufwachen', 'hey jarvis', 'jarvis aufwachen'];

/** Auto-cancel active listening after this many ms of silence */
const ACTIVE_LISTENING_TIMEOUT_MS = 8_000;

/** Restart recognition after an unexpected end event */
const RESTART_DELAY_MS = 300;

interface UseVoiceOptions {
  onWakeWord?: () => void;
  onCommand: (text: string) => void;
}

export interface UseVoiceReturn {
  voiceState: VoiceState;
  transcript: string;
  isSupported: boolean;
  isSpeaking: boolean;
  activateListening: () => void;
  deactivateListening: () => void;
  speak: (text: string) => void;
}

export function useVoice({ onWakeWord, onCommand }: UseVoiceOptions): UseVoiceReturn {
  // Resolve browser-prefixed SpeechRecognition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass: (new () => SpeechRecognition) | null =
    typeof window !== 'undefined'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null)
      : null;

  const isSupported = !!SpeechRecognitionClass;

  const [voiceState, setVoiceState] = useState<VoiceState>('inactive');
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for values used inside stable event-handler callbacks
  const stateRef = useRef<VoiceState>('inactive');
  const onCommandRef = useRef(onCommand);
  const onWakeWordRef = useRef(onWakeWord);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { onWakeWordRef.current = onWakeWord; }, [onWakeWord]);

  const updateState = useCallback((s: VoiceState) => {
    stateRef.current = s;
    setVoiceState(s);
  }, []);

  /** Speak text via browser TTS */
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'de-DE';
    utt.pitch = 0.85;
    utt.rate = 1.0;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, []);

  /** Switch to active-listening mode (called after wake word or mic button) */
  const activateListening = useCallback(() => {
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    updateState('active-listening');
    setTranscript('');
    // Auto-revert to wake-listening after timeout
    activeTimerRef.current = setTimeout(() => {
      if (stateRef.current === 'active-listening') {
        updateState('wake-listening');
        setTranscript('');
      }
    }, ACTIVE_LISTENING_TIMEOUT_MS);
  }, [updateState]);

  /** Cancel active-listening, go back to wake-word mode */
  const deactivateListening = useCallback(() => {
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    if (stateRef.current !== 'inactive') updateState('wake-listening');
    setTranscript('');
  }, [updateState]);

  /** Set state to processing (called externally when command is sent) */
  const setProcessing = useCallback(() => {
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    updateState('processing');
    setTranscript('');
  }, [updateState]);

  // Start continuous recognition once on mount
  useEffect(() => {
    if (!isSupported || !SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'de-DE';
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const last = results[results.length - 1];
      const text = last[0].transcript.trim();
      const lower = text.toLowerCase();

      if (stateRef.current === 'wake-listening') {
        if (WAKE_PHRASES.some(phrase => lower.includes(phrase))) {
          onWakeWordRef.current?.();
          activateListening();
          speak('Ja, ich höre dir zu.');
        }
      } else if (stateRef.current === 'active-listening') {
        setTranscript(text);
        if (last.isFinal && text.length > 1) {
          setProcessing();
          onCommandRef.current(text);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        updateState('inactive');
      }
      // Other errors (no-speech, aborted) are transient – let onend restart
    };

    recognition.onend = () => {
      // Auto-restart so the wake-word listener stays alive
      if (stateRef.current !== 'inactive') {
        setTimeout(() => {
          try { recognition.start(); } catch { /* already started */ }
        }, RESTART_DELAY_MS);
      }
    };

    try {
      recognition.start();
      updateState('wake-listening');
    } catch {
      updateState('inactive');
    }

    return () => {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      updateState('inactive');
      try { recognition.stop(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  return { voiceState, transcript, isSupported, isSpeaking, activateListening, deactivateListening, speak };
}
