import { CEFRLevel, TestSession, TestAnswer, LevelTestResult } from '../types/cefr.js';

export class LevelTestService {
  private static readonly LEVEL_ORDER: CEFRLevel[] = [
    CEFRLevel.A1_1, CEFRLevel.A1_2, CEFRLevel.A1_3,
    CEFRLevel.A2_1, CEFRLevel.A2_2, CEFRLevel.A2_3,
    CEFRLevel.A3_1, CEFRLevel.A3_2, CEFRLevel.A3_3,
    CEFRLevel.B1_1, CEFRLevel.B1_2, CEFRLevel.B1_3,
    CEFRLevel.B2_1, CEFRLevel.B2_2, CEFRLevel.B2_3,
    CEFRLevel.C1_1, CEFRLevel.C1_2, CEFRLevel.C1_3,
    CEFRLevel.C2_1, CEFRLevel.C2_2, CEFRLevel.C2_3
  ];

  static getLevelIndex(level: CEFRLevel): number {
    return this.LEVEL_ORDER.indexOf(level);
  }

  static getNextLevel(currentLevel: CEFRLevel): CEFRLevel | null {
    const currentIndex = this.getLevelIndex(currentLevel);
    if (currentIndex === -1 || currentIndex >= this.LEVEL_ORDER.length - 1) {
      return null;
    }
    return this.LEVEL_ORDER[currentIndex + 1];
  }

  static getPreviousLevel(currentLevel: CEFRLevel): CEFRLevel | null {
    const currentIndex = this.getLevelIndex(currentLevel);
    if (currentIndex <= 0) {
      return null;
    }
    return this.LEVEL_ORDER[currentIndex - 1];
  }

  static isMaxLevel(level: CEFRLevel): boolean {
    return level === CEFRLevel.C2_3;
  }

  static processAnswer(
    session: TestSession,
    answer: TestAnswer
  ): {
    updatedSession: TestSession;
    shouldContinue: boolean;
    levelChanged: boolean;
    testCompleted: boolean;
  } {
    const updatedSession = { ...session };
    updatedSession.answers.push(answer);
    updatedSession.currentQuestion++;
    updatedSession.totalQuestions++;

    let levelChanged = false;
    let testCompleted = false;

    if (answer.isCorrect) {
      updatedSession.correctStreak++;
      updatedSession.incorrectStreak = 0;
      updatedSession.levelUpStreak++;

      // 정답 2연속 시 레벨업
      if (updatedSession.correctStreak >= 2) {
        const nextLevel = this.getNextLevel(updatedSession.currentLevel);
        if (nextLevel) {
          updatedSession.currentLevel = nextLevel;
          updatedSession.correctStreak = 0;
          levelChanged = true;

          // C2-3 레벨에서 2연속 정답 시 시험 종료
          if (this.isMaxLevel(updatedSession.currentLevel) && updatedSession.correctStreak >= 2) {
            testCompleted = true;
            updatedSession.finalLevel = updatedSession.currentLevel;
          }
        }
      }

      // 4연속 정답 시 레벨 2단계 상승
      if (updatedSession.levelUpStreak >= 4) {
        const currentIndex = this.getLevelIndex(updatedSession.currentLevel);
        const targetIndex = Math.min(currentIndex + 2, this.LEVEL_ORDER.length - 1);
        updatedSession.currentLevel = this.LEVEL_ORDER[targetIndex];
        updatedSession.levelUpStreak = 0;
        levelChanged = true;
      }
    } else {
      updatedSession.incorrectStreak++;
      updatedSession.correctStreak = 0;
      updatedSession.levelUpStreak = 0;

      // 오답 2연속 시 레벨 다운
      if (updatedSession.incorrectStreak >= 2) {
        const prevLevel = this.getPreviousLevel(updatedSession.currentLevel);
        if (prevLevel) {
          updatedSession.currentLevel = prevLevel;
          updatedSession.incorrectStreak = 0;
          levelChanged = true;
        }
      }

      // 오답 3연속 시 시험 종료
      if (updatedSession.incorrectStreak >= 3) {
        testCompleted = true;
        updatedSession.finalLevel = updatedSession.currentLevel;
      }
    }

    // 최대 문제 수(50문제) 도달 시 시험 종료
    if (updatedSession.totalQuestions >= updatedSession.maxQuestions) {
      testCompleted = true;
      updatedSession.finalLevel = updatedSession.currentLevel;
    }

    if (testCompleted) {
      updatedSession.isCompleted = true;
    }

    return {
      updatedSession,
      shouldContinue: !testCompleted,
      levelChanged,
      testCompleted
    };
  }

  static calculateResult(session: TestSession): LevelTestResult {
    const correctAnswers = session.answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / session.totalQuestions) * 100);

    // 레벨 진행 과정 추적
    const levelProgression: CEFRLevel[] = [session.currentLevel];
    // 실제 구현에서는 세션 중 레벨 변경 히스토리를 추적해야 함

    const testDuration = session.answers.reduce((total, answer) => total + answer.timeTaken, 0);

    return {
      finalLevel: session.finalLevel || session.currentLevel,
      score,
      totalQuestions: session.totalQuestions,
      correctAnswers,
      testDuration,
      levelProgression
    };
  }

  static createNewSession(userId: string, startLevel: CEFRLevel = CEFRLevel.A1_1): TestSession {
    return {
      id: `test_${Date.now()}_${userId}`,
      userId,
      currentLevel: startLevel,
      currentQuestion: 0,
      correctStreak: 0,
      incorrectStreak: 0,
      levelUpStreak: 0,
      totalQuestions: 0,
      maxQuestions: 50,
      answers: [],
      isCompleted: false
    };
  }
}