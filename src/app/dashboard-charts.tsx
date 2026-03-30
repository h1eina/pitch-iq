'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  name: string;
  goalsPerMatch: number;
  totalGoals: number;
  fill: string;
}

export function DashboardCharts({ data }: { data: ChartData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="card p-5 h-[260px] animate-pulse" /><div className="card p-5 h-[260px] animate-pulse" /></div>;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Goals per Match</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }}
                labelStyle={{ color: '#94a3b8' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="goalsPerMatch" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Total Goals by League</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie data={data} dataKey="totalGoals" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#475569' }}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }}
                formatter={(value: any) => [value, 'Goals']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
