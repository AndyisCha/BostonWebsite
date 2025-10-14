import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  QrCode,
  ContentCopy,
  Download,
  Delete,
  Edit,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { DataTable, Column, ActionButton } from '../common/DataTable';
import { KPICard } from '../common/KPICard';
import { useAuth } from '../../contexts/AuthContext';
import { AcademyCode, UserRole } from '../../types/permissions';

interface AcademyCodeData extends AcademyCode {
  id: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  qrCodeUrl?: string;
}

interface CreateCodeFormData {
  role: UserRole;
  countryCode: string;
  branchId: string;
  maxUses: number;
  expiresAt: string;
  description: string;
}

export const AcademyCodeManagement: React.FC = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState<AcademyCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AcademyCodeData | null>(null);
  const [formData, setFormData] = useState<CreateCodeFormData>({
    role: 'STUDENT',
    countryCode: 'KR',
    branchId: '',
    maxUses: 50,
    expiresAt: '',
    description: ''
  });

  // KPI 데이터
  const [kpiData, setKpiData] = useState({
    totalCodes: 0,
    activeCodes: 0,
    expiredCodes: 0,
    totalUses: 0
  });

  useEffect(() => {
    loadAcademyCodes();
  }, []);

  const loadAcademyCodes = async () => {
    setLoading(true);

    // Mock data
    const mockCodes: AcademyCodeData[] = [
      {
        id: '1',
        code: 'BA-KR-STU-001',
        countryCode: 'KR',
        branchId: 'branch-001',
        role: 'STUDENT',
        expiresAt: '2024-12-31',
        maxUses: 50,
        currentUses: 32,
        createdBy: 'admin@bostonacademy.kr',
        createdAt: '2024-09-01',
        isActive: true,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BA-KR-STU-001'
      },
      {
        id: '2',
        code: 'BA-KR-TEA-001',
        countryCode: 'KR',
        branchId: 'branch-001',
        role: 'TEACHER',
        expiresAt: '2024-11-30',
        maxUses: 10,
        currentUses: 7,
        createdBy: 'country@bostonacademy.kr',
        createdAt: '2024-09-15',
        isActive: true,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BA-KR-TEA-001'
      },
      {
        id: '3',
        code: 'BA-KR-PAR-001',
        countryCode: 'KR',
        branchId: 'branch-002',
        role: 'PARENT',
        expiresAt: '2024-10-15',
        maxUses: 30,
        currentUses: 30,
        createdBy: 'branch@bostonacademy.kr',
        createdAt: '2024-08-20',
        isActive: false,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BA-KR-PAR-001'
      }
    ];

    setCodes(mockCodes);

    // Calculate KPIs
    const totalCodes = mockCodes.length;
    const activeCodes = mockCodes.filter(code => code.isActive).length;
    const expiredCodes = totalCodes - activeCodes;
    const totalUses = mockCodes.reduce((sum, code) => sum + code.currentUses, 0);

    setKpiData({
      totalCodes,
      activeCodes,
      expiredCodes,
      totalUses
    });

    setLoading(false);
  };

  const handleCreateCode = () => {
    setCreateDialogOpen(true);
  };

  const handleSubmitCreate = () => {
    // Generate new code
    const rolePrefix = {
      'STUDENT': 'STU',
      'TEACHER': 'TEA',
      'PARENT': 'PAR',
      'BRANCH_ADMIN': 'BRA',
      'COUNTRY_MASTER': 'COU',
      'SUPER_MASTER': 'SUP'
    };

    const newCode: AcademyCodeData = {
      id: String(codes.length + 1),
      code: `BA-${formData.countryCode}-${rolePrefix[formData.role]}-${String(codes.length + 1).padStart(3, '0')}`,
      countryCode: formData.countryCode,
      branchId: formData.branchId || 'global',
      role: formData.role,
      expiresAt: formData.expiresAt,
      maxUses: formData.maxUses,
      currentUses: 0,
      createdBy: user?.email || 'unknown',
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BA-${formData.countryCode}-${rolePrefix[formData.role]}-${String(codes.length + 1).padStart(3, '0')}`
    };

    setCodes([...codes, newCode]);
    setCreateDialogOpen(false);
    setFormData({
      role: 'STUDENT',
      countryCode: 'KR',
      branchId: '',
      maxUses: 50,
      expiresAt: '',
      description: ''
    });
  };

  const handleShowQRCode = (code: AcademyCodeData) => {
    setSelectedCode(code);
    setQrDialogOpen(true);
  };

  const handleCopyCode = (codeString: string) => {
    navigator.clipboard.writeText(codeString);
    // You can add a toast notification here
  };

  const handleToggleActive = (id: string) => {
    setCodes(codes.map(code =>
      code.id === id ? { ...code, isActive: !code.isActive } : code
    ));
  };

  const handleDeleteCode = (id: string) => {
    setCodes(codes.filter(code => code.id !== id));
  };

  // Table columns
  const columns: Column<AcademyCodeData>[] = [
    {
      key: 'code',
      label: '학원 코드',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={500}>
            {row.code}
          </Typography>
          <IconButton size="small" onClick={() => handleCopyCode(row.code)}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Box>
      )
    },
    {
      key: 'role',
      label: '역할',
      render: (row) => (
        <Chip
          label={row.role}
          color={
            row.role === 'STUDENT' ? 'primary' :
            row.role === 'TEACHER' ? 'secondary' :
            row.role === 'PARENT' ? 'info' :
            'default'
          }
          size="small"
        />
      )
    },
    { key: 'countryCode', label: '국가' },
    { key: 'branchId', label: '지점 ID' },
    {
      key: 'usage',
      label: '사용량',
      render: (row) => (
        <Typography variant="body2">
          {row.currentUses}/{row.maxUses || '∞'}
        </Typography>
      )
    },
    { key: 'expiresAt', label: '만료일' },
    {
      key: 'isActive',
      label: '상태',
      render: (row) => (
        <Chip
          label={row.isActive ? '활성' : '비활성'}
          color={row.isActive ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { key: 'createdBy', label: '생성자' },
    { key: 'createdAt', label: '생성일' }
  ];

  // Action buttons
  const actions: ActionButton<AcademyCodeData>[] = [
    {
      label: 'QR코드',
      color: 'primary',
      icon: <QrCode />,
      onClick: handleShowQRCode
    },
    {
      label: row => row.isActive ? '비활성화' : '활성화',
      color: 'secondary',
      icon: row => row.isActive ? <VisibilityOff /> : <Visibility />,
      onClick: (row) => handleToggleActive(row.id)
    },
    {
      label: '삭제',
      color: 'error',
      icon: <Delete />,
      onClick: (row) => handleDeleteCode(row.id)
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>학원 코드를 로드하는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
            학원 코드 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            역할별 학원 코드를 생성하고 관리합니다
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCode}
        >
          새 코드 생성
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="총 코드 수"
            value={kpiData.totalCodes}
            unit="개"
            color="primary"
            icon={<QrCode />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="활성 코드"
            value={kpiData.activeCodes}
            unit="개"
            color="success"
            icon={<Visibility />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="만료 코드"
            value={kpiData.expiredCodes}
            unit="개"
            color="error"
            icon={<VisibilityOff />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="총 사용량"
            value={kpiData.totalUses}
            unit="회"
            color="info"
            icon={<Download />}
          />
        </Grid>
      </Grid>

      {/* Data Table */}
      <Card>
        <CardContent>
          <DataTable
            data={codes}
            columns={columns}
            actions={actions}
            searchPlaceholder="학원 코드 검색..."
          />
        </CardContent>
      </Card>

      {/* Create Code Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>새 학원 코드 생성</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>역할</InputLabel>
                <Select
                  value={formData.role}
                  label="역할"
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <MenuItem value="STUDENT">학생</MenuItem>
                  <MenuItem value="TEACHER">강사</MenuItem>
                  <MenuItem value="PARENT">부모</MenuItem>
                  <MenuItem value="BRANCH_ADMIN">지점 관리자</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>국가</InputLabel>
                <Select
                  value={formData.countryCode}
                  label="국가"
                  onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                >
                  <MenuItem value="KR">한국</MenuItem>
                  <MenuItem value="US">미국</MenuItem>
                  <MenuItem value="CN">중국</MenuItem>
                  <MenuItem value="JP">일본</MenuItem>
                  <MenuItem value="SG">싱가포르</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="지점 ID"
                value={formData.branchId}
                onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                placeholder="선택사항 (전역 코드의 경우 비워두세요)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="최대 사용 횟수"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({...formData, maxUses: Number(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="만료일"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="설명"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="코드 용도 설명 (선택사항)"
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            생성된 코드는 QR코드로 변환되어 배포할 수 있습니다.
            코드 사용 시 해당 역할로 자동 가입됩니다.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmitCreate}>생성</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR 코드</DialogTitle>
        <DialogContent>
          {selectedCode && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedCode.code}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <img
                  src={selectedCode.qrCodeUrl}
                  alt="QR Code"
                  style={{ maxWidth: '200px', height: '200px' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                QR 코드를 스캔하거나 코드를 직접 입력하여 가입할 수 있습니다.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopyCode(selectedCode.code)}
                >
                  코드 복사
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedCode.qrCodeUrl!;
                    link.download = `${selectedCode.code}.png`;
                    link.click();
                  }}
                >
                  QR 다운로드
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};