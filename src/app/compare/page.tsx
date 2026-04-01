'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCompareArrows, Search, Trophy, Target, Zap, Shield, Brain, ArrowRight } from 'lucide-react';
import { allPlayers } from '@/data/generator';
import type { Player, PlayerAttributes } from '@/lib/types';

const ATTR_GROUPS: { label: string; color: string; keys: (keyof PlayerAttributes)[] }[] = [
  { label: 'Technical', color: '#f97316', keys: ['crossing', 'dribbling', 'finishing', 'firstTouch', 'passing', 'technique', 'longShots', 'heading'] },
  { label: 'Mental', color: '#8b5cf6', keys: ['anticipation', 'composure', 'creativity', 'decisions', 'determination', 'flair', 'leadership', 'workRate'] },
  { label: 'Physical', color: '#06b6d4', keys: ['acceleration', 'agility', 'balance', 'jumpingReach', 'naturalFitness', 'pace', 'stamina', 'strength'] },
];

function RadarOverlay({ p1, p2, keys, color1, color2, size = 200 }: { p1: PlayerAttributes; p2: PlayerAttributes; keys: (keyof PlayerAttributes)[]; color1: string; color2: string; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.4;
  const n = keys.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const toPoints = (attrs: PlayerAttributes) =>
    keys.map((k, i) => {
      const val = (attrs[k] as number) / 20;
      const x = cx + r * val * Math.cos(angle(i));
      const y = cy + r * val * Math.sin(angle(i));
      return `${x},${y}`;
    }).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon key={s} points={keys.map((_, i) => `${cx + r * s * Math.cos(angle(i))},${cy + r * s * Math.sin(angle(i))}`).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {keys.map((k, i) => (
        <g key={k}>
          <line x1={cx} y1={cy} x2={cx + r * Math.cos(angle(i))} y2={cy + r * Math.sin(angle(i))} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <text x={cx + (r + 14) * Math.cos(angle(i))} y={cy + (r + 14) * Math.sin(angle(i))}
            textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-[6px]">
            {String(k).replace(/([A-Z])/g, ' $1').trim().slice(0, 6)}
          </text>
        </g>
      ))}
      {/* Player 1 */}
      <polygon points={toPoints(p1)} fill={`${color1}22`} stroke={color1} strokeWidth="1.5" />
      {/* Player 2 */}
      <polygon points={toPoints(p2)} fill={`${color2}22`} stroke={color2} strokeWidth="1.5" />
    </svg>
  );
}

function StatBar({ label, v1, v2, max }: { label: string; v1: number; v2: number; max: number }) {
  const pct1 = Math.round((v1 / Math.max(max, 1)) * 100);
  const pct2 = Math.round((v2 / Math.max(max, 1)) * 100);
  const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`text-xs font-bold w-10 text-right tabular-nums ${winner === 1 ? 'text-orange-400' : 'text-slate-400'}`}>{v1}</span>
      <div className="flex-1 flex gap-0.5">
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden flex justify-end">
          <div className="h-full rounded-full bg-gradient-to-l from-orange-500 to-orange-500/50 transition-all" style={{ width: `${pct1}%` }} />
        </div>
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-500/50 transition-all" style={{ width: `${pct2}%` }} />
        </div>
      </div>
      <span className={`text-xs font-bold w-10 tabular-nums ${winner === 2 ? 'text-cyan-400' : 'text-slate-400'}`}>{v2}</span>
    </div>
  );
}

