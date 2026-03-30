// =============================================================================
// PitchIQ - Real Football Data API Client (football-data.org)
// Free tier: 10 req/min — we cache aggressively with Next.js revalidation
// =============================================================================

const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY || '';

// Competition codes for top 5 leagues
export const LEAGUE_CODES: Record<string, string> = {
  'premier-league': 'PL',
  'la-liga': 'PD',
  'serie-a': 'SA',
  'bundesliga': 'BL1',
  'ligue-1': 'FL1',
};

export const LEAGUE_IDS: Record<string, string> = {
  'PL': 'premier-league',
  'PD': 'la-liga',
  'SA': 'serie-a',
  'BL1': 'bundesliga',
  'FL1': 'ligue-1',
};

export const LEAGUE_META: Record<string, { name: string; country: string; logo: string; color: string }> = {
  'PL':  { name: 'Premier League', country: 'England', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3D195B' },
  'PD':  { name: 'La Liga',        country: 'Spain',   logo: '🇪🇸', color: '#FF4B44' },
  'SA':  { name: 'Serie A',        country: 'Italy',   logo: '🇮🇹', color: '#024494' },
  'BL1': { name: 'Bundesliga',     country: 'Germany', logo: '🇩🇪', color: '#D20515' },
  'FL1': { name: 'Ligue 1',        country: 'France',  logo: '🇫🇷', color: '#091C3E' },
};

async function apiFetch<T>(path: string, revalidate = 300): Promise<T> {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'X-Auth-Token': API_KEY },
      next: { revalidate },
    });
    if (res.status === 429 && attempt < maxRetries - 1) {
      // Rate limited — wait and retry with exponential backoff
      await new Promise(r => setTimeout(r, (attempt + 1) * 7000));
      continue;
    }
    if (!res.ok) {
      console.error(`Football API error: ${res.status} for ${path}`);
      throw new Error(`API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
  }
  throw new Error(`API failed after ${maxRetries} retries for ${path}`);
}

// --- Types matching football-data.org v4 responses ---

export interface ApiStanding {
  position: number;
  team: { id: number; name: string; shortName: string; crest: string };
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  homeTeam: { id: number; name: string; shortName: string; crest: string };
  awayTeam: { id: number; name: string; shortName: string; crest: string };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  referees: { name: string; nationality: string }[];
  competition: { id: number; name: string; code: string; emblem: string };
}

export interface ApiScorer {
  player: { id: number; name: string; nationality: string; dateOfBirth: string; section: string };
  team: { id: number; name: string; shortName: string; crest: string };
  playedMatches: number;
  goals: number;
  assists: number | null;
  penalties: number | null;
}

// --- Public API functions ---

export async function getLeagueStandings(competitionCode: string): Promise<ApiStanding[]> {
  try {
    const data = await apiFetch<{ standings: { table: ApiStanding[] }[] }>(
      `/competitions/${competitionCode}/standings`, 300
    );
    return data.standings?.[0]?.table || [];
  } catch {
    return [];
  }
}

export async function getLeagueMatches(competitionCode: string, matchday?: number): Promise<ApiMatch[]> {
  try {
    const query = matchday ? `?matchday=${matchday}` : '';
    const data = await apiFetch<{ matches: ApiMatch[] }>(
      `/competitions/${competitionCode}/matches${query}`, 120
    );
    return data.matches || [];
  } catch {
    return [];
  }
}

export async function getRecentLeagueMatches(competitionCode: string): Promise<ApiMatch[]> {
  try {
    const data = await apiFetch<{ matches: ApiMatch[] }>(
      `/competitions/${competitionCode}/matches?status=FINISHED&limit=10`, 300
    );
    return (data.matches || []).slice(-10);
  } catch {
    return [];
  }
}

export async function getLeagueScorers(competitionCode: string, limit = 15): Promise<ApiScorer[]> {
  try {
    const data = await apiFetch<{ scorers: ApiScorer[] }>(
      `/competitions/${competitionCode}/scorers?limit=${limit}`, 600
    );
    return data.scorers || [];
  } catch {
    return [];
  }
}

export async function getMatchDetail(matchId: number): Promise<ApiMatch | null> {
  try {
    return await apiFetch<ApiMatch>(`/matches/${matchId}`, 60);
  } catch {
    return null;
  }
}

export async function getTodayMatches(): Promise<ApiMatch[]> {
  try {
    const data = await apiFetch<{ matches: ApiMatch[] }>('/matches', 120);
    return (data.matches || []).filter(m => {
      const code = m.competition?.code;
      return ['PL', 'PD', 'SA', 'BL1', 'FL1'].includes(code);
    });
  } catch {
    return [];
  }
}

export async function getScheduledMatches(): Promise<ApiMatch[]> {
  try {
    const data = await apiFetch<{ matches: ApiMatch[] }>('/matches?status=SCHEDULED', 300);
    return (data.matches || []).filter(m => {
      const code = m.competition?.code;
      return ['PL', 'PD', 'SA', 'BL1', 'FL1'].includes(code);
    }).slice(0, 20);
  } catch {
    return [];
  }
}

// --- Additional API Types ---

export interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  coach: { id: number; name: string; nationality: string } | null;
  squad: { id: number; name: string; position: string; nationality: string; dateOfBirth: string }[];
  runningCompetitions: { id: number; name: string; code: string; emblem: string }[];
}

export interface ApiHead2Head {
  numberOfMatches: number;
  totalGoals: number;
  homeTeam: { id: number; name: string; wins: number; draws: number; losses: number };
  awayTeam: { id: number; name: string; wins: number; draws: number; losses: number };
}

export interface ApiMatchFull extends ApiMatch {
  head2head?: ApiHead2Head;
}

// --- Additional Public API Functions ---

export async function getTeamDetail(teamId: number): Promise<ApiTeam | null> {
  try {
    return await apiFetch<ApiTeam>(`/teams/${teamId}`, 600);
  } catch {
    return null;
  }
}

export async function getTeamMatches(teamId: number, status?: string): Promise<ApiMatch[]> {
  try {
    const query = status ? `?status=${status}` : '';
    const data = await apiFetch<{ matches: ApiMatch[] }>(`/teams/${teamId}/matches${query}`, 300);
    return data.matches || [];
  } catch {
    return [];
  }
}

export async function getMatchWithH2H(matchId: number): Promise<ApiMatchFull | null> {
  try {
    return await apiFetch<ApiMatchFull>(`/matches/${matchId}`, 60);
  } catch {
    return null;
  }
}

export async function getCompetitionTeams(competitionCode: string): Promise<{ id: number; name: string; shortName: string; crest: string; venue: string; coach: { name: string } | null }[]> {
  try {
    const data = await apiFetch<{ teams: { id: number; name: string; shortName: string; crest: string; venue: string; coach: { name: string } | null }[] }>(
      `/competitions/${competitionCode}/teams`, 3600
    );
    return data.teams || [];
  } catch {
    return [];
  }
}

export async function getAllLeagueStandings(): Promise<Record<string, ApiStanding[]>> {
  const codes = Object.keys(LEAGUE_META);
  const results = await Promise.all(
    codes.map(code => getLeagueStandings(code).then(standings => ({ code, standings })))
  );
  const map: Record<string, ApiStanding[]> = {};
  for (const { code, standings } of results) {
    map[code] = standings;
  }
  return map;
}

export async function getAllLeagueScorers(): Promise<Record<string, ApiScorer[]>> {
  const codes = Object.keys(LEAGUE_META);
  const results = await Promise.all(
    codes.map(code => getLeagueScorers(code, 20).then(scorers => ({ code, scorers })))
  );
  const map: Record<string, ApiScorer[]> = {};
  for (const { code, scorers } of results) {
    map[code] = scorers;
  }
  return map;
}

export async function getFinishedMatches(): Promise<ApiMatch[]> {
  try {
    const data = await apiFetch<{ matches: ApiMatch[] }>('/matches?status=FINISHED', 300);
    return (data.matches || []).filter(m => {
      const code = m.competition?.code;
      return ['PL', 'PD', 'SA', 'BL1', 'FL1'].includes(code);
    });
  } catch {
    return [];
  }
}
