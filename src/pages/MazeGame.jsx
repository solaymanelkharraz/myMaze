import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const initialMaze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 2, 0, 1, 4, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 4, 0, 1, 0, 2, 0, 0, 1, 0, 1],
  [1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 2, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 2, 1, 4, 1, 0, 2, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const initialPlayerPos = { x: 9, y: 9 };

const skillNames = [
  'Communication',
  'Teamwork',
  'Problem-Solving',
  'Leadership',
  'Critical Thinking',
  'Decision-Making'
];

const playSound = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'move') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'wall') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'error') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
};

export default function MazeGame({ questions, playerName, score, setScore }) {
  const navigate = useNavigate();

  const [maze, setMaze] = useState(initialMaze);
  const [playerPos, setPlayerPos] = useState(initialPlayerPos);
  const [playerDir, setPlayerDir] = useState(-90);
  const [isShaking, setIsShaking] = useState(false);

  const [modalState, setModalState] = useState(null);
  const [currentDoorIndex, setCurrentDoorIndex] = useState(0);
  const [pendingPos, setPendingPos] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const submitScoreAndFinish = async () => {
    try {
      setIsSubmitting(true);
      await axios.post('https://backend-pink-seven-27.vercel.app/api/scores', {
        player_name: playerName,
        score,
        total_questions: questions.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      navigate('/results');
    }
  };

  const movePlayer = useCallback(
    (direction) => {
      if (modalState || !maze.length) return;

      let { x, y } = playerPos;
      let targetX = x;
      let targetY = y;
      let newDir = playerDir;

      if (direction === 'up') {
        targetY -= 1;
        newDir = 0;
      } else if (direction === 'down') {
        targetY += 1;
        newDir = 180;
      } else if (direction === 'left') {
        targetX -= 1;
        newDir = -90;
      } else if (direction === 'right') {
        targetX += 1;
        newDir = 90;
      } else {
        return;
      }

      setPlayerDir(newDir);

      if (!maze[targetY] || maze[targetY][targetX] === undefined) return;

      const targetTile = maze[targetY][targetX];

      if (targetTile === 1) {
        playSound('wall');
        triggerShake();
        return;
      }

      if (targetTile === 4) {
        playSound('error');
        triggerShake();
        setModalState('wrongPath');
        return;
      }

      if (targetTile === 2) {
        playSound('move');
        setPendingPos({ x: targetX, y: targetY });
        setModalState('question');
        return;
      }

      if (targetTile === 3) {
        playSound('success');
        setModalState('finished');
        submitScoreAndFinish();
        return;
      }

      playSound('move');
      setPlayerPos({ x: targetX, y: targetY });
    },
    [maze, modalState, playerPos, playerDir, playerName, score, questions.length]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') movePlayer('up');
      else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') movePlayer('down');
      else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') movePlayer('left');
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') movePlayer('right');
    },
    [movePlayer]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAnswer = (selectedOption) => {
    const q = questions[currentDoorIndex];
    if (!q) return;

    if (selectedOption === q.correct_answer) {
      playSound('success');

      const newMaze = maze.map((row) => [...row]);
      newMaze[pendingPos.y][pendingPos.x] = 0;

      setMaze(newMaze);
      setPlayerPos(pendingPos);
      setScore((s) => s + 1);
      setIsCorrect(true);
      setLessonTitle(skillNames[currentDoorIndex] || 'Soft Skill');
      setFeedbackMsg(q.feedback || 'Good decision. You earned the lesson and cleared the path.');
    } else {
      playSound('error');
      setIsCorrect(false);
      setLessonTitle(skillNames[currentDoorIndex] || 'Soft Skill');
      setFeedbackMsg(q.feedback || 'That choice created a problem. Try again with a better decision.');
    }

    setCurrentDoorIndex((i) => i + 1);
    setModalState('feedback');
  };

  const playerTop = 12 + playerPos.y * 44;
  const playerLeft = 12 + playerPos.x * 44;
  const totalDoors = questions.length || 6;
  const progressPercent = Math.min((score / totalDoors) * 100, 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 py-10 overflow-hidden px-4">
      <div className="w-full max-w-5xl">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            The Digital Maze
          </h2>
          <p className="text-slate-300 leading-relaxed">
            You passed the paper maze. Now you must pass the digital one.
            Each locked door tests a real-life soft skill. Choose well, avoid dead ends,
            and prove you can reach the exit through smart decisions.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div>
            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-slate-400 mb-4 font-bold tracking-widest uppercase">
              <span>
                Player: <span className="text-teal-400">{playerName}</span>
              </span>
              <span>
                Score: <span className="text-teal-400">{score}</span> / {totalDoors}
              </span>
              <span>
                Door: <span className="text-amber-400">{Math.min(currentDoorIndex + 1, totalDoors)}</span> / {totalDoors}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-4 mb-6 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div
              className={`relative bg-slate-800 p-2 rounded-xl shadow-2xl border transition-colors duration-100 ${
                isShaking ? 'border-red-500 animate-shake' : 'border-slate-700'
              }`}
            >
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${maze[0].length}, 40px)` }}
              >
                {maze.map((row, y) =>
                  row.map((cell, x) => {
                    let bgColor = 'bg-slate-700/50';
                    if (cell === 1) bgColor = 'bg-slate-900 shadow-inner';
                    if (cell === 2) bgColor = 'bg-amber-600 border-b-4 border-amber-800';
                    if (cell === 3) bgColor = 'bg-yellow-400 animate-pulse';
                    if (cell === 4) bgColor = 'bg-red-900/30 border border-red-900/50';

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`w-10 h-10 rounded-sm flex items-center justify-center ${bgColor}`}
                      >
                        {cell === 2 && <span className="text-white text-xs font-bold">🔒</span>}
                        {cell === 3 && <span className="text-slate-900 font-bold">★</span>}
                        {cell === 4 && <span className="text-red-500/20 text-xs font-bold">❌</span>}
                      </div>
                    );
                  })
                )}
              </div>

              <div
                className="absolute w-8 h-8 flex items-center justify-center transition-all duration-150 ease-out z-10 drop-shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                style={{
                  top: `${playerTop}px`,
                  left: `${playerLeft}px`,
                  transform: `rotate(${playerDir}deg)`
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-teal-400">
                  <path d="M12 2L20 20L12 17L4 20L12 2Z" fill="currentColor" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mt-6 md:hidden">
              <div />
              <button
                onClick={() => movePlayer('up')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
              >
                ↑
              </button>
              <div />
              <button
                onClick={() => movePlayer('left')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
              >
                ←
              </button>
              <button
                onClick={() => movePlayer('down')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
              >
                ↓
              </button>
              <button
                onClick={() => movePlayer('right')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
              >
                →
              </button>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Maze Legend</h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <span>Question Door</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">★</span>
                <span>Exit</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">❌</span>
                <span>Dead End</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700" />
                <span>Wall</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-teal-400 text-xl">▲</span>
                <span>Player</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-lg font-bold text-teal-400 mb-2">Tip</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Good soft skills are like good navigation. You do not win by rushing.
                You win by choosing the right path.
              </p>
            </div>
          </div>
        </div>
      </div>

      {modalState && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 z-50 fixed">
          {modalState === 'wrongPath' && (
            <div className="bg-slate-800 p-10 rounded-2xl max-w-md text-center border border-red-500 shadow-2xl w-full">
              <div className="text-6xl mb-4">🧱</div>
              <h2 className="text-3xl font-bold mb-4 text-red-400">Dead End</h2>
              <p className="text-slate-300 mb-8 text-lg">
                You rushed into the wrong path. Step back and think before moving again.
              </p>
              <button
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-lg"
                onClick={() => setModalState(null)}
              >
                Go Back
              </button>
            </div>
          )}

          {modalState === 'question' && questions[currentDoorIndex] && (
            <div className="bg-slate-800 p-8 rounded-2xl max-w-2xl border border-teal-500 shadow-2xl w-full">
              <h2 className="text-amber-500 font-bold uppercase tracking-widest mb-4">
                🔒 Door {currentDoorIndex + 1}
              </h2>
              <p className="text-sm text-teal-400 font-bold mb-3">
                Skill Focus: {skillNames[currentDoorIndex] || 'Soft Skill'}
              </p>
              <p className="text-xl text-white mb-8 leading-relaxed font-medium">
                {questions[currentDoorIndex].scenario}
              </p>

              <div className="flex flex-col gap-4">
                <button
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-left p-5 rounded-xl text-white transition"
                  onClick={() => handleAnswer('A')}
                >
                  A) {questions[currentDoorIndex].option_a}
                </button>
                <button
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-left p-5 rounded-xl text-white transition"
                  onClick={() => handleAnswer('B')}
                >
                  B) {questions[currentDoorIndex].option_b}
                </button>
              </div>
            </div>
          )}

          {modalState === 'feedback' && (
            <div className="bg-slate-800 p-10 rounded-2xl max-w-md text-center border border-slate-700 shadow-2xl w-full">
              <div className="text-6xl mb-4">{isCorrect ? '🎓' : '❌'}</div>

              <h2 className={`text-3xl font-bold mb-3 ${isCorrect ? 'text-teal-400' : 'text-red-400'}`}>
                {isCorrect ? 'Lesson Earned' : 'Door Jammed'}
              </h2>

              <p className="text-amber-400 font-bold text-lg mb-3">{lessonTitle}</p>

              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                {feedbackMsg}
              </p>

              <button
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-3 rounded-lg"
                onClick={() => setModalState(null)}
              >
                {isCorrect ? 'Continue Forward' : 'Step Back'}
              </button>
            </div>
          )}

          {modalState === 'finished' && (
            <div className="bg-slate-800 p-10 rounded-2xl max-w-md text-center border border-teal-500 shadow-2xl w-full">
              <div className="text-6xl mb-4">🏁</div>
              <h2 className="text-3xl font-bold mb-4 text-teal-400">Maze Completed</h2>
              <p className="text-slate-300 text-lg">
                {isSubmitting ? 'Saving your score and opening the results...' : 'Opening results...'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}