import React, { useState } from 'react';
import '../../styles/RegistrationForm.css';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  academyCode: string;
  role: 'student' | 'teacher' | 'parent';
  birthDate: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

export const RegistrationFormPreview: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    academyCode: '',
    role: 'student',
    birthDate: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [academyVerified, setAcademyVerified] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong'>('weak');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 패스워드 강도 체크
    if (name === 'password') {
      checkPasswordStrength(value);
    }

    // 에러 클리어
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) setPasswordStrength('weak');
    else if (score <= 2) setPasswordStrength('fair');
    else if (score <= 3) setPasswordStrength('good');
    else setPasswordStrength('strong');
  };

  const verifyAcademyCode = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (formData.academyCode === 'BOSTON2024') {
        setAcademyVerified(true);
        alert('아카데미 코드가 확인되었습니다!');
      } else {
        alert('유효하지 않은 아카데미 코드입니다.');
      }
    }, 1000);
  };

  const validateStep = (step: number) => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = '이름을 입력해주세요.';
      if (!formData.lastName) newErrors.lastName = '성을 입력해주세요.';
      if (!formData.email) newErrors.email = '이메일을 입력해주세요.';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = '유효한 이메일을 입력해주세요.';
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
      else if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      if (!formData.academyCode) newErrors.academyCode = '아카데미 코드를 입력해주세요.';
      else if (!academyVerified) newErrors.academyCode = '아카데미 코드를 확인해주세요.';
    }

    if (step === 3) {
      if (!formData.agreeTerms) newErrors.agreeTerms = '이용약관에 동의해주세요.';
      if (!formData.agreePrivacy) newErrors.agreePrivacy = '개인정보 처리방침에 동의해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert('회원가입이 완료되었습니다!');
      }, 2000);
    }
  };

  const getPasswordRequirements = () => {
    const { password } = formData;
    return [
      { text: '8자 이상', valid: password.length >= 8 },
      { text: '소문자 포함', valid: /[a-z]/.test(password) },
      { text: '대문자 포함', valid: /[A-Z]/.test(password) },
      { text: '숫자 포함', valid: /[0-9]/.test(password) },
      { text: '특수문자 포함', valid: /[^A-Za-z0-9]/.test(password) }
    ];
  };

  return (
    <div className="registration-container">
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="header-section">
          <div className="logo">B</div>
          <h2 className="title">회원가입</h2>
          <p className="subtitle">보스턴 아카데미에 오신 것을 환영합니다</p>
        </div>

        <div className="progress-steps">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`progress-step ${
                step === currentStep ? 'active' :
                step < currentStep ? 'completed' : ''
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
          ))}
        </div>

        {/* Step 1: 기본 정보 */}
        {currentStep === 1 && (
          <>
            <div className="form-row">
              <div className={`form-group ${errors.firstName ? 'error' : ''}`}>
                <label htmlFor="firstName">
                  이름 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="이름을 입력하세요"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                {errors.firstName && <div className="field-error">{errors.firstName}</div>}
              </div>

              <div className={`form-group ${errors.lastName ? 'error' : ''}`}>
                <label htmlFor="lastName">
                  성 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="성을 입력하세요"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                {errors.lastName && <div className="field-error">{errors.lastName}</div>}
              </div>
            </div>

            <div className={`form-group full-width ${errors.email ? 'error' : ''}`}>
              <label htmlFor="email">
                이메일 <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              <div className="input-icon">📧</div>
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">연락처</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthDate">생년월일</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="role">역할 선택</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="student">학생</option>
                <option value="teacher">교사</option>
                <option value="parent">학부모</option>
              </select>
            </div>
          </>
        )}

        {/* Step 2: 보안 정보 */}
        {currentStep === 2 && (
          <>
            <div className={`form-group ${errors.password ? 'error' : ''}`}>
              <label htmlFor="password">
                비밀번호 <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleInputChange}
              />
              <div className="input-icon">🔒</div>
              {errors.password && <div className="field-error">{errors.password}</div>}

              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className={`strength-fill ${passwordStrength}`}></div>
                  </div>
                  <div className={`strength-text ${passwordStrength}`}>
                    {passwordStrength === 'weak' && '약함'}
                    {passwordStrength === 'fair' && '보통'}
                    {passwordStrength === 'good' && '좋음'}
                    {passwordStrength === 'strong' && '강함'}
                  </div>
                </div>
              )}

              {formData.password && (
                <div className="password-requirements">
                  <h4>비밀번호 요구사항</h4>
                  <ul>
                    {getPasswordRequirements().map((req, index) => (
                      <li key={index} className={req.valid ? 'valid' : ''}>
                        {req.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
              <label htmlFor="confirmPassword">
                비밀번호 확인 <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <div className="input-icon">🔒</div>
              {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
            </div>

            <div className={`form-group academy-code-input ${academyVerified ? 'verified' : ''} ${errors.academyCode ? 'error' : ''}`}>
              <label htmlFor="academyCode">
                아카데미 코드 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="academyCode"
                name="academyCode"
                placeholder="아카데미 코드를 입력하세요"
                value={formData.academyCode}
                onChange={handleInputChange}
                disabled={academyVerified}
              />
              <button
                type="button"
                className="verify-button"
                onClick={verifyAcademyCode}
                disabled={!formData.academyCode || academyVerified || isLoading}
              >
                {isLoading ? '확인중...' : academyVerified ? '확인됨' : '확인'}
              </button>
              <div className="input-icon">{academyVerified ? '✓' : '🏫'}</div>
              {errors.academyCode && <div className="field-error">{errors.academyCode}</div>}
            </div>

            <div className="academy-info">
              <div className="info-title">아카데미 코드 안내</div>
              <div>담당 교사 또는 관리자에게 아카데미 코드를 문의하세요. 테스트용 코드: BOSTON2024</div>
            </div>
          </>
        )}

        {/* Step 3: 약관 동의 */}
        {currentStep === 3 && (
          <div className="terms-section">
            <h3 style={{ textAlign: 'center', marginBottom: '24px', color: '#495057' }}>
              약관 동의
            </h3>

            <div className={`terms-checkbox ${errors.agreeTerms ? 'error' : ''}`}>
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
              />
              <label htmlFor="agreeTerms">
                <strong>[필수]</strong> <a href="#">이용약관</a>에 동의합니다.
              </label>
            </div>

            <div className={`terms-checkbox ${errors.agreePrivacy ? 'error' : ''}`}>
              <input
                type="checkbox"
                id="agreePrivacy"
                name="agreePrivacy"
                checked={formData.agreePrivacy}
                onChange={handleInputChange}
              />
              <label htmlFor="agreePrivacy">
                <strong>[필수]</strong> <a href="#">개인정보 처리방침</a>에 동의합니다.
              </label>
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="agreeMarketing"
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleInputChange}
              />
              <label htmlFor="agreeMarketing">
                [선택] 마케팅 정보 수신에 동의합니다.
              </label>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '20px',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: '#495057'
            }}>
              <strong>개인정보 수집 및 이용 안내</strong><br/>
              • 수집항목: 이름, 이메일, 연락처, 생년월일<br/>
              • 이용목적: 회원가입, 서비스 제공, 고객지원<br/>
              • 보유기간: 회원탈퇴 시까지
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '32px',
          gap: '12px'
        }}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              style={{
                padding: '12px 24px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              이전 단계
            </button>
          )}

          <div style={{ flex: 1 }}></div>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              다음 단계
            </button>
          ) : (
            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading && <div className="loading-spinner" />}
              {isLoading ? '가입 중...' : '회원가입 완료'}
            </button>
          )}
        </div>

        <div className="login-link">
          이미 계정이 있으신가요? <a href="#">로그인</a>
        </div>
      </form>
    </div>
  );
};