import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Paper, LinearProgress, Card, CardContent,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Fade, Slide, CircularProgress, Avatar, Stepper, Step, StepLabel,
  Alert, Snackbar, Zoom, Grow, Badge, Tooltip, Container, Collapse
} from '@mui/material';
import {
  Timer, CheckCircle, Cancel, Info, VolumeUp, Replay, PlayArrow,
  Pause, SkipNext, SkipPrevious, Assessment, TrendingUp, School,
  EmojiEvents, Speed, Lightbulb, Warning, Star, Psychology
} from '@mui/icons-material';
import '../styles/EnhancedLevelTestComponent.css';

interface Question {
  id: string;
  type: 'multiple_choice' | 'reading' | 'listening';
  level: string;
  question: string;
  passage?: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

interface TestResult {
  finalLevel: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  accuracy: number;
  levelProgress: {
    [key: string]: number;
  };
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
    difficulty: string;
  }>;
}

interface LevelTestComponentProps {
  userId: string;
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}

const LEVEL_INFO = {
  'A1': { name: 'Beginner', color: '#4caf50', description: '기초 단계' },
  'A2': { name: 'Elementary', color: '#8bc34a', description: '초급 단계' },
  'A3': { name: 'Pre-Intermediate', color: '#cddc39', description: '초중급 단계' },
  'B1': { name: 'Intermediate', color: '#ffeb3b', description: '중급 단계' },
  'B2': { name: 'Upper-Intermediate', color: '#ffc107', description: '중상급 단계' },
  'C1': { name: 'Advanced', color: '#ff9800', description: '고급 단계' },
  'C2': { name: 'Proficient', color: '#f44336', description: '숙련 단계' }
};

