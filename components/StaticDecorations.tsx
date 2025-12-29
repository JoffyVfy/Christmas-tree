import React, { useRef, useEffect, useMemo } from 'react';
import { TreeConfig, Voxel } from '../types';

interface Props {
  config: TreeConfig;
}

const StaticDecorations: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Define Scene Voxels using true 3D coordinates
  const voxels = useMemo(() => {
    const v: Voxel[] = [];
    // Helper to add a voxel
    const add = (x: number, y: number, z: number, color: string) => v.push({x, y, z, color});

    // --- 1. Enhanced Gift Generator ---
    const createGift = (
        ox: number, oy: number, oz: number, 
        w: number, h: number, d: number, 
        colors: { main: string, sec?: string, ribbon: string }, 
        style: { pattern?: 'solid' | 'vertical-stripes' | 'checkered', hasLid?: boolean } = {}
    ) => {
        const { main, sec, ribbon } = colors;
        const secondary = sec || main;
        const { pattern = 'solid', hasLid = false } = style;

        // Effective height for the main box body
        const bodyH = hasLid ? h - 2 : h;

        // 1. Box Body
        for(let x=0; x<w; x++) {
            for(let y=0; y<bodyH; y++) {
                for(let z=0; z<d; z++) {
                    // Optimization: Only draw outer shell
                    if(x>0 && x<w-1 && y>0 && y<bodyH-1 && z>0 && z<d-1) continue;
                    
                    let c = main;
                    
                    // Pattern Logic
                    if (pattern === 'vertical-stripes') {
                        if ((x + z) % 2 === 0) c = secondary;
                    } else if (pattern === 'checkered') {
                        if ((x + y + z) % 2 === 0) c = secondary;
                    }

                    // Ribbon Logic (Full Cross Wrap)
                    const mx = Math.floor(w/2);
                    const mz = Math.floor(d/2);
                    const my = Math.floor(h/2);
                    
                    // Vertical ribbon bands (X and Z axes)
                    const isRibbonX = (x === mx || (w > 6 && x === mx-1));
                    const isRibbonZ = (z === mz || (d > 6 && z === mz-1));
                    
                    // Horizontal ribbon band (Y axis) - creates belt
                    const isRibbonY = (y === my || (h > 6 && y === my-1));
                    
                    if (isRibbonX || isRibbonZ || isRibbonY) c = ribbon;
                    
                    add(ox + x, oy + y, oz + z, c);
                }
            }
        }

        // 2. Lid (Optional)
        if (hasLid) {
            const lidY = oy + bodyH;
            const lidH = 2; // Lid is 2 pixels tall
            // Lid overhangs by 1 pixel
            for(let x=-1; x<=w; x++) {
                for(let y=0; y<lidH; y++) {
                    for(let z=-1; z<=d; z++) {
                         // Optimization: Only outer shell
                        if(x>-1 && x<w && y>0 && y<lidH-1 && z>-1 && z<d) continue;

                        let c = main; // Lid usually solid or matching main
                         
                        // Ribbon over lid
                        const mx = Math.floor(w/2);
                        const mz = Math.floor(d/2);
                        // Adjust logic for local coordinates
                        const localX = x; 
                        const localZ = z;

                        const isRibbonX = (localX === mx || (w > 6 && localX === mx-1));
                        const isRibbonZ = (localZ === mz || (d > 6 && localZ === mz-1));

                        if (isRibbonX || isRibbonZ) c = ribbon;

                        add(ox + x, lidY + y, oz + z, c);
                    }
                }
            }
        }
        
        // 3. 3D Bow Logic (Top of the box/lid)
        const topY = oy + h;
        const mx = Math.floor(w/2);
        const mz = Math.floor(d/2);
        
        // Knot
        add(ox + mx, topY, oz + mz, ribbon);
        add(ox + mx, topY + 1, oz + mz, ribbon);
        if(w > 6) add(ox + mx - 1, topY, oz + mz, ribbon);

        // Loops (creating a simple 3D arch structure)
        const loopH = 3;
        const loopW = Math.min(4, Math.floor(w/2));
        
        // X-axis loops
        for(let i=1; i<=loopW; i++) {
             add(ox + mx + i, topY + Math.min(i, loopH), oz + mz, ribbon);
             add(ox + mx - i, topY + Math.min(i, loopH), oz + mz, ribbon);
        }
        // Z-axis loops (make bow fuller)
        for(let i=1; i<=loopW; i++) {
             add(ox + mx, topY + Math.min(i, loopH), oz + mz + i, ribbon);
             add(ox + mx, topY + Math.min(i, loopH), oz + mz - i, ribbon);
        }
    };

    // --- 2. Candy Cane ---
    const createCandyCane = (ox: number, oy: number, oz: number, h: number, facingRight: boolean) => {
        const cWhite = '#f8fafc'; 
        const cRed = '#dc2626'; 
        
        // Stick
        for(let y=0; y<h; y++) {
             // Diagonal stripes
             const c = ((y + ox) % 3 === 0) ? cRed : cWhite;
             add(ox, oy+y, oz, c);
             add(ox+1, oy+y, oz, c); 
             add(ox, oy+y, oz+1, c); 
        }
        
        // Hook
        const topY = oy + h;
        const dir = facingRight ? 1 : -1;
        const range = [0, 1, 2, 3];
        
        // Curve top
        range.forEach(i => {
            const c = cRed;
            add(ox + (i*dir), topY, oz, c);
            add(ox + (i*dir), topY+1, oz, c); 
        });
        
        // Tip hanging down
        add(ox + (3*dir), topY-1, oz, cWhite);
        add(ox + (3*dir), topY-2, oz, cWhite);
    };

    // --- 3. Lollipop (Swirl) ---
    const createLollipop = (ox: number, oy: number, oz: number, h: number, r: number) => {
        // Stick
        const cStick = '#fcd34d'; // Yellow/Wood
        for(let y=0; y<h; y++) {
            add(ox, oy+y, oz, cStick);
        }

        // Candy Head
        const cy = oy + h + r - 2;
        const c1 = '#ec4899'; // Pink
        const c2 = '#fdf2f8'; // White pinkish
        const c3 = '#a855f7'; // Purple accent

        for(let x = -r; x <= r; x++) {
            for(let y = -r; y <= r; y++) {
                if (x*x + y*y <= r*r) {
                    const dist = Math.sqrt(x*x + y*y);
                    const angle = Math.atan2(y, x);
                    // Swirl pattern math
                    const swirl = Math.sin(dist * 0.5 + angle * 3);
                    
                    let color = c1;
                    if (swirl > 0.5) color = c2;
                    if (swirl < -0.5) color = c3;

                    add(ox + x, cy + y, oz, color);
                    add(ox + x, cy + y, oz + 1, color); // Thickness
                }
            }
        }
    };

    // --- 4. Wrapped Candy (Hard Candy) ---
    const createWrappedCandy = (ox: number, oy: number, oz: number, color: string) => {
        const cWrapper = '#fef3c7'; // yellowish white wrapper ends
        
        // Center piece (Candy)
        for(let x=0; x<4; x++) {
            for(let y=0; y<3; y++) {
                for(let z=0; z<3; z++) {
                     add(ox+x, oy+y, oz+z, color);
                }
            }
        }
        
        // Wrapper twists (Triangles on sides)
        // Left
        add(ox-1, oy+1, oz+1, cWrapper);
        add(ox-2, oy, oz, cWrapper);
        add(ox-2, oy+2, oz, cWrapper);
        add(ox-2, oy, oz+2, cWrapper);
        add(ox-2, oy+2, oz+2, cWrapper);

        // Right
        add(ox+4, oy+1, oz+1, cWrapper);
        add(ox+5, oy, oz, cWrapper);
        add(ox+5, oy+2, oz, cWrapper);
        add(ox+5, oy, oz+2, cWrapper);
        add(ox+5, oy+2, oz+2, cWrapper);
    }

    // --- Scene Composition ---
    // Ground Y = -6
    // Center is 0. 
    // We will place items at +/- 30 to 40 units for symmetry.

    // --- LEFT GROUP (Negative X) ---
    // 1. Big Blue Gift (Striped with Lid)
    createGift(-32, -6, 6, 11, 10, 11, 
        { main: '#1e3a8a', sec: '#60a5fa', ribbon: '#facc15' }, 
        { pattern: 'vertical-stripes', hasLid: true }
    );
    // 2. Tall Red Gift (Checkered) slightly behind and further out
    createGift(-44, -6, -4, 8, 14, 8, 
        { main: '#991b1b', sec: '#ef4444', ribbon: '#22c55e' }, 
        { pattern: 'checkered', hasLid: false }
    );
    // 3. Lollipop
    createLollipop(-20, -6, 14, 10, 5); 
    // 4. Candy on ground
    createWrappedCandy(-22, -6, 20, '#f97316'); // Orange

    // --- RIGHT GROUP (Positive X) ---
    // Mirroring coordinates (X -> -X) mostly, but keeping objects distinct types
    
    // 1. Wide Green Gift (Solid with Lid) - Symmetric position to Blue Gift
    createGift(32 - 12, -6, 6, 12, 8, 10,  // x adjusted slightly for width diff
        { main: '#166534', ribbon: '#dc2626' }, 
        { pattern: 'solid', hasLid: true }
    );
    
    // 2. Small Gold Gift (Striped) - Symmetric position to Red Gift
    createGift(44, -6, -4, 7, 7, 7, 
        { main: '#facc15', sec: '#fef08a', ribbon: '#ef4444' }, 
        { pattern: 'vertical-stripes', hasLid: true }
    );
    
    // 3. Candy Cane - Symmetric to Lollipop area
    createCandyCane(20, -6, 14, 14, true); 
    
    // 4. Purple Candy - Symmetric to Orange candy
    createWrappedCandy(22, -6, 20, '#8b5cf6');

    return v;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = window.innerHeight;
      
      const cx = w / 2;
      const cy = h * 0.75; 
      const fov = 450; 
      const scaleBase = config.pixelSize; 

      ctx.clearRect(0, 0, w, h);
      
      const fixedRotation = -Math.PI / 8; 
      const cos = Math.cos(fixedRotation);
      const sin = Math.sin(fixedRotation);

      const projected = [];
      const len = voxels.length;

      for(let i=0; i<len; i++) {
        const v = voxels[i];
        
        const rx = v.x * cos - v.z * sin;
        const rz = v.x * sin + v.z * cos;
        
        const cameraZ = rz + 80; 
        if (cameraZ < 1) continue;

        const depth = fov / (fov + cameraZ * 10); 
        
        const screenX = cx + rx * scaleBase * depth;
        const screenY = cy - (v.y + 6) * scaleBase * depth;

        projected.push({ color: v.color, rz, depth, screenX, screenY });
      }

      projected.sort((a, b) => b.rz - a.rz);

      for(let i=0; i<projected.length; i++) {
        const p = projected[i];
        const size = Math.ceil(scaleBase * p.depth * 1.05); 
        
        // Shadow/Outline
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(Math.floor(p.screenX - size/2 + 2), Math.floor(p.screenY - size/2 + 2), size, size);

        // Voxel Face
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.screenX - size/2), Math.floor(p.screenY - size/2), size, size);
      }
    };

    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [config, voxels]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};

export default StaticDecorations;