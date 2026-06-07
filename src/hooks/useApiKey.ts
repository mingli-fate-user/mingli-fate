import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { trpc } from '@/providers/trpc';

// 黄师傅的默认API密钥
const DEFAULT_API_KEY = 'sk-exbzhkddusywrlknvkgdzcgjraluipqxhvquzeuwbyekdikl';

export function useApiKey() {
  const { token } = useAuth();
  const [effectiveKey, setEffectiveKey] = useState(DEFAULT_API_KEY);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [keyPrefix, setKeyPrefix] = useState('');

  const myKeyQuery = trpc.apiKey.myKey.useQuery(
    { token: token || '' },
    { enabled: !!token }
  );

  useEffect(() => {
    if (myKeyQuery.data?.hasKey) {
      setHasCustomKey(true);
      setKeyPrefix(myKeyQuery.data.prefix);
    } else {
      setHasCustomKey(false);
      setKeyPrefix('');
    }
  }, [myKeyQuery.data]);

  // 获取实际使用的API密钥
  const getApiKey = async (): Promise<string> => {
    if (hasCustomKey && token) {
      // 用户的密钥在后端，需要特殊处理
      // 实际调用时通过后端转发，这里先返回默认key
      // 后续通过后端API来调用AI
      return DEFAULT_API_KEY;
    }
    return DEFAULT_API_KEY;
  };

  return {
    effectiveKey,
    hasCustomKey,
    keyPrefix,
    isLoading: myKeyQuery.isLoading,
    refetch: myKeyQuery.refetch,
    getApiKey,
    defaultKey: DEFAULT_API_KEY,
  };
}
