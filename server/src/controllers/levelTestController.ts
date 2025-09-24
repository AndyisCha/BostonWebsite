import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { LevelTestService } from '../services/levelTestService';
import { CEFRLevel, TestAnswer } from '../types/cefr';

const prisma = new PrismaClient();

export class LevelTestController {
  static async startTest(req: Request, res: Response) {
    try {
      const { userId, branchId, startLevel = CEFRLevel.A1_1 } = req.body;

      // 기존 진행 중인 테스트가 있는지 확인
      const existingTest = await prisma.levelTest.findFirst({
        where: {
          userId,
          isCompleted: false
        }
      });

      if (existingTest) {
        return res.status(400).json({
          error: 'Already have an active test session'
        });
      }

      // 새 테스트 세션 생성
      const testSession = await prisma.levelTest.create({
        data: {
          userId,
          branchId,
          startLevel,
          totalQuestions: 50
        }
      });

      // 첫 번째 문제 가져오기
      const firstQuestion = await prisma.question.findFirst({
        where: {
          level: startLevel,
          isActive: true
        }
      });

      res.json({
        testId: testSession.id,
        currentLevel: startLevel,
        question: firstQuestion,
        questionNumber: 1,
        totalQuestions: 50
      });

    } catch (error) {
      console.error('Error starting test:', error);
      res.status(500).json({ error: 'Failed to start test' });
    }
  }

  static async submitAnswer(req: Request, res: Response) {
    try {
      const { testId } = req.params;
      const { questionId, answer, timeTaken } = req.body;

      // 현재 테스트 세션 가져오기
      const test = await prisma.levelTest.findUnique({
        where: { id: testId },
        include: {
          answers: true
        }
      });

      if (!test || test.isCompleted) {
        return res.status(400).json({ error: 'Invalid or completed test' });
      }

      // 문제 정보 가져오기
      const question = await prisma.question.findUnique({
        where: { id: questionId }
      });

      if (!question) {
        return res.status(400).json({ error: 'Question not found' });
      }

      // 정답 확인
      const isCorrect = answer === question.correctAnswer;

      // 답안 저장
      await prisma.testAnswer.create({
        data: {
          testId,
          questionId,
          answer,
          isCorrect,
          timeTaken
        }
      });

      // 세션 데이터 구성
      const session = LevelTestService.createNewSession(test.userId, test.startLevel as CEFRLevel);
      session.id = testId;
      session.currentLevel = test.startLevel as CEFRLevel; // 실제로는 현재 레벨을 추적해야 함
      session.totalQuestions = test.answers.length;
      session.maxQuestions = test.totalQuestions;

      // 테스트 답안 처리
      const testAnswer: TestAnswer = {
        questionId,
        answer,
        isCorrect,
        timeTaken,
        answeredAt: new Date()
      };

      const result = LevelTestService.processAnswer(session, testAnswer);

      // 테스트 완료 처리
      if (result.testCompleted) {
        const finalResult = LevelTestService.calculateResult(result.updatedSession);

        await prisma.levelTest.update({
          where: { id: testId },
          data: {
            isCompleted: true,
            completedAt: new Date(),
            finalLevel: finalResult.finalLevel,
            score: finalResult.score,
            correctAnswers: finalResult.correctAnswers
          }
        });

        // 사용자 레벨 업데이트
        await prisma.user.update({
          where: { id: test.userId },
          data: {
            currentLevel: finalResult.finalLevel
          }
        });

        return res.json({
          testCompleted: true,
          result: finalResult
        });
      }

      // 다음 문제 가져오기
      const nextQuestion = await prisma.question.findFirst({
        where: {
          level: result.updatedSession.currentLevel,
          isActive: true,
          id: {
            notIn: result.updatedSession.answers.map(a => a.questionId)
          }
        }
      });

      res.json({
        testCompleted: false,
        currentLevel: result.updatedSession.currentLevel,
        levelChanged: result.levelChanged,
        question: nextQuestion,
        questionNumber: result.updatedSession.currentQuestion + 1,
        correctStreak: result.updatedSession.correctStreak,
        incorrectStreak: result.updatedSession.incorrectStreak
      });

    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  static async getTestResult(req: Request, res: Response) {
    try {
      const { testId } = req.params;

      const test = await prisma.levelTest.findUnique({
        where: { id: testId },
        include: {
          answers: {
            include: {
              question: true
            }
          },
          user: true
        }
      });

      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }

      res.json({
        testId: test.id,
        userId: test.userId,
        startLevel: test.startLevel,
        finalLevel: test.finalLevel,
        score: test.score,
        totalQuestions: test.totalQuestions,
        correctAnswers: test.correctAnswers,
        isCompleted: test.isCompleted,
        startedAt: test.startedAt,
        completedAt: test.completedAt,
        answers: test.answers
      });

    } catch (error) {
      console.error('Error getting test result:', error);
      res.status(500).json({ error: 'Failed to get test result' });
    }
  }

  static async getUserTestHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const tests = await prisma.levelTest.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        include: {
          branch: true
        }
      });

      res.json(tests);

    } catch (error) {
      console.error('Error getting test history:', error);
      res.status(500).json({ error: 'Failed to get test history' });
    }
  }
}