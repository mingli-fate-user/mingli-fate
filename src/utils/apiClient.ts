// 兼容浏览器的 API 调用工具
import { getApiKey } from './apiConfig';

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

/**
 * 获取密钥（带调试）
 */
function getKey(): string {
  try {
    const key = getApiKey();
    if (!key || key === 'undefined' || key === 'null' || key === '') {
      // 密钥为空，回退到默认
      return 'sk-exbzhkddusywrlknvkgdzcgjraluipqxhvquzeuwbyekdikl';
    }
    return key;
  } catch {
    return 'sk-exbzhkddusywrlknvkgdzcgjraluipqxhvquzeuwbyekdikl';
  }
}

// ==================== 非流式调用 ====================

export async function callSiliconAPIWithRetry(
  messages: { role: string; content: any }[],
  options?: { model?: string; maxTokens?: number; temperature?: number; retries?: number }
): Promise<string> {
  const model = options?.model || 'deepseek-ai/DeepSeek-V4-Flash';
  const maxTokens = options?.maxTokens || 2000;
  const temperature = options?.temperature || 0.7;
  const retries = options?.retries ?? 1;

  // 调试：显示正在使用的密钥前8位
  const key = getKey();
  console.log('[API]使用密钥:', key.slice(0, 8) + '...');

  let lastErr = '';

  for (let i = 0; i <= retries; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1500));

    // 尝试 fetch
    try {
      console.log(`[API]第${i + 1}次 fetch 尝试...`);
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`HTTP${resp.status}:${t.slice(0, 200)}`);
      }
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('返回为空');
      console.log('[API]fetch 成功!');
      return content;
    } catch (e1: any) {
      const msg1 = e1?.message || String(e1);
      console.warn(`[API]fetch失败:`, msg1);
      lastErr = msg1;
    }

    // 回退 XHR
    try {
      console.log(`[API]第${i + 1}次 XHR 回退...`);
      const result: string = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', API_URL, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', `Bearer ${key}`);
        xhr.timeout = 60000;
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const d = JSON.parse(xhr.responseText);
              const c = d.choices?.[0]?.message?.content;
              if (c) resolve(c);
              else reject('返回为空');
            } catch { reject('JSON解析失败'); }
          } else {
            reject(`HTTP${xhr.status}`);
          }
        };
        xhr.onerror = () => reject('XHR网络失败');
        xhr.ontimeout = () => reject('XHR超时');
        xhr.send(JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }));
      });
      console.log('[API]XHR 成功!');
      return result;
    } catch (e2: any) {
      const msg2 = e2?.message || String(e2);
      console.warn(`[API]XHR失败:`, msg2);
      lastErr = msg2;
    }
  }

  throw new Error(lastErr || '连接失败');
}

// ==================== 流式调用 ====================

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}

export function streamSiliconAPI(
  messages: { role: string; content: any }[],
  callbacks: StreamCallbacks,
  options: { model?: string; maxTokens?: number; temperature?: number } = {}
): () => void {
  const model = options.model || 'deepseek-ai/DeepSeek-V4-Flash';
  const maxTokens = options.maxTokens || 2000;
  const temperature = options.temperature || 0.7;
  let cancelled = false;

  const key = getKey();
  console.log('[API-STREAM]使用密钥:', key.slice(0, 8) + '...');

  // 启动 fetch 流式
  (async () => {
    try {
      console.log('[API-STREAM]fetch 流式尝试...');
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature, stream: true }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`HTTP${resp.status}`);
      }
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('无body');
      const decoder = new TextDecoder();
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.trim() || !line.startsWith('data:')) continue;
          const s = line.slice(5).trim();
          if (s === '[DONE]') { if (!cancelled) callbacks.onDone(); return; }
          try { const j = JSON.parse(s); const d = j.choices?.[0]?.delta?.content || ''; if (d) callbacks.onChunk(d); }
          catch { /* */ }
        }
      }
      if (!cancelled) callbacks.onDone();
    } catch (e: any) {
      console.warn('[API-STREAM]fetch流式失败:', e?.message);
      if (!cancelled) fallbackXHR();
    }
  })();

  // XHR 回退（非流式模拟）
  function fallbackXHR() {
    if (cancelled) return;
    console.log('[API-STREAM]XHR 回退...');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', API_URL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${key}`);
    xhr.timeout = 60000;
    xhr.onload = () => {
      if (cancelled) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const d = JSON.parse(xhr.responseText);
          const text = d.choices?.[0]?.message?.content || '';
          if (text) {
            let i = 0;
            function next() {
              if (cancelled) return;
              if (i >= text.length) { callbacks.onDone(); return; }
              callbacks.onChunk(text.slice(i, i + 4));
              i += 4;
              setTimeout(next, 15);
            }
            next();
          } else { callbacks.onError('返回为空'); }
        } catch { callbacks.onError('解析失败'); }
      } else { callbacks.onError(`HTTP${xhr.status}`); }
    };
    xhr.onerror = () => { if (!cancelled) callbacks.onError('网络失败'); };
    xhr.ontimeout = () => { if (!cancelled) callbacks.onError('请求超时'); };
    xhr.send(JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }));
  }

  return () => { cancelled = true; };
}
