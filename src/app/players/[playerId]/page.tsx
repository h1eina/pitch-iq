import { getPlayerById, allPlayers, getPlayersByTeam } from '@/data/generator';
import { notFound } from 'next/navigation';
import PlayerProfileClient from './client';

export function generateStaticParams() {
  return allPlayers.slice(0, 200).map(p => ({ playerId: p.id }));
}

export default async function PlayerPage({ params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  const player = getPlayerById(playerId);
  if (!player) notFound();
  const teammates = getPlayersByTeam(player.teamId).filter(t => t.id !== player.id).slice(0, 8);
  return <PlayerProfileClient player={player} teammates={teammates} />;
}
