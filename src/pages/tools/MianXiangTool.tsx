import { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, X, Copy, Check, Loader2, User, AlertCircle, Scan, UserCircle } from 'lucide-react';
import { MIANXIANG_SYSTEM_PROMPT } from '@/data/mianxiangPrompt';
import SaveRecordButton from '@/components/SaveRecordButton';

const API_KEY_PARTS = ['sk-exbzhkdd', 'usywrlknvkg', 'dzcgjraluip', 'qxhvquzeuw', 'byekdikl'];
const VISION_MODEL = 'Qwen/Qwen3.5-9B';

type AnalysisMode = 'full' | 'quick';

interface PhotoSlot {
  file: File | null;
  preview: string;
  label: string;
  hint: string;
}

// 快速分析系统提示词 - 侧重量快速识人
const QUICK_SYSTEM_PROMPT = `你是黄师傅，一位精通面相识人的命理师。你能在几秒内从一个人的正脸看出其为人性格和处世方式。

【快速识人法——苏民峰精简版】

面型定基调：
- 甲字面：前额阔下巴尖，聪明但耐力不足
- 圆字面：性格随和，好相处，但主见弱
- 同字面：四方脸，秘密性强，做事有毅力
- 申字面：颧骨凸出，青年辛苦中年发
- 由字面：上宽下尖，靠自己打拼
- 风字面：大器晚成，先苦后甜
- 目字面：有艺术气质

一眼断性格：
- 额高阔：聪明有见识
- 眉浓清：重情义有担当
- 眼大有神：热情开朗
- 眼小藏神：深沉有心计
- 鼻高挺直：自尊心强有主见
- 鼻头有肉：心地善良有财运
- 嘴大：豪爽不拘小节
- 嘴小：谨慎细致
- 下巴阔：爱家有责任感
- 耳珠厚：福气好人缘好

【输出格式】
用三段话快速概括这个人：
1. 第一眼印象（面型+气色+神态）
2. 性格特点（从五官特征判断）
3. 为人处世的建议（如何与此人打交道）

铁口直断，半文半白，不模棱两可。严禁使用任何markdown格式符号（#和*）。`;

