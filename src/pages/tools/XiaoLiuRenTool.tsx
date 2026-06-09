import { useState, useEffect } from 'react';
import { Hand } from 'lucide-react';
import AIParser from '@/components/AIParser';
import DateInput from '@/components/DateInput';
import SaveRecordButton from '@/components/SaveRecordButton';
import { useRestoreRecord } from '@/hooks/useRestoreRecord';
import IntroModal from '@/components/IntroModal';
import { getToolIntro } from '@/data/toolIntros';

const GONGS = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'];
const GONG_DESC: Record<string, { wuxing: string; liushen: string; desc: string; ji: string }> = {
  '大安': { wuxing: '木', liushen: '青龙', desc: '主静、安稳、吉祥。事事顺利，宜静不宜动。', ji: '大吉' },
  '留连': { wuxing: '土', liushen: '玄武', desc: '主拖延、反复、纠缠。事情进展缓慢，需耐心。', ji: '小凶' },
  '速喜': { wuxing: '火', liushen: '朱雀', desc: '主快速、喜庆、好消息。事情很快有结果。', ji: '中吉' },
  '赤口': { wuxing: '金', liushen: '白虎', desc: '主口舌、是非、争吵。注意言语，避免冲突。', ji: '中凶' },
  '小吉': { wuxing: '水', liushen: '六合', desc: '主吉利、顺利、桃花。事情向好的方向发展。', ji: '小吉' },
  '空亡': { wuxing: '土', liushen: '勾陈', desc: '主空虚、失落、无成。事情难成，宜等待。', ji: '大凶' },
};

const JI_COLOR: Record<string, string> = {
  '大吉': 'text-green-400', '中吉': 'text-green-300', '小吉': 'text-blue-300',
  '小凶': 'text-orange-400', '中凶': 'text-red-400', '大凶': 'text-red-500',
};

const SHI_CHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 动态加载 lunar-javascript
let Lunar: any = null;
let Solar: any = null;

