import { useState, useCallback } from 'react';
import {
  calculateQiZhengSiYu,
  SEVEN_PLANETS,
  FOUR_REMNANTS,
  TWELVE_HOUSES,
  BRANCHES12,
  MANSIONS28,
  PLANET_COLORS,
  REMNANT_COLORS,
  MANSION_LUCK,
  type QiZhengResult,
} from '@/data/qizheng';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';
import { Orbit, Star, Eye, Loader2, ChevronDown } from 'lucide-react';

// ==================== 流动渐变色背景CSS ====================
const gradientBgStyle = `
@keyframes flowGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.animate-flow {
  background-size: 400% 400%;
  animation: flowGradient 15s ease infinite;
}
.animate-pulse-glow {
  animation: pulseGlow 4s ease-in-out infinite;
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
`;

// ==================== 主组件 ====================

export default function QiZhengTool() {
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);
  const [gender, setGender] = useState<'男' | '女'>('男');
  const [result, setResult] = useState<QiZhengResult | null>(null);
  const [loading, setLoading] = useState(false);

  // 生成选项
  const yearOptions = Array.from({ length: 100 }, (_, i) => 1950 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const hourLabels = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];

  // 排盘
  const handleCalculate = useCallback(() => {
    setLoading(true);
    try {
      const res = calculateQiZhengSiYu(year, month, day, hour);
      setResult(res);
    } catch (e) {
      console.error('排盘错误:', e);
    }
    setLoading(false);
  }, [year, month, day, hour]);

  // 准备AI数据
  const getAIData = () => {
    if (!result) return {};
    return {
      year: result.year,
      month: result.month,
      day: result.day,
      hour: result.hour,
      mingBranch: result.mingBranch,
      mingMansion: result.mingMansion,
      mingDegree: result.mingDegree,
      planets: result.planets,
      remnants: result.remnants,
      houseDistribution: result.houseDistribution,
      mansionDistribution: result.mansionDistribution,
    } as Record<string, unknown>;
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: '#06060f' }}>
      <style>{gradientBgStyle}</style>

      {/* 主题背景 - 深空紫+琥珀金双色 */}
      <div className="fixed inset-0 animate-flow pointer-events-none"
        style={{
          background: 'linear-gradient(-45deg, #0a0418, #180d28, #0f0a02, #120820, #0a0418)',
          backgroundSize: '400% 400%',
        }} />
      {/* 主题色装饰光球 - 琥珀金 */}
      <div className="fixed top-[-15%] right-[-5%] w-[55vw] h-[55vw] rounded-full pointer-events-none animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
      {/* 主题色装饰光球 - 深空紫 */}
      <div className="fixed bottom-[-15%] left-[-5%] w-[50vw] h-[50vw] rounded-full pointer-events-none animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', animationDelay: '2s' }} />
      {/* 中心柔光 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 60%)' }} />

      <div className="relative z-10">
        {/* 顶部标题 */}
        <div className="py-10 px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3 animate-float">
              <Orbit className="w-10 h-10" style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.6))' }} />
              <h1 className="text-4xl font-bold tracking-widest"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500, #fbbf24, #FFD700)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 16px rgba(255,165,0,0.4))',
                }}>
                七政四余
              </h1>
            </div>
            <p className="text-sm tracking-[0.3em]" style={{ color: 'rgba(251,191,36,0.45)' }}>
              中国占星术之源 · 紫微斗数八字之滥觞
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-20">
          {/* 输入区 - 使用select */}
          <div className="p-5 rounded-2xl mb-6"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(245,158,11,0.15)',
              backdropFilter: 'blur(10px)',
            }}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {/* 年 */}
              <div className="relative">
                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(251,191,36,0.5)' }}>年</label>
                <div className="relative">
                  <select value={year} onChange={e => setYear(Number(e.target.value))}
                    className="w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none transition-all cursor-pointer"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#fbbf24',
                    }}>
                    {yearOptions.map(y => <option key={y} value={y}>{y}年</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(245,158,11,0.4)' }} />
                </div>
              </div>
              {/* 月 */}
              <div className="relative">
                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(251,191,36,0.5)' }}>月</label>
                <div className="relative">
                  <select value={month} onChange={e => setMonth(Number(e.target.value))}
                    className="w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none transition-all cursor-pointer"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#fbbf24',
                    }}>
                    {monthOptions.map(m => <option key={m} value={m}>{m}月</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(245,158,11,0.4)' }} />
                </div>
              </div>
              {/* 日 */}
              <div className="relative">
                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(251,191,36,0.5)' }}>日</label>
                <div className="relative">
                  <select value={day} onChange={e => setDay(Number(e.target.value))}
                    className="w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none transition-all cursor-pointer"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#fbbf24',
                    }}>
                    {dayOptions.map(d => <option key={d} value={d}>{d}日</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(245,158,11,0.4)' }} />
                </div>
              </div>
              {/* 时 */}
              <div className="relative">
                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(251,191,36,0.5)' }}>时</label>
                <div className="relative">
                  <select value={hour} onChange={e => setHour(Number(e.target.value))}
                    className="w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none transition-all cursor-pointer"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#fbbf24',
                    }}>
                    {hourOptions.map(h => (
                      <option key={h} value={h}>
                        {h}时 ({hourLabels[h]}时)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(245,158,11,0.4)' }} />
                </div>
              </div>
              {/* 性别 */}
              <div className="relative">
                <label className="text-xs mb-1.5 block" style={{ color: 'rgba(251,191,36,0.5)' }}>性别</label>
                <div className="relative">
                  <select value={gender} onChange={e => setGender(e.target.value as '男' | '女')}
                    className="w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none transition-all cursor-pointer"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#fbbf24',
                    }}>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'rgba(245,158,11,0.4)' }} />
                </div>
              </div>
            </div>

            <button onClick={handleCalculate} disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-[0.5em] transition-all"
              style={{
                background: loading
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.2))',
                border: '1px solid rgba(245,158,11,0.35)',
                color: '#FFD700',
                boxShadow: loading ? 'none' : '0 0 25px rgba(245,158,11,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : '起  盘'}
            </button>
          </div>

          {/* 排盘结果 */}
          {result && (
            <>
              {/* 命宫信息卡 */}
              <div className="p-5 rounded-2xl mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.03))',
                  border: '1px solid rgba(245,158,11,0.2)',
                  boxShadow: '0 0 30px rgba(245,158,11,0.08)',
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'rgba(251,191,36,0.5)' }}>命宫</p>
                    <p className="text-3xl font-bold" style={{ color: '#fbbf24' }}>
                      {result.mingBranch}宫 · {result.mingMansion}宿
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>命度</p>
                    <p className="text-xl" style={{ color: 'rgba(251,191,36,0.7)' }}>{result.mingDegree.toFixed(1)}°</p>
                  </div>
                </div>
              </div>

              {/* 圆形星盘 - 大版本 */}
              <div className="mb-10 flex justify-center">
                <StarChartLarge result={result} />
              </div>

              {/* 七政详情 - 模块卡片 */}
              <div className="mb-8">
                <h3 className="text-base font-bold mb-4 tracking-wider flex items-center gap-2" style={{ color: 'rgba(251,191,36,0.7)' }}>
                  <Star className="w-5 h-5" /> 七政分布
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {SEVEN_PLANETS.map(star => {
                    const m = result.mansionDistribution[star];
                    const h = result.houseDistribution[star];
                    const color = PLANET_COLORS[star];
                    return (
                      <div key={star} className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: `1px solid ${color}25`,
                          boxShadow: `0 0 15px ${color}10`,
                        }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                          style={{
                            background: color + '20',
                            border: `2px solid ${color}`,
                            boxShadow: `0 0 12px ${color}40`,
                          }}>
                          <span className="text-lg font-bold" style={{ color }}>{star}</span>
                        </div>
                        <p className="text-xs text-center font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</p>
                        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {m?.mansion || '?'}宿{m?.du || 0}度
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 四余详情 - 模块卡片 */}
              <div className="mb-8">
                <h3 className="text-base font-bold mb-4 tracking-wider flex items-center gap-2" style={{ color: 'rgba(167,139,250,0.7)' }}>
                  <Eye className="w-5 h-5" /> 四余分布
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FOUR_REMNANTS.map(star => {
                    const m = result.mansionDistribution[star];
                    const h = result.houseDistribution[star];
                    const color = REMNANT_COLORS[star];
                    return (
                      <div key={star} className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: `1px solid ${color}25`,
                          boxShadow: `0 0 15px ${color}10`,
                        }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                          style={{
                            background: color + '20',
                            border: `2px solid ${color}`,
                            boxShadow: `0 0 12px ${color}40`,
                          }}>
                          <span className="text-sm font-bold" style={{ color }}>{star}</span>
                        </div>
                        <p className="text-xs text-center font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</p>
                        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {m?.mansion || '?'}宿{m?.du || 0}度
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 十二宫分布 - 模块卡片 */}
              <div className="mb-8">
                <h3 className="text-base font-bold mb-4 tracking-wider flex items-center gap-2" style={{ color: 'rgba(56,189,248,0.7)' }}>
                  <Orbit className="w-5 h-5" /> 十二宫详解
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {result.houses.map(h => (
                    <div key={h.name} className="p-4 rounded-xl transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>{h.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                          {h.branch}
                        </span>
                      </div>
                      {h.planets.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {h.planets.map(s => (
                            <span key={s} className="text-xs px-2 py-1 rounded-lg font-medium"
                              style={{
                                background: (PLANET_COLORS[s] || REMNANT_COLORS[s]) + '18',
                                color: PLANET_COLORS[s] || REMNANT_COLORS[s],
                                border: `1px solid ${(PLANET_COLORS[s] || REMNANT_COLORS[s])}30`,
                              }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>无星入驻</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作按钮 - 放在最下方 */}
              <div className="flex flex-col gap-3 mt-8">
                <SaveRecordButton type="qizheng" typeLabel="七政四余" data={getAIData()} />
                <AIParser type="qizheng" data={getAIData()} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== 大号圆形星盘SVG组件 ====================

function StarChartLarge({ result }: { result: QiZhengResult }) {
  const size = 600;
  const cx = size / 2;
  const cy = size / 2;
  const r = 270;

  const houseSectors = TWELVE_HOUSES.map((name, i) => {
    const startAngle = (result.mingPalace + i * 30 - 90) * (Math.PI / 180);
    const endAngle = (result.mingPalace + (i + 1) * 30 - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    return { name, startAngle, endAngle, x1, y1, x2, y2 };
  });

  const getStarPos = (deg: number, radius: number) => {
    const angle = (deg - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  return (
    <div className="relative" style={{ filter: 'drop-shadow(0 0 40px rgba(245,158,11,0.12))' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="diskGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,158,11,0.04)" />
            <stop offset="40%" stopColor="rgba(217,119,6,0.07)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </radialGradient>
          <radialGradient id="centerGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,158,11,0.2)" />
            <stop offset="60%" stopColor="rgba(245,158,11,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 外圈光环 */}
        <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 15px rgba(245,158,11,0.3))' }} />
        <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="0.5" />

        {/* 盘面底色 */}
        <circle cx={cx} cy={cy} r={r} fill="url(#diskGrad2)" />

        {/* 十二宫扇形 - 密集文字版 */}
        {houseSectors.map((h, i) => {
          const midAngle = (h.startAngle + h.endAngle) / 2;
          const labelR = r * 0.92;
          const lx = cx + labelR * Math.cos(midAngle);
          const ly = cy + labelR * Math.sin(midAngle);
          const branchR = r * 0.82;
          const bx = cx + branchR * Math.cos(midAngle);
          const by = cy + branchR * Math.sin(midAngle);
          // 落入此宫的星
          const housePlanets = result.houses.find(hr => hr.name === h.name)?.planets || [];
          const starR = r * 0.72;
          const sx = cx + starR * Math.cos(midAngle);
          const sy = cy + starR * Math.sin(midAngle);
          return (
            <g key={h.name}>
              <line x1={cx} y1={cy} x2={h.x1} y2={h.y1} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <path d={`M ${cx} ${cy} L ${h.x1} ${h.y1} A ${r} ${r} 0 0 1 ${h.x2} ${h.y2} Z`}
                fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              {/* 宫位名 */}
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fill="rgba(255,255,255,0.6)" fontSize="12" fontWeight="700">{h.name}</text>
              {/* 地支 */}
              <text x={bx} y={by} textAnchor="middle" dominantBaseline="middle"
                fill="rgba(245,158,11,0.55)" fontSize="11" fontWeight="600">
                {BRANCHES12[Math.floor((result.mingPalace / 30 + i) % 12)]}宫
              </text>
              {/* 落入的星曜 */}
              {housePlanets.length > 0 && (
                <text x={sx} y={sy + 5} textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(251,191,36,0.7)" fontSize="9" fontWeight="500">
                  {housePlanets.join(' ')}
                </text>
              )}
            </g>
          );
        })}

        {/* 二十八宿圈 */}
        <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="rgba(245,158,11,0.08)" strokeWidth="1" strokeDasharray="3 6" />
        {MANSIONS28.map((m, i) => {
          const deg = (i * 360) / 28;
          const pos = getStarPos(deg, r * 0.65);
          return (
            <text key={m} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fill={MANSION_LUCK[m] === '吉' ? 'rgba(74,222,128,0.4)' : MANSION_LUCK[m] === '凶' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.25)'}
              fontSize="9" fontWeight="500">{m}</text>
          );
        })}

        {/* 七政星位 - 大号 */}
        {SEVEN_PLANETS.map(star => {
          const deg = result.planets[star];
          const pos = getStarPos(deg, r * 0.48);
          const color = PLANET_COLORS[star];
          return (
            <g key={star}>
              <circle cx={pos.x} cy={pos.y} r="14" fill={color + '15'} stroke={color} strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize="13" fontWeight="bold">{star}</text>
            </g>
          );
        })}

        {/* 四余星位 - 大号 */}
        {FOUR_REMNANTS.map(star => {
          const deg = result.remnants[star];
          const pos = getStarPos(deg, r * 0.32);
          const color = REMNANT_COLORS[star];
          return (
            <g key={star}>
              <circle cx={pos.x} cy={pos.y} r="12" fill={color + '15'} stroke={color} strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                fill={color} fontSize="10" fontWeight="bold">{star.slice(0, 2)}</text>
            </g>
          );
        })}

        {/* 中心命度 */}
        <circle cx={cx} cy={cy} r={38} fill="url(#centerGrad2)" stroke="rgba(245,158,11,0.35)" strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.4))' }} />
        <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle"
          fill="#FFD700" fontSize="14" fontWeight="bold" filter="url(#glow2)">
          {result.mingBranch}宫
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,215,0,0.6)" fontSize="11">
          {result.mingMansion}宿
        </text>

        {/* 方向标记 */}
        <text x={cx} y={cy - r - 18} textAnchor="middle" fill="rgba(245,158,11,0.35)" fontSize="11" fontWeight="500">午</text>
        <text x={cx} y={cy + r + 24} textAnchor="middle" fill="rgba(245,158,11,0.35)" fontSize="11" fontWeight="500">子</text>
        <text x={cx - r - 20} y={cy + 5} textAnchor="middle" fill="rgba(245,158,11,0.35)" fontSize="11" fontWeight="500">卯</text>
        <text x={cx + r + 20} y={cy + 5} textAnchor="middle" fill="rgba(245,158,11,0.35)" fontSize="11" fontWeight="500">酉</text>
      </svg>
    </div>
  );
}
