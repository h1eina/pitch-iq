// ============================================================================
// PitchIQ Data Generator - Real Player Data + FM-depth attributes
// Uses real squad data from Football-Data.org, enriched with generated stats
// ============================================================================

import type {
  Player, PlayerAttributes, PlayerSeasonStats, PlayerCareerStats, PlayerPosition,
  Team, TeamPlayingStyle, TeamSeasonStats, FormResult, Standing, Match,
  MatchEvent, MatchStats, MatchLineups, LineupPlayer, Transfer, InjuryReport,
  AdvancedMatchStats, Commentary,
} from '@/lib/types';
import { allTeamDefs, type TeamDef } from './team-definitions';
import realSquadsData from './real-squads.json';

// --- Real Squad Data Integration ---
interface RealPlayer { id: number; name: string; position: string; dateOfBirth: string; nationality: string; }
interface RealTeamData { id: number; name: string; shortName: string; tla: string; squad: RealPlayer[]; }

// Maps our internal team IDs to FDO TLA codes for squad lookup
const teamIdToTla: Record<string, string> = {
  // Premier League
  'arsenal': 'ARS', 'aston-villa': 'AVL', 'chelsea': 'CHE', 'everton': 'EVE',
  'fulham': 'FUL', 'liverpool': 'LIV', 'man-city': 'MCI', 'man-utd': 'MUN',
  'newcastle': 'NEW', 'tottenham': 'TOT', 'wolves': 'WOL', 'nottm-forest': 'NOT',
  'crystal-palace': 'CRY', 'brighton': 'BHA', 'brentford': 'BRE', 'west-ham': 'WHU',
  'bournemouth': 'BOU',
  // La Liga
  'real-madrid': 'RMA', 'barcelona': 'FCB', 'atletico-madrid': 'ATL',
  'real-sociedad': 'RSO', 'real-betis': 'BET', 'villarreal': 'VIL',
  'athletic-bilbao': 'ATH', 'sevilla': 'SEV', 'girona': 'GIR',
  'celta-vigo': 'CEL', 'mallorca': 'MAL', 'osasuna': 'OSA', 'getafe': 'GET',
  'rayo-vallecano': 'RAY', 'espanyol': 'ESP', 'alaves': 'ALA', 'valencia': 'VAL',
  // Serie A
  'inter-milan': 'INT', 'ac-milan': 'MIL', 'juventus': 'JUV', 'napoli': 'NAP',
  'atalanta': 'ATA', 'lazio': 'LAZ', 'roma': 'ROM', 'fiorentina': 'FIO',
  'torino': 'TOR', 'bologna': 'BOL', 'udinese': 'UDI', 'genoa': 'GEN',
  'cagliari': 'CAG', 'parma': 'PAR', 'como': 'COM', 'verona': 'HVE', 'lecce': 'USL',
  // Bundesliga
  'bayern-munich': 'FCB', 'bayer-leverkusen': 'B04', 'borussia-dortmund': 'BVB',
  'rb-leipzig': 'RBL', 'eintracht-frankfurt': 'SGE', 'vfb-stuttgart': 'VFB',
  'sc-freiburg': 'SCF', 'wolfsburg': 'WOB', 'werder-bremen': 'SVW',
  'hoffenheim': 'TSG', 'mainz': 'M05', 'borussia-monchengladbach': 'BMG',
  'augsburg': 'FCA', 'union-berlin': 'UNB', 'heidenheim': 'HEI', 'st-pauli': 'STP',
  // Ligue 1
  'psg': 'PSG', 'marseille': 'MAR', 'monaco': 'ASM', 'lille': 'LIL',
  'lyon': 'LYO', 'nice': 'NIC', 'lens': 'RCL', 'rennes': 'REN',
  'strasbourg': 'RC', 'toulouse': 'TOU', 'angers': 'ANG', 'auxerre': 'AJA',
  'le-havre': 'HAC', 'nantes': 'NAN', 'brest': 'BRE',
};

// Build league-scoped lookup (handles FCB = Barcelona in La Liga, Bayern in Bundesliga; BRE = Brentford in PL, Brest in Ligue 1)
const realSquadsByLeagueAndTla: Record<string, Record<string, RealPlayer[]>> = {};
(['premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1'] as const).forEach(league => {
  realSquadsByLeagueAndTla[league] = {};
  const teams = ((realSquadsData as unknown) as Record<string, RealTeamData[]>)[league] ?? [];
  teams.forEach(t => { realSquadsByLeagueAndTla[league][t.tla] = t.squad ?? []; });
});

function getRealSquad(teamId: string, leagueId: string): RealPlayer[] {
  const tla = teamIdToTla[teamId];
  if (!tla) return [];
  return realSquadsByLeagueAndTla[leagueId]?.[tla] ?? [];
}

