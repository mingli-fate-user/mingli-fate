import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from || '/me';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请填写完整信息');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        if (username.length < 3) { setError('账号名至少3个字符'); setSubmitting(false); return; }
        if (password.length < 6) { setError('密码至少6位'); setSubmitting(false); return; }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
          setError('密码必须同时包含字母和数字'); setSubmitting(false); return;
        }
        await register({ username: username.trim(), password, nickname: nickname.trim() || undefined });
      } else {
        await login({ username: username.trim(), password });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Acrylic Login Card */}
        <div className="acrylic-thick p-8 sm:p-10 animate-fade-in-scale" style={{ borderRadius: '1.5rem' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-400/20 backdrop-blur flex items-center justify-center mx-auto mb-5 ring-1 ring-blue-300/20">
              <Sparkles className="w-7 h-7 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-base text-slate-400 mt-2">
              {mode === 'login' ? '登录你的命理账号' : '开始你的命理之旅'}
            </p>
          </div>

          {/* Mode Toggle - Acrylic */}
          <div className="flex gap-1 acrylic rounded-xl p-1 mb-6" style={{ borderRadius: '0.875rem' }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              注册
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50/80 backdrop-blur border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-500 mb-1.5 ml-1">账号名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="3-50个字符"
                className="input-acrylic w-full text-base"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm text-slate-500 mb-1.5 ml-1">昵称（可选）</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="显示名称"
                  className="input-acrylic w-full text-base"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-500 mb-1.5 ml-1">密码</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '至少6位，含字母和数字' : '输入密码'}
                  className="input-acrylic w-full text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="text-sm text-slate-400 space-y-1 bg-white/30 backdrop-blur rounded-xl p-4 border border-white/30">
                <p>密码规范：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>至少6位字符</li>
                  <li>必须同时包含英文字母和阿拉伯数字</li>
                </ul>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base font-medium">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {submitting ? '处理中...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/30" />
            <span className="text-sm text-slate-400">或</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-xl border border-white/30 bg-white/20 backdrop-blur text-sm text-slate-600 hover:text-slate-800 hover:bg-white/30 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            我先逛逛
          </button>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          <Link to="/" className="hover:text-blue-300 transition-colors">返回首页</Link>
        </p>
      </div>
    </div>
  );
}
