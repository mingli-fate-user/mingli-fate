import { useState, useEffect, useCallback } from "react";

// 黄师傅的默认API密钥
const DEFAULT_API_KEY = "sk-exbzhkddusywrlknvkgdzcgjraluipqxhvquzeuwbyekdikl";
const USER_API_KEY = "user_api_key";
const CHOICE_KEY = "api_key_choice_made";

export function useApiKey() {
  const [userKey, setUserKeyState] = useState<string>(() => {
    try {
      const data = localStorage.getItem(USER_API_KEY);
      return data ? JSON.parse(data).key : "";
    } catch {
      return "";
    }
  });

  const [keyPrefix, setKeyPrefix] = useState("");

  // 检查用户是否已经做过API选择
  const [hasMadeChoice, setHasMadeChoice] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CHOICE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (userKey) {
      setKeyPrefix(userKey.slice(0, 8) + "..." + userKey.slice(-4));
    } else {
      setKeyPrefix("");
    }
  }, [userKey]);

  const hasCustomKey = !!userKey;

  // 获取实际使用的API密钥
  const getApiKey = useCallback((): string => {
    return userKey || DEFAULT_API_KEY;
  }, [userKey]);

  // 保存用户密钥
  const saveKey = useCallback((key: string) => {
    localStorage.setItem(USER_API_KEY, JSON.stringify({ key, savedAt: Date.now() }));
    setUserKeyState(key);
  }, []);

  // 删除用户密钥（切换回黄师傅的密钥）
  const deleteKey = useCallback(() => {
    localStorage.removeItem(USER_API_KEY);
    setUserKeyState("");
  }, []);

  // 标记已做选择
  const markChoiceMade = useCallback(() => {
    localStorage.setItem(CHOICE_KEY, "1");
    setHasMadeChoice(true);
  }, []);

  // 重置选择（用于调试或用户想重新选择）
  const resetChoice = useCallback(() => {
    localStorage.removeItem(CHOICE_KEY);
    setHasMadeChoice(false);
  }, []);

  // 测试密钥
  const testKey = useCallback(async (key: string): Promise<{ valid: boolean; message: string }> => {
    try {
      const resp = await fetch("https://api.siliconflow.cn/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (resp.ok) {
        return { valid: true, message: "API密钥验证成功" };
      } else {
        return { valid: false, message: "API密钥无效或已过期" };
      }
    } catch {
      return { valid: false, message: "网络错误，无法验证" };
    }
  }, []);

  return {
    userKey,
    hasCustomKey,
    hasMadeChoice,
    keyPrefix,
    getApiKey,
    saveKey,
    deleteKey,
    markChoiceMade,
    resetChoice,
    testKey,
    defaultKey: DEFAULT_API_KEY,
  };
}