// Map FDO position strings to our internal position types
function mapFdoPosition(fdoPos: string): PlayerPosition {
  switch (fdoPos) {
    case 'Goalkeeper': return 'GK';
    case 'Centre-Back': return 'CB';
    case 'Left-Back': return 'LB';
    case 'Right-Back': return 'RB';
    case 'Defensive Midfield': return 'CDM';
    case 'Central Midfield': return 'CM';
    case 'Attacking Midfield': return 'CAM';
    case 'Left Midfield': return 'LM';
    case 'Right Midfield': return 'RM';
    case 'Left Winger': return 'LW';
    case 'Right Winger': return 'RW';
    case 'Centre-Forward': return 'ST';
    // FDO generic categories
    case 'Defence': return pick(['CB', 'CB', 'LB', 'RB'] as PlayerPosition[]);
    case 'Midfield': return pick(['CM', 'CM', 'CDM', 'CAM'] as PlayerPosition[]);
    case 'Offence': return pick(['ST', 'LW', 'RW', 'CF'] as PlayerPosition[]);
    default: return pick(positionDistribution);
  }
}

function calcAgeFromDob(dob: string): number {
  const birth = new Date(dob);
  const now = new Date('2026-03-15');
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
}


// --- Seeded Random for deterministic data ---
let seed = 42;
function seededRandom(): number {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randInt(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((seededRandom() * (max - min) + min).toFixed(decimals));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom() * arr.length)];
}

// --- Fallback name pools (only used when real data unavailable) ---
const nationalities = [
  'England', 'France', 'Spain', 'Germany', 'Italy', 'Brazil', 'Argentina', 'Portugal',
  'Netherlands', 'Belgium', 'Croatia', 'Uruguay', 'Colombia', 'Nigeria', 'Senegal',
  'Ghana', 'Morocco', 'Cameroon', 'Ivory Coast', 'Japan', 'South Korea', 'USA',
  'Canada', 'Mexico', 'Denmark', 'Sweden', 'Norway', 'Switzerland', 'Austria', 'Poland',
  'Czech Republic', 'Serbia', 'Scotland', 'Wales', 'Ireland', 'Algeria', 'Tunisia',
  'Egypt', 'Mali', 'Guinea', 'DR Congo', 'Australia', 'Turkey', 'Greece', 'Hungary',
];

const fallbackFirstNames = ['James', 'Lucas', 'Mohamed', 'David', 'Ivan', 'Victor', 'Kevin', 'Sander', 'Omar', 'Christian', 'Patrick', 'Alexander', 'Daniel', 'Simon', 'Sebastian', 'Martin', 'Thomas', 'Michael', 'Robert', 'Jan'];
const fallbackLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'García', 'Miller', 'Davis', 'Martínez', 'López', 'González', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'White', 'Harris', 'Clark'];

// --- Position & Attribute Generation ---
const positions: PlayerPosition[] = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'];
const positionDistribution: PlayerPosition[] = [
  'GK', 'GK', 'GK',
  'CB', 'CB', 'CB', 'CB', 'CB',
  'LB', 'LB', 'RB', 'RB',
  'CDM', 'CDM', 'CM', 'CM', 'CM',
  'CAM', 'CAM',
  'LW', 'RW', 'LM', 'RM',
  'ST', 'ST', 'CF',
];

