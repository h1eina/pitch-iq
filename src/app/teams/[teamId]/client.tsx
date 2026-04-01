'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Users, Trophy, MapPin, Calendar, TrendingUp, Target, Activity,
  ArrowLeft, Star, Zap, BarChart3, Crosshair
} from 'lucide-react';
import type { Team, Player } from '@/lib/types';

const posColors: Record<string, string> = {
  GK: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DEF: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MID: 'bg-green-500/20 text-green-400 border-green-500/30',
  FW: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
      <span className="text-lg">{icon}</span>
      <p className="text-lg font-black text-white mt-1">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function FormBadge({ result }: { result: string }) {
  const colors = { W: 'bg-emerald-500 text-white', D: 'bg-amber-500 text-black', L: 'bg-red-500 text-white' };
  return <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${colors[result as keyof typeof colors] || 'bg-slate-500 text-white'}`}>{result}</span>;
}

function StyleBar({ label, value, max = 20 }: { label: string; value: number | string; max?: number }) {
  const numVal = typeof value === 'number' ? value : 10;
  const pct = Math.min(100, (numVal / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-400 w-32 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
      </div>
      <span className="text-xs font-bold text-white w-10 text-right">{value}</span>
    </div>
  );
}

export default function TeamProfileClient({ team, players }: { team: Team; players: Player[] }) {
  const [tab, setTab] = useState<'overview' | 'squad' | 'stats' | 'style' | 'transfers'>('overview');
  const s = team.seasonStats;

  const grouped = useMemo(() => {
    const g: Record<string, Player[]> = { GK: [], DEF: [], MID: [], FW: [] };
    players.forEach(p => { if (g[p.position]) g[p.position].push(p); });
    return g;
  }, [players]);

  const points = s.won * 3 + s.drawn;
  const gd = s.goalsFor - s.goalsAgainst;

  return (
    <div className="space-y-6">
      <Link href="/players" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500/10 via-transparent to-emerald-500/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-orange-500/20">
              {team.shortName}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">{team.name}</h1>
              <p className="text-slate-400 flex items-center gap-4 flex-wrap text-sm">
                <span className="flex items-center gap-1"><Shield size={14} /> {team.league}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {team.city}, {team.country}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Est. {team.founded}</span>
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>🏟️ {team.stadium} ({team.capacity.toLocaleString()})</span>
                <span>👔 {team.manager}</span>
                <span>💰 {team.marketValue}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
                <span className="text-2xl font-black text-white">{points}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Points</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 border-t border-white/[0.06] flex items-center gap-3">
          <span className="text-xs text-slate-500">Form:</span>
          <div className="flex gap-1">{team.recentForm.map((r, i) => <FormBadge key={i} result={r} />)}</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 glass-strong rounded-xl p-1 border border-white/[0.06] overflow-x-auto">
        {(['overview', 'squad', 'stats', 'style', 'transfers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              tab === t ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>{t}</button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-orange-400" /> Season Overview</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Played" value={s.played} icon="🎮" />
              <StatCard label="Won" value={s.won} icon="✅" />
              <StatCard label="Drawn" value={s.drawn} icon="➖" />
              <StatCard label="Lost" value={s.lost} icon="❌" />
              <StatCard label="GF" value={s.goalsFor} icon="⚽" />
              <StatCard label="GA" value={s.goalsAgainst} icon="🥅" />
              <StatCard label="GD" value={gd > 0 ? `+${gd}` : gd} icon="📊" />
              <StatCard label="Clean Sheets" value={s.cleanSheets} icon="🧤" />
              <StatCard label="xG" value={s.xGFor.toFixed(1)} icon="📈" />
            </div>
          </div>
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Users size={18} className="text-emerald-400" /> Top Players</h3>
            <div className="space-y-2">
              {players.sort((a, b) => b.seasonStats.goals + b.seasonStats.assists - a.seasonStats.goals - a.seasonStats.assists).slice(0, 5).map(p => (
                <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/40 to-amber-500/40 flex items-center justify-center text-[10px] font-bold text-white">{p.shirtNumber}</div>
                  <div className="flex-1"><p className="text-xs font-semibold text-white">{p.name}</p><p className="text-[10px] text-slate-500">{p.position}</p></div>
                  <div className="text-right"><span className="text-xs text-white font-bold">{p.seasonStats.goals}G {p.seasonStats.assists}A</span></div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'squad' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {Object.entries(grouped).map(([pos, pls]) => (
            <div key={pos} className="glass-strong rounded-xl border border-white/[0.06] p-5">
              <h3 className="text-sm font-bold text-slate-400 mb-3">{pos === 'GK' ? 'GOALKEEPERS' : pos === 'DEF' ? 'DEFENDERS' : pos === 'MID' ? 'MIDFIELDERS' : 'FORWARDS'} ({pls.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {pls.map(p => (
                  <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center text-sm font-bold text-white">{p.shirtNumber}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.nationality} · Age {p.age}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${posColors[pos]}`}>{pos}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.seasonStats.appearances} apps</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'stats' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Detailed Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(s).map(([key, val]) => (
              <div key={key} className="p-3 rounded-xl bg-white/[0.03]">
                <p className="text-lg font-bold text-white">{typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}</p>
                <p className="text-[10px] text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === 'style' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Crosshair size={18} className="text-orange-400" /> Playing Style (FM-Style)</h3>
            <div className="space-y-3">
              <StyleBar label="Possession" value={team.style.possession} />
              <StyleBar label="Pressing" value={team.style.pressing} />
              <StyleBar label="Passing Directness" value={team.style.passingDirectness} />
              <StyleBar label="Tempo" value={team.style.tempoSpeed} />
              <StyleBar label="Creativity" value={team.style.creativity} />
              <StyleBar label="Discipline" value={team.style.discipline} />
              <StyleBar label="Set Pieces" value={team.style.setpieces} />
              <StyleBar label="Counter Attack" value={team.style.counterAttack} />
            </div>
          </div>
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-bold text-white mb-4">Tactical Setup</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]"><span className="text-xs text-slate-400">Formation</span><span className="text-sm font-bold text-white">{team.formation}</span></div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]"><span className="text-xs text-slate-400">Defensive Line</span><span className="text-sm font-bold text-white capitalize">{team.style.defensiveLine}</span></div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]"><span className="text-xs text-slate-400">Width</span><span className="text-sm font-bold text-white capitalize">{team.style.width}</span></div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]"><span className="text-xs text-slate-400">Avg Possession</span><span className="text-sm font-bold text-white">{s.possessionAvg}%</span></div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]"><span className="text-xs text-slate-400">Pass Accuracy</span><span className="text-sm font-bold text-white">{s.passAccuracyAvg}%</span></div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]"><span className="text-xs text-slate-400">PPDA</span><span className="text-sm font-bold text-white">{s.ppda.toFixed(1)}</span></div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03]"><span className="text-xs text-slate-400">High Press Success</span><span className="text-sm font-bold text-white">{s.highPressSuccessRate}%</span></div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'transfers' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-orange-400" /> Transfer Activity</h3>
          {team.transfers.length === 0 ? (
            <p className="text-slate-500 text-sm">No transfer activity recorded.</p>
          ) : (
            <div className="space-y-2">
              {team.transfers.map((t, i) => {
                const isIncoming = t.toTeam === team.name;
                return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isIncoming ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isIncoming ? 'IN' : 'OUT'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{t.player}</p>
                    <p className="text-[10px] text-slate-500">{isIncoming ? `From ${t.fromTeam}` : `To ${t.toTeam}`} · {t.transferType}</p>
                  </div>
                  <span className="text-xs font-bold text-orange-400">{t.fee}</span>
                </div>
                );
              })}
            </div>
          )}
          {/* Injuries */}
          {team.injuries.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3">🏥 Injury Room</h3>
              <div className="space-y-2">
                {team.injuries.map((inj, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <span className="text-lg">🤕</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{inj.player}</p>
                      <p className="text-[10px] text-slate-500">{inj.injury} · {inj.severity}</p>
                    </div>
                    <span className="text-[10px] text-red-400">{inj.expectedReturn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
