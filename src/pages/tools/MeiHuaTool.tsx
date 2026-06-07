import { useState, useEffect } from 'react';
import { Calculator, Hash } from 'lucide-react';
import AIParser from '@/components/AIParser';
import DateInput from '@/components/DateInput';
import SaveRecordButton from '@/components/SaveRecordButton';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';

const GUA_NAME: Record<string, string> = {
  '111': '乾', '000': '坤', '100': '艮', '011': '兑',
  '010': '坎', '101': '离', '110': '巽', '001': '震',
};

const GUA_TEXT: Record<string, string> = {
  '111': '乾为天', '000': '坤为地', '100': '艮为山', '011': '兑为泽',
  '010': '坎为水', '101': '离为火', '110': '巽为风', '001': '震为雷',
};

function getGuaFromNum(upper: number, lower: number): { upper: string; lower: string; name: string } {
  const guaMap: Record<number, string> = { 0: '111', 1: '000', 2: '100', 3: '011', 4: '010', 5: '101', 6: '110', 7: '001' };
  const u = guaMap[upper % 8] || '111';
  const l = guaMap[lower % 8] || '111';
  const upperName = GUA_NAME[u] || '?';
  const lowerName = GUA_NAME[l] || '?';
  return {
    upper: u,
    lower: l,
    name: `${upperName}${lowerName}`,
  };
}

function getGuaText(bin: string): string {
  return GUA_TEXT[bin] || '未知';
}

function getHuGua(upper: string, lower: string): string {
  // 互卦：234爻为上卦，345爻为下卦
  const full = lower + upper; // 从下往上
  // 取234和345
  const huUpper = full[1] + full[2] + full[3];
  const huLower = full[2] + full[3] + full[4];
  return `${GUA_NAME[huUpper] || '?'}${GUA_NAME[huLower] || '?'}`;
}

function getBianGua(upper: string, lower: string, dongYao: number): string {
  const full = lower + upper;
  const idx = dongYao - 1; // 0-based from bottom
  const arr = full.split('');
  arr[idx] = arr[idx] === '1' ? '0' : '1';
  const newFull = arr.join('');
  const newUpper = newFull.slice(3, 6);
  const newLower = newFull.slice(0, 3);
  return `${GUA_NAME[newUpper] || '?'}${GUA_NAME[newLower] || '?'}`;
}

interface GuaResult {
  question: string;
  benGua: string;
  benGuaText: string;
  huGua: string;
  bianGua: string;
  dongYao: number;
  upperBin: string;
  lowerBin: string;
  method: string;
}

