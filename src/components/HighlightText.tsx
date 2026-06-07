import { useMemo } from 'react';
import { splitIntoSegments, cleanMarkdown, TYPE_COLORS } from '@/utils/aiTextUtils';

interface HighlightTextProps {
  text: string;
  className?: string;
}

/**
 * 高亮渲染 AI 返回的文本
 * - 自动清理 Markdown（#、*等）
 * - 关键步骤/结论/建议等自动高亮
 * - 使用 useMemo 避免流式输出时频繁重新计算导致的闪烁
 */
export default function HighlightText({ text, className = '' }: HighlightTextProps) {
  if (!text) return null;

  // 使用 useMemo 缓存分段结果，避免每次渲染都重新计算
  // 依赖 text 内容，只有 text 真正变化时才重新分段
  const segments = useMemo(() => {
    const cleaned = cleanMarkdown(text);
    return splitIntoSegments(cleaned);
  }, [text]);

  if (segments.length <= 1) {
    // 没有需要高亮的段落，直接渲染
    return (
      <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
        {segments[0]?.text || text}
      </div>
    );
  }

  return (
    <div className={`space-y-0.5 leading-relaxed ${className}`}>
      {segments.map((seg, i) => {
        // 生成稳定的 key：基于内容和类型，避免纯索引导致闪烁
        const stableKey = `${seg.type}_${seg.text.slice(0, 20)}_${i}`;

        if (seg.type === 'normal') {
          return (
            <span
              key={stableKey}
              className="whitespace-pre-wrap text-white/80 block"
            >
              {seg.text}
            </span>
          );
        }

        const style = TYPE_COLORS[seg.type];
        return (
          <span
            key={stableKey}
            className="inline-block px-3 py-1 rounded-lg text-sm font-medium my-0.5 will-change-auto"
            style={{
              background: style?.bg || 'rgba(255,255,255,0.06)',
              color: style?.text || '#e2e8f0',
              borderLeft: `3px solid ${style?.border || 'rgba(255,255,255,0.2)'}`,
            }}
          >
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}
