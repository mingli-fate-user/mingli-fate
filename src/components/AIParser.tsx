import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Loader2, Send, User, Save, Copy, Check } from 'lucide-react';
import { streamSiliconAPI } from '@/utils/apiClient';
import { cleanMarkdown, NO_MARKDOWN_RULE } from '@/utils/aiTextUtils';
import HighlightText from '@/components/HighlightText';

interface AIParserProps {
  type: 'bazi' | 'ziwei' | 'meihua' | 'liuyao' | 'xiaoliuren' | 'qimen' | 'chenggu' | 'tarot' | 'astro' | 'qizheng';
  data: Record<string, unknown>;
}

interface Message { role: 'user' | 'assistant'; content: string; id: string; }

const TYPE_LABELS: Record<string, string> = {
  bazi: '八字排盘', ziwei: '紫微斗数', meihua: '梅花易数', liuyao: '六爻解卦',
  xiaoliuren: '江氏小六壬', qimen: '奇门遁甲', chenggu: '袁天罡称骨',
  tarot: '塔罗牌占卜', astro: '西方星盘', qizheng: '七政四余',
};

// ============================================================
// 每種術數獨特配色方案 - 深色背景 + 高對比文字
// ============================================================
const THEMES: Record<string, {
  name: string; accent: string; accent2: string; bg: string; bgGradient: string;
  border: string; text: string; textMuted: string; userBg: string; aiBg: string;
  headerBg: string; inputBg: string; btnBg: string; btnHover: string; icon: string;
}> = {
  bazi: {
    name: '八字', accent: '#f59e0b', accent2: '#fbbf24',
    bg: '#0f0b05', bgGradient: 'linear-gradient(135deg, #1a1208 0%, #0f0b05 50%, #120c04 100%)',
    border: 'rgba(245,158,11,0.25)', text: '#fef3c7', textMuted: 'rgba(254,243,199,0.5)',
    userBg: 'rgba(245,158,11,0.12)', aiBg: 'rgba(245,158,11,0.06)',
    headerBg: 'rgba(245,158,11,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#b45309', btnHover: '#d97706', icon: '#fbbf24',
  },
  ziwei: {
    name: '紫微', accent: '#8b5cf6', accent2: '#a78bfa',
    bg: '#0a0618', bgGradient: 'linear-gradient(135deg, #120b20 0%, #0a0618 50%, #0d0820 100%)',
    border: 'rgba(139,92,246,0.25)', text: '#ede9fe', textMuted: 'rgba(237,233,254,0.5)',
    userBg: 'rgba(139,92,246,0.12)', aiBg: 'rgba(139,92,246,0.06)',
    headerBg: 'rgba(139,92,246,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#6d28d9', btnHover: '#7c3aed', icon: '#a78bfa',
  },
  meihua: {
    name: '梅花', accent: '#22c55e', accent2: '#4ade80',
    bg: '#050f08', bgGradient: 'linear-gradient(135deg, #0a1a0e 0%, #050f08 50%, #08180c 100%)',
    border: 'rgba(34,197,94,0.25)', text: '#dcfce7', textMuted: 'rgba(220,252,231,0.5)',
    userBg: 'rgba(34,197,94,0.12)', aiBg: 'rgba(34,197,94,0.06)',
    headerBg: 'rgba(34,197,94,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#15803d', btnHover: '#16a34a', icon: '#4ade80',
  },
  liuyao: {
    name: '六爻', accent: '#0ea5e9', accent2: '#38bdf8',
    bg: '#050e14', bgGradient: 'linear-gradient(135deg, #0a1a24 0%, #050e14 50%, #081220 100%)',
    border: 'rgba(14,165,233,0.25)', text: '#e0f2fe', textMuted: 'rgba(224,242,254,0.5)',
    userBg: 'rgba(14,165,233,0.12)', aiBg: 'rgba(14,165,233,0.06)',
    headerBg: 'rgba(14,165,233,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#0369a1', btnHover: '#0284c7', icon: '#38bdf8',
  },
  xiaoliuren: {
    name: '小六壬', accent: '#f43f5e', accent2: '#fb7185',
    bg: '#140508', bgGradient: 'linear-gradient(135deg, #1f0a10 0%, #140508 50%, #180810 100%)',
    border: 'rgba(244,63,94,0.25)', text: '#ffe4e6', textMuted: 'rgba(255,228,230,0.5)',
    userBg: 'rgba(244,63,94,0.12)', aiBg: 'rgba(244,63,94,0.06)',
    headerBg: 'rgba(244,63,94,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#be123c', btnHover: '#e11d48', icon: '#fb7185',
  },
  qimen: {
    name: '奇门', accent: '#f97316', accent2: '#fb923c',
    bg: '#110800', bgGradient: 'linear-gradient(135deg, #1a0f00 0%, #110800 50%, #140d00 100%)',
    border: 'rgba(249,115,22,0.25)', text: '#ffedd5', textMuted: 'rgba(255,237,213,0.5)',
    userBg: 'rgba(249,115,22,0.12)', aiBg: 'rgba(249,115,22,0.06)',
    headerBg: 'rgba(249,115,22,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#c2410c', btnHover: '#ea580c', icon: '#fb923c',
  },
  chenggu: {
    name: '称骨', accent: '#c0845c', accent2: '#d4a574',
    bg: '#0f0905', bgGradient: 'linear-gradient(135deg, #1a1008 0%, #0f0905 50%, #120c06 100%)',
    border: 'rgba(192,132,92,0.25)', text: '#fef3c7', textMuted: 'rgba(254,243,199,0.5)',
    userBg: 'rgba(192,132,92,0.12)', aiBg: 'rgba(192,132,92,0.06)',
    headerBg: 'rgba(192,132,92,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#92400e', btnHover: '#b45309', icon: '#d4a574',
  },
  tarot: {
    name: '塔罗', accent: '#d946ef', accent2: '#e879f9',
    bg: '#110818', bgGradient: 'linear-gradient(135deg, #1a0f24 0%, #110818 50%, #140d22 100%)',
    border: 'rgba(217,70,239,0.25)', text: '#fae8ff', textMuted: 'rgba(250,232,255,0.5)',
    userBg: 'rgba(217,70,239,0.12)', aiBg: 'rgba(217,70,239,0.06)',
    headerBg: 'rgba(217,70,239,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#a21caf', btnHover: '#c026d3', icon: '#e879f9',
  },
  astro: {
    name: '星盘', accent: '#38bdf8', accent2: '#7dd3fc',
    bg: '#050e18', bgGradient: 'linear-gradient(135deg, #0a1828 0%, #050e18 50%, #081424 100%)',
    border: 'rgba(56,189,248,0.25)', text: '#e0f2fe', textMuted: 'rgba(224,242,254,0.5)',
    userBg: 'rgba(56,189,248,0.12)', aiBg: 'rgba(56,189,248,0.06)',
    headerBg: 'rgba(56,189,248,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#0284c7', btnHover: '#0ea5e9', icon: '#7dd3fc',
  },
  qizheng: {
    name: '七政', accent: '#f59e0b', accent2: '#fbbf24',
    bg: '#0f0a02', bgGradient: 'linear-gradient(135deg, #1a1408 0%, #0f0a02 50%, #121006 100%)',
    border: 'rgba(245,158,11,0.3)', text: '#fef3c7', textMuted: 'rgba(254,243,199,0.5)',
    userBg: 'rgba(245,158,11,0.12)', aiBg: 'rgba(245,158,11,0.06)',
    headerBg: 'rgba(245,158,11,0.08)', inputBg: 'rgba(0,0,0,0.35)',
    btnBg: '#b45309', btnHover: '#d97706', icon: '#fbbf24',
  },
};

