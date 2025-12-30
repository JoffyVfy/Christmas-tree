import React, { useEffect, useRef } from 'react';

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
}

const PixelAudioButton: React.FC<Props> = ({ isPlaying, onToggle }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 更高分辨率像素网格以绘制更精美的像素艺术
    const SIZE = 24; // 24x24 逻辑像素
    const SCALE = 3; // 72x72 CSS 像素

    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.style.width = `${SIZE * SCALE}px`;
    canvas.style.height = `${SIZE * SCALE}px`;
    ctx.imageSmoothingEnabled = false;

    const draw = (time: number) => {
      tRef.current = time;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // 背景：中央亮，四周略暗，播放时颜色更鲜明
      const cx = SIZE / 2 - 0.5;
      const cy = SIZE / 2 - 0.5;
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const norm = Math.max(0, 1 - dist / (SIZE * 0.7));
          const base = isPlaying ? [60, 210, 120] : [30, 150, 80];
          const pulse = isPlaying ? (0.15 * Math.sin(time / 160) + 0.85) : 1;
          const r = Math.round(base[0] * (0.6 + 0.4 * norm) * pulse);
          const g = Math.round(base[1] * (0.6 + 0.4 * norm) * pulse);
          const b = Math.round(base[2] * (0.6 + 0.4 * norm) * pulse);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // 双层边框（黑色外框 + 深灰内框）
      ctx.fillStyle = '#000';
      for (let i = 0; i < SIZE; i++) {
        ctx.fillRect(i, 0, 1, 1);
        ctx.fillRect(i, SIZE - 1, 1, 1);
        ctx.fillRect(0, i, 1, 1);
        ctx.fillRect(SIZE - 1, i, 1, 1);
      }
      ctx.fillStyle = '#222';
      for (let i = 1; i < SIZE - 1; i++) {
        ctx.fillRect(i, 1, 1, 1);
        ctx.fillRect(i, SIZE - 2, 1, 1);
        ctx.fillRect(1, i, 1, 1);
        ctx.fillRect(SIZE - 2, i, 1, 1);
      }

      // 内部高光（左上）和阴影（右下）来制造凹凸感
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 2; i < 6; i++) {
        ctx.fillRect(i, 2, 1, 1);
        ctx.fillRect(2, i, 1, 1);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let i = SIZE - 7; i < SIZE - 3; i++) {
        ctx.fillRect(i, SIZE - 3, 1, 1);
        ctx.fillRect(SIZE - 3, i, 1, 1);
      }

      // 图标绘制（播放三角 vs 停止方块）
      if (isPlaying) {
        // 停止图标：较圆润的方块（中心10x10），带内边与高光
        const ox = 7, oy = 7, w = 10, h = 10;
        ctx.fillStyle = '#0B1220';
        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) {
            ctx.fillRect(ox + x, oy + y, 1, 1);
          }
        }
        // 内部高光矩形
        ctx.fillStyle = '#22303a';
        for (let x = 1; x < w - 2; x++) {
          for (let y = 1; y < h - 2; y++) {
            ctx.fillRect(ox + x, oy + y, 1, 1);
          }
        }
        // 小高光点
        ctx.fillStyle = '#5eead4';
        ctx.fillRect(ox + 2, oy + 2, 1, 1);
      } else {
        // 播放三角形（像素化）更平滑的轮廓
        ctx.fillStyle = '#061421';
        const tri = [
          [8,7],[9,8],[9,9],[10,9],[11,10],[12,11],[13,11],[14,12],[14,13]
        ];
        tri.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
        // 填充内部（粗略填充以形成三角）
        const fill = [
          [9,7],[10,8],[10,10],[11,9],[12,10],[13,10]
        ];
        fill.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
        // 高光
        ctx.fillStyle = '#8EE7B6';
        ctx.fillRect(11, 9, 1, 1);
      }

      // 播放时的音符动画：沿 Y 轴浮动并闪烁
      if (isPlaying) {
        const phase = (time / 160) % (Math.PI * 2);
        const a = 0.6 + 0.4 * Math.abs(Math.sin(phase));
        const offset = Math.round(1.5 * Math.sin(phase));
        // 音符主体
        ctx.fillStyle = `rgba(255,255,200,${a})`;
        ctx.fillRect(SIZE - 6, 3 + offset, 2, 2);
        ctx.fillRect(SIZE - 5, 1 + offset, 1, 3);
        // 音符尾巴高亮
        ctx.fillStyle = `rgba(255,210,80,${0.6 + 0.4 * a})`;
        ctx.fillRect(SIZE - 4, 4 + offset, 2, 1);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  return (
    <div style={{ width: 64, height: 64 }}>
      <button
        onClick={onToggle}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? '停止音乐' : '播放音乐'}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        <canvas
          ref={canvasRef}
          className="pixel-art"
          style={{ display: 'block' }}
        />
      </button>
    </div>
  );
};

export default PixelAudioButton;
