'use client';
import { useState } from 'react';
import { polls } from '@/data';
import { MessageCircle, ThumbsUp, Flame, TrendingUp, Users, BarChart3, Heart } from 'lucide-react';

const debates = [
  { id: 'd1', topic: 'Is Lamine Yamal already better than Mbappé was at 18?', author: 'TacticsKing', likes: 342, replies: 89, hot: true },
  { id: 'd2', topic: 'Arsenal title challenge: Will they finally win it this season?', author: 'GoonerForLife', likes: 567, replies: 203, hot: true },
  { id: 'd3', topic: 'Harry Kane: Best striker never to win a trophy? (UPDATE: He won the Bundesliga)', author: 'FootballNerd', likes: 234, replies: 156, hot: false },
  { id: 'd4', topic: 'Unpopular opinion: Serie A is more entertaining than the Premier League', author: 'CalcioFan', likes: 178, replies: 67, hot: false },
  { id: 'd5', topic: 'World Cup 2026 predictions - Who are the dark horses?', author: 'GlobalGame', likes: 891, replies: 312, hot: true },
  { id: 'd6', topic: 'The decline of tiki-taka: Is possession football dead?', author: 'TacticalMind', likes: 445, replies: 134, hot: false },
  { id: 'd7', topic: 'Florian Wirtz vs Jude Bellingham - Who is the better midfielder?', author: 'BundesligaBoss', likes: 623, replies: 198, hot: true },
  { id: 'd8', topic: 'Should the offside rule be changed? VAR is ruining football', author: 'OldSchoolFan', likes: 1205, replies: 467, hot: true },
];

export default function CommunityPage() {
  const [votedPolls, setVotedPolls] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'polls' | 'debates'>('polls');
  const [likedDebates, setLikedDebates] = useState<Set<string>>(new Set());

  const handleVote = (pollId: string, optionIndex: number) => {
    if (votedPolls[pollId] !== undefined) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: optionIndex }));
  };

  const toggleLike = (debateId: string) => {
    setLikedDebates(prev => {
      const next = new Set(prev);
      next.has(debateId) ? next.delete(debateId) : next.add(debateId);
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <MessageCircle className="text-violet-400" size={24} /> Community Hub
        </h1>
        <p className="text-sm text-slate-400 mt-1">Vote on polls, join debates, and share your football opinions with fans worldwide</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{polls.reduce((sum, p) => sum + p.totalVotes, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Votes</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-violet-400">{debates.length}</p>
          <p className="text-xs text-slate-400">Active Debates</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1"><Users size={20} /> 12.4K</p>
          <p className="text-xs text-slate-400">Community Members</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('polls')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            activeTab === 'polls' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'card text-slate-400 hover:text-slate-200'
          }`}>🗳️ Polls</button>
        <button onClick={() => setActiveTab('debates')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
            activeTab === 'debates' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30 shadow-sm' : 'card text-slate-400 hover:text-slate-200'
          }`}>💬 Debates</button>
      </div>

      {activeTab === 'polls' && (
        <div className="space-y-6">
          {polls.map(poll => {
            const hasVoted = votedPolls[poll.id] !== undefined;
            const adjustedVotes = poll.votes.map((v, i) => hasVoted && votedPolls[poll.id] === i ? v + 1 : v);
            const adjustedTotal = hasVoted ? poll.totalVotes + 1 : poll.totalVotes;
            const maxVoteIdx = adjustedVotes.indexOf(Math.max(...adjustedVotes));
            return (
              <div key={poll.id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 px-2 py-0.5 bg-white/5 rounded font-semibold">{poll.category}</span>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-400 font-semibold">{adjustedTotal.toLocaleString()} votes</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{poll.question}</h3>
                <div className="space-y-2">
                  {poll.options.map((opt, i) => {
                    const pct = Math.round((adjustedVotes[i] / adjustedTotal) * 100);
                    const isSelected = votedPolls[poll.id] === i;
                    const isWinning = hasVoted && i === maxVoteIdx;
                    return (
                      <button key={i} onClick={() => handleVote(poll.id, i)} disabled={hasVoted}
                        className={`w-full relative text-left transition ${hasVoted ? '' : 'cursor-pointer hover:scale-[1.01]'}`}>
                        <div className={`flex items-center justify-between p-3 rounded-xl relative overflow-hidden border transition ${
                          isSelected ? 'border-emerald-500/40 bg-emerald-500/10' :
                          isWinning ? 'border-emerald-500/20 bg-emerald-500/5' :
                          'border-white/[0.08] bg-white/[0.03]'
                        }`}>
                          {hasVoted && <div className="absolute inset-y-0 left-0 bg-emerald-500/10 rounded-xl transition-all" style={{ width: `${pct}%` }} />}
                          <span className="relative text-sm text-slate-200 font-medium">{opt}</span>
                          {hasVoted && <span className={`relative text-sm font-bold ${isWinning ? 'text-emerald-400' : 'text-slate-400'}`}>{pct}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'debates' && (
        <div className="space-y-3">
          {debates.map(debate => (
            <div key={debate.id} className="card p-5 hover:border-violet-500/30 cursor-pointer transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-orange-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                  {debate.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400 font-semibold">@{debate.author}</span>
                    {debate.hot && <span className="flex items-center gap-0.5 text-xs text-orange-400 font-bold"><Flame size={10} /> Hot</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{debate.topic}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <button onClick={() => toggleLike(debate.id)} className={`flex items-center gap-1 transition ${likedDebates.has(debate.id) ? 'text-red-400' : 'hover:text-red-400'}`}>
                      <Heart size={12} fill={likedDebates.has(debate.id) ? 'currentColor' : 'none'} /> {debate.likes + (likedDebates.has(debate.id) ? 1 : 0)}
                    </button>
                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {debate.replies} replies</span>
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> Trending</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
