import { useState } from 'react';
import { Dice5, Sparkles, Send, BookOpen } from 'lucide-react';
import { streamSiliconAPI } from '@/utils/apiClient';
import { castLingQiJing } from '@/data/lingqijing';
import SaveRecordButton from '@/components/SaveRecordButton';
import HighlightText from '@/components/HighlightText';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';

export default function LingQiJingTool() {
  const [result, setResult] = useState<ReturnType<typeof castLingQiJing> | null>(null);
  const [question, setQuestion] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const handleCast = () => {
    const res = castLingQiJing();
    setResult(res);
  };

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

    const prompt = `[灵棋经排盘]

上投：${result.upper}棋
中投：${result.middle}棋
下投：${result.lower}棋
总数：${result.total}棋
卦号：第${result.guaNumber}卦
卦名：${result.guaName}
阴阳组合：${result.yinYang}
卦辞：${result.guaCi}

【所问之事】${q}

请黄师傅以灵棋经角度分析此卦。`;

    let full = '';
    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅，精通灵棋经。灵棋经以十二棋三投成卦，共一百二十五卦，每卦有卦辞断吉凶。像聊天一样自然说，不要分步骤编号。半文半白，铁口直断。` + NO_MARKDOWN_RULE },
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
          <Dice5 className="w-7 h-7 text-emerald-400 inline mr-2" />
          灵棋经
        </h1>
        <div className="flex justify-center">
          <IntroModal {...getToolIntro('lingqijing')!} />
        </div>
        <p className="text-sm text-white/60">十二棋子 · 三投成卦 · 一百二十五卦断吉凶</p>
      </div>

      {/* 提问 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <label className="text-sm text-white/70">心中默念所问之事</label>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="如：问事业、问婚姻、问出行..."
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400/50"
        />
        <button onClick={handleCast}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium hover:from-emerald-500 hover:to-green-500 transition-all flex items-center justify-center gap-2">
          <Dice5 className="w-4 h-4" />起卦
        </button>
      </div>

      {/* 结果 */}
      {result && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-emerald-400/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />第{result.guaNumber}卦 · {result.guaName}
              </h3>
              <SaveRecordButton
                toolType="lingqijing"
                toolName="灵棋经"
                inputData={{ question }}
                resultData={result}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs text-white/40">上投</p>
                <p className="text-xl text-emerald-300 font-bold">{result.upper}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs text-white/40">中投</p>
                <p className="text-xl text-emerald-300 font-bold">{result.middle}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs text-white/40">下投</p>
                <p className="text-xl text-emerald-300 font-bold">{result.lower}</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-white/40 text-sm">阴阳组合</p>
              <p className="text-white/80">{result.yinYang}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 space-y-1">
              <p className="text-white/40 text-sm">卦辞</p>
              <p className="text-white/80 italic">{result.guaCi}</p>
            </div>
          </div>

          {/* AI */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="text-base font-semibold text-white/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />AI 智能解析
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
                placeholder="输入问题，AI结合灵棋经卦象为您解析..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400/50"
              />
              <button onClick={handleAsk} disabled={aiLoading || !result}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />{aiLoading ? '解析中...' : '问'}
              </button>
            </div>

            {aiOpen && aiMessages.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {aiMessages.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-emerald-500/10 border border-emerald-400/20 ml-4' : 'bg-white/5 border border-white/10 mr-4'}`}>
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
                        <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
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
