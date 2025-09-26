import React from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import {
  Warning,
  ExitToApp,
  Person,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ImpersonationBannerProps {
  onEndImpersonation: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({
  onEndImpersonation
}) => {
  const { user } = useAuth();

  // 현재 대행접속 상태가 아니면 표시하지 않음
  if (!(user as any)?.impersonatedBy) {
    return null;
  }

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      'SUPER_MASTER': '최고 관리자',
      'COUNTRY_MASTER': '국가 관리자',
      'BRANCH_ADMIN': '지점 관리자',
      'TEACHER': '강사',
      'PARENT': '부모',
      'STUDENT': '학생'
    };
    return roleNames[role] || role;
  };

  return (
    <Alert
      severity="warning"
      sx={{
        mb: 2,
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        '& .MuiAlert-icon': {
          color: '#856404'
        }
      }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={onEndImpersonation}
          startIcon={<ExitToApp />}
          sx={{
            color: '#856404',
            borderColor: '#856404',
            '&:hover': {
              backgroundColor: 'rgba(133, 100, 4, 0.1)',
              borderColor: '#856404'
            }
          }}
          variant="outlined"
        >
          대행접속 종료
        </Button>
      }
    >
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#856404' }}>
        <Warning />
        대행접속 모드
      </AlertTitle>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettings fontSize="small" sx={{ color: '#856404' }} />
          <Typography variant="body2" sx={{ color: '#856404' }}>
            현재 다른 사용자 계정으로 대행접속 중입니다
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" sx={{ color: '#856404' }} />
          <Typography variant="body2" sx={{ color: '#856404', fontWeight: 500 }}>
            접속 중인 계정:
          </Typography>
          <Chip
            label={`${user?.firstName} ${user?.lastName} (${getRoleDisplayName(user?.role || '')})`}
            size="small"
            sx={{
              backgroundColor: 'rgba(133, 100, 4, 0.1)',
              color: '#856404',
              border: '1px solid rgba(133, 100, 4, 0.3)'
            }}
          />
        </Box>
      </Box>

      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6c5d03', opacity: 0.8 }}>
        ⚠️ 모든 작업이 감사 로그에 기록됩니다. 대행접속은 필요한 경우에만 사용하세요.
      </Typography>
    </Alert>
  );
};