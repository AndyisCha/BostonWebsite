import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  People,
  PersonAdd,
  School,
  LocationOn,
  Add,
  QrCode,
  TrendingUp,
  Quiz
} from '@mui/icons-material';
import { KPICard } from '../common/KPICard';
import { DataTable, Column, ActionButton } from '../common/DataTable';
import { GlobalFilter, FilterOption } from '../common/GlobalFilter';
import { CustomBarChart, CustomLineChart } from '../common/Charts';
import { useAuth } from '../../contexts/AuthContext';

interface BranchData {
  id: string;
  name: string;
  academyCode: string;
  memberCount: number;
  teacherCount: number;
  recentTestCount: number;
  status: string;
  manager: string;
  location: string;
}

interface TestTrendData {
  name: string;
  value: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`country-tabpanel-${index}`}
      aria-labelledby={`country-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const CountryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [testTrendData, setTestTrendData] = useState<TestTrendData[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

  // 국가 정보 (사용자 정보에서 가져옴)
  const countryName = user?.countryId === 'KR' ? '대한민국' : '미국';

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        setBranches([
          {
            id: 'seoul-gangnam',
            name: '서울 강남점',
            academyCode: 'BA-KR-GN-001',
            memberCount: 342,
            teacherCount: 24,
            recentTestCount: 89,
            status: '활성',
            manager: 'Andy Branch',
            location: '서울시 강남구'
          },
          {
            id: 'seoul-hongdae',
            name: '서울 홍대점',
            academyCode: 'BA-KR-HD-002',
            memberCount: 287,
            teacherCount: 19,
            recentTestCount: 67,
            status: '활성',
            manager: '이미영',
            location: '서울시 마포구'
          },
          {
            id: 'busan-haeundae',
            name: '부산 해운대점',
            academyCode: 'BA-KR-HU-003',
            memberCount: 198,
            teacherCount: 14,
            recentTestCount: 45,
            status: '활성',
            manager: '박진우',
            location: '부산시 해운대구'
          },
          {
            id: 'daegu-dongseong',
            name: '대구 동성로점',
            academyCode: 'BA-KR-DS-004',
            memberCount: 156,
            teacherCount: 12,
            recentTestCount: 32,
            status: '활성',
            manager: '최수연',
            location: '대구시 중구'
          },
          {
            id: 'gwangju-chungjang',
            name: '광주 충장로점',
            academyCode: 'BA-KR-CJ-005',
            memberCount: 134,
            teacherCount: 9,
            recentTestCount: 28,
            status: '준비중',
            manager: '김태호',
            location: '광주시 동구'
          }
        ]);

        setTestTrendData([
          { name: '9/1', value: 186 },
          { name: '9/5', value: 214 },
          { name: '9/10', value: 198 },
          { name: '9/15', value: 245 },
          { name: '9/20', value: 289 },
          { name: '9/25', value: 261 }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const branchOptions: FilterOption[] = branches.map(branch => ({
    value: branch.id,
    label: branch.name
  }));

  const branchColumns: Column<BranchData>[] = [
    {
      id: 'name',
      label: '지점명',
      minWidth: 150,
      format: (value: string, row: BranchData) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn color="primary" fontSize="small" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.location}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'academyCode',
      label: '학원코드',
      minWidth: 130,
      align: 'center',
      format: (value: string) => (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
        />
      )
    },
    {
      id: 'manager',
      label: '관리자',
      minWidth: 100,
      align: 'left'
    },
    {
      id: 'memberCount',
      label: '회원 수',
      minWidth: 80,
      align: 'right',
      format: (value: number) => value.toLocaleString()
    },
    {
      id: 'teacherCount',
      label: '강사 수',
      minWidth: 80,
      align: 'right',
      format: (value: number) => value.toLocaleString()
    },
    {
      id: 'recentTestCount',
      label: '최근 응시',
      minWidth: 90,
      align: 'right',
      format: (value: number) => `${value}건`
    },
    {
      id: 'status',
      label: '상태',
      minWidth: 100,
      align: 'center',
      format: (value: string) => (
        <Chip
          label={value}
          size="small"
          color={value === '활성' ? 'success' : value === '준비중' ? 'warning' : 'default'}
          variant="filled"
        />
      )
    }
  ];

  const branchActions: ActionButton<BranchData>[] = [
    {
      icon: <School />,
      label: '관리',
      onClick: (row: BranchData) => {
        console.log('지점 관리:', row.name);
      },
      color: 'primary'
    },
    {
      icon: <QrCode />,
      label: '학원코드',
      onClick: (row: BranchData) => {
        console.log('학원코드 관리:', row.academyCode);
      },
      color: 'secondary'
    }
  ];

  const totalMembers = branches.reduce((sum, branch) => sum + branch.memberCount, 0);
  const totalTeachers = branches.reduce((sum, branch) => sum + branch.teacherCount, 0);
  const activeBranches = branches.filter(branch => branch.status === '활성').length;
  const avgScore = 85.7;
  const weeklyTests = branches.reduce((sum, branch) => sum + branch.recentTestCount, 0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* 글로벌 필터 */}
      <GlobalFilter
        branches={branchOptions}
        selectedBranches={selectedBranches}
        onBranchesChange={setSelectedBranches}
        showCountryFilter={false}
        showBranchFilter={true}
        showDateFilter={true}
      />

      {/* 나라 정보 헤더 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🇰🇷
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {countryName} 대시보드
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.firstName} {user?.lastName} ({user?.email})
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<Add />}>
                지점 생성
              </Button>
              <Button variant="contained" startIcon={<QrCode />}>
                학원코드 발급
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPI 카드 그리드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={2.4}>
          <KPICard
            title="나라 총 회원"
            value={totalMembers}
            label="명"
            change="+8.2%"
            changeType="increase"
            icon={<People />}
            description="전체 지점 회원 수"
            loading={loading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={2.4}>
          <KPICard
            title="외부 이용자"
            value={Math.round(totalMembers * 0.15)}
            label="명"
            change="+12.1%"
            changeType="increase"
            icon={<PersonAdd />}
            description="학원코드 없는 사용자"
            loading={loading}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={2.4}>
          <KPICard
            title="강사 수"
            value={totalTeachers}
            label="명"
            change="+3.4%"
            changeType="increase"
            icon={<School />}
            description="활동 중인 강사"
            loading={loading}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={2.4}>
          <KPICard
            title="이번 주 응시"
            value={weeklyTests}
            label="건"
            change="+18.7%"
            changeType="increase"
            icon={<Quiz />}
            description="레벨테스트 응시"
            loading={loading}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={2.4}>
          <KPICard
            title="평균 점수"
            value={avgScore}
            label="점"
            change="+1.2%"
            changeType="increase"
            icon={<TrendingUp />}
            description="레벨테스트 평균"
            loading={loading}
            color="success"
          />
        </Grid>
      </Grid>

      {/* 탭 인터페이스 */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="지점 관리" />
              <Tab label="회원 현황" />
              <Tab label="강사 관리" />
              <Tab label="통계 분석" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* 지점 관리 탭 */}
            <DataTable
              columns={branchColumns}
              data={branches}
              loading={loading}
              title="지점 현황"
              subtitle="전국 Boston Academy 지점 관리"
              actions={branchActions}
              searchable={true}
              searchPlaceholder="지점명 또는 관리자 검색..."
              emptyMessage="등록된 지점이 없습니다"
              pageSize={10}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* 회원 현황 탭 */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <CustomLineChart
                  data={testTrendData}
                  title="최근 30일 시험 응시 추이"
                  subtitle="지점별 레벨테스트 응시 현황"
                  height={350}
                  color="#2196f3"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      회원 분석
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">신규 가입 (이번 달)</Typography>
                        <Chip label="+67명" size="small" color="success" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">활성 사용자 비율</Typography>
                        <Chip label="78%" size="small" color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">평균 학습 시간</Typography>
                        <Chip label="24분/일" size="small" color="info" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* 강사 관리 탭 */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      강사 현황
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {totalTeachers}명
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      활동 중인 강사
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      신규 채용
                    </Typography>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      5명
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      이번 달 신규 강사
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      평균 만족도
                    </Typography>
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      4.6/5.0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      학생 강사 평가
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* 통계 분석 탭 */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <CustomBarChart
                  data={branches.map(branch => ({
                    name: branch.name.replace('점', ''),
                    value: branch.memberCount
                  }))}
                  title="지점별 회원 수"
                  subtitle="활성 회원 기준"
                  height={300}
                  color="#4caf50"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={12} lg={6}>
                <CustomBarChart
                  data={branches.map(branch => ({
                    name: branch.name.replace('점', ''),
                    value: branch.recentTestCount
                  }))}
                  title="지점별 시험 응시"
                  subtitle="최근 30일 기준"
                  height={300}
                  color="#ff9800"
                  loading={loading}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};