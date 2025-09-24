export enum CEFRLevel {
  A1_1 = 'A1_1',
  A1_2 = 'A1_2',
  A1_3 = 'A1_3',
  A2_1 = 'A2_1',
  A2_2 = 'A2_2',
  A2_3 = 'A2_3',
  A3_1 = 'A3_1',
  A3_2 = 'A3_2',
  A3_3 = 'A3_3',
  B1_1 = 'B1_1',
  B1_2 = 'B1_2',
  B1_3 = 'B1_3',
  B2_1 = 'B2_1',
  B2_2 = 'B2_2',
  B2_3 = 'B2_3',
  C1_1 = 'C1_1',
  C1_2 = 'C1_2',
  C1_3 = 'C1_3',
  C2_1 = 'C2_1',
  C2_2 = 'C2_2',
  C2_3 = 'C2_3'
}

export interface TestQuestion {
  id: string;
  content: string;
  type: 'reading' | 'listening';
  level: CEFRLevel;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface TestSession {
  id: string;
  userId: string;
  currentLevel: CEFRLevel;
  currentQuestion: number;
  correctStreak: number;
  incorrectStreak: number;
  levelUpStreak: number;
  totalQuestions: number;
  maxQuestions: number;
  answers: TestAnswer[];
  isCompleted: boolean;
  finalLevel?: CEFRLevel;
}

export interface TestAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeTaken: number;
  answeredAt: Date;
}

export interface LevelTestResult {
  finalLevel: CEFRLevel;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  testDuration: number;
  levelProgression: CEFRLevel[];
}