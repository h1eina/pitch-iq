'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layout, RotateCcw, Download, Palette } from 'lucide-react';

type Pos = { x: number; y: number; label: string };

const FORMATIONS: Record<string, Pos[]> = {
  '4-3-3': [
    { x: 50, y: 90, label: 'GK' },
    { x: 15, y: 70, label: 'LB' }, { x: 38, y: 75, label: 'CB' }, { x: 62, y: 75, label: 'CB' }, { x: 85, y: 70, label: 'RB' },
    { x: 25, y: 50, label: 'CM' }, { x: 50, y: 55, label: 'CM' }, { x: 75, y: 50, label: 'CM' },
    { x: 15, y: 25, label: 'LW' }, { x: 50, y: 20, label: 'ST' }, { x: 85, y: 25, label: 'RW' },
  ],
  '4-4-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 15, y: 70, label: 'LB' }, { x: 38, y: 75, label: 'CB' }, { x: 62, y: 75, label: 'CB' }, { x: 85, y: 70, label: 'RB' },
    { x: 12, y: 48, label: 'LM' }, { x: 38, y: 52, label: 'CM' }, { x: 62, y: 52, label: 'CM' }, { x: 88, y: 48, label: 'RM' },
    { x: 35, y: 22, label: 'ST' }, { x: 65, y: 22, label: 'ST' },
  ],
  '3-5-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 25, y: 75, label: 'CB' }, { x: 50, y: 78, label: 'CB' }, { x: 75, y: 75, label: 'CB' },
    { x: 8, y: 50, label: 'LWB' }, { x: 30, y: 52, label: 'CM' }, { x: 50, y: 48, label: 'CDM' }, { x: 70, y: 52, label: 'CM' }, { x: 92, y: 50, label: 'RWB' },
    { x: 35, y: 22, label: 'ST' }, { x: 65, y: 22, label: 'ST' },
  ],
  '4-2-3-1': [
    { x: 50, y: 90, label: 'GK' },
    { x: 15, y: 70, label: 'LB' }, { x: 38, y: 75, label: 'CB' }, { x: 62, y: 75, label: 'CB' }, { x: 85, y: 70, label: 'RB' },
    { x: 35, y: 55, label: 'CDM' }, { x: 65, y: 55, label: 'CDM' },
    { x: 15, y: 35, label: 'LW' }, { x: 50, y: 38, label: 'CAM' }, { x: 85, y: 35, label: 'RW' },
    { x: 50, y: 18, label: 'ST' },
  ],
  '3-4-3': [
    { x: 50, y: 90, label: 'GK' },
    { x: 25, y: 75, label: 'CB' }, { x: 50, y: 78, label: 'CB' }, { x: 75, y: 75, label: 'CB' },
    { x: 10, y: 50, label: 'LWB' }, { x: 38, y: 52, label: 'CM' }, { x: 62, y: 52, label: 'CM' }, { x: 90, y: 50, label: 'RWB' },
    { x: 20, y: 25, label: 'LW' }, { x: 50, y: 20, label: 'ST' }, { x: 80, y: 25, label: 'RW' },
  ],
  '5-3-2': [
    { x: 50, y: 90, label: 'GK' },
    { x: 8, y: 68, label: 'LWB' }, { x: 28, y: 75, label: 'CB' }, { x: 50, y: 78, label: 'CB' }, { x: 72, y: 75, label: 'CB' }, { x: 92, y: 68, label: 'RWB' },
    { x: 25, y: 50, label: 'CM' }, { x: 50, y: 48, label: 'CM' }, { x: 75, y: 50, label: 'CM' },
    { x: 35, y: 22, label: 'ST' }, { x: 65, y: 22, label: 'ST' },
  ],
};

const COLORS = ['#f97316', '#06b6d4', '#8b5cf6', '#10b981', '#ef4444', '#eab308'];

export default function TacticsPage() {
  const [formation, setFormation] = useState('4-3-3');
  const [positions, setPositions] = useState<Pos[]>(FORMATIONS['4-3-3']);
  const [dragging, setDragging] = useState<number | null>(null);
  const [teamColor, setTeamColor] = useState('#f97316');
  const [names, setNames] = useState<string[]>(Array(11).fill(''));

  const switchFormation = (f: string) => {
    setFormation(f);
    setPositions(FORMATIONS[f]);
    setNames(Array(11).fill(''));
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPositions(prev => prev.map((p, i) => i === dragging ? { ...p, x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) } : p));
  }, [dragging]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Layout className="text-orange-400" size={24} /> Tactical Board
        </h1>
        <p className="text-sm text-slate-400 mt-1">Drag players to customize formations. Click player labels to rename.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {Object.keys(FORMATIONS).map(f => (
          <button key={f} onClick={() => switchFormation(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${formation === f ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {f}
          </button>
        ))}
        <span className="text-slate-600 mx-2">|</span>
        {COLORS.map(c => (
          <button key={c} onClick={() => setTeamColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition ${teamColor === c ? 'border-white scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: c }} />
        ))}
        <button onClick={() => switchFormation(formation)} className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs hover:bg-white/10">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Pitch */}
      <div className="card p-2">
        <div className="relative w-full aspect-[2/3] max-w-lg mx-auto rounded-xl overflow-hidden select-none"
          style={{ background: 'linear-gradient(180deg, #1a472a 0%, #2d5a3f 50%, #1a472a 100%)' }}
          onMouseMove={handleMouseMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}>
          {/* Pitch markings */}
          <div className="absolute inset-4 border border-white/20 rounded" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border border-white/20 rounded" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border border-white/20 rounded" />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-20 h-20 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full" />

          {/* Players */}
          {positions.map((p, i) => (
            <motion.div key={i} className="absolute cursor-grab active:cursor-grabbing"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={() => setDragging(i)} whileHover={{ scale: 1.15 }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg border-2 border-white/30"
                style={{ backgroundColor: teamColor }}>
                {names[i] || p.label}
              </div>
              <input value={names[i]} onChange={e => setNames(prev => prev.map((n, ni) => ni === i ? e.target.value : n))}
                placeholder={p.label} className="mt-0.5 w-16 -ml-3 text-[8px] text-center bg-black/50 text-white rounded px-1 py-0.5 border-none outline-none placeholder:text-white/40" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500">
        Drag players to reposition · Type names below each marker · {formation} formation
      </div>
    </div>
  );
}