function genAttributes(pos: PlayerPosition, tier: number): PlayerAttributes {
  const base = tier;
  const adj = (min: number, max: number) => randInt(Math.max(1, min - base * 2), Math.min(20, max - base));
  const isGK = pos === 'GK';
  const isDef = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos);
  const isMid = ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos);
  const isAtt = ['LW', 'RW', 'CF', 'ST'].includes(pos);

  return {
    crossing: isAtt || pos === 'LB' || pos === 'RB' ? adj(10, 18) : adj(5, 14),
    dribbling: isAtt || pos === 'CAM' ? adj(12, 19) : adj(5, 14),
    finishing: isAtt ? adj(12, 19) : isMid ? adj(6, 15) : adj(2, 10),
    firstTouch: adj(10, 18),
    freeKicks: adj(3, 16),
    heading: isDef || pos === 'ST' ? adj(10, 18) : adj(4, 13),
    longShots: isMid || isAtt ? adj(8, 17) : adj(3, 12),
    longThrows: adj(2, 14),
    marking: isDef || pos === 'CDM' ? adj(12, 19) : adj(3, 12),
    passing: isMid || pos === 'CAM' ? adj(12, 19) : adj(6, 15),
    penaltyTaking: adj(4, 17),
    tackling: isDef || pos === 'CDM' ? adj(12, 19) : adj(3, 13),
    technique: adj(9, 18),
    corners: adj(3, 16),
    aggression: adj(6, 17),
    anticipation: adj(10, 18),
    bravery: adj(8, 18),
    composure: adj(9, 18),
    concentration: adj(9, 18),
    creativity: isMid || isAtt ? adj(10, 18) : adj(4, 13),
    decisions: adj(10, 18),
    determination: adj(10, 19),
    flair: isAtt || pos === 'CAM' ? adj(10, 19) : adj(4, 14),
    leadership: adj(4, 17),
    offTheBall: isAtt ? adj(12, 19) : adj(5, 15),
    positioning: isDef ? adj(12, 19) : adj(6, 15),
    teamwork: adj(10, 18),
    vision: isMid || pos === 'CAM' ? adj(11, 19) : adj(5, 14),
    workRate: adj(10, 18),
    acceleration: isAtt ? adj(12, 19) : adj(8, 17),
    agility: isAtt || isMid ? adj(10, 18) : adj(7, 16),
    balance: adj(8, 17),
    jumpingReach: isDef || pos === 'GK' ? adj(11, 18) : adj(6, 16),
    naturalFitness: adj(10, 19),
    pace: isAtt ? adj(12, 19) : adj(7, 17),
    stamina: adj(10, 18),
    strength: isDef || pos === 'ST' ? adj(10, 18) : adj(6, 16),
    ...(isGK ? {
      aerialReach: adj(10, 19), commandOfArea: adj(10, 18), communication: adj(10, 18),
      eccentricity: adj(3, 15), handling: adj(12, 19), kicking: adj(8, 17),
      oneOnOnes: adj(10, 18), reflexes: adj(12, 19), rushingOut: adj(8, 17), throwing: adj(8, 17),
    } : {}),
    overallRating: 0, potentialRating: 0,
  };
}

function calcOverall(attrs: PlayerAttributes, pos: PlayerPosition): number {
  const vals = Object.values(attrs).filter(v => typeof v === 'number' && v > 0 && v <= 20);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(55 + (avg / 20) * 35);
}

const referees = ['Michael Oliver', 'Anthony Taylor', 'Simon Hooper', 'David Coote', 'Paul Tierney',
  'Andy Madley', 'Rob Jones', 'Chris Kavanagh', 'Alejandro Hernández', 'Jesús Gil Manzano',
  'Carlos del Cerro Grande', 'José Sánchez', 'Daniele Orsato', 'Marco Guida', 'Davide Massa',
  'Daniel Siebert', 'Felix Zwayer', 'Deniz Aytekin', 'Clément Turpin', 'François Letexier',
  'Benoît Bastien', 'Slavko Vinčić', 'Istvan Kovacs', 'Szymon Marciniak', 'Danny Makkelie'];

const injuries = ['Hamstring strain', 'Knee ligament', 'Ankle sprain', 'Calf strain', 'Thigh muscle',
  'Groin injury', 'Back spasm', 'Concussion', 'ACL tear', 'Meniscus injury', 'Shoulder dislocation',
  'Fractured metatarsal', 'Quad strain', 'Hip flexor', 'Achilles tendon'];

