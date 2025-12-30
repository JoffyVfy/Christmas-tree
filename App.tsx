
// 引入 React 相关钩子
import React, { useState, useEffect } from 'react';
// 引入像素圣诞树组件
import PixelTree from './components/PixelTree';
// 引入类型定义
import { TreeConfig } from './types';
// 引入音频服务（用于播放圣诞歌曲）
import { audioService } from './services/audioService';


const App: React.FC = () => {
  // 圣诞问候语（可扩展为动态获取）
  const [greeting, setGreeting] = useState<string>("圣诞快乐");
  
  // 圣诞树配置（旋转速度、像素大小、是否显示装饰）
  const [config] = useState<TreeConfig>({
    rotationSpeed: 0.005, // 球体旋转速度
    pixelSize: 32,        // 像素体素大小
    showDecorations: true // 是否显示装饰
  });

  // 音频播放状态（用于 UI 控制）
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 自动播放音乐的逻辑（已移除全局监听器）
  useEffect(() => {
    // 不再尝试在任意页面交互时自动解锁音频。
    // 由右下角按钮 toggleAudio 负责启动/停止音频。
    return () => {
      audioService.stop();
      setIsPlaying(false);
    };
  }, []);

  // 切换音频播放（右下角按钮调用）
  const toggleAudio = async () => {
    if (isPlaying) {
      audioService.stop();
      setIsPlaying(false);
    } else {
      try {
        await audioService.start();
        setIsPlaying(true);
      } catch (e) {
        // 启动失败（通常因为未交互），不改变状态
      }
    }
  };

  return (
    // 页面主容器，设置背景、字体、居中等样式
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* 内容区域，居中显示 */}
      <div className="z-10 w-full max-w-4xl flex flex-col items-center h-full justify-center">
        {/* 顶部问候语标题 */}
        <div className="mb-2 text-center relative z-20">
          <h1 className="text-3xl md:text-5xl text-yellow-400 mb-2 drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] leading-tight font-black tracking-widest" style={{ textShadow: '3px 3px 0px #b45309' }}>
            {greeting}
          </h1>
        </div>

        {/* 3D 像素圣诞树球体区域 */}
        <div className="relative group w-full flex justify-center items-center z-20">
           <PixelTree config={config} />
        </div>
        {/* 右下角像素播放按钮 */}
        <div className="fixed right-4 bottom-4 z-40">
          <button
            onClick={toggleAudio}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? '停止音乐' : '播放音乐'}
            className={`w-12 h-12 flex items-center justify-center font-mono text-sm ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-400 text-slate-900'} pixel-art drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] border-2 border-black`}
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{isPlaying ? '■' : '▶'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;