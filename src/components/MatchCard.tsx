'use client';
import Link from 'next/link';
import { Match } from '@/lib/types';

function StatusBadge({ status, minute }: { status: Match['status']; minute?: number }) {
  if (status === 'live') return (
    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 rounded-full">
      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      <span className="text-xs font-bold text-red-400">{minute}&apos;</span>
    </span>
  );
  if (status === 'halftime') return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">HT</span>;
  if (status === 'finished') return <span className="px-2 py-0.5 bg-gray-600/40 text-gray-400 text-xs font-bold rounded-full">FT</span>;
  if (status === 'scheduled') return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">15:00</span>;
  return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs font-bold rounded-full">PPD</span>;
}

export default function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live' || match.status === 'halftime';
  return (
    <Link href={`/match/${match.id}`}
      className={`block p-4 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-lg ${
        isLive ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-red-500/30 shadow-red-500/10 shadow-md' 
               : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium">{match.league}</span>
        <StatusBadge status={match.status} minute={match.minute} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-semibold text-white">{match.homeTeam.shortName}</span>
            <span className="text-xl">{match.homeTeam.logo}</span>
          </div>
        </div>
        <div className="px-4 text-center min-w-[70px]">
          {match.homeScore !== null ? (
            <span className={`text-2xl font-black ${isLive ? 'text-white' : 'text-gray-200'}`}>
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-lg font-bold text-gray-500">vs</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{match.awayTeam.logo}</span>
            <span className="text-sm font-semibold text-white">{match.awayTeam.shortName}</span>
          </div>
        </div>
      </div>
      {match.events.filter(e => e.type === 'goal').length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="flex justify-between text-xs text-gray-400">
            <div className="space-y-0.5">
              {match.events.filter(e => e.type === 'goal' && e.team === 'home').map((e, i) => (
                <div key={i}>⚽ {e.player} {e.minute}&apos;</div>
              ))}
            </div>
            <div className="space-y-0.5 text-right">
              {match.events.filter(e => e.type === 'goal' && e.team === 'away').map((e, i) => (
                <div key={i}>{e.minute}&apos; {e.player} ⚽</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
