import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Key, Clock, Calendar, Search, X, Trash2, Sparkles,
  Save, ScrollText, Gamepad2, BookOpen, ChevronRight, ExternalLink,
  AlertCircle, User, Shield, Heart
} from 'lucide-react';
import { useSavedRecords } from '@/hooks/useSavedRecords';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const MASTER_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];
const MASTER_KEY = MASTER_KEY_PARTS.join('');

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

export default function PersonalCenter() {
  const { records, deleteRecord, deleteAll } = useSavedRecords();
  const { toast, showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'apikey' | 'records'>('records');
  const [userKey, setUserKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [filter, setFilter] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('silicon_api_key') || '';
    setUserKey(key);
  }, []);

  function handleSaveKey() {
    const key = inputKey.trim();
    if (!key) return;
    localStorage.setItem('silicon_api_key', key);
    setUserKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    showToast('API Key 已保存');
  }

  function handleDeleteKey() {
    localStorage.removeItem('silicon_api_key');
    setUserKey('');
    setInputKey('');
    showToast('已删除，使用黄师傅密钥');
  }

  function handleUseMaster() {
    localStorage.removeItem('silicon_api_key');
    setUserKey('');
    setInputKey('');
    showToast('已切换为黄师傅密钥');
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText('https://cloud.siliconflow.cn/i/MYlM79Tz');
    showToast('链接已复制');
  }

  const hasUserKey = !!userKey;
  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.typeLabel.includes(filter)
  );
  const grouped = filtered.reduce((acc: Record<string, typeof filtered>, r) => {
    const date = new Date(r.savedAt || r.createdAt).toLocaleDateString('zh-CN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #0c0704, #0d0805)' }}>
      <style>{`
        @keyframes fU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .aFU{animation:fU 0.4s ease forwards}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .shimmer-text{background:linear-gradient(90deg,rgba(251,191,36,0.3) 0%,#fbbf24 30%,#fff 50%,#fbbf24 70%,rgba(251,191,36,0.3) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear infinite}
        .shimmer-purple{background:linear-gradient(90deg,rgba(168,85,247,0.3) 0%,#a78bfa 30%,#fff 50%,#a78bfa 70%,rgba(168,85,247,0.3) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 5s linear infinite}
        .kaiti{font-family:'KaiTi','STKaiti','Noto Serif SC',serif}
        .glass-card{background:rgba(255,255,255,0.015);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.05)}
      `}</style>

      {/* 背景 */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(251,191,36,0.04) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* 头部 */}
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/40" />
          </Link>
          <div>
            <h1 className="text-xl font-bold shimmer-text kaiti">个人中心</h1>
            <p className="text-xs text-white/30">保存记录 · API设置</p>
          </div>
        </div>

        {/* 用户信息卡片 */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4" style={{ animation: 'borderGlow 6s ease-in-out infinite' }}>
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(251,191,36,0.2)', boxShadow: '0 0 20px rgba(251,191,36,0.08)' }}>
            <img src="./cat-avatar.jpg" alt="头像" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white/70 kaiti">访客</p>
            <p className="text-xs text-white/25 mt-0.5">数据存储在本地，换设备不同步</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs" style={{ color: hasUserKey ? '#60a5fa' : '#fbbf24' }}>
              {hasUserKey ? '使用自己的Key' : '使用黄师傅Key'}
            </p>
            <p className="text-[10px] text-white/15 mt-0.5">{records.length} 条记录</p>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <button
            onClick={() => setActiveTab('records')}
            className="flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: activeTab === 'records' ? 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.03))' : 'transparent',
              color: activeTab === 'records' ? '#fbbf24' : 'rgba(232,220,200,0.3)',
              borderBottom: activeTab === 'records' ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
            }}
          >
            <Save className="w-3.5 h-3.5" />历史记录
          </button>
          <button
            onClick={() => setActiveTab('apikey')}
            className="flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: activeTab === 'apikey' ? 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))' : 'transparent',
              color: activeTab === 'apikey' ? '#60a5fa' : 'rgba(232,220,200,0.3)',
              borderBottom: activeTab === 'apikey' ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
            }}
          >
            <Key className="w-3.5 h-3.5" />API设置
          </button>
        </div>

        {/* ===== 历史记录 Tab ===== */}
        {activeTab === 'records' && (
          <div className="aFU space-y-4">
            {/* 搜索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input type="text" value={filter} onChange={e => setFilter(e.target.value)}
                placeholder="搜索保存的记录..."
                className="w-full h-10 pl-9 pr-8 rounded-xl text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-amber-400/30 transition-all"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }} />
              {filter && <button onClick={() => setFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-white/20" /></button>}
            </div>

            {records.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Clock className="w-10 h-10 mx-auto text-white/10" />
                <p className="text-sm text-white/30">暂无保存的记录</p>
                <p className="text-xs text-white/15">使用排盘工具后点击"保存"按钮即可在此查看</p>
                <Link to="/tools" className="inline-flex items-center gap-1 text-xs px-4 py-2 rounded-lg mt-2" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                  <Sparkles className="w-3 h-3" />去排盘
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16"><p className="text-sm text-white/30">没有匹配的记录</p></div>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, items]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 text-xs text-white/20 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{date}</span>
                      <span className="text-white/10">({items.length}条)</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((record) => {
                        const Icon = TYPE_ICONS[record.type] || ScrollText;
                        const color = TYPE_COLORS[record.type] || TYPE_COLORS.default;
                        return (
                          <div key={record.id} className="group glass-card rounded-xl p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}10`, border: `1px solid ${color}15` }}>
                              <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white/60 truncate">{record.name}</p>
                              <p className="text-[10px] text-white/20">{record.typeLabel}</p>
                            </div>
                            <div className="text-[10px] text-white/15 flex-shrink-0">
                              {new Date(record.savedAt || record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button onClick={() => deleteRecord(record.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all">
                              <Trash2 className="w-3.5 h-3.5 text-red-400/40 hover:text-red-400" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {records.length > 0 && (
                  <button onClick={() => setShowConfirm(true)} className="w-full py-2.5 rounded-xl text-xs transition-colors" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.5)' }}>
                    <Trash2 className="w-3 h-3 inline mr-1" />清空所有记录
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== API设置 Tab ===== */}
        {activeTab === 'apikey' && (
          <div className="aFU space-y-4">
            {/* 当前状态 */}
            <div className="glass-card rounded-2xl p-5" style={{
              background: hasUserKey ? 'rgba(59,130,246,0.03)' : 'rgba(251,191,36,0.03)',
              borderColor: hasUserKey ? 'rgba(59,130,246,0.12)' : 'rgba(251,191,36,0.12)',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                  background: hasUserKey ? 'rgba(59,130,246,0.1)' : 'rgba(251,191,36,0.1)',
                  border: `1px solid ${hasUserKey ? 'rgba(59,130,246,0.2)' : 'rgba(251,191,36,0.2)'}`,
                }}>
                  {hasUserKey ? <Shield className="w-5 h-5 text-blue-400" /> : <Heart className="w-5 h-5 text-amber-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: hasUserKey ? '#60a5fa' : '#fbbf24' }}>
                    {hasUserKey ? `正在使用自己的密钥` : '正在使用黄师傅的密钥'}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {hasUserKey ? '所有AI解析消耗您的Token额度' : '卦不走空，随缘给卦金'}
                  </p>
                </div>
                {hasUserKey && (
                  <button onClick={handleDeleteKey} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400/50 hover:text-red-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 输入框 */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400/60" />
                <span className="text-sm font-medium text-white/60">设置自己的API Key</span>
              </div>
              <input type="password" value={inputKey} onChange={e => setInputKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full h-11 px-4 rounded-xl text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-blue-400/30 transition-all"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <div className="flex gap-2">
                <button onClick={handleSaveKey} disabled={!inputKey.trim() || saved}
                  className="flex-1 h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                  {saved ? '已保存' : '保存'}
                </button>
                <button onClick={() => setShowGuide(!showGuide)}
                  className="h-10 px-4 rounded-xl text-xs transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(232,220,200,0.4)' }}>
                  如何获取？
                </button>
              </div>
            </div>

            {/* 使用黄师傅的Key */}
            {hasUserKey && (
              <button onClick={handleUseMaster}
                className="w-full glass-card rounded-2xl p-5 flex items-center gap-3 transition-all hover:-translate-y-0.5 text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <Heart className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-300">切回黄师傅的密钥</p>
                  <p className="text-xs text-white/30">卦金随缘</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/15 ml-auto" />
              </button>
            )}

            {/* 获取指南 */}
            {showGuide && (
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400/60" />
                  <span className="text-sm font-medium text-white/60">如何获取免费API Key</span>
                </div>
                <div className="space-y-2 text-xs text-white/40 leading-relaxed">
                  <p>1. 访问 cloud.siliconflow.cn</p>
                  <p>2. 用手机号注册账号</p>
                  <p>3. 进入「API密钥」页面</p>
                  <p>4. 点击「新建密钥」，复制以 sk- 开头的字符串</p>
                  <p>5. 粘贴到上方输入框，点击保存</p>
                </div>
                <button onClick={handleCopyLink}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                  <ExternalLink className="w-3 h-3" />复制 SiliconFlow 注册链接
                </button>
              </div>
            )}

            {/* 说明 */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/20 leading-relaxed">
                  您的API Key仅存储在本地浏览器中，不会上传到任何服务器。不设置Key时将使用黄师傅的共享密钥，可能会有使用限制。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
