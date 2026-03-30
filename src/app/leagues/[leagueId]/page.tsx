import Link from 'next/link';
import { getLeagueStandings, getLeagueScorers, getRecentLeagueMatches, LEAGUE_CODES, LEAGUE_META, LEAGUE_IDS } from '@/lib/football-api';
import { Trophy, ArrowLeft, TrendingUp, Award, ChevronRight, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { StandingsCharts } from './standings-charts';

export default async function LeaguePage({ params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;
  const code = LEAGUE_CODES[leagueId];
  if (!code) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white">League not found</h1>
        <Link href="/" className="text-orange-400 mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const meta = LEAGUE_META[code];
  const [standings, scorers, matches] = await Promise.all([
    getLeagueStandings(code),
    getLeagueScorers(code, 15),
    getRecentLeagueMatches(code),
  ]);


  // --- Computed league insights ---
  const totalGoals = standings.reduce((s, t) => s + t.goalsFor, 0);
  const totalMatches = standings.reduce((s, t) => s + t.playedGames, 0) / 2;
  const goalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : '0';
  const totalDraws = standings.reduce((s, t) => s + t.draw, 0) / 2;
  const drawPct = totalMatches > 0 ? ((totalDraws / totalMatches) * 100).toFixed(1) : '0';
  const avgGoalsFor = standings.length > 0 ? (standings.reduce((s, t) => s + t.goalsFor, 0) / standings.length).toFixed(1) : '0';
  const topGD = standings.length > 0 ? standings[0] : null;
  const bestAttack = [...standings].sort((a, b) => b.goalsFor - a.goalsFor)[0];
  const bestDefense = [...standings].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
  const mostWins = [...standings].sort((a, b) => b.won - a.won)[0];
  const leader = standings[0];


  const allLeagues = Object.entries(LEAGUE_CODES);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-slate-300"><ArrowLeft size={20} /></Link>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{meta.logo}</span>
          <div>
            <h1 className="text-2xl font-black text-white">{meta.name}</h1>
            <p className="text-sm text-slate-400">{meta.country} &middot; 2025/26 Season</p>
          </div>
        </div>
      </div>

      {/* League Nav */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {allLeagues.map(([slug, c]) => {
          const m = LEAGUE_META[c];
          return (
            <Link key={slug} href={`/leagues/${slug}`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                slug === leagueId ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'card text-slate-400 hover:text-slate-200'
              }`}>
              <span>{m.logo}</span> {m.name}
            </Link>
          );
        })}
      </div>


      {/* League Insight Cards */}
      {standings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="card p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Goals/Match</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{goalsPerMatch}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Goals</p>
            <p className="text-2xl font-black text-white mt-1">{totalGoals}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Draw %</p>
            <p className="text-2xl font-black text-yellow-400 mt-1">{drawPct}%</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Best Attack</p>
            <p className="text-sm font-bold text-slate-200 mt-1 truncate">{bestAttack?.team.shortName}</p>
            <p className="text-xs text-orange-400 font-black">{bestAttack?.goalsFor} GF</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Best Defense</p>
            <p className="text-sm font-bold text-slate-200 mt-1 truncate">{bestDefense?.team.shortName}</p>
            <p className="text-xs text-cyan-400 font-black">{bestDefense?.goalsAgainst} GA</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Most Wins</p>
            <p className="text-sm font-bold text-slate-200 mt-1 truncate">{mostWins?.team.shortName}</p>
            <p className="text-xs text-violet-400 font-black">{mostWins?.won} W</p>
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {matches.length > 0 && (
        <section>
          <h2 className="section-title flex items-center gap-2 mb-4">
            <TrendingUp className="text-emerald-400" size={18} /> Recent Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matches.slice(-8).map(m => (
              <div key={m.id} className="card p-3 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  {m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" className="crest-img" />}
                  <span className="text-sm font-bold text-slate-200 truncate">{m.homeTeam.shortName}</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/5 text-center min-w-[50px] border border-white/[0.06]">
                  <span className="text-sm font-black text-white">
                    {m.score.fullTime.home ?? '-'} : {m.score.fullTime.away ?? '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm font-bold text-slate-200 truncate text-right">{m.awayTeam.shortName}</span>
                  {m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" className="crest-img" />}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Standings */}
        <section className="lg:col-span-2 card overflow-hidden">
          <div className="p-5 border-b border-white/[0.06]">
            <h2 className="section-title flex items-center gap-2">
              <Trophy className="text-yellow-400" size={18} /> Full Standings
            </h2>
          </div>
          {standings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                    <th className="text-left p-3 w-10">#</th>
                    <th className="text-left p-3">Team</th>
                    <th className="p-3 text-center">P</th>
                    <th className="p-3 text-center">W</th>
                    <th className="p-3 text-center">D</th>
                    <th className="p-3 text-center">L</th>
                    <th className="p-3 text-center">GF</th>
                    <th className="p-3 text-center">GA</th>
                    <th className="p-3 text-center">GD</th>
                    <th className="p-3 text-center font-bold">Pts</th>
                    <th className="p-3 text-center">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => (
                    <tr key={s.team.id} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition ${
                      i < 4 ? 'border-l-2 border-l-emerald-500' : i >= standings.length - 3 ? 'border-l-2 border-l-red-500' : ''
                    }`}>
                      <td className="p-3 text-slate-400 font-bold">{s.position}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {s.team.crest && <img src={s.team.crest} alt="" className="crest-img" />}
                          <span className="font-semibold text-slate-200">{s.team.shortName || s.team.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-slate-400">{s.playedGames}</td>
                      <td className="p-3 text-center text-slate-300 font-medium">{s.won}</td>
                      <td className="p-3 text-center text-slate-400">{s.draw}</td>
                      <td className="p-3 text-center text-slate-400">{s.lost}</td>
                      <td className="p-3 text-center text-slate-300">{s.goalsFor}</td>
                      <td className="p-3 text-center text-slate-400">{s.goalsAgainst}</td>
                      <td className="p-3 text-center text-slate-300">{s.goalDifference > 0 ? '+' : ''}{s.goalDifference}</td>
                      <td className="p-3 text-center font-black text-white">{s.points}</td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-center">
                          {(s.form || '').split(',').filter(Boolean).map((f, fi) => (
                            <span key={fi} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              f === 'W' ? 'bg-emerald-500/20 text-emerald-400' : f === 'D' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>{f}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Standings unavailable. Check API key.</div>
          )}
        </section>

        {/* Top Scorers */}
        <section className="card p-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Award className="text-yellow-400" size={18} /> Top Scorers
          </h2>
          {scorers.length > 0 ? (
            <div className="space-y-2">
              {scorers.map((p, i) => (
                <div key={p.player.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400'
                  }`}>{i + 1}</span>
                  {p.team.crest && <img src={p.team.crest} alt="" className="w-5 h-5 object-contain" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{p.player.name}</p>
                    <p className="text-xs text-slate-400">{p.team.shortName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{p.goals}</p>
                    <p className="text-[10px] text-slate-400">{p.assists || 0} ast</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center">No scorer data available</p>
          )}
        </section>
      </div>




      {/* Standings Visualizer Charts */}
      {standings.length > 0 && (
        <section>
          <h2 className="section-title flex items-center gap-2 mb-4">
            <TrendingUp className="text-orange-400" size={18} /> Standings Visualizer
          </h2>
          <StandingsCharts standings={standings} leagueColor={meta?.color || '#f97316'} />
        </section>
      )}

      {/* Efficiency Rankings */}
      {standings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="card p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={16} /> Attack Efficiency
            </h3>
            <div className="space-y-2">
              {[...standings].sort((a, b) => (b.goalsFor / Math.max(b.playedGames, 1)) - (a.goalsFor / Math.max(a.playedGames, 1))).slice(0, 8).map((s, i) => {
                const gpm = (s.goalsFor / Math.max(s.playedGames, 1)).toFixed(2);
                const maxGpm = standings.reduce((m, t) => Math.max(m, t.goalsFor / Math.max(t.playedGames, 1)), 1);
                const pct = Math.round((parseFloat(gpm) / maxGpm) * 100);
                return (
                  <div key={s.team.id} className="flex items-center gap-3">
                    <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${i < 3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>{i + 1}</span>
                    {s.team.crest && <img src={s.team.crest} alt="" className="w-4 h-4 object-contain" />}
                    <span className="text-xs font-medium text-slate-300 w-20 truncate">{s.team.shortName}</span>
                    <div className="flex-1 stat-bar">
                      <div className="stat-bar-fill bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-emerald-400 w-10 text-right">{gpm}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="text-cyan-400" size={16} /> Defensive Strength
            </h3>
            <div className="space-y-2">
              {[...standings].sort((a, b) => (a.goalsAgainst / Math.max(a.playedGames, 1)) - (b.goalsAgainst / Math.max(b.playedGames, 1))).slice(0, 8).map((s, i) => {
                const gapm = (s.goalsAgainst / Math.max(s.playedGames, 1)).toFixed(2);
                const minGapm = standings.reduce((m, t) => Math.min(m, t.goalsAgainst / Math.max(t.playedGames, 1)), 999);
                const maxGapm = standings.reduce((m, t) => Math.max(m, t.goalsAgainst / Math.max(t.playedGames, 1)), 1);
                const pct = maxGapm > 0 ? Math.round(((maxGapm - parseFloat(gapm)) / (maxGapm - minGapm + 0.01)) * 100) : 50;
                return (
                  <div key={s.team.id} className="flex items-center gap-3">
                    <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${i < 3 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400'}`}>{i + 1}</span>
                    {s.team.crest && <img src={s.team.crest} alt="" className="w-4 h-4 object-contain" />}
                    <span className="text-xs font-medium text-slate-300 w-20 truncate">{s.team.shortName}</span>
                    <div className="flex-1 stat-bar">
                      <div className="stat-bar-fill bg-gradient-to-r from-cyan-400 to-blue-400" style={{ width: `${Math.max(pct, 10)}%` }} />
                    </div>
                    <span className="text-xs font-black text-cyan-400 w-10 text-right">{gapm}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}