import { getTodayMatches, getScheduledMatches, LEAGUE_META, type ApiMatch } from '@/lib/football-api';
import { Tv, Calendar, Zap } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

function MatchRow({ match }: { match: ApiMatch }) {
  const home = match.score.fullTime.home;
  const away = match.score.fullTime.away;
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const meta = LEAGUE_META[match.competition?.code];
  return (
    <Link href={`/match/${match.id}`} className="card p-4 flex items-center gap-4 hover:border-orange-500/30 group">
      <div className="hidden sm:flex flex-col items-center w-20 shrink-0">
        {match.competition?.emblem && <img src={match.competition.emblem} alt="" className="crest-img mb-1" />}
        <span className="text-[10px] text-slate-400 text-center">{meta?.name}</span>
      </div>
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="crest-img" />}
          <span className="text-sm font-bold text-slate-200 truncate">{match.homeTeam.shortName || match.homeTeam.name}</span>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-center min-w-[56px] ${isLive ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/5 border border-white/[0.06]'}`}>
          {isLive && <div className="flex justify-center mb-0.5"><span className="live-dot" /></div>}
          <span className={`text-base font-black ${isLive ? 'text-red-400' : 'text-white'}`}>
            {home !== null ? home : '-'} : {away !== null ? away : '-'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-sm font-bold text-slate-200 truncate text-right">{match.awayTeam.shortName || match.awayTeam.name}</span>
          {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="crest-img" />}
        </div>
      </div>
      <div className="hidden sm:block w-24 text-right">
        {isFinished ? <span className="text-xs font-semibold text-slate-400">FT</span> :
         isLive ? <span className="text-xs font-bold text-red-400">LIVE</span> :
         <span className="text-xs text-slate-400">{format(new Date(match.utcDate), 'HH:mm')}</span>}
        <p className="text-[10px] text-slate-400 mt-0.5">MD {match.matchday}</p>
      </div>
    </Link>
  );
}

export default async function MatchesPage() {
  const [today, upcoming] = await Promise.all([getTodayMatches(), getScheduledMatches()]);
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Tv className="text-orange-400" size={24} /> Match Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">Live and upcoming matches across all top 5 European leagues</p>
      </div>
      <section>
        <h2 className="section-title flex items-center gap-2 mb-4"><Zap size={18} className="text-orange-400" /> Today</h2>
        {today.length > 0 ? (
          <div className="space-y-3">{today.map(m => <MatchRow key={m.id} match={m} />)}</div>
        ) : (
          <div className="card p-6 text-center text-slate-400">No top-5 league matches today</div>
        )}
      </section>
      {upcoming.length > 0 && (
        <section>
          <h2 className="section-title flex items-center gap-2 mb-4"><Calendar size={18} className="text-teal-400" /> Upcoming</h2>
          <div className="space-y-3">{upcoming.map(m => <MatchRow key={m.id} match={m} />)}</div>
        </section>
      )}
    </div>
  );
}
