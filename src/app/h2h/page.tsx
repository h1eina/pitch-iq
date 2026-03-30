import { getCompetitionTeams, LEAGUE_META } from '@/lib/football-api';
import { ArrowLeftRight } from 'lucide-react';
import { H2HClient } from './client';

export const revalidate = 3600;

export default async function H2HPage() {
  const leagueCodes = Object.keys(LEAGUE_META);
  const allTeamsArrays = await Promise.all(
    leagueCodes.map(code => getCompetitionTeams(code).then(teams => teams.map(t => ({ ...t, leagueCode: code }))))
  );
  const allTeams = allTeamsArrays.flat().sort((a, b) => a.name.localeCompare(b.name));

  const teamsData = allTeams.map(t => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    crest: t.crest,
    leagueCode: t.leagueCode,
    leagueName: LEAGUE_META[t.leagueCode]?.name || t.leagueCode,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ArrowLeftRight className="text-cyan-400" size={24} /> Head-to-Head Comparison
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Select two teams from Europe&apos;s top 5 leagues to compare their seasons
        </p>
      </div>
      <H2HClient teams={teamsData} />
    </div>
  );
}
