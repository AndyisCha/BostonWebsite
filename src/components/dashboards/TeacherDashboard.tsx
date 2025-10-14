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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import {
  School,
  People,
  Assignment,
  Grade,
  Comment,
  TrendingUp,
  AccessTime,
  AutoStories,
  Star,
  CheckCircle
} from '@mui/icons-material';
import { KPICard } from '../common/KPICard';
import { DataTable, Column, ActionButton } from '../common/DataTable';
import { GlobalFilter, FilterOption } from '../common/GlobalFilter';
import { CustomLineChart, CustomBarChart } from '../common/Charts';
import { useAuth } from '../../contexts/AuthContext';

interface StudentData {
  id: string;
  name: string;
  email: string;
  level: string;
  recentScore: number;
  avgScore: number;
  testCount: number;
  studyHours: number;
  lastActivity: string;
  status: 'active' | 'inactive';
  pendingComments: number;
}

interface ScoreData {
  name: string;
  value: number;
}

interface CommentTask {
  id: string;
  studentName: string;
  testName: string;
  score: number;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
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
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
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

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [commentTasks, setCommentTasks] = useState<CommentTask[]>([]);

  // 지점 정보 (사용자 정보에서 가져옴)
  const branchName = user?.branchId === 'seoul-gangnam' ? '서울 강남점' : '서울 홍대점';

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        // No students assigned yet - new teacher
        setStudents([]);

        // No score data yet - no students
        setScoreData([
          { name: '9/1', value: 0 },
          { name: '9/5', value: 0 },
          { name: '9/10', value: 0 },
          { name: '9/15', value: 0 },
          { name: '9/20', value: 0 },
          { name: '9/25', value: 0 }
        ]);

