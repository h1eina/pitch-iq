'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, FastForward, SkipForward, RotateCcw, Zap, Activity,
  Target, TrendingUp, Shield, AlertTriangle, Clock, Star
} from 'lucide-react';
import { allTeams, getPlayersByTeam } from '@/data/generator';
import type { Team, Player } from '@/lib/types';

type MatchEvent = {
  minute: number; type: 'goal' | 'assist' | 'yellow' | 'red' | 'sub' | 'chance' | 'save' | 'foul' | 'corner' | 'offside';
  team: 'home' | 'away'; player: string; detail: string; xG?: number;
};

type SimState = {
  minute: number; homeScore: number; awayScore: number; events: MatchEvent[];
  homeXG: number; awayXG: number; possession: number; // home %
  homeMomentum: number[]; awayMomentum: number[];
  homeShots: number; awayShots: number; homeShotsOT: number; awayShotsOT: number;
  homeFouls: number; awayFouls: number; homeCorners: number; awayCorners: number;
  status: 'pre' | 'first-half' | 'half-time' | 'second-half' | 'full-time';
};

function initSim(): SimState {
  return {
    minute: 0, homeScore: 0, awayScore: 0, events: [],
    homeXG: 0, awayXG: 0, possession: 50,
    homeMomentum: [], awayMomentum: [],
    homeShots: 0, awayShots: 0, homeShotsOT: 0, awayShotsOT: 0,
    homeFouls: 0, awayFouls: 0, homeCorners: 0, awayCorners: 0,
    status: 'pre',
  };
}

function generateMinuteEvents(min: number, homeTeam: Team, awayTeam: Team, homePlayers: Player[], awayPlayers: Player[]): MatchEvent[] {
  const events: MatchEvent[] = [];
  const rng = () => Math.random();

  const homeStr = homeTeam.style.possession + homeTeam.style.creativity;
  const awayStr = awayTeam.style.possession + awayTeam.style.creativity;
  const homeChance = 0.12 + (homeStr / 80) * 0.08;
  const awayChance = 0.10 + (awayStr / 80) * 0.08;

  const pickPlayer = (players: Player[]) => {
    const p = players[Math.floor(rng() * players.length)];
    return p?.name ?? 'Unknown';
  };

  // Home attack chance
  if (rng() < homeChance) {
    const xg = +(rng() * 0.4 + 0.05).toFixed(2);
    if (rng() < xg + 0.1) {
      const scorer = pickPlayer(homePlayers.filter(p => p.position !== 'GK'));
      events.push({ minute: min, type: 'goal', team: 'home', player: scorer, detail: `GOAL! ${scorer} scores!`, xG: xg });
      if (rng() > 0.3) {
        const assister = pickPlayer(homePlayers.filter(p => p.name !== scorer));
        events.push({ minute: min, type: 'assist', team: 'home', player: assister, detail: `Assisted by ${assister}` });
      }
    } else {
      events.push({ minute: min, type: 'chance', team: 'home', player: pickPlayer(homePlayers), detail: `Shot saved / missed`, xG: xg });
    }
  }

  // Away attack chance
  if (rng() < awayChance) {
    const xg = +(rng() * 0.4 + 0.05).toFixed(2);
    if (rng() < xg + 0.1) {
      const scorer = pickPlayer(awayPlayers.filter(p => p.position !== 'GK'));
      events.push({ minute: min, type: 'goal', team: 'away', player: scorer, detail: `GOAL! ${scorer} scores!`, xG: xg });
    } else {
      events.push({ minute: min, type: 'chance', team: 'away', player: pickPlayer(awayPlayers), detail: `Shot saved / missed`, xG: xg });
    }
  }

  // Fouls / Cards
  if (rng() < 0.15) {
    const team = rng() > 0.5 ? 'home' : 'away';
    const players = team === 'home' ? homePlayers : awayPlayers;
    if (rng() < 0.12) {
      events.push({ minute: min, type: 'yellow', team, player: pickPlayer(players), detail: 'Yellow card shown' });
    }
    events.push({ minute: min, type: 'foul', team, player: pickPlayer(players), detail: 'Foul committed' });
  }

  // Corner
  if (rng() < 0.08) {
    const team = rng() > 0.5 ? 'home' : 'away';
    events.push({ minute: min, type: 'corner', team, player: '', detail: 'Corner kick' });
  }

  return events;
}

function MomentumGraph({ home, away }: { home: number[]; away: number[] }) {
  const w = 400, h = 80;
  if (home.length < 2) return null;
  const toPath = (data: number[], color: string) => {
    const step = w / Math.max(1, data.length - 1);
    const pts = data.map((v, i) => `${i * step},${h / 2 - v * (h / 2)}`);
    return <polyline key={color} points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" opacity="0.7" />;
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20">
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {toPath(home, '#f97316')}
      {toPath(away, '#06b6d4')}
    </svg>
  );
}

