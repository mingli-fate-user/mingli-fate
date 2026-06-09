import { useState, useEffect } from 'react';
import { Calculator, Dices } from 'lucide-react';
import AIParser from '@/components/AIParser';
import DateInput from '@/components/DateInput';
import SaveRecordButton from '@/components/SaveRecordButton';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';

const GUA_NAME: Record<string, string> = {
  '111': '乾', '000': '坤', '100': '艮', '011': '兑',
  '010': '坎', '101': '离', '110': '巽', '001': '震',
};



function getGuaFromNum(n: number): string {
  const map: Record<number, string> = { 0: '111', 1: '000', 2: '100', 3: '011', 4: '010', 5: '101', 6: '110', 7: '001' };
  return map[n % 8] || '111';
}

function getYaoType(a: number, b: number, c: number): { type: string; yang: boolean; dong: boolean } {
  const heads = [a, b, c].filter(x => x === 1).length;
  if (heads === 3) return { type: '老阳', yang: true, dong: true };
  if (heads === 2) return { type: '少阴', yang: true, dong: false };
  if (heads === 1) return { type: '少阳', yang: false, dong: false };
  return { type: '老阴', yang: false, dong: true };
}

interface YaoInfo {
  yang: boolean;
  dong: boolean;
  type: string;
}

interface GuaResult {
  question: string;
  yao: YaoInfo[];
  upperGua: string;
  lowerGua: string;
  bianYao: number[];
  method: string;
}

