import { useState } from 'react';
import { Moon, Sparkles, Send } from 'lucide-react';
import { streamSiliconAPI } from '@/utils/apiClient';
import SaveRecordButton from '@/components/SaveRecordButton';
import HighlightText from '@/components/HighlightText';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';

export default function JieMengTool() {
  const [dream, setDream] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  function handleSubmit() {
    const q = dream.trim();
    if (!q || q.length < 5) {
      alert('请详细描述您的梦境（至少5个字）');
      return;
    }
    setAiOpen(true);
    setAiLoading(true);

    const userMsg = { role: 'user', content: q, id: Date.now().toString() };
    const id = (Date.now() + 1).toString();
    const assistantMsg = { role: 'assistant', content: '', id };
    setAiMessages(prev => [...prev, userMsg, assistantMsg]);

    let full = '';
    streamSiliconAPI([
      { role: 'system', content: `你是黄师傅，精通解梦之术。以《周公解梦》为基，结合现代心理学弗洛伊德《梦的解析》理论，从传统象征、心理状态、生活预示三个维度为用户解读梦境。

解梦原则：
- 梦境元素要结合梦者生活背景分析
- 传统解梦注重吉凶预示，心理分析注重潜意识表达
- 不要吓唬梦者，即使是不祥之梦也要给出化解建议
- 像聊天一样自然说，不要分步骤编号
- 重要内容用"黄师傅断："引出

` + NO_MARKDOWN_RULE },
      { role: 'user', content: `【梦境描述】
${q}

请黄师傅为我解梦。` },
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
    }, { maxTokens: 2500 });
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
          <Moon className="w-7 h-7 text-purple-400 inline mr-2" />
          解梦
        </h1>
        <div className="flex justify-center">
          <IntroModal {...getToolIntro('jiemeng')!} />
        </div>
        <p className="text-sm text-white/60">周公解梦 · 梦的解析 · 窥探潜意识</p>
      </div>

      {/* 梦境输入 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <label className="text-sm text-white/70">请详细描述您的梦境</label>
        <textarea
          value={dream}
          onChange={e => setDream(e.target.value)}
          placeholder={`比如：
我梦见自己走在一条很黑的路上，前面有一盏灯。路边有很多树，风吹得树叶沙沙响。突然看到前面有一座桥，桥下有水，水很清。我走过桥，看到一片花海...`}
          rows={6}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400/50 resize-none"
        />
        <button onClick={handleSubmit} disabled={aiLoading || dream.trim().length < 5}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          <Sparkles className="w-4 h-4" />{aiLoading ? '解梦中...' : '解梦'}
        </button>
      </div>

      {/* AI 对话 */}
      {aiOpen && aiMessages.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold text-white/90 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />黄师傅解梦
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-500/10 border border-purple-400/20 ml-4' : 'bg-white/5 border border-white/10 mr-4'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/40">{msg.role === 'user' ? '您的梦境' : '黄师傅解梦'}</span>
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
                    <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    黄师傅正在解梦...
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
            toolType="jiemeng"
            toolName="解梦"
            inputData={{ dream }}
            resultData={{ interpretation: aiMessages[aiMessages.length - 1].content }}
          />
        </div>
      )}
    </div>
  );
}
