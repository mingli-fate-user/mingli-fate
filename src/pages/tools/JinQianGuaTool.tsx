import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Send, X, Copy, Check, Loader2, RotateCcw } from 'lucide-react';
import SaveRecordButton from '@/components/SaveRecordButton';
import HighlightText from '@/components/HighlightText';
import { cleanMarkdown, NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';

interface GuaData {
  num: number;
  name: string;
  guaCi: string;
  yaoCi: Record<string, string>;
  tianJiDao: string;
  renJianDao: string;
  guaTu: string;
}

const YAO_ORDER = ['初九', '九二', '九三', '九四', '九五', '上九', '初六', '六二', '六三', '六四', '六五', '上六', '用九', '用六'];

import { getYaoFromGuaNum, YI_JING_64 } from '@/data/yijing64';

function loadGuaData(): Record<string, GuaData> {
  return YI_JING_64 as Record<string, GuaData>;
}

const API_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];

// 六爻图形
function GuaXiang({ yao }: { yao: boolean[] }) {
  return (
    <div className="flex flex-col-reverse items-center gap-2 p-5 bg-black/50 rounded-xl border border-blue-300 shadow-lg shadow-blue-100">
      {yao.map((isYang, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-white/75 w-8 text-right">{['初','二','三','四','五','上'][i]}爻</span>
          {isYang ? (
            <div className="w-28 sm:w-40 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 rounded-full shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
          ) : (
            <div className="w-28 sm:w-40 flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full" />
              <div className="w-2 h-1" />
              <div className="flex-1 h-1 bg-gradient-to-r from-slate-500 to-slate-400 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function JinQianGuaTool() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<{ gua: GuaData; num: number } | null>(null);
  const [shaking, setShaking] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => { loadGuaData(); setDataReady(true); }, []);

  const doShake = useCallback(async () => {
    if (!question.trim()) { alert('请先输入您要卜问的问题'); return; }
    if (!dataReady) { alert('数据加载中'); return; }
    setShaking(true); setResult(null); setAiOpen(false); setAiMessages([]);
    await new Promise(r => setTimeout(r, 2500));
    const num = Math.floor(Math.random() * 64) + 1;
    const data = loadGuaData();
    setShaking(false);
    setResult({ gua: data[String(num)], num });
  }, [question, dataReady]);

  function buildPrompt(): string {
    if (!result) return '';
    const g = result.gua;
    let yaoText = '';
    for (const y of YAO_ORDER) { if (g.yaoCi[y]) yaoText += `\n${y}：${g.yaoCi[y]}`; }
    return `[卜问之事]\n${question}\n\n[所得之卦]\n第${g.num}卦：${g.name}\n\n[卦辞]\n${g.guaCi}\n\n[爻辞]${yaoText}\n\n[天机道]\n${g.tianJiDao}\n\n[人间道]\n${g.renJianDao}\n\n请按以下步骤解卦：\n\n第一步：定位问题。分析顾客所问之事，对应六爻中哪一爻最相关。引用该爻爻辞原文说明。\n\n第二步：看事态走向。从定位之爻出发，看下一爻变化，引用下一爻爻辞。\n\n第三步：结合人间道分析。从人事角度具体分析。\n\n第四步：结合天机道分析。从天道规律角度揭示天机。\n\n第五步：给出建议。综合以上，给出行之有效的建议，末句加勉励。\n\n风格：半文半白，铁口直断，每步之间空一行，引用爻辞标注原文。`;
  }

  async function streamChat(messages: { role: string; content: string }[], onChunk: (t: string) => void) {
    setAiLoading(true);
    try {
      const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY_PARTS.join('')}` },
        body: JSON.stringify({ model: 'deepseek-ai/DeepSeek-V4-Flash', messages, max_tokens: 2000, temperature: 0.7, stream: true }),
      });
      const reader = resp.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder(); let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const d = line.slice(5).trim();
          if (d === '[DONE]') break;
          try { const j = JSON.parse(d); const c = j.choices?.[0]?.delta?.content || ''; if (c) { full += c; onChunk(full); } } catch { /* */ }
        }
      }
    } catch { /* */ }
    setAiLoading(false);
  }

  const askAI = useCallback(async () => {
    if (!result) return;
    setAiOpen(true);
    const id = 'ai_' + Date.now();
    setAiMessages([{ role: 'assistant', content: '', id }]);
    await streamChat(
      [
        { role: 'system', content: '你是黄师傅，研习易经多年的年轻命理师。精通倪海厦《天纪》体系，断卦铁口直断，半文半白。严格按五步解卦：定位问题爻→看事态走向→人间道分析→天机道分析→给建议。每步之间空一行。引用爻辞原文。' + NO_MARKDOWN_RULE },
        { role: 'user', content: buildPrompt() },
      ],
      (text) => setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: text } : m))
    );
  }, [result]);

  const sendFollowUp = useCallback(async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput('');
    const userId = 'u_' + Date.now();
    const aiId = 'a_' + Date.now();
    const newMsgs = [...aiMessages, { role: 'user', content: userMsg, id: userId }, { role: 'assistant', content: '', id: aiId }];
    setAiMessages(newMsgs);
    const history = newMsgs.filter(m => m.id !== aiId).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    await streamChat(
      [{ role: 'system', content: '你是黄师傅，继续之前的易经解卦对话。结合之前分析的卦象回答顾客追问。半文半白，铁口直断。' + NO_MARKDOWN_RULE }, ...history],
      (text) => setAiMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: text } : m))
    );
  }, [aiInput, aiLoading, aiMessages]);

  async function copyText(text: string, id: string) {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
    }
    setCopiedId(id); setTimeout(() => setCopiedId(''), 2000);
  }

  const yaoLines = result ? getYaoFromGuaNum(result.num) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">金钱卦</h1>
        <p className="text-white/60">心诚则灵，输入问题，摇卦随机得出六十四卦之一</p>
        {!dataReady && <p className="text-xs text-orange-400 mt-2">正在加载卦象数据...</p>}
      </div>

      {/* Input + Shake */}
      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        <label className="block text-sm text-white/60 mb-2">您要卜问的事</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="尽可能把事情描述得详细一点点...（例如：这次投资能成吗？）"
          className="w-full px-4 py-3 bg-black/50 border border-blue-200 rounded-lg text-white placeholder:text-white/75 focus:outline-none focus:border-blue-500 text-sm resize-none" rows={3} />
        <div className="flex justify-center mt-6">
          <button onClick={doShake} disabled={shaking || !dataReady}
            className={`relative px-12 py-4 rounded-xl font-bold text-lg transition-all ${shaking ? 'bg-blue-500/20 scale-95' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 shadow-lg shadow-blue-200 active:scale-95'} disabled:opacity-50`}>
            {shaking ? '铜钱飞旋...' : '摇卦'}
          </button>
        </div>
        {shaking && (
          <div className="mt-6 text-center">
            <div className="flex justify-center items-end gap-6 h-16">
              <span className="text-5xl animate-bounce" style={{animationDuration:'0.6s'}}>🪙</span>
              <span className="text-4xl animate-bounce" style={{animationDuration:'0.5s',animationDelay:'0.1s'}}>🪙</span>
              <span className="text-5xl animate-bounce" style={{animationDuration:'0.7s',animationDelay:'0.05s'}}>🪙</span>
            </div>
            <p className="text-blue-600 mt-4 text-sm animate-pulse">铜钱飞旋，心诚则灵...</p>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* 卦名 + 卦象 + 卦辞 */}
          <div className="p-6 border-2 border-blue-300 rounded-xl bg-gradient-to-br from-blue-50 to-slate-50/50">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <GuaXiang yao={yaoLines} />
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs text-white/60 mb-1">第{result.num}卦</p>
                <h2 className="text-3xl font-bold text-blue-600 mb-3">{result.gua.name}</h2>
                <p className="text-base text-white leading-relaxed" style={{fontFamily:'serif'}}>{result.gua.guaCi}</p>
                <p className="text-xs text-white/75 mt-3">问：{question}</p>
              </div>
            </div>
          </div>

          {/* 爻辞 */}
          {Object.keys(result.gua.yaoCi).length > 0 && (
            <div className="p-5 border border-blue-100 rounded-lg bg-black/15">
              <h3 className="text-blue-600 font-bold mb-4 text-center text-sm tracking-wider">六爻爻辞</h3>
              <div className="space-y-2">
                {YAO_ORDER.filter(y => result.gua.yaoCi[y]).map(yaoName => {
                  const isYang = yaoName.includes('九');
                  return (
                    <div key={yaoName} className={`p-3 rounded-lg border ${isYang ? 'border-amber-400/30 bg-amber-500/8' : 'border-blue-400/30 bg-blue-500/8'}`}>
                      <span className={`font-bold text-sm ${isYang ? 'text-amber-300' : 'text-blue-300'}`}>{yaoName}</span>
                      <span className="text-white/90 text-sm ml-3" style={{fontFamily:'serif'}}>{result.gua.yaoCi[yaoName]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 天机道 */}
          {result.gua.tianJiDao && (
            <div className="p-5 border border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-950/20 to-transparent">
              <h3 className="text-purple-300 font-bold mb-3 text-sm tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-5 bg-purple-400 rounded-full inline-block" />天机道
              </h3>
              <div className="text-sm text-white/80 leading-[1.8]">
                <HighlightText text={result.gua.tianJiDao} />
              </div>
            </div>
          )}

          {/* 人间道 */}
          {result.gua.renJianDao && (
            <div className="p-5 border border-blue-500/30 rounded-xl bg-gradient-to-br from-blue-950/20 to-transparent">
              <h3 className="text-blue-300 font-bold mb-3 text-sm tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-400 rounded-full inline-block" />人间道
              </h3>
              <div className="text-sm text-white/80 leading-[1.8]">
                <HighlightText text={result.gua.renJianDao} />
              </div>
            </div>
          )}

          {/* 卦图之象 */}
          {result.gua.guaTu && (
            <div className="p-5 border border-emerald-500/30 rounded-xl bg-gradient-to-br from-emerald-950/20 to-transparent">
              <h3 className="text-emerald-300 font-bold mb-3 text-sm tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-400 rounded-full inline-block" />卦图之象
              </h3>
              <div className="text-sm text-white/80 leading-[1.8]">
                <HighlightText text={result.gua.guaTu} />
              </div>
            </div>
          )}

          {/* AI Buttons */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <button onClick={askAI} disabled={aiLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
              <Sparkles className="w-5 h-5" />{aiLoading && aiMessages.length === 0 ? '请稍候...' : 'AI 解卦'}
            </button>
            {result && (
              <SaveRecordButton
                type="jinqiangua"
                typeLabel="金钱卦"
                data={{ num: result.num, name: result.gua.name, guaCi: result.gua.guaCi, question } as unknown as Record<string, unknown>}
              />
            )}
            <button onClick={doShake}
              className="flex items-center gap-2 px-6 py-3 border border-blue-200 text-white/60 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-all">
              <RotateCcw className="w-4 h-4" />重新摇卦
            </button>
          </div>

          {/* AI Chat */}
          {aiOpen && (
            <div className="border border-purple-500/20 rounded-xl bg-black/45 overflow-hidden">
              <div className="p-4 border-b border-purple-500/10 bg-gradient-to-r from-purple-900/20 to-blue-900/10 flex items-center justify-between">
                <h3 className="text-purple-400 font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" />黄师傅解卦</h3>
                <button onClick={() => setAiOpen(false)} className="text-white/75 hover:text-blue-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {aiMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'user' ? (
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0"><span className="text-xs text-blue-600">问</span></div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-3.5 h-3.5 text-purple-400" /></div>
                    )}
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg text-sm leading-relaxed text-left ${msg.role === 'user' ? 'bg-blue-500/10 border border-blue-200 text-white' : 'bg-black/45 border border-purple-500/10 text-white/80'}`}>
                        {msg.role === 'assistant' && msg.content
                          ? <HighlightText text={msg.content} />
                          : (msg.content || (aiLoading ? <span className="flex items-center gap-2 text-white/75"><Loader2 className="w-3.5 h-3.5 animate-spin" />黄师傅研读中...</span> : ''))
                        }
                      </div>
                      {msg.role === 'assistant' && msg.content && (
                        <button onClick={() => copyText(msg.content, msg.id)} className="mt-1 flex items-center gap-1 px-2 py-0.5 text-[10px] text-white/75 hover:text-blue-600">
                          {copiedId === msg.id ? <><Check className="w-3 h-3" />已复制</> : <><Copy className="w-3 h-3" />复制</>}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-purple-500/10">
                <div className="flex gap-2">
                  <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendFollowUp()}
                    placeholder="追问黄师傅..." disabled={aiLoading}
                    className="flex-1 px-4 py-2 bg-black/50 border border-purple-500/20 rounded-lg text-white placeholder:text-white/75 focus:outline-none focus:border-purple-500/40 text-sm disabled:opacity-50" />
                  <button onClick={sendFollowUp} disabled={aiLoading || !aiInput.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-white/75">金钱卦仅供学习参考，心诚则灵</p>
        </div>
      )}
    </div>
  );
}
