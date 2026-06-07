import { useState, useCallback } from 'react';
import { Sparkles, Shuffle, RotateCcw, Info } from 'lucide-react';
import { SPREAD_TYPES, drawCards, type DrawnCard, type SpreadType } from '@/data/tarotData';
import AIParser from '@/components/AIParser';
import SaveRecordButton from '@/components/SaveRecordButton';

// 牌面颜色映射
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  major: { bg: 'from-purple-900/80 to-indigo-900/80', border: 'border-purple-500/50', text: 'text-purple-200', glow: 'shadow-purple-500/30' },
  wands: { bg: 'from-orange-900/80 to-red-900/80', border: 'border-orange-500/50', text: 'text-orange-200', glow: 'shadow-orange-500/30' },
  cups: { bg: 'from-blue-900/80 to-cyan-900/80', border: 'border-blue-500/50', text: 'text-blue-200', glow: 'shadow-blue-500/30' },
  swords: { bg: 'from-yellow-900/80 to-amber-900/80', border: 'border-yellow-500/50', text: 'text-yellow-200', glow: 'shadow-yellow-500/30' },
  pentacles: { bg: 'from-emerald-900/80 to-green-900/80', border: 'border-emerald-500/50', text: 'text-emerald-200', glow: 'shadow-emerald-500/30' },
};

const TYPE_NAMES: Record<string, string> = {
  major: '大阿尔卡纳', wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '星币',
};

