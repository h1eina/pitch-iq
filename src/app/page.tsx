import { getTodayMatches, getLeagueScorers, getAllLeagueStandings, LEAGUE_CODES, LEAGUE_META, LEAGUE_IDS } from '@/lib/football-api';
import { DashboardCharts } from './dashboard-charts';
import { AnimatedDashboard } from './dashboard-animated';

export const revalidate = 120;

export default async function Dashboard() {
  const [todayMatches, allStandings, plScorers] = await Promise.all([
    getTodayMatches(),
    getAllLeagueStandings(),
    getLeagueScorers('PL', 10),
  ]);

  const leagueKeys = Object.entries(LEAGUE_CODES) as [string, string][];
  const leagueCodes = Object.keys(LEAGUE_META);

  const chartData = leagueCodes.map(code => {
    const standings = allStandings[code] || [];
    const meta = LEAGUE_META[code];
    const totalGoals = standings.reduce((sum, s) => sum + s.goalsFor, 0);
    const totalMatches = standings.reduce((sum, s) => sum + s.playedGames, 0) / 2;
    const goalsPerMatch = totalMatches > 0 ? +(totalGoals / totalMatches).toFixed(2) : 0;
    return { name: meta.name, goalsPerMatch, totalGoals, fill: meta.color };
  }).filter(d => d.totalGoals > 0);

  const plStandings = allStandings['PL'] || [];

  // Strip non-serializable fields from LEAGUE_META for client
  const leagueMeta: Record<string, { name: string; logo: string; color: string }> = {};
  for (const [code, meta] of Object.entries(LEAGUE_META)) {
    leagueMeta[code] = { name: meta.name, logo: meta.logo, color: meta.color };
  }

  return (
    <AnimatedDashboard
      todayMatches={todayMatches}
      allStandings={allStandings}
      plScorers={plScorers}
      chartData={chartData}
      leagueKeys={leagueKeys}
      leagueCodes={leagueCodes}
      plStandings={plStandings}
      leagueMeta={leagueMeta}
      leagueIds={LEAGUE_IDS}
    >
      {chartData.length > 0 && <DashboardCharts data={chartData} />}
    </AnimatedDashboard>
  );
}
