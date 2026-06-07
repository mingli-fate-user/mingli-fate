import { useEffect, useState } from 'react';

const PENDING_KEY = 'mingli_pending_record';

export function setPendingRecord(type: string, data: Record<string, unknown>) {
  localStorage.setItem(PENDING_KEY, JSON.stringify({ type, data, timestamp: Date.now() }));
}

export function useRestoreRecord(expectedType: string) {
  const [pendingData, setPendingData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // 5分钟内有效
      if (parsed.type === expectedType && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        setPendingData(parsed.data);
      }
      localStorage.removeItem(PENDING_KEY);
    } catch {
      // ignore
    }
  }, [expectedType]);

  return pendingData;
}

// 工具类型到路由的映射
export const RECORD_TYPE_ROUTE: Record<string, string> = {
  bazi: '/tools/bazi',
  ziwei: '/tools/ziwei',
  meihua: '/tools/meihua',
  liuyao: '/tools/liuyao',
  xiaoliuren: '/tools/xiaoliuren',
  qimen: '/tools/qimen',
  chenggu: '/tools/chenggu',
  jinqiangua: '/tools/jinqiangua',
  mianxiang: '/tools/mianxiang',
  tarot: '/tools/tarot',
  astro: '/tools/astro',
  taiyi: '/tools/taiyi',
  fengshui: '/tools/fengshui',
  xuankong: '/tools/xuankong',
  qimendifa: '/tools/qimendifa',
};
