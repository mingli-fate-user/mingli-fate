import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, ArrowLeft, User } from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/community');
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => navigate('/community')} className="flex items-center gap-1 text-slate-500 hover:text-blue-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />返回社区
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
        我的资料
      </h1>

      <div className="p-6 border border-blue-500/10 rounded-lg bg-slate-50/30 space-y-6">
        {/* Avatar */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full border-2 border-blue-500/30 flex items-center justify-center overflow-hidden bg-white/90">
            {user?.avatar ? (
              <img src={user.avatar} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">账号名</label>
            <div className="px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800">
              {user?.username}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">昵称</label>
            <div className="px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800">
              {user?.nickname || user?.username}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  );
}
