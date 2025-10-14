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
  Chip,
  Avatar,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  People,
  PersonAdd,
  School,
  QrCode,
  TrendingUp,
  Quiz,
  Assignment,
  MenuBook,
  Settings,
  Timeline,
  Info
} from '@mui/icons-material';
import { KPICard } from '../common/KPICard';
import { DataTable, Column, ActionButton } from '../common/DataTable';
import { GlobalFilter, FilterOption } from '../common/GlobalFilter';
import { CustomBarChart, CustomLineChart, CustomPieChart } from '../common/Charts';
import { useAuth } from '../../contexts/AuthContext';
import {
  REALISTIC_BRANCH_DATA,
  REALISTIC_MEMBERS,
  REALISTIC_EBOOKS,
  DataManager,
  MANAGEMENT_RECOMMENDATIONS,
  RealisticMemberData
} from '../../data/mockData';

interface MemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  level: string;
  status: string;
  lastLogin: string;
  testCount: number;
  avgScore: number;
}

interface TeacherData {
  id: string;
  name: string;
  email: string;
  studentCount: number;
  avgScore: number;
  status: string;
  joinedDate: string;
}

interface TestResultData {
  id: string;
  studentName: string;
  testType: string;
  score: number;
  level: string;
  date: string;
  status: string;
}

