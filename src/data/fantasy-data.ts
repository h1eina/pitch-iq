// ============================================================================
// Fantasy Football Data Generator
// Maps the existing generator.ts players to FPL-style FantasyPlayer objects
// ============================================================================

import type { FantasyPlayer, FantasyPosition, FantasyGameweek, PlayerAvailability } from '@/lib/types';
import type { Player } from '@/lib/types';
import { allPlayers, allTeams } from './generator';

// Seeded random for deterministic fantasy data
let fSeed = 777;
function fRand(): number { fSeed = (fSeed * 16807 + 0) % 2147483647; return (fSeed - 1) / 2147483646; }
function fRandInt(min: number, max: number): number { return Math.floor(fRand() * (max - min + 1)) + min; }
function fRandFloat(min: number, max: number, d = 1): number { return parseFloat((fRand() * (max - min) + min).toFixed(d)); }

function mapPosition(pos: string): FantasyPosition {
  if (pos === 'GK') return 'GKP';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'].includes(pos)) return 'MID';
  return 'FWD'; // CF, ST
}

function calculatePrice(player: Player): number {
  const { seasonStats: s, attributes: a } = player;
  let base = 4.5;
  const pos = mapPosition(player.position);
  // Goals/assists boost
  base += s.goals * 0.15 + s.assists * 0.1;
  // Key technical attributes
  const avgAttr = (a.passing + a.dribbling + a.finishing + a.technique + a.composure) / 5;
  base += (avgAttr / 20) * 3;
  // Position premium
  if (pos === 'MID') base += 0.5;
  if (pos === 'FWD') base += 1;
  if (pos === 'GKP') base -= 1.5;
  // Clamp between 4.0 and 13.5
  base += fRandFloat(-0.3, 0.3);
  return Math.round(Math.max(4.0, Math.min(13.5, base)) * 10) / 10;
}

function calculatePoints(player: Player, pos: FantasyPosition): number {
  const { seasonStats: s } = player;
  let pts = 0;
  // Appearance points (2 pts per start, 1 for sub)
  pts += s.appearances * 2;
  // Goals: GKP/DEF=6, MID=5, FWD=4
  const goalPts = pos === 'GKP' || pos === 'DEF' ? 6 : pos === 'MID' ? 5 : 4;
  pts += s.goals * goalPts;
  // Assists: 3pts each
  pts += s.assists * 3;
  // Clean sheets: GKP/DEF=4, MID=1
  if (pos === 'GKP' || pos === 'DEF') pts += s.cleanSheets * 4;
  else if (pos === 'MID') pts += s.cleanSheets;
  // Saves (GK only)
  if (pos === 'GKP') pts += Math.floor(s.savePercentage);
  // Yellow/Red cards
  pts -= s.yellowCards;
  pts -= s.redCards * 3;
  // Bonus
  pts += fRandInt(0, 15);
  return Math.max(0, pts);
}

const opponents = ['ARS', 'AVL', 'BHA', 'BOU', 'BRE', 'CHE', 'CRY', 'EVE', 'FUL', 'IPS',
  'LEI', 'LIV', 'MCI', 'MUN', 'NEW', 'NFO', 'SOU', 'TOT', 'WHU', 'WOL',
  'BAR', 'RMA', 'ATM', 'JUV', 'INT', 'MIL', 'BAY', 'BVB', 'PSG', 'LYO'];

const availabilities: PlayerAvailability[] = ['available', 'available', 'available', 'available',
  'available', 'available', 'available', 'available', 'doubtful', 'injured'];

const newsOptions = ['', '', '', '', '', 'Minor knock - 75% chance of playing',
  'Hamstring concern', 'Rested - rotation expected', 'Fully fit and available',
  'Suspended for next match'];

