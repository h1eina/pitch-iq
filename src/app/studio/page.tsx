import { getTodayMatches, LEAGUE_META, type ApiMatch } from '@/lib/football-api';
import { Tv, Video, Hash, MessageSquare, Lightbulb, Sparkles, Copy } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

function generateTitle(match: ApiMatch): string {
  if (match.score.fullTime.home === null) return `${match.homeTeam.shortName} vs ${match.awayTeam.shortName} | Match Preview & Prediction`;
  const result = `${match.homeTeam.shortName} ${match.score.fullTime.home}-${match.score.fullTime.away} ${match.awayTeam.shortName}`;
  const meta = LEAGUE_META[match.competition?.code];
  return `${result} | FULL Match Analysis 🔥 | ${meta?.name || match.competition?.name} Highlights`;
}

function generateDescription(match: ApiMatch): string {
  if (match.score.fullTime.home === null) return `🔮 Match preview: ${match.homeTeam.name} vs ${match.awayTeam.name}`;
  return `📊 Full match analysis of ${match.homeTeam.name} vs ${match.awayTeam.name}\n\n` +
    `⚽ Final Score: ${match.homeTeam.shortName} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${match.awayTeam.shortName}\n` +
    (match.score.halfTime.home !== null ? `⏱️ Half Time: ${match.score.halfTime.home} - ${match.score.halfTime.away}\n` : '') +
    `\n🏟️ ${match.competition?.name} · Matchday ${match.matchday}\n` +
    (match.referees?.[0] ? `👤 Referee: ${match.referees[0].name}\n` : '') +
    `\n#football #${match.homeTeam.shortName.replace(/\s/g, '')} #${match.awayTeam.shortName.replace(/\s/g, '')} #PitchIQ`;
}

function generateTalkingPoints(match: ApiMatch): string[] {
  const points: string[] = [];
  if (match.score.fullTime.home === null) {
    points.push(`Key matchup between ${match.homeTeam.name} and ${match.awayTeam.name}`);
    points.push(`Recent form analysis and head-to-head breakdown`);
    points.push(`Tactical preview and predicted lineups`);
    return points;
  }
  const hg = match.score.fullTime.home!;
  const ag = match.score.fullTime.away!;
  if (hg > ag) points.push(`${match.homeTeam.name} dominated with a ${hg}-${ag} home victory`);
  else if (ag > hg) points.push(`${match.awayTeam.name} pulled off a ${ag}-${hg} away win`);
  else points.push(`A tightly contested ${hg}-${ag} draw between two quality sides`);
  if (match.score.halfTime.home !== null) {
    points.push(`Half-time score was ${match.score.halfTime.home}-${match.score.halfTime.away} — ${match.score.halfTime.home === match.score.halfTime.away ? 'second half proved decisive' : 'early momentum set the tone'}`);
  }
  points.push(`Matchday ${match.matchday} in the ${LEAGUE_META[match.competition?.code]?.name || match.competition?.name}`);
  if (match.referees?.[0]) points.push(`Referee ${match.referees[0].name} oversaw proceedings`);
  return points;
}

function generateHashtags(match: ApiMatch): string[] {
  const meta = LEAGUE_META[match.competition?.code];
  return [
    `#${match.homeTeam.shortName.replace(/\s/g, '')}v${match.awayTeam.shortName.replace(/\s/g, '')}`,
    `#${meta?.name.replace(/\s/g, '') || 'Football'}`,
    '#PitchIQ', '#FootballAnalysis', '#MatchHighlights',
    `#${match.homeTeam.name.replace(/\s/g, '')}`,
    `#${match.awayTeam.name.replace(/\s/g, '')}`,
    '#Football', '#Soccer', '#Tactics',
  ];
}

function generateThumbnailIdea(match: ApiMatch): string {
  if (match.score.fullTime.home === null) return `Create a "Match Preview" split card with both team crests, VS in the center, and match details.`;
  const winner = match.score.fullTime.home! > match.score.fullTime.away! ? match.homeTeam : match.awayTeam;
  return `Split-frame design: ${winner.name} crest on left with winning celebration, defeated team on right. ` +
    `Bold score "${match.score.fullTime.home}-${match.score.fullTime.away}" in center. ` +
    `Use ${LEAGUE_META[match.competition?.code]?.name || ''} branding colors. Red arrow or shocked emoji for drama.`;
}

export default async function StudioPage() {
  const matches = await getTodayMatches();
  const finishedMatches = matches.filter(m => m.status === 'FINISHED');
  const allMatches = matches.length > 0 ? matches : finishedMatches;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Tv className="text-red-400" size={24} /> YouTube Content Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">Auto-generate match analysis content, titles, descriptions, and thumbnail ideas from real match data</p>
      </div>

      {allMatches.length === 0 ? (
        <div className="card p-8 text-center">
          <Tv className="text-slate-400 mx-auto mb-3" size={40} />
          <p className="text-slate-400 font-medium">No matches available right now</p>
          <p className="text-xs text-slate-400 mt-1">Check back when there are live or recent matches. Make sure your API key is set in .env.local</p>
          <Link href="/matches" className="text-orange-400 text-sm font-semibold mt-4 inline-block">View Match Schedule →</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {allMatches.slice(0, 6).map(match => {
            const meta = LEAGUE_META[match.competition?.code];
            const isFinished = match.status === 'FINISHED';
            return (
              <div key={match.id} className="card overflow-hidden">
                {/* Match Header */}
                <div className="p-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-3">
                    {match.competition?.emblem && <img src={match.competition.emblem} alt="" className="w-5 h-5 object-contain" />}
                    <span className="text-xs font-semibold text-slate-400">{meta?.name || match.competition?.name} · MD {match.matchday}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                      isFinished ? 'bg-emerald-500/15 text-emerald-400' : 'bg-cyan-500/15 text-cyan-400'
                    }`}>{match.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.homeTeam.crest && <img src={match.homeTeam.crest} alt="" className="crest-img-lg" />}
                      <div>
                        <p className="font-bold text-slate-200">{match.homeTeam.shortName}</p>
                        <p className="text-xs text-slate-400">Home</p>
                      </div>
                    </div>
                    <div className="text-center px-4">
                      {match.score.fullTime.home !== null ? (
                        <p className="text-3xl font-black text-white">{match.score.fullTime.home} - {match.score.fullTime.away}</p>
                      ) : (
                        <p className="text-xl font-bold text-slate-400">vs</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-slate-200">{match.awayTeam.shortName}</p>
                        <p className="text-xs text-slate-400">Away</p>
                      </div>
                      {match.awayTeam.crest && <img src={match.awayTeam.crest} alt="" className="crest-img-lg" />}
                    </div>
                  </div>
                </div>

                {/* Generated Content */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ContentCard icon={Video} title="Video Title" color="text-red-400" content={generateTitle(match)} />
                  <ContentCard icon={Lightbulb} title="Thumbnail Concept" color="text-violet-400" content={generateThumbnailIdea(match)} />
                  <div className="lg:col-span-2">
                    <ContentCard icon={MessageSquare} title="Video Description" color="text-cyan-400" content={generateDescription(match)} />
                  </div>
                  <div>
                    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-yellow-400" /> Talking Points
                      </h4>
                      <ul className="space-y-2">
                        {generateTalkingPoints(match).map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-orange-400 mt-0.5 font-bold">▸</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                        <Hash size={12} className="text-cyan-400" /> Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {generateHashtags(match).map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-slate-400 font-medium hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer transition">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContentCard({ icon: Icon, title, color, content }: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string; color: string; content: string;
}) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
        <Icon className={color} size={12} /> {title}
      </h4>
      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  );
}
