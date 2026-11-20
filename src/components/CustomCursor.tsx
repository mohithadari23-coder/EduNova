import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

type CursorVariant = 'default' | 'pointer' | 'card' | 'text';

export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [pressed, setPressed] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const ringX = useSpring(mouseX, { stiffness: 320, damping: 28, mass: 0.42 });
  const ringY = useSpring(mouseY, { stiffness: 320, damping: 28, mass: 0.42 });

  const haloX = useSpring(mouseX, { stiffness: 180, damping: 26, mass: 0.65 });
  const haloY = useSpring(mouseY, { stiffness: 180, damping: 26, mass: 0.65 });

  useEffect(() => {
    if (prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    const finePointerQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    const updateCapability = () => {
      setEnabled(finePointerQuery.matches);
    };

    updateCapability();
    finePointerQuery.addEventListener('change', updateCapability);

    const onTouchStart = () => {
      setEnabled(false);
      setVisible(false);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      finePointerQuery.removeEventListener('change', updateCapability);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (enabled && visible) {
      document.body.classList.add('custom-cursor-active');
    } else {
      document.body.classList.remove('custom-cursor-active');
    }
    return () => {
      document.body.classList.remove('custom-cursor-active');
    };
  }, [enabled, visible]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target || typeof target.closest !== 'function') {
        setVariant('default');
        return;
      }

      if (target.closest('textarea, input[type="text"], input[type="password"]')) {
        setVariant('text');
      } else if (target.closest('button, a, [role="button"], [data-cursor="interactive"]')) {
        setVariant('pointer');
      } else if (target.closest('[data-cursor="card"]')) {
        setVariant('card');
      } else {
        setVariant('default');
      }
    };

    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled || !visible) return null;

  const ringScale = pressed
    ? 0.8
    : variant === 'pointer'
      ? 1.9
      : variant === 'card'
        ? 1.45
        : variant === 'text'
          ? 0.65
          : 1;
  const dotScale = pressed
    ? 1.5
    : variant === 'pointer'
      ? 0.4
      : variant === 'text'
        ? 0.6
        : 1;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference"
      aria-hidden="true"
    >
      <motion.div
        style={{
          x: haloX,
          y: haloY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: variant === 'pointer' ? 2.4 : variant === 'card' ? 1.85 : 0.9,
          opacity: variant === 'pointer' || variant === 'card' ? 0.38 : 0.14,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 h-9 w-9 rounded-full border border-dashed border-white"
      />

      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: ringScale,
          borderRadius: variant === 'text' ? '3px' : '9999px',
          backgroundColor:
            variant === 'pointer' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0)',
        }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 h-8 w-8 border border-white"
      />

      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ scale: dotScale }}
        transition={{ duration: 0.1 }}
        className="fixed top-0 left-0 h-2 w-2 rounded-full bg-white"
      />
    </div>
  );
}
