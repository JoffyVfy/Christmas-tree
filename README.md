 # Christmas-tree
一个像素旋转的圣诞树

这是一个用 React + TypeScript + Vite 实现的像素风格 3D 圣诞树演示。项目通过 Canvas 渲染体素（voxel）场景，包含可旋转的圣诞树、礼物和合成器产生的 8-bit 音频效果。仓库已被简化为最小可运行集，去除了会在前端暴露敏感 API key 的代码。

## 主要特性
- 像素风格的 3D 圣诞树（Canvas 渲染）
- 内置 8-bit 合成器播放简短旋律（Web Audio API）
- 使用 Vite 开发服务器，支持局域网访问（`host: 0.0.0.0`）

## 快速开始（本地开发）

前提：已安装 Node.js（推荐 LTS 版本）和 npm

1. 安装依赖：

```powershell
npm install
```

2. 启动开发服务器：

```powershell
npm run dev
```

3. 在浏览器打开：

- 本地: http://localhost:3000/
- 局域网: 使用 Vite 启动时输出的 Network 地址（例如 `http://192.168.x.y:3000/`）

停止服务器：在终端按 `Ctrl + C`。

## 项目结构（保留的最小文件）

- `index.html` — 页面模板与样式引入
- `index.tsx` — React 挂载入口
- `App.tsx` — 顶层组件（问候、配置、启动音频、渲染 PixelTree）
- `components/PixelTree.tsx` — 主要渲染逻辑（体素生成、渲染与雪花粒子）
- `services/audioService.ts` — Web Audio 合成器（播放音乐）
- `types.ts` — TypeScript 类型定义
- `vite.config.ts` — Vite 配置（端口、host、alias）
- `package.json` / `tsconfig.json` / `.gitignore` 等配置文件

> 注意：项目已移除或合并部分可选组件（如独立的 `Snow`、`StaticDecorations`）以保持仓库简洁，同时也移除了客户端直接调用外部 AI（Gemini）的实现以避免在前端暴露 API key。

## 部署

该项目可以构建为静态站点并部署到常见静态托管服务（Vercel、Netlify、GitHub Pages 等）。构建命令：

```powershell
npm run build
```

构建输出在 `dist/`（或由 Vite 配置指定），将其部署到你选择的静态托管平台即可。

## 数据流（详细）

下面按时间顺序描述从用户打开页面到渲染与音频输出的完整数据流，包括各模块的输入/输出和关键事件点：

1) 页面加载与 React 启动
	- 浏览器请求 `index.html`，Vite 在开发模式下返回 HTML。`index.html` 引入 `index.tsx`（ES 模块）。
	- `index.tsx` 创建 React 根并渲染 `<App />`。此时还没有启动动画或音频调度。

2) App 初始化与配置传递
	- `App.tsx` 读取初始配置（`TreeConfig`：rotationSpeed、pixelSize、showDecorations）。
	- `App` 将 `config` 通过 props 传给 `<PixelTree config={config} />`。
	- 同时 `App` 绑定若干用户交互事件（click、keydown、touchstart、mousedown），以便浏览器允许解锁音频上下文（多数浏览器在用户交互之前禁止自动播放）。

3) PixelTree 场景生成（同步）
	- 在组件挂载或 `config` 更改时，`PixelTree` 的 `useMemo` 负责生成体素（voxels）列表：
	  - 树（多层叶片、树干）、顶部星、底座（wood / gold）、若干礼物、糖果等。每个体素包含位置和颜色信息（`Voxel`）。
	  - 同时初始化雪花粒子（SnowFlake）数组，点位在球形区域内（使用拒绝采样保证球内均匀分布）。
	- 生成是内存数据结构的构建，完成后不会频繁重新创建（除非 `config` 或装饰显示状态改变）。

4) 渲染循环（每帧）
	- `PixelTree` 使用 `requestAnimationFrame` 启动渲染循环：
	  - 计算当前旋转角（由 `config.rotationSpeed` 驱动，且在每帧通过 setState 更新或闭包累加）。
	  - 对每个体素做 3D 旋转变换（如果体素非 static），进行相机投影（透视缩放）得到屏幕坐标与深度值。
	  - 将雪花粒子按物理规则更新位置（y 方向下降、围绕中心轻微摆动），并检测超出球体范围时重置到顶部区域。
	  - 把所有可见元素（体素 + 雪粒）收集到 `projected` 数组，按深度（r z 或投影深度）排序（Painter's algorithm），从远到近逐个绘制像素方块到 Canvas。
	  - 在绘制完成后（或在同一循环末尾）绘制玻璃球的高光 / 边缘等覆盖层。

5) 音频启动与调度
	- `audioService` 是一个在 `services/audioService.ts` 中实现的本地合成器：
	  - `App` 在挂载时尝试调用 `audioService.start()`，若浏览器要求用户交互则由事件监听触发实际启动。
	  - 启动后 `audioService` 创建或恢复 `AudioContext`，初始化调度器变量（currentNoteIndex、nextNoteTime 等），并进入定时调度循环（基于 `lookahead` 与 `scheduleAheadTime`）。
	  - 调度器会在合适的未来时间点用 Oscillator + Gain 创建音符（方波/三角波）并设置包络，随后 `osc.start()`/`osc.stop()`，实现 8-bit 风格音色。

6) 交互与状态变化
	- 用户可以通过 UI 修改 `config`（例如放大像素、切换装饰），`PixelTree` 会响应 props 变化：重新计算投影比例或在需要时重新生成部分体素。
	- 当页面失去焦点或组件卸载时，`audioService.stop()` 被调用以清理调度器和计时器；渲染循环被 `cancelAnimationFrame` 停止。

7) 错误处理与边界情况
	- 音频无法启动：多数情况下是因为未发生用户交互。`App` 已添加事件监听以在用户第一次交互时调用 `audioService.start()`。
	- 性能问题：体素数量过多会增加每帧的计算与绘制开销。应避免在渲染循环中频繁分配大数组，使用 `useMemo`、尽量绘制外壳而非实心体积以减少绘制次数。
	- 窗口大小变化：Canvas 尺寸在 `resize` 事件中同步更新，渲染会基于新的宽高重新计算中心点与缩放比。

8) 输入 / 输出清单（便于理解模块契约）
	- 输入：
	  - 用户浏览器（事件、交互）
	  - `TreeConfig`（来自 `App`）
	  - 窗口尺寸与设备像素比
	- 输出：
	  - Canvas 像素帧（视觉）
	  - 浏览器音频输出（8-bit 合成器）

## 贡献与许可

欢迎提交 issue 或 pull request。该仓库的代码遵循 MIT 许可（如需更改许可请与仓库所有者确认）。


