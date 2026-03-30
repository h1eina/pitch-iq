// Central data index - re-exports everything
export {
  allTeams, allPlayers, allMatches, allStandings,
  getTeamsByLeague, getPlayersByTeam, getPlayersByLeague,
  getMatchesByLeague, getMatchesByTeam, getStandings,
  getTeamById, getPlayerById, getMatchById,
  getTopScorers, getTopAssisters,
  getRecentMatches, getLiveMatches, getUpcomingMatches,
} from './generator';

export { leagues } from './leagues-data';
export { tournaments, triviaQuestions, polls } from './static-data';
