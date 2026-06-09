import { useState } from 'react';
import { PenLine, Sparkles, Send } from 'lucide-react';
import { streamSiliconAPI } from '@/utils/apiClient';
import SaveRecordButton from '@/components/SaveRecordButton';
import HighlightText from '@/components/HighlightText';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';

export default function CeZiTool() {
  const [char, setChar] = useState('');
  const [question, setQuestion] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  function handleSubmit() {
    const c = char.trim();
    const q = question.trim();
    if (!c || c.length !== 1) {
      alert('请输入一个汉字');
      return;
    }
    setAiOpen(true);
    setAiLoading(true);

    const userMsg = { role: 'user', content: `字：${c}${q ? '，问：' + q : ''}`, id: Date.now().toString() };
    const id = (Date.now() + 1).toString();
    const assistantMsg = { role: 'assistant', content: '', id };
    setAiMessages(prev => [...prev, userMsg, assistantMsg]);

    let full = '';
    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅，精通测字（拆字、相字）之术。

测字原则：
- 分析字形结构：上下、左右、内外、独体
- 分析笔画数理：总笔画数、五行归属
- 拆字组合：将字拆为部件，各部件含义组合
- 结合所问之事，给出针对性解读
- 像聊天一样自然说，不要分步骤编号
- 铁口直断，每段之间空一行
- 重要内容用"黄师傅断："引出

` + NO_MARKDOWN_RULE },
      { role: 'user', content: `【测字】
所写字：${c}
${q ? '【所问之事】' + q + '\n' : ''}请黄师傅测此字。` },
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
          <PenLine className="w-7 h-7 text-pink-400 inline mr-2" />
          测字
        </h1>
        <div className="flex justify-center">
          <IntroModal {...getToolIntro('cezi')!} />
        </div>
        <p className="text-sm text-white/60">一字一世界 · 字形藏玄机 · 笔画见吉凶</p>
      </div>

      {/* 输入 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-white/70">写一个字</label>
          <input
            type="text"
            value={char}
            onChange={e => {
              const v = e.target.value;
              if (v.length <= 1) setChar(v);
            }}
            placeholder="心中默想一字，写在此处..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-center text-2xl focus:outline-none focus:border-pink-400/50"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-white/50">想问的事（可选）</label>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="如：问事业、问姻缘..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-400/50"
          />
        </div>
        <button onClick={handleSubmit} disabled={aiLoading || char.trim().length !== 1}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium hover:from-pink-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <Sparkles className="w-4 h-4" />{aiLoading ? '测算中...' : '测字'}
        </button>
      </div>

      {/* AI 对话 */}
      {aiOpen && aiMessages.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold text-white/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />黄师傅测字
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-pink-500/10 border border-pink-400/20 ml-4' : 'bg-white/5 border border-white/10 mr-4'}`}>
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
                    <div className="w-4 h-4 border-2 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
                    黄师傅正在测字...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 保存记录 */}
      {aiOpen && aiMessages.length > 0 && aiMessages[aiMessages.length - 1].content && (
        <div className="flex justify-end">
          <SaveRecordButton
            toolType="cezi"
            toolName="测字"
            inputData={{ char, question }}
            resultData={{ interpretation: aiMessages[aiMessages.length - 1].content }}
          />
        </div>
      )}
    </div>
  );
}
