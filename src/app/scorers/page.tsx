import { getLeagueScorers, LEAGUE_CODES, LEAGUE_META, type ApiScorer } from '@/lib/football-api';
import { Target, Trophy } from 'lucide-react';
import Link from 'next/link';

export default async function ScorersPage() {
  const codes = Object.entries(LEAGUE_CODES);
  const results = await Promise.all(
    codes.map(([slug, code]) => getLeagueScorers(code, 10).then(scorers => ({ slug, code, scorers })))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Target className="text-orange-400" size={24} /> Top Scorers
        </h1>
        <p className="text-sm text-slate-400 mt-1">Goal scoring leaders across all top 5 European leagues — real-time data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map(({ slug, code, scorers }) => {
          const meta = LEAGUE_META[code];
          return (
            <section key={code} className="card overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta.logo}</span>
                  <h2 className="font-bold text-slate-200">{meta.name}</h2>
                </div>
                <Link href={`/leagues/${slug}`} className="text-xs text-orange-400 font-semibold hover:text-orange-300 transition">View League →</Link>
              </div>
              {scorers.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {scorers.map((s, i) => (
                    <div key={s.player.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400'
                      }`}>{i + 1}</span>
                      {s.team.crest && <img src={s.team.crest} alt="" className="w-5 h-5 object-contain" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{s.player.name}</p>
                        <p className="text-xs text-slate-400">{s.team.shortName} &middot; {s.playedMatches} apps</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">{s.goals}</p>
                        <p className="text-[10px] text-slate-400">{s.assists || 0} ast</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">No data available</div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
