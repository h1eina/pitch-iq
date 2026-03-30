'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { X } from 'lucide-react';

// === Fade-In Section (appears on scroll) ===
export function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// === Staggered children ===
export function StaggerContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// === Pop Button ===
export function PopButton({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(249, 115, 22, 0.25)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`pop-btn ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// === Pulse Card ===
export function PulseCard({ children, className = '', glowColor = 'orange' }: { children: ReactNode; className?: string; glowColor?: string }) {
  const glowMap: Record<string, string> = {
    orange: 'rgba(249, 115, 22, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
    violet: 'rgba(139, 92, 246, 0.15)',
    cyan: 'rgba(6, 182, 212, 0.15)',
  };
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow: `0 12px 48px rgba(0,0,0,0.3), 0 0 40px ${glowMap[glowColor] || glowMap.orange}`,
        borderColor: 'rgba(255,255,255,0.12)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  );
}

// === Lightbox ===
export function Lightbox({ isOpen, onClose, children, title }: { isOpen: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="lightbox-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lightbox-content p-6 sm:p-8 min-w-[320px] max-w-[600px] w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-auto"
              >
                <X size={18} />
              </motion.button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === Disappearing Element ===
export function DisappearOnScroll({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, height: 'auto' }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// === Animated Counter ===
export function AnimatedNumber({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {value}{suffix}
    </motion.span>
  );
}

// === Hover Reveal ===
export function HoverReveal({ trigger, content, className = '' }: { trigger: ReactNode; content: ReactNode; className?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className={`relative ${className}`} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {trigger}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === Gradient Border Card ===
export function GradientBorderCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative p-[1px] rounded-2xl overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-emerald-500/20 to-violet-500/30 animate-border-flow" />
      <div className="relative bg-[#0f1629] rounded-2xl p-5">
        {children}
      </div>
    </div>
  );
}
