'use client';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, AreaChart, Area, Legend,
} from 'recharts';

interface ChartData { name: string; value?: number; goals?: number; points?: number; fill: string }

interface AdvancedData {
  radarData: { metric: string; [key: string]: string | number }[];
  homeAwayData: { name: string; homeGoals: number; awayGoals: number; fill: string }[];
  defenseData: { name: string; conceded: number; cleanSheets: number; fill: string }[];
}

const tooltipStyle = { background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '12px' };
const gridStyle = { stroke: 'rgba(255,255,255,0.04)' };
const axisStyle = { fill: '#94a3b8', fontSize: 11 };

const COLORS = ['#f97316', '#10b981', '#8b5cf6', '#06b6d4', '#f43f5e'];

export function AnalyticsCharts({
  goalsPerMatchData, totalGoalsData, drawPctData, topPointsData, advancedData,
}: {
  goalsPerMatchData: ChartData[];
  totalGoalsData: ChartData[];
  drawPctData: ChartData[];
  topPointsData: ChartData[];
  advancedData?: AdvancedData;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="card p-5 h-72 animate-pulse" />)}</div>;
  return (
    <div className="space-y-6">
      {/* Row 1: Goals Per Match + Total Goals Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4">⚽ Goals Per Match</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={goalsPerMatchData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="name" tick={axisStyle} interval={0} angle={-15} textAnchor="end" axisLine={false} />
                <YAxis tick={axisStyle} domain={[0, 'auto']} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Goals/Match">
                  {goalsPerMatchData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4">🎯 Total Goals Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={totalGoalsData} dataKey="goals" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45}
                  label={(props: any) => `${props.name ?? ''}: ${props.value}`}
                  labelLine={{ stroke: '#64748b' }} strokeWidth={2} stroke="#0a0e1a">
                  {totalGoalsData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value} goals`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Draw % + Leader Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4">🤝 Draw Percentage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={drawPctData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis type="number" tick={axisStyle} unit="%" axisLine={false} />
                <YAxis type="category" dataKey="name" tick={axisStyle} width={75} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => `${val}%`} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Draw %">
                  {drawPctData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4">🏆 League Leader Points</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={topPointsData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="name" tick={axisStyle} interval={0} angle={-15} textAnchor="end" axisLine={false} />
                <YAxis tick={axisStyle} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="points" radius={[8, 8, 0, 0]} name="Points">
                  {topPointsData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Radar Chart + Home vs Away Area */}
      {advancedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4">🕸️ League Profile Radar</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <RadarChart data={advancedData.radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  {goalsPerMatchData.map((d, i) => (
                    <Radar key={d.name} name={d.name} dataKey={d.name} stroke={d.fill} fill={d.fill} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4">🏠 Home vs Away Goals</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={advancedData.homeAwayData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                  <XAxis dataKey="name" tick={axisStyle} interval={0} angle={-15} textAnchor="end" axisLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="homeGoals" name="Home Goals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="awayGoals" name="Away Goals" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Row 4: Defense Chart */}
      {advancedData && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4">��️ Defensive Record Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={advancedData.defenseData} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                <defs>
                  <linearGradient id="gradConceded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradClean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
                <XAxis dataKey="name" tick={axisStyle} interval={0} angle={-15} textAnchor="end" axisLine={false} />
                <YAxis tick={axisStyle} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Area type="monotone" dataKey="conceded" name="Goals Conceded (Avg)" stroke="#f43f5e" fill="url(#gradConceded)" strokeWidth={2} />
                <Area type="monotone" dataKey="cleanSheets" name="Clean Sheet %" stroke="#10b981" fill="url(#gradClean)" strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
