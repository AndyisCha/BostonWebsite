import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
  Info
} from '@mui/icons-material';
import { ROLE_PERMISSIONS, UserRole, PermissionSet } from '../../types/permissions';
import { useAuth } from '../../contexts/AuthContext';

interface PermissionCategory {
  key: keyof PermissionSet;
  label: string;
  description: string;
  permissions: Array<{
    key: string;
    label: string;
    description: string;
  }>;
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: 'dashboard',
    label: '대시보드 접근',
    description: '각 역할별 대시보드 화면 접근 권한',
    permissions: [
      { key: 'global', label: '글로벌 대시보드', description: '전체 시스템 통계 및 관리' },
      { key: 'country', label: '나라 대시보드', description: '국가별 지점 통합 관리' },
      { key: 'branch', label: '지점 대시보드', description: '개별 지점 관리' },
      { key: 'teacher', label: '강사 대시보드', description: '강사 전용 기능' },
      { key: 'parent', label: '부모 대시보드', description: '자녀 학습 현황 조회' },
      { key: 'student', label: '학생 대시보드', description: '개인 학습 현황' }
    ]
  },
  {
    key: 'users',
    label: '사용자 관리',
    description: '시스템 사용자 관리 권한',
    permissions: [
      { key: 'create', label: '사용자 생성', description: '새 사용자 계정 생성' },
      { key: 'read', label: '사용자 조회', description: '사용자 정보 조회' },
      { key: 'update', label: '사용자 수정', description: '사용자 정보 수정' },
      { key: 'delete', label: '사용자 삭제', description: '사용자 계정 삭제' },
      { key: 'impersonate', label: '대행접속', description: '다른 사용자로 로그인' },
      { key: 'grant_permissions', label: '권한 부여', description: '다른 사용자에게 권한 부여' }
    ]
  },
  {
    key: 'masters',
    label: '마스터 관리',
    description: '상위 관리자 계정 관리',
    permissions: [
      { key: 'create_country', label: '나라 마스터 생성', description: '국가별 마스터 계정 생성' },
      { key: 'create_branch', label: '지점 계정 생성', description: '지점 관리자 계정 생성' },
      { key: 'manage', label: '마스터 관리', description: '마스터 계정 관리' },
      { key: 'suspend', label: '마스터 중지', description: '마스터 계정 일시 중지' }
    ]
  },
  {
    key: 'content',
    label: '콘텐츠 관리',
    description: '학습 콘텐츠 관리 권한',
    permissions: [
      { key: 'view', label: '콘텐츠 보기', description: '콘텐츠 조회' },
      { key: 'create', label: '콘텐츠 생성', description: '새 콘텐츠 생성' },
      { key: 'update', label: '콘텐츠 수정', description: '기존 콘텐츠 수정' },
      { key: 'delete', label: '콘텐츠 삭제', description: '콘텐츠 삭제' },
      { key: 'publish', label: '콘텐츠 발행', description: '콘텐츠 공개/비공개' }
    ]
  },
  {
    key: 'ebooks',
    label: 'E-book 관리',
    description: '전자책 관리 및 접근 권한',
    permissions: [
      { key: 'view_unlimited', label: '무제한 보기', description: 'E-book 무제한 접근' },
      { key: 'view_limited', label: '제한된 보기', description: 'E-book 제한된 접근' },
      { key: 'manage', label: 'E-book 관리', description: 'E-book 관리' },
      { key: 'assign_permissions', label: '권한 할당', description: 'E-book 접근 권한 설정' },
      { key: 'upload', label: 'E-book 업로드', description: '새 E-book 업로드' }
    ]
  },
  {
    key: 'tests',
    label: '레벨 테스트',
    description: '시험 관리 권한',
    permissions: [
      { key: 'take', label: '테스트 응시', description: '레벨 테스트 응시' },
      { key: 'view_results', label: '결과 조회', description: '시험 결과 조회' },
      { key: 'manage', label: '테스트 관리', description: '시험 문제 및 설정 관리' },
      { key: 'regrade', label: '재채점', description: '시험 재채점' },
      { key: 'reset_attempts', label: '재응시 허용', description: '응시 횟수 초기화' }
    ]
  },
  {
    key: 'academy_codes',
    label: '학원 코드',
    description: '학원 코드 관리 권한',
    permissions: [
      { key: 'create', label: '코드 생성', description: '새 학원 코드 생성' },
      { key: 'assign', label: '코드 배포', description: '학원 코드 배포' },
      { key: 'manage', label: '코드 관리', description: '학원 코드 관리' },
      { key: 'view', label: '코드 조회', description: '학원 코드 목록 조회' }
    ]
  },
  {
    key: 'memberships',
    label: '회원권 관리',
    description: '회원권 정책 관리',
    permissions: [
      { key: 'create', label: '회원권 생성', description: '새 회원권 정책 생성' },
      { key: 'assign', label: '회원권 할당', description: '사용자에게 회원권 할당' },
      { key: 'manage', label: '회원권 관리', description: '회원권 정책 관리' },
      { key: 'view', label: '회원권 조회', description: '회원권 정보 조회' }
    ]
  },
  {
    key: 'system',
    label: '시스템 설정',
    description: '시스템 관리 권한',
    permissions: [
      { key: 'settings', label: '시스템 설정', description: '전역 시스템 설정' },
      { key: 'policies', label: '정책 설정', description: '운영 정책 설정' },
      { key: 'billing', label: '요금제 관리', description: '결제 및 요금제 관리' },
      { key: 'audit_logs', label: '감사로그', description: '시스템 감사로그 조회' },
      { key: 'backup', label: '백업 관리', description: '데이터 백업 관리' }
    ]
  },
  {
    key: 'notifications',
    label: '알림 관리',
    description: '알림 시스템 관리',
    permissions: [
      { key: 'receive', label: '알림 수신', description: '시스템 알림 수신' },
      { key: 'manage_channels', label: '채널 관리', description: '알림 채널 설정' },
      { key: 'send', label: '알림 발송', description: '다른 사용자에게 알림 발송' }
    ]
  }
];

