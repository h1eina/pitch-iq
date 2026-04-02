import { getAllLeagueStandings, LEAGUE_CODES, type ApiStanding } from '@/lib/football-api';
import StandingsClient from './standings-client';

export default async function StandingsPage() {
  const allStandings = await getAllLeagueStandings();

  // Convert to serializable format keyed by slug
  const standingsBySlug: Record<string, ApiStanding[]> = {};
  for (const [slug, code] of Object.entries(LEAGUE_CODES)) {
    standingsBySlug[slug] = allStandings[code] ?? [];
  }

  return <StandingsClient standingsByLeague={standingsBySlug} />;
}
