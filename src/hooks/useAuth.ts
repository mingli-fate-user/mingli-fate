import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [localToken, setLocalToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );

  // 本地JWT登录
  const loginMutation = trpc.user.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      setLocalToken(data.token);
      // 刷新用户信息
      utils.user.me.invalidate();
    },
  });

  // 本地JWT注册
  const registerMutation = trpc.user.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      setLocalToken(data.token);
      utils.user.me.invalidate();
    },
  });

  // 获取当前用户信息（优先本地JWT）
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.user.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!localToken,
  });

  // OAuth登出
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const logout = useCallback(() => {
    // 清除本地token
    localStorage.removeItem("auth_token");
    setLocalToken(null);
    // 同时调用OAuth logout
    logoutMutation.mutate();
    // 刷新页面
    window.location.reload();
  }, [logoutMutation]);

  const login = useCallback(
    async (data: { username: string; password: string }) => {
      return loginMutation.mutateAsync(data);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: {
      username: string;
      password: string;
      nickname?: string;
    }) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user && !localToken) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, localToken, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user || !!localToken,
      isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
      error,
      login,
      register,
      logout,
      refresh: refetch,
      token: localToken,
    }),
    [
      user,
      isLoading,
      loginMutation.isPending,
      registerMutation.isPending,
      error,
      login,
      register,
      logout,
      refetch,
      localToken,
    ]
  );
}
