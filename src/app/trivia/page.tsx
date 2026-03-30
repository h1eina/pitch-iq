'use client';
import { useState, useCallback, useMemo } from 'react';
import { triviaQuestions } from '@/data';
import { Brain, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Zap, Shuffle, Timer } from 'lucide-react';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TriviaPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard' | 'expert'>('all');
  const [shuffleKey, setShuffleKey] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const questions = useMemo(() => {
    const filtered = difficulty === 'all' ? triviaQuestions : triviaQuestions.filter(q => q.difficulty === difficulty);
    return shuffleArray(filtered).slice(0, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, shuffleKey]);

  const question = questions[currentQ];

  const handleAnswer = useCallback((index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    setAnswered(prev => prev + 1);
    if (index === question.correctAnswer) {
      setScore(prev => prev + 1);
      setTotalPoints(prev => prev + question.points);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(old => Math.max(old, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  }, [showResult, question]);

  const nextQuestion = useCallback(() => {
    if (currentQ + 1 >= questions.length) {
      setGameOver(true);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
    }
  }, [currentQ, questions.length]);

  const restart = useCallback(() => {
    setCurrentQ(0); setSelected(null); setScore(0); setTotalPoints(0);
    setAnswered(0); setShowResult(false); setGameOver(false);
    setStreak(0); setBestStreak(0); setShuffleKey(prev => prev + 1);
  }, []);

  if (!question && !gameOver) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-slate-400">No questions available for this difficulty.</p>
        <button onClick={() => setDifficulty('all')} className="mt-4 text-orange-400 font-semibold">Show all difficulties</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Brain className="text-violet-400" size={24} /> Football Trivia
        </h1>
        <div className="flex items-center gap-4">
          {streak >= 3 && (
            <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400 animate-pop">
              🔥 {streak} streak
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 card">
            <Zap className="text-yellow-400" size={14} />
            <span className="text-sm font-bold text-white">{totalPoints} pts</span>
            <span className="text-xs text-slate-400">({score}/{answered})</span>
          </div>
        </div>
      </div>

      {/* Difficulty Filter + Shuffle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'easy', 'medium', 'hard', 'expert'] as const).map(d => (
            <button key={d} onClick={() => { setDifficulty(d); restart(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                difficulty === d
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm'
                  : 'card text-slate-400 hover:text-slate-200'
              }`}>{d}</button>
          ))}
        </div>
        <button onClick={restart} className="flex items-center gap-1.5 px-3 py-1.5 card text-xs font-semibold text-slate-400 hover:text-orange-400 transition">
          <Shuffle size={12} /> New Questions
        </button>
      </div>

      {/* Progress Bar */}
      <div className="stat-bar">
        <div className="stat-bar-fill bg-gradient-to-r from-violet-500 to-emerald-500"
          style={{ width: `${((currentQ + (showResult ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      {gameOver ? (
        <div className="card p-8 text-center">
          <Trophy className="text-yellow-400 mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-black text-white mb-2">Quiz Complete!</h2>
          <p className="text-xl text-slate-300">You scored <span className="text-emerald-400 font-black">{score}</span> out of <span className="text-white font-bold">{questions.length}</span></p>

          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="card p-4">
              <p className="text-2xl font-black text-emerald-400">{totalPoints}</p>
              <p className="text-xs text-slate-400">Total Points</p>
            </div>
            <div className="card p-4">
              <p className="text-2xl font-black text-violet-400">{Math.round((score / questions.length) * 100)}%</p>
              <p className="text-xs text-slate-400">Accuracy</p>
            </div>
            <div className="card p-4">
              <p className="text-2xl font-black text-orange-400">{bestStreak}</p>
              <p className="text-xs text-slate-400">Best Streak</p>
            </div>
          </div>

          <div className="w-28 h-28 mx-auto rounded-full border-4 flex items-center justify-center text-3xl font-black mb-4 animate-pop"
            style={{
              borderColor: score / questions.length >= 0.8 ? '#10b981' : score / questions.length >= 0.5 ? '#f59e0b' : '#ef4444',
              color: score / questions.length >= 0.8 ? '#10b981' : score / questions.length >= 0.5 ? '#f59e0b' : '#ef4444',
            }}>
            {Math.round((score / questions.length) * 100)}%
          </div>

          <p className="text-slate-400 mb-6">
            {score / questions.length >= 0.8 ? '🏆 Football genius! You really know the beautiful game!' :
             score / questions.length >= 0.5 ? '⚽ Solid effort! Keep learning about the beautiful game!' :
             '📚 Room to improve! Check out our analytics to learn more!'}
          </p>
          <button onClick={restart}
            className="inline-flex items-center gap-2 px-6 py-3 badge-emerald rounded-xl transition hover:opacity-90">
            <RotateCcw size={16} /> Play Again (New Questions)
          </button>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400 font-semibold">Question {currentQ + 1} of {questions.length}</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                question.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                question.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' : question.difficulty === 'hard' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              }`}>{question.difficulty}</span>
              <span className="text-xs text-slate-400 font-semibold">{question.points} pts</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-1 font-semibold">{question.category}</p>
          <h2 className="text-xl font-bold text-white mb-6">{question.question}</h2>
          <div className="space-y-3">
            {question.options.map((opt, i) => {
              let classes = 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-orange-500/30 cursor-pointer';
              if (showResult) {
                if (i === question.correctAnswer) classes = 'bg-emerald-500/10 border-emerald-500/40 shadow-sm';
                else if (i === selected) classes = 'bg-red-500/10 border-red-500/40';
                else classes = 'bg-white/[0.02] border-white/[0.04] opacity-50';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${classes}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    showResult && i === question.correctAnswer ? 'bg-emerald-500/20 text-emerald-400' :
                    showResult && i === selected ? 'bg-red-500/20 text-red-400' :
                    'bg-white/5 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-slate-200 flex-1 font-medium">{opt}</span>
                  {showResult && i === question.correctAnswer && <CheckCircle className="text-emerald-400" size={20} />}
                  {showResult && i === selected && i !== question.correctAnswer && <XCircle className="text-red-400" size={20} />}
                </button>
              );
            })}
          </div>
          {showResult && question.explanation && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-sm text-slate-300">💡 {question.explanation}</p>
            </div>
          )}
          {showResult && (
            <button onClick={nextQuestion}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 badge-orange rounded-xl transition hover:opacity-90">
              {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'} <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
