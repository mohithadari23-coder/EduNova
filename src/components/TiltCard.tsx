import { useState, type MouseEvent, type ReactNode } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function TiltCard({ children, className = '', delay = 0 }: TiltCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const smoothRotateX = useSpring(rotateX, { stiffness: 260, damping: 22 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 260, damping: 22 });
  const smoothGlowX = useSpring(glowX, { stiffness: 240, damping: 28 });
  const smoothGlowY = useSpring(glowY, { stiffness: 240, damping: 28 });

  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${smoothGlowX}% ${smoothGlowY}%, rgba(255, 255, 255, 0.08), transparent 65%)`;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set(-(py - 0.5) * 6.5);
    rotateY.set((px - 0.5) * 6.5);
    glowX.set(px * 100);
    glowY.set(py * 100);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      data-cursor="card"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.008 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.52, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        prefersReducedMotion
          ? undefined
          : {
              transformPerspective: 1100,
              rotateX: smoothRotateX,
              rotateY: smoothRotateY,
            }
      }
      className={`relative overflow-hidden border border-[#262626] bg-[#0A0A0A] transition-colors duration-200 hover:border-[#525252] ${className}`}
    >
      {/* Dynamic monochrome cursor spotlight sheen */}
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          style={{ background: spotlight }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 z-0"
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
