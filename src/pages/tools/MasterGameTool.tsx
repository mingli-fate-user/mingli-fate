import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, RotateCcw, ArrowLeft, Send, Loader2, Award, BookOpen,
  Star, Target, User, Users, Heart, Briefcase, Home, Crown,
  ChevronRight, CheckCircle2, Lightbulb, ScrollText,
  FlaskConical, Orbit, Hexagon, Flower, Info
} from 'lucide-react';
import { callSiliconAPIWithRetry } from '@/utils/apiClient';
import { NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import HighlightText from '@/components/HighlightText';
import {
  type GameMode, type BaziInfo, type GuaInfo, type AIAnswer, type ScoreResult, type LiuYaoAnswer,
  generateRandomBazi, generateRandomGua,
  makeBaziAnswerPrompt, makeScorePrompt,
  makeLiuYaoAnswerPrompt, makeLiuYaoScorePrompt,
  makeMeiHuaAnswerPrompt, makeMeiHuaScorePrompt,
  parseScoreJSON, parseAIAnswerJSON, parseLiuYaoAnswerJSON, parseGuaScoreJSON,
} from '@/data/masterGame';
import SaveRecordButton from '@/components/SaveRecordButton';
import {
  getGuaLines, getGuaComponents, getBianGua, getHuGua,
  GUA_WUXING, getLiuShen, NA_JIA, DI_ZHI_WX, getGuaUnicode,
} from '@/data/guaGraphics';

// ===== 紫微斗数排盘常量（和ZiWeiTool完全一致）=====
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const XING_COLOR: Record<string, string> = {
  '紫微': 'text-purple-400 font-bold', '天府': 'text-yellow-400 font-bold',
  '太阳': 'text-orange-400', '太阴': 'text-blue-300',
  '天机': 'text-green-400', '武曲': 'text-gray-300',
  '天同': 'text-pink-400', '廉贞': 'text-red-400',
  '贪狼': 'text-pink-500', '巨门': 'text-yellow-600',
  '天相': 'text-teal-400', '天梁': 'text-indigo-400',
  '七杀': 'text-red-500 font-bold', '破军': 'text-red-600 font-bold',
  '文昌': 'text-green-300', '文曲': 'text-blue-300',
  '左辅': 'text-green-400', '右弼': 'text-purple-300',
  '天魁': 'text-yellow-300', '天钺': 'text-yellow-400',
  '禄存': 'text-yellow-500 font-bold',
  '擎羊': 'text-red-400', '陀罗': 'text-white/75',
  '火星': 'text-red-500', '铃星': 'text-orange-500',
  '地空': 'text-white/60', '地劫': 'text-white/60',
  '天马': 'text-blue-400',
};

// 紫微斗数十二宫标准排列（从寅开始逆时针）
const PALACE_LAYOUT: { diZhiIdx: number; name: string }[] = [
  { diZhiIdx: 5, name: '巳' }, { diZhiIdx: 6, name: '午' }, { diZhiIdx: 7, name: '未' }, { diZhiIdx: 8, name: '申' },
  { diZhiIdx: 4, name: '辰' }, { diZhiIdx: 9, name: '酉' },
  { diZhiIdx: 3, name: '卯' }, { diZhiIdx: 10, name: '戌' },
  { diZhiIdx: 2, name: '寅' }, { diZhiIdx: 1, name: '丑' }, { diZhiIdx: 0, name: '子' }, { diZhiIdx: 11, name: '亥' },
];

declare global { interface Window { Lunar: any; } }

const MODES: { key: GameMode; label: string; sub: string; icon: any; color: string; desc: string }[] = [
  { key: 'bazi', label: '八字命理', sub: '四柱推命', icon: Orbit, color: '#fbbf24', desc: 'AI随机生成八字，你根据排盘分析一生格局' },
  { key: 'ziwei', label: '紫微斗数', sub: '星曜推命', icon: Star, color: '#a78bfa', desc: 'AI随机生成命盘，你根据星曜分布分析命运' },
  { key: 'liuyao', label: '六爻断卦', sub: '纳甲筮法', icon: Hexagon, color: '#60a5fa', desc: 'AI生成虚拟占卦，你根据卦象断吉凶' },
  { key: 'meihua', label: '梅花易数', sub: '心易神断', icon: Flower, color: '#4ade80', desc: 'AI生成虚拟占卦，你用梅花心法断结果' },
];

const DIM_CONFIG = [
  { key: 'overallPattern', label: '一生格局走向', score: 40, icon: Crown, placeholder: '请分析此命的整体格局高低、五行平衡、一生大运走势...' },
  { key: 'wealth', label: '财运', score: 10, icon: Target, placeholder: '请分析此命的财运好坏、财源类型、发财时机...' },
  { key: 'marriage', label: '婚姻', score: 10, icon: Heart, placeholder: '请分析此命的婚姻状况、配偶特征、婚姻时机...' },
  { key: 'friendship', label: '交友', score: 10, icon: Users, placeholder: '请分析此命的交友运势、贵人运、需防的小人...' },
  { key: 'career', label: '事业', score: 10, icon: Briefcase, placeholder: '请分析此命的事业方向、职业适合度、事业高低...' },
  { key: 'family', label: '家庭', score: 10, icon: Home, placeholder: '请分析此命的家庭氛围、子女缘、家宅运势...' },
  { key: 'parents', label: '父母', score: 10, icon: User, placeholder: '请分析此命与父母的关系、父母健康、父母助力...' },
];

// ===== 卦画渲染组件 =====
function YaoLine({ isYang, isMoving, isHighlighted }: { isYang: boolean; isMoving: boolean; isHighlighted: boolean }) {
  return (
    <div className="flex items-center justify-center py-[3px]">
      <div className="relative h-[3px] rounded-full transition-all" style={{
        width: isYang ? '48px' : '48px',
        background: isMoving ? '#fbbf24' : isHighlighted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
        boxShadow: isMoving ? '0 0 8px rgba(251,191,36,0.4)' : 'none',
      }}>
        {!isYang && (
          <>
            <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '20px', background: isMoving ? '#fbbf24' : isHighlighted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', boxShadow: isMoving ? '0 0 8px rgba(251,191,36,0.4)' : 'none' }} />
            <div className="absolute right-0 top-0 h-full rounded-full" style={{ width: '20px', background: isMoving ? '#fbbf24' : isHighlighted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', boxShadow: isMoving ? '0 0 8px rgba(251,191,36,0.4)' : 'none' }} />
          </>
        )}
      </div>
    </div>
  );
}

function GuaGraphic({ guaName, movingYao, size = 'normal' }: { guaName: string; movingYao?: number[]; size?: 'small' | 'normal' | 'large' }) {
  const lines = getGuaLines(guaName);
  const comp = getGuaComponents(guaName);
  const w = size === 'small' ? 'w-8' : size === 'large' ? 'w-14' : 'w-11';
  const unicode = getGuaUnicode(guaName);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`${w} text-center font-bold tabular-nums`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: size === 'small' ? '10px' : size === 'large' ? '16px' : '13px' }}>
        {unicode}
      </span>
      <span className={`${w} text-center text-[9px]`} style={{ color: 'rgba(255,255,255,0.3)' }}>{guaName}</span>
      <div className="flex flex-col-reverse">
        {lines.map((line, i) => (
          <YaoLine key={i} isYang={line === 1} isMoving={movingYao?.includes(i + 1) || false} isHighlighted={false} />
        ))}
      </div>
      <span className={`${w} text-center text-[8px] mt-0.5`} style={{ color: 'rgba(255,255,255,0.2)' }}>
        上{comp.upper}下{comp.lower}
      </span>
    </div>
  );
}

