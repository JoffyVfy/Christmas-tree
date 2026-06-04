 # 🎄 Pixel Christmas Tree

> 一个像素风格的 3D 旋转圣诞树，使用 React + TypeScript + Vite 构建。

通过 Canvas 渲染体素（Voxel）场景，包含可旋转的圣诞树、礼物盒、糖果杖、雪花粒子，以及 Web Audio API 合成的 8-bit 风格圣诞旋律。

## ✨ 功能特性

- 🌲 **3D 体素圣诞树** — Canvas 渲染的多层树冠、树干，自动旋转动画
- ⭐ **3D 树顶星** — 位于圣诞树顶部的像素风星形装饰
- 🎁 **礼物盒 & 糖果** — 带丝带和蝴蝶结的多种礼物、糖果杖、棒棒糖
- ❄️ **雪花粒子系统** — 150 片雪花在玻璃球内缓缓飘落
- 🔊 **8-bit 合成器音乐** — 使用 Web Audio API 播放《Jingle Bells》旋律
- 🎮 **像素风 UI** — 复古像素字体 + 像素风格音频控制按钮
- 📱 **响应式布局** — 自适应窗口大小，支持高 DPI 屏幕
- 🌐 **局域网访问** — 开发服务器监听 `0.0.0.0`，可在手机/平板上预览

## 📂 项目结构

```
Christmas-tree/
├── index.html                  # HTML 入口（Tailwind CDN + 像素字体）
├── index.tsx                   # React 挂载入口
├── App.tsx                     # 顶层组件（问候语、配置、音频控制）
├── types.ts                    # TypeScript 类型定义
├── components/
│   ├── PixelTree.tsx           # 核心：体素场景生成 & 3D 渲染（含雪花粒子）
│   └── PixelAudioButton.tsx    # 像素风音频播放/暂停按钮（备用组件）
├── services/
│   └── audioService.ts         # Web Audio 合成器（Jingle Bells）
├── vite.config.ts              # Vite 配置（端口 3000）
├── tsconfig.json               # TypeScript 配置
└── package.json                # 项目依赖与脚本
```

## 🚀 快速开始

> 前提：已安装 [Node.js](https://nodejs.org/)（推荐 LTS 版本）和 npm

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后在浏览器打开：

| 访问方式 | 地址 |
|---------|------|
| 本地 | http://localhost:3000/ |
| 局域网 | 终端输出的 Network 地址（如 `http://192.168.x.y:3000/`） |

> 💡 **提示：** 点击页面任意位置或右下角按钮即可解锁音频播放（浏览器限制自动播放）。按 `Ctrl + C` 停止服务器。

### 3. 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 4. 预览生产构建

```bash
npm run preview
```

在本地预览构建后的静态站点效果。

## 🎮 操作说明

- **右下角像素按钮** — 点击播放 / 暂停 8-bit 圣诞音乐
- **自动旋转** — 圣诞树持续缓慢旋转，无需操作
- **窗口缩放** — 画面自动适配窗口大小

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript 5.8 | 类型安全 |
| Vite 6.2 | 构建工具 & 开发服务器 |
| Canvas API | 3D 体素渲染引擎 |
| Web Audio API | 8-bit 音频合成 |
| Tailwind CSS | 样式（CDN 引入） |

## 📦 部署

构建后可部署到任意静态托管平台：

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

只需将 `dist/` 目录的内容上传到对应平台即可。

## 📄 许可

MIT License


