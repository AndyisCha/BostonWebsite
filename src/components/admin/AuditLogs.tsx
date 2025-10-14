import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid
} from '@mui/material';
import {
  Security,
  AdminPanelSettings,
  Person,
  AccessTime,
  Computer,
  Warning,
  Info,
  Error,
  CheckCircle
} from '@mui/icons-material';
import { DataTable, Column } from '../common/DataTable';
import { GlobalFilter, FilterOption } from '../common/GlobalFilter';
import { KPICard } from '../common/KPICard';
import { useAuth } from '../../contexts/AuthContext';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'impersonation' | 'user_management' | 'content_management' | 'system';
}

export const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: any}>({});

  // KPI 데이터
  const [kpiData, setKpiData] = useState({
    totalLogs: 0,
    impersonationEvents: 0,
    criticalEvents: 0,
    todayEvents: 0
  });

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);

    // Mock data - 실제로는 백엔드 API에서 가져올 것
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        timestamp: '2024-09-25 14:30:25',
        userId: 'admin-001',
        userEmail: 'admin@bostonacademy.kr',
        action: 'impersonation_start',
        targetUserId: 'student-001',
        targetUserEmail: 'student@example.com',
        details: '최고 관리자가 학생 계정으로 대행접속을 시작했습니다',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'high',
        category: 'impersonation'
      },
      {
        id: '2',
        timestamp: '2024-09-25 14:25:12',
        userId: 'admin-001',
        userEmail: 'admin@bostonacademy.kr',
        action: 'user_created',
        targetUserId: 'teacher-005',
        targetUserEmail: 'newteacher@branch.com',
        details: '새 강사 계정이 생성되었습니다',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'medium',
        category: 'user_management'
      },
      {
        id: '3',
        timestamp: '2024-09-25 14:15:45',
        userId: 'country-001',
        userEmail: 'country@bostonacademy.kr',
        action: 'permission_granted',
        targetUserId: 'branch-002',
        targetUserEmail: 'branch2@bostonacademy.kr',
        details: 'E-book 관리 권한이 부여되었습니다',
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
        severity: 'medium',
        category: 'user_management'
      },
      {
        id: '4',
        timestamp: '2024-09-25 13:45:30',
        userId: 'student-001',
        userEmail: 'student@example.com',
        action: 'login_failed',
        details: '로그인 시도가 실패했습니다 (잘못된 비밀번호)',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS)',
        severity: 'low',
        category: 'authentication'
      },
      {
        id: '5',
        timestamp: '2024-09-25 12:30:15',
        userId: 'admin-001',
        userEmail: 'admin@bostonacademy.kr',
        action: 'system_backup',
        details: '시스템 백업이 완료되었습니다',
        ipAddress: '192.168.1.100',
        userAgent: 'System Process',
        severity: 'low',
        category: 'system'
      },
      {
        id: '6',
        timestamp: '2024-09-25 11:15:22',
        userId: 'admin-001',
        userEmail: 'admin@bostonacademy.kr',
        action: 'impersonation_end',
        targetUserId: 'teacher-003',
        targetUserEmail: 'teacher3@branch.com',
        details: '대행접속이 종료되었습니다',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        severity: 'high',
        category: 'impersonation'
      }
    ];

    setLogs(mockLogs);

    // Calculate KPIs
    const totalLogs = mockLogs.length;
    const impersonationEvents = mockLogs.filter(log => log.category === 'impersonation').length;
    const criticalEvents = mockLogs.filter(log => log.severity === 'critical').length;
    const todayEvents = mockLogs.filter(log => {
      const logDate = new Date(log.timestamp).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
    }).length;

    setKpiData({
      totalLogs,
      impersonationEvents,
      criticalEvents,
      todayEvents
    });

    setLoading(false);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Error sx={{ color: 'error.main' }} />;
      case 'high':
        return <Warning sx={{ color: 'warning.main' }} />;
      case 'medium':
        return <Info sx={{ color: 'info.main' }} />;
      case 'low':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      default:
        return <Info />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'impersonation':
        return <AdminPanelSettings />;
      case 'authentication':
        return <Security />;
      case 'user_management':
        return <Person />;
      case 'system':
        return <Computer />;
      default:
        return <AccessTime />;
    }
  };

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: '카테고리',
      type: 'multiselect',
      options: [
        { value: 'authentication', label: '인증' },
        { value: 'impersonation', label: '대행접속' },
        { value: 'user_management', label: '사용자 관리' },
        { value: 'content_management', label: '콘텐츠 관리' },
        { value: 'system', label: '시스템' }
      ]
    },
    {
      key: 'severity',
      label: '중요도',
      type: 'multiselect',
      options: [
        { value: 'critical', label: '치명적' },
        { value: 'high', label: '높음' },
        { value: 'medium', label: '보통' },
        { value: 'low', label: '낮음' }
      ]
    },
    {
      key: 'dateRange',
      label: '기간',
      type: 'daterange'
    }
  ];

  // Table columns
  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      label: '시간',
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {row.timestamp}
        </Typography>
      )
    },
    {
      key: 'severity',
      label: '중요도',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSeverityIcon(row.severity)}
          <Chip
            label={row.severity.toUpperCase()}
            size="small"
            color={
              row.severity === 'critical' ? 'error' :
              row.severity === 'high' ? 'warning' :
              row.severity === 'medium' ? 'info' : 'success'
            }
          />
        </Box>
      )
    },
    {
      key: 'category',
      label: '카테고리',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getCategoryIcon(row.category)}
          <Typography variant="body2">
            {row.category === 'impersonation' ? '대행접속' :
             row.category === 'authentication' ? '인증' :
             row.category === 'user_management' ? '사용자 관리' :
             row.category === 'content_management' ? '콘텐츠 관리' :
             row.category === 'system' ? '시스템' : row.category}
          </Typography>
        </Box>
      )
    },
    {
      key: 'userEmail',
      label: '작업자',
      render: (row) => (
        <Typography variant="body2">{row.userEmail}</Typography>
      )
    },
    {
      key: 'action',
      label: '작업',
      render: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.action}
        </Typography>
      )
    },
    {
      key: 'targetUserEmail',
      label: '대상',
      render: (row) => (
        <Typography variant="body2">
          {row.targetUserEmail || '-'}
        </Typography>
      )
    },
    {
      key: 'details',
      label: '상세 내용',
      render: (row) => (
        <Typography variant="body2" sx={{ maxWidth: 300 }}>
          {row.details}
        </Typography>
      )
    },
    {
      key: 'ipAddress',
      label: 'IP 주소',
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {row.ipAddress}
        </Typography>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>감사 로그를 로드하는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          감사 로그
        </Typography>
        <Typography variant="body1" color="text.secondary">
          시스템의 모든 중요한 작업이 기록됩니다
        </Typography>
      </Box>

      {/* Security Notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>보안 정책:</strong> 모든 대행접속, 권한 변경, 사용자 관리 작업이 자동으로 기록됩니다.
          이 로그는 30일간 보관되며 감사 목적으로 사용됩니다.
        </Typography>
      </Alert>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="전체 로그"
            value={kpiData.totalLogs}
            unit="건"
            color="primary"
            icon={<AccessTime />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="대행접속"
            value={kpiData.impersonationEvents}
            unit="건"
            color="warning"
            icon={<AdminPanelSettings />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="치명적 이벤트"
            value={kpiData.criticalEvents}
            unit="건"
            color="error"
            icon={<Error />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="오늘의 이벤트"
            value={kpiData.todayEvents}
            unit="건"
            color="info"
            icon={<CheckCircle />}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <GlobalFilter
          filters={filterOptions}
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
        />
      </Box>

      {/* Data Table */}
      <Card>
        <CardContent>
          <DataTable
            data={logs}
            columns={columns}
            searchPlaceholder="감사 로그 검색..."
            enableSorting
            initialSort={{ key: 'timestamp', direction: 'desc' }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};