export default function LiuYaoTool() {
  const [method, setMethod] = useState<'coin' | 'time'>('coin');
  const [question, setQuestion] = useState('');
  const [coinResults, setCoinResults] = useState<number[][]>([
    [1, 2, 1], [2, 1, 1], [1, 1, 2], [2, 2, 1], [1, 2, 2], [2, 1, 2],
  ]);
  const [date, setDate] = useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const [result, setResult] = useState<GuaResult | null>(null);
  const pendingData = useRestoreRecord('liuyao');

  useEffect(() => {
    if (pendingData) setResult(pendingData as unknown as GuaResult);
  }, [pendingData]);

  function updateCoin(i: number, j: number, val: number) {
    const updated = coinResults.map((row, ri) =>
      ri === i ? row.map((c, ci) => (ci === j ? val : c)) : row
    );
    setCoinResults(updated);
  }

  function calcByCoin() {
    if (!question.trim()) { alert('请先输入您要询问的问题，尽可能把事情描述得详细一些'); return; }
    const yaoInfo: YaoInfo[] = [];
    for (const row of coinResults) {
      yaoInfo.push(getYaoType(row[0], row[1], row[2]));
    }
    const lower = yaoInfo.slice(0, 3);
    const upper = yaoInfo.slice(3, 6);
    const lowerBin = lower.map(y => y.yang ? '1' : '0').join('');
    const upperBin = upper.map(y => y.yang ? '1' : '0').join('');
    const bianYao: number[] = [];
    yaoInfo.forEach((y, i) => { if (y.dong) bianYao.push(i + 1); });

    setResult({
      yao: yaoInfo,
      upperGua: GUA_NAME[upperBin] || '?',
      lowerGua: GUA_NAME[lowerBin] || '?',
      bianYao,
      question,
      method: '铜钱摇卦',
    });
  }

  function calcByTime() {
    if (!question.trim()) { alert('请先输入您要询问的问题，尽可能把事情描述得详细一些'); return; }
    const d = new Date(date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const h = d.getHours();
    const upper = (y + m + day) % 8 || 8;
    const lower = (y + m + day + h) % 8 || 8;
    const dong = (y + m + day + h) % 6 || 6;

    const upperBin = getGuaFromNum(upper - 1);
    const lowerBin = getGuaFromNum(lower - 1);
    const yaoInfo: YaoInfo[] = [];
    for (let i = 0; i < 6; i++) {
      const isDong = i + 1 === dong;
      yaoInfo.push({
        yang: i < 3 ? lowerBin[i] === '1' : upperBin[i - 3] === '1',
        dong: isDong,
        type: isDong ? '动爻' : '静爻',
      });
    }

    setResult({
      yao: yaoInfo,
      upperGua: GUA_NAME[upperBin] || '?',
      lowerGua: GUA_NAME[lowerBin] || '?',
      bianYao: [dong],
      question,
      method: `时间起卦 上卦${upper}下卦${lower}动爻${dong}`,
    });
  }

  function randomizeCoins() {
    const newCoins: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const row: number[] = [];
      for (let j = 0; j < 3; j++) {
        row.push(Math.random() > 0.5 ? 2 : 1);
      }
      newCoins.push(row);
    }
    setCoinResults(newCoins);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">六爻起卦</h1>
          <div className="mt-2 mb-4"><IntroModal {...getToolIntro('liuyao')}/></div>
        <p className="text-white/60">铜钱摇卦或时间起卦，排出六爻卦象</p>
      </div>

      {/* 问题输入 */}
      <div className="mb-6 p-4 border border-amber-400/30 rounded-xl bg-amber-950/10">
        <label className="block text-sm text-amber-300/80 mb-2 font-medium">所问之事（必填）</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="尽可能把事情描述得详细一点点..."
          rows={3}
          className="w-full px-4 py-3 bg-black/50 border border-amber-400/30 rounded-lg text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-amber-400" />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setMethod('coin')} className={`px-4 py-2 rounded-md text-sm font-medium ${method === 'coin' ? 'bg-blue-500 text-white' : 'border border-blue-200 text-white/60'}`}>铜钱摇卦</button>
        <button onClick={() => setMethod('time')} className={`px-4 py-2 rounded-md text-sm font-medium ${method === 'time' ? 'bg-blue-500 text-white' : 'border border-blue-200 text-white/60'}`}>时间起卦</button>
      </div>

      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        {method === 'coin' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-white/60">记录每次摇卦结果（1=正面，2=背面），从下到上</p>
              <button onClick={randomizeCoins} className="px-3 py-1 text-sm border border-blue-200 text-blue-600 rounded hover:bg-blue-500/10">
                <Dices className="w-3 h-3 inline mr-1" />随机
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {coinResults.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-white/60 text-sm w-8">{i + 1}爻</span>
                  {row.map((c, j) => (
                    <button
                      key={j}
                      onClick={() => updateCoin(i, j, c === 1 ? 2 : 1)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                        c === 1 ? 'border-blue-500 text-blue-600' : 'border-slate-300 text-white'
                      }`}
                    >
                      {c === 1 ? '正' : '背'}
                    </button>
                  ))}
                  <span className="text-xs text-white/75 ml-2">{getYaoType(row[0], row[1], row[2]).type}</span>
                </div>
              ))}
            </div>
            <button onClick={calcByCoin} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-medium">
              <Calculator className="w-4 h-4 inline mr-1" />起卦
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <DateInput
              label="起卦时间"
              value={date}
              onChange={setDate}
              placeholder="例如: 2026-05-28 14:30"
              hint="格式: yyyy-mm-dd hh:mm"
            />
            <button onClick={calcByTime} className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium">
              <Calculator className="w-4 h-4 inline mr-1" />起卦
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="text-center">
          <p className="text-sm text-white/60 mb-4">{result.method}</p>

          <div className="border border-blue-200 rounded-lg p-8 bg-black/20 inline-block">
            <h3 className="text-blue-600 font-bold mb-4 text-xl">{result.upperGua}上{result.lowerGua}下</h3>

            <div className="flex flex-col-reverse items-center gap-1">
              {result.yao.map((y, i) => (
                <div key={i} className={`flex items-center gap-3 py-1 ${y.dong ? 'bg-blue-500/10' : ''}`}>
                  {y.yang ? (
                    <div className="w-32 h-3 bg-blue-500 rounded" />
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-3 bg-slate-300 rounded" />
                      <div className="w-12 h-3 bg-slate-300 rounded" />
                    </div>
                  )}
                  <span className="text-white/75 text-xs w-8">{i + 1}爻</span>
                  {y.dong && <span className="text-blue-600 text-xs font-bold">动</span>}
                </div>
              ))}
            </div>

            {result.bianYao.length > 0 && (
              <p className="mt-6 text-blue-600">
                动爻：第{result.bianYao.join('、')}爻
              </p>
            )}
          </div>

          {/* AI Parser */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <SaveRecordButton type="liuyao" typeLabel="六爻解卦" data={result as unknown as Record<string, unknown>} />
            <AIParser type="liuyao" data={result as unknown as Record<string, unknown>} />
          </div>

          <p className="text-xs text-white/75 mt-6">六爻起卦结果仅供学习参考</p>
        </div>
      )}
    </div>
  );
}
