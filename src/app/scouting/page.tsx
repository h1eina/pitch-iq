'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Star, TrendingUp, Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { allPlayers } from '@/data/generator';
import type { Player, PlayerAttributes } from '@/lib/types';

function overallRating(p: Player): number {
  const a = p.attributes;
  const keys = Object.keys(a) as (keyof PlayerAttributes)[];
  const sum = keys.reduce((s, k) => s + (a[k] as number), 0);
  return Math.round((sum / keys.length) * 5); // scale 1-20 -> rough 5-100
}

function potential(p: Player): number {
  const base = overallRating(p);
  const ageFactor = Math.max(0, 28 - p.age) * 1.2;
  const det = p.attributes.determination ?? 10;
  return Math.min(99, Math.round(base + ageFactor + det * 0.3));
}

const TABS = ['Wonderkids', 'Hidden Gems', 'All Scouts'] as const;

export default function ScoutingPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Wonderkids');
  const [posFilter, setPosFilter] = useState<string>('All');
  const [recFilter, setRecFilter] = useState<string>('All');

  const wonderkids = useMemo(() =>
    allPlayers.filter(p => p.age <= 21).sort((a, b) => potential(b) - potential(a)).slice(0, 50),
  []);

  const hiddenGems = useMemo(() =>
    allPlayers.filter(p => p.age >= 22 && p.age <= 26 && p.scoutReport?.recommendation === 'sign' && (p.scoutReport?.valueForMoney ?? 0) >= 7)
      .sort((a, b) => overallRating(b) - overallRating(a)).slice(0, 40),
  []);

  const allScouted = useMemo(() =>
    allPlayers.filter(p => p.scoutReport).sort((a, b) => overallRating(b) - overallRating(a)),
  []);

  const list = tab === 'Wonderkids' ? wonderkids : tab === 'Hidden Gems' ? hiddenGems : allScouted;
  const positions = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

  const filtered = useMemo(() => {
    let r = list;
    if (posFilter !== 'All') r = r.filter(p => p.position === posFilter);
    if (recFilter !== 'All') r = r.filter(p => p.scoutReport?.recommendation === recFilter);
    return r;
  }, [list, posFilter, recFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Eye className="text-orange-400" size={24} /> Scouting Network
        </h1>
        <p className="text-sm text-slate-400 mt-1">Wonderkid watchlist, hidden gems, and scout recommendations</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tab === t ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {t === 'Wonderkids' && <Sparkles size={12} className="inline mr-1" />}
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {positions.map(p => (
          <button key={p} onClick={() => setPosFilter(p)}
            className={`px-2 py-1 rounded text-[10px] font-bold ${posFilter === p ? 'bg-white/10 text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}>
            {p}
          </button>
        ))}
        <span className="text-slate-600 mx-1">|</span>
        {['All', 'sign', 'monitor', 'avoid'].map(r => (
          <button key={r} onClick={() => setRecFilter(r)}
            className={`px-2 py-1 rounded text-[10px] font-bold ${recFilter === r ? 'bg-white/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
            {r === 'All' ? 'All Recs' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-500">{filtered.length} players</div>

      <div className="grid gap-3">
        {filtered.slice(0, 30).map((p, i) => {
          const ovr = overallRating(p);
          const pot = potential(p);
          const rec = p.scoutReport?.recommendation;
          const recColor = rec === 'sign' ? 'text-emerald-400 bg-emerald-500/10' : rec === 'monitor' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10';
          return (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
              <Link href={`/players/${p.id}`} className="card p-4 flex items-center gap-4 hover:bg-white/5 transition group">
                <div className="text-lg font-black text-slate-600 w-6">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm group-hover:text-orange-400 transition truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500">{p.position} · {p.team} · {p.age}y · {p.nationality}</p>
                  {p.scoutReport && (
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">&quot;{p.scoutReport.overallAssessment}&quot;</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-[8px] text-slate-600 uppercase">OVR</p>
                    <p className={`text-sm font-black ${ovr >= 75 ? 'text-emerald-400' : ovr >= 60 ? 'text-amber-400' : 'text-slate-400'}`}>{ovr}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-slate-600 uppercase">POT</p>
                    <p className={`text-sm font-black ${pot >= 85 ? 'text-orange-400' : pot >= 70 ? 'text-cyan-400' : 'text-slate-400'}`}>{pot}</p>
                  </div>
                  {tab === 'Wonderkids' && (
                    <div className="text-center">
                      <p className="text-[8px] text-slate-600 uppercase">Growth</p>
                      <p className="text-sm font-black text-purple-400">+{pot - ovr}</p>
                    </div>
                  )}
                  {rec && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${recColor}`}>
                      {rec.toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-slate-600">{p.marketValue}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