function getTheme(type: string) { return THEMES[type] || THEMES.bazi; }

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL_NAME = 'deepseek-ai/DeepSeek-V4-Flash';

function buildStructuredPrompt(type: string, data: Record<string, unknown>): { summary: string; detail: string; framework: string } {
  switch (type) {
    case 'bazi': {
      const year = (data.year as { gan: string; zhi: string }) || { gan: '', zhi: '' };
      const month = (data.month as { gan: string; zhi: string }) || { gan: '', zhi: '' };
      const day = (data.day as { gan: string; zhi: string }) || { gan: '', zhi: '' };
      const hour = (data.hour as { gan: string; zhi: string }) || { gan: '', zhi: '' };
      const dayGan = (data.dayGan as string) || '';
      const zodiac = (data.zodiacAnimal as string) || '';
      const naYin = (data.naYin as string[]) || [];
      const shiShen = (data.shiShen as Record<string, string>) || {};
      const gender = (data.gender as string) || '';
      const daYunDir = (data.daYunDirection as string) || '';
      const dayYy = (data.dayYinYang as string) || '';
      const dayWx = (data.dayWuxing as string) || '';
      const question = (data.question as string) || '';
      const summary = `${gender}命，${year.gan}${year.zhi}年（${zodiac}），日主${dayGan}（${dayYy}${dayWx}），${daYunDir}。`;
      const detail = `【四柱干支】\n年柱：${year.gan}${year.zhi}（纳音${naYin[0] || '—'}）天干十神：${shiShen.yearGan || '—'}\n月柱：${month.gan}${month.zhi}（纳音${naYin[1] || '—'}）天干十神：${shiShen.monthGan || '—'}\n日柱：${day.gan}${day.zhi}（纳音${naYin[2] || '—'}）日主：${dayGan}\n时柱：${hour.gan}${hour.zhi}（纳音${naYin[3] || '—'}）天干十神：${shiShen.hourGan || '—'}\n\n【日主信息】\n日主：${dayGan}（${dayYy}、${dayWx}）\n大运走向：${daYunDir}\n\n【十神配置】\n年干：${shiShen.yearGan || '—'}  月干：${shiShen.monthGan || '—'}  时干：${shiShen.hourGan || '—'}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、先断总格：看日主强弱（月令+通根+生扶），定格局层次。三五句定调。\n二、论性格：从日主+十神配置看性情。\n三、论事业：看官杀与财星状态。\n四、论感情：看配偶宫（日支）+财星/官星。\n五、论财运：看财星旺衰+与日主关系。\n六、大运简评：结合大运走向给一句指引。\n\n【铁口规矩】\n1. 开口先断总格，此命格局高低、一生大势，三五句定调\n2. 用户问哪块说哪块，不问不多嘴\n3. 半文半白话风，铁口直断不模棱\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'ziwei': {
      const zodiac = (data.zodiac as string) || '';
      const fiveElements = (data.fiveElements as string) || '';
      const chineseDate = (data.chineseDate as string) || '';
      const soul = (data.soul as string) || '';
      const body = (data.body as string) || '';
      const palaces = (data.palaces as any[]) || [];
      const question = (data.question as string) || '';
      let palaceLines = '';
      palaces.forEach((p, i) => {
        const mStars = (p.majorStars || []).map((s: any) => s.name + (s.mutagen ? `·${s.mutagen}` : '') + (s.brightness ? `[${s.brightness}]` : '')).join('、');
        const nStars = (p.minorStars || []).filter(Boolean).map((s: any) => typeof s === 'string' ? s : s.name).slice(0, 4).join('、');
        const marker = p.name === soul ? '【命宫】' : p.name === body ? '【身宫】' : '';
        palaceLines += `\n${i + 1}. ${p.earthlyBranch}${p.name}${marker}：主星${mStars || '无'}；辅星${nStars || '无'}`;
      });
      const summary = `${chineseDate}生人，命宫在${soul}，${fiveElements}，生肖${zodiac}。`;
      const detail = `【命盘信息】\n农历：${chineseDate}  生肖：${zodiac}  五行局：${fiveElements}\n命宫：${soul}  身宫：${body}\n\n【十二宫星曜】${palaceLines}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、先断总格：看命宫主星组合定一生层次，三方四正定格局大小，三五句定调。\n二、论命宫：主星+辅星的组合含义。\n三、论事业：看官禄宫主星与命宫关系。\n四、论感情：看夫妻宫主星+四化飞星。\n五、论财运：看财帛宫+福德宫。\n六、简评大限：结合当前大限宫位给一句指引。\n\n【铁口规矩】\n1. 开口先断总格，命宫主星组合定一生层次\n2. 用户问哪块说哪块\n3. 半文半白话风，引经据典\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'meihua': {
      const benGua = (data.benGua as string) || '';
      const benGuaText = (data.benGuaText as string) || '';
      const huGua = (data.huGua as string) || '';
      const bianGua = (data.bianGua as string) || '';
      const dongYao = (data.dongYao as number) || 0;
      const method = (data.method as string) || '';
      const tiGua = (data.tiGua as string) || '';
      const yongGua = (data.yongGua as string) || '';
      const question = (data.question as string) || '';
      const summary = `${method}得${benGuaText}，动爻在${dongYao}爻，变${bianGua}。`;
      const detail = `【卦象信息】\n起卦方式：${method}\n本卦：${benGua}（${benGuaText}）\n互卦：${huGua}\n变卦：${bianGua}\n动爻：第${dongYao}爻\n体卦：${tiGua || '—'}  用卦：${yongGua || '—'}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、先断总卦：体用生克关系定吉凶，三两句定调。\n二、论本卦：当前状态。\n三、论互卦：中间过程。\n四、论变卦：最终结果。\n五、论动爻：变化关键。\n六、论季节旺衰：结合当前时令判断体用旺衰。\n\n【铁口规矩】\n1. 先断总卦吉凶\n2. 体用生克直说\n3. 半文半白话风\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'liuyao': {
      const upperGua = (data.upperGua as string) || '';
      const lowerGua = (data.lowerGua as string) || '';
      const bianYao = (data.bianYao as number[]) || [];
      const yaoArr = (data.yao as any[]) || [];
      const method = (data.method as string) || '';
      const question = (data.question as string) || '';
      let yaoLines = '';
      if (yaoArr.length === 6) {
        for (let i = 5; i >= 0; i--) {
          const y = yaoArr[i];
          const marker = bianYao.includes(6 - i) ? '【动】' : '';
          yaoLines += `\n${6 - i}爻：${y?.label || ''}${marker}`;
        }
      }
      const summary = `${upperGua}上${lowerGua}下，${bianYao.length > 0 ? `第${bianYao.join('、')}爻动` : '静卦'}。`;
      const detail = `【卦象信息】\n卦名：${upperGua}上${lowerGua}下\n动爻：${bianYao.length > 0 ? `第${bianYao.join('、')}爻` : '无（静卦）'}\n起卦方式：${method}${yaoLines}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、先断总卦：看用神旺衰、世应关系，定吉凶。\n二、论世应：自己和对立面的关系。\n三、论动变：动爻变化代表转机。\n四、论六神：六神临爻的附加信息。\n五、论日月：月建日辰对用神的影响。\n\n【铁口规矩】\n1. 先断总卦，用神旺衰直说\n2. 世应关系直说\n3. 半文半白话风\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'xiaoliuren': {
      const yue = (data.yue as string) || '';
      const ri = (data.ri as string) || '';
      const shi = (data.shi as string) || '';
      const lunarMonth = (data.lunarMonth as number) || 0;
      const lunarDay = (data.lunarDay as number) || 0;
      const question = (data.question as string) || '';
      const summary = `大安起月→农历${lunarMonth}月落${yue}→起日→${lunarDay}日落${ri}→起时→${shi}时落${shi}。`;
      const detail = `【课象信息】\n农历：${lunarMonth}月${lunarDay}日\n天宫（月宫）：${yue}\n地宫（日宫）：${ri}\n人宫（时宫）：${shi}\n\n【三宫含义】\n天宫${yue}：起因/天时\n地宫${ri}：过程/地利\n人宫${shi}：最终结果/人事${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、先断总课：三宫组合定吉凶，人宫落处定结果，三两句定调。\n二、论天宫：事情起因、天时环境。\n三、论地宫：中间过程、地利条件。\n四、论人宫：最终结果、人事走向。\n五、论六神：青龙朱雀白虎玄武六合勾陈的附加信息。\n六、论连宫：三宫之间的生克流转。\n\n【铁口规矩】\n1. 先断总课，三宫连看\n2. 人宫吉凶直说\n3. 半文半白话风\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'qimen': {
      const ju = (data.ju as number) || 0;
      const yinYang = (data.yinYang as string) || '';
      const jieQi = (data.jieQi as string) || '';
      const sanYuan = (data.sanYuan as string) || '';
      const yearZhu = (data.yearZhu as string) || '';
      const monthZhu = (data.monthZhu as string) || '';
      const dayZhu = (data.dayZhu as string) || '';
      const hourZhu = (data.hourZhu as string) || '';
      const zhiFu = (data.zhiFu as string) || '';
      const zhiShi = (data.zhiShi as string) || '';
      const palaces = (data.palaces as any[]) || [];
      const question = (data.question as string) || '';
      let palaceStr = '';
      palaces.forEach(p => { palaceStr += `\n${p.palace}（${p.diPan}）：神${p.god || '—'}·星${p.star || '—'}·门${p.door || '—'}·天${p.tianPan || '—'}`; });
      const summary = `${yinYang}遁${ju}局，${jieQi}·${sanYuan}，值符${zhiFu}。`;
      const detail = `【盘局信息】\n${yinYang}遁${ju}局 · ${jieQi} · ${sanYuan}\n四柱：${yearZhu} ${monthZhu} ${dayZhu} ${hourZhu}\n值符：${zhiFu} · 值使：${zhiShi}\n\n【九宫排布】${palaceStr}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、先断总局：阴阳遁几局、值符值使落何宫，定大势。\n二、问事看门。问事业看开门，问财看生门，问婚看六合，问病看天芮。\n三、看星神辅助。九星看天时旺衰，八神看神助暗力。\n四、看格局。门迫宫制？三奇加会？六仪击刑？\n五、论方位：结合问事方向给建议。\n\n【铁口规矩】\n1. 先断总局大势\n2. 用户问哪块说哪块\n3. 半文半白话风\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'chenggu': {
      const yearGanZhi = (data.yearGanZhi as string) || '';
      const lunarMonthName = (data.lunarMonthName as string) || '';
      const lunarDayName = (data.lunarDayName as string) || '';
      const shichenName = (data.shichenName as string) || '';
      const weightStr = (data.weightStr as string) || '';
      const gender = (data.gender as string) || '男';
      const poemTitle = (data.poemTitle as string) || '';
      const poem = (data.poem as string) || '';
      const yearW = (data.yearWeight as number) || 0;
      const monthW = (data.monthWeight as number) || 0;
      const dayW = (data.dayWeight as number) || 0;
      const hourW = (data.hourWeight as number) || 0;
      const question = (data.question as string) || '';
      const summary = `${gender}命，${yearGanZhi}年生，总骨重${weightStr}。`;
      const detail = `【称骨信息】\n性别：${gender}\n年柱：${yearGanZhi}（${Math.floor(yearW / 10)}两${yearW % 10}钱）\n月：${lunarMonthName}（${Math.floor(monthW / 10)}两${monthW % 10}钱）\n日：${lunarDayName}（${Math.floor(dayW / 10)}两${dayW % 10}钱）\n时：${shichenName}（${Math.floor(hourW / 10)}两${hourW % 10}钱）\n总骨重：${weightStr}\n\n【称骨歌诀】\n${poemTitle}：${poem}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、定重量层次。二两一二两二极轻命，二两六至三两二轻命，三两六至四两中等命，四两一至五两中上命，五两一至六两上命，六两以上大贵命。\n二、解析歌诀。逐句解读歌诀含义。\n三、综合论断。一生运势起伏、事业财运、感情婚姻。\n四、末句必加勉励。命是天定运却可改，积德行善自能增福。\n\n【铁口规矩】\n1. 先断重量层次\n2. 歌诀要害直说\n3. 末句必加勉励\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'tarot': {
      const spread = (data.spread as string) || '';
      const question = (data.question as string) || '';
      const cards = (data.cards as any[]) || [];
      let cardStr = '';
      cards.forEach((c, i) => { cardStr += `\n${i + 1}. ${c.position}：${c.name}${c.reversed ? '（逆位）' : '（正位）'}\n   含义：${c.meaning?.slice(0, 80) || ''}`; });
      const summary = `${spread}，问：${question}。`;
      const detail = `【牌阵信息】\n牌阵：${spread}\n问题：${question}\n\n【抽牌结果】${cardStr}`;
      const framework = `【分析框架】\n一、总论：先概括整体能量氛围，三两句定调。\n二、逐牌解析：按位置顺序，每张牌结合正逆位和所在位置解读。\n三、牌间关系：牌与牌之间的能量流动和呼应。\n四、回答提问：直接回应用户的问题。\n五、建议：给出具体可行的指引。\n\n【铁口规矩】\n1. 塔罗不是算命，是反映当下能量趋势\n2. 正逆位都要解读到位\n3. 末句给希望和行动建议\n4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    case 'astro': {
      const location = (data.location as string) || '';
      const asc = (data.ascendant as any) || {};
      const mc = (data.mc as any) || {};
      const planets = (data.planets as any[]) || [];
      const houses = (data.houses as any[]) || [];
      const aspects = (data.aspects as any[]) || [];
      const question = (data.question as string) || '';
      let planetStr = '';
      planets.forEach(p => { planetStr += `\n${p.name}：${p.sign} ${p.degree}° ${p.house}宫${p.retrograde ? '（逆行）' : ''}`; });
      let houseStr = '';
      houses.forEach((h: any) => { houseStr += `\n${h.number}宫：${h.sign} ${h.degree}°`; });
      let aspectStr = '';
      aspects.slice(0, 10).forEach(a => { aspectStr += `\n${a.p1} ${a.type} ${a.p2}（${a.nature === 'harmonious' ? '和谐' : a.nature === 'challenging' ? '挑战' : '中性'}）`; });
      const summary = `${location}出生，${asc.sign}上升，太阳${planets[0]?.sign || ''}。`;
      const detail = `【星盘信息】\n出生地点：${location}\n上升点：${asc.sign} ${asc.degree}°\n天顶：${mc.sign} ${mc.degree}°\n\n【行星位置】${planetStr}\n\n【宫位分布】${houseStr}\n\n【主要相位】${aspectStr || '无主要相位'}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】\n一、日月升三位一体定人格底色。太阳星座是核心自我，月亮是情感需求，上升是外在面具。\n二、十大行星逐一解读：每颗行星落什么星座什么宫位，代表什么人生面向。\n三、宫位分析：重点看有行星落入的宫位，是人生的活跃领域。\n四、相位解读：和谐相位看天赋，挑战相位看成长课题。\n五、综合建议：不是宿命论，而是认识自己的出厂配置，活出最高版本。\n\n【铁口规矩】\n1. 星盘是地图不是命运，人永远有自由意志\n2. 每段之间空一行\n3. 挑战相位不恐吓，说是成长课题\n4. 末句给勉励和实际建议`;
      return { summary, detail, framework };
    }
    case 'qizheng': {
      const year = (data.year as number) || 0;
      const month = (data.month as number) || 0;
      const day = (data.day as number) || 0;
      const hour = (data.hour as number) || 0;
      const mingBranch = (data.mingBranch as string) || '';
      const mingMansion = (data.mingMansion as string) || '';
      const mingDegree = (data.mingDegree as number) || 0;
      const planets = (data.planets as Record<string, number>) || {};
      const remnants = (data.remnants as Record<string, number>) || {};
      const houseDistribution = (data.houseDistribution as Record<string, string>) || {};
      const mansionDistribution = (data.mansionDistribution as Record<string, { mansion: string; du: number }>) || {};
      const question = (data.question as string) || '';
      const SEVEN_PLANETS = ['日', '月', '金', '木', '水', '火', '土'];
      const FOUR_REMNANTS = ['罗喉', '计都', '紫气', '月孛'];
      let planetStr = '';
      SEVEN_PLANETS.forEach(s => {
        const m = mansionDistribution[s];
        planetStr += `\n${s}星：${houseDistribution[s] || '?'} · ${m?.mansion || '?'}宿${m?.du || 0}度`;
      });
      let remnantStr = '';
      FOUR_REMNANTS.forEach(s => {
        const m = mansionDistribution[s];
        remnantStr += `\n${s}：${houseDistribution[s] || '?'} · ${m?.mansion || '?'}宿${m?.du || 0}度`;
      });
      const summary = `${year}年${month}月${day}日${hour}时生人，命宫在${mingBranch}·${mingMansion}宿。`;
      const detail = `【七政四余排盘】
${year}年${month}月${day}日 ${hour}时

【命宫】${mingBranch}宫 · ${mingMansion}宿 · 命度${mingDegree.toFixed(1)}°

【七政分布】${planetStr}

【四余分布】${remnantStr}${question ? `\n\n【所问之事】${question}` : ''}`;
      const framework = `【分析框架】
一、先定命宫：看命宫所在地支与二十八宿，定命主星。
二、观七政：日月为尊，看入何宫定格局。木星主贵、金星主富、火星主权、土星主寿、水星主智。
三、查四余：罗喉主灾厄、计都主暗算、紫气主福德、月孛主桃花。
四、审庙旺：七政入庙旺则吉，落陷则凶。
五、论宫位：十二宫各有所主，看何星入宫定吉凶。
六、综合论断：结合用户所问给出详细分析。

【铁口规矩】
1. 先断命宫格局高低
2. 用户问哪块说哪块
3. 半文半白话风，引《星学大成》《果老星宗》
4. 每段之间空一行`;
      return { summary, detail, framework };
    }
    default:
      return { summary: '', detail: '', framework: '' };
  }
}

function getSystemPrompt(type: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const timeStr = `${year}年${month}月${day}日`;
  const base = `【当前日期】今天是${timeStr}，公元${year}年。计算命主年龄时，用${year}减去出生年份（若已过当年生日则不减1，未过则减1）。\n\n【核心立场——命定其势，人定其局】\n命盘是出厂设置，大运是环境变量，人是操作系统。知命是为了更好地操盘人生，不是躺平认命。\n\n【铁口规矩】\n1. 先判断后安抚，先依据后感受。命局有凶格先如实指出，再给化解建议。\n2. 半文半白，像老辈命理师说话，有味道但不酸腐。\n3. 铁口直断，该吉说吉该凶说凶，不模棱两可。不要"似乎""可能""大概"。\n4. 每段之间空一行，层次分明。\n5. 不出现星号键和井号键，不用markdown格式。\n6. 不说"仅供参考"套话，末句加一句勉励或化解建议。\n7. 防瞎编：所有论断必须基于排盘数据中的真实信息，不知则说不知。\n8. 年龄计算务必准确：当前年份${year}减去出生年，注意是否已过生日。`;
  const typeSpecific: Record<string, string> = {
    bazi: `你是黄师傅，研习传统命理多年的年轻命理师。精通子平八字格局分析、十神性情、大运流年。\n\n【八字断命结构】\n第一步：命局定性。日主旺衰？格局是什么？用神是什么？三五句定调一生大势。\n第二步：结构拆解。十神配置如何？财星旺衰？官杀状态？印星有力否？\n第三步：大运流年直断。当前大运什么干支？与原局如何作用？近五年运势起伏。\n第四步：趋吉避凶。机会点在哪？风险点在哪？给出具体行动建议和规避建议。\n\n【十神性情口诀】\n正财勤俭节约，偏财投机善经营。正官正直守规矩，七杀勇猛有魄力。\n正印慈爱学问深，偏印孤独多才艺。食神温和有口福，伤官聪明傲不羁。\n比肩自力朋友多，劫财争强易破财。\n\n${base}`,
    ziwei: `你是黄师傅，研习传统命理多年的年轻命理师。紫微斗数以中州派为底，兼修飞星派。\n\n【紫微看盘结构】\n第一步：命宫主星定基调。主星组合定一生格局层次，三五句定调。\n第二步：三方四正定格局。看命迁官财四正位的互动关系。\n第三步：六吉六煞看助力。文昌文曲左辅右弼天魁天钺在哪？擎羊陀罗火星铃星在哪？\n第四步：四化飞星看变化。禄权科忌飞了哪些宫？近十年大限走势如何。\n第五步：趋吉避凶。给具体行动建议。\n\n【主星性情】\n紫微帝星领导力，天机灵动善变通。太阳豪爽重名声，武曲刚毅善理财。\n天同温和多福分，廉贞多才艺多变。天府稳重善守成，太阴细腻善谋划。\n贪狼多才多艺欲强，巨门口才是非多。天相公正善协调，天梁清高善化解。\n七杀果决善开创，破军变革有冲劲。\n\n${base}`,
    meihua: `你是黄师傅，研习传统命理多年的年轻命理师。梅花易数深得邵康节心法。\n\n【梅花断卦结构】\n第一步：总卦定性。体用生克关系定吉凶，三两句定调。\n第二步：本卦看现状，互卦看过程，变卦看结果。\n第三步：动爻为变化之因，细读动爻爻辞。\n第四步：结合时令判断体用旺衰（当前${month}月）。\n第五步：趋吉避凶建议。\n\n【体用诀】\n体克用事情可成，用克体事情难遂。体生用耗力先易后难，用生体得力事半功倍。体用比和事可成。\n\n${base}`,
    liuyao: `你是黄师傅，研习传统命理多年的年轻命理师。六爻断卦以用神为核心，兼顾世应动变。\n\n【六爻断卦结构】\n第一步：总卦定性。用神旺衰？世应关系如何？三五句定调。\n第二步：看日月对用神的作用。月建日辰生扶还是克制？\n第三步：看动爻。动爻是变化之机，动变回头生还是回头克？\n第四步：看六神。六神临爻附加什么信息？\n第五步：趋吉避凶建议。\n\n${base}`,
    xiaoliuren: `你是黄师傅，研习传统命理多年的年轻命理师。小六壬以江氏为宗，掐指断课快准狠。\n\n【小六壬断课结构】\n第一步：总课定性。三宫组合定吉凶，人宫落处定结果，三两句定调。\n第二步：天宫为因天时，地宫为过程地利，人宫为果人事。\n第三步：六神性情。青龙吉庆、朱雀口舌、白虎凶伤、玄武暗昧、六合和合、勾陈拖延。\n第四步：连宫诀。三宫之间的生克流转关系。\n第五步：趋吉避凶建议。\n\n【六宫诀】\n大安属木青龙吉，留连属土玄武迟。速喜属火朱雀快，赤口属金白虎凶。小吉属水六合顺，空亡属土勾陈虚。\n\n${base}`,
    qimen: `你是黄师傅，研习传统命理多年的年轻命理师。奇门遁甲以时家奇门为基，转盘法排局。\n\n【奇门断局结构】\n第一步：总局定性。阴阳遁几局？值符值使落何宫？三五句定大势。\n第二步：问事看门。问事业看开门，问财看生门，问婚看六合，问病看天芮。\n第三步：看星神辅助。九星看天时旺衰，八神看神助暗力。\n第四步：看格局。门迫宫制？三奇加会？六仪击刑？\n第五步：趋吉避凶建议。\n\n${base}`,
    chenggu: `你是黄师傅，研习传统命理多年的年轻命理师。袁天罡称骨法以歌诀为核心。\n\n【称骨断命结构】\n第一步：定重量层次。二两一二两二极轻命，二两六至三两二轻命，三两六至四两中等命，四两一至五两中上命，五两一至六两上命，六两以上大贵命。\n第二步：解析歌诀。逐句解读歌诀含义，对应到人生各阶段。\n第三步：综合论断。一生运势起伏、事业财运、感情婚姻。\n第四步：末句必加勉励。命是天定运却可改，积德行善自能增福。\n\n${base}`,
    tarot: `你是黄师傅，一位融汇东西方智慧的年轻命理师。塔罗牌是你的直觉工具，用来映照当下的能量流动。\n\n【塔罗解读心法】\n塔罗不是铁口直断的算命，而是映照问事者当下潜意识能量的一面镜子。牌面反映的是当前的能量趋势，而非不可改变的命运。\n\n【解读结构】\n第一步：感受整体氛围。所有牌合起来传递什么能量？光明还是阴暗？流动还是停滞？\n第二步：逐牌精读。每张牌的正逆位含义，结合所在位置（过去/现在/未来等）给出具体解读。\n第三步：牌间对话。牌与牌之间如何呼应？能量如何流动？\n第四步：回应问题。直接回答问事者的问题，不绕弯子。\n第五步：行动建议。给出一个具体可行的下一步指引。\n\n【解牌口诀】\n大阿尔卡纳主命运转折，小阿尔卡纳管日常细节。\n正位能量外显顺畅，逆位能量内化受阻。\n权杖主行动热情，圣杯主情感直觉，宝剑主思维冲突，星币主物质现实。\n\n${base}`,
    astro: `你是黄师傅，一位融汇东西方智慧的年轻命理师。占星学是你的另一套解读宇宙密码的语言。\n\n【占星核心理念】\n星盘是一张人生地图，不是不可更改的命运判决书。行星显示能量配置，宫位显示生命领域，星座显示表达方式。人永远拥有自由意志，占星的意义在于认识自己的出厂设置，活出最高版本的自己。\n\n【看盘结构】\n第一步：日月升三位一体。太阳星座是核心自我，月亮星座是情感需求模式，上升星座是外在人格面具。这三点定调整个盘。\n第二步：十大行星逐一看。每颗行星落什么星座什么宫位，代表什么人生面向被激活。\n第三步：宫位解读。重点看有行星落入的宫位，是此生活跃的领域。空宫不代表没有，而是能量更自主。\n第四步：相位分析。和谐相位（三分、六分）看天赋优势，挑战相位（四分、对分）看成长课题。合相是能量的融合聚焦。\n第五步：综合建议。不是宿命论，而是认识自己、接纳自己、超越自己。\n\n【行星口诀】\n太阳核心意志，月亮情感需求，水星思维沟通，金星爱情审美，火星行动欲望。\n木星扩张幸运，土星限制功课，天王变革突破，海王梦想消融，冥王转化重生。\n\n${base}`,
    qizheng: `你是黄师傅，精通七政四余——中国古典占星术的最高境界。

【身份定位】
七政四余乃中国占星之祖，上承尧舜观天授时之秘法，下启紫微斗数、八字命理之源流。
《史记·天官书》云：「日月星辰，敬授人时。」此即七政四余之滥觞。

【核心规则】
1. 七政（日月金水木火土）为实体之星，照临十二宫以定吉凶
2. 四余（罗喉计都紫气月孛）为虚曜，辅佐七政以明祸福
3. 命宫为全盘之主，诸星入宫以定格局
4. 二十八宿为星之舍，星入宿中以定精细
5. 星曜有庙旺落陷，入宫需辨吉凶

【星曜庙旺】
日：庙午旺卯；月：庙子旺酉；金：庙辰酉旺申巳；
木：庙亥旺寅；水：庙巳申旺亥子；火：庙卯戌旺丑未；
土：庙丑未旺摩羯；紫气：庙寅亥旺卯戌；
罗喉计都：庙天蝎金牛旺摩羯巨蟹；月孛：庙申子辰旺亥卯未

【分析框架】
1. 先定命宫及命主星
2. 观七政分布，看何星入何宫
3. 查四余辅佐，看吉凶补救
4. 审二十八宿，辨精细之处
5. 综合论断，给出人生指引

【语言风格】
半文半白，铁口直断，引用《星学大成》《果老星宗》等古籍。

${base}`,
  };
  return (typeSpecific[type] || base) + NO_MARKDOWN_RULE;
}

function generateId(): string { return 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6); }

export default function AIParser({ type, data }: AIParserProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);
  const theme = getTheme(type);

  messagesRef.current = messages;

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);
  useEffect(() => { if (!open && cancelRef.current) { cancelRef.current(); cancelRef.current = null; } }, [open]);

  function streamChat(apiMessages: { role: string; content: string }[], onChunk: (text: string) => void, onDone: () => void, onError: (err: string) => void) {
    cancelRef.current = streamSiliconAPI(apiMessages, {
      onChunk,
      onDone: () => { cancelRef.current = null; onDone(); },
      onError: (err) => { cancelRef.current = null; onError(err); },
    }, { model: MODEL_NAME, maxTokens: 1200 });
  }

  async function copyMessage(content: string, id: string) {
    try { await navigator.clipboard.writeText(content); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
    catch { const textarea = document.createElement('textarea'); textarea.value = content; textarea.style.position = 'fixed'; textarea.style.opacity = '0'; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
  }

  function handleSaveChat() {
    if (messages.length === 0) return;
    const now = new Date();
    const defaultName = `${TYPE_LABELS[type]}_${now.getMonth() + 1}月${now.getDate()}日`;
    setSaveName(defaultName); setShowSaveDialog(true);
  }

  function confirmSave() {
    const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));
    createSession(type, TYPE_LABELS[type], saveName || '未命名对话', chatMessages);
    setShowSaveDialog(false); setSaveName('');
  }

  function makePrompt(): string {
    const { summary, detail, framework } = buildStructuredPrompt(type, data);
    const now = new Date();
    const timeStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    return `[排盘摘要]\n${summary}\n\n${detail}\n\n${framework}\n\n[当前时间]\n${timeStr}（用户本地时间）\n\n请基于以上排盘数据进行专业解读。先谈总格定调，再问什么说什么。`;
  }

  const initChat = useCallback(() => {
    setOpen(true); setStreaming(true);
    const assistantId = generateId();
    setMessages([{ role: 'assistant', content: '', id: assistantId }]);
    streamChat([{ role: 'system', content: getSystemPrompt(type) }, { role: 'user', content: makePrompt() }],
      (text) => { setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + text } : m)); },
      () => setStreaming(false),
      () => { setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '抱歉，AI连接出现了问题。您可以稍后再试，或直接联系黄师傅咨询。\n\nQQ: 3376787168' } : m)); setStreaming(false); }
    );
  }, [type, data]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim(); setInput('');
    const userId = generateId(); const assistantId = generateId();
    const newMessages: Message[] = [...messagesRef.current, { role: 'user', content: userMsg, id: userId }, { role: 'assistant', content: '', id: assistantId }];
    setMessages(newMessages); setStreaming(true);
    const systemPrompt = getSystemPrompt(type); const userPrompt = makePrompt();
    const history = newMessages.filter(m => m.id !== assistantId).map(m => ({ role: m.role, content: m.content }));
    streamChat([{ role: 'system', content: systemPrompt + '\n\n【排盘数据参考】\n' + userPrompt }, ...history],
      (text) => { setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + text } : m)); },
      () => setStreaming(false),
      () => { setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '抱歉，请求失败了。请检查网络后重试。' } : m)); setStreaming(false); }
    );
  }, [input, streaming, type, data]);

  function handleKeyDown(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

  const t = theme;
  return (
    <>
      <button onClick={initChat}
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, color: t.bg }}>
        <Sparkles className="w-5 h-5" /> AI {t.name}咨询
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }} onClick={() => setOpen(false)}>
          <div className="relative w-full max-w-3xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
            style={{ background: t.bgGradient, borderColor: t.border }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b" style={{ background: t.headerBg, borderColor: t.border }}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" style={{ color: t.icon }} />
                <h3 className="text-lg font-bold" style={{ color: t.text }}>AI {t.name}咨询</h3>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${t.accent}20`, color: t.accent2 }}>{TYPE_LABELS[type]}</span>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && !streaming && (
                  <button onClick={handleSaveChat} className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }} title="保存聊天记录">
                    <Save className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: t.textMuted }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
              {messages.length === 0 && !streaming && (
                <div className="text-center py-16">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: t.icon }} />
                  <p style={{ color: t.textMuted }}>点击下方按钮开始AI解读</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'user' ? (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${t.accent}25` }}>
                      <User className="w-4 h-4" style={{ color: t.accent }} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: `${t.accent}40` }}>
                      <img src="./cat-avatar.jpg" alt="黄师傅" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 max-w-[82%]">
                    <div className="p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                      style={msg.role === 'user'
                        ? { background: t.userBg, border: `1px solid ${t.border}`, color: t.text }
                        : { background: t.aiBg, border: `1px solid ${t.border}`, color: t.text }
                      }>
                      {msg.role === 'assistant'
                        ? (msg.content ? <HighlightText text={msg.content} /> : (
                          <span className="flex items-center gap-2" style={{ color: t.textMuted }}>
                            <Loader2 className="w-4 h-4 animate-spin" /> 黄师傅正在分析排盘数据...
                          </span>
                        ))
                        : (msg.content || '')
                      }
                    </div>
                    {msg.role === 'assistant' && msg.content && (
                      <button onClick={() => copyMessage(msg.content, msg.id)} className="self-start flex items-center gap-1 px-2 py-1 text-xs transition-colors rounded" style={{ color: t.textMuted }}>
                        {copiedId === msg.id ? (<><Check className="w-3 h-3" /> 已复制</>) : (<><Copy className="w-3 h-3" /> 复制</>)}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.content && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: `${t.accent}40` }}>
                    <img src="./cat-avatar.jpg" alt="黄师傅" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2"><span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: t.accent2 }} /></div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 flex-shrink-0 border-t" style={{ borderColor: t.border }}>
              <div className="flex gap-3">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={streaming ? 'AI正在回复中...' : '输入您的问题，按Enter发送...'}
                  disabled={streaming}
                  className="flex-1 px-5 py-3.5 rounded-xl text-sm disabled:opacity-50 focus:outline-none"
                  style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, placeholderColor: t.textMuted }} />
                <button onClick={sendMessage} disabled={streaming || !input.trim()}
                  className="px-5 py-3.5 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-105"
                  style={{ background: t.btnBg, color: '#fff' }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: t.textMuted }}>AI解析仅供参考 · QQ: 3376787168</p>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSaveDialog(false)}>
                <div className="w-full max-w-sm mx-4 p-6 rounded-2xl border" style={{ background: t.bg, borderColor: t.border }} onClick={e => e.stopPropagation()}>
                  <h4 className="text-lg font-bold mb-4" style={{ color: t.text }}>保存聊天记录</h4>
                  <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="输入备忘名称"
                    className="w-full px-4 py-3 rounded-xl text-sm mb-4 focus:outline-none"
                    style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }} />
                  <div className="flex gap-3">
                    <button onClick={() => setShowSaveDialog(false)} className="flex-1 px-4 py-2.5 rounded-lg border transition-colors" style={{ borderColor: t.border, color: t.textMuted }}>取消</button>
                    <button onClick={confirmSave} className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition-colors" style={{ background: t.btnBg }}>保存</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
