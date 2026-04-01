'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Shield, Star, Crown } from 'lucide-react';
import Link from 'next/link';
import { allPlayers } from '@/data/generator';
import type { Player, PlayerAttributes } from '@/lib/types';

function ovr(p: Player): number {
  const a = p.attributes;
  const keys = Object.keys(a) as (keyof PlayerAttributes)[];
  return Math.round(keys.reduce((s, k) => s + (a[k] as number), 0) / keys.length * 5);
}

const TABS = ['Golden Boot', 'Golden Glove', 'Assist King', 'Team of the Year', 'Young POTY'] as const;

export default function AwardsPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Golden Boot');
  const [league, setLeague] = useState('premier-league');

  const leaguePlayers = useMemo(() => allPlayers.filter(p => p.leagueId === league), [league]);

  const goldenBoot = useMemo(() =>
    [...leaguePlayers].sort((a, b) => b.seasonStats.goals - a.seasonStats.goals).slice(0, 20), [leaguePlayers]);

  const goldenGlove = useMemo(() =>
    leaguePlayers.filter(p => p.position === 'GK').sort((a, b) => b.seasonStats.cleanSheets - a.seasonStats.cleanSheets).slice(0, 10), [leaguePlayers]);

  const assistKing = useMemo(() =>
    [...leaguePlayers].sort((a, b) => b.seasonStats.assists - a.seasonStats.assists).slice(0, 20), [leaguePlayers]);

  const toty = useMemo(() => {
    const byPos = (pos: string[]) => leaguePlayers.filter(p => pos.includes(p.position)).sort((a, b) => ovr(b) - ovr(a));
    return {
      gk: byPos(['GK']).slice(0, 1),
      def: byPos(['CB', 'LB', 'RB', 'LWB', 'RWB']).slice(0, 4),
      mid: byPos(['CDM', 'CM', 'CAM', 'LM', 'RM']).slice(0, 3),
      fwd: byPos(['LW', 'RW', 'ST', 'CF']).slice(0, 3),
    };
  }, [leaguePlayers]);

  const youngPoty = useMemo(() =>
    leaguePlayers.filter(p => p.age <= 23).sort((a, b) => {
      const sa = a.seasonStats, sb = b.seasonStats;
      return (sb.goals * 3 + sb.assists * 2 + sb.keyPasses) - (sa.goals * 3 + sa.assists * 2 + sa.keyPasses);
    }).slice(0, 15), [leaguePlayers]);

  const leagues = [
    { id: 'premier-league', name: 'PL' }, { id: 'la-liga', name: 'La Liga' },
    { id: 'serie-a', name: 'Serie A' }, { id: 'bundesliga', name: 'BuLi' }, { id: 'ligue-1', name: 'L1' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Award className="text-orange-400" size={24} /> Season Awards
        </h1>
        <p className="text-sm text-slate-400 mt-1">Golden Boot, TOTY, Young Player of the Year</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {leagues.map(l => (
          <button key={l.id} onClick={() => setLeague(l.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold ${league === l.id ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400'}`}>
            {l.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tab === t ? 'bg-white/10 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-slate-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {(tab === 'Golden Boot' || tab === 'Assist King') && (
        <div className="space-y-2">
          {(tab === 'Golden Boot' ? goldenBoot : assistKing).map((p, i) => {
            const val = tab === 'Golden Boot' ? p.seasonStats.goals : p.seasonStats.assists;
            const max = tab === 'Golden Boot' ? goldenBoot[0]?.seasonStats.goals : assistKing[0]?.seasonStats.assists;
            return (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/players/${p.id}`} className="card p-3 flex items-center gap-3 hover:bg-white/5 transition">
                  {i === 0 && <Crown size={16} className="text-yellow-400" />}
                  {i === 1 && <Crown size={16} className="text-slate-300" />}
                  {i === 2 && <Crown size={16} className="text-amber-700" />}
                  {i > 2 && <span className="w-4 text-center text-xs text-slate-600 font-bold">{i + 1}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.team} · {p.position}</p>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500" style={{ width: `${(val / Math.max(max, 1)) * 100}%` }} />
                  </div>
                  <span className="text-lg font-black text-orange-400 w-8 text-right">{val}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === 'Golden Glove' && (
        <div className="space-y-2">
          {goldenGlove.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/players/${p.id}`} className="card p-3 flex items-center gap-3 hover:bg-white/5 transition">
                <span className="w-4 text-center text-xs text-slate-600 font-bold">{i + 1}</span>
                <Shield size={14} className="text-cyan-400" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-500">{p.team}</p>
                </div>
                <span className="text-lg font-black text-cyan-400">{p.seasonStats.cleanSheets} CS</span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'Team of the Year' && (
        <div className="card p-6 space-y-6">
          <h3 className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Best XI</h3>
          {[
            { label: 'Forward', players: toty.fwd, color: 'text-red-400' },
            { label: 'Midfield', players: toty.mid, color: 'text-orange-400' },
            { label: 'Defence', players: toty.def, color: 'text-cyan-400' },
            { label: 'Goalkeeper', players: toty.gk, color: 'text-emerald-400' },
          ].map(row => (
            <div key={row.label}>
              <p className={`text-[10px] font-bold ${row.color} text-center mb-2`}>{row.label.toUpperCase()}</p>
              <div className="flex justify-center gap-4 flex-wrap">
                {row.players.map(p => (
                  <Link key={p.id} href={`/players/${p.id}`} className="text-center group">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-2 border-orange-500/30 flex items-center justify-center text-lg font-black text-white group-hover:border-orange-400 transition">
                      {ovr(p)}
                    </div>
                    <p className="text-[10px] font-bold text-white mt-1 truncate max-w-[80px]">{p.name}</p>
                    <p className="text-[8px] text-slate-500">{p.position} · {p.team}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Young POTY' && (
        <div className="space-y-2">
          {youngPoty.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/players/${p.id}`} className="card p-3 flex items-center gap-3 hover:bg-white/5 transition">
                <span className="w-4 text-center text-xs text-slate-600 font-bold">{i + 1}</span>
                <Star size={14} className="text-purple-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500">{p.position} · {p.team} · {p.age}y</p>
                </div>
                <div className="text-right text-[10px]">
                  <span className="text-emerald-400 font-bold">{p.seasonStats.goals}G</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-cyan-400 font-bold">{p.seasonStats.assists}A</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

