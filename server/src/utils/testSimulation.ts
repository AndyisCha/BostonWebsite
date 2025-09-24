import { LevelTestService } from '../services/levelTestService';
import { CEFRLevel, TestSession, TestAnswer } from '../types/cefr';

export class TestSimulation {
  static runSimulation(pattern: 'correct' | 'incorrect', simulationId: number): void {
    console.log(`\n=== 시뮬레이션 ${simulationId} 시작 ===`);

    // 새 테스트 세션 생성 (A1_1부터 시작)
    let session = LevelTestService.createNewSession('sim_user', CEFRLevel.A1_1);
    console.log(`시작 레벨: ${session.currentLevel}`);

    let questionNum = 1;
    let patternCounter = 0; // 2개 맞추고 1개 틀리는 패턴 추적

    while (questionNum <= 50 && !session.isCompleted) {
      // 패턴: 2개 맞추고 1개 틀리기
      const shouldBeCorrect = patternCounter < 2;
      patternCounter = (patternCounter + 1) % 3;

      const answer: TestAnswer = {
        questionId: `q_${questionNum}`,
        answer: shouldBeCorrect ? 'correct' : 'wrong',
        isCorrect: shouldBeCorrect,
        timeTaken: Math.floor(Math.random() * 30) + 10, // 10-40초
        answeredAt: new Date()
      };

      const result = LevelTestService.processAnswer(session, answer);
      session = result.updatedSession;

      console.log(`문제 ${questionNum}: ${answer.isCorrect ? '정답' : '오답'} | 레벨: ${session.currentLevel} | 정답연속: ${session.correctStreak} | 오답연속: ${session.incorrectStreak}${result.levelChanged ? ' [레벨변경]' : ''}${result.testCompleted ? ' [시험종료]' : ''}`);

      if (result.testCompleted) {
        console.log(`\n*** 시험 종료 ***`);
        console.log(`최종 레벨: ${session.finalLevel}`);
        console.log(`총 문제 수: ${session.totalQuestions}`);
        console.log(`정답 수: ${session.answers.filter(a => a.isCorrect).length}`);
        console.log(`정답률: ${Math.round((session.answers.filter(a => a.isCorrect).length / session.totalQuestions) * 100)}%`);
        break;
      }

      questionNum++;
    }

    if (!session.isCompleted && questionNum > 50) {
      console.log(`\n*** 50문제 완료로 시험 종료 ***`);
      console.log(`최종 레벨: ${session.currentLevel}`);
      console.log(`총 문제 수: ${session.totalQuestions}`);
      console.log(`정답 수: ${session.answers.filter(a => a.isCorrect).length}`);
      console.log(`정답률: ${Math.round((session.answers.filter(a => a.isCorrect).length / session.totalQuestions) * 100)}%`);
    }
  }

  static runMultipleSimulations(count: number = 10): void {
    console.log(`CEFR 레벨 테스트 시뮬레이션 - ${count}회 실행`);
    console.log(`패턴: 2개 정답 → 1개 오답 반복`);
    console.log(`알고리즘: 정답 2연속시 레벨업, 오답 2연속시 레벨다운, 오답 3연속시 종료, 정답 4연속시 레벨 2단계 상승`);

    for (let i = 1; i <= count; i++) {
      this.runSimulation('correct', i);
    }

    console.log(`\n=== 전체 시뮬레이션 완료 ===`);
  }
}