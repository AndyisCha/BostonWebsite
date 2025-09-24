import React, { useState } from 'react';
import '../../styles/LoginForm.css';

export const LoginFormPreview: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      if (formData.email === 'test@example.com' && formData.password === 'password') {
        alert('로그인 성공!');
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo-section">
          <div className="logo">B</div>
          <h2 className="welcome-text">환영합니다</h2>
          <p className="subtitle">보스턴 아카데미에 로그인하세요</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
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
            required
          />
          <div className="input-icon">📧</div>
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
            required
          />
          <div className="input-icon">🔒</div>
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
          <a href="#" className="forgot-password">비밀번호를 잊으셨나요?</a>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading && <div className="loading-spinner" />}
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        <div className="social-login">
          <div className="divider">
            <span>또는</span>
          </div>
          <div className="social-buttons">
            <button type="button" className="social-button google">
              G
            </button>
            <button type="button" className="social-button facebook">
              f
            </button>
            <button type="button" className="social-button apple">
              🍎
            </button>
          </div>
        </div>

        <div className="register-link">
          계정이 없으신가요? <a href="#">회원가입</a>
        </div>

        <div style={{ marginTop: '20px', padding: '12px', background: '#e3f2fd', borderRadius: '8px', fontSize: '0.85rem' }}>
          <strong>테스트 계정:</strong><br/>
          이메일: test@example.com<br/>
          비밀번호: password
        </div>
      </form>
    </div>
  );
};