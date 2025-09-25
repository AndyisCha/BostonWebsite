import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Switch, Slider, Select,
  MenuItem, FormControl, InputLabel, Tabs, Tab, List, ListItem,
  ListItemText, ListItemSecondaryAction, Divider, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, Chip, IconButton, Tooltip, Grid,
  FormControlLabel, RadioGroup, Radio, Accordion,
  AccordionSummary, AccordionDetails, LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Palette, Notifications, Security, Language, Storage,
  CloudSync, Backup, ExpandMore, Restore, Delete,
  Download, Upload, Shield, Key, Visibility,
  VisibilityOff, Warning, Info, CheckCircle,
  Sync, SettingsBackupRestore, DataUsage,
  Timeline, Psychology, Speed, Memory
} from '@mui/icons-material';
import { ResponsiveContainer } from './ResponsiveContainer';
import { TouchButton } from './MobileOptimizations';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/AdvancedSettings.css';

interface SettingsData {
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: number;
    compactMode: boolean;
    animations: boolean;
    highContrast: boolean;
    colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  };
  notifications: {
    enabled: boolean;
    studyReminders: boolean;
    achievementAlerts: boolean;
    socialUpdates: boolean;
    emailDigest: boolean;
    pushNotifications: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    reminderFrequency: number;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showProgress: boolean;
    showAchievements: boolean;
    shareStats: boolean;
    analyticsOptOut: boolean;
    cookieConsent: boolean;
    dataCollection: boolean;
  };
  study: {
    dailyGoal: number;
    sessionDuration: number;
    breakReminder: boolean;
    autoSave: boolean;
    offlineMode: boolean;
    adaptiveDifficulty: boolean;
    voiceRecognition: boolean;
    hapticFeedback: boolean;
    autoAdvance: boolean;
    reviewMode: 'spaced' | 'immediate' | 'manual';
    pronunciationHelp: boolean;
  };
  advanced: {
    dataSync: boolean;
    cacheSize: number;
    preloadContent: boolean;
    experimentalFeatures: boolean;
    developerMode: boolean;
    debugLogging: boolean;
    performanceMode: 'balanced' | 'performance' | 'battery';
    networkOptimization: boolean;
  };
  account: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    loginHistory: boolean;
    deviceManagement: boolean;
    dataRetention: number;
    backupEnabled: boolean;
    exportFormat: 'json' | 'csv' | 'xml';
  };
}

