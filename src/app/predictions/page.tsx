'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Trophy, Target, TrendingUp, Check, X, Minus,
  ChevronDown, Star, Award, Zap, BarChart3, ArrowRight
} from 'lucide-react';
import { allMatches, allTeams } from '@/data/generator';
import type { Match } from '@/lib/types';

type Prediction = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  confidence: number;
  timestamp: number;
};

type Result = Prediction & {
  actualHome: number;
  actualAway: number;
  points: number;
  outcome: 'exact' | 'correct' | 'wrong';
};

const POINTS = { exact: 10, correct: 3, wrong: 0 };

function getOutcome(pred: Prediction, actualH: number, actualA: number): 'exact' | 'correct' | 'wrong' {
  if (pred.homeScore === actualH && pred.awayScore === actualA) return 'exact';
  const predResult = pred.homeScore > pred.awayScore ? 'H' : pred.homeScore < pred.awayScore ? 'A' : 'D';
  const actResult = actualH > actualA ? 'H' : actualH < actualA ? 'A' : 'D';
  return predResult === actResult ? 'correct' : 'wrong';
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Trophy; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-4 text-center">
      <Icon className={`mx-auto text-${color}-400 mb-1`} size={20} />
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[8px] text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [results, setResults] = useState<Result[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [tab, setTab] = useState<'predict' | 'results' | 'leaderboard'>('predict');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pitch-iq-predictions');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPredictions(parsed.predictions || {});
        setResults(parsed.results || []);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pitch-iq-predictions', JSON.stringify({ predictions, results }));
  }, [predictions, results]);

  const leagueIds = useMemo(() => [...new Set(allMatches.map(m => m.leagueId))], []);

  const upcomingMatches = useMemo(() => {
    return allMatches
      .filter(m => m.status === 'scheduled')
      .filter(m => selectedLeague === 'all' || m.leagueId === selectedLeague)
      .slice(0, 20);
  }, [selectedLeague]);

  const finishedMatches = useMemo(() => {
    return allMatches.filter(m => m.status === 'finished').slice(0, 50);
  }, []);

  // Auto-resolve predictions for finished matches
  useEffect(() => {
    const newResults: Result[] = [];
    const updatedPreds = { ...predictions };
    let changed = false;

    finishedMatches.forEach(m => {
      if (predictions[m.id] && !results.find(r => r.matchId === m.id)) {
        const pred = predictions[m.id];
        const aH = m.homeScore ?? 0;
        const aA = m.awayScore ?? 0;
        const outcome = getOutcome(pred, aH, aA);
        newResults.push({ ...pred, actualHome: aH, actualAway: aA, points: POINTS[outcome], outcome });
        delete updatedPreds[m.id];
        changed = true;
      }
    });

    if (changed) {
      setPredictions(updatedPreds);
      setResults(prev => [...prev, ...newResults]);
    }
  }, [finishedMatches, predictions, results]);

  const stats = useMemo(() => {
    const total = results.length;
    const exact = results.filter(r => r.outcome === 'exact').length;
    const correct = results.filter(r => r.outcome === 'correct').length;
    const points = results.reduce((s, r) => s + r.points, 0);
    const accuracy = total > 0 ? Math.round(((exact + correct) / total) * 100) : 0;

    let streak = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].outcome !== 'wrong') streak++;
      else break;
    }

    return { total, exact, correct, points, accuracy, streak };
  }, [results]);

  const setPred = (matchId: string, field: 'homeScore' | 'awayScore', val: number) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { matchId, homeScore: 0, awayScore: 0, confidence: 50, timestamp: Date.now() }),
        [field]: Math.max(0, Math.min(9, val)),
      },
    }));
  };

  const setConfidence = (matchId: string, val: number) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { matchId, homeScore: 0, awayScore: 0, confidence: 50, timestamp: Date.now() }),
        confidence: val,
      },
    }));
  };

  // Mock leaderboard
  const leaderboard = useMemo(() => [
    { rank: 1, name: 'You', points: stats.points, exact: stats.exact, accuracy: stats.accuracy, isUser: true },
    { rank: 2, name: 'PredictionKing99', points: Math.max(stats.points - 5, 42), exact: 4, accuracy: 68, isUser: false },
    { rank: 3, name: 'TacticalGenius', points: Math.max(stats.points - 12, 38), exact: 3, accuracy: 62, isUser: false },
    { rank: 4, name: 'xGMaster', points: Math.max(stats.points - 18, 31), exact: 2, accuracy: 55, isUser: false },
    { rank: 5, name: 'FootballBrain', points: Math.max(stats.points - 25, 24), exact: 1, accuracy: 48, isUser: false },
    { rank: 6, name: 'ScoutVision', points: Math.max(stats.points - 30, 20), exact: 1, accuracy: 45, isUser: false },
    { rank: 7, name: 'MatchDayPro', points: Math.max(stats.points - 35, 15), exact: 0, accuracy: 40, isUser: false },
    { rank: 8, name: 'GoalPredictor', points: Math.max(stats.points - 40, 10), exact: 0, accuracy: 35, isUser: false },
  ].sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1 })), [stats]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Brain className="text-purple-400" size={24} /> Prediction Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Predict match scores, track your accuracy & climb the leaderboard</p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Target} label="Predictions" value={stats.total} color="purple" />
        <StatCard icon={Check} label="Exact Scores" value={stats.exact} color="emerald" />
        <StatCard icon={TrendingUp} label="Accuracy" value={`${stats.accuracy}%`} color="cyan" />
        <StatCard icon={Trophy} label="Total Points" value={stats.points} color="yellow" />
        <StatCard icon={Zap} label="Streak" value={stats.streak} color="orange" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['predict', 'results', 'leaderboard'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab === t ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {t === 'predict' ? '🎯 Predict' : t === 'results' ? '📊 Results' : '🏆 Leaderboard'}
          </button>
        ))}
      </div>

      {/* Predict Tab */}
      {tab === 'predict' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* League Filter */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedLeague('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedLeague === 'all' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}>
              All Leagues
            </button>
            {leagueIds.map(lid => (
              <button key={lid} onClick={() => setSelectedLeague(lid)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${selectedLeague === lid ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-400'}`}>
                {lid.toUpperCase()}
              </button>
            ))}
          </div>

          {upcomingMatches.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-slate-400 text-sm">No upcoming matches to predict right now.</p>
            </div>
          )}

          <div className="space-y-3">
            {upcomingMatches.map(m => {
              const pred = predictions[m.id];
              return (
                <div key={m.id} className="card p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold text-white">{m.homeTeam.name}</p>
                      <p className="text-[10px] text-slate-500">MD {m.matchday}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setPred(m.id, 'homeScore', (pred?.homeScore ?? 0) - 1)} className="w-6 h-6 rounded bg-white/5 text-white text-xs hover:bg-white/10">-</button>
                      <span className="text-xl font-black text-white w-6 text-center">{pred?.homeScore ?? 0}</span>
                      <button onClick={() => setPred(m.id, 'homeScore', (pred?.homeScore ?? 0) + 1)} className="w-6 h-6 rounded bg-white/5 text-white text-xs hover:bg-white/10">+</button>

                      <span className="text-slate-500 mx-1">:</span>

                      <button onClick={() => setPred(m.id, 'awayScore', (pred?.awayScore ?? 0) - 1)} className="w-6 h-6 rounded bg-white/5 text-white text-xs hover:bg-white/10">-</button>
                      <span className="text-xl font-black text-white w-6 text-center">{pred?.awayScore ?? 0}</span>
                      <button onClick={() => setPred(m.id, 'awayScore', (pred?.awayScore ?? 0) + 1)} className="w-6 h-6 rounded bg-white/5 text-white text-xs hover:bg-white/10">+</button>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{m.awayTeam.name}</p>
                      <p className="text-[10px] text-slate-500">{m.league}</p>
                    </div>
                  </div>

                  {pred && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">Confidence:</span>
                      <input type="range" min="10" max="100" step="5" value={pred.confidence}
                        onChange={e => setConfidence(m.id, Number(e.target.value))}
                        className="flex-1 accent-purple-500 h-1" />
                      <span className="text-xs font-bold text-purple-400 w-10 text-right">{pred.confidence}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(predictions).length > 0 && (
            <div className="card p-4 text-center">
              <p className="text-sm text-slate-400">
                <span className="text-purple-400 font-bold">{Object.keys(predictions).length}</span> predictions locked in.
                Results will be auto-scored when matches finish.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Results Tab */}
      {tab === 'results' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {results.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-slate-400 text-sm">No results yet. Make predictions and wait for matches to finish!</p>
            </div>
          )}
          {results.map((r, i) => {
            const match = allMatches.find(m => m.id === r.matchId);
            return (
              <div key={i} className={`card p-4 border-l-4 ${
                r.outcome === 'exact' ? 'border-l-emerald-500 bg-emerald-500/5' :
                r.outcome === 'correct' ? 'border-l-cyan-500 bg-cyan-500/5' :
                'border-l-red-500 bg-red-500/5'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{match?.homeTeam.name} vs {match?.awayTeam.name}</p>
                    <p className="text-[10px] text-slate-500">{match?.league} · MD {match?.matchday}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-[8px] text-slate-500 uppercase">Your Prediction</p>
                        <p className="text-sm font-bold text-purple-400">{r.homeScore} - {r.awayScore}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-500" />
                      <div className="text-center">
                        <p className="text-[8px] text-slate-500 uppercase">Actual</p>
                        <p className="text-sm font-bold text-white">{r.actualHome} - {r.actualAway}</p>
                      </div>
                    </div>
                    <p className={`text-xs font-bold mt-1 ${
                      r.outcome === 'exact' ? 'text-emerald-400' : r.outcome === 'correct' ? 'text-cyan-400' : 'text-red-400'
                    }`}>
                      {r.outcome === 'exact' ? '🎯 EXACT +10pts' : r.outcome === 'correct' ? '✓ Correct +3pts' : '✗ Wrong +0pts'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Leaderboard Tab */}
      {tab === 'leaderboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Award size={14} className="text-yellow-400" /> Global Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.map(p => (
                <div key={p.rank} className={`flex items-center gap-3 p-3 rounded-xl ${p.isUser ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/[0.02]'}`}>
                  <span className={`text-lg font-black w-8 text-center ${
                    p.rank === 1 ? 'text-yellow-400' : p.rank === 2 ? 'text-slate-300' : p.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {p.rank <= 3 ? ['🥇', '🥈', '🥉'][p.rank - 1] : `#${p.rank}`}
                  </span>
                  <span className={`text-sm font-bold flex-1 ${p.isUser ? 'text-purple-400' : 'text-white'}`}>
                    {p.name} {p.isUser && <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded ml-1">YOU</span>}
                  </span>
                  <span className="text-xs text-slate-400">{p.exact} exact</span>
                  <span className="text-xs text-slate-400">{p.accuracy}%</span>
                  <span className="text-sm font-black text-yellow-400 w-12 text-right">{p.points}pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Rules */}
          <div className="card p-5 mt-4">
            <h3 className="text-sm font-bold text-slate-200 mb-3">Scoring System</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 text-center">
                <p className="text-2xl font-black text-emerald-400">+10</p>
                <p className="text-[10px] text-slate-400">Exact Scoreline</p>
              </div>
              <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
                <p className="text-2xl font-black text-cyan-400">+3</p>
                <p className="text-[10px] text-slate-400">Correct Outcome</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3 border border-red-500/20 text-center">
                <p className="text-2xl font-black text-red-400">+0</p>
                <p className="text-[10px] text-slate-400">Wrong Prediction</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
