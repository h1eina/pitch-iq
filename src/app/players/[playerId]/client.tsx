'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User, MapPin, Calendar, Ruler, Weight, Footprints, Shield, Star,
  TrendingUp, Target, Zap, Award, ArrowLeft, ChevronRight, Activity
} from 'lucide-react';
import type { Player } from '@/lib/types';

// SVG Attribute Radar
function AttributeRadar({ attributes, color = '#f97316' }: { attributes: { label: string; value: number }[]; color?: string }) {
  const n = attributes.length;
  const cx = 150, cy = 150, r = 120;
  const angleStep = (Math.PI * 2) / n;

  const points = attributes.map((attr, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const val = (attr.value / 20) * r;
    return { x: cx + val * Math.cos(angle), y: cy + val * Math.sin(angle), label: attr.label, value: attr.value };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
      {/* Grid rings */}
      {rings.map(scale => (
        <polygon key={scale} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
          points={Array.from({ length: n }, (_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
          }).join(' ')} />
      ))}
      {/* Axis lines */}
      {attributes.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      {/* Value polygon */}
      <motion.polygon initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}
        fill={`${color}20`} stroke={color} strokeWidth="2" points={polygon} style={{ transformOrigin: '150px 150px' }} />
      {/* Points and labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={color} />
          <text x={cx + (r + 18) * Math.cos(angleStep * i - Math.PI / 2)} y={cy + (r + 18) * Math.sin(angleStep * i - Math.PI / 2)}
            textAnchor="middle" dominantBaseline="middle" className="text-[7px] fill-slate-500 font-medium">{p.label}</text>
          <text x={cx + (r + 8) * Math.cos(angleStep * i - Math.PI / 2)} y={cy + (r + 28) * Math.sin(angleStep * i - Math.PI / 2)}
            textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-white font-bold">{p.value}</text>
        </g>
      ))}
    </svg>
  );
}

function StatBar({ label, value, max = 20, color = 'bg-orange-500' }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const rating = value >= 16 ? 'text-emerald-400' : value >= 12 ? 'text-orange-400' : value >= 8 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-slate-400 w-28 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`} />
      </div>
      <span className={`text-xs font-bold w-6 text-right ${rating}`}>{value}</span>
    </div>
  );
}

export default function PlayerProfileClient({ player, teammates }: { player: Player; teammates: Player[] }) {
  const [activeSection, setActiveSection] = useState<'overview' | 'technical' | 'mental' | 'physical' | 'stats' | 'career'>('overview');
  const { attributes: a, seasonStats: s } = player;

  const overviewRadar = useMemo(() => [
    { label: 'PAC', value: Math.round((a.acceleration + a.pace) / 2) },
    { label: 'SHO', value: Math.round((a.finishing + a.longShots) / 2) },
    { label: 'PAS', value: Math.round((a.passing + a.vision) / 2) },
    { label: 'DRI', value: Math.round((a.dribbling + a.technique) / 2) },
    { label: 'DEF', value: Math.round((a.tackling + a.marking) / 2) },
    { label: 'PHY', value: Math.round((a.strength + a.stamina) / 2) },
  ], [a]);

  const technicalAttrs = [
    { label: 'Crossing', value: a.crossing }, { label: 'Dribbling', value: a.dribbling },
    { label: 'Finishing', value: a.finishing }, { label: 'First Touch', value: a.firstTouch },
    { label: 'Free Kicks', value: a.freeKicks }, { label: 'Heading', value: a.heading },
    { label: 'Long Shots', value: a.longShots }, { label: 'Passing', value: a.passing },
    { label: 'Tackling', value: a.tackling }, { label: 'Technique', value: a.technique },
    { label: 'Corners', value: a.corners }, { label: 'Marking', value: a.marking },
  ];

  const mentalAttrs = [
    { label: 'Aggression', value: a.aggression }, { label: 'Anticipation', value: a.anticipation },
    { label: 'Bravery', value: a.bravery }, { label: 'Composure', value: a.composure },
    { label: 'Concentration', value: a.concentration }, { label: 'Creativity', value: a.creativity },
    { label: 'Decisions', value: a.decisions }, { label: 'Determination', value: a.determination },
    { label: 'Flair', value: a.flair }, { label: 'Leadership', value: a.leadership },
    { label: 'Off the Ball', value: a.offTheBall }, { label: 'Positioning', value: a.positioning },
    { label: 'Teamwork', value: a.teamwork }, { label: 'Vision', value: a.vision },
    { label: 'Work Rate', value: a.workRate },
  ];

  const physicalAttrs = [
    { label: 'Acceleration', value: a.acceleration }, { label: 'Pace', value: a.pace },
    { label: 'Agility', value: a.agility }, { label: 'Balance', value: a.balance },
    { label: 'Jumping', value: a.jumpingReach }, { label: 'Stamina', value: a.stamina },
    { label: 'Strength', value: a.strength }, { label: 'Natural Fitness', value: a.naturalFitness },
  ];

  const avgRating = Math.round(player.recentForm.reduce((a, b) => a + b, 0) / Math.max(1, player.recentForm.length) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link href="/players" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 transition-colors">
        <ArrowLeft size={16} /> Back to Players
      </Link>

      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500/10 via-transparent to-emerald-500/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-orange-500/20">
              {player.shirtNumber}
            </div>
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{player.name}</h1>
                <span className="px-2 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">{player.position}</span>
              </div>
              <p className="text-slate-400 flex items-center gap-4 flex-wrap text-sm">
                <span className="flex items-center gap-1"><Shield size={14} /> {player.team}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {player.nationality}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Age {player.age}</span>
                <span className="flex items-center gap-1"><Ruler size={14} /> {player.height}cm</span>
                <span className="flex items-center gap-1"><Footprints size={14} /> {player.preferredFoot}</span>
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span>Contract: {player.contractUntil}</span>
                <span>Value: {player.marketValue}</span>
                <span>Wage: {player.wage}</span>
              </div>
            </div>
            {/* Overall Rating */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <span className="text-3xl font-black text-white">{avgRating || '-'}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* Recent Form */}
        <div className="px-6 py-3 border-t border-white/[0.06] flex items-center gap-3">
          <span className="text-xs text-slate-500">Recent Form:</span>
          <div className="flex gap-1">
            {player.recentForm.map((r, i) => (
              <span key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                r >= 7.5 ? 'bg-emerald-500/20 text-emerald-400' : r >= 6.5 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
              }`}>{r.toFixed(1)}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Section Tabs */}
      <div className="flex gap-1 glass-strong rounded-xl p-1 border border-white/[0.06] overflow-x-auto">
        {(['overview', 'technical', 'mental', 'physical', 'stats', 'career'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              activeSection === s ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>{s}</button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Target size={18} className="text-orange-400" /> Attribute Overview</h3>
            <AttributeRadar attributes={overviewRadar} />
          </div>
          {/* Key Stats */}
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-emerald-400" /> Season Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Apps', value: s.appearances, icon: '👕' },
                { label: 'Goals', value: s.goals, icon: '⚽' },
                { label: 'Assists', value: s.assists, icon: '🅰️' },
                { label: 'xG', value: s.expectedGoals.toFixed(1), icon: '📊' },
                { label: 'xA', value: s.expectedAssists.toFixed(1), icon: '📈' },
                { label: 'Minutes', value: s.minutesPlayed, icon: '⏱️' },
                { label: 'Pass %', value: `${s.passAccuracy}%`, icon: '🎯' },
                { label: 'Tackles', value: s.tackles, icon: '🦵' },
                { label: 'Clean Sheets', value: s.cleanSheets, icon: '🧤' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                  <span className="text-lg">{stat.icon}</span>
                  <p className="text-lg font-black text-white mt-1">{stat.value}</p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'technical' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-4">TECHNICAL ATTRIBUTES</h3>
            <div className="space-y-2">{technicalAttrs.map(attr => <StatBar key={attr.label} label={attr.label} value={attr.value} color="bg-gradient-to-r from-orange-500 to-amber-500" />)}</div>
          </div>
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <AttributeRadar attributes={technicalAttrs} color="#f97316" />
          </div>
        </motion.div>
      )}

      {activeSection === 'mental' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-4">MENTAL ATTRIBUTES</h3>
            <div className="space-y-2">{mentalAttrs.map(attr => <StatBar key={attr.label} label={attr.label} value={attr.value} color="bg-gradient-to-r from-cyan-500 to-blue-500" />)}</div>
          </div>
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <AttributeRadar attributes={mentalAttrs} color="#06b6d4" />
          </div>
        </motion.div>
      )}

      {activeSection === 'physical' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <h3 className="text-sm font-bold text-slate-400 mb-4">PHYSICAL ATTRIBUTES</h3>
            <div className="space-y-2">{physicalAttrs.map(attr => <StatBar key={attr.label} label={attr.label} value={attr.value} color="bg-gradient-to-r from-emerald-500 to-green-500" />)}</div>
          </div>
          <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
            <AttributeRadar attributes={physicalAttrs} color="#10b981" />
          </div>
        </motion.div>
      )}

      {activeSection === 'stats' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Detailed Season Statistics</h3>
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

      {activeSection === 'career' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Career Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-white/[0.03]"><p className="text-2xl font-black text-white">{player.careerStats.totalAppearances}</p><p className="text-[10px] text-slate-500">Total Apps</p></div>
            <div className="text-center p-4 rounded-xl bg-white/[0.03]"><p className="text-2xl font-black text-orange-400">{player.careerStats.totalGoals}</p><p className="text-[10px] text-slate-500">Total Goals</p></div>
            <div className="text-center p-4 rounded-xl bg-white/[0.03]"><p className="text-2xl font-black text-emerald-400">{player.careerStats.totalAssists}</p><p className="text-[10px] text-slate-500">Total Assists</p></div>
            <div className="text-center p-4 rounded-xl bg-white/[0.03]"><p className="text-2xl font-black text-cyan-400">{player.careerStats.trophies.length}</p><p className="text-[10px] text-slate-500">Trophies</p></div>
          </div>
          {player.careerStats.previousClubs && player.careerStats.previousClubs.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-400 mb-3">Career Path</h4>
              <div className="space-y-2">
                {player.careerStats.previousClubs.map((club, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">{'🏟️'}</div>
                    <div className="flex-1"><p className="text-sm font-semibold text-white">{club.team}</p><p className="text-[10px] text-slate-500">{club.season} – {'present'}</p></div>
                    <div className="text-right"><p className="text-xs text-white">{club.apps} apps</p><p className="text-[10px] text-slate-500">{club.goals}G {club.assists}A</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Teammates */}
      {teammates.length > 0 && (
        <div className="glass-strong rounded-xl border border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-slate-400 mb-3">TEAMMATES</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {teammates.map(t => (
              <Link key={t.id} href={`/players/${t.id}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/[0.05] transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/40 to-amber-500/40 flex items-center justify-center text-[10px] font-bold text-white">
                  {t.shirtNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-orange-400 transition-colors">{t.name}</p>
                  <p className="text-[10px] text-slate-500">{t.position}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Scout Report */}
      {player.scoutReport && (
        <div className="glass-strong rounded-xl border border-white/[0.06] p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Award size={18} className="text-orange-400" /> Scout Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-3xl font-black text-orange-400">{player.scoutReport.valueForMoney}/10</p>
              <p className="text-[10px] text-slate-400 mt-1">Overall Rating</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-lg font-bold text-emerald-400">{player.scoutReport.valueForMoney}/10</p>
              <p className="text-[10px] text-slate-400 mt-1">Potential</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-lg font-bold text-cyan-400 capitalize">{player.scoutReport.recommendation}</p>
              <p className="text-[10px] text-slate-400 mt-1">Recommendation</p>
            </div>
          </div>
          <div className="space-y-2">
            <div><h4 className="text-xs font-bold text-emerald-400 mb-1">Strengths</h4>
              <div className="flex flex-wrap gap-1">{player.scoutReport.strengths.map(s => <span key={s} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">{s}</span>)}</div>
            </div>
            <div><h4 className="text-xs font-bold text-red-400 mb-1">Weaknesses</h4>
              <div className="flex flex-wrap gap-1">{player.scoutReport.weaknesses.map(w => <span key={w} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] border border-red-500/20">{w}</span>)}</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">&ldquo;{player.scoutReport.overallAssessment}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
