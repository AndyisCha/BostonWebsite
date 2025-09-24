import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Paper, LinearProgress, Card, CardContent,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Fade, Slide, CircularProgress, Avatar, Stepper, Step, StepLabel,
  Alert, Snackbar, Zoom, Grow, Badge, Tooltip
} from '@mui/material';
import {
  Timer, CheckCircle, Cancel, Info, VolumeUp, Replay, PlayArrow,
  Pause, SkipNext, SkipPrevious, Assessment, TrendingUp, School,
  EmojiEvents, Speed, Lightbulb, Warning
} from '@mui/icons-material';
import '../styles/LevelTestComponent.css';

interface Question {
  id: string;
  type: 'multiple_choice' | 'reading' | 'listening';
  level: string;
  question: string;
  passage?: string; // 독해 지문
  audioUrl?: string; // 듣기 음성 파일
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface LevelTestComponentProps {
  userId: string;
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}

interface TestResult {
  finalLevel: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

export const LevelTestComponent: React.FC<LevelTestComponentProps> = ({
  userId,
  onComplete,
  onCancel
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [currentLevel, setCurrentLevel] = useState('A1_1');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, [userId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/level-test/questions?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to load questions');

      const data = await response.json();
      setQuestions(data.questions || getSampleQuestions());
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions(getSampleQuestions());
    } finally {
      setLoading(false);
    }
  };

  const getSampleQuestions = (): Question[] => [
    {
      id: '1',
      type: 'multiple_choice',
      level: 'A1_1',
      question: "Choose the correct greeting:",
      options: ["Hello, how are you?", "Goodbye", "Thank you", "Sorry"],
      correctAnswer: "Hello, how are you?",
      explanation: "This is a basic greeting used when meeting someone."
    },
    {
      id: '2',
      type: 'reading',
      level: 'A1_2',
      question: "According to the passage, what time does the store open?",
      passage: "Welcome to our store! We are open from 9:00 AM to 8:00 PM, Monday through Saturday. On Sundays, we open at 11:00 AM and close at 6:00 PM.",
      options: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"],
      correctAnswer: "9:00 AM",
      explanation: "The passage states the store opens at 9:00 AM on weekdays and Saturdays."
    },
    {
      id: '3',
      type: 'listening',
      level: 'A2_1',
      question: "What is the speaker's favorite hobby?",
      audioUrl: "/audio/sample-question.mp3",
      options: ["Reading", "Swimming", "Cooking", "Drawing"],
      correctAnswer: "Reading",
      explanation: "The speaker mentioned that reading is their favorite pastime."
    }
  ];

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000);

    const newAnswer = {
      questionId: currentQ.id,
      answer: selectedAnswer,
      isCorrect,
      timeSpent: questionTime
    };

    setAnswers(prev => [...prev, newAnswer]);
    setIsAnswerSubmitted(true);

    // Show explanation if available
    if (currentQ.explanation) {
      setShowExplanation(true);
    } else {
      setTimeout(() => moveToNextQuestion(), 1500);
    }
  };