// --- Generate a single player (REAL DATA + generated attributes) ---
function generatePlayer(teamDef: TeamDef, idx: number, tier: number, realSquad: RealPlayer[]): Player {
  const realPlayer = realSquad[idx] ?? null;

  // Use real data when available, fallback to procedural generation
  let playerName: string;
  let firstName: string;
  let lastName: string;
  let nat: string;
  let pos: PlayerPosition;
  let age: number;
  let dob: string;

  if (realPlayer) {
    playerName = realPlayer.name;
    const nameParts = realPlayer.name.split(' ');
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ') || nameParts[0];
    nat = realPlayer.nationality || 'Unknown';
    pos = mapFdoPosition(realPlayer.position || '');
    if (realPlayer.dateOfBirth) {
      age = calcAgeFromDob(realPlayer.dateOfBirth);
      dob = realPlayer.dateOfBirth;
    } else {
      age = pos === 'GK' ? randInt(20, 36) : randInt(17, 35);
      dob = `${2026 - age}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
    }
  } else {
    // Fallback: procedurally generated player
    firstName = pick(fallbackFirstNames);
    lastName = pick(fallbackLastNames);
    playerName = `${firstName} ${lastName}`;
    nat = pick(nationalities);
    pos = positionDistribution[idx % positionDistribution.length];
    age = pos === 'GK' ? randInt(20, 36) : randInt(17, 35);
    dob = `${2026 - age}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`;
  }

  const attrs = genAttributes(pos, tier);
  const overall = calcOverall(attrs, pos);
  attrs.overallRating = overall;
  attrs.potentialRating = Math.min(99, overall + randInt(0, age < 23 ? 12 : 4));

  const apps = randInt(5, 30);
  const isAttacker = ['LW', 'RW', 'CF', 'ST', 'CAM'].includes(pos);
  const isMid = ['CDM', 'CM', 'LM', 'RM'].includes(pos);
  const goals = pos === 'GK' ? 0 : isAttacker ? randInt(2, 20) : isMid ? randInt(0, 8) : randInt(0, 3);
  const assists = pos === 'GK' ? randInt(0, 1) : isAttacker ? randInt(1, 12) : isMid ? randInt(1, 10) : randInt(0, 4);

  return {
    id: realPlayer ? `${teamDef.id}-r${realPlayer.id}` : `${teamDef.id}-p${idx}`,
    name: playerName,
    firstName, lastName,
    team: teamDef.name, teamId: teamDef.id, teamLogo: teamDef.logo, leagueId: teamDef.leagueId,
    position: pos,
    secondaryPositions: [pick(positions.filter(p => p !== pos))],
    nationality: nat,
    age, dateOfBirth: dob,
    height: pos === 'GK' ? randInt(183, 198) : randInt(168, 195),
    weight: randInt(65, 92),
    preferredFoot: seededRandom() > 0.75 ? 'left' : seededRandom() > 0.95 ? 'both' : 'right',
    shirtNumber: idx + 1,
    contractUntil: `${randInt(2026, 2030)}-06-30`,
    marketValue: `€${randInt(1, 120)}M`,
    wage: `€${randInt(10, 400)}K/week`,
    attributes: attrs,
    seasonStats: {
      appearances: apps, starts: randInt(Math.max(0, apps - 8), apps), minutesPlayed: apps * randInt(45, 90),
      goals, assists,
      expectedGoals: randFloat(goals * 0.6, goals * 1.4),
      expectedAssists: randFloat(assists * 0.5, assists * 1.3),
      shotsTotal: goals * randInt(3, 8), shotsOnTarget: goals * randInt(1, 4),
      shotsPerGame: randFloat(0.5, 4.5), conversionRate: randFloat(5, 30),
      bigChancesCreated: randInt(0, 15), bigChancesMissed: randInt(0, 10),
      keyPasses: randInt(5, 60), passesCompleted: randInt(200, 1800),
      passAccuracy: randFloat(72, 94), progressivePasses: randInt(10, 120),
      progressiveCarries: randInt(5, 80), throughBalls: randInt(0, 25),
      crossesCompleted: randInt(2, 50), dribbleAttempts: randInt(5, 120),
      dribbleSuccess: randFloat(40, 80),
      tackles: randInt(10, 80), tackleSuccess: randFloat(50, 85),
      interceptions: randInt(5, 60), clearances: randInt(2, 100),
      blocks: randInt(1, 30), aerialDuelsWon: randInt(5, 80),
      aerialDuelsTotal: randInt(10, 120), groundDuelsWon: randInt(20, 150),
      groundDuelsTotal: randInt(40, 250),
      foulsCommitted: randInt(5, 40), foulsWon: randInt(5, 50),
      yellowCards: randInt(0, 10), redCards: randInt(0, 2),
      penaltiesScored: randInt(0, 5), penaltiesMissed: randInt(0, 2),
      cleanSheets: pos === 'GK' ? randInt(2, 14) : 0,
      savePercentage: pos === 'GK' ? randFloat(60, 82) : 0,
      goalsConceded: pos === 'GK' ? randInt(10, 45) : 0,
      xGPrevented: pos === 'GK' ? randFloat(-3, 8) : 0,
      touches: randInt(300, 2500),
      averageRating: randFloat(6.2, 8.2),
      manOfTheMatch: randInt(0, 6),
      minutesPerGoal: goals > 0 ? Math.round((apps * 75) / goals) : 0,
      minutesPerAssist: assists > 0 ? Math.round((apps * 75) / assists) : 0,
      goalsPerGame: goals / Math.max(1, apps),
      heatmapZones: Array.from({ length: 18 }, () => randInt(0, 100)),
    },
    careerStats: {
      totalAppearances: randInt(50, 500), totalGoals: randInt(0, 200),
      totalAssists: randInt(0, 120),
      trophies: seededRandom() > 0.6 ? [pick(['League Title', 'Cup Winner', 'Champions League', 'Europa League', 'Super Cup'])] : [],
      previousClubs: Array.from({ length: randInt(0, 3) }, () => ({
        team: pick(allTeamDefs).name, season: `${randInt(2018, 2024)}/${randInt(19, 25)}`,
        apps: randInt(15, 100), goals: randInt(0, 40), assists: randInt(0, 25),
      })),
      internationalCaps: randInt(0, 80), internationalGoals: randInt(0, 30),
    },
    injuryHistory: seededRandom() > 0.5 ? [{
      injury: pick(injuries), date: `2025-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      duration: `${randInt(1, 12)} weeks`, matchesMissed: randInt(1, 20),
    }] : [],
    recentForm: Array.from({ length: 5 }, () => randFloat(5.5, 9.5)),
  };
}

