import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogIn } from "lucide-react";

// 路由守卫：未登录时重定向到登录页
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm">加载中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 将当前路径存入 state，登录后自动跳转回来
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

// 工具页面的登录提示覆盖层（用于在非路由守卫场景提示）
export function LoginOverlay({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 border border-blue-500/30 rounded-xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
          <LogIn className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">需要登录</h3>
          <p className="text-sm text-slate-500">
            排盘工具需要登录后才能使用<br />
            登录后您的排盘记录将保存在云端
          </p>
        </div>
        <div className="space-y-2">
          <button
            onClick={onLogin}
            className="w-full py-3 bg-gradient-to-r from-blue-500/30 to-blue-400/30 border border-blue-500/40 rounded-lg text-slate-800 font-medium hover:from-blue-500/40 hover:to-blue-400/40 transition-all"
          >
            去登录 / 注册
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full py-2 text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            返回逛逛
          </button>
        </div>
      </div>
    </div>
  );
}