export default function ComparePage() {
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [focus1, setFocus1] = useState(false);
  const [focus2, setFocus2] = useState(false);

  const filtered1 = useMemo(() => search1.length < 2 ? [] : allPlayers.filter(p => p.name.toLowerCase().includes(search1.toLowerCase())).slice(0, 8), [search1]);
  const filtered2 = useMemo(() => search2.length < 2 ? [] : allPlayers.filter(p => p.name.toLowerCase().includes(search2.toLowerCase())).slice(0, 8), [search2]);

  const pick = (slot: 1 | 2, p: Player) => {
    if (slot === 1) { setPlayer1(p); setSearch1(p.name); setFocus1(false); }
    else { setPlayer2(p); setSearch2(p.name); setFocus2(false); }
  };

  const verdict = useMemo(() => {
    if (!player1 || !player2) return null;
    const a1 = player1.attributes, a2 = player2.attributes;
    let score1 = 0, score2 = 0;
    const allKeys = [...ATTR_GROUPS.flatMap(g => g.keys)];
    allKeys.forEach(k => {
      const v1 = a1[k] as number, v2 = a2[k] as number;
      if (v1 > v2) score1++;
      else if (v2 > v1) score2++;
    });
    const s1 = player1.seasonStats, s2 = player2.seasonStats;
    const rating1 = (s1.goals * 3 + s1.assists * 2 + s1.keyPasses * 0.5 + (player1.recentForm.reduce((a, b) => a + b, 0) / player1.recentForm.length) * 5).toFixed(1);
    const rating2 = (s2.goals * 3 + s2.assists * 2 + s2.keyPasses * 0.5 + (player2.recentForm.reduce((a, b) => a + b, 0) / player2.recentForm.length) * 5).toFixed(1);
    return { score1, score2, total: allKeys.length, rating1, rating2 };
  }, [player1, player2]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <GitCompareArrows className="text-orange-400" size={24} /> Player Comparison
        </h1>
        <p className="text-sm text-slate-400 mt-1">Compare any two players side-by-side with FM-depth attribute radars</p>
      </div>

      {/* Search Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[{ slot: 1 as const, search: search1, setSearch: setSearch1, filtered: filtered1, player: player1, focus: focus1, setFocus: setFocus1, color: 'orange' },
          { slot: 2 as const, search: search2, setSearch: setSearch2, filtered: filtered2, player: player2, focus: focus2, setFocus: setFocus2, color: 'cyan' }].map(s => (
          <div key={s.slot} className="relative">
            <div className={`card p-4 border-t-2 border-t-${s.color}-500`}>
              <label className="text-xs text-slate-500 block mb-1">Player {s.slot}</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={s.search} onChange={e => { s.setSearch(e.target.value); s.setFocus(true); }}
                  onFocus={() => s.setFocus(true)} onBlur={() => setTimeout(() => s.setFocus(false), 200)}
                  placeholder="Search player..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500" />
              </div>
              {s.focus && s.filtered.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {s.filtered.map(p => (
                    <button key={p.id} onMouseDown={() => pick(s.slot, p)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-white/5 transition">
                      <span className="text-sm font-bold text-white">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.position} · {p.team}</span>
                    </button>
                  ))}
                </div>
              )}
              {s.player && (
                <div className="mt-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${s.color}-500/20 flex items-center justify-center text-lg font-black text-${s.color}-400`}>
                    {s.player.shirtNumber}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{s.player.name}</p>
                    <p className="text-[10px] text-slate-400">{s.player.position} · {s.player.team} · {s.player.age}y · {s.player.nationality}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Content */}
      {player1 && player2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Verdict Banner */}
          {verdict && (
            <div className="card p-5 text-center bg-gradient-to-r from-orange-500/5 via-transparent to-cyan-500/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Attribute Verdict</p>
              <div className="flex items-center justify-center gap-6">
                <div className="text-right">
                  <p className="text-2xl font-black text-orange-400">{verdict.score1}</p>
                  <p className="text-[10px] text-slate-500">attrs won</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-400">{verdict.total - verdict.score1 - verdict.score2} tied</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-cyan-400">{verdict.score2}</p>
                  <p className="text-[10px] text-slate-500">attrs won</p>
                </div>
              </div>
            </div>
          )}

          {/* Radar Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ATTR_GROUPS.map(g => (
              <div key={g.label} className="card p-4">
                <h3 className="text-xs font-bold text-slate-400 text-center mb-2">{g.label.toUpperCase()}</h3>
                <RadarOverlay p1={player1.attributes} p2={player2.attributes} keys={g.keys} color1="#f97316" color2="#06b6d4" />
              </div>
            ))}
          </div>

          {/* Head-to-Head Stats */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-orange-400">{player1.name}</span>
              <span className="text-xs text-slate-500">SEASON STATS</span>
              <span className="text-sm font-bold text-cyan-400">{player2.name}</span>
            </div>
            {[
              { label: 'Goals', v1: player1.seasonStats.goals, v2: player2.seasonStats.goals, max: Math.max(player1.seasonStats.goals, player2.seasonStats.goals, 1) },
              { label: 'Assists', v1: player1.seasonStats.assists, v2: player2.seasonStats.assists, max: Math.max(player1.seasonStats.assists, player2.seasonStats.assists, 1) },
              { label: 'Appearances', v1: player1.seasonStats.appearances, v2: player2.seasonStats.appearances, max: 38 },
              { label: 'xG', v1: +player1.seasonStats.expectedGoals.toFixed(1), v2: +player2.seasonStats.expectedGoals.toFixed(1), max: Math.max(player1.seasonStats.expectedGoals, player2.seasonStats.expectedGoals, 1) },
              { label: 'Key Passes', v1: player1.seasonStats.keyPasses, v2: player2.seasonStats.keyPasses, max: Math.max(player1.seasonStats.keyPasses, player2.seasonStats.keyPasses, 1) },
              { label: 'Shots/Game', v1: +player1.seasonStats.shotsPerGame.toFixed(1), v2: +player2.seasonStats.shotsPerGame.toFixed(1), max: 5 },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[10px] text-slate-500 text-center mb-0.5">{s.label}</p>
                <StatBar {...s} />
              </div>
            ))}
          </div>

          {/* Attribute Detail Table */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Full Attribute Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ATTR_GROUPS.map(g => (
                <div key={g.label}>
                  <p className="text-xs font-bold text-slate-500 mb-2">{g.label}</p>
                  {g.keys.map(k => {
                    const v1 = player1.attributes[k] as number;
                    const v2 = player2.attributes[k] as number;
                    const w = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
                    return (
                      <div key={k} className="flex items-center gap-2 py-0.5">
                        <span className={`text-xs font-mono w-5 text-right ${w === 1 ? 'text-orange-400 font-bold' : 'text-slate-400'}`}>{v1}</span>
                        <span className="flex-1 text-[10px] text-slate-500 text-center truncate">{String(k).replace(/([A-Z])/g, ' $1')}</span>
                        <span className={`text-xs font-mono w-5 ${w === 2 ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>{v2}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!player1 && !player2 && (
        <div className="card p-12 text-center">
          <GitCompareArrows size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Select two players above to compare them head-to-head</p>
        </div>
      )}
    </div>
  );
}