export default function TarotTool() {
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>(SPREAD_TYPES[1]);
  const [question, setQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[] | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [showHelp, setShowHelp] = useState(false);

  // 洗牌动画
  const handleShuffle = useCallback(() => {
    setShuffling(true);
    setRevealedCards(new Set());
    setTimeout(() => {
      const cards = drawCards(selectedSpread.count, selectedSpread.positions);
      setDrawnCards(cards);
      setShuffling(false);
    }, 1500);
  }, [selectedSpread]);

  // 翻牌
  const handleReveal = useCallback((index: number) => {
    setRevealedCards(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // 全翻
  const handleRevealAll = useCallback(() => {
    if (!drawnCards) return;
    setRevealedCards(new Set(drawnCards.map((_, i) => i)));
  }, [drawnCards]);

  // 重置
  const handleReset = useCallback(() => {
    setDrawnCards(null);
    setRevealedCards(new Set());
    setQuestion('');
  }, []);

  // 准备AI数据
  const getAIData = useCallback(() => {
    if (!drawnCards) return {};
    return {
      spread: selectedSpread.name,
      question: question || '无特定问题',
      cards: drawnCards.map((d) => ({
        position: d.position,
        name: d.card.name,
        nameEn: d.card.nameEn,
        type: TYPE_NAMES[d.card.type],
        reversed: d.reversed,
        keywords: d.card.keywords,
        meaning: d.reversed ? d.card.reversed : d.card.upright,
      })),
    };
  }, [drawnCards, selectedSpread, question]);

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          塔罗牌占卜
          <button onClick={() => setShowHelp(!showHelp)} className="text-white/60 hover:text-blue-600 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </h2>
        <p className="text-sm text-white/60">韦特塔罗 · 78张牌 · 六种经典牌阵</p>
      </div>

      {/* 帮助说明 */}
      {showHelp && (
        <div className="bg-slate-50/80 border border-blue-300 rounded-lg p-4 text-sm text-white/75">
          <p className="font-medium text-blue-600 mb-2">塔罗牌使用指南</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>塔罗牌共78张，22张大阿尔卡纳代表重大人生课题，56张小阿尔卡纳反映日常生活</li>
            <li>选择牌阵后在心中默念你的问题，点击洗牌抽牌</li>
            <li>每张牌有正位和逆位两种解读，点击牌面即可翻牌查看</li>
            <li>抽完牌后可点击AI解析获得专业解读</li>
            <li>正位代表能量顺畅表达，逆位代表能量受阻或内在化</li>
          </ul>
        </div>
      )}

      {/* 牌阵选择 */}
      <div className="bg-slate-50/60 border border-slate-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-blue-600 mb-2">选择牌阵</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SPREAD_TYPES.map(spread => (
            <button
              key={spread.name}
              onClick={() => { setSelectedSpread(spread); setDrawnCards(null); setRevealedCards(new Set()); }}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedSpread.name === spread.name
                  ? 'border-purple-500/60 bg-purple-900/30 text-purple-200'
                  : 'border-slate-200 bg-black/50/50 text-white/60 hover:border-blue-300'
              }`}
            >
              <div className="text-sm font-medium">{spread.name}</div>
              <div className="text-xs opacity-70 mt-1">{spread.count}张牌 · {spread.description.slice(0, 20)}...</div>
            </button>
          ))}
        </div>
      </div>

      {/* 问题输入 */}
      <div className="bg-slate-50/60 border border-slate-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-blue-600 mb-2">你的问题（可选）</label>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="心中默念你的问题，例如：我近期的事业发展如何？"
          className="w-full bg-black/45 border border-slate-200 rounded-lg px-4 py-3 text-white placeholder:text-white/75 focus:border-blue-400 focus:outline-none"
        />
        <p className="text-xs text-white/75 mt-1">选填，有助于AI给出更精准的解读</p>
      </div>

      {/* 洗牌按钮 */}
      {!drawnCards && (
        <button
          onClick={handleShuffle}
          disabled={shuffling}
          className="w-full py-4 bg-gradient-to-r from-purple-800/80 to-indigo-800/80 border border-purple-500/40 rounded-lg text-purple-100 font-medium flex items-center justify-center gap-2 hover:from-purple-700/80 hover:to-indigo-700/80 transition-all disabled:opacity-50"
        >
          <Shuffle className={`w-5 h-5 ${shuffling ? 'animate-spin' : ''}`} />
          {shuffling ? '洗牌中...' : `开始${selectedSpread.name}占卜`}
        </button>
      )}

      {/* 洗牌动画 */}
      {shuffling && (
        <div className="flex justify-center py-8">
          <div className="relative w-32 h-48">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="absolute inset-0 rounded-xl border-2 border-purple-500/40 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center"
                style={{
                  animation: `shuffle${i} 0.5s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${(i - 2) * 5}deg)`,
                }}
              >
                <div className="text-4xl opacity-30">☽</div>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes shuffle0 { to { transform: translateX(-20px) rotate(-15deg); } }
            @keyframes shuffle1 { to { transform: translateX(-10px) rotate(-8deg); } }
            @keyframes shuffle2 { to { transform: translateX(0) rotate(0deg); } }
            @keyframes shuffle3 { to { transform: translateX(10px) rotate(8deg); } }
            @keyframes shuffle4 { to { transform: translateX(20px) rotate(15deg); } }
          `}</style>
        </div>
      )}

      {/* 抽牌结果 */}
      {drawnCards && !shuffling && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-blue-600">{selectedSpread.name}结果</h3>
            <div className="flex gap-2">
              <button onClick={handleRevealAll} className="px-3 py-1.5 text-xs bg-purple-600/80 border border-purple-400/50 rounded text-white font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/30">
                全部翻开
              </button>
              <button onClick={handleShuffle} className="px-3 py-1.5 text-xs bg-indigo-600/80 border border-indigo-400/50 rounded text-white font-medium hover:bg-indigo-500 transition-colors flex items-center gap-1 shadow-lg shadow-indigo-900/30">
                <Shuffle className="w-3 h-3" /> 重新洗牌
              </button>
              <button onClick={handleReset} className="px-3 py-1.5 text-xs bg-slate-600/80 border border-slate-400/50 rounded text-white font-medium hover:bg-slate-500 transition-colors flex items-center gap-1 shadow-lg shadow-slate-900/30">
                <RotateCcw className="w-3 h-3" /> 重置
              </button>
            </div>
          </div>

          {/* 牌阵展示 */}
          <div className={`grid gap-3 ${
            drawnCards.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' :
            drawnCards.length <= 5 ? 'grid-cols-2 sm:grid-cols-3' :
            drawnCards.length <= 6 ? 'grid-cols-2 sm:grid-cols-3' :
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          }`}>
            {drawnCards.map((drawn, index) => {
              const isRevealed = revealedCards.has(index);
              const colors = TYPE_COLORS[drawn.card.type];
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  {/* 位置标签 */}
                  <div className="text-xs text-blue-600 font-medium text-center">
                    {drawn.position}
                  </div>
                  {/* 牌面 */}
                  <button
                    onClick={() => handleReveal(index)}
                    className={`relative w-full aspect-[2/3] max-w-[180px] rounded-xl border-2 transition-all duration-500 cursor-pointer ${
                      isRevealed
                        ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg ${colors.glow}`
                        : 'bg-gradient-to-br from-indigo-950 to-purple-950 border-purple-500/30 hover:border-purple-400/50'
                    }`}
                    style={{
                      transform: isRevealed && drawn.reversed ? 'rotate(180deg)' : undefined,
                      perspective: '1000px',
                    }}
                  >
                    {!isRevealed ? (
                      /* 牌背 */
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                          <span className="text-2xl text-purple-400/50">☽</span>
                        </div>
                        <div className="absolute inset-2 border border-purple-500/20 rounded-lg" />
                        <div className="absolute bottom-3 text-xs text-purple-400/40">点击翻牌</div>
                      </div>
                    ) : (
                      /* 牌面 */
                      <div className="absolute inset-0 p-3 flex flex-col items-center justify-between text-center overflow-hidden">
                        <div className="text-xs opacity-60 text-white">{TYPE_NAMES[drawn.card.type]}</div>
                        <div className="space-y-1">
                          <div className="text-3xl font-bold text-white">{drawn.card.number}</div>
                          <div className={`text-sm font-medium ${colors.text}`}>{drawn.card.name}</div>
                          {drawn.reversed && (
                            <div className="text-xs text-red-400/80 bg-red-900/30 px-2 py-0.5 rounded">逆位</div>
                          )}
                        </div>
                        <div className="text-xs opacity-50 text-white/60">{drawn.card.keywords.slice(0, 3).join(' · ')}</div>
                      </div>
                    )}
                  </button>
                  {/* 牌名 */}
                  {isRevealed && (
                    <div className="text-center px-2">
                      <div className={`text-sm font-medium ${colors.text}`}>
                        {drawn.card.name}{drawn.reversed ? '（逆位）' : '（正位）'}
                      </div>
                      <div className="text-xs text-white/60 mt-1 line-clamp-3">
                        {drawn.reversed ? drawn.card.reversed.slice(0, 60) + '...' : drawn.card.upright.slice(0, 60) + '...'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 全部翻开后显示AI解析和保存 */}
          {revealedCards.size === drawnCards.length && (
            <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-200">
              <AIParser type="tarot" data={getAIData()} />
              <SaveRecordButton
                type="tarot"
                typeLabel={`塔罗-${selectedSpread.name}-${question.slice(0, 15) || '无问题'}`}
                data={getAIData()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
