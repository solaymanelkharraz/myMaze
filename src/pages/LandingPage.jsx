import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({
  playerName,
  setPlayerName,
  questionsLoaded,
  loadingQuestions,
  questionsError,
  retryFetch,
  resetGame
}) {
  const navigate = useNavigate();

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 px-4 text-center py-10">
      <div className="max-w-4xl w-full bg-slate-800 p-10 rounded-2xl shadow-[0_0_50px_rgba(45,212,191,0.1)] border border-slate-700">
        <div className="mb-6 text-6xl animate-bounce">🧠</div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Soft Skills{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            Maze Challenge
          </span>
        </h1>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 mb-6 text-left">
          <h3 className="text-xl font-bold text-teal-400 mb-2">Story</h3>
          <p className="text-slate-300 leading-relaxed">
            You passed the paper maze. Now this is the digital maze.
            Each door is a real-life challenge based on soft skills like communication,
            teamwork, leadership, and problem-solving. Pass the doors, avoid dead ends,
            and prove that your decisions can take you to the exit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-amber-400 mb-3">How to Play</h3>
            <ul className="text-slate-300 space-y-2">
              <li>• Move with Arrow Keys or WASD</li>
              <li>• On mobile, use the touch controls</li>
              <li>• Reach locked doors and answer correctly</li>
              <li>• Wrong paths and bad decisions slow you down</li>
            </ul>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-teal-400 mb-3">Maze Legend</h3>
            <ul className="text-slate-300 space-y-2">
              <li>• 🔒 Question Door</li>
              <li>• ★ Exit</li>
              <li>• ❌ Dead End</li>
              <li>• Dark block = Wall</li>
              <li>• Arrow = You</li>
            </ul>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <input
            className="w-full p-4 rounded-lg bg-slate-900 border border-slate-600 text-white mb-4 text-center text-lg focus:outline-none focus:border-teal-400"
            type="text"
            placeholder="Enter your name to begin..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />

          {loadingQuestions && (
            <div className="mb-4 rounded-lg border border-blue-700 bg-blue-950/40 p-4 text-blue-300">
              Preparing the maze...
            </div>
          )}

          {questionsError && (
            <div className="mb-4 rounded-lg border border-red-700 bg-red-950/40 p-4 text-red-300">
              <p className="mb-3">{questionsError}</p>
              <button
                onClick={retryFetch}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-4 rounded-lg shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!playerName || !questionsLoaded || loadingQuestions || !!questionsError}
            onClick={() => navigate('/play')}
          >
            {loadingQuestions ? 'Preparing...' : 'Enter the Maze'}
          </button>

          <button
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 rounded-lg"
            onClick={() => navigate('/results')}
          >
            View Leaderboard & Lessons
          </button>
        </div>
      </div>
    </div>
  );
}