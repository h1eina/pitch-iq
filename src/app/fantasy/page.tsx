'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, DollarSign, Trophy, Star, TrendingUp, ArrowLeftRight, Shield,
  ChevronDown, Search, Filter, Zap, Crown, AlertTriangle, CheckCircle,
  RotateCcw, Sparkles, Target, Award, X, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { useFantasyStore } from '@/lib/fantasy-store';
import {
  fantasyPlayers, gameweeks, getFantasyPlayerById,
  getTopFantasyPlayers, getDreamTeam, getFantasyPlayersByPosition
} from '@/data/fantasy-data';
import type { FantasyPlayer, FantasyPosition, FantasySquad } from '@/lib/types';

// ─── Helpers ───
const positionColors: Record<FantasyPosition, string> = {
  GKP: 'from-amber-500 to-yellow-500',
  DEF: 'from-emerald-500 to-green-500',
  MID: 'from-blue-500 to-cyan-500',
  FWD: 'from-red-500 to-rose-500',
};
const positionBg: Record<FantasyPosition, string> = {
  GKP: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DEF: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  FWD: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const difficultyColors = ['', 'bg-emerald-600', 'bg-emerald-500', 'bg-gray-500', 'bg-orange-500', 'bg-red-600'];
const slotToPos = (slot: number): FantasyPosition => {
  if (slot <= 2) return 'GKP';
  if (slot <= 7) return 'DEF';
  if (slot <= 12) return 'MID';
  return 'FWD';
};

// ─── Main Component ───
export default function FantasyPage() {
  const store = useFantasyStore();
  const { squad, currentGameweek } = store;
  const [activeTab, setActiveTab] = useState<'pitch' | 'list' | 'transfers' | 'points' | 'stats'>('pitch');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<FantasyPosition | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'totalPoints' | 'price' | 'form' | 'ictIndex' | 'selectedBy'>('totalPoints');
  const [selectedPlayer, setSelectedPlayer] = useState<FantasyPlayer | null>(null);
  const [showMarket, setShowMarket] = useState(false);
  const [marketSlotTarget, setMarketSlotTarget] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentGW = useMemo(() => gameweeks.find(g => g.isCurrent), []);
  const dreamTeam = useMemo(() => getDreamTeam(), []);

  // Get squad player data
  const squadPlayers = useMemo(() => {
    return squad.players.map(sp => ({
      ...sp,
      data: getFantasyPlayerById(sp.playerId),
    })).filter(sp => sp.data);
  }, [squad.players]);

  // Market filtering
  const filteredMarket = useMemo(() => {
    let pool = [...fantasyPlayers];
    const inSquad = new Set(squad.players.map(p => p.playerId));
    pool = pool.filter(p => !inSquad.has(p.id));
    if (positionFilter !== 'ALL') pool = pool.filter(p => p.position === positionFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
    }
    pool.sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));
    return pool.slice(0, 50);
  }, [positionFilter, searchQuery, sortBy, squad.players]);

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  const handleAddPlayer = (player: FantasyPlayer) => {
    const success = store.addPlayer(player.id, player.position, player.price);
    if (success) setShowMarket(false);
  };

  const handleOpenMarket = (slot?: number) => {
    setMarketSlotTarget(slot ?? null);
    if (slot) setPositionFilter(slotToPos(slot));
    setShowMarket(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Trophy size={22} className="text-white" />
            </div>
            Fantasy Football
          </h1>
          <p className="text-slate-400 mt-1">Gameweek {currentGameweek} · Deadline: {currentGW ? new Date(currentGW.deadline).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-strong rounded-xl px-4 py-2 border border-white/[0.06]">
            <span className="text-xs text-slate-500 block">Squad Value</span>
            <span className="text-lg font-bold text-white">£{squad.totalValue.toFixed(1)}m</span>
          </div>
          <div className="glass-strong rounded-xl px-4 py-2 border border-white/[0.06]">
            <span className="text-xs text-slate-500 block">In the Bank</span>
            <span className="text-lg font-bold text-emerald-400">£{squad.bank.toFixed(1)}m</span>
          </div>
          <div className="glass-strong rounded-xl px-4 py-2 border border-white/[0.06]">
            <span className="text-xs text-slate-500 block">Total Points</span>
            <span className="text-lg font-bold text-orange-400">{squad.totalPoints}</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 glass-strong rounded-xl p-1 border border-white/[0.06] overflow-x-auto">
        {(['pitch', 'list', 'transfers', 'points', 'stats'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {tab === 'pitch' ? '⚽ Pitch View' : tab === 'list' ? '📋 List View' : tab === 'transfers' ? '🔄 Transfers' : tab === 'points' ? '📊 Points' : '📈 Stats'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'pitch' && <PitchView key="pitch" squadPlayers={squadPlayers} squad={squad} onOpenMarket={handleOpenMarket} onRemove={store.removePlayer} setCaptain={store.setCaptain} setViceCaptain={store.setViceCaptain} />}
        {activeTab === 'list' && <ListView key="list" squadPlayers={squadPlayers} squad={squad} onRemove={store.removePlayer} setCaptain={store.setCaptain} setViceCaptain={store.setViceCaptain} />}
        {activeTab === 'transfers' && <TransferMarket key="transfers" players={filteredMarket} searchQuery={searchQuery} setSearchQuery={setSearchQuery} positionFilter={positionFilter} setPositionFilter={setPositionFilter} sortBy={sortBy} setSortBy={setSortBy} onAdd={handleAddPlayer} squad={squad} canAddPosition={store.canAddPosition} />}
        {activeTab === 'points' && <PointsView key="points" squadPlayers={squadPlayers} gameweeks={gameweeks} currentGW={currentGW} dreamTeam={dreamTeam} />}
        {activeTab === 'stats' && <StatsView key="stats" />}
      </AnimatePresence>

      {/* Floating Market Modal */}
      <AnimatePresence>
        {showMarket && activeTab !== 'transfers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMarket(false)} />
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="relative z-10 w-full max-w-2xl max-h-[80vh] glass-strong rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-white">Select Player</h3>
                <button onClick={() => setShowMarket(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><X size={18} /></button>
              </div>
              <div className="px-5 py-3 border-b border-white/[0.06] flex gap-2">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search players..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50" />
                </div>
                <select value={positionFilter} onChange={e => setPositionFilter(e.target.value as FantasyPosition | 'ALL')}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none">
                  <option value="ALL">All</option><option value="GKP">GKP</option><option value="DEF">DEF</option><option value="MID">MID</option><option value="FWD">FWD</option>
                </select>
              </div>
              <div className="overflow-y-auto flex-1 p-3 space-y-1">
                {filteredMarket.slice(0, 30).map(p => (
                  <button key={p.id} onClick={() => handleAddPlayer(p)} disabled={p.price > squad.bank || !store.canAddPosition(p.position)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-left">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${positionBg[p.position]}`}>{p.position}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.team}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">£{p.price}m</span>
                    <span className="text-sm font-semibold text-orange-400">{p.totalPoints}pts</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Squad */}
      <div className="flex justify-end">
        <button onClick={store.resetSquad} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all">
          <RotateCcw size={14} /> Reset Squad
        </button>
      </div>
    </div>
  );
}

// ─── Pitch View ───
function PitchView({ squadPlayers, squad, onOpenMarket, onRemove, setCaptain, setViceCaptain }: {
  squadPlayers: { playerId: string; position: number; isCaptain: boolean; isViceCaptain: boolean; isBenched: boolean; purchasePrice: number; sellingPrice: number; data: FantasyPlayer | undefined }[];
  squad: FantasySquad;
  onOpenMarket: (slot?: number) => void;
  onRemove: (slot: number) => void;
  setCaptain: (id: string) => void;
  setViceCaptain: (id: string) => void;
}) {
  const formation = squad.formation.split('-').map(Number); // e.g. [4, 4, 2]
  const starters = squadPlayers.filter(p => !p.isBenched);
  const bench = squadPlayers.filter(p => p.isBenched);

  // Group starters by row
  const gk = starters.filter(p => p.position <= 2);
  const def = starters.filter(p => p.position >= 3 && p.position <= 7);
  const mid = starters.filter(p => p.position >= 8 && p.position <= 12);
  const fwd = starters.filter(p => p.position >= 13 && p.position <= 15);

  const rows = [
    { label: 'GKP', players: gk, maxSlots: 1, startSlot: 1 },
    { label: 'DEF', players: def, maxSlots: formation[0] || 4, startSlot: 3 },
    { label: 'MID', players: mid, maxSlots: formation[1] || 4, startSlot: 8 },
    { label: 'FWD', players: fwd, maxSlots: formation[2] || 2, startSlot: 13 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Pitch */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08]" style={{
        background: 'linear-gradient(180deg, #1a472a 0%, #2d5a3f 20%, #1a472a 40%, #2d5a3f 60%, #1a472a 80%, #2d5a3f 100%)',
        minHeight: 500,
      }}>
        {/* Pitch markings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-2 border-white/10 rounded-full" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-t-0 border-white/10 rounded-b-lg" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-b-0 border-white/10 rounded-t-lg" />
        <div className="absolute left-0 right-0 top-1/2 border-t border-white/10" />

        {/* Player rows */}
        <div className="relative z-10 flex flex-col items-center py-6 gap-4" style={{ minHeight: 500 }}>
          {[...rows].reverse().map((row, i) => (
            <div key={row.label} className="flex items-center justify-center gap-4 sm:gap-8 w-full px-4">
              {Array.from({ length: row.maxSlots }).map((_, j) => {
                const player = row.players[j];
                if (player?.data) {
                  return (
                    <motion.div key={player.playerId} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: j * 0.05 }}
                      className="flex flex-col items-center gap-1 group cursor-pointer relative">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${positionColors[player.data.position]} border-2 border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-lg relative`}>
                        {player.data.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        {player.isCaptain && <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-black text-black">C</span>}
                        {player.isViceCaptain && <span className="absolute -top-1 -right-1 w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center text-[10px] font-black text-black">V</span>}
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[80px]">{player.data.name.split(' ').pop()}</p>
                        <p className="text-[10px] text-white/60">{player.data.gameweekPoints} pts</p>
                      </div>
                      {/* Hover actions */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 z-20">
                        <button onClick={() => setCaptain(player.playerId)} className="px-1.5 py-0.5 bg-yellow-500/80 rounded text-[9px] font-bold text-black">C</button>
                        <button onClick={() => setViceCaptain(player.playerId)} className="px-1.5 py-0.5 bg-slate-400/80 rounded text-[9px] font-bold text-black">V</button>
                        <button onClick={() => onRemove(player.position)} className="px-1.5 py-0.5 bg-red-500/80 rounded text-[9px] font-bold text-white">✕</button>
                      </div>
                    </motion.div>
                  );
                }
                return (
                  <button key={`empty-${row.label}-${j}`} onClick={() => onOpenMarket(row.startSlot + j)}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 hover:border-orange-500/50 hover:text-orange-500 transition-all">
                    <span className="text-xl">+</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div className="glass-strong rounded-xl border border-white/[0.06] p-4">
        <h3 className="text-sm font-bold text-slate-400 mb-3">BENCH</h3>
        <div className="flex gap-4">
          {[12, 13, 14, 15].map(slot => {
            const player = squadPlayers.find(p => p.position === slot);
            if (player?.data) {
              return (
                <div key={slot} className="flex items-center gap-2 glass-strong rounded-lg px-3 py-2 border border-white/[0.06]">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${positionBg[player.data.position]}`}>{player.data.position}</span>
                  <span className="text-xs font-semibold text-white">{player.data.name.split(' ').pop()}</span>
                  <span className="text-xs text-slate-500">£{player.data.price}m</span>
                  <button onClick={() => onRemove(slot)} className="text-red-400 hover:text-red-300 ml-1"><X size={12} /></button>
                </div>
              );
            }
            return (
              <button key={slot} onClick={() => onOpenMarket(slot)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/10 text-slate-500 hover:border-orange-500/30 hover:text-orange-400 transition-all text-xs">
                + Add
              </button>
            );
          })}
        </div>
      </div>

      {/* Formation Selector */}
      <div className="glass-strong rounded-xl border border-white/[0.06] p-4">
        <h3 className="text-sm font-bold text-slate-400 mb-3">FORMATION</h3>
        <div className="flex gap-2 flex-wrap">
          {['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'].map(f => (
            <button key={f} onClick={() => useFantasyStore.getState().setFormation(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                squad.formation === f ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}>{f}</button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── List View ───
function ListView({ squadPlayers, squad, onRemove, setCaptain, setViceCaptain }: {
  squadPlayers: { playerId: string; position: number; isCaptain: boolean; isViceCaptain: boolean; isBenched: boolean; purchasePrice: number; sellingPrice: number; data: FantasyPlayer | undefined }[];
  squad: FantasySquad;
  onRemove: (slot: number) => void;
  setCaptain: (id: string) => void;
  setViceCaptain: (id: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="glass-strong rounded-xl border border-white/[0.06] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06] text-xs text-slate-500">
            <th className="text-left px-4 py-3">Player</th>
            <th className="text-center px-2 py-3">Pos</th>
            <th className="text-right px-2 py-3">Price</th>
            <th className="text-right px-2 py-3">Pts</th>
            <th className="text-right px-2 py-3">GW</th>
            <th className="text-right px-2 py-3">Form</th>
            <th className="text-center px-2 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {squadPlayers.sort((a, b) => a.position - b.position).map(sp => {
            if (!sp.data) return null;
            return (
              <tr key={sp.playerId} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${sp.isBenched ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${positionColors[sp.data.position]} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {sp.data.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{sp.data.name}</p>
                    <p className="text-[10px] text-slate-500">{sp.data.team}</p>
                  </div>
                  {sp.isCaptain && <Crown size={14} className="text-yellow-500" />}
                  {sp.isViceCaptain && <Shield size={14} className="text-slate-400" />}
                </td>
                <td className="text-center px-2 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${positionBg[sp.data.position]}`}>{sp.data.position}</span></td>
                <td className="text-right px-2 py-3 text-sm text-emerald-400 font-semibold">£{sp.data.price}m</td>
                <td className="text-right px-2 py-3 text-sm text-orange-400 font-bold">{sp.data.totalPoints}</td>
                <td className="text-right px-2 py-3 text-sm text-white">{sp.data.gameweekPoints}</td>
                <td className="text-right px-2 py-3 text-sm text-white">{sp.data.form}</td>
                <td className="text-center px-2 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setCaptain(sp.playerId)} className="p-1 rounded hover:bg-yellow-500/20 text-yellow-500/50 hover:text-yellow-500" title="Captain"><Crown size={12} /></button>
                    <button onClick={() => setViceCaptain(sp.playerId)} className="p-1 rounded hover:bg-slate-400/20 text-slate-500 hover:text-slate-300" title="Vice Captain"><Shield size={12} /></button>
                    <button onClick={() => onRemove(sp.position)} className="p-1 rounded hover:bg-red-500/20 text-red-500/50 hover:text-red-500" title="Remove"><X size={12} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {squadPlayers.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No players selected. Head to the Transfers tab to build your squad.</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Transfer Market ───
function TransferMarket({ players, searchQuery, setSearchQuery, positionFilter, setPositionFilter, sortBy, setSortBy, onAdd, squad, canAddPosition }: {
  players: FantasyPlayer[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  positionFilter: FantasyPosition | 'ALL';
  setPositionFilter: (p: FantasyPosition | 'ALL') => void;
  sortBy: string;
  setSortBy: (s: 'totalPoints' | 'price' | 'form' | 'ictIndex' | 'selectedBy') => void;
  onAdd: (p: FantasyPlayer) => void;
  squad: FantasySquad;
  canAddPosition: (pos: FantasyPosition) => boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Filters */}
      <div className="glass-strong rounded-xl border border-white/[0.06] p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or team..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50" />
        </div>
        <div className="flex gap-1">
          {(['ALL', 'GKP', 'DEF', 'MID', 'FWD'] as const).map(pos => (
            <button key={pos} onClick={() => setPositionFilter(pos)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${positionFilter === pos ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'}`}>{pos}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as 'totalPoints' | 'price' | 'form' | 'ictIndex' | 'selectedBy')}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-semibold focus:outline-none">
          <option value="totalPoints">Total Points</option>
          <option value="price">Price</option>
          <option value="form">Form</option>
          <option value="ictIndex">ICT Index</option>
          <option value="selectedBy">Ownership %</option>
        </select>
      </div>

      {/* Budget reminder */}
      <div className="glass-strong rounded-xl border border-white/[0.06] p-3 flex items-center gap-4">
        <DollarSign size={18} className="text-emerald-400" />
        <div className="flex-1">
          <span className="text-sm text-white font-semibold">Budget remaining: <span className="text-emerald-400">£{squad.bank.toFixed(1)}m</span></span>
          <span className="text-xs text-slate-500 ml-3">Squad: {squad.players.length}/15</span>
        </div>
      </div>

      {/* Player list */}
      <div className="glass-strong rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] text-slate-500 uppercase">
              <th className="text-left px-4 py-3">Player</th>
              <th className="text-center px-2 py-3">Pos</th>
              <th className="text-right px-2 py-3">Price</th>
              <th className="text-right px-2 py-3">Pts</th>
              <th className="text-right px-2 py-3 hidden sm:table-cell">Form</th>
              <th className="text-right px-2 py-3 hidden md:table-cell">ICT</th>
              <th className="text-right px-2 py-3 hidden md:table-cell">Own%</th>
              <th className="text-center px-2 py-3">FDR</th>
              <th className="text-center px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${positionColors[p.position]} flex items-center justify-center text-white text-[9px] font-bold`}>
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.team}</p>
                    </div>
                    {p.availability !== 'available' && (
                      <AlertTriangle size={12} className={p.availability === 'injured' ? 'text-red-500' : 'text-yellow-500'} />
                    )}
                  </div>
                </td>
                <td className="text-center px-2 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${positionBg[p.position]}`}>{p.position}</span></td>
                <td className="text-right px-2 py-2.5 text-xs font-bold text-emerald-400">£{p.price}m</td>
                <td className="text-right px-2 py-2.5 text-xs font-bold text-orange-400">{p.totalPoints}</td>
                <td className="text-right px-2 py-2.5 text-xs text-white hidden sm:table-cell">{p.form}</td>
                <td className="text-right px-2 py-2.5 text-xs text-white hidden md:table-cell">{p.ictIndex}</td>
                <td className="text-right px-2 py-2.5 text-xs text-slate-400 hidden md:table-cell">{p.selectedBy}%</td>
                <td className="text-center px-2 py-2.5">
                  <span className={`inline-block w-6 h-6 rounded text-[10px] font-bold text-white flex items-center justify-center ${difficultyColors[p.nextFixtureDifficulty]}`}>
                    {p.nextFixtureDifficulty}
                  </span>
                </td>
                <td className="text-center px-3 py-2.5">
                  <button onClick={() => onAdd(p)} disabled={p.price > squad.bank || !canAddPosition(p.position) || squad.players.length >= 15}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-[10px] font-bold hover:bg-orange-500/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-orange-500/30">
                    + Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─── Points View ───
function PointsView({ squadPlayers, gameweeks: gws, currentGW, dreamTeam }: {
  squadPlayers: { data: FantasyPlayer | undefined; isCaptain: boolean }[];
  gameweeks: typeof gameweeks;
  currentGW: typeof gameweeks[0] | undefined;
  dreamTeam: FantasyPlayer[];
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* GW Summary */}
      <div className="lg:col-span-2 glass-strong rounded-xl border border-white/[0.06] p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Zap size={18} className="text-orange-400" /> Gameweek {currentGW?.id ?? '-'} Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-white/[0.03]">
            <p className="text-2xl font-black text-orange-400">{currentGW?.highestScore ?? 0}</p>
            <p className="text-[10px] text-slate-500 mt-1">Highest Score</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.03]">
            <p className="text-2xl font-black text-white">{currentGW?.averageScore ?? 0}</p>
            <p className="text-[10px] text-slate-500 mt-1">Average Score</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.03]">
            <p className="text-2xl font-black text-emerald-400">{currentGW?.topPlayerPoints ?? 0}</p>
            <p className="text-[10px] text-slate-500 mt-1">Top Player Pts</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.03]">
            <p className="text-2xl font-black text-cyan-400">{currentGW?.transfersMade ? (currentGW.transfersMade / 1000000).toFixed(1) + 'M' : '0'}</p>
            <p className="text-[10px] text-slate-500 mt-1">Transfers Made</p>
          </div>
        </div>

        {/* GW History mini chart */}
        <h4 className="text-sm font-bold text-slate-400 mb-3">Points History</h4>
        <div className="flex items-end gap-1 h-24">
          {gws.filter(g => g.isCompleted).slice(-15).map(g => (
            <div key={g.id} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t bg-gradient-to-t from-orange-500/60 to-orange-500 transition-all hover:from-orange-400/60 hover:to-orange-400"
                style={{ height: `${(g.averageScore / 70) * 100}%` }} title={`GW${g.id}: ${g.averageScore}`} />
              <span className="text-[8px] text-slate-600">{g.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dream Team */}
      <div className="glass-strong rounded-xl border border-white/[0.06] p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Star size={18} className="text-yellow-500" /> Dream Team</h3>
        <div className="space-y-2">
          {dreamTeam.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 py-1.5">
              <span className="text-[10px] text-slate-600 w-4">{i + 1}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${positionBg[p.position]}`}>{p.position}</span>
              <span className="flex-1 text-xs font-semibold text-white truncate">{p.name}</span>
              <span className="text-xs font-bold text-orange-400">{p.gameweekPoints}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Stats View ───
function StatsView() {
  const topPlayers = useMemo(() => getTopFantasyPlayers(20), []);
  const byPos = (pos: FantasyPosition) => getFantasyPlayersByPosition(pos).sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Top 20 Overall */}
      <div className="glass-strong rounded-xl border border-white/[0.06] p-5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Award size={18} className="text-orange-400" /> Top 20 Players</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topPlayers.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
              <span className={`text-sm font-black w-6 text-center ${i < 3 ? 'text-orange-400' : 'text-slate-600'}`}>{i + 1}</span>
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${positionColors[p.position]} flex items-center justify-center text-white text-[10px] font-bold`}>
                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                <p className="text-[10px] text-slate-500">{p.team} · £{p.price}m</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-orange-400">{p.totalPoints}</p>
                <p className="text-[10px] text-slate-500">{p.pointsPerGame}/gm</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Position */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['GKP', 'DEF', 'MID', 'FWD'] as FantasyPosition[]).map(pos => (
          <div key={pos} className="glass-strong rounded-xl border border-white/[0.06] p-4">
            <h4 className={`text-sm font-bold mb-3 flex items-center gap-2`}>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${positionBg[pos]}`}>{pos}</span>
              <span className="text-white">Top 5</span>
            </h4>
            <div className="space-y-2">
              {byPos(pos).map((p, i) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600 w-3">{i + 1}</span>
                  <span className="text-xs text-white truncate flex-1">{p.name}</span>
                  <span className="text-xs font-bold text-orange-400">{p.totalPoints}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
