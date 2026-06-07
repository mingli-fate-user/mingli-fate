// 复制文本到剪切板，然后尝试打开对应应用
export async function copyAndOpen(type: 'qq' | 'wechat', value: string): Promise<boolean> {
  // 1. 复制到剪切板
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  // 2. 尝试打开应用
  if (type === 'qq') {
    // QQ 唤起协议
    window.location.href = `tencent://message/?uin=${value}`;
    // 如果协议未唤起，3秒后尝试打开 QQ 网页版
    setTimeout(() => {
      window.open(`https://wpa.qq.com/msgrd?v=3&uin=${value}&site=qq&menu=yes`, '_blank');
    }, 3000);
  } else {
    // 微信没有通用的唤起协议，复制后提示用户
    // 尝试 weixin:// 协议（仅部分环境支持）
    window.location.href = 'weixin://';
  }

  return true;
}
