import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Question from '../components/Question';

// TILE TYPES
// 0 = path
// 1 = wall
// 2 = door
// 3 = exit
// 4 = dead end
const initialMaze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
  [1,1,1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,0,1,1,1,1,1,1,4,1,0,0,0,0,0,0,0,1,1,1,1,0,1],
  [1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,0,0,0,0,1,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,1,1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,0,1,1,1,0,0,1,4,1,1,1,1,1,1,1,0,0,0,0,1,0,1],
  [1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,1],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1],
  [1,1,0,0,0,0,0,0,1,1,1,1,1,1,4,1,1,1,1,1,1,0,1,1,1],
  [1,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],
  [1,0,1,0,0,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
  [1,0,0,0,1,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,0,1,0,1,0,1,1,4,1,1,1,1,1,4,1,0,0,0,0,0,0,1],
  [1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const initialPlayerPos = { x: 23, y: 23 };

const getSkillForQuestion = (scenario) => {
  if (!scenario) return 'Soft Skill';
  const text = scenario.toLowerCase();
  
  if (text.includes('burnout') || text.includes('overwhelm') || text.includes('stress') || text.includes('panic')) return 'Emotional Intelligence';
  if (text.includes('deadline') || text.includes('late') || text.includes('time') || text.includes('priorit')) return 'Time Management';
  if (text.includes('client') || text.includes('customer') || text.includes('stakeholder')) return 'Client Relations';
  if (text.includes('team') || text.includes('coworker') || text.includes('colleague') || text.includes('conflict') || text.includes('gossip') || text.includes('credit')) return 'Conflict Resolution';
  if (text.includes('mistake') || text.includes('feedback') || text.includes('fail') || text.includes('bug')) return 'Accountability';
  if (text.includes('change') || text.includes('adapt') || text.includes('new') || text.includes('pivot')) return 'Adaptability';
  if (text.includes('boss') || text.includes('manager') || text.includes('lead')) return 'Professionalism';
  
  return 'Critical Thinking';
};

// Each chamber door has:
// - door position
// - return point before question
// - wrong dead end position
const doorConfigs = [
  { questionIndex: 0, door: { x: 19, y: 23 }, returnPoint: { x: 20, y: 23 }, deadEnd: { x: 16, y: 21 } },
  { questionIndex: 1, door: { x: 7,  y: 19 }, returnPoint: { x: 8,  y: 19 }, deadEnd: { x: 10, y: 21 } },
  { questionIndex: 2, door: { x: 17, y: 15 }, returnPoint: { x: 18, y: 15 }, deadEnd: { x: 14, y: 17 } },
  { questionIndex: 3, door: { x: 7,  y: 11 }, returnPoint: { x: 8,  y: 11 }, deadEnd: { x: 10, y: 13 } },
  { questionIndex: 4, door: { x: 17, y: 7  }, returnPoint: { x: 18, y: 7  }, deadEnd: { x: 14, y: 9  } },
  { questionIndex: 5, door: { x: 7,  y: 3  }, returnPoint: { x: 8,  y: 3  }, deadEnd: { x: 10, y: 5  } }
];

const posKey = (x, y) => `${x},${y}`;

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'move') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
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
  } catch (err) {
    console.warn('Audio contextualized blocked until user interaction.');
  }
};