function XGTimeline({ events }: { events: MatchEvent[] }) {
  const goalChances = events.filter(e => e.type === 'goal' || e.type === 'chance');
  if (goalChances.length === 0) return null;
  return (
    <div className="flex items-end gap-0.5 h-16">
      {goalChances.map((e, i) => {
        const h = Math.max(8, (e.xG || 0.05) * 200);
        return (
          <motion.div key={i} initial={{ height: 0 }} animate={{ height: h }}
            className={`w-2 rounded-t ${e.type === 'goal'
              ? (e.team === 'home' ? 'bg-orange-500' : 'bg-cyan-500')
              : 'bg-white/10'}`}
            title={`${e.minute}' ${e.player} xG: ${e.xG}`} />
        );
      })}
    </div>
  );
}

export default function SimulatorPage() {
  const [homeTeamId, setHomeTeamId] = useState(allTeams[0]?.id ?? '');
  const [awayTeamId, setAwayTeamId] = useState(allTeams[1]?.id ?? '');
  const [sim, setSim] = useState<SimState>(initSim);
  const [speed, setSpeed] = useState(500); // ms per minute
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const homeTeam = useMemo(() => allTeams.find(t => t.id === homeTeamId), [homeTeamId]);
  const awayTeam = useMemo(() => allTeams.find(t => t.id === awayTeamId), [awayTeamId]);
  const homePlayers = useMemo(() => getPlayersByTeam(homeTeamId), [homeTeamId]);
  const awayPlayers = useMemo(() => getPlayersByTeam(awayTeamId), [awayTeamId]);

  const tick = useCallback(() => {
    setSim(prev => {
      if (prev.minute >= 90) {
        setRunning(false);
        return { ...prev, status: 'full-time' };
      }
      const min = prev.minute + 1;
      const newEvents = homeTeam && awayTeam ? generateMinuteEvents(min, homeTeam, awayTeam, homePlayers, awayPlayers) : [];
      let { homeScore, awayScore, homeXG, awayXG, homeShots, awayShots, homeShotsOT, awayShotsOT, homeFouls, awayFouls, homeCorners, awayCorners } = prev;

      newEvents.forEach(e => {
        if (e.type === 'goal' && e.team === 'home') { homeScore++; homeXG += e.xG || 0; homeShots++; homeShotsOT++; }
        if (e.type === 'goal' && e.team === 'away') { awayScore++; awayXG += e.xG || 0; awayShots++; awayShotsOT++; }
        if (e.type === 'chance' && e.team === 'home') { homeXG += e.xG || 0; homeShots++; }
        if (e.type === 'chance' && e.team === 'away') { awayXG += e.xG || 0; awayShots++; }
        if (e.type === 'foul' && e.team === 'home') homeFouls++;
        if (e.type === 'foul' && e.team === 'away') awayFouls++;
        if (e.type === 'corner' && e.team === 'home') homeCorners++;
        if (e.type === 'corner' && e.team === 'away') awayCorners++;
      });

      const momentum = Math.sin(min / 10) * 0.3 + (Math.random() - 0.5) * 0.4;

      return {
        ...prev, minute: min, homeScore, awayScore, homeXG, awayXG,
        homeShots, awayShots, homeShotsOT, awayShotsOT, homeFouls, awayFouls, homeCorners, awayCorners,
        events: [...prev.events, ...newEvents],
        homeMomentum: [...prev.homeMomentum, Math.max(-1, Math.min(1, momentum))],
        awayMomentum: [...prev.awayMomentum, Math.max(-1, Math.min(1, -momentum))],
        possession: Math.round(50 + momentum * 15),
        status: min <= 45 ? 'first-half' : min === 46 ? 'second-half' : prev.status,
      };
    });
  }, [homeTeam, awayTeam, homePlayers, awayPlayers]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, speed, tick]);

  const reset = () => { setRunning(false); setSim(initSim()); };
  const kickOff = () => { reset(); setRunning(true); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Zap className="text-orange-400" size={24} /> Match Simulator</h1>
        <div className="flex gap-2">
          <button onClick={() => setSpeed(s => Math.max(100, s - 200))} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white hover:bg-white/10"><FastForward size={14} /></button>
          <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400">{speed}ms</span>
        </div>
      </div>

      {/* Team Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-strong rounded-xl border border-white/[0.06] p-4">
          <label className="text-xs text-slate-500 block mb-1">Home Team</label>
          <select value={homeTeamId} onChange={e => { setHomeTeamId(e.target.value); reset(); }}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white">
            {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="glass-strong rounded-xl border border-white/[0.06] p-4">
          <label className="text-xs text-slate-500 block mb-1">Away Team</label>
          <select value={awayTeamId} onChange={e => { setAwayTeamId(e.target.value); reset(); }}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white">
            {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Scoreboard */}
      <motion.div className="glass-strong rounded-2xl border border-white/[0.06] p-6 text-center">
        <div className="flex items-center justify-center gap-8">
          <div className="text-right flex-1">
            <p className="text-xl font-black text-white">{homeTeam?.name}</p>
            <p className="text-xs text-slate-500">{homeTeam?.formation}</p>
          </div>
          <div className={`px-6 py-3 rounded-xl min-w-[100px] ${sim.status === 'full-time' ? 'bg-white/5' : 'bg-red-500/10 border border-red-500/30'}`}>
            <p className="text-3xl font-black text-white">{sim.homeScore} - {sim.awayScore}</p>
            <p className="text-xs text-slate-400 mt-1">{sim.minute > 0 ? `${sim.minute}'` : 'KO'}</p>
          </div>
          <div className="text-left flex-1">
            <p className="text-xl font-black text-white">{awayTeam?.name}</p>
            <p className="text-xs text-slate-500">{awayTeam?.formation}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mt-4">
          {sim.status === 'pre' && <button onClick={kickOff} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 flex items-center gap-2"><Play size={16} /> Kick Off</button>}
          {(sim.status === 'first-half' || sim.status === 'second-half') && (
            <button onClick={() => setRunning(r => !r)} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 flex items-center gap-2">
              {running ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
            </button>
          )}
          {sim.status === 'full-time' && <button onClick={reset} className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 flex items-center gap-2"><RotateCcw size={16} /> Restart</button>}
          {sim.minute > 0 && sim.status !== 'full-time' && (
            <button onClick={() => { while (sim.minute < 90) tick(); }} className="px-3 py-2 rounded-lg bg-white/5 text-white text-xs hover:bg-white/10 flex items-center gap-1"><SkipForward size={14} /> Sim to FT</button>
          )}
        </div>
      </motion.div>

      {/* Stats + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Stats */}
        <div className="glass-strong rounded-xl border border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-slate-400 mb-3">MATCH STATS</h3>
          {[
            { label: 'Possession', home: `${sim.possession}%`, away: `${100 - sim.possession}%` },
            { label: 'Shots', home: sim.homeShots, away: sim.awayShots },
            { label: 'Shots on Target', home: sim.homeShotsOT, away: sim.awayShotsOT },
            { label: 'xG', home: sim.homeXG.toFixed(2), away: sim.awayXG.toFixed(2) },
            { label: 'Corners', home: sim.homeCorners, away: sim.awayCorners },
            { label: 'Fouls', home: sim.homeFouls, away: sim.awayFouls },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2 py-1.5">
              <span className="text-xs font-bold text-orange-400 w-8 text-right">{stat.home}</span>
              <div className="flex-1 text-center text-[10px] text-slate-500">{stat.label}</div>
              <span className="text-xs font-bold text-cyan-400 w-8">{stat.away}</span>
            </div>
          ))}
        </div>

        {/* Momentum */}
        <div className="glass-strong rounded-xl border border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-slate-400 mb-3">MOMENTUM</h3>
          <MomentumGraph home={sim.homeMomentum} away={sim.awayMomentum} />
          <h3 className="text-sm font-bold text-slate-400 mt-4 mb-2">xG TIMELINE</h3>
          <XGTimeline events={sim.events} />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Home xG: <span className="text-orange-400 font-bold">{sim.homeXG.toFixed(2)}</span></span>
            <span>Away xG: <span className="text-cyan-400 font-bold">{sim.awayXG.toFixed(2)}</span></span>
          </div>
        </div>

        {/* Live Commentary */}
        <div className="glass-strong rounded-xl border border-white/[0.06] p-5 max-h-[400px] overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-400 mb-3">COMMENTARY</h3>
          <div className="space-y-2">
            {[...sim.events].reverse().map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                  e.type === 'goal' ? 'bg-orange-500/10 border border-orange-500/20' :
                  e.type === 'yellow' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                  e.type === 'red' ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/[0.02]'
                }`}>
                <span className="text-slate-500 font-mono w-8">{e.minute}&apos;</span>
                <span className={`font-semibold ${e.team === 'home' ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {e.type === 'goal' ? '⚽' : e.type === 'yellow' ? '🟨' : e.type === 'red' ? '🟥' : e.type === 'corner' ? '📐' : '📝'}
                </span>
                <span className="text-slate-300 flex-1">{e.detail}{e.player ? ` - ${e.player}` : ''}</span>
              </motion.div>
            ))}
            {sim.events.length === 0 && <p className="text-xs text-slate-500">Waiting for kick-off...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
