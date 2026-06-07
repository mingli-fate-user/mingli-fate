# 黄师傅命理 APK 构建教程

## 方法一：GitHub Actions 自动构建（推荐，最简单）

### 第1步：创建GitHub仓库
1. 打开 https://github.com/new
2. 仓库名填 `mingli-fate`
3. 选择 "Public"（公开）
4. 点击 "Create repository"

### 第2步：推送代码
把网站代码推送到GitHub：

```bash
# 在项目目录下
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/mingli-fate.git
git push -u origin main
```

### 第3步：等待自动构建
推送后，GitHub Actions会自动开始构建APK：
1. 打开仓库页面 → 点击 "Actions" 标签
2. 等待构建完成（约3-5分钟）
3. 构建完成后，点击 "Releases" 标签
4. 下载最新的 `app-release.apk`

### 第4步：安装到手机
1. 把APK传到安卓手机
2. 设置 → 安全 → 允许"未知来源"安装
3. 点击APK文件安装
4. 主屏幕出现"黄师傅命理"图标

---

## 方法二：本地构建（需要电脑环境）

### 环境要求
- Node.js 20+
- Java JDK 17
- Android Studio（带SDK）

### 构建步骤

```bash
# 1. 安装依赖
npm install

# 2. 构建网站
npm run build

# 3. 同步Capacitor
npx cap sync android

# 4. 打开Android Studio
npx cap open android

# 5. 在Android Studio中点击 Build → Build Bundle(s) / APK(s) → Build APK(s)
# APK会生成在 android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 方法三：使用在线打包服务（最简单，不需要GitHub）

### 使用 GoNative.io
1. 打开 https://gonative.io
2. 输入你的网站地址
3. 上传图标（512x512）
4. 点击 "Create App"
5. 下载APK

### 使用 Website2APK
1. 打开 https://websitetoapk.com
2. 输入网站地址和基本信息
3. 上传图标
4. 生成并下载APK

---

## APK功能说明

- 支持所有七大排盘工具（八字、紫微、梅花、六爻、小六壬、奇门、称骨）
- 支持金钱卦摇卦
- 支持AI面相分析（拍照上传）
- 支持命理社区
- 支持学习区
- 支持个人中心
- 全屏运行，无浏览器地址栏
- 金色八卦图标
