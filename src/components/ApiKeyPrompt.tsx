import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Key, Heart, Sparkles, ArrowRight } from 'lucide-react';

const API_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];
const MASTER_KEY = API_KEY_PARTS.join('');

export default function ApiKeyPrompt() {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 只在排盘工具页面触发
    const isToolPage = location.pathname.startsWith('/tools') || location.pathname.startsWith('/tongsheng');
    if (!isToolPage) return;

    // 检查是否已看过提示
    const hasSeen = localStorage.getItem('apikey_prompt_seen');
    if (hasSeen) return;

    // 检查是否已设置自己的API Key
    const userKey = localStorage.getItem('silicon_api_key');
    if (userKey) return; // 已有Key，不再弹出

    // 延迟显示，等页面加载完
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  function handleDismiss() {
    setShow(false);
    // 标记为已看过，但下次还可以再弹出（如果没设自己的Key）
    localStorage.setItem('apikey_prompt_seen', '1');
  }

  function handleUseMyKey() {
    setShow(false);
    localStorage.setItem('apikey_prompt_seen', '1');
    navigate('/apikey');
  }

  function handleUseMasterKey() {
    setShow(false);
    localStorage.setItem('apikey_prompt_seen', '1');
    // 清除用户自己的Key（如果有），确保用黄师傅的
    localStorage.removeItem('silicon_api_key');
    // 刷新页面让工具使用黄师傅的Key
    window.location.reload();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" style={{ animation: 'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.1), 0 0 40px rgba(251,191,36,0.05) } 50% { box-shadow: 0 0 30px rgba(251,191,36,0.2), 0 0 60px rgba(251,191,36,0.1) } }
        .apikey-modal { animation: slideUp 0.5s ease forwards; }
      `}</style>

      <div className="apikey-modal w-full max-w-md relative" style={{ animation: 'slideUp 0.5s ease forwards' }}>
        {/* 外发光 */}
        <div className="absolute -inset-0.5 rounded-3xl opacity-30" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(139,92,246,0.3), rgba(251,191,36,0.1))', filter: 'blur(8px)' }} />

        <div className="relative rounded-3xl border p-6 overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(26,15,8,0.98), rgba(10,5,2,0.99))',
          borderColor: 'rgba(251,191,36,0.15)',
          animation: 'glowPulse 4s ease infinite',
        }}>
          {/* 顶部渐变线 */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.4), rgba(139,92,246,0.3), transparent)' }} />

          {/* 关闭按钮 */}
          <button onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all z-10">
            <X className="w-4 h-4" />
          </button>

          {/* 标题区 */}
          <div className="text-center space-y-2 mb-6 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)', color: '#fbbf24' }}>
              <Sparkles className="w-3 h-3" />AI解析 · 密钥设置
            </div>
            <h3 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif SC','KaiTi',serif", background: 'linear-gradient(135deg, #fbbf24, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              选择您的AI解析方式
            </h3>
            <p className="text-[11px] text-white/30">卦不走空，心诚则灵</p>
          </div>

          {/* 方式一：自己的Key */}
          <button onClick={handleUseMyKey}
            className="w-full group relative rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 mb-3 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(0,0,0,0.3))', borderColor: 'rgba(59,130,246,0.15)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(59,130,246,0.08), transparent 70%)' }} />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-300">使用自己的API密钥</p>
                <p className="text-[11px] text-white/30 mt-0.5">免费注册硅基流动，2000万Tokens赠送</p>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400/40 group-hover:text-blue-400/70 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </button>

          {/* 方式二：黄师傅的Key */}
          <button onClick={handleUseMasterKey}
            className="w-full group relative rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(0,0,0,0.3))', borderColor: 'rgba(251,191,36,0.15)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(251,191,36,0.08), transparent 70%)' }} />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <Heart className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-300">使用黄师傅的密钥</p>
                <p className="text-[11px] text-white/30 mt-0.5">卦不走空，随缘给卦金</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400/40 group-hover:text-amber-400/70 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          </button>

          <p className="text-center text-[10px] text-white/15 mt-4">
            之后可在底部"API设置"随时更改
          </p>
        </div>
      </div>
    </div>
  );
}
