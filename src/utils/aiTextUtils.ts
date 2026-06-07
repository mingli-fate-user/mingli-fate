// ============================================================
// AI 文本处理工具 - 清理 Markdown + 关键内容高亮
// ============================================================

/**
 * 清理 Markdown 格式字符（井号、星号等）
 */
export function cleanMarkdown(text: string): string {
  if (!text) return '';
  return text
    // 移除加粗 **text**
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    // 移除斜体 *text* (但保留中文中间的星号)
    .replace(/(?<![\u4e00-\u9fff])\*(?!\s)(.+?)(?<!\s)\*(?![\u4e00-\u9fff])/gs, '$1')
    // 移除标题 # text
    .replace(/^#{1,6}\s+/gm, '')
    // 移除剩余的头号
    .replace(/#/g, '')
    // 移除行首的 - 和 * 列表标记
    .replace(/^\s*[-*+]\s+/gm, '')
    // 移除水平线
    .replace(/^\s*---+\s*$/gm, '─'.repeat(20))
    // 移除反引号代码标记
    .replace(/`(.+?)`/gs, '$1')
    // 移除链接 [text](url)
    .replace(/\[(.+?)\]\(.+?\)/gs, '$1')
    // 清理多余空行（保留最多两个）
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/**
 * 检测关键高亮模式
 */
const HIGHLIGHT_PATTERNS = [
  // 步骤标记（第一步：、第1步：等）
  { regex: /^(第[一二三四五六七八九十\d]+步[：:])/, type: 'step' as const },
  // 总结/结论
  { regex: /^(总结[：:]|结论[：:]|总论[：:]|总评[：:]|综合分析[：:]|总体评价[：:])/, type: 'conclusion' as const },
  // 建议/化解
  { regex: /^(建议[：:]|趋吉避凶[：:]|化解[：:]|行动指引[：:]|改善方法[：:])/, type: 'advice' as const },
  // 吉凶判断（独立行或句首的大吉大凶等）
  { regex: /^(大吉$|大凶$|中吉$|小吉$|中凶$|小凶$|总体[为乃属][吉平凶])/, type: 'judgment' as const },
  // 重要提示
  { regex: /^(注意[：:]|重要提醒[：:]|切记[：:]|警示[：:]|切忌[：:])/, type: 'warning' as const },
  // 专业术语标题（特定关键词 + 冒号，整行较短才匹配）
  { regex: /^((?:卦象|爻辞|天机|人间|体用|世应|动爻|用神|十神|格局|大运|流年|命宫|夫妻|财帛|官禄|飞星|山盘|向盘|运盘|值符|值使|生门|三传|四课|十二宫|五行|纳音|三停|六府|气色|面型|面相|骨重|歌诀|总格|定性)[：:][^\n]{0,40})$/, type: 'heading' as const },
];

export const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  step: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
  conclusion: { bg: 'rgba(34,197,94,0.15)', text: '#6ee7b7', border: 'rgba(34,197,94,0.3)' },
  advice: { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', border: 'rgba(245,158,11,0.3)' },
  judgment: { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
  warning: { bg: 'rgba(249,115,22,0.15)', text: '#fdba74', border: 'rgba(249,115,22,0.3)' },
  heading: { bg: 'rgba(255,255,255,0.06)', text: '#e2e8f0', border: 'rgba(255,255,255,0.15)' },
};

/**
 * 将文本按高亮模式分割成段落
 */
export function splitIntoSegments(text: string): Array<{ text: string; type: string }> {
  if (!text) return [];
  const lines = text.split('\n');
  const segments: Array<{ text: string; type: string }> = [];
  let currentBuffer = '';

  for (const line of lines) {
    let matched = false;
    for (const pattern of HIGHLIGHT_PATTERNS) {
      if (pattern.regex.test(line)) {
        // 先保存缓冲区的内容
        if (currentBuffer.trim()) {
          segments.push({ text: currentBuffer.trim(), type: 'normal' });
          currentBuffer = '';
        }
        segments.push({ text: line.trim(), type: pattern.type });
        matched = true;
        break;
      }
    }
    if (!matched) {
      currentBuffer += line + '\n';
    }
  }

  if (currentBuffer.trim()) {
    segments.push({ text: currentBuffer.trim(), type: 'normal' });
  }

  return segments;
}

/**
 * 系统提示词中禁止 Markdown 的追加说明
 */
export const NO_MARKDOWN_RULE = `

【格式铁律 - 绝对禁止】
1. 严禁使用任何 Markdown 格式符号：
   - 禁止使用 #（井号/头号）作为标题标记
   - 禁止使用 *（星号）作为加粗或斜体标记
   - 禁止使用 \`（反引号）作为代码标记
   - 禁止使用 - 或 * 作为列表标记（直接用数字序号即可）
2. 所有文字必须是纯文本，不要加任何格式符号
3. 需要强调的内容可以直接说"注意："或"重要："来引出
4. 分层级使用"第一步：""第二步："这样的中文序号
5. 如果违反此规则，会被系统自动过滤，导致内容显示异常`;
