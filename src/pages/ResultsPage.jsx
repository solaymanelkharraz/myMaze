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
    <div className="flex flex-col items-center min-h-screen bg-slate-900 p-6 overflow-hidden relative">
      {isPerfect && playerName && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={600}
          gravity={0.15}
        />
      )}

      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 mt-10 z-10">
        <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700 text-center flex flex-col">
          <h1 className="text-6xl mb-6">{isPerfect ? '🏆' : '🎯'}</h1>
          <h2 className="text-3xl font-bold text-white mb-2">Maze Completed</h2>
          <p className="text-slate-400 mb-4">
            {playerName ? `Great job, ${playerName}.` : 'Leaderboard View'}
          </p>

          <div className="bg-gradient-to-r from-teal-900/50 to-blue-900/50 rounded-xl p-5 mb-6 border border-teal-700">
            <p className="text-sm text-teal-300 uppercase tracking-widest font-bold mb-1">
              Final Title
            </p>
            <p className="text-3xl font-extrabold text-white">{getRewardTitle()}</p>
            <p className="text-slate-300 mt-2">{getRewardMessage()}</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-700">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">
              Final Score
            </p>
            <p className="text-5xl font-extrabold text-teal-400">
              {score} <span className="text-2xl text-slate-600">/ {totalQuestions}</span>
            </p>
          </div>

          {playerRank && (
            <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/30 rounded-xl p-4 mb-6 border border-amber-700">
              <p className="text-amber-300 font-bold text-lg">
                You ranked #{playerRank} out of {leaderboard.length} players
              </p>
            </div>
          )}

          <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 mb-8 text-left flex-grow">
            <h3 className="text-teal-400 font-bold mb-3 border-b border-slate-700 pb-2 uppercase tracking-wider text-sm">
              Top Navigators
            </h3>

            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {leaderboard.length === 0 ? (
                <li className="text-slate-500 italic text-center py-4">
                  No scores yet. Be the first.
                </li>
              ) : (
                leaderboard.map((entry, i) => (
                  <li
                    key={i}
                    className={`flex justify-between p-3 rounded-lg ${
                      entry.player_name === playerName && entry.score === score
                        ? 'bg-teal-900/40 text-teal-300 border border-teal-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">
                      {i + 1}. {entry.player_name}
                    </span>
                    <span className="font-bold">
                      {entry.score}{' '}
                      <span className="text-slate-500 text-sm">
                        / {entry.total_questions}
                      </span>
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <button
            onClick={handlePlayAgain}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-lg transition mt-auto"
          >
            Play Again
          </button>
        </div>

        <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
            What You Learned
          </h3>

          <div className="space-y-6 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
            {questions.map((q, index) => (
              <div
                key={index}
                className="bg-slate-900 p-5 rounded-xl border border-slate-700 shadow-inner"
              >
                <p className="text-sm text-amber-500 font-bold mb-2 tracking-wide uppercase">
                  Scenario {index + 1}
                </p>

                <p className="text-teal-400 text-sm font-bold mb-2">
                  Skill: {['Communication', 'Teamwork', 'Problem-Solving', 'Leadership', 'Critical Thinking', 'Decision-Making'][index] || 'Soft Skill'}
                </p>

                <p className="text-slate-300 text-sm italic mb-4">"{q.scenario}"</p>

                <div className="bg-slate-800 p-3 rounded border-l-4 border-teal-500">
                  <p className="text-teal-400 text-sm font-bold mb-1">The Lesson:</p>
                  <p className="text-slate-300 text-sm">
                    {q.feedback
                      .replace('Conflict Exploded! ', '')
                      .replace('DEAD END: ', '')
                      .replace('Quality Crash! ', '')
                      .replace('Ego Trap! ', '')
                      .replace('Opportunity Lost! ', '')
                      .replace('Wasted Effort! ', '')
                      .replace('Unprofessional! ', '')}
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