// --- Generate Match ---
function generateMatch(home: TeamDef, away: TeamDef, matchday: number, leagueId: string, matchIdx: number): Match {
  const homeGoals = randInt(0, 5);
  const awayGoals = randInt(0, 4);
  const isFinished = matchday <= 28;
  const events: MatchEvent[] = [];
  let evtId = 0;

  for (let g = 0; g < homeGoals; g++) {
    events.push({ id: `evt-${matchIdx}-${evtId++}`, minute: randInt(1, 90), type: seededRandom() > 0.9 ? 'penalty-goal' : 'goal', team: 'home', player: `${home.shortName} Player`, xG: randFloat(0.05, 0.85) });
  }
  for (let g = 0; g < awayGoals; g++) {
    events.push({ id: `evt-${matchIdx}-${evtId++}`, minute: randInt(1, 90), type: seededRandom() > 0.9 ? 'penalty-goal' : 'goal', team: 'away', player: `${away.shortName} Player`, xG: randFloat(0.05, 0.85) });
  }
  for (let c = 0; c < randInt(1, 6); c++) {
    events.push({ id: `evt-${matchIdx}-${evtId++}`, minute: randInt(15, 90), type: seededRandom() > 0.92 ? 'red' : 'yellow', team: seededRandom() > 0.5 ? 'home' : 'away', player: `Player ${randInt(1, 11)}` });
  }
  for (let s = 0; s < randInt(3, 6); s++) {
    events.push({ id: `evt-${matchIdx}-${evtId++}`, minute: randInt(46, 88), type: 'substitution', team: seededRandom() > 0.5 ? 'home' : 'away', player: `Player ${randInt(12, 23)}`, secondPlayer: `Player ${randInt(1, 11)}` });
  }
  events.sort((a, b) => a.minute - b.minute);

  const homePoss = randInt(35, 65);
  const stats: MatchStats = {
    possession: [homePoss, 100 - homePoss],
    shots: [randInt(5, 22), randInt(3, 20)], shotsOnTarget: [randInt(1, 10), randInt(1, 9)],
    shotsOffTarget: [randInt(2, 10), randInt(1, 9)], blockedShots: [randInt(0, 5), randInt(0, 5)],
    corners: [randInt(2, 12), randInt(1, 10)], fouls: [randInt(6, 18), randInt(5, 17)],
    offsides: [randInt(0, 5), randInt(0, 5)], passes: [randInt(250, 650), randInt(200, 600)],
    passAccuracy: [randFloat(72, 92), randFloat(68, 91)], xG: [randFloat(0.5, 3.8), randFloat(0.3, 3.2)],
    bigChances: [randInt(1, 6), randInt(0, 5)], tackles: [randInt(10, 30), randInt(8, 28)],
    interceptions: [randInt(5, 18), randInt(4, 16)], saves: [randInt(1, 8), randInt(1, 9)],
    clearances: [randInt(8, 30), randInt(6, 28)], yellowCards: [randInt(0, 4), randInt(0, 4)],
    redCards: [randInt(0, 1), randInt(0, 1)], aerialDuels: [randInt(8, 25), randInt(6, 22)],
    dribbles: [randInt(5, 18), randInt(4, 16)], throwIns: [randInt(10, 30), randInt(8, 28)],
    goalKicks: [randInt(3, 12), randInt(3, 12)], longBalls: [randInt(20, 65), randInt(18, 60)],
    crosses: [randInt(8, 28), randInt(6, 25)],
  };

  const emptyStats: MatchStats = { possession: [50, 50], shots: [0, 0], shotsOnTarget: [0, 0], shotsOffTarget: [0, 0], blockedShots: [0, 0], corners: [0, 0], fouls: [0, 0], offsides: [0, 0], passes: [0, 0], passAccuracy: [0, 0], xG: [0, 0], bigChances: [0, 0], tackles: [0, 0], interceptions: [0, 0], saves: [0, 0], clearances: [0, 0], yellowCards: [0, 0], redCards: [0, 0], aerialDuels: [0, 0], dribbles: [0, 0], throwIns: [0, 0], goalKicks: [0, 0], longBalls: [0, 0], crosses: [0, 0] };

  return {
    id: `match-${matchIdx}`, league: home.league, leagueId, matchday,
    homeTeam: { id: home.id, name: home.name, shortName: home.shortName, logo: home.logo, formation: home.formation, manager: home.manager },
    awayTeam: { id: away.id, name: away.name, shortName: away.shortName, logo: away.logo, formation: away.formation, manager: away.manager },
    homeScore: isFinished ? homeGoals : null, awayScore: isFinished ? awayGoals : null,
    halfTimeScore: isFinished ? [Math.min(homeGoals, randInt(0, homeGoals)), Math.min(awayGoals, randInt(0, awayGoals))] : undefined,
    status: isFinished ? 'finished' : matchday === 29 ? 'live' : 'scheduled',
    minute: matchday === 29 ? randInt(1, 90) : undefined,
    date: `2026-${String(Math.min(12, 8 + Math.floor(matchday / 5))).padStart(2, '0')}-${String(Math.min(28, (matchday * 3) % 28 + 1)).padStart(2, '0')}`,
    kickoff: pick(['12:30', '15:00', '17:30', '20:00', '20:45', '21:00']),
    venue: home.stadium,
    attendance: isFinished ? randInt(Math.floor(home.capacity * 0.7), home.capacity) : undefined,
    referee: pick(referees),
    weather: pick(['Sunny', 'Cloudy', 'Light Rain', 'Overcast', 'Clear', 'Heavy Rain', 'Windy']),
    events: isFinished ? events : [],
    stats: isFinished ? stats : emptyStats,
    momentum: isFinished ? Array.from({ length: 18 }, () => randInt(-80, 80)) : undefined,
  };
}

