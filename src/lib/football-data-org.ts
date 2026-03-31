// =============================================================================
// PitchIQ - Football-Data.org API Client (FREE tier: 10 req/min, no daily cap)
// Used for: standings, fixtures, scorers — saves API-Football quota for live data
// Docs: https://www.football-data.org/documentation/api
// =============================================================================

const FDO_BASE = 'https://api.football-data.org/v4';
const FDO_KEY = (process.env.FOOTBALL_DATA_ORG_KEY || '').trim();

// Football-Data.org competition IDs for the top 5 leagues
const FDO_LEAGUE_IDS: Record<string, number> = {
  'PL': 2021, 'PD': 2014, 'SA': 2019, 'BL1': 2002, 'FL1': 2015,
};

// Shared interfaces (same shape as football-api.ts for drop-in compatibility)
import type { ApiStanding, ApiMatch, ApiScorer } from './football-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fdoFetch(path: string, revalidate = 600): Promise<any> {
  if (!FDO_KEY) {
    console.warn('[Football-Data.org] No API key set (FOOTBALL_DATA_ORG_KEY). Skipping.');
    return null;
  }
  const res = await fetch(`${FDO_BASE}${path}`, {
    headers: { 'X-Auth-Token': FDO_KEY },
    next: { revalidate },
  });
  if (!res.ok) {
    console.error(`[Football-Data.org] ${res.status} for ${path}`);
    return null;
  }
  return res.json();
}

// --- Adapters: Football-Data.org v4 → our common types ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptFdoStanding(s: any): ApiStanding {
  return {
    position: s.position,
    team: {
      id: s.team.id,
      name: s.team.name,
      shortName: s.team.shortName || s.team.tla || s.team.name,
      crest: s.team.crest || '',
    },
    playedGames: s.playedGames,
    form: s.form || null,
    won: s.won,
    draw: s.draw,
    lost: s.lost,
    points: s.points,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalDifference,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptFdoMatch(m: any, leagueCode: string): ApiMatch {
  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,           // FDO uses same status strings we want
    matchday: m.matchday || 0,
    stage: m.stage || '',
    homeTeam: {
      id: m.homeTeam?.id || 0,
      name: m.homeTeam?.name || 'TBD',
      shortName: m.homeTeam?.shortName || m.homeTeam?.tla || m.homeTeam?.name || 'TBD',
      crest: m.homeTeam?.crest || '',
    },
    awayTeam: {
      id: m.awayTeam?.id || 0,
      name: m.awayTeam?.name || 'TBD',
      shortName: m.awayTeam?.shortName || m.awayTeam?.tla || m.awayTeam?.name || 'TBD',
      crest: m.awayTeam?.crest || '',
    },
    score: {
      winner: m.score?.winner || null,
      fullTime: {
        home: m.score?.fullTime?.home ?? null,
        away: m.score?.fullTime?.away ?? null,
      },
      halfTime: {
        home: m.score?.halfTime?.home ?? null,
        away: m.score?.halfTime?.away ?? null,
      },
    },
    referees: (m.referees || []).map((r: any) => ({ name: r.name, nationality: r.nationality || '' })),
    competition: {
      id: m.competition?.id || 0,
      name: m.competition?.name || '',
      code: leagueCode,
      emblem: m.competition?.emblem || '',
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptFdoScorer(s: any): ApiScorer {
  return {
    player: {
      id: s.player?.id || 0,
      name: s.player?.name || '',
      nationality: s.player?.nationality || '',
      dateOfBirth: s.player?.dateOfBirth || '',
      section: s.player?.section || s.player?.position || '',
    },
    team: {
      id: s.team?.id || 0,
      name: s.team?.name || '',
      shortName: s.team?.shortName || s.team?.tla || s.team?.name || '',
      crest: s.team?.crest || '',
    },
    playedMatches: s.playedMatches || 0,
    goals: s.goals || 0,
    assists: s.assists ?? null,
    penalties: s.penalties ?? null,
  };
}

// --- Public API (mirrors football-api.ts signatures) ---

export async function fdoGetStandings(competitionCode: string): Promise<ApiStanding[] | null> {
  const compId = FDO_LEAGUE_IDS[competitionCode];
  if (!compId) return null;
  const data = await fdoFetch(`/competitions/${compId}/standings`, 3600);
  if (!data?.standings?.[0]?.table) return null;
  return data.standings[0].table.map(adaptFdoStanding);
}

export async function fdoGetMatches(
  competitionCode: string,
  filters?: { status?: string; matchday?: number; dateFrom?: string; dateTo?: string }
): Promise<ApiMatch[] | null> {
  const compId = FDO_LEAGUE_IDS[competitionCode];
  if (!compId) return null;
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.matchday) params.set('matchday', String(filters.matchday));
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.set('dateTo', filters.dateTo);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const data = await fdoFetch(`/competitions/${compId}/matches${qs}`, 1800);
  if (!data?.matches) return null;
  return data.matches.map((m: any) => adaptFdoMatch(m, competitionCode));
}

export async function fdoGetScorers(competitionCode: string, limit = 15): Promise<ApiScorer[] | null> {
  const compId = FDO_LEAGUE_IDS[competitionCode];
  if (!compId) return null;
  const data = await fdoFetch(`/competitions/${compId}/scorers?limit=${limit}`, 3600);
  if (!data?.scorers) return null;
  return data.scorers.map(adaptFdoScorer);
}

export async function fdoGetTodayMatches(): Promise<ApiMatch[] | null> {
  const today = new Date().toISOString().slice(0, 10);
  const data = await fdoFetch(`/matches?date=${today}`, 300);
  if (!data?.matches) return null;
  const top5 = new Set(Object.values(FDO_LEAGUE_IDS));
  return data.matches
    .filter((m: any) => top5.has(m.competition?.id))
    .map((m: any) => {
      const code = Object.entries(FDO_LEAGUE_IDS).find(([, id]) => id === m.competition?.id)?.[0] || '';
      return adaptFdoMatch(m, code);
    });
}

export function isFdoConfigured(): boolean {
  return FDO_KEY.length > 0;
}
