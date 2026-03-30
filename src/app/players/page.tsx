import { getLeagueScorers, LEAGUE_CODES, LEAGUE_META, type ApiScorer } from '@/lib/football-api';
import { Users, Target, Award, Trophy } from 'lucide-react';
import Link from 'next/link';

export default async function PlayersPage() {
  const codes = Object.entries(LEAGUE_CODES);
  const allScorers = await Promise.all(
    codes.map(([slug, code]) => getLeagueScorers(code, 20).then(scorers => scorers.map(s => ({ ...s, leagueCode: code, leagueSlug: slug }))))
  );
  const combined = allScorers.flat().sort((a, b) => b.goals - a.goals);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="text-emerald-400" size={24} /> Player Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Top performers across all 5 European leagues &mdash; real-time data from football-data.org
        </p>
      </div>

      {/* Combined Golden Boot Race */}
      <section className="card overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
          <Award className="text-yellow-400" size={20} />
          <h2 className="section-title">European Golden Boot Race</h2>
        </div>
        {combined.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                  <th className="text-left p-3 w-10">#</th>
                  <th className="text-left p-3">Player</th>
                  <th className="text-left p-3">Team</th>
                  <th className="text-left p-3">League</th>
                  <th className="p-3 text-center">Apps</th>
                  <th className="p-3 text-center">Goals</th>
                  <th className="p-3 text-center">Assists</th>
                  <th className="p-3 text-center">G+A</th>
                  <th className="p-3 text-center">Pens</th>
                </tr>
              </thead>
              <tbody>
                {combined.slice(0, 30).map((s, i) => {
                  const meta = LEAGUE_META[s.leagueCode];
                  return (
                    <tr key={`${s.player.id}-${s.leagueCode}`} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition ${
                      i < 3 ? 'bg-yellow-500/[0.05]' : ''
                    }`}>
                      <td className="p-3">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-500/20 text-slate-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-400'
                        }`}>{i + 1}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-200">{s.player.name}</p>
                        <p className="text-xs text-slate-400">{s.player.nationality}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {s.team.crest && <img src={s.team.crest} alt="" className="crest-img" />}
                          <span className="text-sm text-slate-300">{s.team.shortName}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Link href={`/leagues/${s.leagueSlug}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-orange-400 transition">
                          <span>{meta?.logo}</span> {meta?.name}
                        </Link>
                      </td>
                      <td className="p-3 text-center text-slate-400">{s.playedMatches}</td>
                      <td className="p-3 text-center font-black text-white text-lg">{s.goals}</td>
                      <td className="p-3 text-center text-slate-300">{s.assists ?? 0}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{s.goals + (s.assists ?? 0)}</td>
                      <td className="p-3 text-center text-slate-400">{s.penalties ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <p className="font-medium">No player data available</p>
            <p className="text-xs mt-1">Set FOOTBALL_DATA_API_KEY in .env.local to see real player stats</p>
          </div>
        )}
      </section>

      {/* Per-League Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {codes.map(([slug, code]) => {
          const meta = LEAGUE_META[code];
          const leagueScorers = allScorers.find(arr => arr[0]?.leagueCode === code) || [];
          return (
            <section key={code} className="card overflow-hidden">
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.logo}</span>
                  <h3 className="font-bold text-slate-200">{meta.name}</h3>
                </div>
                <Link href={`/leagues/${slug}`} className="text-xs text-orange-400 font-semibold hover:text-orange-300 transition">Full table →</Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {leagueScorers.slice(0, 5).map((s, i) => (
                  <div key={s.player.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-slate-400'
                    }`}>{i + 1}</span>
                    {s.team.crest && <img src={s.team.crest} alt="" className="w-5 h-5 object-contain" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{s.player.name}</p>
                      <p className="text-xs text-slate-400">{s.team.shortName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">{s.goals}</p>
                      <p className="text-[10px] text-slate-400">{s.assists ?? 0} ast</p>
                    </div>
                  </div>
                ))}
                {leagueScorers.length === 0 && <div className="p-4 text-center text-sm text-slate-400">No data</div>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
