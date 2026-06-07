import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Trash2, ChevronRight, LogOut,
  Calculator, Star, CircleDot, Hand, Hash,
  Grid3X3, Scale, Coins, Camera, Sparkles, Globe,
  BookOpen, AlertCircle, Crown, Home, Compass,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { SavedRecord } from '@/hooks/useSavedRecords';

const TYPE_LABELS: Record<string, string> = {
  bazi: '八字', ziwei: '紫微', meihua: '梅花', liuyao: '六爻',
  xiaoliuren: '小六壬', qimen: '奇门', chenggu: '称骨',
  jinqiangua: '金钱卦', mianxiang: '面相', tarot: '塔罗', astro: '星盘', taiyi: '太乙神数', fengshui: '风水户型', xuankong: '玄空飞星', qimendifa: '奇门地理', daliuren: '大六壬',
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bazi: Calculator, ziwei: Star, meihua: CircleDot, liuyao: Hand,
  xiaoliuren: Hash, qimen: Grid3X3, chenggu: Scale,
  jinqiangua: Coins, mianxiang: Camera, tarot: Sparkles, astro: Globe, taiyi: Crown, fengshui: Home, xuankong: Star, qimendifa: Compass, daliuren: Crown,
};

// 每个命理类型有独特的鲜艳颜色
const TYPE_COLORS: Record<string, { text: string; bg: string; accent: string }> = {
  bazi: { text: 'text-amber-400', bg: 'bg-amber-500/15', accent: 'border-amber-400/30' },
  ziwei: { text: 'text-purple-400', bg: 'bg-purple-500/15', accent: 'border-purple-400/30' },
  meihua: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', accent: 'border-emerald-400/30' },
  liuyao: { text: 'text-blue-400', bg: 'bg-blue-500/15', accent: 'border-blue-400/30' },
  xiaoliuren: { text: 'text-pink-400', bg: 'bg-pink-500/15', accent: 'border-pink-400/30' },
  qimen: { text: 'text-orange-400', bg: 'bg-orange-500/15', accent: 'border-orange-400/30' },
  chenggu: { text: 'text-teal-400', bg: 'bg-teal-500/15', accent: 'border-teal-400/30' },
  jinqiangua: { text: 'text-yellow-400', bg: 'bg-yellow-500/15', accent: 'border-yellow-400/30' },
  mianxiang: { text: 'text-indigo-400', bg: 'bg-indigo-500/15', accent: 'border-indigo-400/30' },
  tarot: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/15', accent: 'border-fuchsia-400/30' },
  astro: { text: 'text-sky-400', bg: 'bg-sky-500/15', accent: 'border-sky-400/30' },
  taiyi: { text: 'text-amber-400', bg: 'bg-amber-500/15', accent: 'border-amber-400/30' },
  fengshui: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', accent: 'border-emerald-400/30' },
  xuankong: { text: 'text-cyan-400', bg: 'bg-cyan-500/15', accent: 'border-cyan-400/30' },
  qimendifa: { text: 'text-purple-400', bg: 'bg-purple-500/15', accent: 'border-purple-400/30' },
  daliuren: { text: 'text-indigo-400', bg: 'bg-indigo-500/15', accent: 'border-indigo-400/30' },
};

const RECORD_TYPE_ROUTE: Record<string, string> = {
  bazi: '/tools/bazi', ziwei: '/tools/ziwei', meihua: '/tools/meihua',
  liuyao: '/tools/liuyao', xiaoliuren: '/tools/xiaoliuren',
  qimen: '/tools/qimen', chenggu: '/tools/chenggu',
  jinqiangua: '/tools/jinqiangua', mianxiang: '/tools/mianxiang',
  tarot: '/tools/tarot', astro: '/tools/astro', taiyi: '/tools/taiyi', fengshui: '/tools/fengshui', xuankong: '/tools/xuankong', qimendifa: '/tools/qimendifa', daliuren: '/tools/daliuren',
};

