import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  name: string;
  type: 'bazi' | 'ziwei' | 'meihua' | 'liuyao' | 'xiaoliuren' | 'qimen' | 'chenggu' | 'jinqiangua' | 'mianxiang' | 'tarot' | 'astro';
  typeLabel: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'mingli_chat_history';

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const createSession = useCallback((type: ChatSession['type'], typeLabel: string, name: string, initialMessages: ChatMessage[]) => {
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name,
      type,
      typeLabel,
      messages: initialMessages,
      createdAt: now,
      updatedAt: now,
    };
    setSessions(prev => [newSession, ...prev]);
    return newSession;
  }, []);

  const addMessageToSession = useCallback((sessionId: string, message: ChatMessage) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, message], updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const renameSession = useCallback((id: string, name: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  }, []);

  const getSession = useCallback((id: string) => {
    return sessions.find(s => s.id === id);
  }, [sessions]);

  return { sessions, createSession, addMessageToSession, deleteSession, renameSession, getSession };
}