export const EnhancedLevelTestComponent: React.FC<LevelTestComponentProps> = ({
  userId,
  onComplete,
  onCancel
}) => {
  // Core states
  const [phase, setPhase] = useState<'intro' | 'testing' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Array<any>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Timer states
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testStartTime] = useState(Date.now());

  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef] = useState<HTMLAudioElement | null>(null);

  // Animation states
  const [questionTransition, setQuestionTransition] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' as any });

  // Level tracking
  const [currentLevel, setCurrentLevel] = useState('A1');
  const [levelProgress, setLevelProgress] = useState<{[key: string]: number}>({});
  const [confidenceLevel, setConfidenceLevel] = useState(0);

  // Refs
  const timerRef = useRef<NodeJS.Timeout>();
  const questionTimerRef = useRef<NodeJS.Timeout>();

  // Initialize test
  useEffect(() => {
    if (phase === 'testing') {
      startTest();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [phase]);

  // Question timer
  useEffect(() => {
    if (phase === 'testing' && !isAnswerSubmitted) {
      setQuestionTime(0);
      questionTimerRef.current = setInterval(() => {
        setQuestionTime(prev => prev + 1);
      }, 1000);

      return () => {
        if (questionTimerRef.current) {
          clearInterval(questionTimerRef.current);
        }
      };
    }
  }, [currentQuestion, phase, isAnswerSubmitted]);

  // Global timer
  useEffect(() => {
    if (phase === 'testing') {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase]);

  const startTest = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/level-test/questions?userId=${userId}`);

      let questionsData;
      if (response.ok) {
        const data = await response.json();
        questionsData = data.questions;
      } else {
        questionsData = generateSampleQuestions();
      }

      setQuestions(questionsData);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions(generateSampleQuestions());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const generateSampleQuestions = (): Question[] => {
    return [
      {
        id: '1',
        type: 'multiple_choice',
        level: 'A1',
        question: 'What is your name?',
        options: ['My name is John', 'I am fine', 'Yes, please', 'Thank you'],
        correctAnswer: 'My name is John',
        explanation: '이름을 묻는 질문에는 "My name is..."로 답합니다.',
        difficulty: 'easy',
        timeLimit: 30
      },
      {
        id: '2',
        type: 'reading',
        level: 'A2',
        question: 'What time does the store close?',
        passage: 'Store Hours: Monday - Friday: 9:00 AM - 8:00 PM, Saturday - Sunday: 10:00 AM - 6:00 PM',
        options: ['6:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'],
        correctAnswer: '8:00 PM',
        explanation: '평일 운영시간을 확인하면 8:00 PM까지입니다.',
        difficulty: 'medium',
        timeLimit: 45
      },
      {
        id: '3',
        type: 'multiple_choice',
        level: 'B1',
        question: 'If I _____ more time, I would learn Spanish.',
        options: ['have', 'had', 'will have', 'would have'],
        correctAnswer: 'had',
        explanation: '가정법 과거에서는 "If + 주어 + 과거형"을 사용합니다.',
        difficulty: 'medium',
        timeLimit: 40
      },
      {
        id: '4',
        type: 'reading',
        level: 'B2',
        question: 'What is the author\'s main argument?',
        passage: 'Climate change represents one of the most significant challenges of our time. While technological solutions are important, behavioral changes at the individual level are equally crucial for addressing this global issue.',
        options: [
          'Technology is the only solution',
          'Individual behavior changes are not important',
          'Both technology and behavioral changes are needed',
          'Climate change is not a real problem'
        ],
        correctAnswer: 'Both technology and behavioral changes are needed',
        explanation: '저자는 기술적 해결책과 개인의 행동 변화 모두가 중요하다고 주장합니다.',
        difficulty: 'hard',
        timeLimit: 60
      },
      {
        id: '5',
        type: 'multiple_choice',
        level: 'C1',
        question: 'The research findings were _____ with previous studies.',
        options: ['consistent', 'consisted', 'consisting', 'consistency'],
        correctAnswer: 'consistent',
        explanation: '"consistent with"는 "~와 일치하는"이라는 의미입니다.',
        difficulty: 'hard',
        timeLimit: 35
      }
    ];
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = useCallback(() => {
    if (!selectedAnswer || isAnswerSubmitted) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    const timeForQuestion = questionTime;

    // Update answers
    const newAnswer = {
      questionId: currentQ.id,
      answer: selectedAnswer,
      isCorrect,
      timeSpent: timeForQuestion,
      difficulty: currentQ.difficulty
    };

    setAnswers(prev => [...prev, newAnswer]);
    setIsAnswerSubmitted(true);

    // Update level progress
    const level = currentQ.level.substring(0, 2);
    setLevelProgress(prev => ({
      ...prev,
      [level]: (prev[level] || 0) + (isCorrect ? 1 : 0)
    }));

    // Update confidence level
    if (isCorrect) {
      setConfidenceLevel(prev => Math.min(100, prev + 10));
      showNotification('정답입니다! 🎉', 'success');
    } else {
      setConfidenceLevel(prev => Math.max(0, prev - 5));
      showNotification('틀렸습니다. 다음 문제에서 화이팅! 💪', 'error');
    }

    // Show explanation briefly
    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);

  }, [selectedAnswer, isAnswerSubmitted, questions, currentQuestion, questionTime]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setQuestionTransition(false);

      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer('');
        setIsAnswerSubmitted(false);
        setShowExplanation(false);
        setQuestionStartTime(Date.now());
        setQuestionTransition(true);
      }, 300);
    } else {
      finishTest();
    }
  }, [currentQuestion, questions.length]);

  const finishTest = useCallback(() => {
    const totalTime = timeSpent;
    const correctCount = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctCount / questions.length) * 100;

    // Calculate final level
    let finalLevel = 'A1';
    const levels = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2'];

    for (const level of levels) {
      const levelQuestions = answers.filter(a => questions.find(q => q.id === a.questionId)?.level.startsWith(level));
      const levelCorrect = levelQuestions.filter(a => a.isCorrect).length;
      const levelAccuracy = levelQuestions.length > 0 ? (levelCorrect / levelQuestions.length) * 100 : 0;

      if (levelAccuracy >= 70) {
        finalLevel = level;
      } else {
        break;
      }
    }

    const result: TestResult = {
      finalLevel,
      score: Math.round(accuracy),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpent: totalTime,
      accuracy,
      levelProgress,
      answers
    };

    if (accuracy >= 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setPhase('results');

    // Save result to backend
    saveTestResult(result);

    setTimeout(() => {
      onComplete(result);
    }, 500);
  }, [timeSpent, answers, questions, levelProgress, onComplete]);

  const saveTestResult = async (result: TestResult) => {
    try {
      await fetch('/api/level-test/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...result })
      });
    } catch (error) {
      console.error('Error saving test result:', error);
    }
  };

  const playAudio = () => {
    if (audioRef && questions[currentQuestion]?.audioUrl) {
      if (isPlaying) {
        audioRef.pause();
        setIsPlaying(false);
      } else {
        audioRef.play();
        setIsPlaying(true);
      }
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestion];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const currentLevelInfo = LEVEL_INFO[currentLevel as keyof typeof LEVEL_INFO] || LEVEL_INFO.A1;

  if (loading) {
    return (
      <Box className="level-test-loading">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          레벨 테스트를 준비하고 있습니다...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="enhanced-level-test">
      {/* Intro Phase */}
      {phase === 'intro' && (
        <Fade in timeout={800}>
          <Card className="test-intro-card">
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Zoom in timeout={1000}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto 24px',
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)'
                  }}
                >
                  <Psychology sx={{ fontSize: 50 }} />
                </Avatar>
              </Zoom>

              <Typography variant="h3" gutterBottom className="gradient-text">
                영어 레벨 테스트
              </Typography>

              <Typography variant="h6" color="text.secondary" gutterBottom>
                당신의 영어 실력을 정확히 측정해보세요
              </Typography>

              <Box sx={{ my: 4 }}>
                <Chip
                  icon={<Timer />}
                  label="약 10-15분 소요"
                  color="primary"
                  sx={{ mx: 1, mb: 2 }}
                />
                <Chip
                  icon={<Assessment />}
                  label="5-7개 문제"
                  color="secondary"
                  sx={{ mx: 1, mb: 2 }}
                />
                <Chip
                  icon={<School />}
                  label="CEFR 기준"
                  color="info"
                  sx={{ mx: 1, mb: 2 }}
                />
              </Box>

              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                  테스트 안내사항
                </Typography>
                <Typography variant="body2">
                  • 각 문제는 시간 제한이 있습니다<br/>
                  • 문제를 건너뛸 수 없습니다<br/>
                  • 정확한 결과를 위해 집중해서 응답해주세요<br/>
                  • 듣기 문제는 재생 버튼을 눌러 들을 수 있습니다
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={onCancel}
                  startIcon={<Cancel />}
                >
                  취소
                </Button>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => setPhase('testing')}
                  startIcon={<PlayArrow />}
                  className="start-test-btn"
                >
                  테스트 시작
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Testing Phase */}
      {phase === 'testing' && currentQ && (
        <Box className="test-container">
          {/* Header with progress */}
          <Paper className="test-header" elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={<Timer />}
                  label={formatTime(timeSpent)}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<Speed />}
                  label={`문제 ${currentQuestion + 1}/${questions.length}`}
                  color="secondary"
                />
                <Chip
                  label={currentLevelInfo.name}
                  sx={{
                    background: currentLevelInfo.color,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>

              <IconButton onClick={onCancel} color="error">
                <Cancel />
              </IconButton>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${currentLevelInfo.color}, #42a5f5)`,
                  borderRadius: 4
                }
              }}
            />

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                신뢰도: {confidenceLevel}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={confidenceLevel}
                sx={{ flex: 1, height: 4, borderRadius: 2 }}
              />
            </Box>
          </Paper>

          {/* Question Card */}
          <Slide direction="left" in={questionTransition} timeout={500}>
            <Card className="question-card" elevation={3}>
              <CardContent sx={{ p: 4 }}>
                {/* Question Type Badge */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    icon={
                      currentQ.type === 'listening' ? <VolumeUp /> :
                      currentQ.type === 'reading' ? <Info /> : <Psychology />
                    }
                    label={
                      currentQ.type === 'listening' ? '듣기' :
                      currentQ.type === 'reading' ? '독해' : '문법'
                    }
                    color={
                      currentQ.type === 'listening' ? 'success' :
                      currentQ.type === 'reading' ? 'info' : 'warning'
                    }
                  />

                  <Chip
                    icon={<Timer />}
                    label={`${Math.max(0, currentQ.timeLimit - questionTime)}초`}
                    color={questionTime > currentQ.timeLimit * 0.8 ? 'error' : 'default'}
                  />
                </Box>

                {/* Audio Player for Listening Questions */}
                {currentQ.type === 'listening' && currentQ.audioUrl && (
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <IconButton
                      onClick={playAudio}
                      size="medium"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      {isPlaying ? <Pause /> : <PlayArrow />}
                    </IconButton>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      오디오를 들은 후 문제를 풀어주세요
                    </Typography>
                  </Box>
                )}

                {/* Reading Passage */}
                {currentQ.type === 'reading' && currentQ.passage && (
                  <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {currentQ.passage}
                    </Typography>
                  </Paper>
                )}

                {/* Question */}
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  {currentQ.question}
                </Typography>

                {/* Answer Options */}
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedAnswer}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                  >
                    {currentQ.options.map((option, index) => (
                      <Grow in timeout={800 + index * 200} key={index}>
                        <FormControlLabel
                          value={option}
                          control={<Radio />}
                          label={option}
                          disabled={isAnswerSubmitted}
                          sx={{
                            mb: 1,
                            p: 2,
                            border: '2px solid transparent',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.04)',
                              borderColor: '#1976d2'
                            },
                            ...(selectedAnswer === option && {
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              borderColor: '#1976d2'
                            }),
                            ...(isAnswerSubmitted && selectedAnswer === option && {
                              bgcolor: selectedAnswer === currentQ.correctAnswer ?
                                'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                              borderColor: selectedAnswer === currentQ.correctAnswer ?
                                '#4caf50' : '#f44336'
                            })
                          }}
                        />
                      </Grow>
                    ))}
                  </RadioGroup>
                </FormControl>

                {/* Explanation */}
                <Collapse in={showExplanation}>
                  <Alert
                    severity={selectedAnswer === currentQ.correctAnswer ? 'success' : 'error'}
                    sx={{ mt: 3 }}
                    icon={
                      selectedAnswer === currentQ.correctAnswer ?
                        <CheckCircle /> : <Warning />
                    }
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedAnswer === currentQ.correctAnswer ? '정답입니다!' : '오답입니다'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>정답:</strong> {currentQ.correctAnswer}
                    </Typography>
                    {currentQ.explanation && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>해설:</strong> {currentQ.explanation}
                      </Typography>
                    )}
                  </Alert>
                </Collapse>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={isAnswerSubmitted}
                  >
                    테스트 종료
                  </Button>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {!isAnswerSubmitted ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                        startIcon={<CheckCircle />}
                        size="medium"
                      >
                        답안 제출
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                        startIcon={
                          currentQuestion < questions.length - 1 ? <SkipNext /> : <EmojiEvents />
                        }
                        size="medium"
                        className="next-question-btn"
                      >
                        {currentQuestion < questions.length - 1 ? '다음 문제' : '결과 확인'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Box>
      )}

      {/* Results Phase */}
      {phase === 'results' && (
        <Fade in timeout={1000}>
          <Card className="results-card">
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Zoom in timeout={1000}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 24px',
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)'
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 60 }} />
                </Avatar>
              </Zoom>

              <Typography variant="h3" gutterBottom className="gradient-text">
                테스트 완료!
              </Typography>

              <Typography variant="h6" color="text.secondary" gutterBottom>
                수고하셨습니다. 결과를 확인해보세요.
              </Typography>

              <Box sx={{ my: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Chip
                  icon={<Star />}
                  label={`최종 레벨: ${answers.length > 0 ? 'B1' : 'A1'}`}
                  color="primary"
                  size="medium"
                />
                <Chip
                  icon={<Assessment />}
                  label={`정답률: ${answers.length > 0 ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100) : 0}%`}
                  color="success"
                  size="medium"
                />
                <Chip
                  icon={<Timer />}
                  label={`소요시간: ${formatTime(timeSpent)}`}
                  color="info"
                  size="medium"
                />
              </Box>

              <Button
                variant="contained"
                size="medium"
                onClick={() => onComplete({
                  finalLevel: 'B1',
                  score: answers.length > 0 ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100) : 0,
                  totalQuestions: questions.length,
                  correctAnswers: answers.filter(a => a.isCorrect).length,
                  timeSpent,
                  accuracy: answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) * 100 : 0,
                  levelProgress,
                  answers
                })}
                startIcon={<TrendingUp />}
                className="complete-btn"
              >
                결과 확인하기
              </Button>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Audio element */}
      {currentQ?.audioUrl && (
        <audio
          ref={(ref) => {
            if (ref) {
              ref.onended = () => setIsPlaying(false);
              ref.onplay = () => setIsPlaying(true);
              ref.onpause = () => setIsPlaying(false);
            }
          }}
          src={currentQ.audioUrl}
          preload="metadata"
        />
      )}
    </Container>
  );
};