function loadLunarJS(): Promise<any> {
  if (Lunar && Solar) return Promise.resolve(Lunar);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript@1.7.2/lunar.min.js';
    script.onload = () => {
      Lunar = (window as any).Lunar;
      Solar = (window as any).Solar;
      resolve(Lunar);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

interface LunarInfo {
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  shichen: number; // 0-11
  shichenName: string;
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
}

function getShiChenFromHour(hour: number): number {
  if (hour >= 23 || hour < 1) return 0;  // 子
  if (hour >= 1 && hour < 3) return 1;   // 丑
  if (hour >= 3 && hour < 5) return 2;   // 寅
  if (hour >= 5 && hour < 7) return 3;   // 卯
  if (hour >= 7 && hour < 9) return 4;   // 辰
  if (hour >= 9 && hour < 11) return 5;  // 巳
  if (hour >= 11 && hour < 13) return 6; // 午
  if (hour >= 13 && hour < 15) return 7; // 未
  if (hour >= 15 && hour < 17) return 8; // 申
  if (hour >= 17 && hour < 19) return 9; // 酉
  if (hour >= 19 && hour < 21) return 10; // 戌
  return 11; // 亥 (21-23)
}

function calcXiaoLiuRen(month: number, day: number, hour: number) {
  const yueGong = (month - 1) % 6;
  const riGong = (yueGong + day - 1) % 6;
  const shiGong = (riGong + hour) % 6;
  return {
    yue: GONGS[yueGong],
    ri: GONGS[riGong],
    shi: GONGS[shiGong],
    yueIdx: yueGong,
    riIdx: riGong,
    shiIdx: shiGong,
  };
}

export default function XiaoLiuRenTool() {
  const [date, setDate] = useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<(ReturnType<typeof calcXiaoLiuRen> & { question: string }) | null>(null);
  const [lunarInfo, setLunarInfo] = useState<LunarInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [lunarReady, setLunarReady] = useState(false);
  const pendingData = useRestoreRecord('xiaoliuren');

  // 从保存记录恢复
  useEffect(() => {
    if (pendingData) {
      setResult(pendingData as ReturnType<typeof calcXiaoLiuRen>);
    }
  }, [pendingData]);

  // 预加载 lunar-javascript
  useEffect(() => {
    loadLunarJS().then(() => setLunarReady(true)).catch(() => setLunarReady(false));
  }, []);

  async function handleCalc() {
    if (!question.trim()) { alert('请先输入您要询问的问题，尽可能把事情描述得详细一些'); return; }
    if (!Lunar) {
      try {
        await loadLunarJS();
        setLunarReady(true);
      } catch {
        alert('农历转换库加载失败，请检查网络');
        return;
      }
    }

    setLoading(true);

    // 兼容多种日期格式：ISO格式(2026-05-28T14:30) 和 手动输入(2026-05-28 14:30)
    const normalizedDate = date.trim().replace(' ', 'T');
    const d = new Date(normalizedDate);

    // 检查日期是否有效
    if (isNaN(d.getTime())) {
      alert('日期格式不正确，请使用：yyyy-mm-dd hh:mm\n例如：1990-05-15 14:30');
      setLoading(false);
      return;
    }

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();

    // 公历转农历：先用Solar创建公历日期，再转Lunar
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const lunarMonth = lunar.getMonth();       // 农历月 1-12
    const lunarDay = lunar.getDay();           // 农历日
    const lunarMonthName = lunar.getMonthInChinese() + '月';
    const lunarDayName = lunar.getDayInChinese();
    const shichen = getShiChenFromHour(hour);
    const shichenName = SHI_CHEN[shichen] + '时';

    const info: LunarInfo = {
      lunarMonth,
      lunarDay,
      lunarMonthName,
      lunarDayName,
      shichen,
      shichenName,
      ganZhiYear: lunar.getYearInGanZhi(),
      ganZhiMonth: lunar.getMonthInGanZhi(),
      ganZhiDay: lunar.getDayInGanZhi(),
    };

    setLunarInfo(info);
    setResult({ ...calcXiaoLiuRen(lunarMonth, lunarDay, shichen), question });
    setLoading(false);
  }

  // 格式化公历显示
  const formatSolarDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">江氏小六壬起课</h1>
          <div className="mt-2 mb-4"><IntroModal {...getToolIntro('xiaoliuren')}/></div>
        <p className="text-white/60">输入公历日期，自动换算农历后掌上掐算出吉凶</p>
      </div>

      {/* 问题输入 */}
      <div className="mb-6 p-4 border border-rose-400/30 rounded-xl bg-rose-950/10">
        <label className="block text-sm text-rose-300/80 mb-2 font-medium">所问之事（必填）</label>
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="尽可能把事情描述得详细一点点..."
          rows={3}
          className="w-full px-4 py-3 bg-black/50 border border-rose-400/30 rounded-lg text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-rose-400" />
      </div>

      {/* Palm Diagram */}
      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        <h3 className="text-blue-600 font-bold mb-6 text-center">六宫掌诀图（左手）</h3>
        <div className="relative max-w-sm mx-auto">
          {/* Top row - fingertips */}
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div className="text-center p-3 rounded-lg border-2 border-blue-500/40 bg-blue-500/10">
              <p className="text-blue-600 font-bold text-sm">留连</p>
              <p className="text-[10px] text-white/75">食指尖</p>
            </div>
            <div className="text-center p-3 rounded-lg border-2 border-blue-500/40 bg-blue-500/10">
              <p className="text-blue-600 font-bold text-sm">速喜</p>
              <p className="text-[10px] text-white/75">中指尖</p>
            </div>
            <div className="text-center p-3 rounded-lg border-2 border-blue-500/40 bg-blue-500/10">
              <p className="text-blue-600 font-bold text-sm">赤口</p>
              <p className="text-[10px] text-white/75">无名指尖</p>
            </div>
          </div>

          {/* Arrows */}
          <div className="flex justify-between px-6 py-1">
            <span className="text-xs text-white/75">&#8593;</span>
            <span className="text-xs text-white/75">&#8593;</span>
            <span className="text-xs text-white/75">&#8593;</span>
          </div>

          {/* Bottom row - finger roots */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 rounded-lg border-2 border-blue-500/40 bg-blue-500/10">
              <p className="text-blue-600 font-bold text-sm">大安</p>
              <p className="text-[10px] text-white/75">食指根</p>
            </div>
            <div className="text-center p-3 rounded-lg border-2 border-blue-500/40 bg-blue-500/10">
              <p className="text-blue-600 font-bold text-sm">空亡</p>
              <p className="text-[10px] text-white/75">中指根</p>
            </div>
            <div className="text-center p-3 rounded-lg border-2 border-blue-500/40 bg-blue-500/10">
              <p className="text-blue-600 font-bold text-sm">小吉</p>
              <p className="text-[10px] text-white/75">无名指根</p>
            </div>
          </div>

          {/* Direction arrows */}
          <div className="flex justify-center mt-3">
            <div className="flex items-center gap-1 text-xs text-white/75">
              <span>起：大安</span>
              <span>&#8594;</span>
              <span>留连</span>
              <span>&#8594;</span>
              <span>速喜</span>
              <span>&#8594;</span>
              <span>赤口</span>
              <span>&#8594;</span>
              <span>小吉</span>
              <span>&#8594;</span>
              <span>空亡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input - 公历日期时间 */}
      <div className="p-6 border border-blue-100 rounded-lg bg-black/20 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <DateInput
              label="选择公历日期时间（自动换算农历）"
              value={date}
              onChange={setDate}
              placeholder="例如: 2026-05-28 14:30"
              hint="格式: yyyy-mm-dd hh:mm"
            />
          </div>
          <button
            onClick={handleCalc}
            disabled={loading || !lunarReady}
            className="px-6 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? '计算中...' : <><Hand className="w-4 h-4 inline mr-1" />起课</>}
          </button>
        </div>
        <p className="text-xs text-white/75 mt-3">
          起课方法：从大安起月，顺数至月落宫；从月落宫起日，顺数至日落宫；从日落宫起时，顺数至时落宫。
        </p>
      </div>

      {/* Result */}
      {result && lunarInfo && (
        <div className="space-y-6">
          {/* 公历转农历显示 */}
          <div className="p-4 border border-blue-100 rounded-lg bg-black/15">
            <h3 className="text-blue-600 font-bold mb-3 text-center">日期换算</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-white/75 text-xs">公历</p>
                <p className="text-white">{formatSolarDate(date)}</p>
              </div>
              <div className="text-white/75 text-xl">&#8594;</div>
              <div className="text-center">
                <p className="text-white/75 text-xs">农历</p>
                <p className="text-blue-600 font-medium">
                  {lunarInfo.ganZhiYear}年 {lunarInfo.lunarMonthName}{lunarInfo.lunarDayName}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  月柱：{lunarInfo.ganZhiMonth} · 日柱：{lunarInfo.ganZhiDay}
                </p>
              </div>
            </div>
          </div>

          {/* 掐指过程 */}
          <div className="p-4 border border-blue-100 rounded-lg bg-black/15">
            <h3 className="text-blue-600 font-bold mb-3 text-center">掐指过程（基于农历）</h3>
            <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-white/70">
              <span className="px-3 py-1.5 bg-black/50 rounded-md border border-blue-100">
                大安起<span className="text-blue-600">月</span>
              </span>
              <span className="text-white/75">&#8594;</span>
              <span className="px-3 py-1.5 bg-black/50 rounded-md border border-blue-100">
                农历{lunarInfo.lunarMonthName}落<span className="text-blue-600">{result.yue}</span>
              </span>
              <span className="text-white/75">&#8594;</span>
              <span className="px-3 py-1.5 bg-black/50 rounded-md border border-blue-100">
                从<span className="text-blue-600">{result.yue}</span>起<span className="text-blue-600">日</span>
              </span>
              <span className="text-white/75">&#8594;</span>
              <span className="px-3 py-1.5 bg-black/50 rounded-md border border-blue-100">
                农历{lunarInfo.lunarDayName}落<span className="text-blue-600">{result.ri}</span>
              </span>
              <span className="text-white/75">&#8594;</span>
              <span className="px-3 py-1.5 bg-black/50 rounded-md border border-blue-100">
                从<span className="text-blue-600">{result.ri}</span>起<span className="text-blue-600">时</span>
              </span>
              <span className="text-white/75">&#8594;</span>
              <span className="px-3 py-1.5 bg-black/50 rounded-md border border-blue-200">
                {lunarInfo.shichenName}落<span className="text-blue-600 font-bold">{result.shi}</span>
              </span>
            </div>
          </div>

          {/* 三宫结果 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: '天宫（月）', gong: result.yue, desc: '代表天时、大环境', detail: `农历${lunarInfo.lunarMonthName} → 大安起第${lunarInfo.lunarMonth}月落此宫` },
              { label: '地宫（日）', gong: result.ri, desc: '代表地利、基础', detail: `农历${lunarInfo.lunarDayName} → 从${result.yue}起第${lunarInfo.lunarDay}日落此宫` },
              { label: '人宫（时）', gong: result.shi, desc: '代表人事、结果', detail: `${lunarInfo.shichenName} → 从${result.ri}起第${lunarInfo.shichen + 1}个时辰落此宫` },
            ].map((item, i) => {
              const info = GONG_DESC[item.gong];
              return (
                <div key={i} className="border border-blue-200 rounded-lg p-6 bg-black/20">
                  <p className="text-white/60 text-sm text-center mb-1">{item.label}</p>
                  <p className="text-white/75 text-xs text-center mb-1">{item.desc}</p>
                  <p className="text-[10px] text-center text-blue-600/50 mb-3 leading-relaxed">{item.detail}</p>
                  <p className="text-3xl font-bold text-center text-blue-600 mb-2">{item.gong}</p>
                  <div className="text-center space-y-1">
                    <p className={`text-sm font-bold ${JI_COLOR[info.ji]}`}>{info.ji}</p>
                    <p className="text-xs text-white/60">五行：{info.wuxing} · 六神：{info.liushen}</p>
                    <p className="text-xs text-white/60 mt-2">{info.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 综合判断 */}
          <div className="p-4 border border-blue-100 rounded-lg bg-black/15 text-center">
            <h3 className="text-blue-600 font-bold mb-2">综合判断</h3>
            <p className="text-white/70 text-sm">
              天宫<span className="text-blue-600">{result.yue}</span> &#8594;
              地宫<span className="text-blue-600">{result.ri}</span> &#8594;
              人宫<span className="text-blue-600">{result.shi}</span>
            </p>
            <p className="text-white/60 text-xs mt-2">
              {GONG_DESC[result.shi].ji.includes('吉')
                ? '人宫吉利，事情基本顺利。'
                : '人宫凶险，事情多阻滞，需谨慎。'}
            </p>
          </div>

          {/* AI Parser */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <SaveRecordButton type="xiaoliuren" typeLabel="江氏小六壬" data={{
              yue: result.yue,
              ri: result.ri,
              shi: result.shi,
              solarDate: formatSolarDate(date),
              lunarDate: `${lunarInfo.ganZhiYear}年${lunarInfo.lunarMonthName}${lunarInfo.lunarDayName} ${lunarInfo.shichenName}`,
              ganZhi: `${lunarInfo.ganZhiMonth}月 ${lunarInfo.ganZhiDay}日`,
            }} />
            <AIParser type="xiaoliuren" data={{
              yue: result.yue,
              ri: result.ri,
              shi: result.shi,
              question: result.question,
              solarDate: formatSolarDate(date),
              lunarDate: `${lunarInfo.ganZhiYear}年${lunarInfo.lunarMonthName}${lunarInfo.lunarDayName} ${lunarInfo.shichenName}`,
              ganZhi: `${lunarInfo.ganZhiMonth}月 ${lunarInfo.ganZhiDay}日`,
            }} />
          </div>

          <p className="text-center text-xs text-white/75">小六壬起课结果仅供学习参考</p>
        </div>
      )}
    </div>
  );
}
