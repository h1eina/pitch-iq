// ============================================================================
// PitchIQ - Enterprise-Grade Football Intelligence Type System
// Modeled after Football Manager attribute depth + modern analytics platforms
// ============================================================================

// --- Core Entities ---

export interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  color: string;
  secondaryColor: string;
  season: string;
  totalTeams: number;
  relegationZone: number;
  championsLeagueSpots: number;
  europaLeagueSpots: number;
  conferenceLeagueSpots: number;
  currentMatchday: number;
  totalMatchdays: number;
  averageAttendance: number;
  tvRevenue: string;
  founded: number;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  league: string;
  leagueId: string;
  stadium: string;
  capacity: number;
  manager: string;
  managerNationality: string;
  founded: number;
  city: string;
  country: string;
  colors: string[];
  formation: string;
  marketValue: string;
  budget: string;
  wagesBudget: string;
  owner: string;
  website?: string;
  socialFollowers: number;
  style: TeamPlayingStyle;
  seasonStats: TeamSeasonStats;
  recentForm: FormResult[];
  transfers: Transfer[];
  injuries: InjuryReport[];
}

export interface TeamPlayingStyle {
  possession: number; // 1-20 FM-style
  pressing: number;
  passingDirectness: number;
  tempoSpeed: number;
  defensiveLine: 'deep' | 'standard' | 'high' | 'very-high';
  width: 'narrow' | 'standard' | 'wide';
  creativity: number;
  discipline: number;
  setpieces: number;
  counterAttack: number;
}

export interface TeamSeasonStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  xGFor: number;
  xGAgainst: number;
  possessionAvg: number;
  passAccuracyAvg: number;
  shotsPerGame: number;
  tacklesPerGame: number;
  interceptionsPerGame: number;
  aerialDuelsWonPct: number;
  corners: number;
  offsides: number;
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
  bigChancesCreated: number;
  bigChancesMissed: number;
  progressivePassesPerGame: number;
  progressiveCarriesPerGame: number;
  ppda: number; // passes per defensive action
  highPressSuccessRate: number;
  crossesPerGame: number;
  dribbleSuccessRate: number;
  averageAge: number;
  minutesPerGoal: number;
  penaltiesScored: number;
  penaltiesConceded: number;
  homeWins: number;
  homeDraws: number;
  homeLosses: number;
  awayWins: number;
  awayDraws: number;
  awayLosses: number;
}

export type FormResult = 'W' | 'D' | 'L';

// --- Player System (FM-level) ---

export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  team: string;
  teamId: string;
  teamLogo: string;
  leagueId: string;
  position: PlayerPosition;
  secondaryPositions: PlayerPosition[];
  nationality: string;
  secondNationality?: string;
  age: number;
  dateOfBirth: string;
  height: number; // cm
  weight: number; // kg
  preferredFoot: 'left' | 'right' | 'both';
  shirtNumber: number;
  contractUntil: string;
  marketValue: string;
  wage: string;
  image?: string;
  attributes: PlayerAttributes;
  seasonStats: PlayerSeasonStats;
  careerStats: PlayerCareerStats;
  scoutReport?: ScoutReport;
  injuryHistory: InjuryRecord[];
  recentForm: number[]; // last 5 match ratings
}

export type PlayerPosition = 'GK' | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'CF' | 'ST';

export interface PlayerAttributes {
  // Technical (FM-style 1-20)
  crossing: number;
  dribbling: number;
  finishing: number;
  firstTouch: number;
  freeKicks: number;
  heading: number;
  longShots: number;
  longThrows: number;
  marking: number;
  passing: number;
  penaltyTaking: number;
  tackling: number;
  technique: number;
  corners: number;
  // Mental
  aggression: number;
  anticipation: number;
  bravery: number;
  composure: number;
  concentration: number;
  creativity: number;
  decisions: number;
  determination: number;
  flair: number;
  leadership: number;
  offTheBall: number;
  positioning: number;
  teamwork: number;
  vision: number;
  workRate: number;
  // Physical
  acceleration: number;
  agility: number;
  balance: number;
  jumpingReach: number;
  naturalFitness: number;
  pace: number;
  stamina: number;
  strength: number;
  // Goalkeeper
  aerialReach?: number;
  commandOfArea?: number;
  communication?: number;
  eccentricity?: number;
  handling?: number;
  kicking?: number;
  oneOnOnes?: number;
  reflexes?: number;
  rushingOut?: number;
  throwing?: number;
  // Overall ratings
  overallRating: number;
  potentialRating: number;
}

