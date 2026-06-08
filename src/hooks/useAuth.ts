import { useState, useCallback, useMemo, useEffect } from "react";

// 本地用户存储
const USERS_KEY = "mingli_users";
const AUTH_TOKEN_KEY = "auth_token";
const CURRENT_USER_KEY = "current_user";

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char + 0x9e3779b9;
    hash |= 0;
  }
  return hash.toString(16) + "_" + password.length;
}

function getUsers(): Record<string, { passwordHash: string; nickname: string; createdAt: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, any>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function useAuth() {
  const [user, setUser] = useState<{ username: string; nickname: string } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (data: { username: string; password: string }) => {
    const users = getUsers();
    const u = users[data.username];
    if (!u) throw new Error("用户名不存在");
    if (u.passwordHash !== hashPassword(data.password)) throw new Error("密码错误");

    const userInfo = { username: data.username, nickname: u.nickname };
    localStorage.setItem(AUTH_TOKEN_KEY, "local_" + data.username);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
    return { token: "local_" + data.username };
  }, []);

  const register = useCallback(async (data: { username: string; password: string; nickname?: string }) => {
    const users = getUsers();
    if (users[data.username]) throw new Error("用户名已存在");

    users[data.username] = {
      passwordHash: hashPassword(data.password),
      nickname: data.nickname || data.username,
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);

    const userInfo = { username: data.username, nickname: data.nickname || data.username };
    localStorage.setItem(AUTH_TOKEN_KEY, "local_" + data.username);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo));
    setUser(userInfo);
    return { token: "local_" + data.username };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    window.location.reload();
  }, []);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refresh: () => {},
      token: localStorage.getItem(AUTH_TOKEN_KEY),
    }),
    [user, isLoading, login, register, logout]
  );
}
