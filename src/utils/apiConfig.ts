// 共享 API 配置
// 优先使用用户自己设置的 API 密钥，否则使用黄师傅的默认密钥

const DEFAULT_API_KEY = 'sk-exbzhkddusywrlknvkgdzcgjraluipqxhvquzeuwbyekdikl';

export function getApiKey(): string {
  try {
    const data = localStorage.getItem('user_api_key');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.key) return parsed.key;
    }
  } catch {
    // ignore
  }
  return DEFAULT_API_KEY;
}

export const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
