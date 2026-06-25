/**
 * useChat – Chat message state + backend API integration
 *
 * Sends messages to POST /api/v1/chat/message and stores the full
 * conversation history locally.
 */

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '@/types';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<string>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationIdRef = useRef<string>(`conv_${Date.now()}`);

  const addMessage = useCallback((role: ChatMessage['role'], content: string) => {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  const sendMessage = useCallback(async (text: string): Promise<string> => {
    const trimmed = text.trim();
    if (!trimmed) return '';

    addMessage('user', trimmed);
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversation_id: conversationIdRef.current,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json() as { response: string };
      const reply = data.response ?? 'Keine Antwort erhalten.';
      addMessage('assistant', reply);
      setIsLoading(false);
      return reply;
    } catch {
      const errMsg = 'Backend nicht erreichbar. Bitte prüfe ob die API läuft.';
      addMessage('assistant', errMsg);
      setIsLoading(false);
      return errMsg;
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = `conv_${Date.now()}`;
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
