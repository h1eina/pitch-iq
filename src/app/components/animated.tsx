'use client';
import { motion, useInView, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState, ReactNode, createContext, useContext } from 'react';

/* ── ScrollReveal ── */
export function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }: {
  children: ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const offsets: Record<string, { y: number; x: number }> = {
    up: { y: 40, x: 0 }, down: { y: -40, x: 0 }, left: { y: 0, x: -40 }, right: { y: 0, x: 40 },
  };
  const { y, x } = offsets[direction] || offsets.up;
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y, x }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

/* ── StaggerContainer + StaggerItem ── */
export function StaggerContainer({ children, className = '', staggerDelay = 0.08 }: {
  children: ReactNode; className?: string; staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} className={className}
      initial="hidden" animate={isInView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: staggerDelay } }, hidden: {} }}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
      }}>
      {children}
    </motion.div>
  );
}

/* ── MagneticButton ── */
export function MagneticButton({ children, className = '', intensity = 0.3 }: {
  children: ReactNode; className?: string; intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * intensity);
    y.set((e.clientY - rect.top - rect.height / 2) * intensity);
  };
  const reset = () => { x.set(0); y.set(0); };
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} className={className}
      onMouseMove={handleMouse} onMouseLeave={reset}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      {children}
    </motion.div>
  );
}

/* ── AnimatedCounter ── */
export function AnimatedCounter({ value, duration = 2, label, className = '' }: {
  value: number; duration?: number; label?: string; className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const end = value;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value, duration]);
  return (
    <motion.div className={className} initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ type: 'spring', bounce: 0.4 }}>
      <span ref={ref} className="text-3xl font-black tabular-nums">{display}</span>
      {label && <span className="block text-xs text-slate-500 mt-1">{label}</span>}
    </motion.div>
  );
}

/* ── GlowCard ── */
export function GlowCard({ children, className = '', color = 'orange' }: {
  children: ReactNode; className?: string; color?: 'orange' | 'emerald' | 'cyan' | 'violet';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const colors = { orange: '249,115,22', emerald: '16,185,129', cyan: '6,182,212', violet: '139,92,246' };
  const c = colors[color];
  return (
    <motion.div ref={ref} className={`relative overflow-hidden ${className}`}
      onMouseMove={e => { const r = ref.current?.getBoundingClientRect(); if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(${c},0.12), transparent 60%)` }} />
      {children}
    </motion.div>
  );
}

/* ── Lightbox ── */
const LightboxCtx = createContext<{ open: (content: ReactNode) => void; close: () => void }>({ open: () => {}, close: () => {} });
export const useLightbox = () => useContext(LightboxCtx);

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ReactNode | null>(null);
  return (
    <LightboxCtx.Provider value={{ open: setContent, close: () => setContent(null) }}>
      {children}
      <AnimatePresence>
        {content && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setContent(null)} />
            <motion.div className="relative z-10 w-full max-w-lg"
              initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }} transition={{ type: 'spring', bounce: 0.25 }}>
              {content}
              <button onClick={() => setContent(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 transition flex items-center justify-center text-sm font-bold">✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxCtx.Provider>
  );
}

/* ── ScrollProgress ── */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]">
      <motion.div className="h-full bg-gradient-to-r from-orange-500 via-emerald-400 to-cyan-400"
        style={{ scaleX: progress, transformOrigin: '0%' }} />
    </div>
  );
}

/* ── FloatingParticles ── */
export function FloatingParticles({ count = 20 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i}
          className="absolute w-1 h-1 rounded-full bg-orange-400/20"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }} />
      ))}
    </div>
  );
}
