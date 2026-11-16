import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);
  const [visible, setVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fineHoverPointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!fineHoverPointer || reducedMotion) return;

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    let rafId = 0;

    const handleMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 2}px, ${
          e.clientY - 2
        }px, 0)`;
      }
      const el = e.target as HTMLElement | null;
      const interactive = Boolean(
        el?.closest('a, button, [role="button"], input, select, textarea')
      );
      setHoveringInteractive(interactive);
    };

    const handleLeave = () => setVisible(false);

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.22;
      current.current.y += (target.current.y - current.current.y) * 0.22;

      if (ringRef.current) {
        const sizeOffset = hoveringInteractive ? 10 : 7;
        ringRef.current.style.transform = `translate3d(${
          current.current.x - sizeOffset
        }px, ${current.current.y - sizeOffset}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      cancelAnimationFrame(rafId);
    };
  }, [hoveringInteractive, visible]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border transition-[width,height,border-color,opacity,background-color] duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${
          hoveringInteractive
            ? 'h-5 w-5 border-[#B68167] bg-[#B68167]/10'
            : 'h-3.5 w-3.5 border-[#B68167]/70 bg-transparent'
        }`}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-[9999] h-1 w-1 rounded-full bg-[#B68167] transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
};
