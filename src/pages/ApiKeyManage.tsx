import { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, ExternalLink, ArrowLeft, Sparkles, Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MASTER_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];
const MASTER_KEY = MASTER_KEY_PARTS.join('');

export default function ApiKeyManage() {
  const [userKey, setUserKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('silicon_api_key') || '';
    setUserKey(key);
  }, []);

  function handleSave() {
    const key = inputKey.trim();
    if (!key) return;
    localStorage.setItem('silicon_api_key', key);
    setUserKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    localStorage.removeItem('silicon_api_key');
    setUserKey('');
    setInputKey('');
  }

  function handleUseMaster() {
    localStorage.removeItem('silicon_api_key');
    setUserKey('');
    setInputKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasUserKey = !!userKey;
  const userKeyPrefix = hasUserKey ? userKey.substring(0, 8) + '...' : '';

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-2xl mx-auto space-y-8" style={{ background: 'linear-gradient(180deg, #0c0704, #0d0805)' }}>
      <style>{`
        @keyframes borderGlow { 0%, 100% { border-color: rgba(251,191,36,0.15) } 50% { border-color: rgba(168,85,247,0.25) } }
        @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        .shimmer-text { background: linear-gradient(90deg, rgba(251,191,36,0.4) 0%, #fbbf24 25%, #fff 50%, #fbbf24 75%, rgba(251,191,36,0.4) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 6s linear infinite }
      `}</style>

      {/* 头部 */}
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/40" />
        </Link>
        <div>
          <h1 className="text-xl font-bold shimmer-text" style={{ fontFamily: "'KaiTi','STKaiti','Noto Serif SC',serif" }}>API密钥设置</h1>
          <p className="text-xs text-white/30">卦不走空，心诚则灵</p>
        </div>
      </div>

      {/* 当前状态 */}
      <div className="rounded-2xl p-5 border" style={{
        background: hasUserKey ? 'rgba(59,130,246,0.03)' : 'rgba(251,191,36,0.03)',
        borderColor: hasUserKey ? 'rgba(59,130,246,0.15)' : 'rgba(251,191,36,0.15)',
        animation: 'borderGlow 6s ease-in-out infinite',
      }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hasUserKey ? 'rgba(59,130,246,0.3)' : 'rgba(251,191,36,0.3)'}, transparent)` }} />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: hasUserKey ? 'rgba(59,130,246,0.1)' : 'rgba(251,191,36,0.1)',
            border: `1px solid ${hasUserKey ? 'rgba(59,130,246,0.2)' : 'rgba(251,191,36,0.2)'}`,
          }}>
            {hasUserKey ? <Key className="w-5 h-5 text-blue-400" /> : <Heart className="w-5 h-5 text-amber-400" />}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: hasUserKey ? '#60a5fa' : '#fbbf24' }}>
              {hasUserKey ? `正在使用自己的密钥 (${userKeyPrefix})` : '正在使用黄师傅的密钥'}
            </p>
            <p className="text-xs text-white/30 mt-0.5">
              {hasUserKey ? '所有AI解析消耗您的Token额度' : '卦不走空，随缘给卦金'}
            </p>
          </div>
          {hasUserKey && (
            <button onClick={handleDelete} className="ml-auto p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="删除自己的密钥">
              <Trash2 className="w-4 h-4 text-red-400/50 hover:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* 输入框 */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-400/60" />
          <span className="text-sm font-medium text-white/60">设置自己的API Key</span>
        </div>
        <input
          type="password"
          value={inputKey}
          onChange={e => setInputKey(e.target.value)}
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full h-11 px-4 rounded-xl text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-blue-400/30 transition-all"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!inputKey.trim() || saved}
            className="flex-1 h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}
          >
            {saved ? <><Check className="w-4 h-4" />已保存</> : <><Key className="w-4 h-4" />保存</>}
          </button>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="h-10 px-4 rounded-xl text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(232,220,200,0.4)' }}
          >
            如何获取？
          </button>
        </div>
      </div>

      {/* 使用黄师傅的Key */}
      {!hasUserKey ? null : (
        <button
          onClick={handleUseMaster}
          className="w-full rounded-2xl border p-5 flex items-center gap-3 transition-all hover:-translate-y-0.5"
          style={{ background: 'rgba(251,191,36,0.03)', borderColor: 'rgba(251,191,36,0.12)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Heart className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-amber-300">切回黄师傅的密钥</p>
            <p className="text-xs text-white/30">卦金随缘</p>
          </div>
        </button>
      )}

      {/* 获取指南 */}
      {showGuide && (
        <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
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
          <button
            onClick={() => {
              navigator.clipboard?.writeText('https://cloud.siliconflow.cn/i/MYlM79Tz');
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}
          >
            <ExternalLink className="w-3 h-3" />复制 SiliconFlow 注册链接
          </button>
        </div>
      )}

      {/* 说明 */}
      <div className="rounded-xl p-4 border" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/20 leading-relaxed">
            您的API Key仅存储在本地浏览器中，不会上传到任何服务器。不设置Key时将使用黄师傅的共享密钥，可能会有使用限制。
          </p>
        </div>
      </div>
    </div>
  );
}