export default function MeiHuaTool() {
  const [method, setMethod] = useState<'time' | 'number'>('time');
  const [question, setQuestion] = useState('');
  const [date, setDate] = useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState<GuaResult | null>(null);
  const pendingData = useRestoreRecord('meihua');

  useEffect(() => {
    if (pendingData) setResult(pendingData as unknown as GuaResult);
  }, [pendingData]);

  function calcByTime() {
    if (!question.trim()) { alert('请先输入您要询问的问题，尽可能把事情描述得详细一些'); return; }
    const d = new Date(date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = d.getHours();
    const upper = (y + m + day) % 8 || 8;
    const lower = (y + m + day + h) % 8 || 8;
    const dongYao = (y + m + day + h) % 6 || 6;
    const gua = getGuaFromNum(upper, lower);
    setResult({
      benGua: gua.name,
      benGuaText: `${getGuaText(gua.upper)}下${getGuaText(gua.lower)}`,
      huGua: getHuGua(gua.upper, gua.lower),
      bianGua: getBianGua(gua.upper, gua.lower, dongYao),
      dongYao,
      upperBin: gua.upper,
      lowerBin: gua.lower,
      question,
      method: `时间起卦：年${y}+月${m}+日${day}=${y + m + day}，上卦${upper % 8 || 8}；加时${h}得下卦${lower % 8 || 8}；动爻${dongYao}`,
    });
  }

  function calcByNumber() {
    if (!question.trim()) { alert('请先输入您要询问的问题，尽可能把事情描述得详细一些'); return; }
    const n1 = parseInt(num1) || 1;
    const n2 = parseInt(num2) || 1;
    const upper = n1 % 8 || 8;
    const lower = n2 % 8 || 8;
    const dongYao = (n1 + n2) % 6 || 6;
    const gua = getGuaFromNum(upper, lower);
    setResult({
      benGua: gua.name,
      benGuaText: `${getGuaText(gua.upper)}下${getGuaText(gua.lower)}`,
      huGua: getHuGua(gua.upper, gua.lower),
      bianGua: getBianGua(gua.upper, gua.lower, dongYao),
      dongYao,
      upperBin: gua.upper,
      lowerBin: gua.lower,
      question,
      method: `数字起卦：上数${n1}得卦${upper % 8 || 8}，下数${n2}得卦${lower % 8 || 8}，动爻${dongYao}`,
    });
  }

  function YaoLine({ bin, index, isDong }: { bin: string; index: number; isDong: boolean }) {
    const isYang = bin[index] === '1';
    return (
      <div className={`flex items-center justify-center gap-2 py-2 ${isDong ? 'bg-blue-500/10' : ''}`}>
        {isYang ? (
          <div className="w-20 h-2 bg-blue-500 rounded" />
        ) : (
          <>
            <div className="w-8 h-2 bg-slate-300 rounded" />
            <div className="w-2" />
            <div className="w-8 h-2 bg-slate-300 rounded" />
          </>
        )}
        {isDong && <span className="text-blue-600 text-xs">动</span>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">梅花易数起卦</h1>
        <p className="text-white/60">时间起卦或数字起卦，排出本卦、互卦、变卦</p>
      </div>

      {/* 问题输入 */}
      <div className="mb-6">
        <label className="block text-sm text-white/60 mb-2">所问之事（必填）</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="尽可能把事情描述得详细一点点..."
          rows={3}
          className="w-full px-4 py-3 bg-black/50 border border-blue-200 rounded-md text-white placeholder:text-white/30 resize-none" />
      </div>

      {/* Method Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMethod('time')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${method === 'time' ? 'bg-blue-500 text-white' : 'border border-blue-200 text-white/60'}`}
        >
          时间起卦
        </button>
        <button
          onClick={() => setMethod('number')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${method === 'number' ? 'bg-blue-500 text-white' : 'border border-blue-200 text-white/60'}`}
        >
          数字起卦
        </button>
      </div>

      {/* Input */}
      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        {method === 'time' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <DateInput
              label="起卦时间"
              value={date}
              onChange={setDate}
              placeholder="例如: 2026-05-28 14:30"
              hint="格式: yyyy-mm-dd hh:mm"
            />
            <button onClick={calcByTime} className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600">
              <Calculator className="w-4 h-4 inline mr-1" />起卦
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-white/60 mb-2">上卦数字</label>
              <input type="number" value={num1} onChange={e => setNum1(e.target.value)} placeholder="输入任意数字" className="w-full px-4 py-2 bg-black/50 border border-blue-200 rounded-md text-white" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">下卦数字</label>
              <input type="number" value={num2} onChange={e => setNum2(e.target.value)} placeholder="输入任意数字" className="w-full px-4 py-2 bg-black/50 border border-blue-200 rounded-md text-white" />
            </div>
            <button onClick={calcByNumber} className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600">
              <Hash className="w-4 h-4 inline mr-1" />起卦
            </button>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          <p className="text-sm text-white/60 text-center">{result.method}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 本卦 */}
            <div className="border border-blue-200 rounded-lg p-6 bg-black/20">
              <h3 className="text-center text-blue-600 font-bold mb-4 text-lg">本卦</h3>
              <p className="text-center text-white/60 text-sm mb-4">{result.benGuaText}</p>
              <div className="flex flex-col-reverse items-center">
                {[0, 1, 2].map(i => (
                  <YaoLine key={i} bin={result.upperBin + result.lowerBin} index={i} isDong={i + 1 === result.dongYao} />
                ))}
                {[3, 4, 5].map(i => (
                  <YaoLine key={i} bin={result.upperBin + result.lowerBin} index={i} isDong={i + 1 === result.dongYao} />
                ))}
              </div>
              <p className="text-center text-2xl font-bold text-white mt-4">{result.benGua}</p>
            </div>

            {/* 互卦 */}
            <div className="border border-blue-100 rounded-lg p-6 bg-black/15">
              <h3 className="text-center text-white/60 font-bold mb-4">互卦</h3>
              <p className="text-center text-2xl font-bold text-white mt-8">{result.huGua}</p>
              <p className="text-center text-sm text-white/60 mt-2">234爻为上卦<br/>345爻为下卦</p>
            </div>

            {/* 变卦 */}
            <div className="border border-blue-100 rounded-lg p-6 bg-black/15">
              <h3 className="text-center text-blue-600 font-bold mb-4">变卦</h3>
              <p className="text-center text-2xl font-bold text-white mt-8">{result.bianGua}</p>
              <p className="text-center text-sm text-white/60 mt-2">第{result.dongYao}爻动</p>
            </div>
          </div>

          {/* AI Parser */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <SaveRecordButton type="meihua" typeLabel="梅花易数" data={result as unknown as Record<string, unknown>} />
            <AIParser type="meihua" data={result as unknown as Record<string, unknown>} />
          </div>

          <p className="text-center text-xs text-white/75">
            梅花易数排盘结果仅供学习参考
          </p>
        </div>
      )}
    </div>
  );
}