export interface PlayerSeasonStats {
  appearances: number;
  starts: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  expectedGoals: number;
  expectedAssists: number;
  shotsTotal: number;
  shotsOnTarget: number;
  shotsPerGame: number;
  conversionRate: number;
  bigChancesCreated: number;
  bigChancesMissed: number;
  keyPasses: number;
  passesCompleted: number;
  passAccuracy: number;
  progressivePasses: number;
  progressiveCarries: number;
  throughBalls: number;
  crossesCompleted: number;
  dribbleAttempts: number;
  dribbleSuccess: number;
  tackles: number;
  tackleSuccess: number;
  interceptions: number;
  clearances: number;
  blocks: number;
  aerialDuelsWon: number;
  aerialDuelsTotal: number;
  groundDuelsWon: number;
  groundDuelsTotal: number;
  foulsCommitted: number;
  foulsWon: number;
  yellowCards: number;
  redCards: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  cleanSheets: number; // for GK
  savePercentage: number; // for GK
  goalsConceded: number; // for GK
  xGPrevented: number; // for GK
  touches: number;
  averageRating: number;
  manOfTheMatch: number;
  minutesPerGoal: number;
  minutesPerAssist: number;
  goalsPerGame: number;
  heatmapZones: number[]; // 18 zones on pitch
}

export interface PlayerCareerStats {
  totalAppearances: number;
  totalGoals: number;
  totalAssists: number;
  trophies: string[];
  previousClubs: { team: string; season: string; apps: number; goals: number; assists: number }[];
  internationalCaps: number;
  internationalGoals: number;
}

export interface ScoutReport {
  strengths: string[];
  weaknesses: string[];
  comparisonPlayer: string;
  recommendation: 'sign' | 'monitor' | 'avoid';
  valueForMoney: number; // 1-10
  overallAssessment: string;
  scoutedBy: string;
  dateScounted: string;
}

// --- Match System (Deep Analytics) ---

export interface Match {
  id: string;
  league: string;
  leagueId: string;
  matchday: number;
  homeTeam: MatchTeamInfo;
  awayTeam: MatchTeamInfo;
  homeScore: number | null;
  awayScore: number | null;
  halfTimeScore?: [number, number];
  status: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled' | 'extra-time' | 'penalties';
  minute?: number;
  addedTime?: number;
  date: string;
  kickoff: string;
  venue: string;
  attendance?: number;
  referee: string;
  weather?: string;
  events: MatchEvent[];
  stats: MatchStats;
  advancedStats?: AdvancedMatchStats;
  lineups?: MatchLineups;
  momentum?: number[]; // -100 to 100 per 5min interval
  commentary?: Commentary[];
}

export interface MatchTeamInfo {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  formation: string;
  manager: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  addedTime?: number;
  type: 'goal' | 'own-goal' | 'penalty-goal' | 'penalty-miss' | 'assist' | 'yellow' | 'second-yellow' | 'red' | 'substitution' | 'var' | 'injury' | 'offside';
  team: 'home' | 'away';
  player: string;
  secondPlayer?: string;
  detail?: string;
  xG?: number;
  shotType?: string;
  bodyPart?: string;
  situation?: string;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  shotsOffTarget: [number, number];
  blockedShots: [number, number];
  corners: [number, number];
  fouls: [number, number];
  offsides: [number, number];
  passes: [number, number];
  passAccuracy: [number, number];
  xG: [number, number];
  bigChances: [number, number];
  tackles: [number, number];
  interceptions: [number, number];
  saves: [number, number];
  clearances: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  aerialDuels: [number, number];
  dribbles: [number, number];
  throwIns: [number, number];
  goalKicks: [number, number];
  longBalls: [number, number];
  crosses: [number, number];
}

