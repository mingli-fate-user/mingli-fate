import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';
import { useNavigate } from 'react-router-dom';
import { X, Key, Sparkles, Heart } from 'lucide-react';

export default function ApiKeyPrompt() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const myKeyQuery = trpc.apiKey.myKey.useQuery(
    { token: token || '' },
    { enabled: !!token && isAuthenticated }
  );

  useEffect(() => {
    // 检查是否已经看过提示
    const hasSeen = sessionStorage.getItem('apikey_prompt_seen');
    if (hasSeen) return;

    if (isAuthenticated && myKeyQuery.data && !myKeyQuery.data.hasKey && !dismissed) {
      // 延迟显示，不打断用户
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, myKeyQuery.data, dismissed]);

  function handleDismiss() {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('apikey_prompt_seen', '1');
  }

  function handleSetKey() {
    setShow(false);
    sessionStorage.setItem('apikey_prompt_seen', '1');
    navigate('/apikey');
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1c24] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">AI解析设置</h3>
        <p className="text-sm text-white/40 mb-5">
          您当前使用的是黄师傅的API密钥，请选择您喜欢的方式
        </p>

        {/* 方法一 */}
        <button
          onClick={handleSetKey}
          className="w-full p-4 rounded-xl bg-blue-500/10 border border-blue-400/20 text-left hover:bg-blue-500/15 transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">使用自己的API密钥</p>
              <p className="text-xs text-white/40">免费注册硅基流动，2000万Tokens赠送</p>
            </div>
          </div>
        </button>

        {/* 方法二 */}
        <button
          onClick={handleDismiss}
          className="w-full p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 text-left hover:bg-amber-500/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-300">使用黄师傅的密钥</p>
              <p className="text-xs text-white/40">卦不走空，随缘给卦金</p>
            </div>
          </div>
        </button>

        <p className="text-center text-[10px] text-white/20 mt-4">
          之后可在"我的"页面随时更改此设置
        </p>
      </div>
    </div>
  );
}
