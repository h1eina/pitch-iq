'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Trophy, TrendingUp, Target, Calendar, ChevronRight, Zap, BarChart3, ArrowLeftRight } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem, GlowCard, AnimatedCounter, MagneticButton, ScrollProgress, FloatingParticles } from './components/animated';
import type { ApiMatch, ApiStanding, ApiScorer } from '@/lib/football-api';

/* ── Lightbox component ── */
function Lightbox({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative z-10 w-full max-w-lg card p-6 rounded-2xl"
            initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }} transition={{ type: 'spring', bounce: 0.25 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-sm font-bold">✕</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── ScrollProgressBar ── */
function ScrollProgressBar() {
  return <ScrollProgress />;
}

/* ── AnimatedHero ── */
function AnimatedHero() {
  return (
    <motion.section className="relative overflow-hidden rounded-2xl mesh-bg border border-white/[0.06] p-8"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-emerald-500/10" />
      <motion.div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-orange-500/5 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-emerald-500/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
      <div className="relative z-10">
        <motion.div className="flex items-center gap-2 mb-3"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <Zap size={20} className="text-orange-400" />
          </motion.div>
          <span className="text-sm font-bold text-orange-400/80 uppercase tracking-wider">Live Football Intelligence</span>
        </motion.div>
        <motion.h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          Welcome to <span className="gradient-text">PitchIQ</span>
        </motion.h1>
        <motion.p className="text-slate-400 max-w-xl text-sm"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          Real-time data from Europe&apos;s top 5 leagues. Live scores, standings, top scorers &mdash; all powered by live API data.
        </motion.p>
        <motion.div className="flex gap-3 mt-5"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <MagneticButton>
            <Link href="/analytics" className="pop-btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
              <BarChart3 size={14} /> Analytics Hub
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link href="/h2h" className="pop-btn px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 text-sm font-medium flex items-center gap-1.5">
              <ArrowLeftRight size={14} /> H2H Compare
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ── AnimatedMatchCard with lightbox ── */
function AnimatedMatchCard({ match }: { match: ApiMatch }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const home = match.score.fullTime.home;
  const away = match.score.fullTime.away;
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  return (
    <>
      <GlowCard className="card p-4 space-y-3 cursor-pointer">
        <div onClick={() => setShowLightbox(true)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {match.competition?.emblem && <img src={match.competition.emblem} alt="" className="crest-img" />}
              <span className="text-xs font-semibold text-slate-400">{match.competition?.name}</span>
            </div>
            {isLive ? (
              <motion.span className="flex items-center gap-1 text-xs font-bold text-red-400"
                animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <span className="live-dot" /> LIVE
              </motion.span>
            ) : match.status === 'FINISHED' ? (
              <span className="text-xs font-semibold text-slate-400">FT</span>
            ) : (
              <span className="text-xs text-slate-400">{format(new Date(match.utcDate), 'HH:mm')}</span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 flex-1">
              {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="crest-img" />}
              <span className="text-sm font-bold text-slate-200 truncate">{match.homeTeam.shortName || match.homeTeam.name}</span>
            </div>
            <motion.div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-center min-w-[60px]" whileHover={{ scale: 1.1 }}>
              <span className="text-lg font-black text-white">{home !== null ? home : '-'} : {away !== null ? away : '-'}</span>
            </motion.div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-sm font-bold text-slate-200 truncate text-right">{match.awayTeam.shortName || match.awayTeam.name}</span>
              {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="crest-img" />}
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center mt-2">Matchday {match.matchday} · {format(new Date(match.utcDate), 'MMM d, yyyy')}</div>
        </div>
      </GlowCard>
      <Lightbox isOpen={showLightbox} onClose={() => setShowLightbox(false)}
        title={`${match.homeTeam.shortName || match.homeTeam.name} vs ${match.awayTeam.shortName || match.awayTeam.name}`}>
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-6 py-4">
            <div className="text-center">
              {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="w-12 h-12 object-contain mx-auto mb-2" />}
              <p className="font-bold text-sm text-slate-200">{match.homeTeam.shortName}</p>
            </div>
            <div className="text-center px-6 py-3 rounded-xl bg-white/5 border border-white/[0.06]">
              <p className="text-3xl font-black text-white">{home ?? '-'} : {away ?? '-'}</p>
              <p className="text-xs text-slate-400 mt-1">HT: {match.score.halfTime.home ?? '-'} - {match.score.halfTime.away ?? '-'}</p>
            </div>
            <div className="text-center">
              {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="w-12 h-12 object-contain mx-auto mb-2" />}
              <p className="font-bold text-sm text-slate-200">{match.awayTeam.shortName}</p>
            </div>
          </div>
          <Link href={`/match/${match.id}`}
            className="block text-center pop-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold">
            View Full Match Details →
          </Link>
        </div>
      </Lightbox>
    </>
  );
}

/* ═══════════════════════════════════
   MAIN ANIMATED DASHBOARD WRAPPER
   ═══════════════════════════════════ */
export function AnimatedDashboard({
  todayMatches, allStandings, plScorers, chartData, leagueKeys, leagueCodes, plStandings, leagueMeta, leagueIds, children,
}: {
  todayMatches: ApiMatch[];
  allStandings: Record<string, ApiStanding[]>;
  plScorers: ApiScorer[];
  chartData: { name: string; goalsPerMatch: number; totalGoals: number; fill: string }[];
  leagueKeys: [string, string][];
  leagueCodes: string[];
  plStandings: ApiStanding[];
  leagueMeta: Record<string, { name: string; logo: string; color: string }>;
  leagueIds: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <ScrollProgressBar />
      <FloatingParticles count={15} />
      <AnimatedHero />

      {/* League Quick Nav — staggered */}
      <StaggerContainer className="flex gap-3 overflow-x-auto pb-2" staggerDelay={0.06}>
        {leagueKeys.map(([slug, code]) => {
          const meta = leagueMeta[code];
          if (!meta) return null;
          return (
            <StaggerItem key={slug}>
              <Link href={`/leagues/${slug}`}
                className="card flex items-center gap-2.5 px-5 py-3 whitespace-nowrap hover:border-orange-500/30 transition-all min-w-fit">
                <motion.span className="text-xl" whileHover={{ scale: 1.3, rotate: 10 }}>{meta.logo}</motion.span>
                <span className="text-sm font-bold text-slate-300">{meta.name}</span>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Charts */}
      <ScrollReveal>{children}</ScrollReveal>

      {/* Today's Matches */}
      <ScrollReveal>
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Calendar size={20} className="text-orange-400" />
              </motion.div>
              <h2 className="section-title">Today&apos;s Matches</h2>
            </div>
            <Link href="/matches" className="text-sm font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1">
              All Matches <ChevronRight size={14} />
            </Link>
          </div>
          {todayMatches.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayMatches.slice(0, 9).map((m) => (
                <StaggerItem key={m.id}><AnimatedMatchCard match={m} /></StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <motion.div className="card p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <p className="text-slate-400 font-medium">No matches scheduled today across the top 5 leagues.</p>
              <p className="text-xs text-slate-400 mt-1">Check the <Link href="/matches" className="text-orange-400 underline">Matches</Link> page.</p>
            </motion.div>
          )}
        </section>
      </ScrollReveal>

      {/* Standings + Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScrollReveal direction="left" className="lg:col-span-2">
          <section className="card overflow-hidden h-full">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2"><Trophy size={18} className="text-yellow-500" /><h2 className="section-title">Premier League Standings</h2></div>
              <Link href="/leagues/premier-league" className="text-xs font-semibold text-orange-400 hover:underline">Full Table →</Link>
            </div>
            {plStandings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                      <th className="text-left p-3 w-10">#</th><th className="text-left p-3">Team</th>
                      <th className="p-3 text-center">P</th><th className="p-3 text-center">W</th><th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">L</th><th className="p-3 text-center">GD</th><th className="p-3 text-center font-bold">Pts</th>
                      <th className="p-3 text-center">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plStandings.slice(0, 10).map((s, i) => (
                      <motion.tr key={s.team.id}
                        className={`border-b border-white/[0.03] hover:bg-white/[0.03] transition ${i < 4 ? 'border-l-2 border-l-emerald-500' : ''}`}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                        <td className="p-3 text-slate-400 font-bold">{s.position}</td>
                        <td className="p-3"><div className="flex items-center gap-2">{s.team.crest && <img src={s.team.crest} alt="" className="crest-img" />}<span className="font-semibold text-slate-200">{s.team.shortName || s.team.name}</span></div></td>
                        <td className="p-3 text-center text-slate-400">{s.playedGames}</td>
                        <td className="p-3 text-center text-slate-300 font-medium">{s.won}</td>
                        <td className="p-3 text-center text-slate-400">{s.draw}</td>
                        <td className="p-3 text-center text-slate-400">{s.lost}</td>
                        <td className="p-3 text-center text-slate-300">{s.goalDifference > 0 ? '+' : ''}{s.goalDifference}</td>
                        <td className="p-3 text-center font-black text-white">{s.points}</td>
                        <td className="p-3"><div className="flex gap-1 justify-center">
                          {(s.form || '').split(',').filter(Boolean).map((f, fi) => (
                            <motion.span key={fi} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${f === 'W' ? 'bg-emerald-500/20 text-emerald-400' : f === 'D' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}
                              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.05 * i + 0.02 * fi, type: 'spring' }}>{f}</motion.span>
                          ))}
                        </div></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (<div className="p-8 text-center text-slate-400"><p>Standings data unavailable.</p></div>)}
          </section>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <section className="card p-5 h-full">
            <div className="flex items-center gap-2 mb-4"><Target size={18} className="text-orange-500" /><h2 className="section-title">Top Scorers</h2></div>
            <Link href="/scorers" className="text-xs font-semibold text-orange-400 hover:underline block mb-4">All leagues →</Link>
            {plScorers.length > 0 ? (
              <div className="space-y-3">
                {plScorers.map((scorer, i) => (
                  <motion.div key={scorer.player.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }} whileHover={{ x: 4 }}>
                    <motion.span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400'}`}
                      whileHover={{ scale: 1.2, rotate: 10 }}>{i + 1}</motion.span>
                    {scorer.team.crest && <img src={scorer.team.crest} alt="" className="w-5 h-5 object-contain" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{scorer.player.name}</p>
                      <p className="text-xs text-slate-400">{scorer.team.shortName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">{scorer.goals}</p>
                      <p className="text-[10px] text-slate-400">{scorer.assists || 0} ast</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (<p className="text-sm text-slate-400 text-center py-4">Set API key to see real scorers</p>)}
          </section>
        </ScrollReveal>
      </div>

      {/* League Leaders */}
      <ScrollReveal>
        <section>
          <h2 className="section-title mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-emerald-400" /> League Leaders</h2>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {leagueCodes.map(code => {
              const standings = allStandings[code] || [];
              const meta = leagueMeta[code];
              const leader = standings[0];
              if (!leader || !meta) return null;
              return (
                <StaggerItem key={code}>
                  <GlowCard className="card p-4">
                    <Link href={`/leagues/${leagueIds[code]}`} className="block">
                      <div className="flex items-center gap-2 mb-3">
                        <motion.span className="text-lg" whileHover={{ scale: 1.3 }}>{meta.logo}</motion.span>
                        <span className="text-xs font-bold text-slate-400">{meta.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {leader.team.crest && <img src={leader.team.crest} alt="" className="w-8 h-8 object-contain" />}
                        <div>
                          <p className="text-sm font-black text-white">{leader.team.shortName}</p>
                          <p className="text-xs text-slate-400">{leader.points} pts · {leader.won}W {leader.draw}D {leader.lost}L</p>
                        </div>
                      </div>
                    </Link>
                  </GlowCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </ScrollReveal>

      {/* Quick Links */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/fantasy', label: 'Fantasy League', desc: 'Build your dream XI', icon: '⭐', color: 'from-yellow-500 to-orange-600' },
          { href: '/compare', label: 'Player Compare', desc: 'Side-by-side radars', icon: '🔀', color: 'from-pink-500 to-rose-600' },
          { href: '/standings', label: 'Standings', desc: 'Tables & projections', icon: '📋', color: 'from-blue-500 to-indigo-600' },
          { href: '/scouting', label: 'Scouting', desc: 'Wonderkids & gems', icon: '🔭', color: 'from-teal-500 to-cyan-600' },
          { href: '/awards', label: 'Season Awards', desc: 'TOTY & Golden Boot', icon: '🏆', color: 'from-amber-500 to-yellow-600' },
          { href: '/tactics', label: 'Tactical Board', desc: 'Formation builder', icon: '📐', color: 'from-lime-500 to-green-600' },
          { href: '/simulator', label: 'Match Simulator', desc: 'Live xG engine', icon: '⚡', color: 'from-red-500 to-rose-600' },
          { href: '/predictions', label: 'Predictions', desc: 'Predict & compete', icon: '🧠', color: 'from-purple-500 to-violet-600' },
          { href: '/transfers', label: 'Transfer Hub', desc: 'Deals & rumours', icon: '🔄', color: 'from-emerald-500 to-teal-600' },
          { href: '/analytics', label: 'Analytics Hub', desc: 'Cross-league stats', icon: '📊', color: 'from-orange-500 to-amber-600' },
          { href: '/h2h', label: 'Head-to-Head', desc: 'Compare any teams', icon: '⚔️', color: 'from-cyan-500 to-blue-600' },
          { href: '/trivia', label: 'Football Trivia', desc: '55+ questions', icon: '🎯', color: 'from-violet-500 to-purple-600' },
        ].map(item => (
          <StaggerItem key={item.href}>
            <Link href={item.href} className="block">
              <GlowCard className="card p-5">
                <motion.div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl mb-3 shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.4 }}>
                  {item.icon}
                </motion.div>
                <h3 className="font-bold text-slate-200 text-sm">{item.label}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </GlowCard>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