// FIX: 使用正确的 localStorage key，与 useSavedRecords 一致
const STORAGE_KEY = 'mingli_saved_records';
const PENDING_KEY = 'mingli_pending_record';

export default function PersonalPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setRecords(JSON.parse(raw));
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', handleStorage);
    // 也监听自定义事件（同页面保存时触发）
    window.addEventListener('mingli_record_saved', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('mingli_record_saved', handleStorage);
    };
  }, []);

  const handleDelete = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setConfirmDelete(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="acrylic-thick p-10 max-w-sm w-full text-center space-y-6 animate-fade-in" style={{ borderRadius: '1.5rem' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center mx-auto ring-1 ring-white/30">
            <User className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">尚未登录</h2>
            <p className="text-sm text-white/40 mt-2">登录后可保存排盘记录，换设备不丢失</p>
          </div>
          <Link to="/login" className="btn-primary inline-flex px-8 py-3">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="acrylic-thick p-6 animate-fade-in" style={{ borderRadius: '1.5rem' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-blue-300/30 ring-offset-2 ring-offset-transparent">
            <img src="./cat-avatar.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{user?.nickname || user?.username}</h1>
            <p className="text-sm text-white/40 mt-0.5">{user?.username}</p>
          </div>
          <button onClick={logout} className="p-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="acrylic p-4 text-center animate-fade-in" style={{ borderRadius: '1.25rem', animationDelay: '0.1s' }}>
          <p className="text-2xl font-bold text-blue-400">{records.length}</p>
          <p className="text-xs text-white/40 mt-1">排盘记录</p>
        </div>
        <div className="acrylic p-4 text-center animate-fade-in" style={{ borderRadius: '1.25rem', animationDelay: '0.2s' }}>
          <p className="text-2xl font-bold text-purple-400">{new Set(records.map(r => r.type)).size}</p>
          <p className="text-xs text-white/40 mt-1">使用工具</p>
        </div>
        <div className="acrylic p-4 text-center animate-fade-in" style={{ borderRadius: '1.25rem', animationDelay: '0.3s' }}>
          <p className="text-2xl font-bold text-emerald-400">{records.filter(r => (r as any).chatHistory?.length).length}</p>
          <p className="text-xs text-white/40 mt-1">AI对话</p>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">排盘记录</h2>
          <span className="text-xs text-white/40">{records.length} 条</span>
        </div>

        {records.length === 0 ? (
          <div className="acrylic p-8 text-center" style={{ borderRadius: '1.25rem' }}>
            <BookOpen className="w-8 h-8 text-blue-300/50 mx-auto mb-3" />
            <p className="text-sm text-white/40">暂无排盘记录</p>
            <p className="text-xs text-white/50 mt-1">使用排盘工具后点击保存，记录将显示在这里</p>
            <Link to="/tools" className="btn-primary inline-flex mt-4 px-5 py-2 text-xs">去排盘</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record, i) => {
              const Icon = TYPE_ICONS[record.type] || Calculator;
              const colors = TYPE_COLORS[record.type] || TYPE_COLORS.bazi;
              return (
                <div key={record.id} className={`acrylic p-4 animate-fade-in border-l-2 ${colors.accent}`} style={{ borderRadius: '1.25rem', animationDelay: `${0.05 * i}s` }}>
                  {confirmDelete === record.id ? (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400 flex-1">确定删除这条记录？</p>
                      <button onClick={() => handleDelete(record.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">删除</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white/40 hover:bg-white/20 transition-colors">取消</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${colors.text}`}>{TYPE_LABELS[record.type] || record.type}</span>
                          <span className="text-xs text-white/50">{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-white/80 truncate">{record.name}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => {
                          localStorage.setItem(PENDING_KEY, JSON.stringify({ type: record.type, data: record.data, timestamp: Date.now() }));
                          navigate(RECORD_TYPE_ROUTE[record.type] || '/tools');
                        }} className="p-2 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(record.id)} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