// --- Generate Standings from matches ---
function generateStandings(teams: TeamDef[], matches: Match[]): Standing[] {
  const table: Record<string, { w: number; d: number; l: number; gf: number; ga: number; xgf: number; xga: number; cs: number; fts: number; hw: number; hd: number; hl: number; aw: number; ad: number; al: number }> = {};
  teams.forEach(t => { table[t.id] = { w: 0, d: 0, l: 0, gf: 0, ga: 0, xgf: 0, xga: 0, cs: 0, fts: 0, hw: 0, hd: 0, hl: 0, aw: 0, ad: 0, al: 0 }; });

  matches.filter(m => m.status === 'finished').forEach(m => {
    const hid = m.homeTeam.id, aid = m.awayTeam.id;
    const hg = m.homeScore ?? 0, ag = m.awayScore ?? 0;
    if (!table[hid] || !table[aid]) return;
    table[hid].gf += hg; table[hid].ga += ag;
    table[aid].gf += ag; table[aid].ga += hg;
    table[hid].xgf += m.stats.xG[0]; table[hid].xga += m.stats.xG[1];
    table[aid].xgf += m.stats.xG[1]; table[aid].xga += m.stats.xG[0];
    if (ag === 0) table[hid].cs++; if (hg === 0) table[aid].cs++;
    if (hg === 0) table[hid].fts++; if (ag === 0) table[aid].fts++;
    if (hg > ag) { table[hid].w++; table[aid].l++; table[hid].hw++; table[aid].al++; }
    else if (hg < ag) { table[aid].w++; table[hid].l++; table[aid].aw++; table[hid].hl++; }
    else { table[hid].d++; table[aid].d++; table[hid].hd++; table[aid].ad++; }
  });

  const standings: Standing[] = teams.map(t => {
    const s = table[t.id];
    const played = s.w + s.d + s.l;
    const pts = s.w * 3 + s.d;
    const formArr: FormResult[] = Array.from({ length: 5 }, () => pick(['W', 'W', 'W', 'D', 'L'] as FormResult[]));
    return {
      position: 0,
      team: { id: t.id, name: t.name, shortName: t.shortName, logo: t.logo },
      played, won: s.w, drawn: s.d, lost: s.l,
      goalsFor: s.gf, goalsAgainst: s.ga, goalDifference: s.gf - s.ga,
      points: pts, form: formArr,
      xGFor: parseFloat(s.xgf.toFixed(1)), xGAgainst: parseFloat(s.xga.toFixed(1)),
      xGDifference: parseFloat((s.xgf - s.xga).toFixed(1)),
      cleanSheets: s.cs, failedToScore: s.fts,
      avgGoalsScored: played > 0 ? parseFloat((s.gf / played).toFixed(2)) : 0,
      avgGoalsConceded: played > 0 ? parseFloat((s.ga / played).toFixed(2)) : 0,
      homeRecord: `${s.hw}W ${s.hd}D ${s.hl}L`,
      awayRecord: `${s.aw}W ${s.ad}D ${s.al}L`,
      ppg: played > 0 ? parseFloat((pts / played).toFixed(2)) : 0,
      last5Points: formArr.reduce((acc, f) => acc + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0),
    };
  });

  standings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
  standings.forEach((s, i) => { s.position = i + 1; });
  return standings;
}

