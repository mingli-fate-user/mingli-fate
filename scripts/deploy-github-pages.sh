#!/bin/bash
set -e

echo "=== 部署到 GitHub Pages ==="

# 确保有dist目录
if [ ! -d "dist" ]; then
  echo "错误: dist目录不存在，请先运行 npm run build"
  exit 1
fi

# 创建临时目录
TMP_DIR=$(mktemp -d)
cp -r dist/* "$TMP_DIR/"

# 排除大文件（PDF、大图片）- 网页不需要这些
rm -f "$TMP_DIR/books/liuyao/nihaixia-64-guapu.pdf"
rm -f "$TMP_DIR/books/covers/nihaixia-64-guapu.png"
# 保留空目录结构
mkdir -p "$TMP_DIR/books/liuyao" "$TMP_DIR/books/covers"
touch "$TMP_DIR/books/.gitkeep"

echo "文件大小优化后:"
du -sh "$TMP_DIR/"

# 在临时目录中初始化git并推送到gh-pages分支
cd "$TMP_DIR"
git init
git checkout -b gh-pages
git add .
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 强制推送到gh-pages分支（token从环境变量读取）
GITHUB_TOKEN="${GITHUB_TOKEN:?需要设置GITHUB_TOKEN环境变量}"
git push -f "https://mingli-fate-user:${GITHUB_TOKEN}@github.com/mingli-fate-user/mingli-fate.git" gh-pages

echo "=== 部署完成 ==="
echo "访问地址: https://mingli-fate-user.github.io/mingli-fate/"

# 清理
cd -
rm -rf "$TMP_DIR"