        // No comment tasks - no students yet
        setCommentTasks([]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const studentColumns: Column<StudentData>[] = [
    {
      id: 'name',
      label: '학생',
      minWidth: 150,
      format: (value: string, row: StudentData) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '14px' }}>
            {value.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'level',
      label: '현재 레벨',
      minWidth: 100,
      align: 'center',
      format: (value: string) => (
        <Chip label={value} size="small" color="primary" variant="outlined" />
      )
    },
    {
      id: 'recentScore',
      label: '최근 점수',
      minWidth: 100,
      align: 'right',
      format: (value: number) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 'bold',
            color: value >= 90 ? 'success.main' : value >= 80 ? 'warning.main' : 'error.main'
          }}
        >
          {value}점
        </Typography>
      )
    },
    {
      id: 'avgScore',
      label: '평균 점수',
      minWidth: 100,
      align: 'right',
      format: (value: number) => `${value}점`
    },
    {
      id: 'testCount',
      label: '시험 횟수',
      minWidth: 100,
      align: 'right',
      format: (value: number) => `${value}회`
    },
    {
      id: 'studyHours',
      label: '학습 시간',
      minWidth: 100,
      align: 'right',
      format: (value: number) => `${value}시간`
    },
    {
      id: 'pendingComments',
      label: '미채점',
      minWidth: 100,
      align: 'center',
      format: (value: number) => (
        value > 0 ? (
          <Badge badgeContent={value} color="error">
            <Comment color="action" />
          </Badge>
        ) : (
          <CheckCircle color="success" fontSize="small" />
        )
      )
    },
    {
      id: 'status',
      label: '상태',
      minWidth: 100,
      align: 'center',
      format: (value: string) => (
        <Chip
          label={value === 'active' ? '활성' : '비활성'}
          size="small"
          color={value === 'active' ? 'success' : 'default'}
          variant="filled"
        />
      )
    }
  ];

  const studentActions: ActionButton<StudentData>[] = [
    {
      icon: <Grade />,
      label: '성적 관리',
      onClick: (row: StudentData) => {
        console.log('성적 관리:', row.name);
      },
      color: 'primary'
    },
    {
      icon: <Comment />,
      label: '코멘트 작성',
      onClick: (row: StudentData) => {
        console.log('코멘트 작성:', row.name);
      },
      color: 'secondary',
      hidden: (row: StudentData) => row.pendingComments === 0
    }
  ];

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const avgScore = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length) : 0;
  const pendingComments = students.reduce((sum, s) => sum + s.pendingComments, 0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* 필터 (날짜만 사용) */}
      <GlobalFilter
        showCountryFilter={false}
        showBranchFilter={false}
        showDateFilter={true}
      />

      {/* 강사 정보 헤더 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                width: 48,
                height: 48,
                backgroundColor: 'secondary.light',
                fontSize: '20px'
              }}>
                👩‍🏫
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName} 강사님
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {branchName} | {user?.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<AutoStories />}>
                E-book 무제한 접근
              </Button>
              <Button variant="contained" startIcon={<Comment />} color="secondary">
                오답 코멘트 작성
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPI 카드 그리드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="내 지점 학생"
            value={totalStudents}
            label="명"
            change="0명"
            changeType="increase"
            icon={<People />}
            description="담당하는 학생 수"
            loading={loading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="활성 학생"
            value={activeStudents}
            label="명"
            change="0명"
            changeType="increase"
            icon={<School />}
            description="최근 활동한 학생"
            loading={loading}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="평균 점수"
            value={avgScore}
            label="점"
            change="0점"
            changeType="increase"
            icon={<TrendingUp />}
            description="학생들의 평균 성적"
            loading={loading}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="미채점 코멘트"
            value={pendingComments}
            label="개"
            change="0개"
            changeType="neutral"
            icon={<Comment />}
            description="작성 대기 중인 코멘트"
            loading={loading}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* 탭 인터페이스 */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="학생 성적표" />
              <Tab label="코멘트 작업" />
              <Tab label="성적 분석" />
              <Tab label="학습 현황" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* 학생 성적표 탭 */}
            <DataTable
              columns={studentColumns}
              data={students}
              loading={loading}
              title="학생 성적 관리"
              subtitle="담당 학생들의 종합 성적 현황"
              actions={studentActions}
              searchable={true}
              searchPlaceholder="학생명 또는 이메일 검색..."
              emptyMessage="담당 학생이 없습니다"
              pageSize={10}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* 코멘트 작업 탭 */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  오답 코멘트 작업 대기 목록
                </Typography>
                <List>
                  {commentTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        sx={{
                          border: 1,
                          borderColor: 'grey.200',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: `${getPriorityColor(task.priority)}.light` }}>
                            <Assignment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">{task.studentName}</Typography>
                              <Chip label={`${task.score}점`} size="small" color="primary" />
                              <Chip
                                label={task.priority.toUpperCase()}
                                size="small"
                                color={getPriorityColor(task.priority) as any}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {task.testName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                제출: {task.submittedAt}
                              </Typography>
                            </Box>
                          }
                        />
                        <Button variant="outlined" size="small" startIcon={<Comment />}>
                          코멘트 작성
                        </Button>
                      </ListItem>
                      {index < commentTasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      작업 통계
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">총 대기</Typography>
                        <Chip label={`${commentTasks.length}건`} size="small" color="warning" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">긴급 처리</Typography>
                        <Chip label="0건" size="small" color="error" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">이번 주 완료</Typography>
                        <Chip label="0건" size="small" color="success" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* 성적 분석 탭 */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <CustomLineChart
                  data={scoreData}
                  title="주간 평균 성적 추이"
                  subtitle="담당 학생들의 성적 변화"
                  height={300}
                  color="#2196f3"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <CustomBarChart
                  data={students.map(student => ({
                    name: student.name,
                    value: student.avgScore
                  }))}
                  title="학생별 평균 점수"
                  subtitle="개별 학생 성적 비교"
                  height={300}
                  color="#4caf50"
                  loading={loading}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* 학습 현황 탭 */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      학습 활동 현황
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">오늘 접속한 학생</Typography>
                        <Typography variant="h6" color="primary">0명</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">이번 주 시험 응시</Typography>
                        <Typography variant="h6" color="success.main">0회</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">평균 학습 시간</Typography>
                        <Typography variant="h6" color="warning.main">0분</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      성과 요약
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star color="warning" fontSize="small" />
                        <Typography variant="body2">담당 학생이 아직 없습니다</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp color="success" fontSize="small" />
                        <Typography variant="body2">학생이 배정되면 성과를 확인할 수 있습니다</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};