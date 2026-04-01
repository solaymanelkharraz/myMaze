import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import LandingPage from './pages/LandingPage';
import MazeGame from './pages/MazeGame';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setQuestionsError('');
      const res = await axios.get('https://backend-pink-seven-27.vercel.app/api/questions');
      setQuestions(res.data || []);
    } catch (err) {
      console.error(err);
      setQuestionsError('Could not load the maze questions. Please try again.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const resetGame = () => {
    setScore(0);
  };

  const fullReset = () => {
    setPlayerName('');
    setScore(0);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              playerName={playerName}
              setPlayerName={setPlayerName}
              questionsLoaded={questions.length > 0}
              loadingQuestions={loadingQuestions}
              questionsError={questionsError}
              retryFetch={fetchQuestions}
              resetGame={resetGame}
            />
          }
        />

        <Route
          path="/play"
          element={
            playerName ? (
              <MazeGame
                questions={questions}
                playerName={playerName}
                score={score}
                setScore={setScore}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/results"
          element={
            <ResultsPage
              score={score}
              totalQuestions={questions.length}
              playerName={playerName}
              questions={questions}
              resetGame={fullReset}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}