export interface AdvancedMatchStats {
  ppda: [number, number];
  highPress: [number, number];
  progressivePasses: [number, number];
  progressiveCarries: [number, number];
  finalThirdEntries: [number, number];
  penaltyAreaEntries: [number, number];
  throughBalls: [number, number];
  shotZones: { zone: string; home: number; away: number }[];
  passNetwork: { from: string; to: string; count: number; team: 'home' | 'away' }[];
  pressureEvents: { minute: number; team: 'home' | 'away'; x: number; y: number; success: boolean }[];
  xGTimeline: { minute: number; homeXG: number; awayXG: number }[];
  possessionPhases: { minute: number; home: number; away: number }[];
}

export interface MatchLineups {
  home: LineupPlayer[];
  away: LineupPlayer[];
  homeSubs: LineupPlayer[];
  awaySubs: LineupPlayer[];
}

export interface LineupPlayer {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  rating?: number;
  goals?: number;
  assists?: number;
  yellowCard?: boolean;
  redCard?: boolean;
  subbedIn?: number;
  subbedOut?: number;
  captain?: boolean;
}

export interface Commentary {
  minute: number;
  text: string;
  type: 'goal' | 'card' | 'sub' | 'chance' | 'info' | 'whistle';
}

// --- Standings ---

export interface Standing {
  position: number;
  team: { id: string; name: string; shortName: string; logo: string };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: FormResult[];
  xGFor: number;
  xGAgainst: number;
  xGDifference: number;
  cleanSheets: number;
  failedToScore: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  homeRecord: string;
  awayRecord: string;
  ppg: number; // points per game
  last5Points: number;
}

// --- Transfer System ---

export interface Transfer {
  id: string;
  player: string;
  playerAge: number;
  playerPosition: PlayerPosition;
  playerNationality: string;
  fromTeam: string;
  fromTeamLogo: string;
  toTeam: string;
  toTeamLogo: string;
  fee: string;
  feeNumeric: number;
  transferType: 'permanent' | 'loan' | 'loan-with-option' | 'free' | 'swap' | 'undisclosed';
  date: string;
  status: 'completed' | 'rumour' | 'negotiating' | 'medical' | 'official';
  contractLength: string;
  wages?: string;
  sellOnClause?: string;
  addOns?: string;
  leagueId: string;
  season: string;
}

// --- Injury System ---

export interface InjuryReport {
  player: string;
  playerId: string;
  injury: string;
  severity: 'minor' | 'moderate' | 'serious' | 'long-term';
  expectedReturn: string;
  dateInjured: string;
  status: 'out' | 'doubtful' | 'recovering' | 'returned';
  matchesMissed: number;
}

export interface InjuryRecord {
  injury: string;
  date: string;
  duration: string;
  matchesMissed: number;
}

// --- Trivia & Community ---

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  explanation: string;
  imageHint?: string;
  points: number;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  totalVotes: number;
  category: string;
  createdAt: string;
  expiresAt: string;
  featured: boolean;
}

// --- Tournament ---

export interface Tournament {
  id: string;
  name: string;
  logo: string;
  color: string;
  year: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  teams: number;
  hostCountry: string;
  startDate: string;
  endDate: string;
  champion?: string;
  topScorer?: string;
  description: string;
  groups?: TournamentGroup[];
}

export interface TournamentGroup {
  name: string;
  teams: { name: string; logo: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }[];
}

// --- Content Studio ---

export interface ContentCard {
  id: string;
  matchId: string;
  title: string;
  summary: string;
  talkingPoints: string[];
  stats: Record<string, string>;
  thumbnailIdea: string;
  hashtags: string[];
  script: string;
  estimatedLength: string;
  viralPotential: number; // 1-10
  contentType: 'highlights' | 'analysis' | 'debate' | 'prediction' | 'transfer-news';
}