interface ChartData {
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const BranchDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: any}>({});

  // Realistic data with management utilities
  const [branchData, setBranchData] = useState(REALISTIC_BRANCH_DATA);
  const [showGrowthSimulation, setShowGrowthSimulation] = useState(false);

  const [members, setMembers] = useState<MemberData[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [testResults, setTestResults] = useState<TestResultData[]>([]);
  const [chartData, setChartData] = useState<{
    levelDistribution: ChartData[];
    monthlyTests: ChartData[];
    scoreDistribution: ChartData[];
  }>({
    levelDistribution: [],
    monthlyTests: [],
    scoreDistribution: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // Load realistic data with management utilities
    setTimeout(() => {
      // Convert realistic data to component format
      const realisticMembers: MemberData[] = REALISTIC_MEMBERS.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        level: member.level,
        status: member.status,
        lastLogin: member.lastLogin,
        testCount: member.testCount,
        avgScore: member.avgScore
      }));

      // Separate teachers for teacher management
      const teacherData: TeacherData[] = REALISTIC_MEMBERS
        .filter(member => member.role === 'TEACHER')
        .map(teacher => {
          const studentCount = REALISTIC_MEMBERS.filter(m => m.role === 'STUDENT').length;
          const studentsWithScores = REALISTIC_MEMBERS.filter(m => m.role === 'STUDENT' && m.testCount > 0);
          const avgScore = studentsWithScores.length > 0
            ? studentsWithScores.reduce((sum, s) => sum + s.avgScore, 0) / studentsWithScores.length
            : 0;

          return {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            studentCount: Math.floor(studentCount / REALISTIC_MEMBERS.filter(m => m.role === 'TEACHER').length),
            avgScore: Math.round(avgScore * 10) / 10,
            status: teacher.status,
            joinedDate: teacher.joinedDate
          };
        });

      // Generate test results from realistic member data
      const realisticTestResults: TestResultData[] = REALISTIC_MEMBERS
        .filter(member => member.role === 'STUDENT' && member.testCount > 0)
        .map((student, index) => ({
          id: `test-${index + 1}`,
          studentName: student.name,
          testType: student.testCount === 1 ? 'Initial Level Test' : 'Progress Test',
          score: student.avgScore,
          level: student.level,
          date: student.lastLogin,
          status: 'completed'
        }));

      // Generate realistic chart data from actual member data
      const students = REALISTIC_MEMBERS.filter(m => m.role === 'STUDENT');
      const levelCounts = students.reduce((acc, student) => {
        acc[student.level] = (acc[student.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const realisticChartData = {
        levelDistribution: Object.entries(levelCounts).map(([level, count]) => ({
          name: level,
          value: count
        })),
        monthlyTests: [
          { name: '이번 주', value: realisticTestResults.length },
          { name: '지난 주', value: 0 },
          { name: '2주 전', value: 0 },
          { name: '3주 전', value: 0 },
        ],
        scoreDistribution: realisticTestResults.length > 0 ? [
          { name: '0-59', value: realisticTestResults.filter(t => t.score < 60).length },
          { name: '60-69', value: realisticTestResults.filter(t => t.score >= 60 && t.score < 70).length },
          { name: '70-79', value: realisticTestResults.filter(t => t.score >= 70 && t.score < 80).length },
          { name: '80-89', value: realisticTestResults.filter(t => t.score >= 80 && t.score < 90).length },
          { name: '90-100', value: realisticTestResults.filter(t => t.score >= 90).length }
        ] : []
      };

      setMembers(realisticMembers);
      setTeachers(teacherData);
      setTestResults(realisticTestResults);
      setChartData(realisticChartData);
      setLoading(false);
    }, 1000);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'role',
      label: '역할',
      type: 'multiselect',
      options: [
        { value: 'STUDENT', label: '학생' },
        { value: 'TEACHER', label: '강사' },
        { value: 'PARENT', label: '부모' }
      ]
    },
    {
      key: 'level',
      label: '레벨',
      type: 'multiselect',
      options: [
        { value: 'A1', label: 'A1' },
        { value: 'A2', label: 'A2' },
        { value: 'B1', label: 'B1' },
        { value: 'B2', label: 'B2' },
        { value: 'C1', label: 'C1' },
        { value: 'C2', label: 'C2' }
      ]
    },
    {
      key: 'dateRange',
      label: '기간',
      type: 'daterange'
    }
  ];

  // Table columns
  const memberColumns: Column<MemberData>[] = [
    {
      key: 'name',
      label: '이름',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>{row.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'role',
      label: '역할',
      render: (row) => (
        <Chip
          label={row.role === 'STUDENT' ? '학생' : row.role === 'PARENT' ? '부모' : '기타'}
          color={row.role === 'STUDENT' ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    { key: 'level', label: '레벨' },
    {
      key: 'status',
      label: '상태',
      render: (row) => (
        <Chip
          label={row.status === 'active' ? '활성' : '비활성'}
          color={row.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { key: 'lastLogin', label: '최근 로그인' },
    { key: 'testCount', label: '테스트 수' },
    { key: 'avgScore', label: '평균 점수' }
  ];

  const teacherColumns: Column<TeacherData>[] = [
    {
      key: 'name',
      label: '강사명',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>{row.name.charAt(0)}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Box>
        </Box>
      )
    },
    { key: 'studentCount', label: '담당 학생 수' },
    { key: 'avgScore', label: '학생 평균 점수' },
    {
      key: 'status',
      label: '상태',
      render: (row) => (
        <Chip
          label={row.status === 'active' ? '활성' : '비활성'}
          color={row.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { key: 'joinedDate', label: '입사일' }
  ];

  const testColumns: Column<TestResultData>[] = [
    { key: 'studentName', label: '학생명' },
    { key: 'testType', label: '테스트 유형' },
    { key: 'score', label: '점수' },
    { key: 'level', label: '레벨' },
    { key: 'date', label: '응시일' },
    {
      key: 'status',
      label: '상태',
      render: (row) => (
        <Chip
          label={row.status === 'completed' ? '완료' : '진행중'}
          color={row.status === 'completed' ? 'success' : 'warning'}
          size="small"
        />
      )
    }
  ];

  // Action buttons
  const memberActions: ActionButton<MemberData>[] = [
    {
      label: '관리',
      color: 'primary',
      onClick: (row) => console.log('Manage member:', row.id)
    },
    {
      label: '메시지',
      color: 'secondary',
      onClick: (row) => console.log('Send message to:', row.id)
    }
  ];

  const teacherActions: ActionButton<TeacherData>[] = [
    {
      label: '상세',
      color: 'primary',
      onClick: (row) => console.log('View teacher details:', row.id)
    },
    {
      label: '스케줄',
      color: 'secondary',
      onClick: (row) => console.log('View teacher schedule:', row.id)
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>지점 대시보드를 로드하는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          지점 관리 대시보드
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {branchData.name} ({branchData.academyCode})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          안녕하세요, {(user as any)?.name || user?.email?.split('@')[0]}님. 지점을 효율적으로 관리해보세요.
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <GlobalFilter
          filters={filterOptions}
          onFilterChange={handleFilterChange}
          selectedFilters={selectedFilters}
        />
      </Box>

      {/* Management Recommendations */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info />
          지점 운영 가이드
        </AlertTitle>
        <Typography variant="body2">
          <strong>신규 지점:</strong> 아직 등록된 회원이 없습니다.
          먼저 학원 코드를 생성하여 회원을 모집하세요. 초기 목표는 주 1-2명의 신규 회원입니다.
        </Typography>
      </Alert>

      {/* Realistic KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            title="총 회원수"
            value={DataManager.getBranchKPIs(branchData, members).memberCount}
            unit="명"
            trend={{ value: branchData.thisWeekNewMembers, isPositive: branchData.thisWeekNewMembers > 0 }}
            color="primary"
            icon={<People />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            title="외부 이용자"
            value={DataManager.getBranchKPIs(branchData, members).outsideUsers}
            unit="명"
            trend={{ value: 0, isPositive: false }}
            color="secondary"
            icon={<PersonAdd />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            title="강사 수"
            value={DataManager.getBranchKPIs(branchData, members).teacherCount}
            unit="명"
            trend={{ value: 0, isPositive: false }}
            color="success"
            icon={<School />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            title="이번 주 테스트"
            value={DataManager.getBranchKPIs(branchData, members).todayTests}
            unit="건"
            trend={{ value: testResults.length, isPositive: testResults.length > 0 }}
            color="info"
            icon={<Quiz />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            title="평균 점수"
            value={DataManager.getBranchKPIs(branchData, members).avgScore || 0}
            unit="점"
            trend={{ value: 0, isPositive: false }}
            color="warning"
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Button
                fullWidth
                variant="contained"
                startIcon={<QrCode />}
                sx={{ height: '100%', minHeight: 80 }}
                onClick={() => window.open('/academy-codes', '_blank')}
              >
                학원 코드 관리
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Growth Simulation Button */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => {
            const simulatedData = DataManager.simulateGrowth(branchData, 30);
            setBranchData(simulatedData);
            setShowGrowthSimulation(true);
          }}
        >
          📈 30일 성장 시뮬레이션
        </Button>
        {showGrowthSimulation && (
          <Button
            variant="text"
            onClick={() => {
              setBranchData(REALISTIC_BRANCH_DATA);
              setShowGrowthSimulation(false);
            }}
          >
            초기 상태로 되돌리기
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<People />} label="회원 관리" />
            <Tab icon={<School />} label="강사 관리" />
            <Tab icon={<Assignment />} label="레벨 테스트" />
            <Tab icon={<MenuBook />} label="E-book 권한" />
            <Tab icon={<Timeline />} label="통계 분석" />
            <Tab icon={<Settings />} label="지점 설정" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {members.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                🎓 아직 등록된 회원이 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                학원 코드를 생성하여 첫 회원을 모집해보세요
              </Typography>
              <Button
                variant="contained"
                startIcon={<QrCode />}
                onClick={() => window.open('/academy-codes', '_blank')}
              >
                학원 코드 생성하기
              </Button>
            </Box>
          ) : (
            <DataTable
              data={members}
              columns={memberColumns}
              actions={memberActions}
              searchPlaceholder="회원 검색..."
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {teachers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                👩‍🏫 아직 등록된 강사가 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                강사를 추가하여 학원 운영을 시작하세요
              </Typography>
              <Button variant="outlined" startIcon={<PersonAdd />}>
                강사 추가하기
              </Button>
            </Box>
          ) : (
            <DataTable
              data={teachers}
              columns={teacherColumns}
              actions={teacherActions}
              searchPlaceholder="강사 검색..."
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {testResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                📝 아직 실시된 테스트가 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                학생이 등록되면 레벨 테스트를 진행할 수 있습니다
              </Typography>
              <Button variant="outlined" startIcon={<Quiz />} disabled>
                테스트 관리
              </Button>
            </Box>
          ) : (
            <DataTable
              data={testResults}
              columns={testColumns}
              searchPlaceholder="테스트 결과 검색..."
            />
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>E-book 권한 관리</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>회원권별 E-book 권한</Typography>
                    <CustomPieChart
                      data={[
                        { name: '무제한', value: 45 },
                        { name: '월 10권', value: 120 },
                        { name: '월 5권', value: 80 }
                      ]}
                      height={300}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>이용 통계</Typography>
                    <CustomLineChart
                      data={chartData.monthlyTests}
                      height={300}
                      xAxisDataKey="name"
                      lines={[{ dataKey: 'value', stroke: '#8884d8', name: 'E-book 이용 수' }]}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>레벨별 분포</Typography>
                  <CustomPieChart data={chartData.levelDistribution} height={300} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>월별 테스트 응시</Typography>
                  <CustomBarChart
                    data={chartData.monthlyTests}
                    height={300}
                    xAxisDataKey="name"
                    bars={[{ dataKey: 'value', fill: '#8884d8', name: '응시 수' }]}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>점수 분포</Typography>
                  <CustomBarChart
                    data={chartData.scoreDistribution}
                    height={300}
                    xAxisDataKey="name"
                    bars={[{ dataKey: 'value', fill: '#82ca9d', name: '인원 수' }]}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>지점 설정 및 운영 가이드</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>기본 정보</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography><strong>지점명:</strong> {branchData.name}</Typography>
                      <Typography><strong>학원코드:</strong> {branchData.academyCode}</Typography>
                      <Typography><strong>관리자:</strong> {(user as any)?.name || user?.email}</Typography>
                      <Typography><strong>설립일:</strong> {branchData.established}</Typography>
                      <Typography><strong>상태:</strong> {branchData.status === 'active' ? '운영중' : '중지'}</Typography>
                      <Button variant="outlined" startIcon={<Settings />}>
                        기본 정보 수정
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>회원권 정책</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography><strong>기본 회원권:</strong> 월 5권 제한</Typography>
                      <Typography><strong>프리미엄:</strong> 무제한</Typography>
                      <Typography><strong>체험 회원:</strong> 월 2권</Typography>
                      <Button variant="outlined" startIcon={<MenuBook />}>
                        정책 관리
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Management Recommendations */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>운영 가이드라인</Typography>
                    <Grid container spacing={2}>
                      {Object.entries(MANAGEMENT_RECOMMENDATIONS).map(([key, recommendation]) => (
                        <Grid item xs={12} md={6} key={key}>
                          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              {recommendation.title}
                            </Typography>
                            <Box component="ul" sx={{ pl: 2 }}>
                              {recommendation.suggestions.map((suggestion, index) => (
                                <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                                  {suggestion}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Current Status */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>현재 지점 현황 분석</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Alert severity="warning">
                          <Typography variant="body2">
                            <strong>강사 대 학생 비율:</strong><br/>
                            아직 강사와 학생이 등록되지 않았습니다.
                            먼저 강사를 추가하고 학원 코드로 학생을 모집하세요.
                          </Typography>
                        </Alert>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Alert severity="info">
                          <Typography variant="body2">
                            <strong>테스트 진행률:</strong><br/>
                            학생이 등록되면 레벨 테스트를 시작할 수 있습니다.
                            초기 레벨 평가가 중요합니다.
                          </Typography>
                        </Alert>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Alert severity="info">
                          <Typography variant="body2">
                            <strong>성장 단계:</strong><br/>
                            시작 단계 - 아직 등록된 회원이 없습니다.
                            첫 목표: 5명의 학생과 1명의 강사
                          </Typography>
                        </Alert>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};