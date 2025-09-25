import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar, LinearProgress,
  IconButton, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon,
  List, ListItem, ListItemText, ListItemAvatar, Chip, Badge,
  Button, Tooltip, Divider, Alert, Collapse, Paper,
  CircularProgress, AvatarGroup, useTheme
} from '@mui/material';
import {
  Timeline, TimelineItem,
  TimelineSeparator, TimelineConnector, TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  TrendingUp, School, MenuBook, EmojiEvents, Settings,
  NotificationsActive, Person, Group, Assignment, Speed,
  Today, History, Star, PlayArrow, Pause, Stop,
  VolumeUp, VolumeOff, Bookmark, Share, Download,
  ExpandMore, ExpandLess, Refresh, Add, Edit
} from '@mui/icons-material';
import { ResponsiveContainer, ResponsiveGrid } from './ResponsiveContainer';
import { TouchButton } from './MobileOptimizations';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/UserDashboard.css';

interface DashboardData {
  user: {
    id: string;
    name: string;
    avatar: string;
    level: string;
    experience: number;
    nextLevelExp: number;
    streak: number;
    joinDate: string;
  };
  todayStats: {
    studyTime: number;
    lessonsCompleted: number;
    wordsLearned: number;
    accuracy: number;
  };
  weeklyProgress: {
    days: string[];
    studyTimes: number[];
    target: number;
  };
  currentCourse: {
    id: string;
    title: string;
    progress: number;
    nextLesson: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  recentActivity: Array<{
    id: string;
    type: 'lesson' | 'achievement' | 'reading' | 'test';
    title: string;
    timestamp: string;
    score?: number;
    icon: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    icon: string;
  }>;
  friends: Array<{
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    currentActivity?: string;
  }>;
  recommendations: Array<{
    id: string;
    type: 'lesson' | 'book' | 'test';
    title: string;
    description: string;
    difficulty: string;
    estimatedTime: number;
  }>;
}

interface StudySessionProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  duration: number;
}

