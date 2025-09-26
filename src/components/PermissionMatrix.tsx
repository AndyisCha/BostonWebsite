import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Grid,
  Alert
} from '@mui/material';
import {
  Check,
  Close,
  ExpandMore,
  ExpandLess,
  Info,
  Security,
  People,
  AdminPanelSettings,
  School,
  FamilyRestroom,
  PersonOutline
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  UserRole,
  PermissionSet,
  ROLE_PERMISSIONS,
  hasPermissionWithHierarchy
} from '../types/permissions';

interface PermissionCategory {
  key: keyof PermissionSet;
  label: string;
  description: string;
  actions: {
    key: string;
    label: string;
    description: string;
  }[];
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: 'dashboard',
    label: '대시보드',
    description: '각종 대시보드 및 분석 화면 접근',
    actions: [
      { key: 'view', label: '조회', description: '대시보드 화면 조회' },
      { key: 'analytics', label: '분석', description: '통계 및 분석 데이터 조회' }
    ]
  },
  {
    key: 'users',
    label: '사용자 관리',
    description: '시스템 사용자 계정 및 정보 관리',
    actions: [
      { key: 'view', label: '조회', description: '사용자 목록 및 정보 조회' },
      { key: 'create', label: '생성', description: '새로운 사용자 계정 생성' },
      { key: 'edit', label: '편집', description: '사용자 정보 수정' },
      { key: 'delete', label: '삭제', description: '사용자 계정 삭제' },
      { key: 'manage_roles', label: '역할 관리', description: '사용자 역할 변경' }
    ]
  },
  {
    key: 'masters',
    label: '마스터 관리',
    description: '나라 마스터 및 관리자 계정 관리',
    actions: [
      { key: 'view', label: '조회', description: '마스터 목록 조회' },
      { key: 'create', label: '생성', description: '새로운 마스터 계정 생성' },
      { key: 'edit', label: '편집', description: '마스터 정보 수정' },
      { key: 'delete', label: '삭제', description: '마스터 계정 삭제' }
    ]
  },
  {
    key: 'content',
    label: '콘텐츠 관리',
    description: '교육 콘텐츠 및 교재 관리',
    actions: [
      { key: 'view', label: '조회', description: '콘텐츠 목록 조회' },
      { key: 'create', label: '생성', description: '새로운 콘텐츠 생성' },
      { key: 'edit', label: '편집', description: '콘텐츠 수정' },
      { key: 'delete', label: '삭제', description: '콘텐츠 삭제' },
      { key: 'publish', label: '배포', description: '콘텐츠 배포 및 공개' }
    ]
  },
  {
    key: 'ebooks',
    label: 'E-book 관리',
    description: '전자책 업로드, 편집 및 배포 관리',
    actions: [
      { key: 'view', label: '조회', description: 'E-book 목록 및 상세 조회' },
      { key: 'create', label: '업로드', description: '새로운 E-book 업로드' },
      { key: 'edit', label: '편집', description: 'E-book 정보 및 내용 편집' },
      { key: 'delete', label: '삭제', description: 'E-book 삭제' },
      { key: 'unlimited_access', label: '무제한 접근', description: 'E-book 무제한 이용' }
    ]
  },
  {
    key: 'tests',
    label: '레벨테스트 관리',
    description: '레벨테스트 문제 및 결과 관리',
    actions: [
      { key: 'view', label: '조회', description: '테스트 결과 조회' },
      { key: 'create', label: '생성', description: '새로운 테스트 생성' },
      { key: 'edit', label: '편집', description: '테스트 문제 편집' },
      { key: 'grade', label: '채점', description: '테스트 채점 및 코멘트' },
      { key: 'analytics', label: '분석', description: '테스트 결과 통계 분석' }
    ]
  },
  {
    key: 'academy_codes',
    label: '학원코드 관리',
    description: '학원 등록코드 생성 및 관리',
    actions: [
      { key: 'view', label: '조회', description: '학원코드 목록 조회' },
      { key: 'create', label: '생성', description: '새로운 학원코드 생성' },
      { key: 'edit', label: '편집', description: '학원코드 설정 편집' },
      { key: 'delete', label: '삭제', description: '학원코드 삭제' }
    ]
  },
  {
    key: 'memberships',
    label: '회원권 관리',
    description: '회원권 정책 및 권한 관리',
    actions: [
      { key: 'view', label: '조회', description: '회원권 정보 조회' },
      { key: 'create', label: '생성', description: '새로운 회원권 생성' },
      { key: 'edit', label: '편집', description: '회원권 정책 편집' },
      { key: 'assign', label: '할당', description: '사용자에게 회원권 할당' }
    ]
  },
  {
    key: 'system',
    label: '시스템 설정',
    description: '전체 시스템 환경설정 및 관리',
    actions: [
      { key: 'view', label: '조회', description: '시스템 설정 조회' },
      { key: 'edit', label: '편집', description: '시스템 설정 변경' },
      { key: 'backup', label: '백업', description: '시스템 백업 관리' },
      { key: 'logs', label: '로그', description: '시스템 로그 조회' }
    ]
  },
  {
    key: 'notifications',
    label: '알림',
    description: '시스템 알림 및 메시지 관리',
    actions: [
      { key: 'view', label: '조회', description: '알림 목록 조회' },
      { key: 'send', label: '발송', description: '알림 발송' },
      { key: 'manage', label: '관리', description: '알림 설정 관리' }
    ]
  }
];

