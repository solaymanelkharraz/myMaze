import { useState, useEffect } from 'react';
import axios from 'axios';
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';

export default function ResultsPage({ score, totalQuestions, playerName, questions, resetGame }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerRank, setPlayerRank] = useState(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const onResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', onResize);

    axios
      .get('https://backend-pink-seven-27.vercel.app/api/scores')
      .then((res) => {
        const scores = res.data || [];
        setLeaderboard(scores);

        if (playerName) {
          const rank =
            scores.findIndex(
              (s) => s.player_name === playerName && s.score === score
            ) + 1;
          setPlayerRank(rank > 0 ? rank : null);
        }
      })
      .catch((err) => console.error(err));

    return () => window.removeEventListener('resize', onResize);
  }, [playerName, score]);

  const isPerfect = totalQuestions > 0 && score === totalQuestions;

  const getRewardTitle = () => {
    if (totalQuestions === 0) return 'Maze Visitor';
    const ratio = score / totalQuestions;

    if (ratio === 1) return 'Soft Skills Master';
    if (ratio >= 0.7) return 'Smart Navigator';
    if (ratio >= 0.4) return 'Team Player';
    return 'Beginner Explorer';
  };

  const getRewardMessage = () => {
    if (totalQuestions === 0) return 'Start a game to earn your result.';
    const ratio = score / totalQuestions;

    if (ratio === 1) return 'Perfect run. You handled every challenge like a pro.';
    if (ratio >= 0.7) return 'Strong decisions and solid judgment. Nice work.';
    if (ratio >= 0.4) return 'You found good paths, but there is still room to grow.';
    return 'Every maze starts with wrong turns. Learn the lessons and try again.';
  };

  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center min-h-screen pt-10 pb-20 px-4 relative">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      {isPerfect && playerName && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={600}
          gravity={0.15}
        />
      )}

      <div className="max-w-6xl w-full grid md:grid-cols-[1fr_1.2fr] gap-8 mt-10 z-10 mx-auto">
        <div className="glass-panel p-8 md:p-10 rounded-3xl flex flex-col items-center">
          <h1 className="text-7xl mb-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">{isPerfect ? '🏆' : '🎯'}</h1>
          <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Maze Completed</h2>
          <p className="text-slate-400 mb-6 text-lg">
            {playerName ? `Great job, ${playerName}.` : 'Leaderboard View'}
          </p>

          <div className="bg-gradient-to-r from-teal-900/60 to-blue-900/60 rounded-2xl p-6 mb-6 w-full text-center border border-teal-500/30 shadow-[inset_0_0_20px_rgba(45,212,191,0.1)]">
            <p className="text-sm text-teal-300 uppercase tracking-widest font-bold mb-2">
              Final Title
            </p>
            <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-300 mb-2">{getRewardTitle()}</p>
            <p className="text-slate-300">{getRewardMessage()}</p>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-8 mb-6 w-full border border-slate-700/50 text-center shadow-inner">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-3">
              Final Score
            </p>
            <p className="text-6xl font-black text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
              {score} <span className="text-3xl text-slate-600 font-bold">/ {totalQuestions}</span>
            </p>
          </div>

          {playerRank && (
            <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 w-full rounded-2xl p-5 mb-6 border border-amber-600/50 text-center">
              <p className="text-amber-300 font-bold text-lg">
                You ranked <span className="text-2xl text-amber-400 mx-1">#{playerRank}</span> out of {leaderboard.length} players
              </p>
            </div>
          )}

          <div className="bg-slate-950/60 rounded-2xl border border-slate-700/50 p-6 mb-8 w-full text-left flex-grow shadow-inner">
            <h3 className="text-teal-400 font-bold mb-4 border-b border-slate-800 pb-3 uppercase tracking-widest text-sm flex items-center gap-2">
              <span className="text-xl">👑</span> Top Navigators
            </h3>

            <ul className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboard.length === 0 ? (
                <li className="text-slate-500 italic text-center py-6 bg-slate-900/50 rounded-lg">
                  Waiting for the first legend to arrive.
                </li>
              ) : (
                leaderboard.map((entry, i) => (
                  <li
                    key={i}
                    className={`flex justify-between p-4 rounded-xl border transition-colors ${
                      entry.player_name === playerName && entry.score === score
                        ? 'bg-teal-900/40 text-teal-300 border-teal-500/50 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                        : 'bg-slate-900/80 text-slate-300 border-slate-700/50 hover:border-slate-500/50'
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <span className="text-slate-500 w-5">{i + 1}.</span> {entry.player_name}
                    </span>
                    <span className="font-bold text-teal-400">
                      {entry.score} <span className="text-slate-500 text-sm font-normal">/ {entry.total_questions}</span>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <button
            onClick={handlePlayAgain}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-xl transition-all border border-slate-700 hover:border-slate-500 mt-auto text-lg uppercase tracking-wider"
          >
            Play Again
          </button>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-3xl overflow-hidden flex flex-col h-[700px]">
          <h3 className="text-3xl font-extrabold text-white mb-6 border-b border-slate-700/50 pb-5 tracking-tight flex items-center gap-3">
            <span>📚</span> What You Learned
          </h3>

          <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-grow pb-10">
            {questions.map((q, index) => (
              <div
                key={index}
                className="bg-slate-950/60 p-6 rounded-2xl border border-slate-700/50 shadow-inner group hover:border-teal-500/30 transition-all"
              >
                <p className="text-xs text-amber-500 font-black mb-3 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-6 h-px bg-amber-500/50"></span> Scenario {index + 1}
                </p>

                <p className="text-teal-400 text-base font-bold mb-3 flex items-center gap-2">
                  <span>✦</span> Skill: {['Communication', 'Time Management', 'Emotional Intelligence', 'Adaptability', 'Clarity & Initiative', 'Professionalism'][index] || 'Soft Skill'}
                </p>

                <p className="text-slate-300 text-lg leading-relaxed italic mb-5 pl-4 border-l-2 border-slate-700">"{q.scenario}"</p>

                <div className="bg-gradient-to-r from-teal-900/30 to-transparent p-5 rounded-xl border-l-4 border-teal-500">
                  <p className="text-teal-400 text-sm font-black mb-2 uppercase tracking-wide">The Lesson:</p>
                  <p className="text-slate-200 text-base leading-relaxed">
                    {q.feedback
                      .replace(/Conflict Exploded! |DEAD END: |Quality Crash! |Ego Trap! |Opportunity Lost! |Wasted Effort! |Unprofessional! /gi, '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}