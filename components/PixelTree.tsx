import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Voxel, TreeConfig } from '../types';

interface Props {
  config: TreeConfig;
}

// Extend Voxel type locally to support static flag
interface SceneVoxel extends Voxel {
  isStatic?: boolean;
}

interface SnowFlake {
    x: number;
    y: number;
    z: number;
    speed: number;
}

const PixelTree: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  // Constants defining the Globe Geometry
  // SCENE_BASE_Y is where the tree sits (-15).
  // GLOBE_CENTER_Y is the 3D center of the sphere.
  // GLOBE_RADIUS is the boundary for snow (slightly smaller than glass radius 45).
  const SCENE_BASE_Y = -15;
  const GLOBE_CENTER_Y = SCENE_BASE_Y + 25; // 10
  const SNOW_RADIUS = 40; // Keep snow inside radius 40 (Glass is 45)

  // Snowflakes state ref
  const snowflakes = useRef<SnowFlake[]>([]);

  // Initialize Snow
  useEffect(() => {
      const flakes: SnowFlake[] = [];
      const count = 150;

      for(let i=0; i<count; i++) {
          // Generate random point strictly inside the sphere
          // Rejection sampling is simple and effective here
          let x, y, z, dSq;
          do {
              x = (Math.random() - 0.5) * 2 * SNOW_RADIUS;
              z = (Math.random() - 0.5) * 2 * SNOW_RADIUS;
              y = (Math.random() - 0.5) * 2 * SNOW_RADIUS;
              dSq = x*x + y*y + z*z;
          } while (dSq > SNOW_RADIUS * SNOW_RADIUS);

          flakes.push({
              x: x,
              y: y + GLOBE_CENTER_Y,
              z: z,
              // Reduced speed for a more gentle snowfall effect (was 0.2 + 0.15)
              speed: Math.random() * 0.08 + 0.04
          });
      }
      snowflakes.current = flakes;
  }, []);

  // Generate the full voxel scene: Tree + Gifts + Base
  const voxels = useMemo(() => {
    const v: SceneVoxel[] = [];
    const add = (x: number, y: number, z: number, color: string, isStatic: boolean = false) => v.push({x, y, z, color, isStatic});

    // ==========================================
    // 1. HELPERS: Decoration Generators
    // ==========================================
    
    const createGift = (
        ox: number, oy: number, oz: number, 
        w: number, h: number, d: number, 
        colors: { main: string, sec?: string, ribbon: string }, 
        style: { pattern?: 'solid' | 'vertical-stripes' | 'checkered', hasLid?: boolean } = {}
    ) => {
        const { main, sec, ribbon } = colors;
        const secondary = sec || main;
        const { pattern = 'solid', hasLid = false } = style;
        const bodyH = hasLid ? h - 2 : h;

        for(let x=0; x<w; x++) {
            for(let y=0; y<bodyH; y++) {
                for(let z=0; z<d; z++) {
                    if(x>0 && x<w-1 && y>0 && y<bodyH-1 && z>0 && z<d-1) continue;
                    let c = main;
                    if (pattern === 'vertical-stripes' && (x + z) % 2 === 0) c = secondary;
                    else if (pattern === 'checkered' && (x + y + z) % 2 === 0) c = secondary;

                    const mx = Math.floor(w/2), mz = Math.floor(d/2), my = Math.floor(h/2);
                    if ((x===mx || (w>6 && x===mx-1)) || (z===mz || (d>6 && z===mz-1)) || (y===my || (h>6 && y===my-1))) c = ribbon;
                    add(ox + x, oy + y, oz + z, c);
                }
            }
        }
        if (hasLid) {
            const lidY = oy + bodyH;
            const lidH = 2;
            for(let x=-1; x<=w; x++) {
                for(let y=0; y<lidH; y++) {
                    for(let z=-1; z<=d; z++) {
                        if(x>-1 && x<w && y>0 && y<lidH-1 && z>-1 && z<d) continue;
                        let c = main;
                        const mx = Math.floor(w/2), mz = Math.floor(d/2);
                        if ((x===mx || (w>6 && x===mx-1)) || (z===mz || (d>6 && z===mz-1))) c = ribbon;
                        add(ox + x, lidY + y, oz + z, c);
                    }
                }
            }
        }
        // Bow
        const topY = oy + h;
        const mx = Math.floor(w/2), mz = Math.floor(d/2);
        add(ox+mx, topY, oz+mz, ribbon); add(ox+mx, topY+1, oz+mz, ribbon);
        const loopW = Math.min(3, Math.floor(w/2));
        for(let i=1; i<=loopW; i++) {
             add(ox+mx+i, topY+Math.min(i, 2), oz+mz, ribbon); add(ox+mx-i, topY+Math.min(i, 2), oz+mz, ribbon);
             add(ox+mx, topY+Math.min(i, 2), oz+mz+i, ribbon); add(ox+mx, topY+Math.min(i, 2), oz+mz-i, ribbon);
        }
    };

    const createCandyCane = (ox: number, oy: number, oz: number, h: number, facingRight: boolean) => {
        const cWhite = '#f8fafc', cRed = '#dc2626'; 
        for(let y=0; y<h; y++) {
             const c = ((y + ox) % 3 === 0) ? cRed : cWhite;
             add(ox, oy+y, oz, c); add(ox+1, oy+y, oz, c); add(ox, oy+y, oz+1, c); 
        }
        const topY = oy + h, dir = facingRight ? 1 : -1;
        [0, 1, 2, 3].forEach(i => { add(ox + (i*dir), topY, oz, cRed); add(ox + (i*dir), topY+1, oz, cRed); });
        add(ox + (3*dir), topY-1, oz, cWhite); add(ox + (3*dir), topY-2, oz, cWhite);
    };

    const createLollipop = (ox: number, oy: number, oz: number, h: number, r: number) => {
        const cStick = '#fcd34d';
        for(let y=0; y<h; y++) add(ox, oy+y, oz, cStick);
        const cy = oy + h + r - 2;
        const c1 = '#ec4899', c2 = '#fdf2f8', c3 = '#a855f7';
        for(let x = -r; x <= r; x++) {
            for(let y = -r; y <= r; y++) {
                if (x*x + y*y <= r*r) {
                    const swirl = Math.sin(Math.sqrt(x*x+y*y) * 0.5 + Math.atan2(y, x) * 3);
                    let color = c1; if (swirl > 0.5) color = c2; if (swirl < -0.5) color = c3;
                    add(ox + x, cy + y, oz, color); add(ox + x, cy + y, oz + 1, color);
                }
            }
        }
    };

    const createWrappedCandy = (ox: number, oy: number, oz: number, color: string) => {
        const cWrapper = '#fef3c7';
        for(let x=0; x<4; x++) for(let y=0; y<3; y++) for(let z=0; z<3; z++) add(ox+x, oy+y, oz+z, color);
        // Left twist
        add(ox-1, oy+1, oz+1, cWrapper); add(ox-2, oy, oz, cWrapper); add(ox-2, oy+2, oz+2, cWrapper);
        // Right twist
        add(ox+4, oy+1, oz+1, cWrapper); add(ox+5, oy, oz, cWrapper); add(ox+5, oy+2, oz, cWrapper);
        add(ox+5, oy, oz+2, cWrapper); add(ox+5, oy+2, oz+2, cWrapper);
    }

    // ==========================================
    // 2. SCENE GENERATION
    // ==========================================
    
    // --- A. Base (Wooden Stand) - Inner ---
    // This is the structure inside the decorative base.
    const baseRadius = 38; // Reduced inner base
    const baseHeight = 12;
    for(let y = 0; y < baseHeight; y++) {
        const r = y < 2 ? baseRadius + 2 : (y > baseHeight - 3 ? baseRadius + 1 : baseRadius);
        for(let x = -r; x <= r; x++) {
            for(let z = -r; z <= r; z++) {
                if(x*x + z*z <= r*r) {
                    // Only draw shell to save perf
                    if (x*x + z*z > (r-2)*(r-2) || y === baseHeight-1) { 
                         let c = '#451a03'; 
                         let isStatic = true; // Wood part is static

                         if (y === baseHeight-1) { 
                             c = '#f1f5f9'; // Snow floor
                             isStatic = false; // Snow floor rotates
                         }
                         
                         add(x, SCENE_BASE_Y - baseHeight + y, z, c, isStatic);
                    }
                }
            }
        }
    }
    
    // --- Outer Decorative Base (Trapezoid) ---
    // Covers the bottom of the globe. This should be STATIC (non-rotating)
    // FIX: Lower top Y by 1 (to -16) to avoid overlap with snow floor (at -16)
    const outerBaseTopY = SCENE_BASE_Y - 1; 
    const outerBaseBottomY = -27; // Reduced height further (12px)
    
    const baseTopR = 34; // Fits the cut-off of radius 42 globe at y=-25 roughly
    const baseBottomR = 42; 

    for(let y = outerBaseBottomY; y < outerBaseTopY; y++) {
        // Calculate radius for this height (Linear Interpolation)
        const progress = (y - outerBaseBottomY) / (outerBaseTopY - outerBaseBottomY);
        const currentR = Math.floor(baseBottomR * (1 - progress) + baseTopR * progress);

        // Red base with Gold trim
        let c = '#991b1b'; // Red
        if (y > outerBaseTopY - 4 || y < outerBaseBottomY + 3) c = '#f59e0b'; // Gold
        
        for(let x = -currentR; x <= currentR; x++) {
             for(let z = -currentR; z <= currentR; z++) {
                  const d2 = x*x + z*z;
                  if (d2 <= currentR*currentR) {
                       // Draw Shell
                       const isShell = d2 > (currentR-2)*(currentR-2);
                       // Draw Top "Cap" (annulus) to cover gap
                       const isTop = y === outerBaseTopY - 1;
                       
                       if (isShell || isTop) {
                           add(x, y, z, c, true); // <--- TRUE: Static Base
                       }
                  }
             }
        }
    }


    // --- B. The Christmas Tree (Centered) ---
    const treeLayers = 6; 
    
    // Trunk
    for (let y = 0; y < 12; y++) {
      for (let x = -2; x <= 2; x++) {
        for (let z = -2; z <= 2; z++) {
           if (Math.abs(x)===2 && Math.abs(z)===2) continue;
           add(x, SCENE_BASE_Y + y, z, '#5d4037');
        }
      }
    }

    // Leaves
    for (let i = 0; i < treeLayers; i++) {
      const layerY = SCENE_BASE_Y + 8 + i * 7; 
      const height = 11;        
      const baseR = 18 - i * 2.5; 
      const topR = Math.max(0, 4 - i * 0.7); 

      for (let ly = 0; ly < height; ly++) {
        const y = layerY + ly;
        const progress = ly / height;
        const currentR = baseR * (1 - progress) + topR * progress;

        for (let x = -Math.ceil(currentR + 1); x <= Math.ceil(currentR + 1); x++) {
          for (let z = -Math.ceil(currentR + 1); z <= Math.ceil(currentR + 1); z++) {
            const dist = Math.sqrt(x*x + z*z);
            const angle = Math.atan2(z, x);
            const waveFreq = 7 + (i % 2); 
            const branchMod = Math.cos(angle * waveFreq + i) * 1.5; 

            if (dist <= currentR + branchMod) {
              let color = '#15803d'; 
              if (dist > currentR * 0.75) color = '#16a34a'; 
              
              // --- Spiral Red Rope (Garland) ---
              const absHeight = i * 7 + ly;
              const spiralPhase = angle + absHeight * 0.5; 
              
              // Thinner rope logic
              const isGarland = Math.sin(spiralPhase) > 0.9 && dist > currentR * 0.85;

              if (isGarland) {
                   color = '#b91c1c'; // Deep Red
                   if (Math.sin(spiralPhase) > 0.96) color = '#ef4444'; // Bright Red Highlight
              }

              // --- Enhanced Decorations: Stars, Lights, Confetti ---
              else if (config.showDecorations && dist > currentR * 0.6) {
                 const p = Math.random();
                 if (p > 0.85) {
                    const type = Math.random();
                    if (type > 0.65) {
                        const orbs = ['#ea580c', '#2563eb', '#db2777', '#ca8a04']; 
                        color = orbs[Math.floor(Math.random() * orbs.length)];
                    } else if (type > 0.35) {
                        const lights = ['#22d3ee', '#a3e635', '#fef08a', '#f472b6'];
                        color = lights[Math.floor(Math.random() * lights.length)];
                    } else {
                        const confetti = ['#ffffff', '#e2e8f0'];
                        color = confetti[Math.floor(Math.random() * confetti.length)];
                    }
                 }
              }
              
              add(x, y, z, color);
            }
          }
        }
      }
    }
    
    // --- 3D Star on Top ---
    const topTreeY = SCENE_BASE_Y + 8 + treeLayers * 7 + 5;
    const starColor = '#facc15';
    // Center Column
    add(0, topTreeY, 0, starColor);
    add(0, topTreeY+1, 0, starColor);
    add(0, topTreeY+2, 0, starColor);
    // Horizontal Arms (X-axis)
    add(-1, topTreeY+1, 0, starColor); add(1, topTreeY+1, 0, starColor);
    // Horizontal Arms (Z-axis) - Making it 3D
    add(0, topTreeY+1, -1, starColor); add(0, topTreeY+1, 1, starColor);


    // --- C. Gifts and Candy ---
    // Left side
    createGift(-18, SCENE_BASE_Y, 8, 10, 8, 10, 
        { main: '#1e3a8a', sec: '#60a5fa', ribbon: '#facc15' }, 
        { pattern: 'vertical-stripes', hasLid: true }
    );
    createGift(-25, SCENE_BASE_Y, -6, 8, 12, 8, 
        { main: '#991b1b', sec: '#ef4444', ribbon: '#22c55e' }, 
        { pattern: 'checkered', hasLid: false }
    );
    createLollipop(-14, SCENE_BASE_Y, 16, 8, 4); 
    createWrappedCandy(-15, SCENE_BASE_Y, 20, '#f97316'); 

    // Right side
    createGift(12, SCENE_BASE_Y, 8, 10, 7, 8, 
        { main: '#166534', ribbon: '#dc2626' }, 
        { pattern: 'solid', hasLid: true }
    );
    createGift(25, SCENE_BASE_Y, -6, 7, 7, 7, 
        { main: '#facc15', sec: '#fef08a', ribbon: '#ef4444' }, 
        { pattern: 'vertical-stripes', hasLid: true }
    );
    createCandyCane(14, SCENE_BASE_Y, 14, 12, true); 
    createWrappedCandy(16, SCENE_BASE_Y, 20, '#8b5cf6'); 

    return v;
  }, [config.showDecorations]);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Constants for rendering matching the 3D logic
    const GLOBE_RADIUS_RENDER = 45; // Visual glass radius 

    const render = () => {
      // High Res for crisp pixels
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.6; 
      
      const fov = 400; 
      const scaleBase = config.pixelSize; 
      
      ctx.clearRect(0, 0, w, h);

      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      // Prepare list of things to draw (Voxels + Snow)
      const projected: any[] = [];
      const len = voxels.length;
      
      // 1. Process Voxels
      for(let i=0; i<len; i++) {
        const v = voxels[i];
        let rx, rz;
        if (v.isStatic) {
            rx = v.x;
            rz = v.z;
        } else {
            rx = v.x * cos - v.z * sin;
            rz = v.x * sin + v.z * cos;
        }
        
        const cameraZ = rz + 85; 
        if (cameraZ < 1) continue;
        const depth = fov / (fov + cameraZ * 10); 
        const screenX = cx + rx * scaleBase * depth;
        const screenY = cy - (v.y) * scaleBase * depth;

        projected.push({ color: v.color, rz, depth, screenX, screenY, isSnow: false });
      }

      // 2. Process Snow
      const sLen = snowflakes.current.length;
      for(let i=0; i<sLen; i++) {
          const s = snowflakes.current[i];
          
          // Update physics
          s.y -= s.speed;

          // Floor Reset Logic
          if (s.y < SCENE_BASE_Y) {
              // Reset to top area, but inside sphere
              // Find a random valid spot in the top hemisphere
              let valid = false;
              let attempts = 0;
              while(!valid && attempts < 5) {
                  const tx = (Math.random() - 0.5) * 2 * SNOW_RADIUS;
                  const tz = (Math.random() - 0.5) * 2 * SNOW_RADIUS;
                  const ty = GLOBE_CENTER_Y + Math.random() * (SNOW_RADIUS * 0.8);
                  
                  // Check dist
                  const dy = ty - GLOBE_CENTER_Y;
                  if (tx*tx + tz*tz + dy*dy < SNOW_RADIUS*SNOW_RADIUS) {
                      s.x = tx; s.z = tz; s.y = ty;
                      valid = true;
                  }
                  attempts++;
              }
              if (!valid) {
                  // Fallback to center top
                  s.x = 0; s.z = 0; s.y = GLOBE_CENTER_Y + 30;
              }
          }

          // Strict Sphere Bounds Constraint
          const dy = s.y - GLOBE_CENTER_Y;
          const distSq = s.x*s.x + s.z*s.z + dy*dy;
          const maxDistSq = SNOW_RADIUS * SNOW_RADIUS;
          
          if (distSq > maxDistSq) {
              // Push it to surface (or slightly inside)
              const dist = Math.sqrt(distSq);
              const scale = (SNOW_RADIUS - 0.5) / dist; // -0.5 to keep it just inside
              
              // Scale relative to Center
              s.x *= scale;
              s.z *= scale;
              s.y = GLOBE_CENTER_Y + (dy * scale);
          }

          // Rotate snow with scene (makes it look like it's inside the liquid)
          const rx = s.x * cos - s.z * sin;
          const rz = s.x * sin + s.z * cos;

          const cameraZ = rz + 85;
          if (cameraZ < 1) continue;
          
          const depth = fov / (fov + cameraZ * 10);
          const screenX = cx + rx * scaleBase * depth;
          const screenY = cy - s.y * scaleBase * depth;

          projected.push({ color: '#ffffff', rz, depth, screenX, screenY, isSnow: true });
      }

      // Sort by depth (painter's algorithm: draw furthest first)
      // Depth value is inverse of Z distance (1/z). 
      // Small depth = far away. Large depth = close.
      // We want to draw far away first. So sort ascending by depth.
      projected.sort((a, b) => a.depth - b.depth); 

      for(let i=0; i<projected.length; i++) {
        const p = projected[i];
        let size = Math.ceil(scaleBase * p.depth * 1.02); 
        
        // Snow is smaller
        if (p.isSnow) {
            // Increased size from 0.15 to 0.22 and min size 2 to 3 for "slightly larger" look
            size = Math.max(3, Math.ceil(scaleBase * p.depth * 0.22));
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.screenX - size/2), Math.floor(p.screenY - size/2), size, size);
      }

      // 2. Render Glass Overlay (Optimization)
      const globeCamZ = 0 * sin + 0 * cos + 85; 
      const globeDepth = fov / (fov + globeCamZ * 10);
      const globeScreenX = cx; 
      const globeScreenY = cy - (GLOBE_CENTER_Y) * scaleBase * globeDepth;
      
      // Calculate projected radius in screen pixels
      const screenRadius = Math.ceil(GLOBE_RADIUS_RENDER * scaleBase * globeDepth);
      const pixelStep = Math.ceil(scaleBase * globeDepth); 
      
      const cutoffPixels = Math.floor(24 * scaleBase * globeDepth);

      const glassColor = 'rgba(165, 243, 252, 0.03)'; // Ultra clear
      const edgeColor = 'rgba(255, 255, 255, 0.5)'; 
      
      // Loop from top (-screenRadius) to cutoff (cutoffPixels)
      for (let y = -screenRadius; y <= cutoffPixels; y += pixelStep) {
          // Circle equation: x^2 + y^2 = r^2  => x = sqrt(r^2 - y^2)
          let widthAtY = Math.sqrt(Math.max(0, screenRadius*screenRadius - y*y));
          
          // Fix for the top gap
          if (widthAtY < pixelStep && Math.abs(y) <= screenRadius) {
              widthAtY = pixelStep / 2; 
          }

          if (widthAtY > 0) {
              const rectW = Math.max(pixelStep, widthAtY * 2);
              const currentY = Math.floor(globeScreenY + y);
              const leftX = Math.floor(globeScreenX - widthAtY);
              const rightX = Math.floor(globeScreenX + widthAtY - pixelStep);

              // Main Glass Body
              ctx.fillStyle = glassColor;
              ctx.fillRect(
                  leftX, 
                  currentY, 
                  Math.floor(rectW), 
                  pixelStep
              );

              // Rim Texture (Outer Edges)
              ctx.fillStyle = edgeColor;
              ctx.fillRect(leftX, currentY, pixelStep, pixelStep);
              ctx.fillRect(rightX, currentY, pixelStep, pixelStep);
          }
      }

      setRotation(prev => prev + config.rotationSpeed);
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [voxels, rotation, config]);

  return (
    <div className="relative w-full flex items-center justify-center">
      <canvas 
        ref={canvasRef}
        width={1500} 
        height={1500}
        className="max-w-[90vh] max-h-[90vh] w-auto h-auto pixel-art drop-shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
};

export default PixelTree;