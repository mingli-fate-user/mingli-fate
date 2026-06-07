// API 配置
// GitHub Pages 部署时，需要把这里改成你的后端地址
// 例如："https://mingli-backend.onrender.com"
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// tRPC endpoint
export const TRPC_URL = API_BASE_URL
  ? `${API_BASE_URL}/api/trpc`
  : "/api/trpc";
