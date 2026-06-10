import { Star, User, MessageCircle, Copy, Sparkles, ScrollText, BookOpen, Flame, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { masterInfo } from '@/data/siteData';
import { copyAndOpen } from '@/utils/copyAndOpen';
import { useToast } from '@/hooks/useToast';
import Toast from '@/components/Toast';

export default function About() {
  const { toast, showToast } = useToast();

  async function handleCopyQQ() {
    await copyAndOpen('qq', masterInfo.qq);
    showToast('QQ号已复制，正在唤起QQ...');
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0c0704 0%, #0d0805 50%, #0a0503 100%)' }}>
      <style>{`
        @keyframes heroGlow { from { opacity: 0.5 } to { opacity: 1 } }
        @keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        @keyframes borderGlow { 0%, 100% { border-color: rgba(251,191,36,0.1) } 50% { border-color: rgba(168,85,247,0.2) } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.05) } 50% { box-shadow: 0 0 40px rgba(251,191,36,0.12) } }
        .float-anim { animation: float 6s ease-in-out infinite }
        .shimmer-text { background: linear-gradient(90deg, rgba(251,191,36,0.3) 0%, #fbbf24 30%, #fff 50%, #fbbf24 70%, rgba(251,191,36,0.3) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 5s linear infinite }
        .shimmer-purple { background: linear-gradient(90deg, rgba(168,85,247,0.3) 0%, #a78bfa 30%, #fff 50%, #a78bfa 70%, rgba(168,85,247,0.3) 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 5s linear infinite }
        .glass-card { background: rgba(255,255,255,0.015); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05) }
        .glass-card:hover { background: rgba(255,255,255,0.025); border-color: rgba(251,191,36,0.1) }
        .kaiti { font-family: 'KaiTi','STKaiti','Noto Serif SC',serif }
      `}</style>

      {/* 多层背景 */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 20% 60%, rgba(168,85,247,0.04) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 80% 70%, rgba(59,130,246,0.03) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* 顶部Hero */}
      <div className="relative h-80 overflow-hidden flex items-end">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(251,191,36,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', color: '#fbbf24' }}>
              <Sparkles className="w-3 h-3" /> 数术传承 · 以术济人
            </span>
            <h1 className="text-4xl md:text-5xl font-bold shimmer-text kaiti tracking-wider">关于黄师傅</h1>
            <p className="text-sm mt-3 kaiti" style={{ color: 'rgba(168,85,247,0.6)', letterSpacing: '0.2em' }}>命理不是宿命论，而是了解自己的工具</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-6">

        {/* 头像 + 简介 */}
        <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8" style={{ animation: 'borderGlow 6s ease-in-out infinite' }}>
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-3 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(168,85,247,0.1) 40%, transparent 70%)', filter: 'blur(8px)', animation: 'heroGlow 4s ease-in-out infinite alternate' }} />
            <div className="absolute -inset-0.5 rounded-full" style={{ border: '1px solid rgba(251,191,36,0.15)', animation: 'borderGlow 4s ease-in-out infinite' }} />
            <div className="relative w-36 h-36 rounded-full overflow-hidden float-anim">
              <img src="./cat-avatar.jpg" alt={masterInfo.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold shimmer-text kaiti">{masterInfo.name}</h2>
            <p className="text-sm mt-1 font-medium kaiti" style={{ color: 'rgba(168,85,247,0.7)', letterSpacing: '0.15em' }}>{masterInfo.title}</p>
            <p className="text-sm mt-4 leading-loose kaiti" style={{ color: 'rgba(232,220,200,0.6)' }}>
              {masterInfo.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {masterInfo.specialties.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', color: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.05)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 自我修养 */}
        <div className="glass-card rounded-3xl p-6">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)' }} />
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 kaiti" style={{ color: 'rgba(232,220,200,0.7)' }}>
            <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #a78bfa)' }} />
            <Flame className="w-4 h-4" style={{ color: '#fbbf24' }} />
            黄师傅的自我修养
          </h3>
          <div className="space-y-1.5 text-xs kaiti leading-relaxed" style={{ color: 'rgba(232,220,200,0.4)' }}>
            <p>🛌🚶🚽</p>
            <p>✈️已飞0国｜06桂林留子｜男女混血</p>
            <p>📍｜Wild Chicken University｜中国留宿生｜座驾🛵</p>
            <p>💻加里敦offer｜华籍华人｜📱魅族（无SIM）🛍️PDD资深买手🥇｜桂林米粉一级品鉴师☕️｜0年国奖</p>
            <p>🆔国家级身份证持有者｜🚗驾驶证C1持有者｜英语四六级没考｜雅思托福没考｜恩格尔系数1.00｜诺贝尔奖觊觎者｜钓鱼空军专业者｜酒精特级摄入者</p>
            <p>🏄Internet冲浪达人｜熟练掌握🇨🇳语言</p>
            <p>个人存款💰0.0001百万｜花呗抖音月付</p>
            <p>💡德智体美：缺德·弱智·体弱·臭美</p>
          </div>
        </div>

        {/* 师承双卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 紫微斗数 */}
          <div className="glass-card rounded-3xl p-6 hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)' }} />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <Star className="w-4 h-4" style={{ color: '#a78bfa' }} />
              </div>
              <h3 className="text-sm font-bold kaiti" style={{ color: 'rgba(168,85,247,0.8)' }}>紫微斗数师承</h3>
            </div>
            <div className="space-y-2 text-xs kaiti leading-relaxed" style={{ color: 'rgba(232,220,200,0.4)' }}>
              <p>黄师傅的紫微斗数号称师承<span className="shimmer-purple font-medium">{masterInfo.ziweiSystem}</span>。</p>
              <p>实际上是在B站刷了300个紫微斗数视频，在豆瓣研究了50篇命理帖子，在贴吧跟人对线100回合后，自封的野生紫微大师。</p>
              <p>擅长把客户的命盘说得云山雾罩，让客户听完觉得自己既天命所归又需要破财消灾——简称「又贵又衰」分析法。</p>
              <p>核心技法：看到天机就说聪明，看到贪狼就说桃花，看到空宫就说「你潜力无限」——百试百灵，从无败绩。</p>
            </div>
          </div>

          {/* 面相学 */}
          <div className="glass-card rounded-3xl p-6 hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)' }} />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <User className="w-4 h-4" style={{ color: '#60a5fa' }} />
              </div>
              <h3 className="text-sm font-bold kaiti" style={{ color: 'rgba(59,130,246,0.8)' }}>面相学师承</h3>
            </div>
            <div className="space-y-2 text-xs kaiti leading-relaxed" style={{ color: 'rgba(232,220,200,0.4)' }}>
              <p>黄师傅的面相学号称师承<span className="shimmer-text font-medium">{masterInfo.faceSystem}</span>。</p>
              <p>真相是蹲了三年地铁口观察路人，看了两百集《峰生水起》电视节目，在抖音学了五百个面相短视频后，终于悟出了「相由心生，但主要靠P图」的终极奥义。</p>
              <p>独门绝技：看人说印堂发黑就推荐转运符，看到法令纹深就说客户有领导相，看到痘痘就说「最近有桃花运」——反正客人爱听什么说什么。</p>
              <p>面相学三大原则：额头宽是聪明（秃头除外）、鼻子大有财（鼻炎不算）、下巴圆有福（双下巴最佳）。</p>
            </div>
          </div>
        </div>

        {/* 命理理念 */}
        <div className="glass-card rounded-3xl p-6 relative" style={{ animation: 'pulseGlow 6s ease-in-out infinite' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.2), transparent)' }} />
          <h3 className="text-base font-bold mb-4 flex items-center gap-2 kaiti" style={{ color: 'rgba(232,220,200,0.7)' }}>
            <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #fbbf24, #a78bfa)' }} />
            <BookOpen className="w-4 h-4" style={{ color: '#fbbf24' }} />
            命理理念
          </h3>
          <div className="space-y-3 text-sm kaiti leading-loose" style={{ color: 'rgba(232,220,200,0.45)' }}>
            <div className="flex gap-3">
              <Quote className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: 'rgba(251,191,36,0.3)' }} />
              <p>"命理不是宿命论，而是了解自己的工具。"黄师傅始终坚持这一理念，认为学习命理的真正意义在于认识自己、改善自己，而不是消极地等待命运安排。</p>
            </div>
            <p>面相学讲"相由心生"，一个人的内心状态会反映在外貌上；紫微斗数通过星盘展示人生的各种可能性；六爻和小六壬则能在具体事情上提供参考。这些术数工具的最终目的，都是帮助人们更好地认识自己、把握人生。</p>
            <p>黄师傅致力于用通俗易懂的方式科普传统命理文化，让更多人能够了解这门古老的智慧，从中受益。</p>
          </div>
        </div>

        {/* 联系 */}
        <div className="glass-card rounded-3xl p-8 text-center relative" style={{ animation: 'pulseGlow 4s ease-in-out infinite' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.3), transparent)' }} />
          <h3 className="text-lg font-bold mb-6 shimmer-text kaiti">如需咨询，欢迎联系</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={handleCopyQQ}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', boxShadow: '0 4px 20px rgba(251,191,36,0.1)' }}>
              <MessageCircle className="w-4 h-4" />
              <span className="kaiti">QQ: {masterInfo.qq}</span>
              <Copy className="w-3 h-3 opacity-60" />
            </button>
            <Link to="/tools"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.25)', color: '#a78bfa', boxShadow: '0 4px 20px rgba(168,85,247,0.1)' }}>
              <ScrollText className="w-4 h-4" />
              <span className="kaiti">开始排盘</span>
            </Link>
          </div>

          {/* 赞赏码 */}
          <div className="mt-8 flex flex-col items-center">
            <div className="relative p-4 rounded-2xl" style={{ background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.12)' }}>
              <div className="absolute -inset-px rounded-2xl opacity-20" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.15), transparent 60%)' }} />
              <div className="relative">
                <img
                  src="./reward-qrcode.png"
                  alt="赞赏码"
                  className="w-40 h-40 object-contain rounded-xl"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(251,191,36,0.1))' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
            <p className="mt-3 text-xs kaiti tracking-wider" style={{ color: 'rgba(251,191,36,0.4)' }}>
              卦不走空，随缘赞赏
            </p>
          </div>
        </div>

        {/* 底部 */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px]" style={{ color: 'rgba(232,220,200,0.1)' }}>命理大师 · 以术济人 · 心诚则灵</p>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
