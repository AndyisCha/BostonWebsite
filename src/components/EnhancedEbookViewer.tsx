import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, AppBar, Toolbar, IconButton, Typography, Fab, Slider,
  Menu, MenuItem, Tooltip, Zoom, Collapse, Card, CardContent, Badge,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, ListItemIcon, Chip, Drawer,
  SpeedDial, SpeedDialIcon, SpeedDialAction, Switch, FormControlLabel,
  Snackbar, Alert
} from '@mui/material';
import {
  ArrowBack, ArrowForward, Edit, Undo, Redo, Clear, Palette,
  Settings, Bookmark, BookmarkBorder, ZoomIn, ZoomOut, Brightness6,
  FormatSize, Menu as MenuIcon, Search, Note, PlayArrow, Pause,
  VolumeUp, Speed, Fullscreen, FullscreenExit, Subject as TableOfContents,
  Home, Share, Print, Download, Highlight, Comment, Timer,
  Visibility, VisibilityOff, PhotoSizeSelectActual, RestartAlt
} from '@mui/icons-material';
import { fabric } from 'fabric';
import '../styles/EnhancedEbookViewer.css';

interface AudioButton {
  id: string;
  pageNumber: number;
  title: string;
  audioUrl: string;
  position: { x: number; y: number };
  duration?: number;
}

interface EbookPage {
  id: string;
  pageNumber: number;
  content: string;
  hasAnswers: boolean;
  audioButtons?: AudioButton[];
  answers?: Array<{
    id: string;
    answer: string;
    explanation?: string;
  }>;
}

interface EbookData {
  id: string;
  title: string;
  author: string;
  pages: EbookPage[];
}

interface EbookViewerProps {
  ebook: EbookData;
  userId: string;
  onClose: () => void;
}

interface Bookmark {
  id: string;
  page: number;
  note: string;
  timestamp: Date;
  color?: string;
}

