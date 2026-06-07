# 一键部署到 Render

## 方式一：Render Blueprint（推荐）

1. 打开 https://dashboard.render.com/blueprints
2. 点击 **New Blueprint Instance**
3. 连接你的 GitHub 账号，选择 `mingli-fate-user/mingli-fullstack`
4. Render 会自动读取 `render.yaml` 并创建：
   - Web Service（后端API）
   - PostgreSQL 数据库
   - 静态站点（前端）
5. 等待部署完成（约5分钟）

## 方式二：手动部署

### 步骤1：创建 PostgreSQL 数据库
1. 打开 https://dashboard.render.com/new/database
2. 选择 PostgreSQL，免费套餐
3. 命名：`mingli-db`
4. 创建后复制 **Internal Database URL**

### 步骤2：创建 Web Service
1. 打开 https://dashboard.render.com/new/web-service
2. 连接 GitHub 仓库 `mingli-fate-user/mingli-fullstack`
3. 配置：
   - **Name**: mingli-backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. 环境变量：
   - `DATABASE_URL`: 粘贴刚才复制的数据库URL
   - `JWT_SECRET`: 随便设置一个长字符串（如 `mingli-secret-2024`）
5. 点击 **Create Web Service**

### 步骤3：更新前端API地址
部署完成后，Render 会给一个域名（如 `https://mingli-backend.onrender.com`）。

在 GitHub 仓库中修改 `src/config.ts`：
```typescript
export const API_BASE_URL = "https://你的-render-域名.onrender.com";
```

然后重新构建部署前端。

## 方式三：Docker 本地运行

如果你有服务器或本地机器：

```bash
# 克隆代码
git clone https://github.com/mingli-fate-user/mingli-fullstack.git
cd mingli-fullstack

# 启动（需要 Docker）
docker-compose up -d

# 访问 http://localhost:3000
```
