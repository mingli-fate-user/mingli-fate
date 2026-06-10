import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Clock, Calendar, Search, X, Sparkles, BookOpen, ScrollText, Gamepad2 } from 'lucide-react';
import { useSavedRecords } from '@/hooks/useSavedRecords';

const TYPE_ICONS: Record<string, any> = {
  bazi: Sparkles, ziwei: Sparkles, liuyao: ScrollText, meihua: ScrollText,
  xiaoliuren: ScrollText, qimen: ScrollText, chenggu: ScrollText,
  jinqiangua: ScrollText, mianxiang: ScrollText, tarot: ScrollText,
  astro: Sparkles, taiyi: ScrollText, fengshui: ScrollText,
  xuankong: ScrollText, qimendifa: ScrollText, daliuren: ScrollText,
  cezi: ScrollText, huangji: ScrollText, lingqijing: ScrollText,
  jiemeng: ScrollText, qizheng: Sparkles, dialectics: BookOpen,
  lifesim: Gamepad2, mastergame: Gamepad2, tongsheng: Calendar,
};

const TYPE_COLORS: Record<string, string> = {
  bazi: '#f59e0b', ziwei: '#a78bfa', liuyao: '#60a5fa', meihua: '#4ade80',
  lifesim: '#f59e0b', mastergame: '#a78bfa', dialectics: '#ef4444',
  default: '#fbbf24',
};

export default function History() {
  const { records, deleteRecord, deleteAll } = useSavedRecords();
  const [filter, setFilter] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.typeLabel.includes(filter)
  );

  const grouped = filtered.reduce((acc: Record<string, typeof filtered>, r) => {
    const date = new Date(r.savedAt).toLocaleDateString('zh-CN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
      <style>{`
        @keyframes fU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .aFU{animation:fU 0.4s ease forwards}
      `}</style>

      {/* 头部 */}
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/40" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif SC','KaiTi',serif", background: 'linear-gradient(135deg, #fbbf24, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            历史记录
          </h1>
          <p className="text-xs text-white/30">本地保存，数据不会丢失</p>
        </div>
        {records.length > 0 && (
          <button onClick={() => setShowConfirm(true)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="清空全部">
            <Trash2 className="w-4 h-4 text-red-400/40 hover:text-red-400" />
          </button>
        )}
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text" value={filter} onChange={e => setFilter(e.target.value)}
          placeholder="搜索记录..."
          className="w-full h-10 pl-9 pr-8 rounded-xl text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-amber-400/30 transition-all"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
        />
        {filter && (
          <button onClick={() => setFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-white/20 hover:text-white/40" />
          </button>
        )}
      </div>

      {/* 记录列表 */}
      {records.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Clock className="w-10 h-10 mx-auto text-white/10" />
          <p className="text-sm text-white/30">暂无保存的记录</p>
          <p className="text-xs text-white/15">使用排盘工具后点击"保存"按钮即可在此查看</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-white/30">没有匹配的记录</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, items]) => (
            <div key={date} className="aFU space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/20">
                <Calendar className="w-3 h-3" />
                <span>{date}</span>
                <span className="text-white/10">({items.length}条)</span>
              </div>
              <div className="space-y-2">
                {items.map((record) => {
                  const Icon = TYPE_ICONS[record.type] || ScrollText;
                  const color = TYPE_COLORS[record.type] || TYPE_COLORS.default;
                  return (
                    <div key={record.id} className="group rounded-xl border p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}10`, border: `1px solid ${color}15` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/60 truncate">{record.name}</p>
                        <p className="text-[10px] text-white/20">{record.typeLabel}</p>
                      </div>
                      <div className="text-[10px] text-white/15 flex-shrink-0">
                        {new Date(record.savedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400/40 hover:text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 清空确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl border p-5 space-y-4" style={{ background: 'linear-gradient(135deg, rgba(26,15,8,0.98), rgba(10,5,2,0.99))', borderColor: 'rgba(239,68,68,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-red-400">确认清空</h3>
            <p className="text-xs text-white/40">确定要删除所有 {records.length} 条保存的记录吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 h-9 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(232,220,200,0.4)' }}>取消</button>
              <button onClick={() => { deleteAll(); setShowConfirm(false); }} className="flex-1 h-9 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">确认清空</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
