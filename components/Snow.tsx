import React, { useRef, useEffect } from 'react';

const Snow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const snowflakes: { x: number; y: number; r: number; d: number }[] = [];
    const maxFlakes = 100;

    for (let i = 0; i < maxFlakes; i++) {
      snowflakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3 + 1, // radius (size)
        d: Math.random() // speed factor 0-1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      for (let i = 0; i < maxFlakes; i++) {
        const f = snowflakes[i];
        
        // Draw square pixels instead of circles for retro feel
        ctx.fillRect(f.x, f.y, f.r * 2, f.r * 2);
      }
      ctx.fill();
      update();
      requestAnimationFrame(draw);
    };

    let angle = 0;
    const update = () => {
      angle += 0.01;
      for (let i = 0; i < maxFlakes; i++) {
        const f = snowflakes[i];
        // Updating x and y coordinates
        // Very slow speed: 0.2 to 0.7 pixels per frame
        f.y += f.d * 0.5 + 0.2; 
        f.x += Math.sin(angle) * 0.3;

        // Reset if out of view
        if (f.y > h) {
          snowflakes[i] = { x: Math.random() * w, y: -10, r: f.r, d: f.d };
        }
        // Wrap x for wind effect consistency
        if (f.x > w + 5) f.x = -5;
        if (f.x < -5) f.x = w + 5;
      }
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    const animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-50"
    />
  );
};

export default Snow;