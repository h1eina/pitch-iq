import Link from 'next/link';
import { getMatchWithH2H, LEAGUE_META, type ApiMatchFull } from '@/lib/football-api';
import { ArrowLeft, Clock, Activity, Shield, BarChart3, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await getMatchWithH2H(Number(matchId));

  if (!match) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white">Match not found</h1>
        <p className="text-sm text-slate-400 mt-2">This match may not be available via the API.</p>
        <Link href="/matches" className="text-orange-400 mt-4 inline-block font-semibold">&larr; Back to Matches</Link>
      </div>
    );
  }

  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const meta = LEAGUE_META[match.competition?.code];
  const h2h = match.head2head;

  const homeGoals = match.score.fullTime.home ?? 0;
  const awayGoals = match.score.fullTime.away ?? 0;
  const totalGoals = homeGoals + awayGoals;
  const htHome = match.score.halfTime.home ?? 0;
  const htAway = match.score.halfTime.away ?? 0;
  const secondHalfHome = homeGoals - htHome;
  const secondHalfAway = awayGoals - htAway;

  const goalsDiff = Math.abs(homeGoals - awayGoals);
  const isBlowout = goalsDiff >= 3;
  const isClose = goalsDiff <= 1;
  const isDraw = homeGoals === awayGoals;
  const btts = homeGoals > 0 && awayGoals > 0;
  const overTwo = totalGoals > 2;
  const matchIntensity = totalGoals >= 4 ? 'High' : totalGoals >= 2 ? 'Medium' : 'Low';
  const comingFromBehind = (htHome > htAway && homeGoals < awayGoals) || (htAway > htHome && awayGoals < homeGoals);
  const secondHalfSurge = (secondHalfHome + secondHalfAway) > (htHome + htAway);
  const matchRating = Math.min(10, totalGoals * 1.2 + (comingFromBehind ? 2 : 0) + (isClose ? 1.5 : 0) + (btts ? 1 : 0)).toFixed(1);




  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link href="/matches" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm transition">
        <ArrowLeft size={16} /> Back to Matches
      </Link>

      {/* Score Header */}
      <div className={`card p-8 text-center ${isLive ? 'ring-2 ring-red-500/50' : ''}`}>
        <div className="flex items-center justify-center gap-3 mb-4">
          {match.competition?.emblem && <img src={match.competition.emblem} alt="" className="w-6 h-6 object-contain" />}
          <span className="text-sm font-semibold text-slate-400">{meta?.name || match.competition?.name}</span>
          <span className="text-sm text-slate-400">&middot; Matchday {match.matchday}</span>
        </div>
        {isLive && (
          <div className="flex justify-center mb-4">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-full">
              <span className="live-dot" /><span className="text-sm font-bold text-red-400">LIVE</span>
            </span>
          </div>
        )}
        {isFinished && (
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1 bg-white/5 text-slate-400 text-sm font-bold rounded-full border border-white/[0.06]">FULL TIME</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-8 my-6">
          <div className="text-center flex-1">
            {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="w-16 h-16 mx-auto object-contain mb-2" />}
            <p className="text-lg font-bold text-slate-200">{match.homeTeam.name}</p>
          </div>
          <div className="px-6">
            {match.score.fullTime.home !== null ? (
              <p className="text-5xl font-black text-white">{match.score.fullTime.home} - {match.score.fullTime.away}</p>
            ) : (
              <p className="text-3xl font-bold text-slate-400">vs</p>
            )}
            {match.score.halfTime.home !== null && (
              <p className="text-xs text-slate-400 mt-2">HT: {match.score.halfTime.home} - {match.score.halfTime.away}</p>
            )}
          </div>
          <div className="text-center flex-1">
            {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="w-16 h-16 mx-auto object-contain mb-2" />}
            <p className="text-lg font-bold text-slate-200">{match.awayTeam.name}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={12} /> {format(new Date(match.utcDate), 'EEEE, MMM d yyyy · HH:mm')}</span>
        </div>
        {match.referees?.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            <Shield size={10} className="inline mr-1" />Referee: {match.referees[0].name} ({match.referees[0].nationality})
          </p>
        )}
      </div>

      {/* Match Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card p-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Total Goals</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{totalGoals}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Result</p>
          <p className="text-sm font-bold text-slate-200 mt-1">{isDraw ? '🤝 Draw' : homeGoals > awayGoals ? '🏠 Home Win' : '✈️ Away Win'}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold">1st Half</p>
          <p className="text-lg font-black text-slate-300 mt-1">{htHome} - {htAway}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold">2nd Half</p>
          <p className="text-lg font-black text-slate-300 mt-1">{secondHalfHome} - {secondHalfAway}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold">BTTS</p>
          <p className={`text-lg font-black mt-1 ${btts ? 'text-emerald-400' : 'text-red-400'}`}>{btts ? 'Yes ✓' : 'No ✗'}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Match Rating</p>
          <p className={`text-2xl font-black mt-1 ${Number(matchRating) >= 7 ? 'text-emerald-400' : Number(matchRating) >= 5 ? 'text-yellow-400' : 'text-slate-400'}`}>{matchRating}</p>
        </div>
      </div>

      {/* Match Insights */}
      <div className="card p-5">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-violet-400" /> Match Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Intensity</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${matchIntensity === 'High' ? 'bg-red-500/15 text-red-400' : matchIntensity === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-slate-500/15 text-slate-400'}`}>{matchIntensity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Over 2.5 Goals</span>
              <span className={`text-xs font-bold ${overTwo ? 'text-emerald-400' : 'text-slate-400'}`}>{overTwo ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Margin</span>
              <span className="text-xs font-bold text-slate-200">{isDraw ? 'Even' : isBlowout ? 'Blowout (+' + goalsDiff + ')' : isClose ? 'Narrow (+' + goalsDiff + ')' : '+' + goalsDiff}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Comeback</span>
              <span className={`text-xs font-bold ${comingFromBehind ? 'text-orange-400' : 'text-slate-400'}`}>{comingFromBehind ? '🔥 Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">2nd Half Surge</span>
              <span className={`text-xs font-bold ${secondHalfSurge ? 'text-cyan-400' : 'text-slate-400'}`}>{secondHalfSurge ? '⚡ Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Goal Spread</span>
              <div className="flex gap-1">
                <div className="stat-bar w-16"><div className="stat-bar-fill bg-emerald-400" style={{ width: `${totalGoals > 0 ? Math.round((homeGoals / totalGoals) * 100) : 50}%` }} /></div>
                <span className="text-[10px] text-slate-400">{totalGoals > 0 ? Math.round((homeGoals / totalGoals) * 100) : 50}% H</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Flow */}
      {match.score.fullTime.home !== null && (
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Activity size={18} className="text-emerald-400" /> Score Flow
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 w-16">1st Half</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 stat-bar"><div className="stat-bar-fill bg-emerald-400" style={{ width: `${totalGoals > 0 ? Math.round((htHome / totalGoals) * 100) : 50}%` }} /></div>
                <span className="text-sm font-black text-slate-300 w-8 text-center">{htHome}</span>
                <span className="text-xs text-slate-400">-</span>
                <span className="text-sm font-black text-slate-300 w-8 text-center">{htAway}</span>
                <div className="flex-1 stat-bar"><div className="stat-bar-fill bg-orange-400" style={{ width: `${totalGoals > 0 ? Math.round((htAway / totalGoals) * 100) : 50}%` }} /></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 w-16">2nd Half</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 stat-bar"><div className="stat-bar-fill bg-emerald-400" style={{ width: `${totalGoals > 0 ? Math.round((secondHalfHome / totalGoals) * 100) : 50}%` }} /></div>
                <span className="text-sm font-black text-slate-300 w-8 text-center">{secondHalfHome}</span>
                <span className="text-xs text-slate-400">-</span>
                <span className="text-sm font-black text-slate-300 w-8 text-center">{secondHalfAway}</span>
                <div className="flex-1 stat-bar"><div className="stat-bar-fill bg-orange-400" style={{ width: `${totalGoals > 0 ? Math.round((secondHalfAway / totalGoals) * 100) : 50}%` }} /></div>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-white/[0.06]">
              <span className="text-xs font-bold text-slate-400 w-16">Full Time</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 stat-bar"><div className="stat-bar-fill bg-emerald-500" style={{ width: `${totalGoals > 0 ? Math.round((homeGoals / totalGoals) * 100) : 50}%` }} /></div>
                <span className="text-lg font-black text-white w-8 text-center">{homeGoals}</span>
                <span className="text-sm text-slate-400">-</span>
                <span className="text-lg font-black text-white w-8 text-center">{awayGoals}</span>
                <div className="flex-1 stat-bar"><div className="stat-bar-fill bg-orange-500" style={{ width: `${totalGoals > 0 ? Math.round((awayGoals / totalGoals) * 100) : 50}%` }} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Head-to-Head */}
      {h2h && (
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Users size={18} className="text-violet-400" /> Head-to-Head Record
          </h2>
          <div className="grid grid-cols-3 text-center mb-4">
            <div>
              <p className="text-3xl font-black text-emerald-400">{h2h.homeTeam.wins}</p>
              <p className="text-xs text-slate-400">{h2h.homeTeam.name} wins</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-400">{h2h.homeTeam.draws}</p>
              <p className="text-xs text-slate-400">Draws</p>
            </div>
            <div>
              <p className="text-3xl font-black text-orange-400">{h2h.awayTeam.wins}</p>
              <p className="text-xs text-slate-400">{h2h.awayTeam.name} wins</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
            <span>{h2h.numberOfMatches} matches</span>
            <span>&middot;</span>
            <span>{h2h.totalGoals} total goals</span>
            <span>&middot;</span>
            <span>{(h2h.totalGoals / Math.max(h2h.numberOfMatches, 1)).toFixed(1)} goals/match avg</span>
          </div>
          <div className="mt-4 stat-bar h-3 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((h2h.homeTeam.wins / Math.max(h2h.numberOfMatches, 1)) * 100)}%` }} />
            <div className="bg-slate-600 h-full" style={{ width: `${Math.round((h2h.homeTeam.draws / Math.max(h2h.numberOfMatches, 1)) * 100)}%` }} />
            <div className="bg-orange-500 h-full" style={{ width: `${Math.round((h2h.awayTeam.wins / Math.max(h2h.numberOfMatches, 1)) * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="card p-6 text-center text-slate-400">
        <p className="text-sm">📊 Detailed match events, lineups, xG &amp; heatmaps require a paid API tier.</p>
        <p className="text-xs mt-1">Upgrade your football-data.org plan to unlock full match analytics.</p>
      </div>
    </div>
  );
}
