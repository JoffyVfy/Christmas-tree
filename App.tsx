
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

  // 自动播放音乐的逻辑
  useEffect(() => {
    let audioStarted = false;

    // 尝试启动音频（需要用户交互）
    const tryStartAudio = async () => {
      if (audioStarted) return;
      try {
        await audioService.start(); // 启动音乐
        audioStarted = true;
        // 移除所有事件监听（只需启动一次）
        ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt => 
           window.removeEventListener(evt, tryStartAudio)
        );
      } catch (e) {
        // 如果没有用户交互会报错，忽略即可
      }
    };

    // 首次尝试启动
    tryStartAudio();

    // 监听常见用户交互事件，解锁音频上下文
    ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt => 
      window.addEventListener(evt, tryStartAudio)
    );

    // 组件卸载时清理事件和停止音乐
    return () => {
      ['click', 'keydown', 'touchstart', 'mousedown'].forEach(evt => 
        window.removeEventListener(evt, tryStartAudio)
      );
      audioService.stop();
    };
  }, []);

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
      </div>
    </div>
  );
};

export default App;