import Link from 'next/link';
import { tournaments } from '@/data';
import { Globe, ArrowRight, Calendar, Users, MapPin, Trophy } from 'lucide-react';

export default function TournamentsPage() {
  const ongoing = tournaments.filter(t => t.status === 'ongoing');
  const upcoming = tournaments.filter(t => t.status === 'upcoming');
  const completed = tournaments.filter(t => t.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Globe className="text-cyan-400" size={24} /> Tournaments
        </h1>
        <p className="text-sm text-slate-400 mt-1">Track every major international and club tournament from around the world</p>
      </div>

      {ongoing.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Tournaments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ongoing.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="text-cyan-400" size={18} /> Upcoming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-slate-200 mb-4">📜 Recently Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </section>
      )}

      {/* World Cup 2026 Feature */}
      <section className="card bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-500/10 p-8 border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🏆</span>
          <div>
            <h2 className="text-2xl font-black text-white">FIFA World Cup 2026</h2>
            <p className="text-sm text-slate-400">USA / Canada / Mexico &middot; 48 Teams &middot; The Biggest World Cup Ever</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">
          The 2026 FIFA World Cup will be the largest in history, featuring 48 teams across 16 host cities in three countries.
          PitchIQ will provide comprehensive coverage including group stage analysis, knockout predictions, player tracking,
          and content tools for every single match.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center border border-white/[0.06]">
            <p className="text-xl font-black text-white">48</p>
            <p className="text-xs text-slate-400">Teams</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center border border-white/[0.06]">
            <p className="text-xl font-black text-white">104</p>
            <p className="text-xs text-slate-400">Matches</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center border border-white/[0.06]">
            <p className="text-xl font-black text-white">16</p>
            <p className="text-xs text-slate-400">Host Cities</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center border border-white/[0.06]">
            <p className="text-xl font-black text-white">3</p>
            <p className="text-xs text-slate-400">Countries</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function TournamentCard({ tournament: t }: { tournament: typeof tournaments[number] }) {
  return (
    <Link href={`/tournaments/${t.id}`}
      className="card p-5 hover:border-cyan-500/30 hover:scale-[1.02] transition-all block">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{t.logo}</span>
        <div className="flex-1">
          <h3 className="font-bold text-slate-200">{t.name}</h3>
          <p className="text-xs text-slate-400">{t.year}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          t.status === 'ongoing' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
          t.status === 'upcoming' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-slate-400 border border-white/[0.06]'
        }`}>{t.status}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><MapPin size={12} /> {t.hostCountry}</span>
        <span className="flex items-center gap-1"><Users size={12} /> {t.teams} teams</span>
      </div>
      <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold mt-3">
        View Details <ArrowRight size={12} />
      </div>
    </Link>
  );
}
