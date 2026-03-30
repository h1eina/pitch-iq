'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';

const tooltipStyle = { background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '12px' };
const gridStyle = { stroke: 'rgba(255,255,255,0.04)' };
const axisStyle = { fill: '#94a3b8', fontSize: 10 };

interface StandingsTeam {
  position: number;
  team: { id: number; name: string; shortName: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
}

export function StandingsCharts({ standings, leagueColor }: { standings: StandingsTeam[]; leagueColor: string }) {
  if (!standings || standings.length === 0) return null;

  const top10 = standings.slice(0, 10);

  // Points Gap chart — distance from leader
  const leaderPts = standings[0]?.points || 0;
  const pointsGapData = top10.map(s => ({
    name: s.team.shortName || s.team.name.slice(0, 10),
    points: s.points,
    gap: leaderPts - s.points,
  }));

  // Goal Difference comparison
  const gdData = top10.map(s => ({
    name: s.team.shortName || s.team.name.slice(0, 10),
    gd: s.goalDifference,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
  }));

  // Form points (last 5) — W=3, D=1, L=0
  const formData = top10.map(s => {
    const formStr = (s.form || '').split(',').filter(Boolean);
    const formPts = formStr.reduce((acc, f) => acc + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0);
    return { name: s.team.shortName || s.team.name.slice(0, 10), formPoints: formPts, maxForm: 15 };
  });

  // Win/Draw/Loss distribution
  const wdlData = top10.map(s => ({
    name: s.team.shortName || s.team.name.slice(0, 10),
    wins: s.won,
    draws: s.draw,
    losses: s.lost,
  }));

  const COLORS = ['#10b981', '#f97316', '#8b5cf6', '#06b6d4', '#f43f5e', '#eab308', '#ec4899', '#3b82f6', '#14b8a6', '#a855f7'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Points Chart */}
      <section className="card p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4">📊 Points Distribution (Top 10)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={pointsGapData} layout="vertical">
            <CartesianGrid {...gridStyle} horizontal={false} />
            <XAxis type="number" tick={axisStyle} />
            <YAxis type="category" dataKey="name" width={70} tick={axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="points" radius={[0, 6, 6, 0]}>
              {pointsGapData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#f97316' : i < 4 ? '#10b981' : '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Goal Difference */}
      <section className="card p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4">⚽ Goal Difference (Top 10)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={gdData} layout="vertical">
            <CartesianGrid {...gridStyle} horizontal={false} />
            <XAxis type="number" tick={axisStyle} />
            <YAxis type="category" dataKey="name" width={70} tick={axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="gd" radius={[0, 6, 6, 0]}>
              {gdData.map((d, i) => (
                <Cell key={i} fill={d.gd >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Form Points */}
      <section className="card p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4">🔥 Recent Form (Last 5 Matches)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" tick={axisStyle} interval={0} angle={-25} textAnchor="end" height={50} />
            <YAxis tick={axisStyle} domain={[0, 15]} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}/15 pts`, 'Form']} />
            <Bar dataKey="formPoints" radius={[6, 6, 0, 0]}>
              {formData.map((d, i) => (
                <Cell key={i} fill={d.formPoints >= 12 ? '#10b981' : d.formPoints >= 7 ? '#f97316' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* W/D/L Stacked */}
      <section className="card p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4">📈 Win / Draw / Loss Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={wdlData}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" tick={axisStyle} interval={0} angle={-25} textAnchor="end" height={50} />
            <YAxis tick={axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            <Bar dataKey="wins" stackId="a" fill="#10b981" name="Wins" radius={[0, 0, 0, 0]} />
            <Bar dataKey="draws" stackId="a" fill="#eab308" name="Draws" />
            <Bar dataKey="losses" stackId="a" fill="#ef4444" name="Losses" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