export const AdvancedSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [backupDialog, setBackupDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const { isMobile } = useResponsive();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSettings: SettingsData = {
        appearance: {
          theme: 'auto',
          primaryColor: '#1976d2',
          fontSize: 16,
          compactMode: false,
          animations: true,
          highContrast: false,
          colorBlindMode: 'none'
        },
        notifications: {
          enabled: true,
          studyReminders: true,
          achievementAlerts: true,
          socialUpdates: false,
          emailDigest: true,
          pushNotifications: true,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          reminderFrequency: 30
        },
        privacy: {
          profileVisibility: 'friends',
          showProgress: true,
          showAchievements: true,
          shareStats: false,
          analyticsOptOut: false,
          cookieConsent: true,
          dataCollection: false
        },
        study: {
          dailyGoal: 30,
          sessionDuration: 25,
          breakReminder: true,
          autoSave: true,
          offlineMode: true,
          adaptiveDifficulty: false,
          voiceRecognition: false,
          hapticFeedback: true,
          autoAdvance: false,
          reviewMode: 'spaced',
          pronunciationHelp: true
        },
        advanced: {
          dataSync: true,
          cacheSize: 100,
          preloadContent: true,
          experimentalFeatures: false,
          developerMode: false,
          debugLogging: false,
          performanceMode: 'balanced',
          networkOptimization: true
        },
        account: {
          twoFactorAuth: false,
          sessionTimeout: 60,
          loginHistory: true,
          deviceManagement: true,
          dataRetention: 365,
          backupEnabled: true,
          exportFormat: 'json'
        }
      };

      setSettings(mockSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => prev ? {
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    } : null);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({
        open: true,
        message: '설정이 저장되었습니다',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: '설정 저장에 실패했습니다',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    try {
      await loadSettings();
      setResetDialog(false);
      setSnackbar({
        open: true,
        message: '설정이 초기화되었습니다',
        severity: 'info'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: '설정 초기화에 실패했습니다',
        severity: 'error'
      });
    }
  };

  const exportSettings = () => {
    if (!settings) return;

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setBackupDialog(false);
    setSnackbar({
      open: true,
      message: '설정이 내보내기되었습니다',
      severity: 'success'
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        setImportDialog(false);
        setSnackbar({
          open: true,
          message: '설정이 가져오기되었습니다',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: '설정 파일이 유효하지 않습니다',
          severity: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  if (loading || !settings) {
    return (
      <ResponsiveContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </ResponsiveContainer>
    );
  }

  const tabs = [
    { label: '외관', icon: <Palette /> },
    { label: '알림', icon: <Notifications /> },
    { label: '개인정보', icon: <Security /> },
    { label: '학습', icon: <Psychology /> },
    { label: '고급', icon: <Speed /> },
    { label: '계정', icon: <Shield /> }
  ];

  return (
    <ResponsiveContainer>
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          고급 설정
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <TouchButton
            onClick={saveSettings}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : <CheckCircle sx={{ mr: 1 }} />}
            저장
          </TouchButton>
          <TouchButton
            onClick={() => setBackupDialog(true)}
            variant="outlined"
          >
            <Backup sx={{ mr: 1 }} />
            백업
          </TouchButton>
          <TouchButton
            onClick={() => setImportDialog(true)}
            variant="outlined"
          >
            <Restore sx={{ mr: 1 }} />
            복원
          </TouchButton>
          <TouchButton
            onClick={() => setResetDialog(true)}
            variant="outlined"
          >
            <SettingsBackupRestore sx={{ mr: 1 }} />
            초기화
          </TouchButton>
        </Box>

        {/* Settings Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab key={index} icon={tab.icon} label={tab.label} />
            ))}
          </Tabs>
        </Card>

        {/* Appearance Settings */}
        {activeTab === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎨 외관 설정
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="테마"
                    secondary="라이트, 다크 또는 자동 모드 선택"
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.appearance.theme}
                      onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                    >
                      <MenuItem value="light">라이트</MenuItem>
                      <MenuItem value="dark">다크</MenuItem>
                      <MenuItem value="auto">자동</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="글자 크기"
                    secondary={`현재: ${settings.appearance.fontSize}px`}
                  />
                  <Box sx={{ width: 100 }}>
                    <Slider
                      size="small"
                      value={settings.appearance.fontSize}
                      onChange={(_, value) => updateSetting('appearance', 'fontSize', value)}
                      min={12}
                      max={24}
                      step={2}
                    />
                  </Box>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="컴팩트 모드"
                    secondary="더 많은 정보를 한 화면에 표시"
                  />
                  <Switch
                    checked={settings.appearance.compactMode}
                    onChange={(e) => updateSetting('appearance', 'compactMode', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="애니메이션"
                    secondary="UI 애니메이션 효과 사용"
                  />
                  <Switch
                    checked={settings.appearance.animations}
                    onChange={(e) => updateSetting('appearance', 'animations', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="고대비 모드"
                    secondary="시각적 접근성을 위한 고대비 색상"
                  />
                  <Switch
                    checked={settings.appearance.highContrast}
                    onChange={(e) => updateSetting('appearance', 'highContrast', e.target.checked)}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="색맹 지원"
                    secondary="색각 이상을 위한 색상 조정"
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.appearance.colorBlindMode}
                      onChange={(e) => updateSetting('appearance', 'colorBlindMode', e.target.value)}
                    >
                      <MenuItem value="none">없음</MenuItem>
                      <MenuItem value="deuteranopia">적록색맹</MenuItem>
                      <MenuItem value="protanopia">1형 색맹</MenuItem>
                      <MenuItem value="tritanopia">청황색맹</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔔 알림 설정
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="알림 사용"
                    secondary="모든 알림 기능을 활성화/비활성화"
                  />
                  <Switch
                    checked={settings.notifications.enabled}
                    onChange={(e) => updateSetting('notifications', 'enabled', e.target.checked)}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="학습 리마인더"
                    secondary="정기적인 학습 알림"
                  />
                  <Switch
                    checked={settings.notifications.studyReminders}
                    onChange={(e) => updateSetting('notifications', 'studyReminders', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="성취 알림"
                    secondary="새로운 성취 달성 시 알림"
                  />
                  <Switch
                    checked={settings.notifications.achievementAlerts}
                    onChange={(e) => updateSetting('notifications', 'achievementAlerts', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="이메일 요약"
                    secondary="주간 학습 리포트 받기"
                  />
                  <Switch
                    checked={settings.notifications.emailDigest}
                    onChange={(e) => updateSetting('notifications', 'emailDigest', e.target.checked)}
                    disabled={!settings.notifications.enabled}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="리마인더 빈도"
                    secondary={`${settings.notifications.reminderFrequency}분마다`}
                  />
                  <Box sx={{ width: 100 }}>
                    <Slider
                      size="small"
                      value={settings.notifications.reminderFrequency}
                      onChange={(_, value) => updateSetting('notifications', 'reminderFrequency', value)}
                      min={15}
                      max={120}
                      step={15}
                      disabled={!settings.notifications.studyReminders}
                    />
                  </Box>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="방해금지 시간"
                    secondary="알림을 받지 않을 시간대 설정"
                  />
                  <Switch
                    checked={settings.notifications.quietHours.enabled}
                    onChange={(e) => updateSetting('notifications', 'quietHours', {
                      ...settings.notifications.quietHours,
                      enabled: e.target.checked
                    })}
                    disabled={!settings.notifications.enabled}
                  />
                </ListItem>

                {settings.notifications.quietHours.enabled && (
                  <ListItem sx={{ pl: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <TextField
                          type="time"
                          size="small"
                          value={settings.notifications.quietHours.start}
                          onChange={(e) => updateSetting('notifications', 'quietHours', {
                            ...settings.notifications.quietHours,
                            start: e.target.value
                          })}
                        />
                      </Grid>
                      <Grid item>
                        <Typography>~</Typography>
                      </Grid>
                      <Grid item>
                        <TextField
                          type="time"
                          size="small"
                          value={settings.notifications.quietHours.end}
                          onChange={(e) => updateSetting('notifications', 'quietHours', {
                            ...settings.notifications.quietHours,
                            end: e.target.value
                          })}
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Privacy Settings */}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔒 개인정보 설정
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                개인정보 보호는 매우 중요합니다. 각 설정을 신중히 검토해주세요.
              </Alert>

              <List>
                <ListItem>
                  <ListItemText
                    primary="프로필 공개 범위"
                    secondary="다른 사용자에게 표시되는 정보 범위"
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                    >
                      <MenuItem value="public">공개</MenuItem>
                      <MenuItem value="friends">친구만</MenuItem>
                      <MenuItem value="private">비공개</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="학습 진도 공개"
                    secondary="다른 사용자에게 학습 진도 표시"
                  />
                  <Switch
                    checked={settings.privacy.showProgress}
                    onChange={(e) => updateSetting('privacy', 'showProgress', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="성취 공개"
                    secondary="획득한 성취를 다른 사용자에게 표시"
                  />
                  <Switch
                    checked={settings.privacy.showAchievements}
                    onChange={(e) => updateSetting('privacy', 'showAchievements', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="통계 공유"
                    secondary="학습 통계를 친구들과 공유"
                  />
                  <Switch
                    checked={settings.privacy.shareStats}
                    onChange={(e) => updateSetting('privacy', 'shareStats', e.target.checked)}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="분석 데이터 수집 거부"
                    secondary="서비스 개선을 위한 익명 데이터 수집 거부"
                  />
                  <Switch
                    checked={settings.privacy.analyticsOptOut}
                    onChange={(e) => updateSetting('privacy', 'analyticsOptOut', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="개인화된 데이터 수집"
                    secondary="학습 패턴 분석을 위한 데이터 수집"
                  />
                  <Switch
                    checked={settings.privacy.dataCollection}
                    onChange={(e) => updateSetting('privacy', 'dataCollection', e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}

        {/* Study Settings */}
        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 학습 설정
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="일일 목표"
                    secondary={`${settings.study.dailyGoal}분`}
                  />
                  <Box sx={{ width: 100 }}>
                    <Slider
                      size="small"
                      value={settings.study.dailyGoal}
                      onChange={(_, value) => updateSetting('study', 'dailyGoal', value)}
                      min={10}
                      max={120}
                      step={10}
                    />
                  </Box>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="세션 시간"
                    secondary={`${settings.study.sessionDuration}분`}
                  />
                  <Box sx={{ width: 100 }}>
                    <Slider
                      size="small"
                      value={settings.study.sessionDuration}
                      onChange={(_, value) => updateSetting('study', 'sessionDuration', value)}
                      min={5}
                      max={60}
                      step={5}
                    />
                  </Box>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="휴식 알림"
                    secondary="장시간 학습 시 휴식 권장"
                  />
                  <Switch
                    checked={settings.study.breakReminder}
                    onChange={(e) => updateSetting('study', 'breakReminder', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="자동 저장"
                    secondary="학습 진도 자동 저장"
                  />
                  <Switch
                    checked={settings.study.autoSave}
                    onChange={(e) => updateSetting('study', 'autoSave', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="적응형 난이도"
                    secondary="학습 성과에 따른 난이도 자동 조절"
                  />
                  <Switch
                    checked={settings.study.adaptiveDifficulty}
                    onChange={(e) => updateSetting('study', 'adaptiveDifficulty', e.target.checked)}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="복습 모드"
                    secondary="틀린 문제 복습 방식"
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.study.reviewMode}
                      onChange={(e) => updateSetting('study', 'reviewMode', e.target.value)}
                    >
                      <MenuItem value="spaced">간격 반복</MenuItem>
                      <MenuItem value="immediate">즉시 복습</MenuItem>
                      <MenuItem value="manual">수동 복습</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="음성 인식"
                    secondary="발음 연습 시 음성 인식 사용"
                  />
                  <Switch
                    checked={settings.study.voiceRecognition}
                    onChange={(e) => updateSetting('study', 'voiceRecognition', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="발음 도우미"
                    secondary="음성 안내 및 발음 팁 제공"
                  />
                  <Switch
                    checked={settings.study.pronunciationHelp}
                    onChange={(e) => updateSetting('study', 'pronunciationHelp', e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}

        {/* Advanced Settings */}
        {activeTab === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ 고급 설정
              </Typography>

              <Alert severity="warning" sx={{ mb: 2 }}>
                고급 설정은 경험이 있는 사용자만 변경하시기 바랍니다.
              </Alert>

              <List>
                <ListItem>
                  <ListItemText
                    primary="성능 모드"
                    secondary="배터리 수명 vs 성능 균형"
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.advanced.performanceMode}
                      onChange={(e) => updateSetting('advanced', 'performanceMode', e.target.value)}
                    >
                      <MenuItem value="battery">배터리 절약</MenuItem>
                      <MenuItem value="balanced">균형</MenuItem>
                      <MenuItem value="performance">성능 우선</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="캐시 크기"
                    secondary={`${settings.advanced.cacheSize}MB`}
                  />
                  <Box sx={{ width: 100 }}>
                    <Slider
                      size="small"
                      value={settings.advanced.cacheSize}
                      onChange={(_, value) => updateSetting('advanced', 'cacheSize', value)}
                      min={50}
                      max={500}
                      step={50}
                    />
                  </Box>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="콘텐츠 사전 로딩"
                    secondary="다음 레슨 미리 로딩하여 빠른 실행"
                  />
                  <Switch
                    checked={settings.advanced.preloadContent}
                    onChange={(e) => updateSetting('advanced', 'preloadContent', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="네트워크 최적화"
                    secondary="데이터 사용량 최적화"
                  />
                  <Switch
                    checked={settings.advanced.networkOptimization}
                    onChange={(e) => updateSetting('advanced', 'networkOptimization', e.target.checked)}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="실험적 기능"
                    secondary="베타 기능 활성화 (불안정할 수 있음)"
                  />
                  <Switch
                    checked={settings.advanced.experimentalFeatures}
                    onChange={(e) => updateSetting('advanced', 'experimentalFeatures', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="개발자 모드"
                    secondary="개발자 도구 및 디버그 정보 표시"
                  />
                  <Switch
                    checked={settings.advanced.developerMode}
                    onChange={(e) => updateSetting('advanced', 'developerMode', e.target.checked)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}

        {/* Account Settings */}
        {activeTab === 5 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🛡️ 계정 보안
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="2단계 인증"
                    secondary="추가 보안층으로 계정 보호"
                  />
                  <Switch
                    checked={settings.account.twoFactorAuth}
                    onChange={(e) => updateSetting('account', 'twoFactorAuth', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="세션 만료 시간"
                    secondary={`${settings.account.sessionTimeout}분 후 자동 로그아웃`}
                  />
                  <Box sx={{ width: 100 }}>
                    <Slider
                      size="small"
                      value={settings.account.sessionTimeout}
                      onChange={(_, value) => updateSetting('account', 'sessionTimeout', value)}
                      min={15}
                      max={480}
                      step={15}
                    />
                  </Box>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="로그인 기록"
                    secondary="로그인 활동 추적 및 기록"
                  />
                  <Switch
                    checked={settings.account.loginHistory}
                    onChange={(e) => updateSetting('account', 'loginHistory', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="기기 관리"
                    secondary="로그인된 기기 목록 관리"
                  />
                  <Switch
                    checked={settings.account.deviceManagement}
                    onChange={(e) => updateSetting('account', 'deviceManagement', e.target.checked)}
                  />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="데이터 보관 기간"
                    secondary={`${settings.account.dataRetention}일`}
                  />
                  <Box sx={{ width: 100 }}>
                    <Slider
                      size="small"
                      value={settings.account.dataRetention}
                      onChange={(_, value) => updateSetting('account', 'dataRetention', value)}
                      min={30}
                      max={1095}
                      step={30}
                    />
                  </Box>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="자동 백업"
                    secondary="정기적으로 학습 데이터 백업"
                  />
                  <Switch
                    checked={settings.account.backupEnabled}
                    onChange={(e) => updateSetting('account', 'backupEnabled', e.target.checked)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary="내보내기 형식"
                    secondary="데이터 내보낼 때 사용할 파일 형식"
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.account.exportFormat}
                      onChange={(e) => updateSetting('account', 'exportFormat', e.target.value)}
                    >
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="xml">XML</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        )}

        {/* Reset Dialog */}
        <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
          <DialogTitle>설정 초기화</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              모든 설정이 기본값으로 초기화됩니다. 이 작업은 되돌릴 수 없습니다.
            </Alert>
            <Typography>
              정말로 모든 설정을 초기화하시겠습니까?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialog(false)}>취소</Button>
            <Button onClick={resetSettings} color="error" variant="contained">
              초기화
            </Button>
          </DialogActions>
        </Dialog>

        {/* Backup Dialog */}
        <Dialog open={backupDialog} onClose={() => setBackupDialog(false)}>
          <DialogTitle>설정 백업</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              현재 설정을 파일로 내보내어 백업할 수 있습니다.
            </Typography>
            <Alert severity="info">
              백업 파일에는 비밀번호나 개인정보는 포함되지 않습니다.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBackupDialog(false)}>취소</Button>
            <Button onClick={exportSettings} variant="contained">
              내보내기
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
          <DialogTitle>설정 복원</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              백업된 설정 파일을 선택하여 복원하세요.
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              현재 설정이 모두 덮어씌워집니다.
            </Alert>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              style={{ marginTop: 16 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportDialog(false)}>취소</Button>
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

export default AdvancedSettings;