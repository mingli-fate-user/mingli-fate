import { useState, useEffect, useCallback } from 'react';

export interface SavedRecord {
  id: string;
  name: string;
  type: 'bazi' | 'ziwei' | 'meihua' | 'liuyao' | 'xiaoliuren' | 'qimen' | 'chenggu' | 'jinqiangua' | 'mianxiang' | 'tarot' | 'astro' | 'taiyi' | 'fengshui' | 'xuankong' | 'qimendifa' | 'daliuren';
  typeLabel: string;
  data: Record<string, unknown>;
  createdAt: string;
}

const STORAGE_KEY = 'mingli_saved_records';

function loadRecords(): SavedRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: SavedRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useSavedRecords() {
  const [records, setRecords] = useState<SavedRecord[]>(loadRecords);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const addRecord = useCallback((record: Omit<SavedRecord, 'id' | 'createdAt'>) => {
    const newRecord: SavedRecord = {
      ...record,
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setRecords(prev => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const renameRecord = useCallback((id: string, name: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  }, []);

  return { records, addRecord, deleteRecord, renameRecord };
}