export function generateFantasyPlayers(): FantasyPlayer[] {
  fSeed = 777; // reset for determinism
  return allPlayers.map((p): FantasyPlayer => {
    const pos = mapPosition(p.position);
    const price = calculatePrice(p);
    const totalPoints = calculatePoints(p, pos);
    const gamesPlayed = Math.max(1, p.seasonStats.appearances);
    const ppg = Math.round((totalPoints / gamesPlayed) * 10) / 10;
    const form = fRandFloat(2, 10);
    const influence = fRandFloat(10, 80);
    const creativity = fRandFloat(5, 70);
    const threat = fRandFloat(5, 90);
    const avail = availabilities[fRandInt(0, availabilities.length - 1)];

    return {
      id: p.id,
      name: p.name,
      team: p.team,
      teamId: p.teamId,
      position: pos,
      price,
      totalPoints,
      gameweekPoints: fRandInt(0, 15),
      form,
      selectedBy: fRandFloat(0.1, 45),
      minutesPlayed: p.seasonStats.minutesPlayed,
      goals: p.seasonStats.goals,
      assists: p.seasonStats.assists,
      cleanSheets: p.seasonStats.cleanSheets,
      goalsConceded: fRandInt(5, 40),
      saves: Math.round(p.seasonStats.savePercentage * 2),
      bonusPoints: fRandInt(0, 20),
      yellowCards: p.seasonStats.yellowCards,
      redCards: p.seasonStats.redCards,
      ictIndex: Math.round((influence + creativity + threat) / 3 * 10) / 10,
      influence,
      creativity,
      threat,
      expectedGoals: fRandFloat(0.5, 18),
      expectedAssists: fRandFloat(0.2, 12),
      pointsPerGame: ppg,
      priceChange: fRandFloat(-0.5, 0.8),
      availability: avail,
      news: avail !== 'available' ? newsOptions[fRandInt(5, 9)] : '',
      nextFixtureDifficulty: fRandInt(1, 5),
      nextOpponent: opponents[fRandInt(0, opponents.length - 1)],
      overallRating: Math.round((p.attributes.passing + p.attributes.dribbling + p.attributes.finishing + p.attributes.composure + p.attributes.technique) / 5 * 5),
    };
  });
}

export function generateGameweeks(): FantasyGameweek[] {
  fSeed = 555;
  return Array.from({ length: 38 }, (_, i) => {
    const gw = i + 1;
    const completed = gw < 29;
    const current = gw === 29;
    const deadlineDate = new Date(2025, 7, 16 + (gw - 1) * 7);
    return {
      id: gw,
      name: `Gameweek ${gw}`,
      deadline: deadlineDate.toISOString(),
      isActive: current,
      isCompleted: completed,
      isCurrent: current,
      highestScore: completed ? fRandInt(80, 140) : 0,
      averageScore: completed ? fRandInt(40, 65) : 0,
      transfersMade: completed ? fRandInt(500000, 3000000) : 0,
      topPlayer: completed ? 'Top Performer' : '',
      topPlayerPoints: completed ? fRandInt(15, 25) : 0,
      chipPlays: {
        wildcard: completed ? fRandInt(50000, 200000) : 0,
        benchBoost: completed ? fRandInt(30000, 150000) : 0,
        tripleCaptain: completed ? fRandInt(20000, 100000) : 0,
        freeHit: completed ? fRandInt(10000, 80000) : 0,
      },
    };
  });
}

// Pre-generated singletons
export const fantasyPlayers = generateFantasyPlayers();
export const gameweeks = generateGameweeks();

// Utility functions
export function getFantasyPlayerById(id: string): FantasyPlayer | undefined {
  return fantasyPlayers.find(p => p.id === id);
}

export function getFantasyPlayersByPosition(pos: FantasyPosition): FantasyPlayer[] {
  return fantasyPlayers.filter(p => p.position === pos);
}

export function getFantasyPlayersByTeam(teamId: string): FantasyPlayer[] {
  return fantasyPlayers.filter(p => p.teamId === teamId);
}

export function getTopFantasyPlayers(limit = 20): FantasyPlayer[] {
  return [...fantasyPlayers].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit);
}

export function getDreamTeam(): FantasyPlayer[] {
  const byPos = (pos: FantasyPosition, n: number) =>
    getFantasyPlayersByPosition(pos).sort((a, b) => b.gameweekPoints - a.gameweekPoints).slice(0, n);
  return [...byPos('GKP', 1), ...byPos('DEF', 4), ...byPos('MID', 4), ...byPos('FWD', 2)];
}