// --- Analytics ---

export interface LeagueAnalytics {
  leagueId: string;
  topXGOverperformers: { team: string; diff: number }[];
  topXGUnderperformers: { team: string; diff: number }[];
  mostPossession: { team: string; pct: number }[];
  leastPossession: { team: string; pct: number }[];
  highestPPDA: { team: string; ppda: number }[];
  topProgressiveTeams: { team: string; progPasses: number }[];
  averageGoalsPerMatch: number;
  homeWinPct: number;
  awayWinPct: number;
  drawPct: number;
  cleanSheetPct: number;
  bttsPercentage: number;
  over25Percentage: number;
  averageCardsPerMatch: number;
}

// --- Head-to-Head ---

export interface HeadToHead {
  team1: string;
  team2: string;
  totalMatches: number;
  team1Wins: number;
  draws: number;
  team2Wins: number;
  team1Goals: number;
  team2Goals: number;
  recentMeetings: { date: string; score: string; competition: string }[];
}

// ============================================================================
// Fantasy Football System (FPL-Style)
// ============================================================================

export type FantasyPosition = 'GKP' | 'DEF' | 'MID' | 'FWD';
export type FantasyChip = 'none' | 'wildcard' | 'bench-boost' | 'triple-captain' | 'free-hit';
export type PlayerAvailability = 'available' | 'doubtful' | 'injured' | 'suspended' | 'unavailable';

export interface FantasyPlayer {
  id: string;
  name: string;
  team: string;
  teamId: string;
  position: FantasyPosition;
  price: number;
  totalPoints: number;
  gameweekPoints: number;
  form: number;
  selectedBy: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  saves: number;
  bonusPoints: number;
  yellowCards: number;
  redCards: number;
  ictIndex: number;
  influence: number;
  creativity: number;
  threat: number;
  expectedGoals: number;
  expectedAssists: number;
  pointsPerGame: number;
  priceChange: number;
  availability: PlayerAvailability;
  news: string;
  nextFixtureDifficulty: number;
  nextOpponent: string;
  overallRating: number;
}

export interface FantasySquadPlayer {
  playerId: string;
  position: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isBenched: boolean;
  purchasePrice: number;
  sellingPrice: number;
}

export interface FantasyTransfer {
  gameweek: number;
  playerIn: string;
  playerOut: string;
  priceIn: number;
  priceOut: number;
  date: string;
}

export interface FantasySquad {
  id: string;
  name: string;
  managerName: string;
  players: FantasySquadPlayer[];
  bank: number;
  totalValue: number;
  freeTransfers: number;
  wildcardsUsed: number;
  benchBoostUsed: boolean;
  tripleCaptainUsed: boolean;
  freeHitUsed: boolean;
  totalPoints: number;
  gameweekPoints: number;
  overallRank: number;
  gameweekRank: number;
  captainId: string;
  viceCaptainId: string;
  formation: string;
  chip: FantasyChip;
  transferHistory: FantasyTransfer[];
}

export interface FantasyGameweek {
  id: number;
  name: string;
  deadline: string;
  isActive: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  highestScore: number;
  averageScore: number;
  transfersMade: number;
  topPlayer: string;
  topPlayerPoints: number;
  chipPlays: { wildcard: number; benchBoost: number; tripleCaptain: number; freeHit: number };
}

export interface FantasyLeagueEntry {
  rank: number;
  previousRank: number;
  teamName: string;
  managerName: string;
  totalPoints: number;
  gameweekPoints: number;
}

export interface FantasyLeague {
  id: string;
  name: string;
  type: 'classic' | 'h2h';
  entries: FantasyLeagueEntry[];
  createdBy: string;
}

export interface MatchPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  confidence: number;
  predictedAt: string;
  actualHome?: number;
  actualAway?: number;
  pointsEarned?: number;
}

export interface PredictionRecord {
  totalPredictions: number;
  correctScorelines: number;
  correctOutcomes: number;
  totalPoints: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
}
