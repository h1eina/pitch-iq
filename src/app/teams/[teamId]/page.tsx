import { getTeamById, allTeams, getPlayersByTeam } from '@/data/generator';
import { notFound } from 'next/navigation';
import TeamProfileClient from './client';

export function generateStaticParams() {
  return allTeams.map(t => ({ teamId: t.id }));
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = getTeamById(teamId);
  if (!team) notFound();
  const players = getPlayersByTeam(teamId);
  return <TeamProfileClient team={team} players={players} />;
}
