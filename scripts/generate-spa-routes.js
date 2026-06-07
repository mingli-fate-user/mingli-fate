// 为SPA生成静态路由目录
// 复制 index.html 到每个路由对应的目录中

import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html 不存在，请先构建');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf-8');

// 所有需要生成的路由路径
const routes = [
  'tools',
  'tools/bazi',
  'tools/ziwei',
  'tools/meihua',
  'tools/liuyao',
  'tools/xiaoliuren',
  'tools/qimen',
  'tools/chenggu',
  'tools/jinqiangua',
  'tools/mianxiang',
  'tools/tarot',
  'tools/astro',
  'tools/taiyi',
  'tools/fengshui',
  'tools/xuankong',
  'tools/daliuren',
  'tools/qimendifa',
  'about',
  'contact',
  'study',
  'bookshelf',
  'login',
  'me',
  'community',
  'community/new',
  'community/post',
  'community/profile',
  'face',
  'ziwei',
  'liuyao',
  'xiaoliuren',
  'culture',
];

for (const route of routes) {
  const dir = path.join(distDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), indexContent);
  console.log(`  Generated: ${route}/index.html`);
}

console.log(`\nGenerated ${routes.length} route directories.`);
