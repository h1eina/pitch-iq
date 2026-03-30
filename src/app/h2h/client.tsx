'use client';
import { useState, useMemo } from 'react';
import { Search, Shield, TrendingUp, Target, Award, Swords } from 'lucide-react';

interface TeamInfo {
  id: number;
  name: string;
  shortName: string;
  crest: string;
  leagueCode: string;
  leagueName: string;
}

interface TeamStats {
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export function H2HClient({ teams }: { teams: TeamInfo[] }) {
  const [teamA, setTeamA] = useState<TeamInfo | null>(null);
  const [teamB, setTeamB] = useState<TeamInfo | null>(null);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [showDropA, setShowDropA] = useState(false);
  const [showDropB, setShowDropB] = useState(false);
  const [statsA, setStatsA] = useState<TeamStats | null>(null);
  const [statsB, setStatsB] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredA = useMemo(() => {
    if (!searchA) return teams.slice(0, 20);
    return teams.filter(t => t.name.toLowerCase().includes(searchA.toLowerCase())).slice(0, 15);
  }, [teams, searchA]);

  const filteredB = useMemo(() => {
    if (!searchB) return teams.slice(0, 20);
    return teams.filter(t => t.name.toLowerCase().includes(searchB.toLowerCase())).slice(0, 15);
  }, [teams, searchB]);

  const selectTeam = async (team: TeamInfo, side: 'A' | 'B') => {
    if (side === 'A') { setTeamA(team); setSearchA(''); setShowDropA(false); }
    else { setTeamB(team); setSearchB(''); setShowDropB(false); }
    setLoading(true);
    try {
      const res = await fetch(`https://api.football-data.org/v4/competitions/${team.leagueCode}/standings`, {
        headers: { 'X-Auth-Token': process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || '' }
      });
      if (res.ok) {
        const data = await res.json();
        const standing = data.standings?.[0]?.table?.find((s: any) => s.team.id === team.id);
        if (standing) {
          const stats: TeamStats = {
            position: standing.position, playedGames: standing.playedGames,
            won: standing.won, draw: standing.draw, lost: standing.lost,
            points: standing.points, goalsFor: standing.goalsFor,
            goalsAgainst: standing.goalsAgainst, goalDifference: standing.goalDifference,
          };
          if (side === 'A') setStatsA(stats);
          else setStatsB(stats);
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const statRows = useMemo(() => {
    if (!statsA || !statsB) return [];
    return [
      { label: 'Position', a: statsA.position, b: statsB.position, lower: true },
      { label: 'Points', a: statsA.points, b: statsB.points },
      { label: 'Played', a: statsA.playedGames, b: statsB.playedGames },
      { label: 'Won', a: statsA.won, b: statsB.won },
      { label: 'Drawn', a: statsA.draw, b: statsB.draw },
      { label: 'Lost', a: statsA.lost, b: statsB.lost, lower: true },
      { label: 'Goals For', a: statsA.goalsFor, b: statsB.goalsFor },
      { label: 'Goals Against', a: statsA.goalsAgainst, b: statsB.goalsAgainst, lower: true },
      { label: 'Goal Diff', a: statsA.goalDifference, b: statsB.goalDifference },
      { label: 'Win Rate', a: Math.round((statsA.won / Math.max(statsA.playedGames, 1)) * 100), b: Math.round((statsB.won / Math.max(statsB.playedGames, 1)) * 100), suffix: '%' },
      { label: 'Goals/Game', a: +(statsA.goalsFor / Math.max(statsA.playedGames, 1)).toFixed(2), b: +(statsB.goalsFor / Math.max(statsB.playedGames, 1)).toFixed(2) },
      { label: 'Conceded/Game', a: +(statsA.goalsAgainst / Math.max(statsA.playedGames, 1)).toFixed(2), b: +(statsB.goalsAgainst / Math.max(statsB.playedGames, 1)).toFixed(2), lower: true },
    ];
  }, [statsA, statsB]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase">Team A</p>
          {teamA ? (
            <div className="flex items-center gap-3">
              {teamA.crest && <img src={teamA.crest} alt="" className="w-12 h-12 object-contain" />}
              <div>
                <p className="font-black text-white text-lg">{teamA.name}</p>
                <p className="text-xs text-slate-400">{teamA.leagueName}</p>
              </div>
              <button onClick={() => { setTeamA(null); setStatsA(null); }} className="ml-auto text-xs text-red-400 hover:text-red-300">Change</button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
                <Search size={14} className="text-slate-400" />
                <input type="text" value={searchA} onChange={e => { setSearchA(e.target.value); setShowDropA(true); }}
                  onFocus={() => setShowDropA(true)} placeholder="Search team..."
                  className="flex-1 text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500" />
              </div>
              {showDropA && (
                <div className="absolute top-full mt-1 left-0 right-0 glass-strong rounded-xl max-h-60 overflow-y-auto z-30">
                  {filteredA.map(t => (
                    <button key={t.id} onClick={() => selectTeam(t, 'A')} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 w-full text-left">
                      {t.crest && <img src={t.crest} alt="" className="w-5 h-5 object-contain" />}
                      <span className="text-sm text-slate-300">{t.name}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{t.leagueName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase">Team B</p>
          {teamB ? (
            <div className="flex items-center gap-3">
              {teamB.crest && <img src={teamB.crest} alt="" className="w-12 h-12 object-contain" />}
              <div>
                <p className="font-black text-white text-lg">{teamB.name}</p>
                <p className="text-xs text-slate-400">{teamB.leagueName}</p>
              </div>
              <button onClick={() => { setTeamB(null); setStatsB(null); }} className="ml-auto text-xs text-red-400 hover:text-red-300">Change</button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
                <Search size={14} className="text-slate-400" />
                <input type="text" value={searchB} onChange={e => { setSearchB(e.target.value); setShowDropB(true); }}
                  onFocus={() => setShowDropB(true)} placeholder="Search team..."
                  className="flex-1 text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500" />
              </div>
              {showDropB && (
                <div className="absolute top-full mt-1 left-0 right-0 glass-strong rounded-xl max-h-60 overflow-y-auto z-30">
                  {filteredB.map(t => (
                    <button key={t.id} onClick={() => selectTeam(t, 'B')} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 w-full text-left">
                      {t.crest && <img src={t.crest} alt="" className="w-5 h-5 object-contain" />}
                      <span className="text-sm text-slate-300">{t.name}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{t.leagueName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {teamA && teamB && statsA && statsB && (
        <section className="card overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex items-center gap-2">
            <Swords className="text-cyan-400" size={18} />
            <h2 className="section-title">Season Comparison</h2>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {statRows.map(row => {
              const aWins = row.lower ? row.a < row.b : row.a > row.b;
              const bWins = row.lower ? row.b < row.a : row.b > row.a;
              const tie = row.a === row.b;
              return (
                <div key={row.label} className="grid grid-cols-3 items-center px-5 py-3">
                  <div className={`text-right font-bold text-lg ${aWins ? 'text-emerald-400' : tie ? 'text-slate-200' : 'text-slate-400'}`}>
                    {row.a}{row.suffix || ''}
                  </div>
                  <div className="text-center text-xs font-medium text-slate-400 uppercase">{row.label}</div>
                  <div className={`text-left font-bold text-lg ${bWins ? 'text-emerald-400' : tie ? 'text-slate-200' : 'text-slate-400'}`}>
                    {row.b}{row.suffix || ''}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-5 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-t border-white/[0.06]">
            <div className="grid grid-cols-3 items-center text-center">
              <div>{statsA.points > statsB.points && <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">Leading</span>}</div>
              <div className="text-sm font-bold text-slate-400">{Math.abs(statsA.points - statsB.points)} point{Math.abs(statsA.points - statsB.points) !== 1 ? 's' : ''} difference</div>
              <div>{statsB.points > statsA.points && <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">Leading</span>}</div>
            </div>
          </div>
        </section>
      )}

      {(!teamA || !teamB) && (
        <div className="card p-12 text-center">
          <Swords className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-400 text-sm">Select two teams above to compare their season statistics</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 mt-2">Loading team data...</p>
        </div>
      )}
    </div>
  );
}
