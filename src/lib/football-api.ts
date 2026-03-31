// =============================================================================
// PitchIQ - Real Football Data API Client (API-Football v3 via api-sports.io)
// Free tier: 100 req/day — we cache aggressively with Next.js revalidation
// =============================================================================

// --- Football-Data.org fallback (no daily cap) ---
import { fdoGetStandings, fdoGetMatches, fdoGetScorers, fdoGetTodayMatches, fdoGetRecentMatches, fdoGetScheduledMatches, isFdoConfigured } from './football-data-org';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = (process.env.API_FOOTBALL_KEY || '').trim();
const SEASON = 2024; // API-Football free tier max is 2024; FDO auto-detects current season

// Internal mapping: our codes → API-Football numeric league IDs
const LEAGUE_API_IDS: Record<string, number> = {
  'PL': 39, 'PD': 140, 'SA': 135, 'BL1': 78, 'FL1': 61,
};
const API_ID_TO_CODE: Record<number, string> = Object.fromEntries(
  Object.entries(LEAGUE_API_IDS).map(([code, id]) => [id, code])
);
const TOP5_IDS = new Set(Object.values(LEAGUE_API_IDS));

// Competition codes for top 5 leagues (slug → code)
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
  'PL':  { name: 'Premier League', country: 'England', logo: '🏴��󠁢󠁥󠁮󠁧󠁿', color: '#3D195B' },
  'PD':  { name: 'La Liga',        country: 'Spain',   logo: '🇪🇸', color: '#FF4B44' },
  'SA':  { name: 'Serie A',        country: 'Italy',   logo: '🇮🇹', color: '#024494' },
  'BL1': { name: 'Bundesliga',     country: 'Germany', logo: '🇩🇪', color: '#D20515' },
  'FL1': { name: 'Ligue 1',        country: 'France',  logo: '🇫🇷', color: '#091C3E' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiFetch(path: string, revalidate = 300): Promise<any> {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'x-apisports-key': API_KEY },
      next: { revalidate },
    });
    if (res.status === 429 && attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, (attempt + 1) * 7000));
      continue;
    }
    if (!res.ok) {
      console.error(`Football API error: ${res.status} for ${path}`);
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  }
  throw new Error(`API failed after ${maxRetries} retries for ${path}`);
}

// --- Status mapping: API-Football short codes → our status strings ---
function mapStatus(short: string): string {
  const m: Record<string, string> = {
    'FT': 'FINISHED', 'AET': 'FINISHED', 'PEN': 'FINISHED', 'AWD': 'FINISHED', 'WO': 'FINISHED',
    'NS': 'SCHEDULED', 'TBD': 'SCHEDULED',
    '1H': 'IN_PLAY', '2H': 'IN_PLAY', 'ET': 'IN_PLAY', 'LIVE': 'IN_PLAY', 'INT': 'IN_PLAY',
    'HT': 'PAUSED', 'BT': 'PAUSED',
    'PST': 'POSTPONED', 'CANC': 'CANCELLED', 'SUSP': 'SUSPENDED', 'ABD': 'CANCELLED',
  };
  return m[short] || short;
}

// --- Types (same interface as before — backward compatible) ---

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

