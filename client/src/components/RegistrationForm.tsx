import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

interface RegistrationFormProps {
  onBack: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log('Registration data:', formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        회원가입
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          label="이메일"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="이름"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="전화번호"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="비밀번호"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="비밀번호 확인"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          가입하기
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={onBack}
        >
          로그인으로 돌아가기
        </Button>
      </Box>
    </Paper>
  );
};