export default function MazeGame({ questions, playerName, score, setScore, timeTaken, setTimeTaken }) {
  const navigate = useNavigate();

  const [maze] = useState(initialMaze);
  const [playerPos, setPlayerPos] = useState(initialPlayerPos);
  const [playerDir, setPlayerDir] = useState(-90);
  const [isShaking, setIsShaking] = useState(false);

  const [visitedTiles, setVisitedTiles] = useState([posKey(initialPlayerPos.x, initialPlayerPos.y)]);
  const [playerTrail, setPlayerTrail] = useState([]);

  const [modalState, setModalState] = useState(null);
  const [pendingDoorIndex, setPendingDoorIndex] = useState(null);
  const [activeWrongPath, setActiveWrongPath] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [fragmentName, setFragmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fragments, setFragments] = useState([]);
  const [doorStates, setDoorStates] = useState({});
  const [returnPoint, setReturnPoint] = useState(null);
  
  // Troll Trap State
  const [trollTrapTriggered, setTrollTrapTriggered] = useState(false);
  const [trollInput, setTrollInput] = useState('');
  const [touchStart, setTouchStart] = useState(null);

  // Speedrun Timer effect
  useEffect(() => {
    if (modalState === null || modalState === 'wrongPath') {
      const timerId = setInterval(() => {
        setTimeTaken(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [modalState, setTimeTaken]);

  const calculateDimensions = () => {
    let availableWidth = window.innerWidth - 90; // account for paddings
    
    let calcCellSize = Math.floor((availableWidth - 24) / 25);
    calcCellSize = Math.max(6, Math.min(calcCellSize, 20));
    
    let calcGap = calcCellSize >= 15 ? 2 : 1;
    
    return {
      cellSize: calcCellSize,
      gapSize: calcGap
    };
  };

  const [dimensions, setDimensions] = useState(calculateDimensions);

  useEffect(() => {
    const handleResize = () => setDimensions(calculateDimensions());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { cellSize, gapSize } = dimensions;
  const step = cellSize + gapSize;
  const playerSize = cellSize * 0.8;
  const playerOffset = (cellSize - playerSize) / 2;

  const totalDoors = questions.length || 0;
  const progressPercent = totalDoors > 0 ? Math.min((score / totalDoors) * 100, 100) : 0;

  const getTop = (y) => 8 + y * step + playerOffset;
  const getLeft = (x) => 8 + x * step + playerOffset;

  const doorIndexByPosition = useMemo(() => {
    const map = new Map();
    doorConfigs.forEach((config, index) => {
      map.set(posKey(config.door.x, config.door.y), index);
    });
    return map;
  }, []);

  const wrongDeadEndByPosition = useMemo(() => {
    const map = new Map();
    doorConfigs.forEach((config, index) => {
      map.set(posKey(config.deadEnd.x, config.deadEnd.y), index);
    });
    return map;
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const addTrailAndVisit = useCallback((fromPos, toPos, dir) => {
    setPlayerTrail((prev) => [{ x: fromPos.x, y: fromPos.y, dir }, ...prev].slice(0, 3));
    setVisitedTiles((prev) => {
      const key = posKey(toPos.x, toPos.y);
      return prev.includes(key) ? prev : [...prev, key];
    });
  }, []);

  const submitScoreAndFinish = useCallback(
    async (finalScore) => {
      try {
        setIsSubmitting(true);
        await axios.post('https://backend-pink-seven-27.vercel.app/api/scores', {
          player_name: playerName,
          score: finalScore,
          total_questions: totalDoors,
          time_taken: timeTaken
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
        navigate('/results');
      }
    },
    [navigate, playerName, totalDoors, timeTaken]
  );

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
      const targetKey = posKey(targetX, targetY);

      if (targetTile === 1) {
        let surrounds = 0;
        if (playerPos.y > 0 && initialMaze[playerPos.y - 1][playerPos.x] === 1) surrounds++;
        if (playerPos.y < maze.length - 1 && initialMaze[playerPos.y + 1][playerPos.x] === 1) surrounds++;
        if (playerPos.x > 0 && initialMaze[playerPos.y][playerPos.x - 1] === 1) surrounds++;
        if (playerPos.x < maze[0].length - 1 && initialMaze[playerPos.y][playerPos.x + 1] === 1) surrounds++;
        
        // Player is at a 3-walled cell (dead end) and trying to walk into the 3rd wall
        if (surrounds === 3 && !(playerPos.x === 23 && playerPos.y === 23) && !trollTrapTriggered) {
          setTrollTrapTriggered(true);
          setModalState('trollTrap');
          return;
        }

        playSound('wall');
        triggerShake();
        return;
      }

      if (targetTile === 4) {
        const deadEndIndex = wrongDeadEndByPosition.get(targetKey);

        if (
          deadEndIndex !== undefined &&
          activeWrongPath !== null &&
          deadEndIndex === activeWrongPath &&
          questions[deadEndIndex]
        ) {
          playSound('error');
          triggerShake();

          const skill = getSkillForQuestion(questions[deadEndIndex].scenario);
          const fragment = `${skill} Fragment`;

          setLessonTitle(skill);
          setFragmentName(fragment);
          setFeedbackMsg(
            questions[deadEndIndex].feedback ||
              `Because of weak skill, the low road failed.`
          );

          setFragments((prev) => (prev.includes(fragment) ? prev : [...prev, fragment]));
          setModalState('fragment');
          return;
        }

        playSound('error');
        triggerShake();
        setLessonTitle('Dead End');
        setFragmentName('');
        setFeedbackMsg('This path is blocked. Go back and find a better route.');
        setModalState('wrongPath');
        return;
      }

      if (targetTile === 2) {
        const doorIndex = doorIndexByPosition.get(targetKey);

        if (doorIndex === undefined || !questions[doorIndex]) {
          setLessonTitle('System Notice');
          setFragmentName('');
          setFeedbackMsg('This door has no connected question.');
          setModalState('wrongPath');
          return;
        }

        if (activeWrongPath !== null) {
          playSound('error');
          triggerShake();
          setLessonTitle('A Mysterious Force');
          setFragmentName('');
          setFeedbackMsg('Your previous wrong decision is weighing you down. You must discover the dead end of your mistake before continuing forward.');
          setModalState('wrongPath');
          return;
        }

        if (doorStates[doorIndex] === 'completed') {
          playSound('move');
          addTrailAndVisit(playerPos, { x: targetX, y: targetY }, newDir);
          setPlayerPos({ x: targetX, y: targetY });
          return;
        }

        playSound('move');
        setPendingDoorIndex(doorIndex);
        setReturnPoint(doorConfigs[doorIndex].returnPoint);
        setModalState('question');
        return;
      }

      if (targetTile === 3) {
        if (activeWrongPath !== null) {
          playSound('error');
          triggerShake();
          setLessonTitle('Exit Blocked');
          setFragmentName('');
          setFeedbackMsg('You cannot leave this maze until you learn from your final mistake. Find the dead end.');
          setModalState('wrongPath');
          return;
        }

        playSound('success');
        setModalState('finished');
        submitScoreAndFinish(score);
        return;
      }

      playSound('move');
      addTrailAndVisit(playerPos, { x: targetX, y: targetY }, newDir);
      setPlayerPos({ x: targetX, y: targetY });
    },
    [
      modalState,
      maze,
      playerPos,
      playerDir,
      wrongDeadEndByPosition,
      activeWrongPath,
      questions,
      doorIndexByPosition,
      doorStates,
      addTrailAndVisit,
      submitScoreAndFinish,
      score
    ]
  );

  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key.toLowerCase();

      // Prevent scrolling the page while playing!
      if (['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'].includes(key)) {
        e.preventDefault();
      }

      if (key === 'arrowup' || key === 'w') movePlayer('up');
      else if (key === 'arrowdown' || key === 's') movePlayer('down');
      else if (key === 'arrowleft' || key === 'a') movePlayer('left');
      else if (key === 'arrowright' || key === 'd') movePlayer('right');
    },
    [movePlayer]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAnswer = (selectedOption) => {
    if (pendingDoorIndex === null) return;

    const q = questions[pendingDoorIndex];
    const doorConfig = doorConfigs[pendingDoorIndex];
    if (!q || !doorConfig) return;

    const skill = getSkillForQuestion(q.scenario);

    if (selectedOption === q.correct_answer) {
      playSound('success');
      setScore((s) => s + 1);
      setDoorStates((prev) => ({ ...prev, [pendingDoorIndex]: 'completed' }));

      addTrailAndVisit(playerPos, doorConfig.door, playerDir);
      setPlayerPos({ x: doorConfig.door.x, y: doorConfig.door.y });

      setActiveWrongPath(null);

      setLessonTitle(skill);
      setFragmentName('');
      setFeedbackMsg(
        fragments.includes(`${skill} Fragment`)
          ? `You learned from the mistake. The high road is now clear.`
          : `Good instinct. You chose the high road and moved forward efficiently.`
      );

      setPendingDoorIndex(null);
      setModalState('successPath');
      return;
    } else {
      playSound('error');
      setDoorStates((prev) => ({ ...prev, [pendingDoorIndex]: 'wrong-path' }));
      setActiveWrongPath(pendingDoorIndex);
      // Speedrun Penalty for wrong door!
      setTimeTaken(prev => prev + 15);
    }

    // Let player pass the door and explore the low road
    addTrailAndVisit(playerPos, doorConfig.door, playerDir);
    setPlayerPos({ x: doorConfig.door.x, y: doorConfig.door.y });

    setPendingDoorIndex(null);
    setModalState(null);
  };

  const handleReturnFromFragment = () => {
    if (!returnPoint || activeWrongPath === null) {
      setModalState(null);
      return;
    }

    playSound('success');
    addTrailAndVisit(playerPos, returnPoint, playerDir);
    setPlayerPos({ x: returnPoint.x, y: returnPoint.y });

    const retryDoor = activeWrongPath;
    setActiveWrongPath(null);
    setPendingDoorIndex(retryDoor);
    setModalState('question');
  };

  const handleTouchStart = (e) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchEnd = (e) => {
    if (!touchStart || modalState) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStart.x;
    const dy = endY - touchStart.y;
    
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return; // ignore taps

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) movePlayer(1, 0, 90);
      else movePlayer(-1, 0, -90);
    } else {
      if (dy > 0) movePlayer(0, 1, 180);
      else movePlayer(0, -1, 0);
    }
    setTouchStart(null);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="text-center mb-6 z-10 glass-panel px-8 py-4 rounded-2xl flex items-center justify-between w-full max-w-[536px]">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 tracking-tight">
            Level {score}
          </h1>
          <p className="text-slate-400 font-medium">Navigating as <span className="text-white">{playerName}</span></p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-amber-400 font-mono tracking-widest bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
            ⏱ {formatTime(timeTaken)}
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl relative z-10 glass-panel rounded-3xl p-3 sm:p-6 md:p-10 mb-20 animate-fade-in mx-auto">
        <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
          <div className="flex flex-col">
            <div className="w-full flex flex-wrap justify-between gap-3 text-slate-400 mb-4 font-bold tracking-widest uppercase text-xs sm:text-sm">
              <span>
                Player: <span className="text-teal-400">{playerName}</span>
              </span>
              <span>
                Score: <span className="text-teal-400">{score}</span> / {totalDoors || 6}
              </span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-3 mb-5 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="overflow-auto pb-4 custom-scrollbar flex justify-center">
              <div
                className={`relative bg-slate-900 p-2 rounded-xl border transition-colors duration-100 ${
                  isShaking ? 'border-red-500 animate-shake' : 'border-slate-800'
                }`}
              >
                <div
                  className="grid"
                  style={{ gap: `${gapSize}px`, gridTemplateColumns: `repeat(${maze[0].length}, ${cellSize}px)` }}
                >
                  {maze.map((row, y) =>
                    row.map((cell, x) => {
                      const dist = Math.max(
                        Math.abs(playerPos.x - x),
                        Math.abs(playerPos.y - y)
                      );

                      // 3x3 visibility
                      const isVisible = dist <= 1;
                      const hasVisited = visitedTiles.includes(posKey(x, y));

                      if (!isVisible && !hasVisited) {
                        return (
                          <div
                            key={`${x}-${y}`}
                            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                            className="rounded-sm bg-black"
                          />
                        );
                      }

                      let bgColor = 'bg-slate-800/80';
                      let opacityClass = isVisible ? 'opacity-100 shadow-[inset_0_0_8px_rgba(45,212,191,0.05)]' : 'opacity-30 blur-[1px]';

                      if (cell === 1) bgColor = 'bg-slate-950 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] border border-slate-800/50';
                      if (cell === 2) bgColor = 'bg-gradient-to-b from-amber-500 to-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.3)] border-b-2 border-amber-900';
                      if (cell === 3) bgColor = 'bg-gradient-to-tr from-yellow-400 to-amber-300 animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.6)]';
                      if (cell === 4) bgColor = 'bg-red-900/60 border border-red-500/50 shadow-[inset_0_0_15px_rgba(239,68,68,0.3)]';

                      return (
                        <div
                          key={`${x}-${y}`}
                          style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                          className={`rounded overflow-hidden flex items-center justify-center transition-all duration-300 ${bgColor} ${opacityClass}`}
                        >
                          {cell === 2 && <span className="text-white font-black drop-shadow-md" style={{ fontSize: `${cellSize * 0.5}px` }}>🔒</span>}
                          {cell === 3 && <span className="text-slate-900 font-extrabold drop-shadow-sm" style={{ fontSize: `${cellSize * 0.6}px` }}>★</span>}
                          {cell === 4 && isVisible && <span className="text-red-400 font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" style={{ fontSize: `${cellSize * 0.5}px` }}>❌</span>}
                        </div>
                      );
                    })
                  )}
                </div>

                {playerTrail.map((trail, index) => (
                  <div
                    key={`${trail.x}-${trail.y}-${index}`}
                    className="absolute flex items-center justify-center transition-all duration-100 z-0 text-teal-500"
                    style={{
                      top: `${getTop(trail.y)}px`,
                      left: `${getLeft(trail.x)}px`,
                      width: `${playerSize}px`,
                      height: `${playerSize}px`,
                      transform: `rotate(${trail.dir}deg)`,
                      opacity: index === 0 ? 0.25 : index === 1 ? 0.12 : 0.05
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                      <path d="M12 2L20 20L12 17L4 20L12 2Z" fill="currentColor" />
                    </svg>
                  </div>
                ))}

                <div
                  className="absolute flex items-center justify-center transition-all duration-200 ease-out z-10"
                  style={{
                    top: `${getTop(playerPos.y)}px`,
                    left: `${getLeft(playerPos.x)}px`,
                    width: `${playerSize}px`,
                    height: `${playerSize}px`,
                    transform: `rotate(${playerDir}deg)`,
                    filter: 'drop-shadow(0px 0px 16px rgba(45,212,191,1))'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-teal-300">
                    <path d="M12 2L20 20L12 17L4 20L12 2Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto mt-6 lg:hidden">
              <div />
              <button onClick={() => movePlayer('up')} className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold py-4 text-2xl rounded-xl border border-slate-700 shadow-md">↑</button>
              <div />
              <button onClick={() => movePlayer('left')} className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold py-4 text-2xl rounded-xl border border-slate-700 shadow-md">←</button>
              <button onClick={() => movePlayer('down')} className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold py-4 text-2xl rounded-xl border border-slate-700 shadow-md">↓</button>
              <button onClick={() => movePlayer('right')} className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold py-4 text-2xl rounded-xl border border-slate-700 shadow-md">→</button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl hidden lg:block">
            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-sm border-b border-slate-800 pb-4">
              Maze Status
            </h3>

            <div className="space-y-4 text-slate-400 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-lg text-amber-500">🔒</span>
                <span>Door Chamber</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg text-yellow-400">★</span>
                <span>Exit</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg text-red-500">❌</span>
                <span>Low Road Dead End</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg text-teal-400">▲</span>
                <span>You</span>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
              <p className="text-teal-400 font-bold mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="text-xl">✨</span> Fragments Earned
              </p>
              {fragments.length === 0 ? (
                <p className="text-slate-500 text-xs leading-relaxed italic">
                  Explore the low roads and learn from mistakes to collect fragments.
                </p>
              ) : (
                <ul className="space-y-3 test-sm text-slate-300">
                  {fragments.map((fragment) => (
                    <li key={fragment} className="bg-slate-900/80 rounded-lg px-4 py-3 border border-slate-700 shadow flex items-center gap-2 transition hover:border-teal-500 hover:shadow-[0_0_10px_rgba(45,212,191,0.2)]">
                      <span className="text-teal-400">⚡</span> {fragment}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalState && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 fixed">
          {modalState === 'question' && pendingDoorIndex !== null && questions[pendingDoorIndex] && (
            <Question 
              question={questions[pendingDoorIndex]} 
              skillName={getSkillForQuestion(questions[pendingDoorIndex].scenario)} 
              chamberIndex={pendingDoorIndex} 
              handleAnswer={handleAnswer} 
            />
          )}

          {modalState === 'trollTrap' && (
            <div className="bg-slate-950 p-8 rounded-3xl max-w-xl border-y-4 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center w-full">
              <div className="text-5xl mb-4 animate-bounce">📜</div>
              <h2 className="text-2xl font-black text-amber-500 uppercase tracking-widest mb-4">
                A Mysterious Whisper
              </h2>
              <p className="text-slate-300 text-xl leading-relaxed italic mb-8">
                "Do you really think taking these dark corners can get you anywhere? What made you wander off the true path?"
              </p>
              
              <textarea 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white resize-none h-32 focus:border-amber-500 focus:outline-none mb-6 shadow-inner"
                placeholder="Explain your logic..."
                value={trollInput}
                onChange={(e) => setTrollInput(e.target.value)}
              ></textarea>

              <button
                className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-lg"
                onClick={() => {
                  playSound('error');
                  setModalState('wrongPath');
                  setLessonTitle('Unworthy');
                  setFeedbackMsg('You still lack the full soft skills to proceed. You are not worthy of this path. Turn back.');
                  setFragmentName('');
                }}
                disabled={trollInput.trim().length === 0}
              >
                Submit Answer
              </button>
            </div>
          )}

          {modalState === 'wrongPath' && (
            <div className="bg-slate-900 p-10 rounded-2xl max-w-md text-center border border-red-500 shadow-2xl w-full">
              <div className="text-6xl mb-4">🧱</div>
              <h2 className="text-3xl font-bold mb-4 text-red-400">Dead End</h2>
              <p className="text-amber-400 font-bold text-lg mb-3">{lessonTitle}</p>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">{feedbackMsg}</p>
              <button
                className="w-full bg-red-900/50 hover:bg-red-600 border border-red-500 text-white font-bold py-3 rounded-lg transition-colors"
                onClick={() => setModalState(null)}
              >
                Go Back
              </button>
            </div>
          )}

          {modalState === 'fragment' && (
            <div className="bg-slate-900 p-10 rounded-2xl max-w-md text-center border border-teal-500 shadow-2xl w-full">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold mb-4 text-teal-400">Skill Fragment Earned</h2>
              <p className="text-amber-400 font-bold text-lg mb-3">{fragmentName}</p>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">{feedbackMsg}</p>
              <button
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-3 rounded-lg"
                onClick={handleReturnFromFragment}
              >
                Echo Back to Door
              </button>
            </div>
          )}

          {modalState === 'successPath' && (
            <div className="bg-slate-900 p-10 rounded-2xl max-w-md text-center border border-teal-500 shadow-2xl w-full">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold mb-4 text-teal-400">High Road Opened</h2>
              <p className="text-amber-400 font-bold text-lg mb-3">{lessonTitle}</p>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">{feedbackMsg}</p>
              <button
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-3 rounded-lg"
                onClick={() => setModalState(null)}
              >
                Continue
              </button>
            </div>
          )}

          {modalState === 'finished' && (
            <div className="bg-slate-900 p-10 rounded-2xl max-w-md text-center border border-teal-500 shadow-2xl w-full">
              <div className="text-6xl mb-4 animate-bounce">🏁</div>
              <h2 className="text-3xl font-bold mb-4 text-teal-400">Maze Completed</h2>
              <p className="text-slate-300 text-lg">
                {isSubmitting ? 'Saving your score...' : 'Opening results...'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}