const StudySessionControl: React.FC<StudySessionProps> = ({
  isActive,
  onStart,
  onPause,
  onStop,
  duration
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">학습 세션</Typography>
            <Typography variant="h4" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {formatTime(duration)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isActive ? (
              <TouchButton
                onClick={onStart}
                variant="contained"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                <PlayArrow />
              </TouchButton>
            ) : (
              <>
                <TouchButton
                  onClick={onPause}
                  variant="contained"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  <Pause />
                </TouchButton>
                <TouchButton
                  onClick={onStop}
                  variant="contained"
                  sx={{ bgcolor: 'rgba(255,100,100,0.3)', '&:hover': { bgcolor: 'rgba(255,100,100,0.5)' } }}
                >
                  <Stop />
                </TouchButton>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const UserDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studySession, setStudySession] = useState({ active: false, duration: 0 });
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const { isMobile } = useResponsive();
  const theme = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (studySession.active) {
      interval = setInterval(() => {
        setStudySession(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [studySession.active]);

  const loadDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockData: DashboardData = {
        user: {
          id: '1',
          name: 'John Doe',
          avatar: '/avatars/user.png',
          level: 'B2',
          experience: 2450,
          nextLevelExp: 3000,
          streak: 12,
          joinDate: '2023-01-15'
        },
        todayStats: {
          studyTime: 45,
          lessonsCompleted: 3,
          wordsLearned: 15,
          accuracy: 87
        },
        weeklyProgress: {
          days: ['월', '화', '수', '목', '금', '토', '일'],
          studyTimes: [30, 45, 60, 25, 40, 55, 35],
          target: 45
        },
        currentCourse: {
          id: 'business-english',
          title: 'Business English',
          progress: 68,
          nextLesson: 'Meeting Presentations',
          difficulty: 'intermediate'
        },
        recentActivity: [
          {
            id: '1',
            type: 'lesson',
            title: 'Completed: Email Writing Basics',
            timestamp: '2시간 전',
            score: 92,
            icon: '📚'
          },
          {
            id: '2',
            type: 'achievement',
            title: 'Unlocked: Week Warrior',
            timestamp: '5시간 전',
            icon: '🏆'
          },
          {
            id: '3',
            type: 'reading',
            title: 'Finished: Business Report',
            timestamp: '1일 전',
            score: 85,
            icon: '📖'
          },
          {
            id: '4',
            type: 'test',
            title: 'Grammar Test: Past Perfect',
            timestamp: '2일 전',
            score: 78,
            icon: '✏️'
          }
        ],
        achievements: [
          {
            id: '1',
            title: 'First Steps',
            description: '첫 번째 레슨 완료',
            unlockedAt: '2023-01-15',
            rarity: 'common',
            icon: '🎯'
          },
          {
            id: '2',
            title: 'Week Warrior',
            description: '7일 연속 학습',
            unlockedAt: '2023-12-10',
            rarity: 'rare',
            icon: '🔥'
          }
        ],
        friends: [
          {
            id: '2',
            name: 'Alice Smith',
            avatar: '/avatars/alice.png',
            isOnline: true,
            currentActivity: '영어 회화 연습 중'
          },
          {
            id: '3',
            name: 'Bob Johnson',
            avatar: '/avatars/bob.png',
            isOnline: false
          }
        ],
        recommendations: [
          {
            id: '1',
            type: 'lesson',
            title: 'Advanced Grammar: Conditionals',
            description: '가정법 완전 정복하기',
            difficulty: 'Advanced',
            estimatedTime: 30
          },
          {
            id: '2',
            type: 'book',
            title: 'Pride and Prejudice',
            description: '클래식 문학으로 어휘력 늘리기',
            difficulty: 'Intermediate',
            estimatedTime: 120
          }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudy = () => {
    setStudySession({ active: true, duration: 0 });
  };

  const handlePauseStudy = () => {
    setStudySession(prev => ({ ...prev, active: false }));
  };

  const handleStopStudy = () => {
    setStudySession({ active: false, duration: 0 });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'primary';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>대시보드를 불러오는 중...</Typography>
        </Box>
      </ResponsiveContainer>
    );
  }

  if (!dashboardData) {
    return (
      <ResponsiveContainer>
        <Alert severity="error">대시보드 데이터를 불러올 수 없습니다.</Alert>
      </ResponsiveContainer>
    );
  }

  const speedDialActions = [
    { icon: <School />, name: '새 레슨', onClick: () => console.log('새 레슨') },
    { icon: <MenuBook />, name: 'e-book', onClick: () => console.log('e-book') },
    { icon: <Assignment />, name: '레벨 테스트', onClick: () => console.log('레벨 테스트') },
    { icon: <Person />, name: '프로필', onClick: () => console.log('프로필') }
  ];

  return (
    <ResponsiveContainer>
      <Box sx={{ py: 3 }}>
        {/* Welcome Header */}
        <Card sx={{ mb: 3, overflow: 'visible', position: 'relative' }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              p: 3,
              color: 'white'
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  src={dashboardData.user.avatar}
                  sx={{ width: 80, height: 80, border: '3px solid white' }}
                >
                  {dashboardData.user.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h4" gutterBottom>
                  안녕하세요, {dashboardData.user.name.split(' ')[0]}님! 👋
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    icon={<School />}
                    label={`Level ${dashboardData.user.level}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${dashboardData.user.experience} XP`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<Star />}
                    label={`${dashboardData.user.streak}일 연속`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>

                {/* Experience Progress */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    다음 레벨까지: {dashboardData.user.nextLevelExp - dashboardData.user.experience} XP
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(dashboardData.user.experience / dashboardData.user.nextLevelExp) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white'
                      }
                    }}
                  />
                </Box>
              </Grid>

              {!isMobile && (
                <Grid item>
                  <IconButton
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    onClick={() => setNotifications(0)}
                  >
                    <Badge badgeContent={notifications} color="error">
                      <NotificationsActive />
                    </Badge>
                  </IconButton>
                </Grid>
              )}
            </Grid>
          </Box>
        </Card>

        {/* Study Session Control */}
        <StudySessionControl
          isActive={studySession.active}
          onStart={handleStartStudy}
          onPause={handlePauseStudy}
          onStop={handleStopStudy}
          duration={studySession.duration}
        />

        {/* Today's Stats */}
        <ResponsiveGrid columns={{ xs: 2, sm: 4 }} gap={2} className="stats-grid">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {formatTime(dashboardData.todayStats.studyTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                오늘 학습시간
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary" gutterBottom>
                {dashboardData.todayStats.lessonsCompleted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                완료한 레슨
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {dashboardData.todayStats.wordsLearned}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                새로운 단어
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {dashboardData.todayStats.accuracy}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                정답률
              </Typography>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Current Course */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">현재 수강 중인 코스</Typography>
                  <Chip
                    label={dashboardData.currentCourse.difficulty}
                    color={getDifficultyColor(dashboardData.currentCourse.difficulty) as any}
                    size="small"
                  />
                </Box>

                <Typography variant="h5" gutterBottom>
                  {dashboardData.currentCourse.title}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">진도율</Typography>
                    <Typography variant="body2">{dashboardData.currentCourse.progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.currentCourse.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  다음 레슨: {dashboardData.currentCourse.nextLesson}
                </Typography>

                <TouchButton
                  variant="contained"
                  fullWidth={isMobile}
                  startIcon={<PlayArrow />}
                >
                  학습 계속하기
                </TouchButton>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">최근 활동</Typography>
                  <Button
                    size="small"
                    onClick={() => setShowAllActivity(!showAllActivity)}
                    endIcon={showAllActivity ? <ExpandLess /> : <ExpandMore />}
                  >
                    {showAllActivity ? '접기' : '더보기'}
                  </Button>
                </Box>

                <Timeline>
                  {dashboardData.recentActivity
                    .slice(0, showAllActivity ? undefined : 3)
                    .map((activity, index) => (
                      <TimelineItem key={activity.id}>
                        <TimelineSeparator>
                          <TimelineDot color="primary">
                            {activity.icon}
                          </TimelineDot>
                          {index < dashboardData.recentActivity.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body1">{activity.title}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {activity.timestamp}
                            </Typography>
                            {activity.score && (
                              <Chip
                                label={`${activity.score}점`}
                                size="small"
                                color={activity.score >= 80 ? 'success' : 'warning'}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                </Timeline>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>빠른 실행</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TouchButton variant="outlined" fullWidth size="small">
                      <School sx={{ mr: 1 }} />
                      새 레슨
                    </TouchButton>
                  </Grid>
                  <Grid item xs={6}>
                    <TouchButton variant="outlined" fullWidth size="small">
                      <MenuBook sx={{ mr: 1 }} />
                      e-book
                    </TouchButton>
                  </Grid>
                  <Grid item xs={6}>
                    <TouchButton variant="outlined" fullWidth size="small">
                      <Assignment sx={{ mr: 1 }} />
                      테스트
                    </TouchButton>
                  </Grid>
                  <Grid item xs={6}>
                    <TouchButton variant="outlined" fullWidth size="small">
                      <Speed sx={{ mr: 1 }} />
                      복습
                    </TouchButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>최근 성취</Typography>
                <List dense>
                  {dashboardData.achievements.slice(-2).map((achievement) => (
                    <ListItem key={achievement.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {achievement.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={achievement.title}
                        secondary={achievement.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Friends Online */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>온라인 친구</Typography>
                <List dense>
                  {dashboardData.friends
                    .filter(friend => friend.isOnline)
                    .map((friend) => (
                      <ListItem key={friend.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Badge
                            badgeContent=""
                            color="success"
                            variant="dot"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          >
                            <Avatar src={friend.avatar}>
                              {friend.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={friend.name}
                          secondary={friend.currentActivity || '온라인'}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>추천 콘텐츠</Typography>
                {dashboardData.recommendations.map((rec) => (
                  <Paper
                    key={rec.id}
                    variant="outlined"
                    sx={{ p: 2, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {rec.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={rec.difficulty}
                        size="small"
                        color={getDifficultyColor(rec.difficulty) as any}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(rec.estimatedTime)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Speed Dial */}
        {isMobile && (
          <SpeedDial
            ariaLabel="빠른 실행"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            onClose={() => setSpeedDialOpen(false)}
            onOpen={() => setSpeedDialOpen(true)}
            open={speedDialOpen}
          >
            {speedDialActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.onClick}
              />
            ))}
          </SpeedDial>
        )}
      </Box>
    </ResponsiveContainer>
  );
};

export default UserDashboard;