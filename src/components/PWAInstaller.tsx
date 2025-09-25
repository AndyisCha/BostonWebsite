import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography, IconButton, Slide,
  Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  GetApp, Close, PhoneAndroid, DesktopWindows, Speed,
  CloudOff as Offline, NotificationsActive, CloudDone, Security
} from '@mui/icons-material';
import { useResponsive } from '../hooks/useResponsive';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallerProps {
  autoShow?: boolean;
  showOnlyMobile?: boolean;
}

export const PWAInstaller: React.FC<PWAInstallerProps> = ({
  autoShow = true,
  showOnlyMobile = false
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [installResult, setInstallResult] = useState<'success' | 'dismissed' | null>(null);

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      // For iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      if (autoShow && (!showOnlyMobile || isMobile || isTablet)) {
        // Show install prompt after a delay
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setInstallResult('success');
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, showOnlyMobile, isMobile, isTablet]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;

        setInstallResult(choiceResult.outcome);
        setDeferredPrompt(null);
        setShowInstallPrompt(false);

        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA installation');
        } else {
          console.log('User dismissed PWA installation');
        }
      } catch (error) {
        console.error('Error during PWA installation:', error);
      }
    } else {
      // Fallback for browsers that don't support install prompt
      setShowFeatures(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setInstallResult('dismissed');

    // Don't show again for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleCloseFeatures = () => {
    setShowFeatures(false);
  };

  const isIOSSafari = () => {
    const userAgent = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !(window as any).MSStream;
  };

  const getInstallInstructions = () => {
    if (isIOSSafari()) {
      return {
        title: 'Safari에서 홈 화면에 추가하기',
        steps: [
          '1. 하단의 공유 버튼을 탭하세요',
          '2. "홈 화면에 추가"를 선택하세요',
          '3. "추가"를 탭하여 완료하세요'
        ]
      };
    }

    return {
      title: '앱 설치 방법',
      steps: [
        '1. 브라우저 메뉴를 열어주세요',
        '2. "홈 화면에 추가" 또는 "앱 설치"를 선택하세요',
        '3. 설치를 완료하세요'
      ]
    };
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Check if dismissed recently
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null;
  }

  const pwaFeatures = [
    { icon: <Speed />, title: '빠른 로딩', description: '네이티브 앱처럼 빠르게 실행됩니다' },
    { icon: <Offline />, title: '오프라인 사용', description: '인터넷 없이도 일부 기능을 사용할 수 있습니다' },
    { icon: <NotificationsActive />, title: '푸시 알림', description: '새로운 학습 콘텐츠를 알려드립니다' },
    { icon: <CloudDone />, title: '자동 업데이트', description: '항상 최신 버전을 사용할 수 있습니다' },
    { icon: <Security />, title: '보안', description: 'HTTPS를 통한 안전한 연결을 제공합니다' }
  ];

  return (
    <>
      {/* Install Prompt */}
      <Slide direction="up" in={showInstallPrompt} mountOnEnter unmountOnExit>
        <Card
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 1300,
            maxWidth: 400,
            mx: 'auto',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CardContent sx={{ position: 'relative', pb: '16px !important' }}>
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
            >
              <Close fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {isMobile ? <PhoneAndroid sx={{ mr: 1 }} /> : <DesktopWindows sx={{ mr: 1 }} />}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                앱 설치
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              홈 화면에 추가하여 더 편리하게 사용하세요!
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleInstallClick}
                startIcon={<GetApp />}
                sx={{
                  flex: 1,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                설치하기
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowFeatures(true)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                자세히
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Slide>

      {/* Features Dialog */}
      <Dialog
        open={showFeatures}
        onClose={handleCloseFeatures}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <GetApp sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" component="div">
            Boston English Learning 앱
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            앱을 설치하면 다음과 같은 장점이 있습니다:
          </Typography>

          <List dense>
            {pwaFeatures.map((feature, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {feature.icon}
                </ListItemIcon>
                <ListItemText
                  primary={feature.title}
                  secondary={feature.description}
                />
              </ListItem>
            ))}
          </List>

          {/* Installation Instructions */}
          {!deferredPrompt && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {getInstallInstructions().title}
              </Typography>
              {getInstallInstructions().steps.map((step, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  {step}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseFeatures}>
            닫기
          </Button>
          {deferredPrompt && (
            <Button
              variant="contained"
              onClick={handleInstallClick}
              startIcon={<GetApp />}
            >
              지금 설치하기
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Result Snackbar */}
      <Snackbar
        open={installResult !== null}
        autoHideDuration={4000}
        onClose={() => setInstallResult(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setInstallResult(null)}
          severity={installResult === 'success' ? 'success' : 'info'}
          variant="filled"
        >
          {installResult === 'success'
            ? '앱이 성공적으로 설치되었습니다!'
            : '나중에 설치하실 수 있습니다.'
          }
        </Alert>
      </Snackbar>
    </>
  );
};

// Hook for PWA utilities
export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }

      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    // Listen for online/offline events
    const handleOnlineChange = () => {
      setIsOnline(navigator.onLine);
    };

    // Listen for service worker updates
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
    };

    checkInstalled();
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);

    // Register service worker update listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
    }

    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      }
    };
  }, []);

  const updateApp = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setUpdateAvailable(false);
        window.location.reload();
      }
    }
  };

  return {
    isInstalled,
    isOnline,
    updateAvailable,
    updateApp
  };
};

export default PWAInstaller;