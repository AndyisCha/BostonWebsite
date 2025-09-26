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
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider
} from '@mui/material';
import {
  AutoStories,
  Quiz,
  TrendingUp,
  School,
  Schedule,
  Star,
  PlayArrow,
  BookmarkBorder,
  Assignment,
  Grade,
  EmojiEvents,
  AccessTime
} from '@mui/icons-material';
import { KPICard } from '../common/KPICard';
import { CustomLineChart, CustomBarChart } from '../common/Charts';
import { useAuth } from '../../contexts/AuthContext';

interface StudyGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

interface RecentEbook {
  id: string;
  title: string;
  level: string;
  progress: number;
  lastRead: string;
  coverUrl?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earnedAt: string;
}

interface LevelInfo {
  current: string;
  progress: number;
  nextLevel: string;
  pointsNeeded: number;
  totalPoints: number;
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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
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

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [recentEbooks, setRecentEbooks] = useState<RecentEbook[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    current: 'B1-2',
    progress: 75,
    nextLevel: 'B1-3',
    pointsNeeded: 250,
    totalPoints: 1000
  });
  const [scoreData, setScoreData] = useState([
    { name: '9/1', value: 78 },
    { name: '9/5', value: 82 },
    { name: '9/10', value: 79 },
    { name: '9/15', value: 85 },
    { name: '9/20', value: 88 },
    { name: '9/25', value: 91 }
  ]);

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        setStudyGoals([
          {
            id: 'ebooks',
            title: 'E-book 읽기',
            current: 12,
            target: 15,
            unit: '권',
            color: 'primary',
            icon: <AutoStories />
          },
          {
            id: 'study_time',
            title: '학습 시간',
            current: 24,
            target: 30,
            unit: '시간',
            color: 'info',
            icon: <Schedule />
          },
          {
            id: 'tests',
            title: '테스트 완료',
            current: 8,
            target: 10,
            unit: '개',
            color: 'warning',
            icon: <Quiz />
          },
          {
            id: 'streak',
            title: '연속 학습',
            current: 7,
            target: 14,
            unit: '일',
            color: 'success',
            icon: <Star />
          }
        ]);

        setRecentEbooks([
          {
            id: 'ebook-001',
            title: 'Business English Essentials',
            level: 'B1-2',
            progress: 68,
            lastRead: '2시간 전'
          },
          {
            id: 'ebook-002',
            title: 'Everyday Conversations',
            level: 'B1-1',
            progress: 100,
            lastRead: '1일 전'
          },
          {
            id: 'ebook-003',
            title: 'Grammar in Use',
            level: 'B1-2',
            progress: 42,
            lastRead: '3일 전'
          }
        ]);

        setAchievements([
          {
            id: 'achievement-001',
            title: '레벨업 마스터',
            description: 'B1-1에서 B1-2로 레벨업!',
            icon: <TrendingUp />,
            color: 'success',
            earnedAt: '2024-09-20'
          },
          {
            id: 'achievement-002',
            title: '독서왕',
            description: '이번 달 10권 완독 달성',
            icon: <AutoStories />,
            color: 'primary',
            earnedAt: '2024-09-18'
          },
          {
            id: 'achievement-003',
            title: '완벽한 점수',
            description: 'Grammar Test에서 100점 달성!',
            icon: <EmojiEvents />,
            color: 'warning',
            earnedAt: '2024-09-15'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const currentScore = scoreData[scoreData.length - 1]?.value || 0;
  const previousScore = scoreData[scoreData.length - 2]?.value || 0;
  const scoreChange = currentScore - previousScore;

  return (
    <Box>
      {/* 학생 정보 헤더 */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                width: 64,
                height: 64,
                backgroundColor: 'rgba(255,255,255,0.2)',
                fontSize: '28px'
              }}>
                👨‍🎓
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  안녕하세요, {user?.firstName}님! 🌟
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`현재 레벨: ${levelInfo.current}`}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                  />
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    다음 레벨까지 {levelInfo.pointsNeeded}점 남았어요!
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 레벨 진행바 */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                레벨 진행도
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {levelInfo.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={levelInfo.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
              {levelInfo.totalPoints - levelInfo.pointsNeeded}/{levelInfo.totalPoints} 포인트
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* KPI 카드 그리드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="최근 점수"
            value={currentScore}
            label="점"
            change={scoreChange > 0 ? `+${scoreChange}점` : `${scoreChange}점`}
            changeType={scoreChange > 0 ? 'increase' : scoreChange < 0 ? 'decrease' : 'neutral'}
            icon={<Grade />}
            description="가장 최근 시험 점수"
            loading={loading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="완독한 책"
            value={12}
            label="권"
            change="+3권"
            changeType="increase"
            icon={<AutoStories />}
            description="이번 달 완독"
            loading={loading}
            color="success"
            progress={80}
            target={15}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="학습 시간"
            value={24}
            label="시간"
            change="+2시간"
            changeType="increase"
            icon={<AccessTime />}
            description="이번 주 누적"
            loading={loading}
            color="info"
            progress={80}
            target={30}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="연속 학습"
            value={7}
            label="일"
            change="+1일"
            changeType="increase"
            icon={<Star />}
            description="연속 접속 기록"
            loading={loading}
            color="warning"
            progress={50}
            target={14}
          />
        </Grid>
      </Grid>

      {/* 탭 인터페이스 */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="학습 목표" />
              <Tab label="최근 학습" />
              <Tab label="성적 분석" />
              <Tab label="성취도" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* 학습 목표 탭 */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              이번 달 학습 목표 📚
            </Typography>
            <Grid container spacing={3}>
              {studyGoals.map((goal) => (
                <Grid item xs={12} md={6} key={goal.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ backgroundColor: `${goal.color}.light` }}>
                          {goal.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {goal.title}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            진행 상황
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {goal.current}/{goal.target} {goal.unit}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(goal.current / goal.target) * 100}
                          color={goal.color as any}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {goal.target - goal.current > 0
                          ? `목표까지 ${goal.target - goal.current}${goal.unit} 남았어요!`
                          : '목표 달성! 🎉'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* 최근 학습 탭 */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              최근 읽은 E-book 📖
            </Typography>
            <Grid container spacing={3}>
              {recentEbooks.map((ebook) => (
                <Grid item xs={12} md={6} lg={4} key={ebook.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {ebook.title}
                        </Typography>
                        <Chip label={ebook.level} size="small" color="primary" variant="outlined" />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            읽기 진도
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ebook.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={ebook.progress}
                          color={ebook.progress === 100 ? 'success' : 'primary'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          마지막 읽기: {ebook.lastRead}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={ebook.progress === 100 ? <BookmarkBorder /> : <PlayArrow />}
                          color="primary"
                        >
                          {ebook.progress === 100 ? '다시 읽기' : '이어 읽기'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* 성적 분석 탭 */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <CustomLineChart
                  data={scoreData}
                  title="최근 성적 변화"
                  subtitle="시험별 점수 추이를 확인해보세요"
                  height={350}
                  color="#2196f3"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      성적 요약
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">최고 점수</Typography>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                          91점
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">평균 점수</Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          84점
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">시험 횟수</Typography>
                        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
                          15회
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">향상도</Typography>
                        <Chip label="+13점 UP!" size="small" color="success" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* 성취도 탭 */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              최근 성취 목록 🏆
            </Typography>
            <List>
              {achievements.map((achievement, index) => (
                <React.Fragment key={achievement.id}>
                  <ListItem sx={{
                    border: 1,
                    borderColor: 'grey.200',
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: 'grey.50'
                  }}>
                    <ListItemIcon>
                      <Avatar sx={{ backgroundColor: `${achievement.color}.light` }}>
                        {achievement.icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {achievement.title}
                          </Typography>
                          <Chip label="NEW" size="small" color="warning" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {achievement.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            달성일: {achievement.earnedAt}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < achievements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};