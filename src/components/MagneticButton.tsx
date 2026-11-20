import type { MouseEvent, ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  strength?: number;
  ariaLabel?: string;
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  strength = 0.26,
  ariaLabel,
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 320, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 320, damping: 22, mass: 0.4 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-10, Math.min(10, offsetX * strength)));
    y.set(Math.max(-8, Math.min(8, offsetY * strength)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </motion.button>
  );
}
