'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ScrollProgress } from './components/animated';

export function LayoutAnimations() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      {/* Scroll progress bar at very top */}
      <ScrollProgress />

      {/* Page transition overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="fixed inset-0 z-[200] pointer-events-none"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'top', background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(16,185,129,0.15))' }}
        />
      </AnimatePresence>
    </>
  );
}
