import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

interface FieldNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number;
  size: number;
}

interface SweepBeam {
  pos: number;
  speed: number;
  vertical: boolean;
  alpha: number;
}

export function BackgroundFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const nodes: FieldNode[] = [];
    const NODE_COUNT = 58;

    const initNodes = (w: number, h: number) => {
      nodes.length = 0;
      const safeW = Math.max(1, w);
      const safeH = Math.max(1, h);
      for (let i = 0; i < NODE_COUNT; i++) {
        const depth = 0.35 + ((i * 0.6180339) % 1) * 0.65;
        nodes.push({
          x: Math.random() * safeW,
          y: Math.random() * safeH,
          vx: (Math.random() - 0.5) * 0.42 * depth,
          vy: (Math.random() - 0.5) * 0.38 * depth,
          depth,
          size: 0.9 + depth * 1.1,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) {
        initNodes(width, height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let smoothMouseX = width * 0.5;
    let smoothMouseY = height * 0.5;
    let pointerActive = false;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    const beams: SweepBeam[] = [
      { pos: 0.15, speed: 0.0014, vertical: false, alpha: 0.085 },
      { pos: 0.65, speed: 0.0011, vertical: false, alpha: 0.055 },
      { pos: 0.35, speed: 0.0009, vertical: true, alpha: 0.06 },
    ];

    let time = 0;
    let rafId = 0;

    const render = () => {
      if (width <= 0 || height <= 0) {
        if (!prefersReducedMotion) rafId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const scrollOffset = window.scrollY || 0;
      if (!prefersReducedMotion) {
        time += 0.016;
      }

      if (pointerActive) {
        smoothMouseX += (mouseX - smoothMouseX) * 0.08;
        smoothMouseY += (mouseY - smoothMouseY) * 0.08;
      } else {
        smoothMouseX += (width * 0.5 - smoothMouseX) * 0.02;
        smoothMouseY += (height * 0.5 - smoothMouseY) * 0.02;
      }

      // 1. Pointer-following monochrome radial light aura
      const auraRadius = Math.max(10, Math.max(width, height) * 0.34);
      const aura = ctx.createRadialGradient(
        smoothMouseX,
        smoothMouseY,
        0,
        smoothMouseX,
        smoothMouseY,
        auraRadius
      );
      aura.addColorStop(0, 'rgba(255, 255, 255, 0.045)');
      aura.addColorStop(0.5, 'rgba(255, 255, 255, 0.014)');
      aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      // 2. Drifting architectural coordinate grid with gentle scroll & pointer parallax
      const gridSize = 84;
      const offsetX =
        ((time * 12 - (smoothMouseX - width * 0.5) * 0.035) % gridSize + gridSize) % gridSize;
      const offsetY =
        ((time * 8 - scrollOffset * 0.18 - (smoothMouseY - height * 0.5) * 0.035) % gridSize +
          gridSize) %
        gridSize;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.032)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      for (let gx = offsetX; gx < width; gx += gridSize) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
      }
      for (let gy = offsetY; gy < height; gy += gridSize) {
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      for (let gx = offsetX; gx < width; gx += gridSize * 2) {
        for (let gy = offsetY; gy < height; gy += gridSize * 2) {
          ctx.moveTo(gx - 3, gy);
          ctx.lineTo(gx + 3, gy);
          ctx.moveTo(gx, gy - 3);
          ctx.lineTo(gx, gy + 3);
        }
      }
      ctx.stroke();

      // 3. Sweeping architectural scan beams
      if (!prefersReducedMotion) {
        for (const beam of beams) {
          beam.pos = (beam.pos + beam.speed) % 1.25;
          const p = beam.pos - 0.125;

          if (beam.vertical) {
            const x = p * width;
            const grad = ctx.createLinearGradient(x - 80, 0, x + 80, 0);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${beam.alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(x - 80, 0, 160, height);
          } else {
            const y = p * height;
            const grad = ctx.createLinearGradient(0, y - 70, 0, y + 70);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${beam.alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, y - 70, width, 140);
          }
        }
      }

      // 4. Drifting constellation particles + interactive cursor tethers
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;

          if (pointerActive) {
            const dx = mouseX - n.x;
            const dy = mouseY - n.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 170 && dist > 1) {
              n.x += (dx / dist) * 0.25 * n.depth;
              n.y += (dy / dist) * 0.25 * n.depth;
            }
          }

          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;
        }

        const parallaxY = ((n.y - scrollOffset * 0.12 * n.depth) % height + height) % height;

        ctx.beginPath();
        ctx.arc(n.x, parallaxY, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.14 + n.depth * 0.24).toFixed(3)})`;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const mParallaxY = ((m.y - scrollOffset * 0.12 * m.depth) % height + height) % height;
          const dist = Math.hypot(n.x - m.x, parallaxY - mParallaxY);
          if (dist < 135) {
            const lineAlpha = Math.max(0, (1 - dist / 135) * 0.085);
            ctx.beginPath();
            ctx.moveTo(n.x, parallaxY);
            ctx.lineTo(m.x, mParallaxY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }

        if (pointerActive) {
          const pDist = Math.hypot(n.x - mouseX, parallaxY - mouseY);
          if (pDist < 165) {
            const pAlpha = Math.max(0, (1 - pDist / 165) * 0.16);
            ctx.beginPath();
            ctx.moveTo(n.x, parallaxY);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${pAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