export default function MianXiangTool() {
  const [mode, setMode] = useState<AnalysisMode>('quick');
  const [photos, setPhotos] = useState<Record<string, PhotoSlot>>({
    front: { file: null, preview: '', label: '正脸照', hint: '请正面面对镜头，露出额头，在光线明亮处拍照' },
    side: { file: null, preview: '', label: '侧脸照', hint: '请侧面45度，露出面部轮廓' },
    top: { file: null, preview: '', label: '头顶照', hint: '请从正上方拍摄头顶' },
  });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string; id: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = (key: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotos(prev => ({ ...prev, [key]: { ...prev[key], file, preview: dataUrl } }));
    };
    reader.readAsDataURL(file);
  };

  // 根据模式决定需要哪些照片
  const requiredKeys = mode === 'full'
    ? ['front', 'side', 'top']
    : ['front'];

  const allUploaded = requiredKeys.every(k => photos[k].file !== null);

  async function doAnalysis() {
    if (!allUploaded) {
      alert(mode === 'full' ? '请先上传三张照片' : '请先上传正脸照');
      return;
    }
    setAiOpen(true);
    setAiError('');
    setProgress(5);
    const id = 'ai_' + Date.now();
    setAiMessages([{ role: 'assistant', content: '', id }]);
    setAiLoading(true);

    // 进度条动画
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
    }, 500);

    try {
      // 构建消息内容
      const content: any[] = [];
      for (const key of requiredKeys as string[]) {
        const imgData = photos[key].preview;
        if (imgData) {
          content.push({ type: 'image_url', image_url: { url: imgData } });
        }
      }

      // 根据模式构建不同的用户提示词
      let userText = '';
      if (mode === 'full') {
        userText = '请根据这三张照片（第一张正脸、第二张侧脸、第三张头顶），按照苏民峰面相学体系进行详细的面相分析。';
      } else {
        userText = '请根据这张正脸照片，用快速识人法分析这个人的性格和为人。三段话概括：第一眼印象、性格特点、打交道建议。';
      }
      content.push({ type: 'text', text: userText });

      const systemPrompt = mode === 'full' ? MIANXIANG_SYSTEM_PROMPT : QUICK_SYSTEM_PROMPT;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content },
      ];

      const resp = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY_PARTS.join('')}`,
        },
        body: JSON.stringify({
          model: VISION_MODEL,
          messages,
          max_tokens: mode === 'full' ? 3000 : 1500,
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`API错误 (${resp.status}): ${errText.slice(0, 200)}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let full = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') break;
          try {
            const json = JSON.parse(dataStr);
            const delta = json.choices?.[0]?.delta?.content || '';
            if (delta) {
              full += delta;
              setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: full } : m));
            }
          } catch { /* */ }
        }
      }

      // 处理剩余buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr !== '[DONE]') {
            try {
              const json = JSON.parse(dataStr);
              const delta = json.choices?.[0]?.delta?.content || '';
              if (delta) {
                full += delta;
                setAiMessages(prev => prev.map(m => m.id === id ? { ...m, content: full } : m));
              }
            } catch { /* */ }
          }
        }
      }
    } catch (e: any) {
      console.error('面相AI解析错误:', e);
      setAiError(e.message || '请求失败');
      setAiMessages(prev => prev.map(m =>
        m.role === 'assistant' && m.content === ''
          ? { ...m, content: `抱歉，解析出错了：${e.message || '请检查网络后重试'}。` } : m
      ));
    }
    clearInterval(progressTimer);
    setProgress(100);
    setTimeout(() => setProgress(0), 1000);
    setAiLoading(false);
  }

  async function copyText(text: string, id: string) {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
    }
    setCopiedId(id); setTimeout(() => setCopiedId(''), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">相法 AI 解析</h1>
        <p className="text-white/60">选择分析模式，上传照片，AI为您解读面相</p>
      </div>

      {/* 模式选择 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => { setMode('quick'); setPhotos(prev => ({ ...prev, side: { ...prev.side, file: null, preview: '' }, top: { ...prev.top, file: null, preview: '' } })); }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            mode === 'quick'
              ? 'border-blue-400/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'quick' ? 'bg-blue-500/20' : 'bg-white/5'}`}>
              <UserCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className={`font-bold ${mode === 'quick' ? 'text-blue-300' : 'text-white/80'}`}>快速分析</h3>
              <p className="text-xs text-white/40">只需一张正脸照</p>
            </div>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">
            快速从一个人的正脸看出对方是什么人、什么性格。适合人际交往中快速识人，三段话概括性格与打交道建议。
          </p>
        </button>

        <button
          onClick={() => setMode('full')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            mode === 'full'
              ? 'border-purple-400/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'full' ? 'bg-purple-500/20' : 'bg-white/5'}`}>
              <Scan className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className={`font-bold ${mode === 'full' ? 'text-purple-300' : 'text-white/80'}`}>全面分析</h3>
              <p className="text-xs text-white/40">需上传三张照片</p>
            </div>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">
            从面相看出来一个人的一生运势。结合正脸、侧脸、头顶三张照片，按苏民峰相法详细分析三停六府、性格、事业财运、感情婚姻、健康。
          </p>
        </button>
      </div>

      {/* Photo Upload */}
      <div className={`grid gap-4 mb-8 ${
        mode === 'full' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 max-w-sm mx-auto'
      }`}>
        {requiredKeys.map((key) => {
          const photo = photos[key];
          return (
            <div key={key} className={`border rounded-xl bg-black/20 overflow-hidden ${
              mode === 'full' ? 'border-purple-400/30' : 'border-blue-400/30'
            }`}>
              <div className={`px-4 py-3 border-b flex items-center gap-2 ${
                mode === 'full' ? 'border-purple-400/20 bg-purple-500/5' : 'border-blue-400/20 bg-blue-500/5'
              }`}>
                <Camera className={`w-4 h-4 ${mode === 'full' ? 'text-purple-400' : 'text-blue-400'}`} />
                <span className={`text-sm font-bold ${mode === 'full' ? 'text-purple-300' : 'text-blue-300'}`}>{photo.label}</span>
              </div>
              <div onClick={() => fileInputRefs.current[key]?.click()} className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                {photo.preview ? (
                  <div className="relative">
                    <img src={photo.preview} alt={photo.label} className="w-full aspect-[3/4] object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <span className="text-white text-sm">点击更换</span>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 transition-colors ${
                    mode === 'full' ? 'border-purple-400/30 hover:border-purple-400/60' : 'border-blue-400/30 hover:border-blue-400/60'
                  }`}>
                    <Upload className={`w-8 h-8 ${mode === 'full' ? 'text-purple-400/50' : 'text-blue-400/50'}`} />
                    <span className="text-xs text-white/50">点击上传照片</span>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 bg-black/30">
                <p className="text-[11px] text-white/50 leading-relaxed">
                  <span className={mode === 'full' ? 'text-purple-400' : 'text-blue-400'}>提示：</span>{photo.hint}
                </p>
              </div>
              <input ref={el => { fileInputRefs.current[key] = el; }} type="file" accept="image/*" className="hidden"
                onChange={e => handleFileChange(key, e.target.files?.[0] || null)} />
            </div>
          );
        })}
      </div>

      {/* Error display */}
      {aiError && (
        <div className="mb-4 p-4 border border-red-500/20 rounded-lg bg-red-900/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm font-medium">解析出错</p>
            <p className="text-white/60 text-xs mt-1">{aiError}</p>
          </div>
        </div>
      )}

      {/* AI Button + Progress */}
      <div className="flex justify-center mb-4">
        <button onClick={doAnalysis} disabled={!allUploaded || aiLoading}
          className={`flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-lg transition-all ${
            allUploaded
              ? mode === 'full'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-400 hover:to-purple-500 shadow-lg shadow-purple-500/20 active:scale-95'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/20 active:scale-95'
              : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'
          }`}>
          <Sparkles className="w-6 h-6" />
          {aiLoading
            ? '黄师傅正在研读面相...'
            : mode === 'full' ? '全面面相分析' : '快速识人分析'
          }
        </button>
      </div>

      {/* Progress Bar */}
      {aiLoading && progress > 0 && (
        <div className="max-w-md mx-auto mb-6">
          <div className={`h-1.5 bg-white/10 rounded-full overflow-hidden border ${
            mode === 'full' ? 'border-purple-400/20' : 'border-blue-400/20'
          }`}>
            <div className={`h-full rounded-full transition-all duration-300 ${
              mode === 'full' ? 'bg-gradient-to-r from-purple-500 to-violet-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
              style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-center text-xs text-white/50 mt-2">
            {progress < 30 ? '正在识别面部特征...' : progress < 60 ? '正在分析五官格局...' : progress < 90 ? '正在结合相法解读...' : '即将完成...'}
          </p>
        </div>
      )}

      {/* Save Button */}
      {aiMessages.length > 0 && !aiLoading && (
        <div className="flex justify-center mb-6">
          <SaveRecordButton
            type="mianxiang"
            typeLabel={mode === 'full' ? '全面面相分析' : '快速识人分析'}
            data={{ messages: aiMessages.map(m => ({ role: m.role, content: m.content })), mode } as unknown as Record<string, unknown>}
          />
        </div>
      )}

      {!allUploaded && (
        <p className="text-center text-xs text-white/40 mb-8">
          {mode === 'full' ? '请上传全部三张照片后点击解析' : '请上传正脸照后点击解析'}
        </p>
      )}

      {/* AI Chat */}
      {aiOpen && (
        <div className={`border rounded-xl bg-black/45 overflow-hidden ${
          mode === 'full' ? 'border-purple-500/20' : 'border-blue-500/20'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            mode === 'full'
              ? 'border-purple-500/10 bg-gradient-to-r from-purple-900/20 to-blue-900/10'
              : 'border-blue-500/10 bg-gradient-to-r from-blue-900/20 to-cyan-900/10'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${mode === 'full' ? 'text-purple-400' : 'text-blue-400'}`}>
              <Sparkles className="w-4 h-4" />
              黄师傅{mode === 'full' ? '全面面相' : '快速识人'}解读
            </h3>
            <button onClick={() => setAiOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-blue-400">照</span>
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg text-sm leading-relaxed whitespace-pre-line text-left ${
                    msg.role === 'user'
                      ? 'bg-blue-500/10 border border-blue-400/30 text-white'
                      : 'bg-black/40 border border-white/10 text-white/70'
                  }`}>
                    {msg.content || (aiLoading ? <span className="flex items-center gap-2 text-white/50"><Loader2 className="w-3.5 h-3.5 animate-spin" />黄师傅正在分析面相...</span> : '')}
                  </div>
                  {msg.role === 'assistant' && msg.content && (
                    <button onClick={() => copyText(msg.content, msg.id)} className="mt-1 flex items-center gap-1 px-2 py-0.5 text-[10px] text-white/40 hover:text-blue-400 transition-colors">
                      {copiedId === msg.id ? <><Check className="w-3 h-3" />已复制</> : <><Copy className="w-3 h-3" />复制</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
