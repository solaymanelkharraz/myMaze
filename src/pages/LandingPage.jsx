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
    <div className="flex flex-col items-center justify-center min-h-screen pt-10 pb-20 px-4 text-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl w-full glass-panel p-8 md:p-12 rounded-3xl relative z-10 transition-all duration-500 hover:shadow-[0_0_80px_rgba(45,212,191,0.15)] flex flex-col items-center">
        
        {/* Added Logo Integration */}
        <div className="mb-6 animate-fade-in relative group">
          <div className="absolute inset-0 bg-teal-400/20 blur-xl rounded-full group-hover:bg-teal-400/40 transition-all duration-500"></div>
          <img 
            src="/logo.png" 
            alt="Soft Skills Maze Logo" 
            className="h-32 md:h-40 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(45,212,191,0.6)] group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <div style={{ display: 'none' }} className="text-7xl animate-bounce drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">🧠</div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight text-center">
          Soft Skills{' '}
          <span className="text-gradient">
            Maze Challenge
          </span>
        </h1>

        <div className="bg-slate-950/60 p-8 rounded-2xl border border-slate-700/50 mb-8 text-left shadow-inner">
          <h3 className="text-2xl font-bold text-teal-400 mb-3 flex items-center gap-2"><span className="text-2xl">📜</span> Story</h3>
          <p className="text-slate-300 leading-relaxed text-lg">
            You passed the paper maze. Now this is the digital maze.
            Each door is a real-life challenge based on soft skills like communication,
            teamwork, leadership, and problem-solving. Pass the doors, avoid <span className="text-red-400 font-bold">dead ends</span>,
            and prove that your decisions can take you to the exit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-slate-950/60 p-8 rounded-2xl border border-slate-700/50 shadow-inner group hover:border-amber-500/30 transition-colors">
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><span>🎮</span> Modern Mechanics</h3>
            <ul className="text-slate-300 space-y-3 text-sm md:text-base leading-relaxed hidden sm:block">
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5 font-bold">⚡</span> <span><strong>Speedrun Timer:</strong> The leaderboard ranks by time! Answer fast.</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5 font-bold">⏳</span> <span><strong>Penalties:</strong> Failing a door adds a brutal +15 seconds to your time!</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 font-bold">📜</span> <span><strong>Troll Traps:</strong> Avoid decoy dead-ends. They will aggressively question your worth.</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5 font-bold">🔄</span> <span><strong>Dynamic Runs:</strong> 6 random scenarios are drawn from a pool of 13 every run.</span></li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5 font-bold">📱</span> <span><strong>Controls:</strong> Swipe in any direction on mobile, or Arrow Keys/WASD on PC.</span></li>
            </ul>
            <ul className="text-slate-300 space-y-3 text-sm leading-relaxed sm:hidden">
              <li className="flex items-start gap-2"><span className="text-teal-400 mt-0.5 font-bold">⚡</span> <span><strong>Speed:</strong> Fastest time wins!</span></li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5 font-bold">⏳</span> <span><strong>Mistakes:</strong> +15s penalty.</span></li>
              <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5 font-bold">📜</span> <span><strong>Traps:</strong> Decoys will judge you.</span></li>
              <li className="flex items-start gap-2"><span className="text-cyan-400 mt-0.5 font-bold">📱</span> <span><strong>Input:</strong> Just swipe!</span></li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-8 rounded-2xl border border-slate-700/50 shadow-inner group hover:border-teal-500/30 transition-colors">
            <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2"><span>🗺️</span> Maze Legend</h3>
            <ul className="text-slate-300 space-y-3 text-lg">
              <li className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-gradient-to-b from-amber-500 to-amber-700 flex items-center justify-center text-[10px]">🔒</span> Question Door</li>
              <li className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-gradient-to-tr from-yellow-400 to-amber-300 flex items-center justify-center text-[10px] text-slate-900 font-bold">★</span> Exit</li>
              <li className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-red-900/60 border border-red-500/50 flex items-center justify-center text-[10px]">❌</span> Dead End</li>
              <li className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-slate-950 border border-slate-800/50 shadow-inner"></span> Wall</li>
              <li className="flex items-center gap-3"><span className="text-teal-400 font-bold text-xl drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]">▲</span> You</li>
            </ul>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative mb-6">
            <input
              className="w-full p-4 pl-12 rounded-xl bg-slate-950/80 border-2 border-slate-700 text-white text-center text-lg focus:outline-none focus:border-teal-400 focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all placeholder:text-slate-500"
              type="text"
              placeholder="Enter your name to begin..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">👤</span>
          </div>

          {loadingQuestions && (
            <div className="mb-6 rounded-xl border border-blue-500/50 bg-blue-950/40 p-5 text-blue-300 flex items-center justify-center gap-3">
              <span className="animate-spin text-xl">🌀</span> Preparing the maze...
            </div>
          )}

          {questionsError && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-950/40 p-5 text-red-300">
              <p className="mb-3 font-semibold">{questionsError}</p>
              <button
                onClick={retryFetch}
                className="bg-red-600/80 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-lg transition-colors border border-red-500"
              >
                Retry Connection
              </button>
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.3)] mb-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all text-xl"
            disabled={!playerName || !questionsLoaded || loadingQuestions || !!questionsError}
            onClick={() => navigate('/play')}
          >
            {loadingQuestions ? 'Preparing...' : 'Enter the Maze'}
          </button>

          <button
            className="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-all"
            onClick={() => navigate('/results')}
          >
            View Leaderboard & Lessons
          </button>
        </div>
      </div>
    </div>
  );
}