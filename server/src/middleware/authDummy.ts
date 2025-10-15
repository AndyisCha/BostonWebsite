import { Request, Response, NextFunction } from 'express';

/**
 * 더미 인증 미들웨어 (개발/테스트용)
 *
 * 실제 프로덕션에서는 JWT 토큰을 검증하고 Supabase Auth를 사용해야 합니다.
 * 이 미들웨어는 테스트 목적으로만 사용하세요.
 *
 * 사용법:
 * import { authenticateDummy } from './middleware/authDummy';
 * router.post('/uploads/sign', authenticateDummy, createSignedUploadUrl);
 */

export const authenticateDummy = (req: Request, res: Response, next: NextFunction) => {
  // 헤더에서 사용자 ID 가져오기 (테스트용)
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    // 기본 테스트 사용자 ID 사용
    (req as any).user = {
      id: 'test-user-123',
      email: 'test@example.com'
    };
    console.log('⚠️ [AUTH DUMMY] 기본 테스트 사용자 사용: test-user-123');
  } else {
    (req as any).user = {
      id: userId,
      email: `${userId}@example.com`
    };
    console.log(`✅ [AUTH DUMMY] 사용자 인증됨: ${userId}`);
  }

  next();
};

/**
 * 실제 JWT 인증 미들웨어 (프로덕션용 - 참고)
 *
 * 실제로는 이런 방식으로 구현해야 합니다:
 */
/*
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    // JWT 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Supabase에서 사용자 확인
    const { data: user, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    // req에 사용자 정보 추가
    (req as any).user = {
      id: user.user.id,
      email: user.user.email
    };

    next();
  } catch (error) {
    console.error('인증 에러:', error);
    return res.status(401).json({ error: '인증 실패' });
  }
};
*/