const ROLES: Array<{ role: UserRole; label: string; color: any }> = [
  { role: 'SUPER_MASTER', label: '최고 마스터', color: 'error' },
  { role: 'COUNTRY_MASTER', label: '나라 마스터', color: 'warning' },
  { role: 'BRANCH_ADMIN', label: '지점 관리자', color: 'primary' },
  { role: 'TEACHER', label: '강사', color: 'secondary' },
  { role: 'PARENT', label: '부모', color: 'info' },
  { role: 'STUDENT', label: '학생', color: 'success' }
];

export const PermissionsMatrix: React.FC = () => {
  const { user } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['dashboard']);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const hasPermission = (role: UserRole, category: keyof PermissionSet, permission: string): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[role];
    const categoryPermissions = rolePermissions[category] as any;
    return categoryPermissions?.[permission] === true;
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
    ) : (
      <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          권한 매트릭스
        </Typography>
        <Typography variant="body1" color="text.secondary">
          역할별 권한 구조를 확인할 수 있습니다
        </Typography>
      </Box>

      {/* Role Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>역할 개요</Typography>
          <Grid container spacing={2}>
            {ROLES.map(({ role, label, color }) => (
              <Grid item xs={12} sm={6} md={4} key={role}>
                <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Chip label={label} color={color} sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {role === 'SUPER_MASTER' && '시스템 전체 관리자'}
                    {role === 'COUNTRY_MASTER' && '국가별 지점 총괄'}
                    {role === 'BRANCH_ADMIN' && '개별 지점 관리자'}
                    {role === 'TEACHER' && '강사 및 학습 관리'}
                    {role === 'PARENT' && '자녀 학습 현황 조회'}
                    {role === 'STUDENT' && '개인 학습자'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Current User Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>현재 사용자:</strong> {user?.email} ({ROLES.find(r => r.role === user?.role)?.label})
        </Typography>
      </Alert>

      {/* Permissions Matrix */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>권한 매트릭스</Typography>

          {PERMISSION_CATEGORIES.map((category) => (
            <Paper key={category.key} sx={{ mb: 2, border: 1, borderColor: 'divider' }}>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  bgcolor: 'grey.50'
                }}
                onClick={() => toggleCategory(category.key)}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {category.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
                <IconButton>
                  {expandedCategories.includes(category.key) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={expandedCategories.includes(category.key)}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>권한</TableCell>
                        {ROLES.map(({ role, label }) => (
                          <TableCell key={role} align="center" sx={{ fontWeight: 600 }}>
                            <Chip label={label} size="small" variant="outlined" />
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.permissions.map((permission) => (
                        <TableRow key={permission.key} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {permission.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {permission.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          {ROLES.map(({ role }) => (
                            <TableCell key={role} align="center">
                              {getPermissionIcon(
                                hasPermission(role, category.key, permission.key)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Paper>
          ))}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>범례</Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="body2">권한 있음</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
              <Typography variant="body2">권한 없음</Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            * 상위 역할은 하위 역할의 권한을 상속받습니다.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};