// 六爻完整排盘
function LiuYaoPan({ guaInfo }: { guaInfo: GuaInfo }) {
  const lines = getGuaLines(guaInfo.benGua);
  const comp = getGuaComponents(guaInfo.benGua);
  const benWX = GUA_WUXING[comp.upper] || '';
  const liuShens = getLiuShen('甲'); // 简化，用甲日
  const naJia = NA_JIA[comp.lower] || NA_JIA['乾'];
  const yaoNum = guaInfo.yaoCi[0]?.match(/\d+/)?.[0] ? parseInt(guaInfo.yaoCi[0].match(/\d+/)![0]) : 1;

  return (
    <div className="space-y-4">
      {/* 占卦信息 */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">占卦人：</span>
          <span className="text-white/50">{guaInfo.questioner}</span>
        </div>
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">所占之事：</span>
          <span className="text-white/50">{guaInfo.question}</span>
        </div>
      </div>

      {/* 卦画 + 六亲六神 */}
      <div className="flex gap-4 justify-center">
        {/* 本卦 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold mb-2" style={{ color: '#60a5fa' }}>本卦 · {guaInfo.benGua}</span>
          <div className="flex flex-col-reverse">
            {lines.map((line, i) => {
              const isMoving = (i + 1) === yaoNum;
              const diZhi = naJia[i] || '';
              const dzWX = DI_ZHI_WX[diZhi] || '';
              return (
                <div key={i} className="flex items-center gap-2 py-[2px]">
                  <span className="text-[9px] w-8 text-right" style={{ color: isMoving ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}>
                    {diZhi}{dzWX}
                  </span>
                  <YaoLine isYang={line === 1} isMoving={isMoving} isHighlighted={false} />
                  <span className="text-[9px] w-10" style={{ color: isMoving ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}>
                    {liuShens[5 - i]}
                  </span>
                  <span className="text-[9px] w-6" style={{ color: isMoving ? '#fbbf24' : 'rgba(255,255,255,0.2)' }}>
                    {isMoving ? '◆动' : `${i + 1}爻`}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{guaInfo.shiYing}</span>
        </div>

        {/* 变卦 */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>变卦 · {guaInfo.bianGua}</span>
          <GuaGraphic guaName={guaInfo.bianGua} size="normal" />
        </div>
      </div>

      {/* 卦象信息 */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="rounded-lg p-2 border text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/20 block">五行</span>
          <span className="text-white/50">{benWX}</span>
        </div>
        <div className="rounded-lg p-2 border text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/20 block">动爻</span>
          <span className="text-amber-400/70">第{yaoNum}爻</span>
        </div>
        <div className="rounded-lg p-2 border text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/20 block">世应</span>
          <span className="text-white/50">{guaInfo.shiYing}</span>
        </div>
      </div>
    </div>
  );
}

// 梅花三卦
function MeiHuaPan({ guaInfo }: { guaInfo: GuaInfo }) {
  const yaoNum = guaInfo.yaoCi[0]?.match(/\d+/)?.[0] ? parseInt(guaInfo.yaoCi[0].match(/\d+/)![0]) : 1;
  const huGua = getHuGua(guaInfo.benGua);

  return (
    <div className="space-y-4">
      {/* 占卦信息 */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">占卦人：</span>
          <span className="text-white/50">{guaInfo.questioner}</span>
        </div>
        <div className="rounded-lg p-2 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-white/30">所占之事：</span>
          <span className="text-white/50">{guaInfo.question}</span>
        </div>
      </div>

      {/* 三卦并排 */}
      <div className="flex gap-6 justify-center items-start">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color: '#4ade80' }}>本卦</span>
          <GuaGraphic guaName={guaInfo.benGua} movingYao={[yaoNum]} size="large" />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>上{getGuaComponents(guaInfo.benGua).upper}下{getGuaComponents(guaInfo.benGua).lower}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>互卦</span>
          <GuaGraphic guaName={huGua} size="large" />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>取234/345爻</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold" style={{ color: '#60a5fa' }}>变卦</span>
          <GuaGraphic guaName={guaInfo.bianGua} size="large" />
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>第{yaoNum}爻动</span>
        </div>
      </div>

      {/* 体用分析 */}
      <div className="rounded-lg p-3 border text-[11px]" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)' }}>
        <span className="text-white/30">体用分析：</span>
        <span className="text-white/50">上卦{getGuaComponents(guaInfo.benGua).upper}（{GUA_WUXING[getGuaComponents(guaInfo.benGua).upper]}）为体，下卦{getGuaComponents(guaInfo.benGua).lower}（{GUA_WUXING[getGuaComponents(guaInfo.benGua).lower]}）为用</span>
      </div>
    </div>
  );
}

// 八字四柱
function BaZiPan({ info, result }: { info: BaziInfo; result: any }) {
  if (!result) return null;
  const gz = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const colors: Record<string, string> = { '金': '#fbbf24', '木': '#4ade80', '火': '#ef4444', '水': '#60a5fa', '土': '#f97316' };
  const wxMap: Record<string, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  return (
    <div className="space-y-3">
      <div className="text-center text-[11px] text-white/40 mb-2">
        公历 {info.year}年{info.month}月{info.day}日 {info.hour}时 · {info.gender === 'male' ? '男' : '女'}命
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '年柱', gan: result.year.gan, zhi: result.year.zhi },
          { label: '月柱', gan: result.month.gan, zhi: result.month.zhi },
          { label: '日柱', gan: result.day.gan, zhi: result.day.zhi },
          { label: '时柱', gan: result.hour.gan, zhi: result.hour.zhi },
        ].map((p) => {
          const gwx = wxMap[p.gan] || '';
          const c = colors[gwx] || 'rgba(255,255,255,0.3)';
          return (
            <div key={p.label} className="rounded-lg border p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-[9px] block mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.label}</span>
              <span className="text-lg font-bold block" style={{ color: c }}>{p.gan}</span>
              <span className="text-sm block" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.zhi}</span>
              <span className="text-[8px]" style={{ color: c, opacity: 0.5 }}>{gwx}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
        日主：<span className="font-bold" style={{ color: colors[wxMap[result.dayGan] || ''] || 'rgba(255,255,255,0.5)' }}>{result.dayGan}</span>（{wxMap[result.dayGan] || ''}）
      </div>
    </div>
  );
}

// 紫微12宫 — 4x4标准布局（和ZiWeiTool完全一致）
function ZiWeiPan({ info, palaces, panMeta }: { info: BaziInfo; palaces: any[]; panMeta: any }) {
  if (!palaces.length) {
    return (
      <div className="text-center text-[11px] text-white/30 py-8">
        <Info className="w-5 h-5 mx-auto mb-2 opacity-30" />
        紫微斗数排盘中...<br/>
        生辰：{info.year}年{info.month}月{info.day}日 {info.hour}时 · {info.gender === 'male' ? '男' : '女'}
      </div>
    );
  }

  // 按PALACE_LAYOUT顺序排列十二宫
  const orderedPalaces = PALACE_LAYOUT.map(layout => {
    const found = palaces.find((p: any) => p.diZhiName === layout.name || p.position === DI_ZHI[layout.diZHiIdx]);
    return found || { name: '', diZhiName: layout.name, position: DI_ZHI[layout.diZhiIdx], majorStars: [], minorStars: [], heavenlyStem: '' };
  });

  const soul = panMeta.soul || '';
  const body = panMeta.body || '';

  // 渲染单个宫位卡片（和ZiWeiTool同款）
  function renderPalaceCard(palace: any, layoutIdx: number) {
    const isMing = palace.name === soul;
    const isShen = palace.name === body;
    const majorStars = palace.majorStars || [];
    const minorStars = palace.minorStars || [];
    return (
      <div key={layoutIdx} className={`relative border rounded-lg p-1.5 sm:p-2 overflow-hidden ${
        isMing ? 'border-purple-500/60 bg-gradient-to-br from-purple-500/10 to-purple-900/5' :
        isShen ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-purple-900/3' :
        'border-white/10 bg-white/[0.02]'
      }`} style={{ minHeight: '85px' }}>
        {/* 宫头信息 */}
        <div className="flex justify-between items-start mb-0.5">
          <div className="flex items-center gap-0.5">
            <span className={`text-[9px] sm:text-[10px] font-bold ${isMing ? 'text-purple-400' : isShen ? 'text-purple-300' : 'text-white/60'}`}>
              {palace.diZhiName}{palace.name}
            </span>
            {isMing && <span className="text-[7px] px-0.5 py-0.5 bg-purple-500/30 text-purple-400 rounded">命</span>}
            {isShen && <span className="text-[7px] px-0.5 py-0.5 bg-purple-500/20 text-purple-300 rounded">身</span>}
          </div>
        </div>
        {/* 天干地支 */}
        <div className="text-[8px] text-white/40 mb-0.5">{palace.position}{palace.heavenlyStem || ''}</div>
        {/* 主星 */}
        <div className="flex flex-wrap gap-x-1 gap-y-0">
          {majorStars.map((star: string, i: number) => (
            <span key={i} className={`text-[9px] sm:text-[10px] ${XING_COLOR[star] || 'text-white/75'}`}>{star}</span>
          ))}
        </div>
        {/* 辅星 */}
        {minorStars.length > 0 && (
          <div className="flex flex-wrap gap-x-0.5 gap-y-0 mt-0.5">
            {minorStars.slice(0, 5).map((star: string, i: number) => (
              <span key={i} className={`text-[8px] ${XING_COLOR[star] || 'text-white/50'}`}>{star}</span>
            ))}
          </div>
        )}
        {/* 空宫 */}
        {majorStars.length === 0 && minorStars.length === 0 && (
          <span className="text-[9px] text-white/10">空宫</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 命盘头部 */}
      <div className="text-center text-[11px] text-white/40">
        公历 {info.year}年{info.month}月{info.day}日 {info.hour}时 · {info.gender === 'male' ? '男' : '女'}命
        {panMeta.fiveElements && <span> · 五行局：{panMeta.fiveElements}</span>}
      </div>

      {/* 4x4标准十二宫 */}
      <div className="border border-white/10 rounded-xl p-2 sm:p-3 bg-white/[0.01]">
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
          {/* 第一行: 巳 午 未 申 */}
          {renderPalaceCard(orderedPalaces[0], 0)}
          {renderPalaceCard(orderedPalaces[1], 1)}
          {renderPalaceCard(orderedPalaces[2], 2)}
          {renderPalaceCard(orderedPalaces[3], 3)}

          {/* 第二行: 辰 [中心] 酉 */}
          {renderPalaceCard(orderedPalaces[4], 4)}
          {/* 中心区域 */}
          <div className="col-span-2 row-span-2 border border-purple-500/20 rounded-lg bg-gradient-to-br from-purple-500/5 to-slate-900/5 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,#a855f7_1px,transparent_1px)] bg-[length:10px_10px]" />
            <p className="text-purple-400 font-bold text-xs sm:text-sm mb-0.5 relative z-10">紫微斗数命盘</p>
            <p className="text-white/40 text-[9px] relative z-10">{panMeta.chineseDate || `${info.year}年${info.month}月${info.day}日`}</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] mt-1 relative z-10">
              <span className="text-white/50">命宫:</span><span className="text-purple-400">{soul || '?'}</span>
              <span className="text-white/50">身宫:</span><span className="text-purple-300">{body || '?'}</span>
              <span className="text-white/50">命主:</span><span className="text-purple-400">{panMeta.soulStar || '?'}</span>
              <span className="text-white/50">身主:</span><span className="text-blue-400">{panMeta.bodyStar || '?'}</span>
            </div>
          </div>
          {renderPalaceCard(orderedPalaces[5], 5)}

          {/* 第三行: 卯 [中心继续] 戌 */}
          {renderPalaceCard(orderedPalaces[6], 6)}
          {renderPalaceCard(orderedPalaces[7], 7)}

          {/* 第四行: 寅 丑 子 亥 */}
          {renderPalaceCard(orderedPalaces[8], 8)}
          {renderPalaceCard(orderedPalaces[9], 9)}
          {renderPalaceCard(orderedPalaces[10], 10)}
          {renderPalaceCard(orderedPalaces[11], 11)}
        </div>
      </div>
    </div>
  );
}

// ===== 分数条 =====
function ScoreBar({ label, score, maxScore, color, feedback }: { label: string; score: number; maxScore: number; color: string; feedback: string }) {
  const pct = (score / maxScore) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-medium">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}<span className="text-white/20">/{maxScore}</span></span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}30, ${color})` }} />
      </div>
      {feedback && <p className="text-[11px] text-white/30 leading-relaxed pl-1">{feedback}</p>}
    </div>
  );
}

export default function MasterGameTool() {
  const [phase, setPhase] = useState<'select' | 'loading' | 'display' | 'answer' | 'scoring' | 'result'>('select');
  const [mode, setMode] = useState<GameMode | null>(null);
  const [gender, setGender] = useState('');
  const [pillar, setPillar] = useState('');
  const [pattern, setPattern] = useState('');
  const [guaInfo, setGuaInfo] = useState<GuaInfo | null>(null);
  const [baziResult, setBaziResult] = useState<any>(null);
  const [baziInfo, setBaziInfo] = useState<BaziInfo | null>(null);
  const [ziweiPalaces, setZiweiPalaces] = useState<any[]>([]);
  const [panMeta, setPanMeta] = useState<any>({});

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [userGuaAnalysis, setUserGuaAnalysis] = useState('');
  const [userGuaResult, setUserGuaResult] = useState('');

  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null);
  const [aiGuaAnswer, setAiGuaAnswer] = useState<LiuYaoAnswer | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [guaScoreResult, setGuaScoreResult] = useState<any>(null);
  const [loadingText, setLoadingText] = useState('');

  const gameIdRef = useRef<string>('');

  // 加载iztro
  function loadIztro(): Promise<any> {
    return new Promise((resolve, reject) => {
      const w = window as any;
      if (w.iztro) { resolve(w.iztro); return; }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/iztro@2.0.5/dist/iztro.min.js';
      s.onload = () => resolve(w.iztro);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const startGame = useCallback(async (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase('loading');
    setUserAnswers({});
    setUserGuaAnalysis('');
    setUserGuaResult('');
    setAiAnswer(null);
    setAiGuaAnswer(null);
    setScoreResult(null);
    setGuaScoreResult(null);
    setBaziResult(null);
    setZiweiPalaces([]);
    setPanMeta({});
    setGuaInfo(null);
    gameIdRef.current = '';

    try {
      if (selectedMode === 'bazi') await startBazi();
      else if (selectedMode === 'ziwei') await startZiWei();
      else await startGua(selectedMode);
    } catch { setPhase('select'); }
  }, []);

  // ===== 八字：代码排四柱 + AI只分析格局 =====
  async function startBazi() {
    const info = generateRandomBazi();
    setBaziInfo(info);
    const genderText = info.gender === 'male' ? '男' : '女';
    setGender(genderText);
    gameIdRef.current = `bazi_${info.year}_${info.month}_${info.day}_${info.hour}_${info.gender}`;

    let pillarText = '';
    let patternText = '杂气格';
    let bzResult: any = null;

    try {
      const L = window.Lunar;
      if (L) {
        const lunar = L.fromYmdHms(info.year, info.month, info.day, info.hour, 0, 0);
        const bz = lunar.getEightChar();
        pillarText = `${bz.getYear()} ${bz.getMonth()} ${bz.getDay()} ${bz.getTime()}`;
        setPillar(pillarText);
        const dg = bz.getDay()[0];
        if (['甲','乙'].includes(dg)) patternText = '建禄格';
        else if (['丙','丁'].includes(dg)) patternText = '食伤生财';
        else if (['戊','己'].includes(dg)) patternText = '正官格';
        else if (['庚','辛'].includes(dg)) patternText = '伤官配印';
        else if (['壬','癸'].includes(dg)) patternText = '从财格';
        setPattern(patternText);
        bzResult = {
          year: { gan: bz.getYear()[0], zhi: bz.getYear()[1] },
          month: { gan: bz.getMonth()[0], zhi: bz.getMonth()[1] },
          day: { gan: bz.getDay()[0], zhi: bz.getDay()[1] },
          hour: { gan: bz.getTime()[0], zhi: bz.getTime()[1] },
          dayGan: dg,
        };
      }
    } catch {
      pillarText = '甲子 丙寅 戊辰 庚午';
      setPillar(pillarText);
      bzResult = { year: { gan: '甲', zhi: '子' }, month: { gan: '丙', zhi: '寅' }, day: { gan: '戊', zhi: '辰' }, hour: { gan: '庚', zhi: '午' }, dayGan: '戊' };
    }
    setBaziResult(bzResult);

    setLoadingText('AI正在隐藏标准答案...');
    const answerPrompt = makeBaziAnswerPrompt(pillarText, patternText, genderText);
    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，八字命理宗师。请严格分析输出JSON。只输出JSON，不分析其他。' + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    setAiAnswer(parseAIAnswerJSON(answerResponse) || { overallPattern: 'AI分析中...', wealth: '', marriage: '', friendship: '', career: '', family: '', parents: '' });
    setPhase('display');
  }

  // ===== 紫微：用iztro bySolar排盘（和ZiWeiTool一致）=====
  async function startZiWei() {
    const info = generateRandomBazi();
    setBaziInfo(info);
    const genderText = info.gender === 'male' ? '男' : '女';
    setGender(genderText);
    gameIdRef.current = `ziwei_${info.year}_${info.month}_${info.day}_${info.hour}_${info.gender}`;

    setLoadingText('正在排紫微命盘...');

    let palaces: any[] = [];
    let meta: any = {};

    // 尝试iztro（4秒超时），和ZiWeiTool一样用bySolar
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
      const astro: any = await Promise.race([loadIztro(), timeoutPromise]);
      if (astro && astro.astro && astro.astro.bySolar) {
        const hourIdx = Math.floor(info.hour / 2) % 12;
        const a = astro.astro.bySolar(`${info.year}-${String(info.month).padStart(2,'0')}-${String(info.day).padStart(2,'0')}`, hourIdx, genderText, true, 'zh-CN');

        // 提取命盘元信息
        meta = {
          soul: a.soul || '',
          body: a.body || '',
          soulStar: a.soulStar || '',
          bodyStar: a.bodyStar || '',
          fiveElements: a.fiveElementsClass || '',
          chineseDate: a.chineseDate || '',
          zodiac: a.zodiac || '',
          mutagens: a.mutagens || {},
        };

        // 提取十二宫数据，包含完整地支信息
        if (a.palaces && a.palaces.length === 12) {
          palaces = a.palaces.map((p: any) => ({
            name: p.name || '',
            diZhiName: p.earthlyBranch ? p.earthlyBranch.substring(0, 1) : '',
            position: p.earthlyBranch || '',
            heavenlyStem: p.heavenlyStem || '',
            majorStars: (p.majorStars || []).map((s: any) => typeof s === 'string' ? s : (s.name || '')),
            minorStars: (p.minorStars || []).map((s: any) => typeof s === 'string' ? s : (s.name || '')),
            decadal: p.decadal || null,
          }));
        }
      }
    } catch { /* fallback to AI */ }

    // iztro失败 → AI排完整十二宫
    if (palaces.length === 0) {
      setLoadingText('AI正在排紫微命盘...');
      try {
        const aiPanResponse = await callSiliconAPIWithRetry([
          { role: 'system', content: '你是黄师傅，精通紫微斗数排盘。请严格按格式输出。' + NO_MARKDOWN_RULE },
          { role: 'user', content: `请为以下生辰排紫微斗数命盘：
公历 ${info.year}年${info.month}月${info.day}日 ${info.hour}时 性别：${genderText}

请输出JSON格式：
{
  "soul": "命宫所在地支（一个汉字）",
  "body": "身宫所在地支（一个汉字）",
  "soulStar": "命主星",
  "bodyStar": "身主星",
  "fiveElements": "五行局如金四局",
  "chineseDate": "农历日期",
  "palaces": [
    {"name": "命宫", "diZhiName": "地支如寅", "position": "丙寅", "heavenlyStem": "丙", "majorStars": ["紫微", "天府"], "minorStars": ["文昌"]},
    ...共12个宫位，按命宫、兄弟、夫妻、子女、财帛、疾厄、迁移、交友、事业、田宅、福德、父母顺序
  ]
}

要求：
1. 每个宫位必须有name、diZhiName（单字地支）、position（如丙寅）、heavenlyStem（天干）、majorStars（主星数组）、minorStars（辅星数组）
2. majorStars不能为空，至少填一颗主星
3. diZhiName必须是十二地支之一：子丑寅卯辰巳午未申酉戌亥
4. 只输出JSON，不要其他文字` },
        ], { maxTokens: 2000, temperature: 0.2 });

        const m = aiPanResponse.match(/\{[\s\S]*\}/);
        if (m) {
          const d = JSON.parse(m[0]);
          meta = {
            soul: d.soul || '', body: d.body || '',
            soulStar: d.soulStar || '', bodyStar: d.bodyStar || '',
            fiveElements: d.fiveElements || '', chineseDate: d.chineseDate || '',
          };
          if (d.palaces && d.palaces.length > 0) {
            palaces = d.palaces.map((p: any) => ({
              name: p.name || '', diZhiName: p.diZhiName || '',
              position: p.position || '', heavenlyStem: p.heavenlyStem || '',
              majorStars: p.majorStars || [], minorStars: p.minorStars || [],
            }));
          }
        }
      } catch { /* use default */ }
    }

    // 兜底：如果还是不够12个，补充默认值
    if (palaces.length < 12) {
      const defaultNames = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '事业', '田宅', '福德', '父母'];
      const defaultStars = ['紫微', '天府', '太阳', '武曲', '天同', '廉贞', '天机', '贪狼', '巨门', '天相', '天梁', '七杀'];
      for (let i = palaces.length; i < 12; i++) {
        palaces.push({
          name: defaultNames[i] || '', diZhiName: DI_ZHI[i] || '',
          position: '', heavenlyStem: '',
          majorStars: [defaultStars[i] || '天机'], minorStars: [],
        });
      }
    }

    setPillar(`紫微${meta.soul || ''}命，${meta.fiveElements || ''}局`);
    setPattern('紫微斗数');
    setZiweiPalaces(palaces);
    setPanMeta(meta);

    setLoadingText('AI正在隐藏标准答案...');
    const panDesc = palaces.map(p => `${p.diZhiName}${p.name}：${(p.majorStars || []).join('、')}`).join('\n');

    const answerPrompt = `你是黄师傅，紫微斗数宗师。请分析以下紫微命盘，输出JSON：

【生辰】${info.year}年${info.month}月${info.day}日 ${info.hour}时
【性别】${genderText}
【命宫】${meta.soul || ''}
【命主】${meta.soulStar || ''}
【五行局】${meta.fiveElements || ''}
【命盘】
${panDesc}

输出JSON格式：
{
  "overallPattern": "此命紫微格局总评，200字左右",
  "wealth": "财运分析，80字左右",
  "marriage": "婚姻分析，80字左右",
  "friendship": "交友分析，80字左右",
  "career": "事业分析，80字左右",
  "family": "家庭分析，80字左右",
  "parents": "父母分析，80字左右"
}
只输出JSON。`;

    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，紫微斗数宗师。请分析输出JSON。只输出JSON。' + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    setAiAnswer(parseAIAnswerJSON(answerResponse) || { overallPattern: 'AI分析中...', wealth: '', marriage: '', friendship: '', career: '', family: '', parents: '' });
    setPhase('display');
  }

  // ===== 六爻/梅花：代码排卦画 + AI只分析 =====
  async function startGua(gameMode: GameMode) {
    const info = generateRandomGua();
    setGuaInfo(info);
    gameIdRef.current = `${gameMode}_${info.benGua}_${info.bianGua}_${info.yaoCi.join('_')}`;

    // 确保变卦和互卦由代码计算（不是随机）
    const yaoNum = info.yaoCi[0]?.match(/\d+/)?.[0] ? parseInt(info.yaoCi[0].match(/\d+/)![0]) : 1;
    const computedBianGua = getBianGua(info.benGua, yaoNum);
    info.bianGua = computedBianGua; // 覆盖随机值，确保一致性

    setLoadingText('AI正在隐藏标准答案...');

    // AI生成标准答案（基于同一个卦信息）
    const answerPrompt = gameMode === 'liuyao'
      ? `你是六爻宗师。请对以下卦象严格断卦，输出JSON。
【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}（上${getGuaComponents(info.benGua).upper}下${getGuaComponents(info.benGua).lower}）
【变卦】${info.bianGua}
【动爻】第${yaoNum}爻动
【世应】${info.shiYing}

输出JSON：
{
  "analysis": "详细断卦分析过程，300字左右，包括用神旺衰、世应关系、动爻影响、结果推断。必须基于上面给出的卦象来分析。",
  "result": "最终断语，80字左右，明确给出吉凶判断"
}
只输出JSON。`
      : `你是梅花易数宗师。请对以下卦象严格断卦，输出JSON。
【占卦人】${info.questioner}
【所占之事】${info.question}
【本卦】${info.benGua}（上${getGuaComponents(info.benGua).upper}下${getGuaComponents(info.benGua).lower}）
【互卦】${getHuGua(info.benGua)}
【变卦】${info.bianGua}
【动爻】第${yaoNum}爻动

输出JSON：
{
  "analysis": "详细断卦分析，300字左右，包括体用生克、卦象类象、动变影响。必须基于上面给出的卦象来分析。",
  "result": "最终断语，80字左右"
}
只输出JSON。`;

    const answerResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: `你是${gameMode === 'liuyao' ? '六爻' : '梅花易数'}宗师。请严格断卦输出JSON。只输出JSON。` + NO_MARKDOWN_RULE },
      { role: 'user', content: answerPrompt },
    ], { maxTokens: 1500, temperature: 0.3 });
    setAiGuaAnswer(parseLiuYaoAnswerJSON(answerResponse) || { analysis: 'AI分析中...', result: '' });
    setPhase('display');
  }

  // ===== 提交评分 =====
  async function submitAnswers() {
    if (!mode) return;
    setPhase('scoring');
    try {
      if (mode === 'bazi' || mode === 'ziwei') await scoreBazi();
      else await scoreGua();
    } catch { setPhase('answer'); }
  }

  async function scoreBazi() {
    if (!aiAnswer) return;
    const scorePrompt = makeScorePrompt(mode as 'bazi' | 'ziwei', pillar, pattern, gender, userAnswers, aiAnswer);
    const scoreResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: '你是黄师傅，严格公正的命理考官。' + NO_MARKDOWN_RULE },
      { role: 'user', content: scorePrompt },
    ], { maxTokens: 2500, temperature: 0.3 });
    setScoreResult(parseScoreJSON(scoreResponse));
    setPhase('result');
  }

  async function scoreGua() {
    if (!aiGuaAnswer || !guaInfo) return;
    const scorePrompt = mode === 'liuyao'
      ? makeLiuYaoScorePrompt(guaInfo, userGuaAnalysis, userGuaResult, aiGuaAnswer)
      : `你是梅花易数宗师兼严师。请对用户断卦评分。
【卦象】
占卦人：${guaInfo.questioner}
所占之事：${guaInfo.question}
本卦：${guaInfo.benGua}（上${getGuaComponents(guaInfo.benGua).upper}下${getGuaComponents(guaInfo.benGua).lower}）
互卦：${getHuGua(guaInfo.benGua)}
变卦：${guaInfo.bianGua}
动爻：${guaInfo.yaoCi.join('、')}

【用户断卦】
分析：${userGuaAnalysis}
断语：${userGuaResult}

【标准断卦】
分析：${aiGuaAnswer.analysis}
断语：${aiGuaAnswer.result}

输出JSON：
{
  "analysisScore": 0-50,
  "analysisFeedback": "对体用分析、类象运用、生克判断的评价",
  "resultScore": 0-30,
  "resultFeedback": "对最终断语的评价",
  "logicScore": 0-20,
  "logicFeedback": "对推理逻辑的评价",
  "total": 总分,
  "grade": "评级",
  "summary": "总体评价",
  "studyAdvice": "具体学习建议"
}
严格客观，只输出JSON`;
    const scoreResponse = await callSiliconAPIWithRetry([
      { role: 'system', content: `你是${mode === 'liuyao' ? '六爻' : '梅花易数'}宗师兼严师。` + NO_MARKDOWN_RULE },
      { role: 'user', content: scorePrompt },
    ], { maxTokens: 2000, temperature: 0.3 });
    setGuaScoreResult(parseGuaScoreJSON(scoreResponse));
    setPhase('result');
  }

  function restart() {
    setPhase('select');
    setMode(null);
    setGuaInfo(null);
    setBaziResult(null);
    setZiweiPalaces([]);
    setPanMeta({});
    setAiAnswer(null);
    setAiGuaAnswer(null);
    setScoreResult(null);
    setGuaScoreResult(null);
  }

  const currentMode = MODES.find(m => m.key === mode);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 px-4">
      <style>{`
        @keyframes fU { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes dn { from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)} }
        .aFU { animation: fU 0.6s ease forwards }
        .aDN { animation: dn 0.5s ease forwards }
        .shTxtP { background: linear-gradient(90deg,#4c1d95 0%,#a78bfa 40%,#fff 50%,#a78bfa 60%,#4c1d95 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: sh 4s linear infinite }
        @keyframes sh { 0%{background-position:-200%0}100%{background-position:200%0} }
        textarea { resize: vertical; min-height: 80px; }
      `}</style>

      <Link to="/games" className="inline-flex items-center gap-1 text-xs text-white/20 hover:text-white/50 transition-colors pt-4">
        <ArrowLeft className="w-3.5 h-3.5" />返回小游戏
      </Link>

      {/* 标题 */}
      <div className="relative text-center space-y-2 py-8 overflow-hidden rounded-3xl aFU"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08), rgba(10,5,2,0.98))', border: '1px solid rgba(168,85,247,0.08)' }}>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)', color: '#8b5cf6' }}>
            <FlaskConical className="w-3 h-3" />AI考官 · 严师把关
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight shTxtP" style={{ fontFamily: "'Noto Serif SC','KaiTi',serif" }}>我是大师</h1>
          <p className="text-[10px] text-white/20">AI随机出题，你来做命理师，看你能算准几分</p>
        </div>
      </div>

      {/* ===== 选择模式 ===== */}
      {phase === 'select' && (
        <div className="aFU space-y-4">
          <div className="text-center">
            <p className="text-xs text-white/40 mb-1">选择你想考核的命理技能</p>
            <p className="text-[10px] text-white/15">AI将随机生成命盘或卦象，你需要根据所学进行分析</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m, i) => {
              const Icon = m.icon;
              return (
                <button key={m.key} onClick={() => startGame(m.key)}
                  className="group relative text-left rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${m.color}06, rgba(0,0,0,0.3))`, borderColor: `${m.color}15`, animationDelay: `${i * 0.1}s` }}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${m.color}30, transparent)` }} />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: m.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{m.label}</h3>
                        <p className="text-[9px]" style={{ color: `${m.color}80` }}>{m.sub}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/35 leading-relaxed">{m.desc}</p>
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: `${m.color}60` }}>
                      <Sparkles className="w-3 h-3" />开始考核<ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 加载中 ===== */}
      {phase === 'loading' && (
        <div className="aFU flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-spin" style={{ border: '2px solid rgba(168,85,247,0.1)', borderTopColor: '#a78bfa' }} />
            <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-5 h-5 text-purple-400/50" /></div>
          </div>
          <p className="text-sm text-white/40">{loadingText}</p>
        </div>
      )}

      {/* ===== 排盘展示 ===== */}
      {phase === 'display' && currentMode && (
        <div className="aFU space-y-4">
          <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: 'rgba(168,85,247,0.03)', borderColor: 'rgba(168,85,247,0.1)' }}>
            <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: currentMode.color }} />
            <div>
              <p className="text-xs font-medium" style={{ color: currentMode.color }}>考题已生成，AI考官已隐藏答案</p>
              <p className="text-[10px] text-white/30">请仔细分析以下排盘信息，点击开始作答</p>
            </div>
          </div>

          {/* 排盘显示 */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(5,3,2,0.99))', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <ScrollText className="w-4 h-4" style={{ color: currentMode.color, opacity: 0.5 }} />
              <span className="text-xs font-bold text-white/40">
                {mode === 'bazi' ? '八字排盘' : mode === 'ziwei' ? '紫微命盘' : mode === 'liuyao' ? '六爻排盘' : '梅花卦象'}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}60`, border: `1px solid ${currentMode.color}15` }}>AI已隐藏答案</span>
            </div>
            <div className="px-4 pb-4">
              <div className="rounded-lg p-4 border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.03)' }}>
                {/* 八字：代码排四柱 */}
                {mode === 'bazi' && baziInfo && baziResult && <BaZiPan info={baziInfo} result={baziResult} />}
                {/* 紫微：代码排12宫 */}
                {mode === 'ziwei' && baziInfo && <ZiWeiPan info={baziInfo} palaces={ziweiPalaces} panMeta={panMeta} />}
                {/* 六爻：代码排卦画 */}
                {mode === 'liuyao' && guaInfo && <LiuYaoPan guaInfo={guaInfo} />}
                {/* 梅花：代码排三卦 */}
                {mode === 'meihua' && guaInfo && <MeiHuaPan guaInfo={guaInfo} />}
              </div>
            </div>
          </div>

          <button onClick={() => setPhase('answer')}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 aFU"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}20, ${currentMode.color}05)`, boxShadow: `0 6px 30px ${currentMode.color}15`, border: `1px solid ${currentMode.color}20`, color: currentMode.color }}>
            <Sparkles className="w-5 h-5" />我已仔细分析，开始作答
          </button>
        </div>
      )}

      {/* ===== 用户作答（带排盘信息） ===== */}
      {phase === 'answer' && currentMode && (
        <div className="aFU space-y-4">
          {/* 排盘信息持续显示 */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01), rgba(5,3,2,0.99))', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <ScrollText className="w-4 h-4" style={{ color: currentMode.color, opacity: 0.5 }} />
              <span className="text-xs font-bold text-white/40">{mode === 'bazi' ? '八字排盘' : mode === 'ziwei' ? '紫微命盘' : mode === 'liuyao' ? '六爻排盘' : '梅花卦象'}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}60`, border: `1px solid ${currentMode.color}15` }}>参考信息</span>
            </div>
            <div className="px-4 pb-3">
              <div className="rounded-lg p-3 border" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.03)' }}>
                {mode === 'bazi' && baziInfo && baziResult && <BaZiPan info={baziInfo} result={baziResult} />}
                {mode === 'ziwei' && baziInfo && <ZiWeiPan info={baziInfo} palaces={ziweiPalaces} panMeta={panMeta} />}
                {mode === 'liuyao' && guaInfo && <LiuYaoPan guaInfo={guaInfo} />}
                {mode === 'meihua' && guaInfo && <MeiHuaPan guaInfo={guaInfo} />}
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />
          <div className="text-center space-y-1">
            <p className="text-xs text-white/40">请根据上方排盘信息，输入你的分析判断</p>
          </div>

          {/* 八字/紫微：7维度输入 */}
          {(mode === 'bazi' || mode === 'ziwei') && (
            <div className="space-y-3">
              {DIM_CONFIG.map((dim, i) => {
                const Icon = dim.icon;
                return (
                  <div key={dim.key} className="rounded-xl border overflow-hidden aFU" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)', animationDelay: `${i * 0.05}s` }}>
                    <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                      <span className="text-xs font-medium text-white/50">{dim.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}70` }}>{dim.score}分</span>
                    </div>
                    <div className="px-4 pb-3">
                      <textarea value={userAnswers[dim.key] || ''} onChange={e => setUserAnswers(prev => ({ ...prev, [dim.key]: e.target.value }))}
                        placeholder={dim.placeholder}
                        className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-purple-400/30 transition-all leading-relaxed"
                        style={{ fontFamily: "'Noto Serif SC',serif", minHeight: dim.key === 'overallPattern' ? 120 : 80 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 六爻/梅花：断卦输入 */}
          {(mode === 'liuyao' || mode === 'meihua') && (
            <div className="space-y-3">
              <div className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <ScrollText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                  <span className="text-xs font-medium text-white/50">断卦分析过程</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}70` }}>50分</span>
                </div>
                <div className="px-4 pb-3">
                  <textarea value={userGuaAnalysis} onChange={e => setUserGuaAnalysis(e.target.value)}
                    placeholder={`请详细写出你的${mode === 'liuyao' ? '六爻' : '梅花'}分析过程...`}
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-blue-400/30 transition-all leading-relaxed"
                    style={{ fontFamily: "'Noto Serif SC',serif", minHeight: 150 }} />
                </div>
              </div>
              <div className="rounded-xl border overflow-hidden" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} />
                  <span className="text-xs font-medium text-white/50">最终断语</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: `${currentMode.color}10`, color: `${currentMode.color}70` }}>30分</span>
                </div>
                <div className="px-4 pb-3">
                  <textarea value={userGuaResult} onChange={e => setUserGuaResult(e.target.value)}
                    placeholder="请给出明确的最终断语：所占之事吉凶如何？结果怎样？"
                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 placeholder:text-white/10 focus:outline-none focus:border-blue-400/30 transition-all leading-relaxed"
                    style={{ fontFamily: "'Noto Serif SC',serif", minHeight: 80 }} />
                </div>
              </div>
              <div className="rounded-lg px-3 py-2 border" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/20">推理逻辑分 20分（自动评估）</span>
                </div>
              </div>
            </div>
          )}

          <button onClick={submitAnswers}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}30, ${currentMode.color}10)`, boxShadow: `0 6px 30px ${currentMode.color}15`, border: `1px solid ${currentMode.color}25`, color: currentMode.color }}>
            <Send className="w-5 h-5" />提交答案，请求AI评分
          </button>
        </div>
      )}

      {/* ===== 评分中 ===== */}
      {phase === 'scoring' && (
        <div className="aFU flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full animate-spin" style={{ border: '2px solid rgba(168,85,247,0.1)', borderTopColor: '#a78bfa' }} />
            <div className="absolute inset-0 flex items-center justify-center"><Award className="w-5 h-5 text-purple-400/50" /></div>
          </div>
          <p className="text-sm text-white/40">AI考官正在严格评分...</p>
        </div>
      )}

      {/* ===== 结果展示 ===== */}
      {phase === 'result' && currentMode && (
        <div className="aFU space-y-5">
          {(scoreResult || guaScoreResult) && (
            <div className="relative rounded-3xl border overflow-hidden text-center py-8 space-y-4"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${currentMode.color}10, rgba(10,5,2,0.98))`, borderColor: `${currentMode.color}15` }}>
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ background: `linear-gradient(135deg, ${currentMode.color}15, ${currentMode.color}05)`, border: `1px solid ${currentMode.color}30`, boxShadow: `0 0 40px ${currentMode.color}10` }}>
                  <span className="text-4xl font-black" style={{ color: currentMode.color, fontFamily: "'Noto Serif SC',serif" }}>
                    {scoreResult ? scoreResult.total : guaScoreResult ? guaScoreResult.total : 0}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-bold" style={{ color: currentMode.color, fontFamily: "'Noto Serif SC',serif" }}>
                    {scoreResult?.grade || guaScoreResult?.grade || '未评级'}
                  </span>
                </div>
                <p className="text-xs text-white/30 px-6">{scoreResult?.summary || guaScoreResult?.summary || ''}</p>
              </div>
            </div>
          )}

          {scoreResult && (mode === 'bazi' || mode === 'ziwei') && (
            <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-white/30" /><span className="text-xs font-bold text-white/40">分项得分</span></div>
              <ScoreBar label="一生格局走向" score={scoreResult.overallPattern.score} maxScore={40} color={currentMode.color} feedback={scoreResult.overallPattern.feedback} />
              <ScoreBar label="财运" score={scoreResult.wealth.score} maxScore={10} color={currentMode.color} feedback={scoreResult.wealth.feedback} />
              <ScoreBar label="婚姻" score={scoreResult.marriage.score} maxScore={10} color={currentMode.color} feedback={scoreResult.marriage.feedback} />
              <ScoreBar label="交友" score={scoreResult.friendship.score} maxScore={10} color={currentMode.color} feedback={scoreResult.friendship.feedback} />
              <ScoreBar label="事业" score={scoreResult.career.score} maxScore={10} color={currentMode.color} feedback={scoreResult.career.feedback} />
              <ScoreBar label="家庭" score={scoreResult.family.score} maxScore={10} color={currentMode.color} feedback={scoreResult.family.feedback} />
              <ScoreBar label="父母" score={scoreResult.parents.score} maxScore={10} color={currentMode.color} feedback={scoreResult.parents.feedback} />
            </div>
          )}

          {guaScoreResult && (mode === 'liuyao' || mode === 'meihua') && (
            <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.005)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><Award className="w-4 h-4 text-white/30" /><span className="text-xs font-bold text-white/40">分项得分</span></div>
              <ScoreBar label="断卦分析" score={guaScoreResult.analysisScore || 0} maxScore={50} color={currentMode.color} feedback={guaScoreResult.analysisFeedback || ''} />
              <ScoreBar label="最终断语" score={guaScoreResult.resultScore || 0} maxScore={30} color={currentMode.color} feedback={guaScoreResult.resultFeedback || ''} />
              <ScoreBar label="推理逻辑" score={guaScoreResult.logicScore || 0} maxScore={20} color={currentMode.color} feedback={guaScoreResult.logicFeedback || ''} />
            </div>
          )}

          {(scoreResult?.studyAdvice || guaScoreResult?.studyAdvice) && (
            <div className="rounded-2xl border p-5 space-y-3 aDN" style={{ background: `linear-gradient(180deg, ${currentMode.color}05, rgba(5,3,2,0.99))`, borderColor: `${currentMode.color}12` }}>
              <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: currentMode.color, opacity: 0.5 }} /><span className="text-xs font-bold" style={{ color: `${currentMode.color}90` }}>学习指导</span></div>
              <div className="text-xs text-white/40 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Noto Serif SC',serif" }}><HighlightText text={scoreResult?.studyAdvice || guaScoreResult?.studyAdvice || ''} /></div>
            </div>
          )}

          {aiGuaAnswer && (mode === 'liuyao' || mode === 'meihua') && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400/40" /><span className="text-xs font-bold text-white/30">AI标准断卦（供参考学习）</span></div>
              <div className="space-y-1"><span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>分析过程</span><p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{aiGuaAnswer.analysis}</p></div>
              <div className="space-y-1"><span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>最终断语</span><p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{aiGuaAnswer.result}</p></div>
            </div>
          )}

          {aiAnswer && (mode === 'bazi' || mode === 'ziwei') && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400/40" /><span className="text-xs font-bold text-white/30">AI标准答案（供参考学习）</span></div>
              {DIM_CONFIG.map(dim => (
                <div key={dim.key} className="space-y-1">
                  <span className="text-[10px] font-medium" style={{ color: currentMode.color, opacity: 0.5 }}>{dim.label}</span>
                  <p className="text-[11px] text-white/25 leading-relaxed" style={{ fontFamily: "'Noto Serif SC',serif" }}>{(aiAnswer as any)[dim.key] || ''}</p>
                </div>
              ))}
            </div>
          )}

          {/* 保存考核记录 */}
          <div className="flex justify-center">
            <SaveRecordButton
              type="mastergame"
              typeLabel={mode === 'bazi' || mode === 'ziwei' ? '我是大师-命理考核' : '我是大师-断卦考核'}
              data={{
                mode,
                pillar,
                pattern,
                gender,
                score: scoreResult ? scoreResult.total : guaScoreResult ? guaScoreResult.total : 0,
                grade: scoreResult?.grade || guaScoreResult?.grade || '',
                ...(scoreResult ? { overallPattern: scoreResult.overallPattern, wealth: scoreResult.wealth } : {}),
                ...(guaScoreResult ? { analysisScore: guaScoreResult.analysisScore, resultScore: guaScoreResult.resultScore } : {}),
              } as unknown as Record<string, unknown>}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={restart} className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
              <RotateCcw className="w-4 h-4" />换一题
            </button>
            {mode && (
              <button onClick={() => startGame(mode)} className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ background: `${currentMode.color}10`, border: `1px solid ${currentMode.color}20`, color: currentMode.color }}>
                <Sparkles className="w-4 h-4" />再来一局
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
