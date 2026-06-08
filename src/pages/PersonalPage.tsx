import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Trash2, ChevronRight, LogOut,
  Calculator, Star, CircleDot, Hand, Hash,
  Grid3X3, Scale, Coins, Camera, Sparkles, Globe,
  BookOpen, AlertCircle, Crown, Home, Compass,
  Key, Check, ExternalLink, Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApiKey } from '@/hooks/useApiKey';
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

const STORAGE_KEY = 'mingli_saved_records';
const PENDING_KEY = 'mingli_pending_record';

export default function PersonalPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { userKey, hasCustomKey, keyPrefix, saveKey, deleteKey, testKey } = useApiKey();
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'apikey'>('records');
  const [inputKey, setInputKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // 检查URL参数是否有tab=apikey
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('tab=apikey')) {
      setActiveTab('apikey');
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setRecords(JSON.parse(raw));
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', handleStorage);
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

  async function handleTest() {
    if (!inputKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    const result = await testKey(inputKey.trim());
    setTestResult(result);
    setTesting(false);
  }

  async function handleSave() {
    if (!inputKey.trim()) return;
    saveKey(inputKey.trim());
    setTestResult({ valid: true, message: "API密钥已保存" });
    setInputKey('');
  }

  function handleDeleteKey() {
    if (!confirm('确定删除已保存的API密钥吗？')) return;
    deleteKey();
    setTestResult(null);
  }

  if (!isAuthenticated) {
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

  const guideSteps = [
    { num: 1, title: '访问硅基流动', desc: '打开 https://cloud.siliconflow.cn/i/MKk7VoRZ 注册账号' },
    { num: 2, title: '完成注册', desc: '用手机号注册并登录（新用户免费送2000万Tokens）' },
    { num: 3, title: '获取API密钥', desc: '登录后点击右上角头像 → API密钥 → 新建API密钥' },
    { num: 4, title: '复制密钥', desc: '复制生成的密钥（格式：sk-xxxxxxxx）' },
    { num: 5, title: '粘贴到下方', desc: '将密钥粘贴到下方输入框，点击保存即可' },
  ];

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

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'records'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/20'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          排盘记录
        </button>
        <button
          onClick={() => setActiveTab('apikey')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'apikey'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/20'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          AI密钥设置
        </button>
      </div>

      {/* Records Tab */}
      {activeTab === 'records' && (
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
      )}

      {/* API Key Tab */}
      {activeTab === 'apikey' && (
        <div className="space-y-4">
          {/* 当前密钥状态 */}
          {hasCustomKey && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-300">已配置个人API密钥</p>
                    <p className="text-xs text-white/40">{keyPrefix}</p>
                  </div>
                </div>
                <button onClick={handleDeleteKey} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                  删除
                </button>
              </div>
            </div>
          )}

          {/* 方法一 */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">方法一：使用自己的API密钥</h2>
                <p className="text-xs text-white/40">免费、稳定、无限制，推荐长期使用</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <button onClick={() => setShowGuide(!showGuide)}
                className="w-full p-3 rounded-lg bg-blue-500/10 border border-blue-400/20 text-left hover:bg-blue-500/15 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-300 font-medium">如何获取硅基流动API密钥？</span>
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </div>
              </button>

              {showGuide && (
                <div className="p-4 rounded-lg bg-black/30 border border-white/10 space-y-3">
                  {guideSteps.map((step) => (
                    <div key={step.num} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-400">{step.num}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{step.title}</p>
                        <p className="text-xs text-white/40">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                  <a href="https://cloud.siliconflow.cn/i/MKk7VoRZ" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors mt-2">
                    <ExternalLink className="w-4 h-4" />前往硅基流动注册
                  </a>
                </div>
              )}

              <div>
                <label className="block text-xs text-white/40 mb-1.5">API密钥</label>
                <input value={inputKey} onChange={(e) => setInputKey(e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-blue-400/40 text-sm" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleTest} disabled={!inputKey.trim() || testing}
                  className="flex-1 py-2.5 border border-white/10 text-white/60 rounded-xl text-sm hover:border-blue-400/30 hover:text-blue-300 transition-colors disabled:opacity-30">
                  {testing ? '测试中...' : '测试密钥'}
                </button>
                <button onClick={handleSave} disabled={!inputKey.trim()}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-30">
                  保存密钥
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${testResult.valid ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                  {testResult.valid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* 方法二 */}
          <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-400/15 overflow-hidden">
            <div className="p-4 border-b border-amber-400/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-300">方法二：使用黄师傅的密钥</h2>
                <p className="text-xs text-white/40">卦不走空，随缘给卦金</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-400/10">
                <p className="text-sm text-white/70 leading-relaxed mb-3">
                  黄师傅提供自己的API密钥供大家使用。命理讲究「卦不走空」，如果您觉得黄师傅的工具对您有帮助，欢迎随缘打赏，金额随意。
                </p>
                <p className="text-sm text-amber-300/70 leading-relaxed mb-3">
                  也可以不给，但因果自己扛。
                </p>
                <p className="text-xs text-amber-400/50 italic">
                  「你的支持是黄师傅最大的动力」
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-white/60 mb-3">微信扫码赞赏</p>
                <img src="./reward-qrcode.png" alt="黄师傅赞赏码"
                  className="w-48 h-48 mx-auto rounded-xl border border-amber-400/20"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>

              <button onClick={() => { handleDeleteKey(); }}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-medium hover:from-amber-500 hover:to-yellow-500 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                {hasCustomKey ? '切换回黄师傅的密钥' : '继续使用黄师傅的密钥'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
