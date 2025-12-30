# Changelog

所有重要变更将记录在此文件中。遵循“Keep a Changelog”风格，按版本与类别列出。

## [Unreleased] - 2025-12-30
### Added
- 在页面右下角增加播放/暂停控制按钮（UI：三角形 ▶ / 方形 ■），通过点击切换音乐播放状态并调用 `audioService.start()` / `audioService.stop()`。

### Removed
- 删除冗余代码。


## [0.1.0] - 2025-12-30
### Added
- 项目初始搭建：React + TypeScript + Vite。
- `components/PixelTree.tsx`：像素风体素树与雪花粒子渲染（Canvas）。
- `services/audioService.ts`：内置 8-bit 合成器与示例旋律。
- `types.ts`：核心类型定义（Voxel、SongNote、TreeConfig 等）。
- 基础 README、Vite 配置与开发脚本。

---

发布说明（快速）
- 本地生成版本号并打 tag：
  ```powershell
  npm version patch   # 或 minor / major
  git push origin main --tags
  ```
- 使用 `standard-version` 或 `semantic-release` 可自动生成并维护 changelog。

参考
- Keep a Changelog — https://keepachangelog.com/