export const EnhancedEbookViewer: React.FC<EbookViewerProps> = ({ ebook, userId, onClose }) => {
  // Core states
  const [currentPage, setCurrentPage] = useState(0);
  const [drawingMode, setDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  // Enhanced UI states
  const [fontSize, setFontSize] = useState(16);
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [audioButtons, setAudioButtons] = useState<AudioButton[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Dialog states
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Menu states
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Notification states
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'warning' | 'error' });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const readingTimerRef = useRef<NodeJS.Timeout>();
  const autoPlayTimerRef = useRef<NodeJS.Timeout>();

  // Initialize canvas and load data
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        width: 800,
        height: 600,
        backgroundColor: 'transparent'
      });

      const brush = fabricCanvasRef.current.freeDrawingBrush;
      brush.color = brushColor;
      brush.width = brushWidth;
    }

    loadUserPreferences();
    loadBookmarks();
    loadAudioButtons();
    startReadingTimer();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }

      // Stop audio when component unmounts
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setAudioPlaying(null);
      }
    };
  }, []);

  // Update canvas settings
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = drawingMode;
      if (drawingMode) {
        const brush = fabricCanvasRef.current.freeDrawingBrush;
        brush.color = brushColor;
        brush.width = brushWidth;
      }
    }
  }, [drawingMode, brushColor, brushWidth]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay) {
      startAutoPlay();
    } else if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
  }, [autoPlay, playbackSpeed, currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      switch (event.key) {
        case 'ArrowLeft':
          goToPreviousPage();
          break;
        case 'ArrowRight':
          goToNextPage();
          break;
        case 'f':
        case 'F':
          if (event.ctrlKey) {
            toggleFullscreen();
            event.preventDefault();
          }
          break;
        case 'b':
        case 'B':
          toggleBookmark();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        case ' ': // Spacebar
          event.preventDefault();
          setAutoPlay(!autoPlay);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [autoPlay, isFullscreen]);

  const loadUserPreferences = useCallback(async () => {
    try {
      const savedPrefs = localStorage.getItem(`ebook-prefs-${ebook.id}-${userId}`);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setFontSize(prefs.fontSize || 16);
        setBrightness(prefs.brightness || 100);
        setZoom(prefs.zoom || 1);
        setCurrentPage(prefs.lastPage || 0);
      }

      const progress = await fetch(`/api/ebooks/progress/${ebook.id}?userId=${userId}`);
      if (progress.ok) {
        const data = await progress.json();
        setReadingProgress(data.progress || 0);
        setReadingTime(data.readingTime || 0);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, [ebook.id, userId]);

  const saveUserPreferences = useCallback(() => {
    const prefs = {
      fontSize,
      brightness,
      zoom,
      lastPage: currentPage,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`ebook-prefs-${ebook.id}-${userId}`, JSON.stringify(prefs));
  }, [fontSize, brightness, zoom, currentPage, ebook.id, userId]);

  const loadBookmarks = useCallback(async () => {
    try {
      const response = await fetch(`/api/ebooks/bookmarks/${ebook.id}?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
        setIsBookmarked(data.some((b: any) => b.page === currentPage));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, [ebook.id, userId, currentPage]);

  const loadAudioButtons = useCallback(async () => {
    try {
      const response = await fetch(`/api/ebooks/${ebook.id}/audio`);
      if (response.ok) {
        const data = await response.json();
        setAudioButtons(data.audioButtons || []);
      }
    } catch (error) {
      console.error('Error loading audio buttons:', error);
    }
  }, [ebook.id]);

  const playAudio = useCallback((audioButton: AudioButton) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setAudioPlaying(null);
    }

    // Create new audio instance
    const audio = new Audio(audioButton.audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      console.log('Audio duration:', audio.duration);
    });

    audio.addEventListener('ended', () => {
      setCurrentAudio(null);
      setAudioPlaying(null);
      showNotification('오디오 재생이 완료되었습니다', 'success');
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      setCurrentAudio(null);
      setAudioPlaying(null);
      showNotification('오디오 재생 중 오류가 발생했습니다', 'error');
    });

    audio.play()
      .then(() => {
        setCurrentAudio(audio);
        setAudioPlaying(audioButton.id);
        showNotification(`"${audioButton.title}" 재생 시작`, 'info');
      })
      .catch((error) => {
        console.error('Audio play failed:', error);
        showNotification('오디오 재생에 실패했습니다', 'error');
      });
  }, [currentAudio]);

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setAudioPlaying(null);
      showNotification('오디오 재생이 중지되었습니다', 'info');
    }
  }, [currentAudio]);

  const startReadingTimer = useCallback(() => {
    readingTimerRef.current = setInterval(() => {
      setReadingTime(prev => {
        const newTime = prev + 1;
        if (newTime % 30 === 0) {
          saveReadingProgress(newTime);
        }
        return newTime;
      });
    }, 1000);
  }, []);

  const saveReadingProgress = useCallback(async (time?: number) => {
    try {
      const progress = (currentPage + 1) / ebook.pages.length * 100;
      setReadingProgress(progress);

      await fetch(`/api/ebooks/progress/${ebook.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          page: currentPage,
          progress,
          readingTime: time || readingTime,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [ebook.id, ebook.pages.length, currentPage, userId, readingTime]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      // Stop current audio when changing pages
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setAudioPlaying(null);
      }
      setCurrentPage(currentPage - 1);
      setIsBookmarked(bookmarks.some(b => b.page === currentPage - 1));
      saveUserPreferences();
    }
  }, [currentPage, bookmarks, saveUserPreferences, currentAudio]);

  const goToNextPage = useCallback(() => {
    if (currentPage < ebook.pages.length - 1) {
      // Stop current audio when changing pages
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setAudioPlaying(null);
      }
      setCurrentPage(currentPage + 1);
      setIsBookmarked(bookmarks.some(b => b.page === currentPage + 1));
      saveUserPreferences();
    }
  }, [currentPage, ebook.pages.length, bookmarks, saveUserPreferences, currentAudio]);

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < ebook.pages.length) {
      // Stop current audio when changing pages
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setAudioPlaying(null);
      }
      setCurrentPage(pageIndex);
      setIsBookmarked(bookmarks.some(b => b.page === pageIndex));
      saveUserPreferences();
    }
  }, [ebook.pages.length, bookmarks, saveUserPreferences, currentAudio]);

  const toggleBookmark = useCallback(async () => {
    try {
      if (isBookmarked) {
        const response = await fetch(`/api/ebooks/bookmarks/${ebook.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, page: currentPage })
        });
        if (response.ok) {
          setBookmarks(prev => prev.filter(b => b.page !== currentPage));
          setIsBookmarked(false);
          showNotification('북마크가 제거되었습니다', 'success');
        }
      } else {
        const bookmark = {
          id: Date.now().toString(),
          page: currentPage,
          note: `페이지 ${currentPage + 1}`,
          timestamp: new Date(),
          color: '#ffc107'
        };
        const response = await fetch(`/api/ebooks/bookmarks/${ebook.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...bookmark })
        });
        if (response.ok) {
          setBookmarks(prev => [...prev, bookmark]);
          setIsBookmarked(true);
          showNotification('북마크가 추가되었습니다', 'success');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showNotification('북마크 처리 중 오류가 발생했습니다', 'error');
    }
  }, [ebook.id, userId, currentPage, isBookmarked]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (autoPlay) {
      autoPlayTimerRef.current = setTimeout(() => {
        if (currentPage < ebook.pages.length - 1) {
          goToNextPage();
        } else {
          setAutoPlay(false);
          showNotification('자동 재생이 완료되었습니다', 'info');
        }
      }, 5000 / playbackSpeed);
    }
  }, [autoPlay, playbackSpeed, currentPage, ebook.pages.length, goToNextPage]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const showNotification = (message: string, severity: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetView = () => {
    setZoom(1);
    setFontSize(16);
    setBrightness(100);
    showNotification('보기 설정이 초기화되었습니다', 'info');
  };

  const currentPageData = ebook.pages[currentPage];

  const speedDialActions = [
    { icon: <TableOfContents />, name: '목차', onClick: () => setShowToc(true) },
    { icon: isBookmarked ? <Bookmark /> : <BookmarkBorder />, name: '북마크', onClick: toggleBookmark },
    { icon: <Note />, name: '노트', onClick: () => setShowNotes(true) },
    {
      icon: audioPlaying ? <Pause /> : <VolumeUp />,
      name: audioPlaying ? '오디오 중지' : '오디오',
      onClick: () => {
        if (audioPlaying) {
          stopAudio();
        } else {
          const currentPageAudio = audioButtons.find(btn =>
            btn.pageNumber === currentPage + 1 && !audioPlaying
          );
          if (currentPageAudio) {
            playAudio(currentPageAudio);
          } else {
            showNotification('이 페이지에는 오디오가 없습니다', 'info');
          }
        }
      }
    },
    { icon: <Share />, name: '공유', onClick: () => showNotification('공유 기능은 준비 중입니다', 'info') },
    { icon: <Download />, name: '다운로드', onClick: () => showNotification('다운로드 기능은 준비 중입니다', 'info') }
  ];

  return (
    <div className="enhanced-ebook-viewer" ref={viewerRef}>
      {/* Enhanced Header */}
      <AppBar position="static" className="ebook-header" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <ArrowBack />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, ml: 2 }}>
            <Typography variant="h6" noWrap>
              {ebook.title}
            </Typography>
            <Typography variant="subtitle2" sx={{ ml: 1, opacity: 0.8 }}>
              {ebook.author}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Reading Stats */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
              <Chip
                icon={<Timer />}
                label={formatTime(readingTime)}
                variant="outlined"
                size="small"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              />
              <Chip
                label={`${Math.round(readingProgress)}%`}
                variant="filled"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>

            {/* Controls */}
            <IconButton color="inherit" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>

            <IconButton color="inherit" onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={readingProgress}
          sx={{
            height: 3,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' }
          }}
        />
      </AppBar>

      {/* Main Content Area */}
      <Box className="ebook-content-wrapper" sx={{ position: 'relative', flex: 1 }}>
        {/* Page Content */}
        <Box
          className="ebook-page-content"
          sx={{
            fontSize: `${fontSize}px`,
            filter: `brightness(${brightness}%)`,
            transform: `scale(${zoom})`,
            transformOrigin: 'center top',
            transition: 'all 0.3s ease',
            padding: 3,
            minHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxWidth: 800,
              width: '100%',
              minHeight: 600,
              padding: 3,
              position: 'relative'
            }}
          >
            <div
              ref={contentRef}
              dangerouslySetInnerHTML={{
                __html: currentPageData?.content || '<p>페이지를 로드하는 중...</p>'
              }}
            />

            {/* Audio Buttons */}
            {audioButtons
              .filter(btn => btn.pageNumber === currentPage + 1) // pageNumber is 1-based
              .map((audioBtn) => (
                <Box
                  key={audioBtn.id}
                  sx={{
                    position: 'absolute',
                    left: `${audioBtn.position.x}%`,
                    top: `${audioBtn.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20
                  }}
                >
                  <Tooltip title={audioBtn.title}>
                    <IconButton
                      sx={{
                        backgroundColor: audioPlaying === audioBtn.id ? '#f44336' : '#2196f3',
                        color: 'white',
                        width: 48,
                        height: 48,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        '&:hover': {
                          backgroundColor: audioPlaying === audioBtn.id ? '#d32f2f' : '#1976d2',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        if (audioPlaying === audioBtn.id) {
                          stopAudio();
                        } else {
                          playAudio(audioBtn);
                        }
                      }}
                    >
                      {audioPlaying === audioBtn.id ? <Pause /> : <VolumeUp />}
                    </IconButton>
                  </Tooltip>
                </Box>
              ))
            }

            {/* Drawing Canvas */}
            <canvas
              ref={canvasRef}
              className="drawing-canvas"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: drawingMode ? 'auto' : 'none',
                zIndex: drawingMode ? 10 : 1,
                border: drawingMode ? '2px dashed #2196f3' : 'none'
              }}
            />
          </Paper>
        </Box>

        {/* Page Navigation */}
        <Box className="page-navigation">
          <Fab
            size="medium"
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </Fab>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mx: 2 }}>
            <Typography variant="h6" color="primary">
              {currentPage + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              / {ebook.pages.length}
            </Typography>
          </Box>

          <Fab
            size="medium"
            onClick={goToNextPage}
            disabled={currentPage === ebook.pages.length - 1}
            sx={{ ml: 2 }}
          >
            <ArrowForward />
          </Fab>
        </Box>

        {/* SpeedDial for Quick Actions */}
        <SpeedDial
          ariaLabel="QuickActions"
          sx={{ position: 'absolute', bottom: 80, right: 16 }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.onClick();
                setSpeedDialOpen(false);
              }}
            />
          ))}
        </SpeedDial>

        {/* Reading Controls */}
        <Card className="reading-controls" sx={{ position: 'absolute', top: 16, right: 16 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => setAutoPlay(!autoPlay)}
                color={autoPlay ? 'primary' : 'default'}
              >
                {autoPlay ? <Pause /> : <PlayArrow />}
              </IconButton>

              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOut />
              </IconButton>

              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomIn />
              </IconButton>

              <IconButton size="small" onClick={resetView}>
                <RestartAlt />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Settings Sidebar */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            뷰어 설정
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>글자 크기</Typography>
            <Slider
              value={fontSize}
              onChange={(_, value) => setFontSize(value as number)}
              min={12}
              max={24}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>밝기</Typography>
            <Slider
              value={brightness}
              onChange={(_, value) => setBrightness(value as number)}
              min={50}
              max={150}
              step={5}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>확대/축소</Typography>
            <Slider
              value={zoom}
              onChange={(_, value) => setZoom(value as number)}
              min={0.5}
              max={2}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
              />
            }
            label="자동 재생"
          />

          {autoPlay && (
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>재생 속도</Typography>
              <Slider
                value={playbackSpeed}
                onChange={(_, value) => setPlaybackSpeed(value as number)}
                min={0.5}
                max={3}
                step={0.5}
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              북마크 ({bookmarks.length})
            </Typography>
            <List>
              {bookmarks.map((bookmark) => (
                <ListItem
                  key={bookmark.id}
                  button
                  onClick={() => goToPage(bookmark.page)}
                >
                  <ListItemIcon>
                    <Bookmark sx={{ color: bookmark.color }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={bookmark.note}
                    secondary={`페이지 ${bookmark.page + 1}`}
                  />
                </ListItem>
              ))}
              {bookmarks.length === 0 && (
                <Typography color="text.secondary">
                  북마크가 없습니다
                </Typography>
              )}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};