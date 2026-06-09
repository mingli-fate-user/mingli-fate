import { useState, useCallback } from 'react';
import {
  Sparkles, Send, X, Copy, Check, Loader2,
  RotateCcw, Crown, Flame, Wind, Zap,
} from 'lucide-react';
import SaveRecordButton from '@/components/SaveRecordButton';
import HighlightText from '@/components/HighlightText';
import {
  calculateDaLiuRen, DI_ZHI, TIAN_JIANGS, getLiuQin,
  type DaLiuRenResult,
} from '@/data/daliuren';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';

// ============================================================
// 大六壬排盘工具 - 人事之王
// 顶级美学：荧光感 + 简约高级 + 暗色主题
// ============================================================

const API_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];

export default function DaLiuRenTool() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [hour, setHour] = useState(new Date().getHours());
  const [dayGanZhi, setDayGanZhi] = useState('甲子');
  const [hourGanZhi, setHourGanZhi] = useState('甲子');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<DaLiuRenResult | null>(null);
  const [loading, setLoading] = useState(false);

  // AI
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const handleCalculate = useCallback(() => {
    if (!question.trim()) {
      alert('请先输入您要询问的问题，尽可能把事情描述得详细一些');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      try {
        const res = calculateDaLiuRen(year, month, day, hour, dayGanZhi, hourGanZhi, question);
        setResult(res);
        setAiMessages([]);
      } catch (err) {
        alert('排盘失败：' + (err as Error).message);
      }
      setLoading(false);
    }, 600);
  }, [year, month, day, hour, dayGanZhi, hourGanZhi, question]);

  const handleAI = useCallback(async () => {
    const q = aiInput.trim() || question;
    if (!q || !result) return;
    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: 'user', content: q, id: 'u_' + Date.now() }]);
    setAiInput('');

    try {
      const apiKey = API_KEY_PARTS.join('');
      const prompt = buildPrompt(result, q);

      const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V4-Flash',
          messages: [
            {
              role: 'system',
              content: `你是黄师傅，精通大六壬（六壬神课）的命理大师。

【身份定位】
大六壬与奇门遁甲、太乙神数并称"三式"，是古代最高层次的预测学，尤擅人事推演，被誉为"人事之王"。

【核心规则】
1. 根据排盘的天地盘、四课、三传、十二天将进行分析
2. 三传代表事情的发端（初传）、转折（中传）、结果（末传）
3. 结合十二天将判断吉凶
4. 用半文半白的古典语言风格
5. 引用《六壬大全》《六壬金口诀》等古籍

【语言风格】
铁口直断，引用古籍增强权威感。严禁使用任何markdown格式符号（#和*），所有输出必须是纯文本。` + NO_MARKDOWN_RULE + ` `,
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || '解析失败';
      setAiMessages(prev => [...prev, { role: 'assistant', content, id: 'a_' + Date.now() }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: '【黄师傅】天机暂隐，请稍后再试。', id: 'a_err_' + Date.now() }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, result]);

  function buildPrompt(res: DaLiuRenResult, q: string): string {
    return `[大六壬排盘]

${res.year}年${res.month}月${res.day}日 ${res.hour}时
节气：${res.jieQi}
日干支：${res.dayGanZhi} · 时干支：${res.hourGanZhi}
月将：${res.yueJiang.name}（${res.yueJiang.zhi}）

【四课】
第一课：${res.siKe.ke1[0]} / ${res.siKe.ke1[1]}
第二课：${res.siKe.ke2[0]} / ${res.siKe.ke2[1]}
第三课：${res.siKe.ke3[0]} / ${res.siKe.ke3[1]}
第四课：${res.siKe.ke4[0]} / ${res.siKe.ke4[1]}

【三传】
初传：${res.sanChuan.chu.zhi} · ${res.sanChuan.chu.jiang} · ${res.sanChuan.chu.liuQin}
中传：${res.sanChuan.zhong.zhi} · ${res.sanChuan.zhong.jiang} · ${res.sanChuan.zhong.liuQin}
末传：${res.sanChuan.mo.zhi} · ${res.sanChuan.mo.jiang} · ${res.sanChuan.mo.liuQin}
起传法：${res.sanChuan.method}

【格局】
${res.geJu.map(g => `${g.name}：${g.desc}`).join('\n')}

【问题】${q}

请黄师傅以大六壬课式详细分析。`;
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    }).catch(() => {});
  }

  // 天地盘可视化
  const PanDisplay = ({ result }: { result: DaLiuRenResult }) => {
    const tp = result.tianDiPan;
    // 地盘固定排列：顺时针从亥开始
    const posOrder = ['巳', '午', '未', '申', '辰', '酉', '卯', '戌', '寅', '丑', '子', '亥'];
    // 按四行排列
    const rows = [
      [posOrder[0], posOrder[1], posOrder[2], posOrder[3]],
      [posOrder[4], '', '', posOrder[5]],
      [posOrder[6], '', '', posOrder[7]],
      [posOrder[8], posOrder[9], posOrder[10], posOrder[11]],
    ];

    return (
      <div className="grid grid-cols-4 gap-1.5 max-w-xs mx-auto">
        {rows.flat().map((pos, i) => {
          if (!pos) return <div key={i} className="aspect-square" />;
          const diIdx = DI_ZHI.indexOf(pos);
          const tianZhi = tp.tianPan[diIdx];
          const jiang = result.shiErJiang.jiangs.find(j => j.zhi === tianZhi);

          return (
            <div key={pos}
              className="aspect-square rounded-lg flex flex-col items-center justify-center border relative overflow-hidden"
              style={{
                backgroundColor: jiang?.nature === '大吉' ? 'rgba(34,197,94,0.12)' : jiang?.nature === '大凶' ? 'rgba(239,68,68,0.12)' : jiang?.nature === '吉' ? 'rgba(34,197,94,0.08)' : jiang?.nature === '凶' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                borderColor: jiang?.nature === '大吉' ? 'rgba(34,197,94,0.3)' : jiang?.nature === '大凶' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
              }}>
              <span className="text-[9px] text-white/30 absolute top-0.5 left-1">{pos}</span>
              <span className="text-lg font-bold" style={{
                color: jiang?.nature === '大吉' ? '#4ade80' : jiang?.nature === '大凶' ? '#f87171' : jiang?.nature === '吉' ? '#6ee7b7' : jiang?.nature === '凶' ? '#fca5a5' : '#e2e8f0',
                textShadow: jiang?.nature === '大吉' || jiang?.nature === '大凶' ? `0 0 8px ${jiang.nature === '大吉' ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}` : 'none',
              }}>
                {tianZhi}
              </span>
              <span className="text-[8px] mt-0.5" style={{
                color: jiang?.nature === '大吉' || jiang?.nature === '吉' ? 'rgba(34,197,94,0.7)' : jiang?.nature === '大凶' || jiang?.nature === '凶' ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.4)',
              }}>
                {jiang?.name || ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero - 荧光暗色主题 */}
      <div className="relative overflow-hidden py-14 px-4">
        <div className="absolute inset-0 bg-[#080a10]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
        <div className="absolute top-10 right-20 w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <div className="absolute bottom-16 left-24 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-20 left-40 w-1 h-1 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-400/30 text-indigo-300 text-sm"
            style={{ background: 'rgba(99,102,241,0.08)', backdropFilter: 'blur(8px)' }}>
            <Crown className="w-4 h-4" />
            三式之最 · 人事之王
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight"
            style={{
              fontFamily: "'Noto Serif SC', 'KaiTi', serif",
              background: 'linear-gradient(135deg, #818cf8 0%, #c4b5fd 50%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(99,102,241,0.3)',
            }}>
            大六壬
          </h1>
          <div className="mt-2 mb-4"><IntroModal {...getToolIntro('daliuren')}/></div>
          <p className="text-indigo-200/50 text-base max-w-xl mx-auto leading-relaxed">
            六壬神课，以月将加时排天地盘，四课三传断人事吉凶
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* 输入 */}
        <div className="relative rounded-2xl border border-white/[0.06] p-6 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(6,182,212,0.02))' }}>
          <div className="absolute inset-0 opacity-30" style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)',
          }} />
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { l: '年', v: year, s: setYear },
              { l: '月', v: month, s: setMonth, mn: 1, mx: 12 },
              { l: '日', v: day, s: setDay, mn: 1, mx: 31 },
              { l: '时', v: hour, s: setHour, mn: 0, mx: 23 },
            ].map(f => (
              <div key={f.l} className="space-y-1.5">
                <label className="text-xs text-indigo-300/60">{f.l}</label>
                <input type="number" min={f.mn} max={f.mx} value={f.v}
                  onChange={e => f.s(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] text-white text-sm focus:outline-none focus:border-indigo-400/50 transition-colors"
                  style={{ background: 'rgba(0,0,0,0.3)' }} />
              </div>
            ))}
          </div>
          <div className="relative grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-1.5">
              <label className="text-xs text-indigo-300/60">日干支</label>
              <select value={dayGanZhi} onChange={e => setDayGanZhi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] text-white text-sm focus:outline-none focus:border-indigo-400/50 appearance-none"
                style={{ background: 'rgba(0,0,0,0.3)' }}>
                {Array.from({ length: 60 }, (_, i) => {
                  const gz = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][i % 10] + ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i % 12];
                  return <option key={gz} value={gz} className="bg-gray-900">{gz}</option>;
                })}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-indigo-300/60">时干支</label>
              <select value={hourGanZhi} onChange={e => setHourGanZhi(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] text-white text-sm focus:outline-none focus:border-indigo-400/50 appearance-none"
                style={{ background: 'rgba(0,0,0,0.3)' }}>
                {Array.from({ length: 60 }, (_, i) => {
                  const gz = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][i % 10] + ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][i % 12];
                  return <option key={gz} value={gz} className="bg-gray-900">{gz}</option>;
                })}
              </select>
            </div>
          </div>
          <div className="relative space-y-1.5 mb-4">
            <label className="text-xs text-indigo-300/60">所问之事（可选）</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="尽可能把事情描述得详细一点点...（例如：问工作调动是否顺利）"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50 resize-none"
              style={{ background: 'rgba(0,0,0,0.3)' }} />
          </div>
          <button onClick={handleCalculate} disabled={loading}
            className="relative w-full py-3 rounded-xl font-bold text-sm text-white overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />排课中...</> : <><Crown className="w-4 h-4" />起六壬课</>}
            </span>
          </button>
        </div>

        {/* 结果 */}
        {result && (
          <div className="space-y-5 animate-fade-in">
            {/* 基本信息 */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-indigo-300/50">
              <span className="px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5">节气：{result.jieQi}</span>
              <span className="px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5">月将：{result.yueJiang.name}（{result.yueJiang.zhi}）</span>
              <span className="px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5">日：{result.dayGanZhi}</span>
              <span className="px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5">时：{result.hourGanZhi}</span>
            </div>

            {/* 天地盘 */}
            <div className="relative rounded-2xl border border-white/[0.06] p-6"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(6,182,212,0.02))' }}>
              <h3 className="text-sm font-semibold text-indigo-300/80 mb-4 text-center">天地盘 · 十二天将</h3>
              <PanDisplay result={result} />
            </div>

            {/* 四课 */}
            <div className="relative rounded-2xl border border-white/[0.06] p-6"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(6,182,212,0.02))' }}>
              <h3 className="text-sm font-semibold text-indigo-300/80 mb-4 text-center">四课</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { n: '第一课', k: result.siKe.ke1 },
                  { n: '第二课', k: result.siKe.ke2 },
                  { n: '第三课', k: result.siKe.ke3 },
                  { n: '第四课', k: result.siKe.ke4 },
                ].map((ke, i) => (
                  <div key={i} className="rounded-xl p-3 border border-white/[0.06] text-center"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[10px] text-indigo-400/50 mb-1">{ke.n}</div>
                    <div className="text-lg font-bold text-white/90">{ke.k[0]}</div>
                    <div className="text-[10px] text-white/30">/{ke.k[1]}</div>
                    <div className="text-[10px] mt-1" style={{
                      color: getLiuQin(result.dayGanZhi[0], ke.k[0]) === '官鬼' ? '#f87171' : getLiuQin(result.dayGanZhi[0], ke.k[0]) === '妻财' ? '#4ade80' : 'rgba(255,255,255,0.4)',
                    }}>
                      {getLiuQin(result.dayGanZhi[0], ke.k[0])}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 三传 */}
            <div className="relative rounded-2xl border border-white/[0.06] p-6"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(6,182,212,0.02))' }}>
              <h3 className="text-sm font-semibold text-indigo-300/80 mb-2 text-center">三传 · {result.sanChuan.method}</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                {[
                  { label: '初', s: result.sanChuan.chu, color: '#818cf8' },
                  { label: '中', s: result.sanChuan.zhong, color: '#a78bfa' },
                  { label: '末', s: result.sanChuan.mo, color: '#67e8f9' },
                ].map((sc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="rounded-xl px-4 py-3 border text-center min-w-[90px]"
                      style={{ borderColor: `${sc.color}30`, background: `${sc.color}08` }}>
                      <div className="text-[10px]" style={{ color: `${sc.color}80` }}>{sc.label}传 · {sc.s.desc}</div>
                      <div className="text-xl font-bold mt-0.5" style={{ color: sc.color }}>{sc.s.zhi}</div>
                      <div className="text-[10px] text-white/40">{sc.s.jiang} · {sc.s.liuQin}</div>
                    </div>
                    {i < 2 && <Zap className="w-3 h-3 text-white/20" />}
                  </div>
                ))}
              </div>
            </div>

            {/* 格局 */}
            <div className="flex flex-wrap justify-center gap-2">
              {result.geJu.map((gj, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-xs border"
                  style={{
                    borderColor: gj.level === '吉' ? 'rgba(34,197,94,0.3)' : gj.level === '凶' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)',
                    background: gj.level === '吉' ? 'rgba(34,197,94,0.08)' : gj.level === '凶' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                    color: gj.level === '吉' ? '#6ee7b7' : gj.level === '凶' ? '#fca5a5' : 'rgba(255,255,255,0.5)',
                  }}>
                  {gj.name}
                </span>
              ))}
            </div>

            {/* 按钮 */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button onClick={() => {
                  setAiOpen(true);
                  if (question.trim()) {
                    setTimeout(() => { setAiInput(question); setTimeout(() => { const btn = document.getElementById('daliuren-ai-send'); if (btn) btn.click(); }, 100); }, 300);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                <Sparkles className="w-4 h-4" />AI六壬解析
              </button>
              <SaveRecordButton type="daliuren" typeLabel="大六壬" data={result as unknown as Record<string, unknown>} />
              <button onClick={handleCalculate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white/60 border border-white/[0.08] hover:bg-white/[0.05] transition-all">
                <RotateCcw className="w-4 h-4" />重新排课
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI面板 */}
      {aiOpen && result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-3xl rounded-2xl border border-indigo-400/20 overflow-hidden flex flex-col max-h-[85vh]"
            style={{ background: 'linear-gradient(180deg, #0c0e18, #080a10)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-indigo-400" />
                <h3 className="text-indigo-300 font-bold text-sm">大六壬 · AI解析</h3>
              </div>
              <button onClick={() => setAiOpen(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
              {aiMessages.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-indigo-300/40 text-sm">输入问题，黄师傅以六壬课式解析</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['问工作调动', '问婚姻感情', '问财运投资'].map(q => (
                      <button key={q} onClick={() => setAiInput(q)}
                        className="px-3 py-1.5 rounded-full text-xs border border-indigo-400/20 text-indigo-300/60 hover:bg-indigo-400/10">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {aiMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-100'
                      : 'bg-white/[0.04] border border-white/[0.08] text-white/80'
                  }`}>
                    {msg.role === 'assistant' ? <HighlightText text={msg.content} /> : msg.content}
                    {msg.role === 'assistant' && (
                      <button onClick={() => copyText(msg.content, msg.id)} className="mt-2 block text-[10px] text-white/30 hover:text-indigo-400">
                        {copiedId === msg.id ? '✓ 已复制' : '复制'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-indigo-400/60">
                      <Loader2 className="w-4 h-4 animate-spin" />推演中...
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-4 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAI()}
                  placeholder="问人事..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-400/50"
                  style={{ background: 'rgba(0,0,0,0.3)' }} />
                <button id="daliuren-ai-send" onClick={handleAI} disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl text-white font-medium transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
