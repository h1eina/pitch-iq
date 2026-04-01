import { LEAGUE_META } from '@/lib/football-api';
import { ArrowRight, TrendingUp, DollarSign, Calendar, Filter, ArrowLeftRight, Flame, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface MockTransfer {
  id: string;
  player: string;
  age: number;
  position: string;
  nationality: string;
  fromTeam: string;
  fromLogo: string;
  toTeam: string;
  toLogo: string;
  fee: string;
  feeNumeric: number;
  type: 'permanent' | 'loan' | 'free' | 'loan-with-option';
  status: 'completed' | 'rumour' | 'negotiating' | 'official';
  date: string;
  league: string;
}

const transfers: MockTransfer[] = [
  { id: 't1', player: 'Florian Wirtz', age: 22, position: 'CAM', nationality: '🇩🇪', fromTeam: 'Bayer Leverkusen', fromLogo: '🟡', toTeam: 'Real Madrid', toLogo: '⚪', fee: '€150M', feeNumeric: 150, type: 'permanent', status: 'rumour', date: '2026-07-01', league: 'BL1' },
  { id: 't2', player: 'Lamine Yamal', age: 18, position: 'RW', nationality: '🇪🇸', fromTeam: 'Barcelona', fromLogo: '🔵🔴', toTeam: 'Manchester City', toLogo: '🔵', fee: '€200M', feeNumeric: 200, type: 'permanent', status: 'rumour', date: '2026-08-01', league: 'PD' },
  { id: 't3', player: 'Viktor Gyökeres', age: 27, position: 'ST', nationality: '🇸🇪', fromTeam: 'Sporting CP', fromLogo: '🟢', toTeam: 'Arsenal', toLogo: '🔴', fee: '€80M', feeNumeric: 80, type: 'permanent', status: 'negotiating', date: '2026-06-15', league: 'PL' },
  { id: 't4', player: 'Khvicha Kvaratskhelia', age: 25, position: 'LW', nationality: '🇬🇪', fromTeam: 'PSG', fromLogo: '🔴🔵', toTeam: 'Liverpool', toLogo: '🔴', fee: '€75M', feeNumeric: 75, type: 'permanent', status: 'official', date: '2026-01-15', league: 'PL' },
  { id: 't5', player: 'Joao Neves', age: 21, position: 'CM', nationality: '🇵🇹', fromTeam: 'PSG', fromLogo: '🔴🔵', toTeam: 'Bayern Munich', toLogo: '🔴', fee: '€90M', feeNumeric: 90, type: 'permanent', status: 'rumour', date: '2026-07-10', league: 'BL1' },
  { id: 't6', player: 'Alejandro Garnacho', age: 21, position: 'LW', nationality: '🇦🇷', fromTeam: 'Man United', fromLogo: '🔴', toTeam: 'Napoli', toLogo: '🔵', fee: '€55M', feeNumeric: 55, type: 'permanent', status: 'completed', date: '2026-01-28', league: 'SA' },
  { id: 't7', player: 'Mathys Tel', age: 20, position: 'ST', nationality: '🇫🇷', fromTeam: 'Bayern Munich', fromLogo: '🔴', toTeam: 'Tottenham', toLogo: '⚪', fee: 'Loan', feeNumeric: 0, type: 'loan', status: 'completed', date: '2026-01-20', league: 'PL' },
  { id: 't8', player: 'Nico Williams', age: 23, position: 'LW', nationality: '🇪🇸', fromTeam: 'Athletic Bilbao', fromLogo: '🔴⚪', toTeam: 'Barcelona', toLogo: '🔵🔴', fee: '€58M', feeNumeric: 58, type: 'permanent', status: 'rumour', date: '2026-07-01', league: 'PD' },
  { id: 't9', player: 'Benjamin Sesko', age: 22, position: 'ST', nationality: '🇸🇮', fromTeam: 'RB Leipzig', fromLogo: '⚪��', toTeam: 'Arsenal', toLogo: '🔴', fee: '€65M', feeNumeric: 65, type: 'permanent', status: 'negotiating', date: '2026-06-20', league: 'PL' },
  { id: 't10', player: 'Michael Olise', age: 24, position: 'RW', nationality: '🇫🇷', fromTeam: 'Bayern Munich', fromLogo: '🔴', toTeam: 'Chelsea', toLogo: '🔵', fee: '€70M', feeNumeric: 70, type: 'permanent', status: 'rumour', date: '2026-08-05', league: 'PL' },
  { id: 't11', player: 'Xavi Simons', age: 23, position: 'CAM', nationality: '🇳🇱', fromTeam: 'PSG', fromLogo: '🔴🔵', toTeam: 'RB Leipzig', toLogo: '⚪🔴', fee: 'Loan+Option', feeNumeric: 70, type: 'loan-with-option', status: 'official', date: '2026-01-10', league: 'BL1' },
  { id: 't12', player: 'Sandro Tonali', age: 25, position: 'CM', nationality: '🇮🇹', fromTeam: 'Newcastle', fromLogo: '⚫⚪', toTeam: 'Juventus', toLogo: '⚫⚪', fee: '€45M', feeNumeric: 45, type: 'permanent', status: 'rumour', date: '2026-07-15', league: 'SA' },
  { id: 't13', player: 'Jamal Musiala', age: 23, position: 'AM', nationality: '🇩🇪', fromTeam: 'Bayern Munich', fromLogo: '🔴', toTeam: 'Manchester City', toLogo: '🔵', fee: '€130M', feeNumeric: 130, type: 'permanent', status: 'rumour', date: '2026-07-20', league: 'PL' },
  { id: 't14', player: 'Gavi', age: 21, position: 'CM', nationality: '🇪🇸', fromTeam: 'Barcelona', fromLogo: '🔵🔴', toTeam: 'Barcelona', toLogo: '🔵🔴', fee: 'Renewal', feeNumeric: 0, type: 'permanent', status: 'official', date: '2026-03-01', league: 'PD' },
  { id: 't15', player: 'Evan Ferguson', age: 21, position: 'ST', nationality: '🇮🇪', fromTeam: 'Brighton', fromLogo: '🔵⚪', toTeam: 'Chelsea', toLogo: '🔵', fee: '€60M', feeNumeric: 60, type: 'permanent', status: 'negotiating', date: '2026-06-25', league: 'PL' },
  { id: 't16', player: 'Aurélien Tchouaméni', age: 26, position: 'CDM', nationality: '🇫🇷', fromTeam: 'Real Madrid', fromLogo: '⚪', toTeam: 'Liverpool', toLogo: '🔴', fee: '€85M', feeNumeric: 85, type: 'permanent', status: 'rumour', date: '2026-08-10', league: 'PL' },
  { id: 't17', player: 'Désiré Doué', age: 20, position: 'LW', nationality: '🇫🇷', fromTeam: 'PSG', fromLogo: '🔴🔵', toTeam: 'Arsenal', toLogo: '🔴', fee: '€50M', feeNumeric: 50, type: 'permanent', status: 'negotiating', date: '2026-07-05', league: 'PL' },
  { id: 't18', player: 'Castello Lukeba', age: 22, position: 'CB', nationality: '🇫🇷', fromTeam: 'RB Leipzig', fromLogo: '⚪🔴', toTeam: 'Real Madrid', toLogo: '⚪', fee: '€70M', feeNumeric: 70, type: 'permanent', status: 'rumour', date: '2026-07-18', league: 'PD' },
  { id: 't19', player: 'Moisés Caicedo', age: 24, position: 'CDM', nationality: '🇪🇨', fromTeam: 'Chelsea', fromLogo: '🔵', toTeam: 'Real Madrid', toLogo: '⚪', fee: '€95M', feeNumeric: 95, type: 'permanent', status: 'rumour', date: '2026-08-15', league: 'PD' },
  { id: 't20', player: 'Rasmus Højlund', age: 23, position: 'ST', nationality: '🇩🇰', fromTeam: 'Man United', fromLogo: '🔴', toTeam: 'AC Milan', toLogo: '🔴⚫', fee: '€55M', feeNumeric: 55, type: 'permanent', status: 'negotiating', date: '2026-06-30', league: 'SA' },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  completed: { label: 'Done', color: 'emerald', icon: CheckCircle },
  official: { label: 'Official', color: 'cyan', icon: CheckCircle },
  negotiating: { label: 'Talks', color: 'yellow', icon: Clock },
  rumour: { label: 'Rumour', color: 'orange', icon: Flame },
};

export default function TransfersPage() {
  const totalSpend = transfers.reduce((s, t) => s + t.feeNumeric, 0);
  const completedCount = transfers.filter(t => t.status === 'completed' || t.status === 'official').length;
  const rumourCount = transfers.filter(t => t.status === 'rumour').length;
  const biggestDeal = [...transfers].sort((a, b) => b.feeNumeric - a.feeNumeric)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ArrowLeftRight className="text-orange-400" /> Transfer Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">Market movements, rumours & confirmed deals across Europe&apos;s top leagues</p>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-orange-400 transition">← Back</Link>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <DollarSign className="mx-auto text-emerald-400 mb-1" size={20} />
          <p className="text-2xl font-black text-white">€{totalSpend}M</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Market Value</p>
        </div>
        <div className="card p-4 text-center">
          <CheckCircle className="mx-auto text-cyan-400 mb-1" size={20} />
          <p className="text-2xl font-black text-white">{completedCount}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Confirmed Deals</p>
        </div>
        <div className="card p-4 text-center">
          <Flame className="mx-auto text-orange-400 mb-1" size={20} />
          <p className="text-2xl font-black text-white">{rumourCount}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Hot Rumours</p>
        </div>
        <div className="card p-4 text-center">
          <TrendingUp className="mx-auto text-yellow-400 mb-1" size={20} />
          <p className="text-2xl font-black text-white">{biggestDeal?.fee}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Biggest Deal</p>
        </div>
      </div>

      {/* Deadline Day Countdown */}
      {(() => {
        const deadline = new Date('2026-09-01T23:00:00Z');
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const mins = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
        return (
          <section className="card p-5 border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-red-400 flex items-center gap-2"><Clock size={14} /> TRANSFER DEADLINE DAY</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Summer 2026 window closes Sep 1, 2026 at 23:00 UTC</p>
              </div>
              <div className="flex gap-3">
                {[{ val: days, label: 'DAYS' }, { val: hours, label: 'HRS' }, { val: mins, label: 'MIN' }].map(u => (
                  <div key={u.label} className="text-center">
                    <p className="text-2xl font-black text-white tabular-nums">{String(u.val).padStart(2, '0')}</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest">{u.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Fee Analysis by Position */}
      <section className="card p-5">
        <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-yellow-400" /> Fee Analysis by Position
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(() => {
            const posGroups: Record<string, { count: number; total: number; avg: number }> = {};
            transfers.forEach(t => {
              const pos = t.position.replace('CAM', 'MID').replace('CDM', 'MID').replace('AM', 'MID').replace('CB', 'DEF');
              if (!posGroups[pos]) posGroups[pos] = { count: 0, total: 0, avg: 0 };
              posGroups[pos].count++;
              posGroups[pos].total += t.feeNumeric;
            });
            Object.values(posGroups).forEach(g => { g.avg = Math.round(g.total / g.count); });
            const posColors: Record<string, string> = { ST: 'red', RW: 'orange', LW: 'orange', MID: 'emerald', DEF: 'cyan', CM: 'emerald' };
            return Object.entries(posGroups).sort((a, b) => b[1].total - a[1].total).map(([pos, data]) => {
              const color = posColors[pos] || 'slate';
              return (
                <div key={pos} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                  <p className={`text-xs font-bold text-${color}-400`}>{pos}</p>
                  <p className="text-lg font-black text-white mt-1">€{data.total}M</p>
                  <p className="text-[10px] text-slate-500">{data.count} deals · Avg €{data.avg}M</p>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* Top Movers - Highest Value */}
      <section className="card p-5">
        <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Flame size={14} className="text-orange-400" /> Top 5 Most Expensive Moves
        </h2>
        <div className="space-y-2">
          {[...transfers].sort((a, b) => b.feeNumeric - a.feeNumeric).slice(0, 5).map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
              <span className={`text-lg font-black w-6 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>{i + 1}</span>
              <span className="text-sm">{t.nationality}</span>
              <span className="text-sm font-bold text-white flex-1">{t.player}</span>
              <span className="text-xs text-slate-400">{t.fromTeam} → {t.toTeam}</span>
              <span className="text-sm font-black text-yellow-400">{t.fee}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Transfer Feed */}
      <section className="card p-5">
        <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Filter size={14} className="text-slate-400" /> Transfer Feed
        </h2>
        <div className="space-y-3">
          {transfers.map(t => {
            const cfg = statusConfig[t.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition border border-white/[0.04]">
                {/* Status */}
                <div className={`flex-shrink-0 w-16 text-center`}>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-${cfg.color}-500/15 text-${cfg.color}-400 border border-${cfg.color}-500/30`}>
                    <StatusIcon size={10} /> {cfg.label}
                  </span>
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.nationality}</span>
                    <p className="text-sm font-bold text-white truncate">{t.player}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">{t.position}</span>
                    <span className="text-[10px] text-slate-500">{t.age}y</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{t.fromLogo} {t.fromTeam}</span>
                    <ArrowRight size={12} className="text-orange-400" />
                    <span>{t.toLogo} {t.toTeam}</span>
                  </div>
                </div>

                {/* Fee */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-black ${t.feeNumeric >= 100 ? 'text-yellow-400' : t.feeNumeric >= 50 ? 'text-orange-400' : 'text-emerald-400'}`}>{t.fee}</p>
                  <p className="text-[10px] text-slate-500">{t.type === 'loan' ? 'Loan' : t.type === 'loan-with-option' ? 'Loan+Opt' : t.type === 'free' ? 'Free' : 'Permanent'}</p>
                </div>

                {/* Date */}
                <div className="hidden sm:block text-right flex-shrink-0 w-20">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 justify-end">
                    <Calendar size={10} />
                    {t.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* League Spending Breakdown */}
      <section className="card p-5">
        <h2 className="text-sm font-bold text-slate-200 mb-4">League Spending Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(LEAGUE_META).map(([code, meta]) => {
            const leagueTransfers = transfers.filter(t => t.league === code);
            const spend = leagueTransfers.reduce((s, tr) => s + tr.feeNumeric, 0);
            const maxSpend = Math.max(...Object.entries(LEAGUE_META).map(([c]) => transfers.filter(t => t.league === c).reduce((s, tr) => s + tr.feeNumeric, 0)), 1);
            const pct = Math.round((spend / maxSpend) * 100);
            return (
              <div key={code} className="flex items-center gap-3">
                <span className="text-lg w-6">{meta.logo}</span>
                <span className="text-xs font-medium text-slate-300 w-28">{meta.name}</span>
                <div className="flex-1 stat-bar">
                  <div className="stat-bar-fill bg-gradient-to-r from-orange-400 to-yellow-400" style={{ width: `${Math.max(pct, 5)}%` }} />
                </div>
                <span className="text-xs font-black text-orange-400 w-16 text-right">€{spend}M</span>
                <span className="text-[10px] text-slate-500 w-10 text-right">{leagueTransfers.length} deals</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
