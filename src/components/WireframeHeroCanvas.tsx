import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

type Vec3 = [number, number, number];

interface MeshData {
  vertices: Vec3[];
  edges: [number, number][];
}

interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
}

interface EdgeSignal {
  edgeIndex: number;
  t: number;
  speed: number;
}

interface OrbitParticle {
  theta: number;
  phi: number;
  radiusMul: number;
  speedTheta: number;
  speedPhi: number;
  size: number;
}

interface Shockwave {
  radius: number;
  alpha: number;
}

function normalize([x, y, z]: Vec3): Vec3 {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

function buildIcosahedron(subdivisions: number): MeshData {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices: Vec3[] = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ].map((v) => normalize(v as Vec3));

  let faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const midpointCache = new Map<string, number>();
  const getMidpoint = (i1: number, i2: number): number => {
    const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
    const existing = midpointCache.get(key);
    if (existing !== undefined) return existing;
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const mid = normalize([
      (v1[0] + v2[0]) / 2,
      (v1[1] + v2[1]) / 2,
      (v1[2] + v2[2]) / 2,
    ]);
    const idx = vertices.push(mid) - 1;
    midpointCache.set(key, idx);
    return idx;
  };

  for (let s = 0; s < subdivisions; s++) {
    const nextFaces: [number, number, number][] = [];
    for (const [a, b, c] of faces) {
      const ab = getMidpoint(a, b);
      const bc = getMidpoint(b, c);
      const ca = getMidpoint(c, a);
      nextFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = nextFaces;
  }

  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  for (const [a, b, c] of faces) {
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ] as [number, number][]) {
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([u, v]);
      }
    }
  }

  return { vertices, edges };
}

function rotatePoint3D(
  [vx, vy, vz]: Vec3,
  rotX: number,
  rotY: number,
  rotZ: number
): Vec3 {
  // Y-axis
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = vx * cosY - vz * sinY;
  const z1 = vx * sinY + vz * cosY;

  // X-axis
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const y2 = vy * cosX - z1 * sinX;
  const z2 = vy * sinX + z1 * cosX;

  // Z-axis
  const cosZ = Math.cos(rotZ);
  const sinZ = Math.sin(rotZ);
  const x3 = x1 * cosZ - y2 * sinZ;
  const y3 = x1 * sinZ + y2 * cosZ;

  return [x3, y3, z2];
}