// --- Build Team Object ---
function buildTeam(def: TeamDef, players: Player[], matches: Match[]): Team {
  const teamMatches = matches.filter(m => m.status === 'finished' && (m.homeTeam.id === def.id || m.awayTeam.id === def.id));
  const w = teamMatches.filter(m => (m.homeTeam.id === def.id && (m.homeScore ?? 0) > (m.awayScore ?? 0)) || (m.awayTeam.id === def.id && (m.awayScore ?? 0) > (m.homeScore ?? 0))).length;
  const d = teamMatches.filter(m => m.homeScore === m.awayScore).length;
  const l = teamMatches.length - w - d;
  const gf = teamMatches.reduce((a, m) => a + (m.homeTeam.id === def.id ? (m.homeScore ?? 0) : (m.awayScore ?? 0)), 0);
  const ga = teamMatches.reduce((a, m) => a + (m.homeTeam.id === def.id ? (m.awayScore ?? 0) : (m.homeScore ?? 0)), 0);

  const style: TeamPlayingStyle = {
    possession: randInt(8, 18), pressing: randInt(6, 18), passingDirectness: randInt(5, 17),
    tempoSpeed: randInt(8, 18), defensiveLine: pick(['deep', 'standard', 'high', 'very-high']),
    width: pick(['narrow', 'standard', 'wide']), creativity: randInt(8, 18),
    discipline: randInt(10, 18), setpieces: randInt(8, 17), counterAttack: randInt(6, 18),
  };
  const recentForm: FormResult[] = Array.from({ length: 5 }, () => pick(['W', 'W', 'D', 'L'] as FormResult[]));

  const transfers: Transfer[] = Array.from({ length: randInt(2, 6) }, (_, i) => ({
    id: `tr-${def.id}-${i}`, player: `Transfer Player ${i + 1}`, playerAge: randInt(19, 32),
    playerPosition: pick(positions), playerNationality: pick(nationalities),
    fromTeam: i < 3 ? pick(allTeamDefs.filter(t => t.id !== def.id)).name : def.name,
    fromTeamLogo: '⚽', toTeam: i < 3 ? def.name : pick(allTeamDefs.filter(t => t.id !== def.id)).name,
    toTeamLogo: def.logo, fee: `€${randInt(2, 80)}M`, feeNumeric: randInt(2000000, 80000000),
    transferType: pick(['permanent', 'loan', 'loan-with-option', 'free']),
    date: `2025-${String(randInt(6, 8)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    status: pick(['completed', 'completed', 'completed', 'rumour', 'negotiating']),
    contractLength: `${randInt(2, 5)} years`, wages: `€${randInt(20, 300)}K/week`,
    leagueId: def.leagueId, season: '2025/26',
  }));

  const injuryReports: InjuryReport[] = Array.from({ length: randInt(1, 4) }, (_, i) => ({
    player: players[randInt(0, Math.min(players.length - 1, 24))]?.name ?? `Player ${i}`,
    playerId: players[randInt(0, Math.min(players.length - 1, 24))]?.id ?? `${def.id}-p${i}`,
    injury: pick(injuries), severity: pick(['minor', 'moderate', 'serious', 'long-term']),
    expectedReturn: `2026-${String(randInt(1, 6)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    dateInjured: `2025-${String(randInt(8, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
    status: pick(['out', 'doubtful', 'recovering', 'returned']),
    matchesMissed: randInt(1, 15),
  }));

  const avgAge = players.length > 0 ? parseFloat((players.reduce((a, p) => a + p.age, 0) / players.length).toFixed(1)) : 25;

  return {
    id: def.id, name: def.name, shortName: def.shortName, logo: def.logo,
    league: def.league, leagueId: def.leagueId, stadium: def.stadium, capacity: def.capacity,
    manager: def.manager, managerNationality: def.managerNationality,
    founded: def.founded, city: def.city, country: def.country, colors: def.colors,
    formation: def.formation, marketValue: def.marketValue, budget: def.budget,
    wagesBudget: def.wagesBudget, owner: def.owner, socialFollowers: def.socialFollowers,
    style, recentForm, transfers, injuries: injuryReports,
    seasonStats: {
      played: teamMatches.length, won: w, drawn: d, lost: l, goalsFor: gf, goalsAgainst: ga,
      cleanSheets: randInt(2, 14), xGFor: randFloat(20, 65), xGAgainst: randFloat(15, 55),
      possessionAvg: randFloat(42, 68), passAccuracyAvg: randFloat(74, 92),
      shotsPerGame: randFloat(8, 18), tacklesPerGame: randFloat(12, 24),
      interceptionsPerGame: randFloat(6, 16), aerialDuelsWonPct: randFloat(40, 65),
      corners: randInt(80, 200), offsides: randInt(20, 60), foulsCommitted: randInt(150, 350),
      yellowCards: randInt(30, 80), redCards: randInt(0, 5),
      bigChancesCreated: randInt(30, 80), bigChancesMissed: randInt(15, 45),
      progressivePassesPerGame: randFloat(30, 70), progressiveCarriesPerGame: randFloat(15, 40),
      ppda: randFloat(6, 14), highPressSuccessRate: randFloat(25, 45),
      crossesPerGame: randFloat(12, 28), dribbleSuccessRate: randFloat(45, 70),
      averageAge: avgAge,
      minutesPerGoal: gf > 0 ? parseFloat(((teamMatches.length * 90) / gf).toFixed(0)) : 0,
      penaltiesScored: randInt(1, 8), penaltiesConceded: randInt(0, 5),
      homeWins: randInt(5, 14), homeDraws: randInt(1, 6), homeLosses: randInt(0, 5),
      awayWins: randInt(3, 10), awayDraws: randInt(1, 6), awayLosses: randInt(1, 8),
    },
  };
}

// ============================
// MAIN GENERATION LOOP
// ============================

const leagueGroups: Record<string, TeamDef[]> = {};
allTeamDefs.forEach(t => {
  if (!leagueGroups[t.leagueId]) leagueGroups[t.leagueId] = [];
  leagueGroups[t.leagueId].push(t);
});

export const allPlayers: Player[] = [];
export const allTeams: Team[] = [];
export const allMatches: Match[] = [];
export const allStandings: Standing[] = [];

let matchCounter = 0;

// For each league, generate round-robin matches, then players & teams
Object.entries(leagueGroups).forEach(([leagueId, teams]) => {
  const leagueMatches: Match[] = [];
  const tier = leagueId === 'premier-league' ? 1 : leagueId === 'la-liga' ? 1 : leagueId === 'bundesliga' ? 2 : leagueId === 'serie-a' ? 2 : 3;

  // Round-robin: each team plays every other team once (single round for performance)
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const matchday = Math.floor(matchCounter / (teams.length / 2)) + 1;
      const m = generateMatch(teams[i], teams[j], Math.min(matchday, 34), leagueId, matchCounter++);
      leagueMatches.push(m);
    }
  }
  allMatches.push(...leagueMatches);

  // Generate standings for this league
  const leagueStandings = generateStandings(teams, leagueMatches);
  allStandings.push(...leagueStandings);

  // Generate players and teams
  teams.forEach(def => {
    const realSquad: RealPlayer[] = getRealSquad(def.id, leagueId);
    const squadSize = Math.max(25, realSquad.length);
    const teamPlayers: Player[] = [];

    for (let p = 0; p < squadSize; p++) {
      const player = generatePlayer(def, p, tier, realSquad);
      teamPlayers.push(player);
    }
    allPlayers.push(...teamPlayers);

    const team = buildTeam(def, teamPlayers, leagueMatches);
    allTeams.push(team);
  });
});

// ============================
// EXPORT HELPERS
// ============================

export function getTeamsByLeague(leagueId: string): Team[] {
  return allTeams.filter(t => t.leagueId === leagueId);
}
export function getPlayersByTeam(teamId: string): Player[] {
  return allPlayers.filter(p => p.teamId === teamId);
}
export function getPlayersByLeague(leagueId: string): Player[] {
  return allPlayers.filter(p => p.leagueId === leagueId);
}
export function getMatchesByLeague(leagueId: string): Match[] {
  return allMatches.filter(m => m.leagueId === leagueId);
}
export function getMatchesByTeam(teamId: string): Match[] {
  return allMatches.filter(m => m.homeTeam.id === teamId || m.awayTeam.id === teamId);
}
export function getStandings(leagueId: string): Standing[] {
  return allStandings.filter(s => {
    const team = allTeams.find(t => t.id === s.team.id);
    return team?.leagueId === leagueId;
  });
}
export function getTeamById(id: string): Team | undefined {
  return allTeams.find(t => t.id === id);
}
export function getPlayerById(id: string): Player | undefined {
  return allPlayers.find(p => p.id === id);
}
export function getMatchById(id: string): Match | undefined {
  return allMatches.find(m => m.id === id);
}
export function getTopScorers(leagueId?: string, limit = 20): Player[] {
  const pool = leagueId ? getPlayersByLeague(leagueId) : allPlayers;
  return [...pool].sort((a, b) => b.seasonStats.goals - a.seasonStats.goals).slice(0, limit);
}
export function getTopAssisters(leagueId?: string, limit = 20): Player[] {
  const pool = leagueId ? getPlayersByLeague(leagueId) : allPlayers;
  return [...pool].sort((a, b) => b.seasonStats.assists - a.seasonStats.assists).slice(0, limit);
}
export function getRecentMatches(limit = 10): Match[] {
  return allMatches.filter(m => m.status === 'finished').slice(-limit);
}
export function getLiveMatches(): Match[] {
  return allMatches.filter(m => m.status === 'live');
}
export function getUpcomingMatches(limit = 10): Match[] {
  return allMatches.filter(m => m.status === 'scheduled').slice(0, limit);
}
