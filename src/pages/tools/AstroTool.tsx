import { useState, useCallback } from 'react';
import { Sparkles, Star, MapPin, Info, AlertCircle } from 'lucide-react';
import { calculateNatalChart, SIGNS, type PlanetPosition, type HouseCusp, type Aspect } from '@/data/astroChart';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';

const SIGN_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
];

const PLANET_COLORS: Record<string, string> = {
  太阳: '#fbbf24', 月亮: '#e2e8f0', 水星: '#a78bfa', 金星: '#f472b6',
  火星: '#ef4444', 木星: '#f59e0b', 土星: '#94a3b8', 天王星: '#22d3ee',
  海王星: '#3b82f6', 冥王星: '#a855f7', 上升点: '#f43f5e',
};

// 安全的数值检查
function safeNum(n: number): number {
  if (isNaN(n) || !isFinite(n)) return 0;
  return n;
}

// 绘制星盘SVG
function ChartWheel({
  planets, houses, ascendant, size = 340
}: {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  ascendant: PlanetPosition;
  size?: number;
}) {
  const center = size / 2;
  const r1 = size * 0.42;
  const r2 = size * 0.35;
  const r3 = size * 0.28;
  const r4 = size * 0.15;

  const lonToAngle = (lon: number) => {
    const v = ((safeNum(lon) - safeNum(ascendant.longitude) + 180) % 360);
    return (v >= 0 ? v : v + 360) * Math.PI / 180;
  };

  const houseMap = new Map<number, HouseCusp>();
  houses.forEach(h => houseMap.set(h.number, h));

  // 宫位线
  const houseLines = houses.map(h => {
    const angle = lonToAngle(h.longitude) - Math.PI / 2;
    return {
      key: `line-${h.number}`,
      x1: safeNum(center + r4 * Math.cos(angle)),
      y1: safeNum(center + r4 * Math.sin(angle)),
      x2: safeNum(center + r2 * Math.cos(angle)),
      y2: safeNum(center + r2 * Math.sin(angle)),
      stroke: h.number % 3 === 1 ? '#3b82f650' : '#e2e8f035',
      strokeWidth: h.number % 3 === 1 ? 1 : 0.5,
    };
  });

  // 宫位数字
  const houseNumbers = houses.map(h => {
    const nextH = houseMap.get(h.number % 12 + 1);
    if (!nextH) return null;
    let nextLon = safeNum(nextH.longitude);
    const hLon = safeNum(h.longitude);
    if (nextLon <= hLon) nextLon += 360;
    const midLon = ((hLon + nextLon) / 2) % 360;
    const midAngle = lonToAngle(midLon) - Math.PI / 2;
    return {
      key: `num-${h.number}`,
      x: safeNum(center + (r2 - 10) * Math.cos(midAngle)),
      y: safeNum(center + (r2 - 10) * Math.sin(midAngle)),
      num: h.number,
    };
  }).filter(Boolean);

  // 行星位置
  const planetPositions = [...planets, ascendant].map((p, idx) => {
    const angle = lonToAngle(p.longitude) - Math.PI / 2;
    const offset = (idx % 3) * 8;
    return {
      key: `p-${p.name}`,
      cx: safeNum(center + (r3 - offset) * Math.cos(angle)),
      cy: safeNum(center + (r3 - offset) * Math.sin(angle)),
      color: PLANET_COLORS[p.name] || '#334155',
      symbol: p.symbol,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <circle cx={center} cy={center} r={r1 + 8} fill="#f8fafc" stroke="#2a2218" strokeWidth="1" />

      {/* 星座分区 */}
      {SIGNS.map((sign, i) => {
        const sA = lonToAngle(sign.start) - Math.PI / 2;
        const eA = lonToAngle(sign.start + 30) - Math.PI / 2;
        const sx1 = safeNum(center + r1 * Math.cos(sA));
        const sy1 = safeNum(center + r1 * Math.sin(sA));
        const sx2 = safeNum(center + r1 * Math.cos(eA));
        const sy2 = safeNum(center + r1 * Math.sin(eA));
        const ix1 = safeNum(center + r2 * Math.cos(sA));
        const iy1 = safeNum(center + r2 * Math.sin(sA));
        const ix2 = safeNum(center + r2 * Math.cos(eA));
        const iy2 = safeNum(center + r2 * Math.sin(eA));
        return (
          <g key={sign.name}>
            <path d={`M ${ix1} ${iy1} L ${sx1} ${sy1} A ${r1} ${r1} 0 0 1 ${sx2} ${sy2} L ${ix2} ${iy2} A ${r2} ${r2} 0 0 0 ${ix1} ${iy1}`}
              fill={SIGN_COLORS[i] + '12'} stroke={SIGN_COLORS[i] + '35'} strokeWidth="0.5" />
            <text x={safeNum(center + (r1 - 10) * Math.cos((sA + eA) / 2))}
              y={safeNum(center + (r1 - 10) * Math.sin((sA + eA) / 2))}
              textAnchor="middle" dominantBaseline="central"
              fill={SIGN_COLORS[i]} fontSize="10">{sign.symbol}</text>
          </g>
        );
      })}

      {/* 宫位线 */}
      {houseLines.map(l => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={l.stroke} strokeWidth={l.strokeWidth} />
      ))}

      {/* 宫位数字 */}
      {houseNumbers.map(n => n && (
        <text key={n.key} x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
          fill="#94a3b860" fontSize="8">{n.num}</text>
      ))}

      {/* 中心 */}
      <circle cx={center} cy={center} r={r4} fill="#f8fafc" stroke="#3b82f625" strokeWidth="1" />
      <text x={center} y={center - 4} textAnchor="middle" fill="#c9a84c" fontSize="9">本命盘</text>
      <text x={center} y={center + 8} textAnchor="middle" fill="#94a3b8" fontSize="7">{ascendant.sign}</text>

      {/* 行星 */}
      {planetPositions.map(p => (
        <g key={p.key}>
          <circle cx={p.cx} cy={p.cy} r="7" fill="#f8fafc" stroke={p.color} strokeWidth="1.5" />
          <text x={p.cx} y={p.cy + 1} textAnchor="middle" dominantBaseline="central"
            fill={p.color} fontSize="8">{p.symbol}</text>
        </g>
      ))}

      {/* 刻度 */}
      {Array.from({ length: 36 }, (_, i) => {
        const angle = (i * 10 * Math.PI / 180) - Math.PI / 2;
        const isMajor = i % 3 === 0;
        const rInner = isMajor ? r1 - 5 : r1 - 2;
        return (
          <line key={`t-${i}`}
            x1={safeNum(center + rInner * Math.cos(angle))}
            y1={safeNum(center + rInner * Math.sin(angle))}
            x2={safeNum(center + r1 * Math.cos(angle))}
            y2={safeNum(center + r1 * Math.sin(angle))}
            stroke="#e2e8f030" strokeWidth={isMajor ? 0.8 : 0.3} />
        );
      })}
    </svg>
  );
}

export default function AstroTool() {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [latitude, setLatitude] = useState('39.9042');
  const [longitude, setLongitude] = useState('116.4074');
  const [location, setLocation] = useState('北京');
  const [result, setResult] = useState<{
    planets: PlanetPosition[];
    houses: HouseCusp[];
    aspects: Aspect[];
    ascendant: PlanetPosition;
    mc: number;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'planets' | 'houses' | 'aspects'>('chart');
  const [error, setError] = useState('');

  const handleCalculate = useCallback(() => {
    setError('');
    try {
      const d = new Date(date);
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon)) {
        setError('请输入有效的经纬度');
        return;
      }
      if (lat < -90 || lat > 90) {
        setError('纬度范围应为 -90 到 90');
        return;
      }
      if (lon < -180 || lon > 180) {
        setError('经度范围应为 -180 到 180');
        return;
      }
      const chart = calculateNatalChart(d, lat, lon);
      // 验证返回数据
      if (!chart.planets || chart.planets.length === 0) {
        setError('排盘计算返回空数据');
        return;
      }
      setResult(chart);
      setActiveTab('chart');
    } catch (err: any) {
      setError('排盘计算出错：' + (err?.message || '未知错误'));
    }
  }, [date, latitude, longitude]);

  const getAIData = useCallback(() => {
    if (!result) return {};
    return {
      location: location || '未知地点',
      birthTime: date,
      ascendant: { sign: result.ascendant.sign, degree: Math.round(result.ascendant.signDegree * 10) / 10 },
      mc: { sign: getSign(result.mc).name, degree: Math.round((result.mc - getSign(result.mc).start) * 10) / 10 },
      planets: result.planets.map(p => ({
        name: p.name, sign: p.sign, degree: Math.round(p.signDegree * 10) / 10,
        house: p.house, retrograde: p.retrograde,
      })),
      houses: result.houses.map(h => ({ number: h.number, sign: h.sign, degree: Math.round(h.degree * 10) / 10 })),
      aspects: result.aspects.slice(0, 15).map(a => ({
        p1: a.planet1, p2: a.planet2, type: a.type, nature: a.nature,
      })),
    };
  }, [result, date, location]);

  function getSign(lon: number) {
    const idx = Math.floor(safeNum(lon) / 30) % 12;
    return SIGNS[idx];
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Star className="w-6 h-6 text-amber-400" />
          西方星盘
          <button onClick={() => setShowHelp(!showHelp)} className="text-white/60 hover:text-blue-600 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </h2>
        <p className="text-sm text-white/60">本命盘 · 十大行星 · 十二宫位 · 相位分析</p>
      </div>

      {showHelp && (
        <div className="bg-slate-50/80 border border-blue-300 rounded-lg p-4 text-sm text-white/75">
          <p className="font-medium text-blue-600 mb-2">星盘使用指南</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>星盘是出生时各天体在黄道上的位置图</li>
            <li>需输入出生日期、时间和出生地点的经纬度</li>
            <li>太阳星座代表核心人格，月亮是情感需求，上升是外在形象</li>
            <li>十二宫位代表人生不同领域</li>
            <li>北京：39.9042, 116.4074 | 上海：31.2304, 121.4737 | 广州：23.1291, 113.2644</li>
          </ul>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-lg p-4 flex items-center gap-3 text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 输入表单 */}
      <div className="bg-slate-50/60 border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-blue-600 mb-1">出生时间</label>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-black/45 border border-slate-200 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-blue-600 mb-1">出生地点</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/75" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="例如：北京"
                className="w-full bg-black/45 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/75 focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-blue-600 mb-1">纬度</label>
            <input
              type="text"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
              placeholder="39.9042"
              className="w-full bg-black/45 border border-slate-200 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/75 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-blue-600 mb-1">经度</label>
            <input
              type="text"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
              placeholder="116.4074"
              className="w-full bg-black/45 border border-slate-200 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/75 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleCalculate}
          className="w-full py-3 bg-gradient-to-r from-amber-800/60 to-orange-800/60 border border-amber-500/40 rounded-lg text-amber-100 font-medium flex items-center justify-center gap-2 hover:from-amber-700/60 hover:to-orange-700/60 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          生成本命盘
        </button>
      </div>

      {/* 排盘结果 */}
      {result && !error && (
        <div className="space-y-4">
          {/* 标签切换 */}
          <div className="flex gap-1 bg-slate-50/40 rounded-lg p-1 overflow-x-auto">
            {([
              { key: 'chart', label: '星盘图' },
              { key: 'planets', label: '行星' },
              { key: 'houses', label: '宫位' },
              { key: 'aspects', label: '相位' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[60px] py-2 px-3 rounded text-sm transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-500/20 text-blue-600 border border-blue-300'
                    : 'text-white/60 hover:text-white/75'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 星盘图 */}
          {activeTab === 'chart' && (
            <div className="bg-slate-50/40 border border-slate-200 rounded-lg p-4 overflow-x-auto">
              <ChartWheel planets={result.planets} houses={result.houses} ascendant={result.ascendant} size={340} />
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3 text-xs">
                {[...result.planets, result.ascendant].map(p => (
                  <span key={p.name} className="flex items-center gap-1" style={{ color: PLANET_COLORS[p.name] || '#334155' }}>
                    <span>{p.symbol}</span>
                    <span>{p.name} {p.sign} {Math.floor(p.signDegree)}°</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 行星表格 */}
          {activeTab === 'planets' && (
            <div className="bg-slate-50/40 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/50/60 text-blue-600">
                    <th className="px-3 py-2 text-left">行星</th>
                    <th className="px-3 py-2 text-left">星座</th>
                    <th className="px-3 py-2 text-right">度数</th>
                    <th className="px-3 py-2 text-right">宫位</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[result.ascendant, ...result.planets].map(p => (
                    <tr key={p.name} className="hover:bg-blue-500/5">
                      <td className="px-3 py-2" style={{ color: PLANET_COLORS[p.name] || '#334155' }}>
                        <span className="mr-1">{p.symbol}</span>{p.name}
                      </td>
                      <td className="px-3 py-2 text-white/75">{p.sign}</td>
                      <td className="px-3 py-2 text-right text-white">{Math.floor(p.signDegree)}°{Math.floor((p.signDegree % 1) * 60)}′</td>
                      <td className="px-3 py-2 text-right text-white/60">{p.house}宫</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 宫位表格 */}
          {activeTab === 'houses' && (
            <div className="bg-slate-50/40 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/50/60 text-blue-600">
                    <th className="px-3 py-2 text-left">宫位</th>
                    <th className="px-3 py-2 text-left">星座</th>
                    <th className="px-3 py-2 text-right">宫头度数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.houses.map(h => (
                    <tr key={h.number} className="hover:bg-blue-500/5">
                      <td className="px-3 py-2 text-white">{h.number}宫</td>
                      <td className="px-3 py-2 text-white/75">{h.sign}</td>
                      <td className="px-3 py-2 text-right text-white">{Math.floor(h.degree)}°{Math.floor((h.degree % 1) * 60)}′</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 相位表格 */}
          {activeTab === 'aspects' && (
            <div className="bg-slate-50/40 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/50/60 text-blue-600">
                    <th className="px-3 py-2 text-left">行星A</th>
                    <th className="px-3 py-2 text-left">行星B</th>
                    <th className="px-3 py-2 text-center">相位</th>
                    <th className="px-3 py-2 text-right">角度</th>
                    <th className="px-3 py-2 text-center">性质</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.aspects.map((a, i) => (
                    <tr key={i} className={`hover:bg-blue-500/5 ${a.nature === 'challenging' ? 'bg-red-900/10' : a.nature === 'harmonious' ? 'bg-green-900/10' : ''}`}>
                      <td className="px-3 py-2 text-white">{a.planet1}</td>
                      <td className="px-3 py-2 text-white">{a.planet2}</td>
                      <td className="px-3 py-2 text-center text-blue-600">{a.type}</td>
                      <td className="px-3 py-2 text-right text-white/60">{a.angle}° (±{a.orb}°)</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          a.nature === 'harmonious' ? 'bg-green-900/30 text-green-400' :
                          a.nature === 'challenging' ? 'bg-red-900/30 text-red-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {a.nature === 'harmonious' ? '和谐' : a.nature === 'challenging' ? '挑战' : '中性'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI解析和保存 */}
          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-200">
            <AIParser type="astro" data={getAIData()} />
            <SaveRecordButton
              type="astro"
              typeLabel={`星盘-${location}-${date.slice(0, 10)}`}
              data={getAIData()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
