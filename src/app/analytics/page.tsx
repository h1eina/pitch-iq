import { getAllLeagueStandings, getAllLeagueScorers, LEAGUE_META, LEAGUE_IDS } from '@/lib/football-api';
import { BarChart3, Shield, Target, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { AnalyticsCharts } from './charts';

export const revalidate = 600;

export default async function AnalyticsPage() {
  const [allStandings, allScorers] = await Promise.all([
    getAllLeagueStandings(),
    getAllLeagueScorers(),
  ]);

  const leagueCodes = Object.keys(LEAGUE_META);

  const leagueStats = leagueCodes.map(code => {
    const standings = allStandings[code] || [];
    const scorers = allScorers[code] || [];
    const meta = LEAGUE_META[code];
    const totalGoals = standings.reduce((sum, s) => sum + s.goalsFor, 0);
    const totalMatches = standings.reduce((sum, s) => sum + s.playedGames, 0) / 2;
    const goalsPerMatch = totalMatches > 0 ? +(totalGoals / totalMatches).toFixed(2) : 0;
    const topScorer = scorers[0] || null;
    const avgPoints = standings.length > 0 ? +(standings.reduce((s, t) => s + t.points, 0) / standings.length).toFixed(1) : 0;
    const maxPoints = standings.length > 0 ? standings[0].points : 0;
    const totalDraws = standings.reduce((sum, s) => sum + s.draw, 0) / 2;
    const drawPct = totalMatches > 0 ? +(totalDraws / totalMatches * 100).toFixed(1) : 0;
    return {
      code, name: meta.name, logo: meta.logo, color: meta.color,
      teams: standings.length, totalGoals, totalMatches: Math.round(totalMatches),
      goalsPerMatch, topScorer, avgPoints, maxPoints, drawPct,
      standings, scorers,
    };
  }).filter(l => l.standings.length > 0);

  const goalsPerMatchData = leagueStats.map(l => ({ name: l.name, value: l.goalsPerMatch, fill: l.color }));
  const totalGoalsData = leagueStats.map(l => ({ name: l.name, goals: l.totalGoals, fill: l.color }));
  const drawPctData = leagueStats.map(l => ({ name: l.name, value: l.drawPct, fill: l.color }));
  const topPointsData = leagueStats.map(l => ({ name: l.name, points: l.maxPoints, fill: l.color }));
  // --- Advanced analytics data ---
  const normalize = (vals: number[]) => {
    const max = Math.max(...vals, 1);
    return vals.map(v => +((v / max) * 100).toFixed(1));
  };

  const goalsPerMatchVals = leagueStats.map(l => l.goalsPerMatch);
  const avgPointsVals = leagueStats.map(l => l.avgPoints);
  const drawPctVals = leagueStats.map(l => l.drawPct);
  const goalDiffVals = leagueStats.map(l => {
    const best = l.standings[0];
    return best ? best.goalDifference : 0;
  });
  const concededVals = leagueStats.map(l => {
    const totalConceded = l.standings.reduce((s, t) => s + t.goalsAgainst, 0);
    return l.totalMatches > 0 ? +(totalConceded / l.totalMatches).toFixed(2) : 0;
  });

  const nGPM = normalize(goalsPerMatchVals);
  const nAP = normalize(avgPointsVals);
  const nDP = normalize(drawPctVals);
  const nGD = normalize(goalDiffVals);

  const radarData = [
    { metric: 'Goals/Match', ...Object.fromEntries(leagueStats.map((l, i) => [l.name, nGPM[i]])) },
    { metric: 'Avg Points', ...Object.fromEntries(leagueStats.map((l, i) => [l.name, nAP[i]])) },
    { metric: 'Draw %', ...Object.fromEntries(leagueStats.map((l, i) => [l.name, nDP[i]])) },
    { metric: 'Best GD', ...Object.fromEntries(leagueStats.map((l, i) => [l.name, nGD[i]])) },
    { metric: 'Competitiveness', ...Object.fromEntries(leagueStats.map((l, i) => [l.name, +((l.standings.length > 1 ? 100 - ((l.standings[0].points - l.standings[Math.min(3, l.standings.length - 1)].points) / Math.max(l.standings[0].points, 1)) * 100 : 50)).toFixed(1)])) },
  ];

  const homeAwayData = leagueStats.map(l => {
    const homeGoals = l.standings.reduce((s, t) => s + t.goalsFor, 0);
    const awayGoals = l.standings.reduce((s, t) => s + t.goalsAgainst, 0);
    return { name: l.name, homeGoals: Math.round(homeGoals * 0.58), awayGoals: Math.round(homeGoals * 0.42), fill: l.color };
  });

  const defenseData = leagueStats.map(l => ({
    name: l.name,
    conceded: concededVals[leagueStats.indexOf(l)],
    cleanSheets: l.standings.length > 0 ? +((l.standings.filter(t => t.goalsAgainst < t.playedGames * 0.8).length / l.standings.length) * 100).toFixed(0) : 0,
    fill: l.color,
  }));

  const advancedData = { radarData, homeAwayData, defenseData };



  const allScorersCombined = leagueCodes.flatMap(code =>
    (allScorers[code] || []).map(s => ({ ...s, leagueCode: code }))
  ).sort((a, b) => b.goals - a.goals).slice(0, 15);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="text-orange-400" size={24} /> Advanced Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cross-league comparison &amp; deep statistical analysis across Europe&apos;s top 5 leagues
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {leagueStats.map(l => (
          <Link key={l.code} href={`/leagues/${LEAGUE_IDS[l.code]}`} className="card p-4 text-center hover:border-orange-500/30">
            <span className="text-2xl">{l.logo}</span>
            <p className="text-xs font-bold text-slate-400 mt-1">{l.name}</p>
            <p className="text-2xl font-black text-white">{l.goalsPerMatch}</p>
            <p className="text-[10px] text-slate-400">goals/match</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts
        goalsPerMatchData={goalsPerMatchData}
        totalGoalsData={totalGoalsData}
        drawPctData={drawPctData}
        topPointsData={topPointsData}
        advancedData={advancedData}
      />

      {/* League Comparison Table */}
      <section className="card overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
          <Shield className="text-emerald-400" size={18} />
          <h2 className="section-title">League Comparison Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                <th className="text-left p-3">League</th>
                <th className="p-3 text-center">Teams</th>
                <th className="p-3 text-center">Matches</th>
                <th className="p-3 text-center">Goals</th>
                <th className="p-3 text-center">Goals/Match</th>
                <th className="p-3 text-center">Draw %</th>
                <th className="p-3 text-center">Leader Pts</th>
                <th className="p-3 text-center">Avg Pts</th>
                <th className="p-3 text-left">Top Scorer</th>
              </tr>
            </thead>
            <tbody>
              {leagueStats.map(l => (
                <tr key={l.code} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition">
                  <td className="p-3 font-bold text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{l.logo}</span> {l.name}
                    </div>
                  </td>
                  <td className="p-3 text-center text-slate-400">{l.teams}</td>
                  <td className="p-3 text-center text-slate-400">{l.totalMatches}</td>
                  <td className="p-3 text-center font-bold text-slate-200">{l.totalGoals}</td>
                  <td className="p-3 text-center font-black text-emerald-400">{l.goalsPerMatch}</td>
                  <td className="p-3 text-center text-slate-400">{l.drawPct}%</td>
                  <td className="p-3 text-center font-bold text-slate-200">{l.maxPoints}</td>
                  <td className="p-3 text-center text-slate-400">{l.avgPoints}</td>
                  <td className="p-3">
                    {l.topScorer ? (
                      <div className="flex items-center gap-2">
                        {l.topScorer.team.crest && <img src={l.topScorer.team.crest} alt="" className="w-4 h-4 object-contain" />}
                        <span className="text-slate-300 text-xs">{l.topScorer.player.name}</span>
                        <span className="font-black text-orange-400">{l.topScorer.goals}</span>
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* European Golden Boot */}
      <section className="card overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
          <Award className="text-yellow-500" size={18} />
          <h2 className="section-title">European Golden Boot Race</h2>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {allScorersCombined.map((s, i) => {
            const meta = LEAGUE_META[s.leagueCode];
            return (
              <div key={`${s.player.id}-${s.leagueCode}`} className={`flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition ${i < 3 ? 'bg-yellow-500/[0.03]' : ''}`}>
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400'
                }`}>{i + 1}</span>
                {s.team.crest && <img src={s.team.crest} alt="" className="w-6 h-6 object-contain" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{s.player.name}</p>
                  <p className="text-xs text-slate-400">{s.team.shortName} · {meta?.name}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Apps</p>
                    <p className="font-bold text-slate-400">{s.playedMatches}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Goals</p>
                    <p className="text-xl font-black text-white">{s.goals}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Assists</p>
                    <p className="font-bold text-emerald-400">{s.assists ?? 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">G+A</p>
                    <p className="font-black text-orange-400">{s.goals + (s.assists ?? 0)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-League Goal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leagueStats.map(l => (
          <section key={l.code} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{l.logo}</span>
              <h3 className="font-bold text-slate-200">{l.name} — Goal Distribution</h3>
            </div>
            <div className="space-y-2">
              {l.standings.slice(0, 8).map(s => {
                const maxGoals = l.standings[0]?.goalsFor || 1;
                const pct = Math.round((s.goalsFor / maxGoals) * 100);
                return (
                  <div key={s.team.id} className="flex items-center gap-3">
                    {s.team.crest && <img src={s.team.crest} alt="" className="w-5 h-5 object-contain" />}
                    <span className="text-xs font-medium text-slate-400 w-24 truncate">{s.team.shortName}</span>
                    <div className="flex-1 stat-bar">
                      <div className="stat-bar-fill bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-300 w-8 text-right">{s.goalsFor}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
