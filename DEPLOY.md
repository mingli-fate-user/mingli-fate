# 后端部署指南

## 问题
GitHub Pages 只支持静态文件托管，无法运行后端 API 服务器。
登录/注册等所有后端功能需要一个支持 Node.js 运行时的平台。

## 推荐部署平台

### 选项1：Railway（推荐，最简单）
1. 打开 https://railway.app
2. 用 GitHub 登录
3. 新建项目 → 从 GitHub 导入 `mingli-v1-final` 仓库
4. 添加 PostgreSQL 数据库（New → Database → PostgreSQL）
5. 设置环境变量：`DATABASE_URL`（Railway 会自动提供）
6. 部署完成后，设置自定义域名

### 选项2：Render
1. 打开 https://render.com
2. 用 GitHub 登录
3. New Web Service → 选择你的仓库
4. 设置：
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. 添加 PostgreSQL 数据库
6. 设置环境变量

### 选项3：Vercel
1. 打开 https://vercel.com
2. 导入 GitHub 仓库
3. 添加 PostgreSQL（Vercel Postgres）
4. 设置环境变量
5. 自动部署

## 环境变量
部署时需要设置以下环境变量：
```
DATABASE_URL=postgresql://...
JWT_SECRET=你的密钥
```

## 前端配置
部署后端后，修改 `src/providers/trpc.tsx` 中的 API URL：
```typescript
url: "https://你的后端域名/api/trpc",
```

## 赞赏码
确保 `public/reward-qrcode.png` 存在，用于 AI解析设置页面的赞赏功能。
