import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let finishTimer: number | undefined;
    let rafId = 0;

    if (prefersReducedMotion) {
      setProgress(100);
      finishTimer = window.setTimeout(() => {
        setVisible(false);
        onCompleteRef.current();
      }, 140);
      return () => {
        if (finishTimer !== undefined) window.clearTimeout(finishTimer);
      };
    }

    const duration = 1150;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3.5);
      const pct = Math.round(eased * 100);
      setProgress(pct);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        finishTimer = window.setTimeout(() => {
          setVisible(false);
          onCompleteRef.current();
        }, 160);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (finishTimer !== undefined) window.clearTimeout(finishTimer);
    };
  }, [prefersReducedMotion]);

  // Nested 3D wireframe cube + inner octahedron + dual orbital rings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 180;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cubeVerts: [number, number, number][] = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];
    const cubeEdges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const octVerts: [number, number, number][] = [
      [0, 1.15, 0],
      [0, -1.15, 0],
      [1.15, 0, 0],
      [-1.15, 0, 0],
      [0, 0, 1.15],
      [0, 0, -1.15],
    ];
    const octEdges: [number, number][] = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
    ];

    let angle = 0;
    let raf = 0;

    const projectShape = (
      verts: [number, number, number][],
      edges: [number, number][],
      rotY: number,
      rotX: number,
      scaleFactor: number,
      baseAlpha: number
    ) => {
      const cx = size / 2;
      const cy = size / 2;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected = verts.map(([vx, vy, vz]) => {
        const x1 = vx * cosY - vz * sinY;
        const z1 = vx * sinY + vz * cosY;
        const y2 = vy * cosX - z1 * sinX;
        const z2 = vy * sinX + z1 * cosX;
        const p = scaleFactor / (3.4 - z2 * 0.5);
        return { x: cx + x1 * p, y: cy + y2 * p, z: z2 };
      });

      for (const [a, b] of edges) {
        const pa = projected[a];
        const pb = projected[b];
        const avgZ = (pa.z + pb.z) / 2;
        const alpha = Math.max(0.18, Math.min(1, baseAlpha + avgZ * 0.28));
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      angle += 0.032;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.45);
      ctx.beginPath();
      ctx.ellipse(0, 0, 74, 24, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 0.35 + Math.PI / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 74, 24, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      projectShape(cubeVerts, cubeEdges, angle, angle * 0.65, 84, 0.65);
      projectShape(octVerts, octEdges, -angle * 1.35, angle * 0.85, 48, 0.45);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ y: '0%' }}
          exit={{
            y: '-100%',
            transition: { duration: 0.72, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black px-6 py-10 text-white"
          aria-label="Loading ScholarCraft"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-[1200px] items-center justify-between border-b border-[#262626] pb-4"
          >
            <span className="font-display text-sm font-semibold tracking-tight text-white">
              ScholarCraft
            </span>
            <span className="font-mono text-xs text-[#888888] tabular-nums">
              Academic Synthesis Engine
            </span>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <canvas
              ref={canvasRef}
              className="h-[180px] w-[180px]"
              aria-hidden="true"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="font-mono text-5xl font-medium tracking-tight text-white tabular-nums sm:text-6xl">
                {String(progress).padStart(3, '0')}%
              </div>
              <div className="h-[1.5px] w-56 overflow-hidden bg-[#262626]">
                <div
                  className="h-full bg-white transition-transform duration-75 ease-out"
                  style={{
                    transform: `scaleX(${progress / 100})`,
                    transformOrigin: 'left',
                  }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-[1200px] items-center justify-between font-mono text-xs text-[#888888]"
          >
            <span>Titles · Abstract · Keywords</span>
            <span>Monochrome Edition</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
