import { useState } from 'react';
import { X, BookOpen, HelpCircle, Sparkles } from 'lucide-react';

interface IntroModalProps {
  title: string;
  what: string;
  history: string;
  how: string;
  color?: string;
}

export default function IntroModal({ title, what, history, how, color = '#fbbf24' }: IntroModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 介绍按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: `${color}15`,
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>介绍</span>
      </button>

      {/* 弹窗 */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border p-6 space-y-5"
            style={{
              background: 'linear-gradient(135deg, rgba(20,20,35,0.98), rgba(15,15,30,0.98))',
              borderColor: `${color}30`,
              boxShadow: `0 0 40px ${color}15`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* 标题 */}
            <div className="text-center space-y-1">
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Noto Serif SC', serif", color }}
              >
                {title}
              </h2>
              <div className="w-16 h-0.5 mx-auto rounded-full" style={{ background: `${color}50` }} />
            </div>

            {/* 什么是 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" style={{ color }} />
                <h3 className="text-base font-semibold text-white/90">什么是{title}</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed pl-6">{what}</p>
            </div>

            {/* 历史渊源 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color }} />
                <h3 className="text-base font-semibold text-white/90">历史渊源</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed pl-6">{history}</p>
            </div>

            {/* 如何使用 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color }} />
                <h3 className="text-base font-semibold text-white/90">如何使用</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed pl-6">{how}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