const ROLES: { role: UserRole; label: string; color: string; icon: React.ReactNode }[] = [
  { role: 'SUPER_MASTER', label: '최고 마스터', color: 'error', icon: <AdminPanelSettings /> },
  { role: 'COUNTRY_MASTER', label: '나라 마스터', color: 'warning', icon: <Security /> },
  { role: 'BRANCH_ADMIN', label: '지점 관리자', color: 'info', icon: <People /> },
  { role: 'TEACHER', label: '강사', color: 'success', icon: <School /> },
  { role: 'PARENT', label: '부모', color: 'secondary', icon: <FamilyRestroom /> },
  { role: 'STUDENT', label: '학생', color: 'primary', icon: <PersonOutline /> }
];

export const PermissionMatrix: React.FC = () => {
  const { user } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const hasPermission = (role: UserRole, category: keyof PermissionSet, action: string): boolean => {
    return hasPermissionWithHierarchy(role, category, action);
  };

  const getRoleIcon = (role: UserRole) => {
    return ROLES.find(r => r.role === role)?.icon || <PersonOutline />;
  };

  const getRoleColor = (role: UserRole) => {
    return ROLES.find(r => r.role === role)?.color || 'default';
  };

  const getRoleLabel = (role: UserRole) => {
    return ROLES.find(r => r.role === role)?.label || role;
  };

  return (
    <Box>
      {/* 헤더 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Security color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                권한 매트릭스
              </Typography>
              <Typography variant="body1" color="text.secondary">
                역할별 시스템 권한을 확인할 수 있습니다
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 현재 사용자 권한 요약 */}
      {user && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getRoleIcon(user.role)}
            <Typography variant="body2">
              현재 로그인한 계정: <strong>{user.firstName} {user.lastName}</strong> ({getRoleLabel(user.role)})
            </Typography>
          </Box>
        </Alert>
      )}

      {/* 역할 범례 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            역할 및 권한 범례
          </Typography>
          <Grid container spacing={2}>
            {ROLES.map((roleInfo) => (
              <Grid item xs={12} sm={6} md={4} key={roleInfo.role}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 1, backgroundColor: 'grey.50' }}>
                  {roleInfo.icon}
                  <Chip
                    label={roleInfo.label}
                    size="small"
                    color={roleInfo.color as any}
                    variant="outlined"
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 권한 매트릭스 테이블 */}
      {PERMISSION_CATEGORIES.map((category) => (
        <Card key={category.key} sx={{ mb: 2 }}>
          <CardContent sx={{ pb: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                py: 1
              }}
              onClick={() => toggleCategory(category.key)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {category.label}
                </Typography>
                <Tooltip title={category.description}>
                  <Info fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <IconButton size="small">
                {expandedCategories.has(category.key) ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expandedCategories.has(category.key)}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {category.description}
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>액션</TableCell>
                      {ROLES.map((roleInfo) => (
                        <TableCell key={roleInfo.role} align="center" sx={{ fontWeight: 600 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            {roleInfo.icon}
                            <Typography variant="caption">
                              {roleInfo.label}
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {category.actions.map((action) => (
                      <TableRow key={action.key} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {action.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        {ROLES.map((roleInfo) => (
                          <TableCell key={roleInfo.role} align="center">
                            {hasPermission(roleInfo.role, category.key, action.key) ? (
                              <Tooltip title={`${roleInfo.label}은(는) 이 권한을 가집니다`}>
                                <Check color="success" fontSize="small" />
                              </Tooltip>
                            ) : (
                              <Tooltip title={`${roleInfo.label}은(는) 이 권한을 가지지 않습니다`}>
                                <Close color="error" fontSize="small" />
                              </Tooltip>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {/* 권한 상속 설명 */}
      <Alert severity="warning">
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          권한 상속 규칙
        </Typography>
        <Typography variant="body2">
          상위 역할은 하위 역할의 모든 권한을 자동으로 상속받습니다.
          예: SUPER_MASTER → COUNTRY_MASTER → BRANCH_ADMIN → TEACHER → PARENT → STUDENT 순서로 권한을 상속합니다.
        </Typography>
      </Alert>
    </Box>
  );
};