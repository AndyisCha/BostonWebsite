import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginForm.css';

interface LoginFormData {
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  rememberMe: boolean;
}

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'student',
    rememberMe: false
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 에러 클리어
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // 로그인 에러 클리어
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      // 실제 로그인 API 호출
      const success = await login(formData.email, formData.password);

      if (success !== undefined && success !== null) {
        // 로그인 성공 시 대시보드로 이동
        navigate('/dashboard');
      } else {
        setLoginError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      setLoginError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    console.log(`${provider} 소셜 로그인 시도`);
    // 실제 소셜 로그인 구현
  };

  const handleForgotPassword = () => {
    // 비밀번호 찾기 기능
    console.log('비밀번호 찾기');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-section">
          <div className="logo">B</div>
          <h2 className="welcome-text">환영합니다</h2>
          <p className="subtitle">보스턴 아카데미에 로그인하세요</p>
        </div>

        {loginError && (
          <div className="error-message">
            ⚠️ {loginError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            autoComplete="email"
          />
          <div className="input-icon">📧</div>
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            autoComplete="current-password"
          />
          <div className="input-icon">🔒</div>
          {errors.password && <div className="field-error">{errors.password}</div>}
        </div>

        <div className="role-selector">
          <label>역할 선택</label>
          <div className="role-options">
            <div className="role-option">
              <input
                type="radio"
                id="student"
                name="role"
                value="student"
                checked={formData.role === 'student'}
                onChange={handleInputChange}
              />
              <label htmlFor="student" className="role-label">학생</label>
            </div>
            <div className="role-option">
              <input
                type="radio"
                id="teacher"
                name="role"
                value="teacher"
                checked={formData.role === 'teacher'}
                onChange={handleInputChange}
              />
              <label htmlFor="teacher" className="role-label">교사</label>
            </div>
            <div className="role-option">
              <input
                type="radio"
                id="admin"
                name="role"
                value="admin"
                checked={formData.role === 'admin'}
                onChange={handleInputChange}
              />
              <label htmlFor="admin" className="role-label">관리자</label>
            </div>
          </div>
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <label htmlFor="rememberMe">로그인 상태 유지</label>
          </div>
          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={isLoading}
        >
          {isLoading && <div className="loading-spinner" />}
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        <div className="social-login">
          <div className="divider">
            <span>또는</span>
          </div>
          <div className="social-buttons">
            <button
              type="button"
              className="social-button google"
              onClick={() => handleSocialLogin('google')}
            >
              G
            </button>
            <button
              type="button"
              className="social-button facebook"
              onClick={() => handleSocialLogin('facebook')}
            >
              f
            </button>
            <button
              type="button"
              className="social-button apple"
              onClick={() => handleSocialLogin('apple')}
            >
              🍎
            </button>
          </div>
        </div>

        <div className="register-link">
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </div>

        {/* 개발용 테스트 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#e3f2fd',
            borderRadius: '8px',
            fontSize: '0.85rem',
            border: '1px solid #bbdefb'
          }}>
            <strong>개발 테스트 계정:</strong><br/>
            <div style={{ marginTop: '8px' }}>
              <strong>학생:</strong> student@test.com / password123<br/>
              <strong>교사:</strong> teacher@test.com / password123<br/>
              <strong>관리자:</strong> admin@test.com / password123
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;