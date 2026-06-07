import { useState, useCallback, useEffect } from 'react';
import {
  Sparkles, ArrowRight, RotateCw, Save, Loader2,
  Compass, Mountain, Navigation, Star,
} from 'lucide-react';
import SaveRecordButton from '@/components/SaveRecordButton';
import {
  calculateXuanKong,
  NINE_STARS,
  TWENTY_FOUR_MOUNTAINS,
  GONG_NAMES,
  getYunByYear,
  type XuanKongResult,
  type HouseLayout,
} from '@/data/xuankong';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import { Link, useSearchParams } from 'react-router-dom';

const API_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];

export default function XuanKongTool() {
  const [searchParams] = useSearchParams();
  const layoutId = searchParams.get('layoutId');

  const [year, setYear] = useState(new Date().getFullYear());
  const [zuoShan, setZuoShan] = useState('子');
  const [xiang, setXiang] = useState('午');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<XuanKongResult | null>(null);
  const [loading, setLoading] = useState(false);

  // AI
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  // 户型数据
  const [importedLayout, setImportedLayout] = useState<HouseLayout | null>(null);

  // 加载指定户型及其转录数据
  useEffect(() => {
    if (layoutId) {
      try {
        const raw = localStorage.getItem('fengshui_layouts');
        if (raw) {
          const layouts: HouseLayout[] = JSON.parse(raw);
          const layout = layouts.find(l => l.id === layoutId);
          if (layout) {
            setImportedLayout(layout);
            // 读取转录数据，自动填充坐山朝向
            const tRaw = localStorage.getItem('fengshui_transcript_' + layoutId);
            if (tRaw) {
              const t = JSON.parse(tRaw);
              if (t.zuoShan) setZuoShan(t.zuoShan);
              if (t.xiang) setXiang(t.xiang);
            }
          }
        }
      } catch { /* ignore */ }
    }
  }, [layoutId]);

  const handleCalculate = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        const res = calculateXuanKong(year, zuoShan, xiang);
        setResult(res);
        setAiMessages([]);
      } catch (err) {
        alert('排盘失败：' + (err as Error).message);
      }
      setLoading(false);
    }, 500);
  }, [year, zuoShan, xiang]);

  // AI解析
  const handleAI = useCallback(async () => {
    const q = aiInput.trim() || question.trim();
    if (!q) return;

    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: 'user', content: q, id: 'u_' + Date.now() }]);
    setAiInput('');

    try {
      const apiKey = API_KEY_PARTS.join('');
      const prompt = buildPrompt(result!, importedLayout, q);

      const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V4-Flash',
          messages: [
            {
              role: 'system',
              content: `你是黄师傅，精通玄空飞星风水学的命理大师。

【身份定位】
你专研无常派玄空飞星风水学，以三元九运、二十四山、挨星下卦为核心技法。

【分析规则】
1. 结合排盘结果中的运盘、山盘、向盘进行综合分析
2. 根据户型数据（如有）分析各房间所在宫位的吉凶
3. 判断到山到向、上山下水、伏吟反吟等格局
4. 分析五黄煞、文昌位、财位等关键位置
5. 给出具体的风水调整建议

【语言风格】
半文半白的古典风水术语，引用《青囊奥语》《天玉经》《都天宝照经》等古籍，铁口直断。严禁使用任何markdown格式符号（#和*），所有输出必须是纯文本。` + NO_MARKDOWN_RULE + ` `,
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '解析失败';

      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content,
        id: 'a_' + Date.now(),
      }]);
    } catch {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: '【黄师傅】天机暂隐，请稍后再试。',
        id: 'a_err_' + Date.now(),
      }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, result, importedLayout, question]);

  function buildPrompt(res: XuanKongResult, layout: HouseLayout | null, q: string): string {
    let prompt = `[玄空飞星排盘]

【基本信息】
${res.yunName}（${res.yuan}）· ${res.year}年
坐${res.zuoShan}向${res.xiang}

【运盘】
${formatPan(res.yunPan)}

【山盘】
${formatPan(res.shanPan)}

【向盘】
${formatPan(res.xiangPan)}

【格局】
${res.patterns.map(p => `${p.name}：${p.desc}`).join('\n')}
`;

    if (layout) {
      prompt += `\n【户型数据】\n户型名称：${layout.name}\n罗盘旋转：${layout.compassRotation}°\n\n房间分布：\n`;
      for (const room of layout.rooms) {
        prompt += `- ${room.name}（${room.type}）位于${GONG_NAMES[room.gong || 5]?.direction || '中'}方\n`;
      }
    }

    prompt += `\n【问题】${q}\n\n请黄师傅详细分析。`;
    return prompt;
  }

  function formatPan(pan: Record<number, number>): string {
    const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    return gongOrder.map(g => `${GONG_NAMES[g]?.direction || g}:${pan[g]}`).join(' ');
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    }).catch(() => {});
  }

  // 九宫格渲染
  const NineGrid = ({ pan, label, accent }: { pan: Record<number, number>; label: string; accent: string }) => {
    const gongOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-center" style={{ color: accent }}>{label}</h4>
        <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
          {gongOrder.map(gong => {
            const star = NINE_STARS.find(s => s.num === pan[gong]);
            const isCenter = gong === 5;
            return (
              <div
                key={gong}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center ${
                  isCenter ? 'ring-2 ring-amber-400/50' : ''
                }`}
                style={{
                  backgroundColor: star?.num === 5 ? 'rgba(234,179,8,0.2)' : star?.type === '吉' ? 'rgba(34,197,94,0.1)' : star?.type === '凶' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${star?.num === 5 ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <span className="text-lg font-bold" style={{
                  color: star?.num === 5 ? '#fbbf24' : star?.type === '吉' ? '#4ade80' : star?.type === '凶' ? '#f87171' : '#94a3b8',
                }}>
                  {pan[gong]}
                </span>
                <span className="text-[9px] text-white/40">{GONG_NAMES[gong]?.direction}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="relative max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-sm">
            <Star className="w-4 h-4" />
            无常派玄空 · 挨星下卦
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400" style={{ fontFamily: "'Noto Serif SC', 'KaiTi', serif" }}>
            玄空飞星排盘
          </h1>
          <p className="text-amber-200/60 text-lg max-w-2xl mx-auto">
            以三元九运为纲，二十四山为目，挨星下卦，察阴阳顺逆，断宅命吉凶
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* 导入户型提示 */}
        {importedLayout && (
          <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-emerald-300 text-sm font-medium">已导入户型：{importedLayout.name}</span>
                <span className="text-emerald-400/50 text-xs ml-2">{importedLayout.rooms.length} 个房间</span>
              </div>
            </div>
            <Link to="/tools/fengshui" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              更换户型 →
            </Link>
          </div>
        )}

        {/* 输入区域 */}
        <div className="bg-gradient-to-br from-amber-950/20 via-yellow-950/10 to-amber-950/20 backdrop-blur-xl border border-amber-400/20 rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm text-amber-300/80 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />年份
              </label>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white focus:outline-none focus:border-amber-400" />
              <p className="text-xs text-amber-400/40">当前为{getYunByYear(year)}运</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-amber-300/80 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5" />坐山
              </label>
              <select value={zuoShan} onChange={e => setZuoShan(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white focus:outline-none focus:border-amber-400 appearance-none">
                {TWENTY_FOUR_MOUNTAINS.map(m => (
                  <option key={m.name} value={m.name} className="bg-gray-900">{m.name}（{m.direction}·{m.yinYang}）</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-amber-300/80 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />朝向
              </label>
              <select value={xiang} onChange={e => setXiang(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white focus:outline-none focus:border-amber-400 appearance-none">
                {TWENTY_FOUR_MOUNTAINS.map(m => (
                  <option key={m.name} value={m.name} className="bg-gray-900">{m.name}（{m.direction}·{m.yinYang}）</option>
                ))}
              </select>
            </div>
          </div>
          {/* 问题输入 */}
          <div className="mb-4">
            <label className="block text-sm text-amber-300/80 mb-2 font-medium">所问之事（选填，用于AI解析）</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="例如：这个户型的财位在哪？如何化解五黄煞？"
              rows={2}
              className="w-full px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-amber-400" />
          </div>
          <button onClick={handleCalculate} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold rounded-xl shadow-xl hover:shadow-amber-700/30 hover:scale-[1.01] transition-all">
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />排盘中...</span> : '开始玄空飞星排盘'}
          </button>
        </div>

        {/* 排盘结果 */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* 格局提示 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.isDaoShanDaoXiang && (
                <div className="bg-emerald-500/15 border border-emerald-400/30 rounded-xl p-4 text-center">
                  <div className="text-emerald-300 font-bold">到山到向</div>
                  <div className="text-xs text-emerald-400/60 mt-1">丁财两旺，大吉之局</div>
                </div>
              )}
              {result.isShangShanXiaShui && (
                <div className="bg-red-500/15 border border-red-400/30 rounded-xl p-4 text-center">
                  <div className="text-red-300 font-bold">上山下水</div>
                  <div className="text-xs text-red-400/60 mt-1">损丁破财，大凶之局</div>
                </div>
              )}
              {result.isFuYin && (
                <div className="bg-amber-500/15 border border-amber-400/30 rounded-xl p-4 text-center">
                  <div className="text-amber-300 font-bold">伏吟</div>
                  <div className="text-xs text-amber-400/60 mt-1">凡事不利，不宜妄动</div>
                </div>
              )}
            </div>

            {/* 三盘 */}
            <div className="bg-white/5 backdrop-blur-xl border border-amber-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-amber-300 mb-6 text-center">玄空三盘</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <NineGrid pan={result.yunPan} label="运盘" accent="#fbbf24" />
                <NineGrid pan={result.shanPan} label="山盘" accent="#f87171" />
                <NineGrid pan={result.xiangPan} label="向盘" accent="#60a5fa" />
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                <span className="flex items-center gap-1 text-amber-400/60"><span className="w-2 h-2 rounded-full bg-yellow-400" />五黄</span>
                <span className="flex items-center gap-1 text-green-400/60"><span className="w-2 h-2 rounded-full bg-green-400" />吉星</span>
                <span className="flex items-center gap-1 text-red-400/60"><span className="w-2 h-2 rounded-full bg-red-400" />凶星</span>
              </div>
            </div>

            {/* 格局分析 */}
            <div className="bg-white/5 backdrop-blur-xl border border-amber-400/15 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-amber-300 mb-4">格局分析</h3>
              <div className="space-y-3">
                {result.patterns.map((p, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${
                    p.level === '吉' ? 'bg-emerald-500/10 border-emerald-400/30' : p.level === '凶' ? 'bg-red-500/10 border-red-400/30' : 'bg-white/5 border-white/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.level === '吉' ? 'bg-emerald-500/30 text-emerald-300' : p.level === '凶' ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-white/60'
                      }`}>{p.level}</span>
                      <span className="text-white font-medium">{p.name}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => {
                setAiOpen(true);
                if (question.trim()) {
                  setTimeout(() => {
                    setAiInput(question);
                    setTimeout(() => {
                      const btn = document.querySelector('[data-xuankong-ai-send]');
                      if (btn) (btn as HTMLButtonElement).click();
                    }, 100);
                  }, 300);
                }
              }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-medium shadow-lg">
                <Sparkles className="w-5 h-5" />AI风水解析
              </button>
              <SaveRecordButton type="xuankong" typeLabel="玄空飞星" data={result as unknown as Record<string, unknown>} />
            </div>
          </div>
        )}
      </div>

      {/* AI面板 */}
      {aiOpen && result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl h-[85vh] bg-gradient-to-b from-[#1a1209] to-[#0f0c08] border border-amber-400/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-amber-400/20">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-400" />
                <h3 className="text-amber-300 font-bold">玄空飞星 · AI风水解析</h3>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
              {aiMessages.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-amber-300/50 text-sm">输入问题，黄师傅为您解析风水</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['这个户型风水如何？', '财位在哪个方位？', '如何化解五黄煞？'].map(q => (
                      <button key={q} onClick={() => setAiInput(q)}
                        className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300/70 hover:bg-amber-500/20">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {aiMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' ? 'bg-amber-600/30 border border-amber-400/30 text-amber-100' : 'bg-white/5 border border-white/10 text-white/90'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    {msg.role === 'assistant' && (
                      <button onClick={() => copyText(msg.content, msg.id)}
                        className="mt-2 text-xs text-white/40 hover:text-amber-400">
                        {copiedId === msg.id ? '✓ 已复制' : '复制'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-amber-400/70">
                      <Loader2 className="w-4 h-4 animate-spin" />黄师傅推演中...
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-4 border-t border-amber-400/20">
              <div className="flex gap-2">
                <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAI()}
                  placeholder="问风水..."
                  className="flex-1 px-4 py-3 bg-black/40 border border-amber-400/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none" />
                <button data-xuankong-ai-send onClick={handleAI} disabled={aiLoading}
                  className="px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-500 disabled:opacity-50">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