// --- Adapters: transform API-Football v3 responses → our types ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptStanding(s: any): ApiStanding {
  return {
    position: s.rank,
    team: { id: s.team.id, name: s.team.name, shortName: s.team.name, crest: s.team.logo },
    playedGames: s.all.played,
    form: s.form || null,
    won: s.all.win,
    draw: s.all.draw,
    lost: s.all.lose,
    points: s.points,
    goalsFor: s.all.goals.for,
    goalsAgainst: s.all.goals.against,
    goalDifference: s.goalsDiff,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptFixture(f: any): ApiMatch {
  const leagueId = f.league?.id;
  const code = API_ID_TO_CODE[leagueId] || '';
  const round = f.league?.round || '';
  const matchday = parseInt(round.replace(/\D+/g, '') || '0', 10);
  return {
    id: f.fixture.id,
    utcDate: f.fixture.date,
    status: mapStatus(f.fixture.status?.short || 'NS'),
    matchday,
    stage: round,
    homeTeam: { id: f.teams.home.id, name: f.teams.home.name, shortName: f.teams.home.name, crest: f.teams.home.logo },
    awayTeam: { id: f.teams.away.id, name: f.teams.away.name, shortName: f.teams.away.name, crest: f.teams.away.logo },
    score: {
      winner: f.teams.home.winner === true ? 'HOME_TEAM' : f.teams.away.winner === true ? 'AWAY_TEAM' : (f.goals.home !== null && f.goals.home === f.goals.away ? 'DRAW' : null),
      fullTime: { home: f.score?.fulltime?.home ?? f.goals?.home ?? null, away: f.score?.fulltime?.away ?? f.goals?.away ?? null },
      halfTime: { home: f.score?.halftime?.home ?? null, away: f.score?.halftime?.away ?? null },
    },
    referees: f.fixture.referee ? [{ name: f.fixture.referee, nationality: '' }] : [],
    competition: { id: leagueId, name: f.league.name, code, emblem: f.league.logo },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptScorer(s: any): ApiScorer {
  const stats = s.statistics?.[0] || {};
  return {
    player: {
      id: s.player.id,
      name: s.player.name,
      nationality: s.player.nationality || '',
      dateOfBirth: s.player.birth?.date || '',
      section: stats.games?.position || '',
    },
    team: {
      id: stats.team?.id || 0,
      name: stats.team?.name || '',
      shortName: stats.team?.name || '',
      crest: stats.team?.logo || '',
    },
    playedMatches: stats.games?.appearences || 0,
    goals: stats.goals?.total || 0,
    assists: stats.goals?.assists ?? null,
    penalties: stats.penalty?.scored ?? null,
  };
}

// --- Public API functions ---

export async function getLeagueStandings(competitionCode: string): Promise<ApiStanding[]> {
  // Try Football-Data.org first (no daily cap) → fall back to API-Football
  if (isFdoConfigured()) {
    try {
      const fdo = await fdoGetStandings(competitionCode);
      if (fdo && fdo.length > 0) return fdo;
    } catch { /* fall through to API-Football */ }
  }
  try {
    const leagueId = LEAGUE_API_IDS[competitionCode];
    if (!leagueId) return [];
    const data = await apiFetch(`/standings?league=${leagueId}&season=${SEASON}`, 3600);
    const standings = data.response?.[0]?.league?.standings?.[0] || [];
    return standings.map(adaptStanding);
  } catch {
    return [];
  }
}

export async function getLeagueMatches(competitionCode: string, matchday?: number): Promise<ApiMatch[]> {
  // Try Football-Data.org first (no daily cap) → fall back to API-Football
  if (isFdoConfigured()) {
    try {
      const fdo = await fdoGetMatches(competitionCode, matchday ? { matchday } : undefined);
      if (fdo && fdo.length > 0) return fdo;
    } catch { /* fall through to API-Football */ }
  }
  try {
    const leagueId = LEAGUE_API_IDS[competitionCode];
    if (!leagueId) return [];
    const roundQ = matchday ? `&round=Regular Season - ${matchday}` : '';
    const data = await apiFetch(`/fixtures?league=${leagueId}&season=${SEASON}${roundQ}`, 3600);
    return (data.response || []).map(adaptFixture);
  } catch {
    return [];
  }
}

export async function getRecentLeagueMatches(competitionCode: string): Promise<ApiMatch[]> {
  // Try Football-Data.org first (current season, no daily cap)
  if (isFdoConfigured()) {
    try {
      const fdo = await fdoGetRecentMatches(competitionCode, 10);
      if (fdo && fdo.length > 0) return fdo;
    } catch { /* fall through to API-Football */ }
  }
  try {
    const leagueId = LEAGUE_API_IDS[competitionCode];
    if (!leagueId) return [];
    const data = await apiFetch(`/fixtures?league=${leagueId}&season=${SEASON}&status=FT`, 3600);
    const matches = (data.response || []).map(adaptFixture);
    return matches.slice(-10);
  } catch {
    return [];
  }
}

export async function getLeagueScorers(competitionCode: string, limit = 15): Promise<ApiScorer[]> {
  // Try Football-Data.org first (no daily cap) → fall back to API-Football
  if (isFdoConfigured()) {
    try {
      const fdo = await fdoGetScorers(competitionCode, limit);
      if (fdo && fdo.length > 0) return fdo;
    } catch { /* fall through to API-Football */ }
  }
  try {
    const leagueId = LEAGUE_API_IDS[competitionCode];
    if (!leagueId) return [];
    const data = await apiFetch(`/players/topscorers?league=${leagueId}&season=${SEASON}`, 3600);
    return (data.response || []).map(adaptScorer).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getMatchDetail(matchId: number): Promise<ApiMatch | null> {
  try {
    const data = await apiFetch(`/fixtures?id=${matchId}`, 120);
    const fixture = data.response?.[0];
    return fixture ? adaptFixture(fixture) : null;
  } catch {
    return null;
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayMatches(): Promise<ApiMatch[]> {
  // Try Football-Data.org first (no daily cap) → fall back to API-Football
  if (isFdoConfigured()) {
    try {
      const fdo = await fdoGetTodayMatches();
      if (fdo && fdo.length > 0) return fdo;
    } catch { /* fall through to API-Football */ }
  }
  try {
    const data = await apiFetch(`/fixtures?date=${todayStr()}`, 300);
    return (data.response || [])
      .filter((f: any) => TOP5_IDS.has(f.league?.id))
      .map(adaptFixture);
  } catch {
    return [];
  }
}

export async function getScheduledMatches(): Promise<ApiMatch[]> {
  // Try Football-Data.org first (no daily cap)
  if (isFdoConfigured()) {
    try {
      const fdo = await fdoGetScheduledMatches();
      if (fdo && fdo.length > 0) return fdo;
    } catch { /* fall through to API-Football */ }
  }
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    const data = await apiFetch(`/fixtures?date=${dateStr}`, 600);
    return (data.response || [])
      .filter((f: any) => TOP5_IDS.has(f.league?.id))
      .map(adaptFixture)
      .slice(0, 20);
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
    const data = await apiFetch(`/teams?id=${teamId}`, 3600);
    const t = data.response?.[0];
    if (!t) return null;
    return {
      id: t.team.id,
      name: t.team.name,
      shortName: t.team.name,
      tla: t.team.code || '',
      crest: t.team.logo,
      address: t.venue?.address || '',
      website: '',
      founded: t.team.founded || 0,
      clubColors: '',
      venue: t.venue?.name || '',
      coach: null,
      squad: [],
      runningCompetitions: [],
    };
  } catch {
    return null;
  }
}

export async function getTeamMatches(teamId: number, status?: string): Promise<ApiMatch[]> {
  try {
    const statusQ = status ? `&status=${status}` : '';
    const data = await apiFetch(`/fixtures?team=${teamId}&season=${SEASON}${statusQ}`, 3600);
    return (data.response || []).map(adaptFixture);
  } catch {
    return [];
  }
}

export async function getMatchWithH2H(matchId: number): Promise<ApiMatchFull | null> {
  try {
    const data = await apiFetch(`/fixtures?id=${matchId}`, 120);
    const fixture = data.response?.[0];
    if (!fixture) return null;
    const match = adaptFixture(fixture) as ApiMatchFull;
    // Fetch H2H data
    try {
      const h2hData = await apiFetch(`/fixtures/headtohead?h2h=${fixture.teams.home.id}-${fixture.teams.away.id}&last=10`, 3600);
      const h2hFixtures = h2hData.response || [];
      let homeWins = 0, awayWins = 0, draws = 0, totalGoals = 0;
      for (const hf of h2hFixtures) {
        const hg = hf.goals?.home || 0;
        const ag = hf.goals?.away || 0;
        totalGoals += hg + ag;
        if (hf.teams.home.id === fixture.teams.home.id) {
          if (hf.teams.home.winner) homeWins++;
          else if (hf.teams.away.winner) awayWins++;
          else draws++;
        } else {
          if (hf.teams.home.winner) awayWins++;
          else if (hf.teams.away.winner) homeWins++;
          else draws++;
        }
      }
      match.head2head = {
        numberOfMatches: h2hFixtures.length,
        totalGoals,
        homeTeam: { id: fixture.teams.home.id, name: fixture.teams.home.name, wins: homeWins, draws, losses: awayWins },
        awayTeam: { id: fixture.teams.away.id, name: fixture.teams.away.name, wins: awayWins, draws, losses: homeWins },
      };
    } catch { /* H2H fetch failed — continue without it */ }
    return match;
  } catch {
    return null;
  }
}

export async function getCompetitionTeams(competitionCode: string): Promise<{ id: number; name: string; shortName: string; crest: string; venue: string; coach: { name: string } | null }[]> {
  try {
    const leagueId = LEAGUE_API_IDS[competitionCode];
    if (!leagueId) return [];
    const data = await apiFetch(`/teams?league=${leagueId}&season=${SEASON}`, 3600);
    return (data.response || []).map((t: any) => ({
      id: t.team.id,
      name: t.team.name,
      shortName: t.team.name,
      crest: t.team.logo,
      venue: t.venue?.name || '',
      coach: null,
    }));
  } catch {
    return [];
  }
}

export async function getAllLeagueStandings(): Promise<Record<string, ApiStanding[]>> {
  const codes = Object.keys(LEAGUE_META);
  const map: Record<string, ApiStanding[]> = {};
  // Fetch sequentially to respect FDO rate limits (10 req/min)
  for (const code of codes) {
    map[code] = await getLeagueStandings(code);
  }
  return map;
}

export async function getAllLeagueScorers(): Promise<Record<string, ApiScorer[]>> {
  const codes = Object.keys(LEAGUE_META);
  const map: Record<string, ApiScorer[]> = {};
  // Fetch sequentially to respect FDO rate limits (10 req/min)
  for (const code of codes) {
    map[code] = await getLeagueScorers(code, 20);
  }
  return map;
}

export async function getFinishedMatches(): Promise<ApiMatch[]> {
  try {
    const data = await apiFetch(`/fixtures?date=${todayStr()}`, 300);
    return (data.response || [])
      .filter((f: any) => TOP5_IDS.has(f.league?.id) && f.fixture?.status?.short === 'FT')
      .map(adaptFixture);
  } catch {
    return [];
  }
}