export function WireframeHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outerMesh = buildIcosahedron(2);
    const midMesh = buildIcosahedron(1);
    const innerMesh = buildIcosahedron(0);

    // Traveling light pulses along outer geodesic edges
    const edgeSignals: EdgeSignal[] = Array.from({ length: 24 }, (_, i) => ({
      edgeIndex: (i * 19) % outerMesh.edges.length,
      t: (i * 0.13) % 1,
      speed: 0.012 + (i % 5) * 0.004,
    }));

    // 44 orbiting 3D constellation particles
    const particles: OrbitParticle[] = Array.from({ length: 44 }, (_, i) => ({
      theta: (i / 44) * Math.PI * 2,
      phi: ((i * 1.6180339) % 1) * Math.PI - Math.PI / 2,
      radiusMul: 1.12 + (i % 5) * 0.065,
      speedTheta: (0.0035 + (i % 6) * 0.0012) * (i % 2 === 0 ? 1 : -0.7),
      speedPhi: Math.sin(i) * 0.0014,
      size: 1.1 + (i % 3) * 0.55,
    }));

    // 3D gimbal ring vertices (64 segments per ring)
    const RING_SEGMENTS = 64;
    const ringCircle: Vec3[] = Array.from({ length: RING_SEGMENTS }, (_, i) => {
      const a = (i / RING_SEGMENTS) * Math.PI * 2;
      return [Math.cos(a), Math.sin(a), 0];
    });

    const shockwaves: Shockwave[] = [];

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      if (width <= 0 || height <= 0) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => resize()) : null;
    resizeObserver?.observe(canvas);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;
    let pointerVelocity = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (window.innerWidth === 0 || window.innerHeight === 0) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      pointerVelocity = Math.min(0.06, Math.hypot(nx - targetMouseX, ny - targetMouseY) * 0.07);
      targetMouseX = nx;
      targetMouseY = ny;
    };

    const onPointerDown = () => {
      if (!prefersReducedMotion) {
        shockwaves.push({ radius: 0.3, alpha: 0.65 });
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    let time = 0;
    let angleY = 0.4;
    let angleX = 0.25;
    let angleZ = 0.1;
    let rafId = 0;

    const projectVertices = (
      mesh: MeshData,
      cx: number,
      cy: number,
      radius: number,
      rx: number,
      ry: number,
      rz: number,
      waveAmp: number,
      waveFreq: number,
      pointerPull: number
    ): ProjectedPoint[] => {
      return mesh.vertices.map(([vx, vy, vz]) => {
        const wave =
          waveAmp > 0
            ? 1 +
              waveAmp *
                Math.sin(vx * waveFreq + time * 2.4) *
                Math.cos(vy * waveFreq - time * 1.9) *
                Math.sin(vz * waveFreq + time * 1.4)
            : 1;

        const [x3, y3, z3] = rotatePoint3D([vx * wave, vy * wave, vz * wave], rx, ry, rz);

        const pull = pointerPull > 0 && z3 > 0 ? pointerPull * z3 : 0;
        const px = x3 + smoothMouseX * pull;
        const py = y3 + smoothMouseY * pull;

        const perspective = 2.65 / (2.65 - z3 * 0.72);
        return {
          x: cx + px * radius * perspective,
          y: cy + py * radius * perspective,
          z: z3,
        };
      });
    };

    const drawWireframe = (
      projected: ProjectedPoint[],
      edges: [number, number][],
      minAlpha: number,
      maxAlpha: number,
      lineWidthFront: number,
      drawNodes: boolean
    ) => {
      for (const [i, j] of edges) {
        const p1 = projected[i];
        const p2 = projected[j];
        const depth = (p1.z + p2.z) * 0.5;
        const alpha = Math.max(
          minAlpha,
          Math.min(maxAlpha, (minAlpha + maxAlpha) * 0.5 + depth * 0.22)
        );
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = depth > 0.2 ? lineWidthFront : 0.55;
        ctx.stroke();
      }

      if (drawNodes) {
        for (const p of projected) {
          if (p.z > 0.15) {
            const nodeAlpha = Math.min(0.85, 0.18 + p.z * 0.58);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.45, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha.toFixed(3)})`;
            ctx.fill();
          }
        }
      }
    };

    const draw3DGimbalRing = (
      cx: number,
      cy: number,
      ringRadius: number,
      rx: number,
      ry: number,
      rz: number,
      alphaBase: number,
      dashed: boolean
    ) => {
      const pts = ringCircle.map((pt) => {
        const [x3, y3, z3] = rotatePoint3D(pt, rx, ry, rz);
        const perspective = 2.65 / (2.65 - z3 * 0.72);
        return {
          x: cx + x3 * ringRadius * perspective,
          y: cy + y3 * ringRadius * perspective,
          z: z3,
        };
      });

      ctx.save();
      if (dashed) {
        ctx.setLineDash([4, 7]);
      }
      ctx.beginPath();
      for (let i = 0; i <= pts.length; i++) {
        const p = pts[i % pts.length];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${alphaBase})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();

      const idxA = Math.floor(((time * 16) % RING_SEGMENTS + RING_SEGMENTS) % RING_SEGMENTS);
      const idxB = (idxA + RING_SEGMENTS / 2) % RING_SEGMENTS;
      for (const idx of [idxA, idxB]) {
        const beacon = pts[idx];
        const bAlpha = Math.max(0.2, Math.min(0.95, 0.55 + beacon.z * 0.4));
        ctx.beginPath();
        ctx.arc(beacon.x, beacon.y, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bAlpha.toFixed(2)})`;
        ctx.fill();
      }
    };

    const drawFrame = () => {
      if (width <= 0 || height <= 0) {
        if (!prefersReducedMotion) rafId = requestAnimationFrame(drawFrame);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        time += 0.018;
        const speedBoost = 1 + pointerVelocity * 16;
        angleY += 0.0052 * speedBoost;
        angleX += 0.0021 * speedBoost;
        angleZ += 0.0014;
        pointerVelocity *= 0.93;
      }

      smoothMouseX += (targetMouseX - smoothMouseX) * 0.075;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.075;

      const rotY = angleY + smoothMouseX * 0.78;
      const rotX = angleX + smoothMouseY * 0.54;
      const rotZ = angleZ + smoothMouseX * 0.2;

      const centerX = width >= 960 ? width * 0.72 : width * 0.5;
      const centerY = height * 0.5;
      const breath = prefersReducedMotion ? 1 : 1 + Math.sin(time * 1.45) * 0.032;
      const baseRadius = Math.max(20, Math.min(width, height) * (width >= 960 ? 0.37 : 0.33) * breath);

      // 0. Pulsing concentric resonance rings & sweeping angular radar arcs behind sphere
      if (!prefersReducedMotion) {
        for (let r = 0; r < 3; r++) {
          const cycle = ((time * 0.24 + r / 3) % 1 + 1) % 1;
          const waveR = Math.max(1, baseRadius * (0.45 + cycle * 1.45));
          const waveAlpha = Math.max(0, (1 - cycle) * 0.14);
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha.toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }

        for (let a = 0; a < 2; a++) {
          const startAngle = time * (a === 0 ? 0.42 : -0.3) + a * Math.PI;
          const arcRadius = Math.max(1, baseRadius * (1.58 + a * 0.16));
          ctx.beginPath();
          ctx.arc(centerX, centerY, arcRadius, startAngle, startAngle + Math.PI * 0.42);
          ctx.strokeStyle = `rgba(255, 255, 255, ${a === 0 ? 0.16 : 0.1})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // 1. Three orthogonal 3D rotating gimbal rings
      draw3DGimbalRing(
        centerX,
        centerY,
        baseRadius * 1.24,
        rotX * 0.8 + 0.55,
        rotY * 1.15,
        time * 0.35,
        0.2,
        false
      );
      draw3DGimbalRing(
        centerX,
        centerY,
        baseRadius * 1.35,
        -rotX * 1.1 + 1.1,
        -rotY * 0.85,
        -time * 0.28,
        0.14,
        true
      );
      draw3DGimbalRing(
        centerX,
        centerY,
        baseRadius * 1.46,
        rotY * 0.55 + 1.57,
        rotX * 0.75,
        time * 0.22,
        0.1,
        false
      );

      // 2. Outer harmonic-breathing geodesic sphere
      const outerProjected = projectVertices(
        outerMesh,
        centerX,
        centerY,
        baseRadius,
        rotX,
        rotY,
        rotZ,
        prefersReducedMotion ? 0 : 0.065,
        3.2,
        0.09
      );
      drawWireframe(outerProjected, outerMesh.edges, 0.04, 0.36, 0.95, true);

      // 3. Traveling light pulses gliding along outer wireframe edges
      if (!prefersReducedMotion) {
        for (const sig of edgeSignals) {
          sig.t += sig.speed;
          if (sig.t >= 1) {
            sig.t = 0;
            sig.edgeIndex = (sig.edgeIndex + 7) % outerMesh.edges.length;
          }
          const [a, b] = outerMesh.edges[sig.edgeIndex];
          const p1 = outerProjected[a];
          const p2 = outerProjected[b];
          const sx = p1.x + (p2.x - p1.x) * sig.t;
          const sy = p1.y + (p2.y - p1.y) * sig.t;
          const sz = p1.z + (p2.z - p1.z) * sig.t;
          if (sz > -0.2) {
            const alpha = Math.min(0.95, 0.45 + sz * 0.5);
            ctx.beginPath();
            ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
            ctx.fill();
          }
        }
      }

      // 4. Middle counter-rotating wireframe cage
      const midProjected = projectVertices(
        midMesh,
        centerX,
        centerY,
        baseRadius * 0.72,
        -rotX * 1.35,
        -rotY * 1.5,
        rotZ * 1.2,
        prefersReducedMotion ? 0 : 0.04,
        2.5,
        0.04
      );
      drawWireframe(midProjected, midMesh.edges, 0.05, 0.32, 0.9, false);

      // 5. Fast-spinning inner icosahedron core
      const innerProjected = projectVertices(
        innerMesh,
        centerX,
        centerY,
        baseRadius * 0.38,
        rotX * 2.1,
        rotY * 2.35,
        -rotZ * 1.9,
        0,
        0,
        0
      );
      drawWireframe(innerProjected, innerMesh.edges, 0.14, 0.62, 1.25, true);

      // 6. Orbiting constellation particles + dynamic proximity tether lines
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];
        if (!prefersReducedMotion) {
          pt.theta += pt.speedTheta;
          pt.phi += pt.speedPhi;
          if (pt.phi > 1.3 || pt.phi < -1.3) pt.speedPhi *= -1;
        }
        const raw: Vec3 = [
          Math.cos(pt.phi) * Math.cos(pt.theta) * pt.radiusMul,
          Math.sin(pt.phi) * pt.radiusMul,
          Math.cos(pt.phi) * Math.sin(pt.theta) * pt.radiusMul,
        ];
        const [x3, y3, z3] = rotatePoint3D(raw, smoothMouseY * 0.35, smoothMouseX * 0.45, 0);
        const perspective = 2.65 / (2.65 - z3 * 0.72);
        const sx = centerX + x3 * baseRadius * perspective;
        const sy = centerY + y3 * baseRadius * perspective;
        const alpha = Math.max(0.1, Math.min(0.85, 0.38 + z3 * 0.42));

        ctx.beginPath();
        ctx.arc(sx, sy, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.fill();

        // Connect front-facing orbiting particle to nearest outer sphere vertex
        if (z3 > 0.25 && i % 2 === 0) {
          const targetVertex = outerProjected[(i * 3) % outerProjected.length];
          if (targetVertex.z > 0.1) {
            const dist = Math.hypot(sx - targetVertex.x, sy - targetVertex.y);
            if (dist < baseRadius * 0.48) {
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(targetVertex.x, targetVertex.y);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      // 7. Interactive click-triggered equatorial shockwave pulse
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const wave = shockwaves[s];
        wave.radius += 0.028;
        wave.alpha *= 0.945;

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${wave.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        if (wave.alpha < 0.02 || wave.radius > 1.85) {
          shockwaves.splice(s, 1);
        }
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
