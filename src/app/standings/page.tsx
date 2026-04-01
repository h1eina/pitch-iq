'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { allStandings } from '@/data/generator';
import type { Standing, FormResult } from '@/lib/types';

const LEAGUES = [
  { id: 'premier-league', name: 'Premier League', color: '#3d195b' },
  { id: 'la-liga', name: 'La Liga', color: '#ee8707' },
  { id: 'serie-a', name: 'Serie A', color: '#024494' },
  { id: 'bundesliga', name: 'Bundesliga', color: '#d20515' },
  { id: 'ligue-1', name: 'Ligue 1', color: '#091c3e' },
];

function FormBadge({ r }: { r: FormResult }) {
  const c = r === 'W' ? 'bg-emerald-500' : r === 'D' ? 'bg-amber-500' : 'bg-red-500';
  return <span className={`w-5 h-5 rounded-full ${c} text-[9px] font-black text-white flex items-center justify-center`}>{r}</span>;
}

function ProbBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function StandingsPage() {
  const [leagueId, setLeagueId] = useState('premier-league');
  const [sortKey, setSortKey] = useState<'points' | 'goalDifference' | 'goalsFor' | 'xGDifference'>('points');

  const standings = useMemo(() => {
    const s = allStandings[leagueId] ?? [];
    return [...s].sort((a, b) => (b as any)[sortKey] - (a as any)[sortKey]);
  }, [leagueId, sortKey]);

  const totalGames = standings[0]?.played ?? 38;
  const maxPts = standings[0]?.points ?? 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Table className="text-orange-400" size={24} /> League Table Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1">Enhanced standings with xG, form, and projections</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {LEAGUES.map(l => (
            <button key={l.id} onClick={() => setLeagueId(l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${leagueId === l.id ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        {(['points', 'goalDifference', 'goalsFor', 'xGDifference'] as const).map(k => (
          <button key={k} onClick={() => setSortKey(k)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${sortKey === k ? 'bg-white/10 text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}>
            {k === 'goalDifference' ? 'GD' : k === 'goalsFor' ? 'GF' : k === 'xGDifference' ? 'xGD' : 'Pts'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase border-b border-white/5">
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Team</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">D</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center">GF</th>
              <th className="px-2 py-3 text-center">GA</th>
              <th className="px-2 py-3 text-center">GD</th>
              <th className="px-2 py-3 text-center">xGD</th>
              <th className="px-2 py-3 text-center">Pts</th>
              <th className="px-2 py-3 text-center hidden md:table-cell">PPG</th>
              <th className="px-2 py-3 text-center hidden md:table-cell">Proj</th>
              <th className="px-3 py-3 text-center hidden lg:table-cell">Form</th>
              <th className="px-3 py-3 hidden lg:table-cell">Probability</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => {
              const ppg = s.played > 0 ? (s.points / s.played) : 0;
              const projected = Math.round(ppg * totalGames);
              const titleProb = i < 1 ? Math.max(10, 90 - i * 30) : Math.max(2, 50 - i * 5);
              const relegationProb = i >= standings.length - 5 ? Math.min(90, (i - standings.length + 6) * 20) : Math.max(1, i * 0.5);
              const zone = i < 4 ? 'border-l-emerald-500' : i >= standings.length - 3 ? 'border-l-red-500' : i < 6 ? 'border-l-blue-500' : 'border-l-transparent';
              return (
                <motion.tr key={s.team.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={`border-b border-white/5 hover:bg-white/5 transition border-l-2 ${zone}`}>
                  <td className="px-3 py-2 text-slate-400 font-bold">{i + 1}</td>
                  <td className="px-3 py-2">
                    <Link href={`/teams/${s.team.id}`} className="flex items-center gap-2 hover:text-orange-400 transition">
                      <span className="text-base">{s.team.logo}</span>
                      <span className="font-bold text-white text-xs">{s.team.name}</span>
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-center text-slate-400">{s.played}</td>
                  <td className="px-2 py-2 text-center text-emerald-400">{s.won}</td>
                  <td className="px-2 py-2 text-center text-amber-400">{s.drawn}</td>
                  <td className="px-2 py-2 text-center text-red-400">{s.lost}</td>
                  <td className="px-2 py-2 text-center text-slate-300">{s.goalsFor}</td>
                  <td className="px-2 py-2 text-center text-slate-400">{s.goalsAgainst}</td>
                  <td className={`px-2 py-2 text-center font-bold ${s.goalDifference > 0 ? 'text-emerald-400' : s.goalDifference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
                  </td>
                  <td className={`px-2 py-2 text-center text-xs ${s.xGDifference > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.xGDifference > 0 ? '+' : ''}{s.xGDifference.toFixed(1)}
                  </td>
                  <td className="px-2 py-2 text-center font-black text-white">{s.points}</td>
                  <td className="px-2 py-2 text-center text-slate-400 hidden md:table-cell">{ppg.toFixed(2)}</td>
                  <td className="px-2 py-2 text-center text-orange-400 font-bold hidden md:table-cell">{projected}</td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    <div className="flex gap-0.5 justify-center">{s.form.slice(-5).map((f, fi) => <FormBadge key={fi} r={f} />)}</div>
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell w-32">
                    <div className="space-y-1">
                      <ProbBar pct={titleProb} color="#10b981" />
                      <ProbBar pct={relegationProb} color="#ef4444" />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Champions League</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Europa League</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Relegation</span>
        <span className="flex items-center gap-1"><span className="w-8 h-2 rounded bg-emerald-500/30" /> Title prob</span>
        <span className="flex items-center gap-1"><span className="w-8 h-2 rounded bg-red-500/30" /> Relegation prob</span>
      </div>
    </div>
  );
}

