import { useState, useCallback } from 'react';
import { Crown, Sparkles, Send, BookOpen } from 'lucide-react';
import { streamSiliconAPI } from '@/utils/apiClient';
import { calculateHuangJi } from '@/data/huangji';
import SaveRecordButton from '@/components/SaveRecordButton';
import HighlightText from '@/components/HighlightText';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';

export default function HuangJiTool() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [hour, setHour] = useState(12);
  const [result, setResult] = useState<ReturnType<typeof calculateHuangJi> | null>(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const handleCalculate = useCallback(() => {
    const res = calculateHuangJi(year, month, day, hour);
    setResult(res);
  }, [year, month, day, hour]);

  function buildPrompt(res: ReturnType<typeof calculateHuangJi>, q: string): string {
    return `[皇极经世排盘]

出生时间：${res.birthYear}年${res.birthMonth}月${res.birthDay}日${res.birthHour}时
先天卦：${res.xianTianGua}
后天卦：${res.houTianGua}
大运卦：${res.daYunGua}
元：${res.yuan}
会：${res.hui}
运：${res.yun}
世：${res.shi}
卦辞：${res.guaCi}
爻辞：${res.yaoCi}

【所问之事】${q}

请黄师傅以皇极经世角度分析此命盘与所问之事。`;
  }

  function handleAsk() {
    const q = aiInput.trim();
    if (!q || !result) return;
    setAiOpen(true);
    setAiLoading(true);

    const userMsg = { role: 'user', content: q, id: Date.now().toString() };
    const id = (Date.now() + 1).toString();
    const assistantMsg = { role: 'assistant', content: '', id };
    setAiMessages(prev => [...prev, userMsg, assistantMsg]);
    setAiInput('');

    const prompt = buildPrompt(result, q);
    let full = '';
    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅，精通皇极经世。以邵雍《皇极经世书》为宗，用元会运世的时间推演体系，结合卦象变化分析命运走势。像聊天一样自然说，不要分步骤编号。半文半白，铁口直断。` + NO_MARKDOWN_RULE },
      { role: 'user', content: prompt },
    ], {
      onChunk: (delta) => {
        full += delta;
        setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: full } : m));
      },
      onDone: () => setAiLoading(false),
      onError: (err) => {
        setAiLoading(false);
        setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: `【黄师傅】${err}。` } : m));
      },
    }, { maxTokens: 2000 });
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          <Crown className="w-7 h-7 text-yellow-400 inline mr-2" />
          皇极经世
        </h1>
        <div className="flex justify-center">
          <IntroModal {...getToolIntro('huangji')!} />
        </div>
        <p className="text-sm text-white/60">邵雍先天学 · 元会运世 · 推天道以明人事</p>
      </div>

      {/* 输入 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-white/50">年</label>
            <input type="number" value={year} onChange={(e) => { const v = e.target.value; setYear(v === "" ? "" : Number(v)) }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/50">月</label>
            <input type="number" value={month} min={1} max={12} onChange={(e) => { const v = e.target.value; setMonth(v === "" ? "" : Number(v)) }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/50">日</label>
            <input type="number" value={day} min={1} max={31} onChange={(e) => { const v = e.target.value; setDay(v === "" ? "" : Number(v)) }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/50">时 (0-23)</label>
            <input type="number" value={hour} min={0} max={23} onChange={(e) => { const v = e.target.value; setHour(v === "" ? "" : Number(v)) }}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50" />
          </div>
        </div>
        <button onClick={handleCalculate}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-medium hover:from-yellow-500 hover:to-amber-500 transition-all flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />排盘
        </button>
      </div>

      {/* 结果 */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-yellow-400/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />皇极经世命盘
              </h3>
              <SaveRecordButton
                toolType="huangji"
                toolName="皇极经世"
                inputData={{ year: result.birthYear, month: result.birthMonth, day: result.birthDay, hour: result.birthHour }}
                resultData={result}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-lg p-3 space-y-1">
                <p className="text-white/40">先天卦</p>
                <p className="text-yellow-300 text-lg font-semibold">{result.xianTianGua}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 space-y-1">
                <p className="text-white/40">后天卦</p>
                <p className="text-yellow-300 text-lg font-semibold">{result.houTianGua}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 space-y-1">
                <p className="text-white/40">大运卦</p>
                <p className="text-yellow-300 text-lg font-semibold">{result.daYunGua}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 space-y-1">
                <p className="text-white/40">元会运世</p>
                <p className="text-yellow-300">{result.yuan} · {result.hui}</p>
                <p className="text-yellow-300/70 text-xs">{result.yun} · {result.shi}</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-white/40">卦辞</p>
              <p className="text-white/80 italic">{result.guaCi}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-white/40">爻辞</p>
              <p className="text-white/80">{result.yaoCi}</p>
            </div>
          </div>

          {/* AI 解析 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="text-base font-semibold text-white/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />AI 智能解析
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                placeholder="输入您的问题，AI结合皇极经世为您解析..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400/50"
              />
              <button onClick={handleAsk} disabled={aiLoading || !result}
                className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />{aiLoading ? '解析中...' : '问'}
              </button>
            </div>

            {aiOpen && aiMessages.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {aiMessages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-yellow-500/10 border border-yellow-400/20 ml-4' : 'bg-white/5 border border-white/10 mr-4'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/40">{msg.role === 'user' ? '您' : '黄师傅'}</span>
                      {msg.content && (
                        <button onClick={() => copyText(msg.content, msg.id)} className="text-xs text-white/30 hover:text-white/60">
                          {copiedId === msg.id ? '已复制' : '复制'}
                        </button>
                      )}
                    </div>
                    {msg.content ? (
                      <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        <HighlightText text={msg.content} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                        黄师傅正在推演...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
