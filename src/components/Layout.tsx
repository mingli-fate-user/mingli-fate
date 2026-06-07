import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LogIn, User, Key } from 'lucide-react';
import ApiKeyPrompt from './ApiKeyPrompt';
import { navItems } from '@/data/siteData';
import { getToolColorFromPath, HOME_THEME, NAV_COLORS, NAV_HOVER_COLORS } from '@/data/toolColors';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

type NavItem = typeof navItems[number];

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast, showToast } = useToast();

  const toolColor = useMemo(() => getToolColorFromPath(location.pathname), [location.pathname]);
  const isToolPage = !!toolColor;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 工具页面的背景色
  const bgClass = isToolPage ? toolColor.pageBg : HOME_THEME.pageBg;
  const navActiveClass = isToolPage ? toolColor.navTextActive : 'text-blue-400';
  const navActiveBg = isToolPage
    ? `${toolColor.accentLight} ring-1 ${toolColor.navBorder}`
    : 'bg-white/20 ring-1 ring-white/30';

  return (
    <div className={`min-h-[100dvh] relative ${bgClass} transition-colors duration-700`}>
      {/* 全屏纯色深色背景 - 仅首页显示 */}
      {!isToolPage && (
        <>
          <div className="fixed inset-0 z-0 bg-[#0f1117]" />
          {/* 微妙的深色渐变遮罩 */}
          <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0f1117] via-[#131520] to-[#0a0c12] pointer-events-none" />
        </>
      )}

      {/* 工具页面装饰性背景图案 */}
      {isToolPage && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 柔和光晕 */}
          <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 ${toolColor.accentLight.replace('/20', '')} blur-[100px]`} />
          <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 ${toolColor.accentLight.replace('/20', '')} blur-[80px]`} />
          {/* 网格纹理 */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>
      )}

      {/* 彩色导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? `${isToolPage ? toolColor.navBg : 'bg-white/10'} backdrop-blur-2xl ${isToolPage ? toolColor.navBorder : 'border-white/20'} border-b shadow-lg`
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/30 group-hover:ring-white/60 transition-all shadow-lg">
                <img src="./cat-avatar.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <span className={`text-base font-semibold tracking-tight drop-shadow-md transition-colors ${
                isToolPage ? toolColor.navTextActive : 'text-white/90'
              }`} style={{ fontFamily: "'Noto Serif SC', serif" }}>
                黄师傅
              </span>
            </Link>

            {/* Desktop Nav - 每个词不同颜色 */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item: NavItem) => {
                const active = isActive(item.href, location.pathname);
                const colorClass = NAV_COLORS[item.label] || 'text-slate-300';
                const hoverClass = NAV_HOVER_COLORS[item.label] || 'hover:text-white';
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      active
                        ? `${navActiveClass} ${navActiveBg} shadow-lg`
                        : `${isToolPage ? toolColor.navText : 'text-white/60'} ${hoverClass} hover:bg-white/10`
                    }`}
                  >
                    <span className={active ? '' : colorClass}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Auth + Mobile Menu */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/apikey" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-sm ${
                    isToolPage ? `${toolColor.navText} hover:${toolColor.navTextActive} hover:bg-white/10` : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`} title="AI解析设置">
                    <Key className={`w-3.5 h-3.5 ${isToolPage ? toolColor.iconColor : 'text-white'}`} />
                  </Link>
                  <Link to="/me" className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm ${
                    isToolPage ? `${toolColor.navText} hover:${toolColor.navTextActive} hover:bg-white/10` : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isToolPage ? toolColor.badgeBg : 'bg-white/20'}`}>
                      <User className={`w-3.5 h-3.5 ${isToolPage ? toolColor.iconColor : 'text-white'}`} />
                    </div>
                    <span>{user?.nickname || user?.username}</span>
                  </Link>
                  <button onClick={logout} className={`p-2 rounded-full transition-all ${
                    isToolPage ? `${toolColor.navText} hover:text-red-400 hover:bg-red-500/10` : 'text-white/50 hover:text-red-300 hover:bg-white/10'
                  }`}>
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className={`hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur text-sm font-medium transition-all ${
                  isToolPage
                    ? `${toolColor.badgeBg} ${toolColor.navBorder} border ${toolColor.navTextActive} hover:${toolColor.navTextActive}`
                    : 'bg-white/20 border-white/20 border text-white/90 hover:bg-white/30'
                }`}>
                  <LogIn className="w-3.5 h-3.5" />
                  登录
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${
                  isToolPage ? `${toolColor.navText} hover:${toolColor.navTextActive} hover:bg-white/15` : 'text-white/70 hover:text-white hover:bg-white/15'
                }`}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - 亚克力 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-white/10 backdrop-blur-2xl border-b border-white/20 p-4 space-y-1 shadow-2xl">
            {navItems.map((item: NavItem) => {
              const colorClass = NAV_COLORS[item.label] || 'text-slate-300';
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(item.href, location.pathname)
                      ? `${colorClass} bg-white/15`
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-white/20">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-base text-pink-400 hover:bg-pink-500/10 transition-colors">
                  <LogOut className="w-4 h-4" /> 退出登录
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-base text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <LogIn className="w-4 h-4" /> 登录 / 注册
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 pt-16">
        {children}
      </main>

      {/* API密钥选择提示 */}
      <ApiKeyPrompt />

      {/* Footer */}
      <footer className="relative z-10 mt-16">
        <div className="bg-white/5 backdrop-blur-md border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20">
                    <img src="./cat-avatar.jpg" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white/80">黄师傅</p>
                    <p className="text-xs text-white/40">野生命理科普博主</p>
                  </div>
                </div>
                <p className="text-sm text-white/30 leading-relaxed">精通六爻解卦、紫微斗数、江氏小六壬、面相学...</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/60 mb-3">联系方式</p>
                <p className="text-sm text-white/30">QQ: 3376787168</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/60 mb-3">网站导航</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {navItems.map(item => (
                    <Link key={item.label} to={item.href} className={`text-sm transition-colors ${NAV_COLORS[item.label] || 'text-white/30'} hover:opacity-80`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-white/20"> 黄师傅命理 · 本网站所有内容仅供学习交流，不构成任何建议</p>
            </div>
          </div>
        </div>
      </footer>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
