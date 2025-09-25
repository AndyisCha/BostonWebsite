import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Avatar, Typography, Button, TextField,
  Grid, Chip, LinearProgress, IconButton, Tabs, Tab, Badge,
  List, ListItem, ListItemIcon, ListItemText, Divider,
  Alert, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogActions, Switch, FormControlLabel, Slider,
  Accordion, AccordionSummary, AccordionDetails, Tooltip,
  CircularProgress, Rating, AvatarGroup
} from '@mui/material';
import {
  Edit, PhotoCamera, School, TrendingUp, EmojiEvents as Award, Book,
  Settings, Notifications, Security, Language, Palette,
  CloudUpload, Download, Share, Star, Person, Group,
  Assignment, Timeline, Verified,
  ExpandMore, Info, Warning, CheckCircle
} from '@mui/icons-material';
import { useResponsive } from '../hooks/useResponsive';
import { ResponsiveContainer } from './ResponsiveContainer';
import { TouchButton } from './MobileOptimizations';
import '../styles/UserProfile.css';

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  level: string;
  experience: number;
  totalStudyTime: number;
  joinDate: string;
  lastActive: string;
  achievements: Achievement[];
  statistics: UserStatistics;
  preferences: UserPreferences;
  courses: CourseProgress[];
  friends: Friend[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserStatistics {
  totalLessons: number;
  completedLessons: number;
  correctAnswers: number;
  totalAnswers: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  studyTimeToday: number;
  studyTimeWeek: number;
  studyTimeMonth: number;
  booksRead: number;
  vocabularySize: number;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    studyReminders: boolean;
    achievements: boolean;
    social: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showProgress: boolean;
    showAchievements: boolean;
  };
  study: {
    dailyGoal: number;
    autoPlay: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
  };
}

interface CourseProgress {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
}

interface Friend {
  id: string;
  username: string;
  avatar: string;
  level: string;
  isOnline: boolean;
}

interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  isOwnProfile = true
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [avatarDialog, setAvatarDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const { isMobile } = useResponsive();

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: UserData = {
        id: userId || '1',
        username: 'learner123',
        email: 'learner@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: '/avatars/default.png',
        level: 'B2',
        experience: 2450,
        totalStudyTime: 12600, // minutes
        joinDate: '2023-01-15',
        lastActive: new Date().toISOString(),
        achievements: [
          {
            id: '1',
            title: '첫 걸음',
            description: '첫 번째 레슨을 완료했습니다',
            icon: '🎯',
            unlockedAt: '2023-01-15T10:00:00Z',
            rarity: 'common'
          },
          {
            id: '2',
            title: '연속 학습자',
            description: '7일 연속 학습을 완료했습니다',
            icon: '🔥',
            unlockedAt: '2023-01-22T10:00:00Z',
            rarity: 'rare'
          },
          {
            id: '3',
            title: '독서광',
            description: '10권의 e-book을 읽었습니다',
            icon: '📚',
            unlockedAt: '2023-02-10T10:00:00Z',
            rarity: 'epic'
          }
        ],
        statistics: {
          totalLessons: 156,
          completedLessons: 142,
          correctAnswers: 2340,
          totalAnswers: 2890,
          currentStreak: 12,
          longestStreak: 28,
          averageScore: 81,
          studyTimeToday: 45,
          studyTimeWeek: 280,
          studyTimeMonth: 1120,
          booksRead: 12,
          vocabularySize: 1890
        },
        preferences: {
          theme: 'auto',
          language: 'ko',
          notifications: {
            email: true,
            push: true,
            studyReminders: true,
            achievements: true,
            social: false
          },
          privacy: {
            profileVisible: true,
            showProgress: true,
            showAchievements: true
          },
          study: {
            dailyGoal: 30,
            autoPlay: true,
            soundEffects: true,
            hapticFeedback: true
          }
        },
        courses: [
          {
            id: '1',
            title: 'Business English',
            progress: 78,
            lastAccessed: '2023-12-15T10:00:00Z',
            level: 'B2',
            totalLessons: 24,
            completedLessons: 19
          },
          {
            id: '2',
            title: 'TOEIC Preparation',
            progress: 45,
            lastAccessed: '2023-12-12T10:00:00Z',
            level: 'B1',
            totalLessons: 30,
            completedLessons: 14
          }
        ],
        friends: [
          {
            id: '2',
            username: 'english_master',
            avatar: '/avatars/friend1.png',
            level: 'C1',
            isOnline: true
          },
          {
            id: '3',
            username: 'study_buddy',
            avatar: '/avatars/friend2.png',
            level: 'B2',
            isOnline: false
          }
        ]
      };

      setUserData(mockData);
      setEditForm({
        firstName: mockData.firstName,
        lastName: mockData.lastName,
        email: mockData.email
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setUserData(prev => prev ? {
        ...prev,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email
      } : null);

      setEditMode(false);
      setSnackbar({
        open: true,
        message: '프로필이 성공적으로 업데이트되었습니다',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: '프로필 업데이트에 실패했습니다',
        severity: 'error'
      });
    }
  };

  const getAchievementColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: '#9e9e9e',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800'
    };
    return colors[rarity];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </ResponsiveContainer>
    );
  }

  if (!userData) {
    return (
      <ResponsiveContainer>
        <Alert severity="error">사용자 정보를 불러올 수 없습니다.</Alert>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <Box className="user-profile-container" sx={{ py: 3 }}>
        {/* Profile Header */}
        <Card className="profile-header" sx={{ mb: 3, overflow: 'visible' }}>
          <Box
            className="profile-header-content"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: 150,
              position: 'relative'
            }}
          >
            <Avatar
              className="profile-avatar"
              sx={{
                width: 120,
                height: 120,
                position: 'absolute',
                bottom: -60,
                left: '50%',
                transform: 'translateX(-50%)',
                border: '4px solid white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
              src={userData.avatar}
            >
              {userData.firstName[0]}{userData.lastName[0]}
            </Avatar>

            {isOwnProfile && (
              <IconButton
                className="camera-button"
                sx={{
                  position: 'absolute',
                  bottom: -45,
                  left: '50%',
                  transform: 'translateX(20px)',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                size="small"
                onClick={() => setAvatarDialog(true)}
              >
                <PhotoCamera fontSize="small" />
              </IconButton>
            )}
          </Box>

          <CardContent sx={{ pt: 8, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              @{userData.username}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={<School />}
                label={`Level ${userData.level}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<EmojiEvents />}
                label={`${userData.experience} XP`}
                color="secondary"
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {formatDate(userData.joinDate)}에 가입 • 마지막 활동: {formatDate(userData.lastActive)}
            </Typography>

            {isOwnProfile && (
              <Box sx={{ mt: 2 }}>
                <TouchButton
                  onClick={() => setEditMode(true)}
                  variant="outlined"
                  size="small"
                >
                  <Edit sx={{ mr: 1 }} />
                  프로필 편집
                </TouchButton>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
          >
            <Tab icon={<Timeline />} label="통계" />
            <Tab icon={<EmojiEvents />} label="성취" />
            <Tab icon={<Book />} label="코스" />
            <Tab icon={<Group />} label="친구" />
            {isOwnProfile && <Tab icon={<Settings />} label="설정" />}
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Study Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📊 학습 통계
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">진도율</Typography>
                      <Typography variant="body2">
                        {Math.round((userData.statistics.completedLessons / userData.statistics.totalLessons) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(userData.statistics.completedLessons / userData.statistics.totalLessons) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userData.statistics.completedLessons}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          완료한 레슨
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {userData.statistics.averageScore}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          평균 점수
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Time Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⏱️ 학습 시간
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="오늘"
                        secondary={formatTime(userData.statistics.studyTimeToday)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="이번 주"
                        secondary={formatTime(userData.statistics.studyTimeWeek)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="이번 달"
                        secondary={formatTime(userData.statistics.studyTimeMonth)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="총 학습 시간"
                        secondary={formatTime(userData.totalStudyTime)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Streak & Achievements */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🔥 연속 학습
                  </Typography>

                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h2" color="primary">
                      {userData.statistics.currentStreak}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      일 연속
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" align="center">
                    최고 기록: {userData.statistics.longestStreak}일
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Vocabulary & Books */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    📚 독서 & 어휘
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {userData.statistics.booksRead}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          읽은 책
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {userData.statistics.vocabularySize.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          어휘 수
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏆 획득한 성취
              </Typography>

              <Grid container spacing={2}>
                {userData.achievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        border: `2px solid ${getAchievementColor(achievement.rarity)}`,
                        position: 'relative'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Typography variant="h3" sx={{ mb: 1 }}>
                            {achievement.icon}
                          </Typography>
                          <Typography variant="h6">
                            {achievement.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {achievement.description}
                          </Typography>
                        </Box>

                        <Chip
                          label={achievement.rarity}
                          size="small"
                          sx={{
                            bgcolor: getAchievementColor(achievement.rarity),
                            color: 'white',
                            textTransform: 'uppercase'
                          }}
                        />

                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {formatDate(achievement.unlockedAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            {userData.courses.map((course) => (
              <Grid item xs={12} md={6} key={course.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>

                    <Chip label={course.level} size="small" color="primary" sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">진도율</Typography>
                        <Typography variant="body2">{course.progress}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {course.completedLessons}/{course.totalLessons} 레슨 완료
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      마지막 학습: {formatDate(course.lastAccessed)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 친구들
              </Typography>

              <List>
                {userData.friends.map((friend, index) => (
                  <React.Fragment key={friend.id}>
                    <ListItem>
                      <Badge
                        badgeContent=""
                        color={friend.isOnline ? 'success' : 'default'}
                        variant="dot"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar src={friend.avatar} sx={{ mr: 2 }}>
                          {friend.username[0].toUpperCase()}
                        </Avatar>
                      </Badge>
                      <ListItemText
                        primary={friend.username}
                        secondary={`Level ${friend.level} • ${friend.isOnline ? '온라인' : '오프라인'}`}
                      />
                      <TouchButton variant="outlined" size="small">
                        메시지
                      </TouchButton>
                    </ListItem>
                    {index < userData.friends.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {activeTab === 4 && isOwnProfile && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Theme Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Palette sx={{ mr: 1 }} />
                <Typography>테마 설정</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Theme settings content would go here */}
                <Typography>테마 설정 옵션들...</Typography>
              </AccordionDetails>
            </Accordion>

            {/* Notification Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Notifications sx={{ mr: 1 }} />
                <Typography>알림 설정</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  <ListItem>
                    <ListItemText primary="이메일 알림" />
                    <Switch checked={userData.preferences.notifications.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="푸시 알림" />
                    <Switch checked={userData.preferences.notifications.push} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="학습 리마인더" />
                    <Switch checked={userData.preferences.notifications.studyReminders} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Study Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <School sx={{ mr: 1 }} />
                <Typography>학습 설정</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>일일 목표 (분)</Typography>
                  <Slider
                    value={userData.preferences.study.dailyGoal}
                    min={10}
                    max={120}
                    step={10}
                    marks
                    valueLabelDisplay="on"
                  />
                </Box>
                <List>
                  <ListItem>
                    <ListItemText primary="자동 재생" />
                    <Switch checked={userData.preferences.study.autoPlay} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="효과음" />
                    <Switch checked={userData.preferences.study.soundEffects} />
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {/* Edit Profile Dialog */}
        <Dialog
          open={editMode}
          onClose={() => setEditMode(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>프로필 편집</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="이름"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="성"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="이메일"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMode(false)}>취소</Button>
            <Button onClick={handleSaveProfile} variant="contained">저장</Button>
          </DialogActions>
        </Dialog>

        {/* Avatar Upload Dialog */}
        <Dialog
          open={avatarDialog}
          onClose={() => setAvatarDialog(false)}
          maxWidth="sm"
        >
          <DialogTitle>프로필 사진 변경</DialogTitle>
          <DialogContent>
            <Typography>새로운 프로필 사진을 업로드하세요.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvatarDialog(false)}>취소</Button>
            <Button variant="contained" startIcon={<CloudUpload />}>업로드</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Box>
    </ResponsiveContainer>
  );
};

export default UserProfile;