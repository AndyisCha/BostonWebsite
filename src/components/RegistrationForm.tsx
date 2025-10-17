import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { AuthService } from '../services/authService';

interface RegistrationFormProps {
  onBack: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    academyCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration data:', formData);

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // AuthService의 RegisterRequest 형식에 맞춰 데이터 변환
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const response = await AuthService.register({
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        academyCode: formData.academyCode || 'DEFAULT',
        role: 'STUDENT'
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onBack(); // 로그인 페이지로 돌아가기
        }, 2000);
      } else {
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        회원가입
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          label="이메일"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          disabled={loading || success}
        />

        <TextField
          fullWidth
          margin="normal"
          label="이름"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          disabled={loading || success}
          helperText="띄어쓰기로 성과 이름을 구분해주세요 (예: 홍 길동)"
        />

        <TextField
          fullWidth
          margin="normal"
          label="전화번호"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
          disabled={loading || success}
        />

        <TextField
          fullWidth
          margin="normal"
          label="학원 코드 (선택사항)"
          value={formData.academyCode}
          onChange={(e) => setFormData({...formData, academyCode: e.target.value})}
          disabled={loading || success}
          helperText="학원에서 제공받은 코드를 입력하세요"
        />

        <TextField
          fullWidth
          margin="normal"
          label="비밀번호"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          disabled={loading || success}
        />

        <TextField
          fullWidth
          margin="normal"
          label="비밀번호 확인"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
          disabled={loading || success}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading || success}
        >
          {loading ? <CircularProgress size={24} /> : '가입하기'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={onBack}
          disabled={loading}
        >
          로그인으로 돌아가기
        </Button>
      </Box>
    </Paper>
  );
};