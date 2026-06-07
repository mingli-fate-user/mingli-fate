# 多阶段构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./
RUN npm install

# 复制源码并构建
COPY . .
RUN npm run build

# 生产环境
FROM node:20-alpine

WORKDIR /app

# 只复制生产需要的文件
COPY package.json package-lock.json* ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/db ./db
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.server.json ./

# 数据库迁移脚本
COPY --from=builder /app/db/seed.ts ./db/

EXPOSE 3000

CMD ["npm", "start"]