  const moveToNextQuestion = () => {
    setShowExplanation(false);
    setIsAnswerSubmitted(false);
    setSelectedAnswer('');
    setQuestionStartTime(Date.now());

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = () => {
    const correctCount = answers.filter(a => a.isCorrect).length +
                        (selectedAnswer === questions[currentQuestion]?.correctAnswer ? 1 : 0);
    const totalTime = Math.floor((Date.now() - testStartTime) / 1000);
    const score = Math.round((correctCount / questions.length) * 100);

    // Calculate final level based on score
    let finalLevel = 'A1_1';
    if (score >= 90) finalLevel = 'C2_1';
    else if (score >= 80) finalLevel = 'C1_1';
    else if (score >= 70) finalLevel = 'B2_1';
    else if (score >= 60) finalLevel = 'B1_1';
    else if (score >= 50) finalLevel = 'A3_1';
    else if (score >= 40) finalLevel = 'A2_1';

    const result: TestResult = {
      finalLevel,
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpent: totalTime,
      answers
    };

    setShowResult(true);
    saveTestResult(result);
  };

  const saveTestResult = async (result: TestResult) => {
    try {
      await fetch('/api/level-test/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...result })
      });
    } catch (error) {
      console.error('Error saving test result:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => console.error('Error playing audio:', error));
  };

  if (loading) {
    return (
      <div className="level-test-container">
        <div className="loading-state">
          <Typography variant="h5">레벨 테스트를 준비하고 있습니다...</Typography>
        </div>
      </div>
    );
  }

  if (showResult) {
    const result = {
      finalLevel: currentLevel,
      score: Math.round((answers.filter(a => a.isCorrect).length / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers: answers.filter(a => a.isCorrect).length,
      timeSpent: Math.floor((Date.now() - testStartTime) / 1000)
    };

    return (
      <div className="level-test-container">
        <div className="test-result">
          <Typography variant="h4" className="result-title">
            테스트 완료!
          </Typography>

          <div className="level-indicator">
            <Chip
              label={`최종 레벨: ${result.finalLevel.replace('_', '-')}`}
              size="large"
              className={`level-chip level-${result.finalLevel.toLowerCase()}`}
            />
          </div>

          <div className="result-stats">
            <div className="stat-item">
              <Typography variant="h6">{result.score}점</Typography>
              <Typography variant="body2">총점</Typography>
            </div>
            <div className="stat-item">
              <Typography variant="h6">{result.correctAnswers}/{result.totalQuestions}</Typography>
              <Typography variant="body2">정답률</Typography>
            </div>
            <div className="stat-item">
              <Typography variant="h6">{formatTime(result.timeSpent)}</Typography>
              <Typography variant="body2">소요시간</Typography>
            </div>
          </div>

          <div className="result-actions">
            <Button
              variant="contained"
              size="large"
              onClick={() => onComplete(result as TestResult)}
            >
              결과 확인
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="level-test-container">
      <div className="test-header">
        <div className="test-info">
          <Typography variant="h5">CEFR 레벨 테스트</Typography>
          <div className="test-meta">
            <Chip
              icon={<Timer />}
              label={formatTime(timeSpent)}
              variant="outlined"
            />
            <Chip
              label={`${currentQuestion + 1}/${questions.length}`}
              variant="outlined"
            />
          </div>
        </div>
        <Button
          variant="text"
          onClick={onCancel}
          startIcon={<Cancel />}
        >
          테스트 종료
        </Button>
      </div>

      <div className="test-progress">
        <LinearProgress
          variant="determinate"
          value={progress}
          className="progress-bar"
        />
      </div>

      <div className="question-area">
        <Paper className="question-card" elevation={2}>
          <div className="question-header">
            <Chip
              label={currentQ.type === 'reading' ? '독해' : currentQ.type === 'listening' ? '듣기' : '문법'}
              size="small"
              className="question-type-chip"
            />
            <Chip
              label={currentQ.level.replace('_', '-')}
              size="small"
              className={`level-chip level-${currentQ.level.toLowerCase()}`}
            />
          </div>

          {currentQ.passage && (
            <div className="passage-area">
              <Typography variant="body1" className="passage-text">
                {currentQ.passage}
              </Typography>
            </div>
          )}

          {currentQ.audioUrl && (
            <div className="audio-area">
              <Button
                startIcon={<VolumeUp />}
                onClick={() => playAudio(currentQ.audioUrl!)}
                variant="outlined"
                className="audio-button"
              >
                음성 듣기
              </Button>
              <IconButton onClick={() => playAudio(currentQ.audioUrl!)}>
                <Replay />
              </IconButton>
            </div>
          )}

          <div className="question-text">
            <Typography variant="h6">{currentQ.question}</Typography>
          </div>

          <div className="options-container">
            <FormControl component="fieldset" disabled={isAnswerSubmitted}>
              <RadioGroup
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
              >
                {currentQ.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    className={`option-item ${
                      isAnswerSubmitted
                        ? option === currentQ.correctAnswer
                          ? 'correct'
                          : option === selectedAnswer
                            ? 'incorrect'
                            : ''
                        : ''
                    }`}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </div>

          <div className="question-actions">
            {!isAnswerSubmitted ? (
              <Button
                variant="contained"
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
                size="large"
              >
                답안 제출
              </Button>
            ) : (
              <div className="answer-feedback">
                {selectedAnswer === currentQ.correctAnswer ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="정답!"
                    color="success"
                    className="feedback-chip"
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="틀렸습니다"
                    color="error"
                    className="feedback-chip"
                  />
                )}

                {!showExplanation && (
                  <Button
                    variant="contained"
                    onClick={moveToNextQuestion}
                    size="large"
                  >
                    다음 문제
                  </Button>
                )}
              </div>
            )}
          </div>
        </Paper>
      </div>

      {/* Explanation Dialog */}
      <Dialog open={showExplanation} onClose={() => setShowExplanation(false)}>
        <DialogTitle>
          <Info sx={{ mr: 1 }} />
          문제 해설
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {currentQ.explanation}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={moveToNextQuestion} variant="contained">
            다음 문제로
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};