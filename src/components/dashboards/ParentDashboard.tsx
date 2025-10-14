import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import {
  People,
  Notifications,
  TrendingUp,
  TrendingDown,
  School,
  Quiz,
  AutoStories,
  Grade,
  Settings,
  Email,
  Sms,
  Phone,
  Schedule
} from '@mui/icons-material';
import { KPICard } from '../common/KPICard';
import { GlobalFilter } from '../common/GlobalFilter';
import { CustomLineChart } from '../common/Charts';
import { useAuth } from '../../contexts/AuthContext';

interface ChildData {
  id: string;
  name: string;
  level: string;
  recentScore: number;
  previousScore: number;
  testCount: number;
  studyHours: number;
  lastActivity: string;
  trend: 'up' | 'down' | 'stable';
  progressData: { name: string; value: number }[];
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  scoreUpdate: boolean;
  levelUp: boolean;
  weeklyReport: boolean;
  inactivity: boolean;
}

interface RecentActivity {
  id: string;
  childName: string;
  type: 'test' | 'study' | 'achievement' | 'level_up';
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildData[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    scoreUpdate: true,
    levelUp: true,
    weeklyReport: true,
    inactivity: false
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        // No children registered yet
        setChildren([]);

        // No recent activities yet
        setRecentActivities([]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />;
      default:
        return <TrendingUp sx={{ color: 'text.secondary', fontSize: 20, transform: 'rotate(90deg)' }} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'test': return <Quiz />;
      case 'study': return <AutoStories />;
      case 'achievement': return <Grade />;
      case 'level_up': return <TrendingUp />;
      default: return <School />;
    }
  };

  const totalChildren = children.length;
  const avgScore = children.length > 0 ? Math.round(children.reduce((sum, child) => sum + child.recentScore, 0) / children.length) : 0;
  const totalStudyHours = children.reduce((sum, child) => sum + child.studyHours, 0);
  const recentAlerts = recentActivities.length;

  return (
    <Box>
      {/* 필터 (날짜만 사용) */}
      <GlobalFilter
        showCountryFilter={false}
        showBranchFilter={false}
        showDateFilter={true}
      />

      {/* 부모 정보 헤더 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                width: 48,
                height: 48,
                backgroundColor: 'info.light',
                fontSize: '20px'
              }}>
                👨‍👩‍👧‍👦
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName} 학부모님
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalChildren}명의 자녀 학습 현황 | {user?.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications color="primary" />
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                실시간 알림 설정됨
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPI 카드 그리드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="연결된 자녀"
            value={totalChildren}
            label="명"
            change="0명"
            changeType="neutral"
            icon={<People />}
            description="관리 중인 자녀 수"
            loading={loading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="평균 성적"
            value={avgScore}
            label="점"
            change="0점"
            changeType="increase"
            icon={<Grade />}
            description="자녀들의 평균 점수"
            loading={loading}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="총 학습 시간"
            value={totalStudyHours}
            label="시간"
            change="0시간"
            changeType="increase"
            icon={<Schedule />}
            description="이번 달 누적 시간"
            loading={loading}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="최근 성적 알림"
            value={recentAlerts}
            label="개"
            change="0개"
            changeType="increase"
            icon={<Notifications />}
            description="읽지 않은 알림"
            loading={loading}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* 자녀별 상세 정보 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {children.map((child) => (
          <Grid item xs={12} md={6} key={child.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ backgroundColor: 'secondary.light' }}>
                      {child.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {child.name}
                      </Typography>
                      <Chip label={child.level} size="small" color="primary" variant="outlined" />
                    </Box>
                  </Box>
                  {getTrendIcon(child.trend)}
                </Box>

                {/* 성적 정보 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      최근 성적
                    </Typography>
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      color: child.trend === 'up' ? 'success.main' : child.trend === 'down' ? 'error.main' : 'text.primary'
                    }}>
                      {child.recentScore}점
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    이전: {child.previousScore}점 →
                    <span style={{ color: child.trend === 'up' ? '#4caf50' : child.trend === 'down' ? '#f44336' : '#666' }}>
                      {child.recentScore > child.previousScore ? '+' : ''}{child.recentScore - child.previousScore}점
                    </span>
                  </Typography>
                </Box>

                {/* 미니 차트 */}
                <Box sx={{ mb: 2, height: 120 }}>
                  <CustomLineChart
                    data={child.progressData}
                    height={120}
                    color={child.trend === 'up' ? '#4caf50' : child.trend === 'down' ? '#f44336' : '#2196f3'}
                    loading={loading}
                  />
                </Box>

                {/* 추가 정보 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      시험 {child.testCount}회 | 학습 {child.studyHours}시간
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      최근 활동: {child.lastActivity}
                    </Typography>
                  </Box>
                  <IconButton size="small" color="primary">
                    <Settings />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 하단 섹션 */}
      <Grid container spacing={3}>
        {/* 최근 활동 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                최근 학습 활동
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{
                          backgroundColor: `${activity.color}.light`,
                          width: 32,
                          height: 32
                        }}>
                          {getActivityTypeIcon(activity.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              {activity.childName}
                            </Typography>
                            <Typography variant="body2">
                              {activity.description}
                            </Typography>
                          </Box>
                        }
                        secondary={activity.timestamp}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 알림 설정 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                알림 설정
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                알림 채널
              </Typography>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" />
                      <Typography variant="body2">이메일</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Sms fontSize="small" />
                      <Typography variant="body2">SMS</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" />
                      <Typography variant="body2">푸시 알림</Typography>
                    </Box>
                  }
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                알림 유형
              </Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.scoreUpdate}
                      onChange={() => handleNotificationChange('scoreUpdate')}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">성적 업데이트</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.levelUp}
                      onChange={() => handleNotificationChange('levelUp')}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">레벨 상승</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.weeklyReport}
                      onChange={() => handleNotificationChange('weeklyReport')}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">주간 리포트</Typography>}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.inactivity}
                      onChange={() => handleNotificationChange('inactivity')}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">학습 중단 알림</Typography>}
                />
              </Box>

              {notifications.email && notifications.scoreUpdate && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  성적이 업데이트되면 즉시 이메일로 알려드립니다.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};