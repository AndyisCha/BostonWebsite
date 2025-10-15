import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, AppBar, Toolbar, IconButton, Typography, Fab, Slider,
  Menu, MenuItem, Tooltip, Zoom, Collapse, Card, CardContent, Badge,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, ListItemIcon, Chip
} from '@mui/material';
import {
  ArrowBack, ArrowForward, Edit, Undo, Redo, Clear, Palette,
  Settings, Bookmark, BookmarkBorder, ZoomIn, ZoomOut, Brightness6,
  FormatSize, Menu as MenuIcon, Search, Note, PlayArrow, Pause,
  VolumeUp, Speed, Fullscreen, FullscreenExit, Subject as TableOfContents
} from '@mui/icons-material';
import { fabric } from 'fabric';
import '../styles/EbookViewer.css';

interface EbookPage {
  id: string;
  pageNumber: number;
  content: string;
  hasAnswers: boolean;
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

export const EbookViewer: React.FC<EbookViewerProps> = ({ ebook, userId, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [drawingMode, setDrawingMode] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  // Enhanced UI states
  const [fontSize, setFontSize] = useState(16);
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [bookmarks, setBookmarks] = useState<Array<{id: string, page: number, note: string, timestamp: Date}>>([]);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const readingTimerRef = useRef<NodeJS.Timeout>();
  const autoPlayTimerRef = useRef<NodeJS.Timeout>();

  // Enhanced initialization with reading progress tracking
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      // Fabric.js Canvas 초기화
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        width: 800,
        height: 600,
        backgroundColor: 'transparent'
      });

      // 브러시 설정
      const brush = fabricCanvasRef.current.freeDrawingBrush;
      brush.color = brushColor;
      brush.width = brushWidth;

      loadDrawing();
    }

    // Load user preferences and bookmarks
    loadUserPreferences();
    loadBookmarks();

    // Start reading timer
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
    };
  }, [currentPage]);

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = drawingMode;

      if (drawingMode) {
        const brush = fabricCanvasRef.current.freeDrawingBrush;

        if (eraserMode) {
          // 지우개 모드: 흰색 브러시 사용 (또는 destination-out)
          brush.color = '#ffffff';
          brush.width = brushWidth * 2; // 지우개는 더 굵게
        } else {
          // 펜 모드
          brush.color = brushColor;
          brush.width = brushWidth;
        }
      }
    }
  }, [drawingMode, brushColor, brushWidth, eraserMode]);

  const loadDrawing = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      const response = await fetch(`/api/ebooks/drawing/${ebook.pages[currentPage].id}?userId=${userId}`);
      if (response.ok) {
        const drawing = await response.json();
        if (drawing.canvasData) {
          fabricCanvasRef.current.loadFromJSON(drawing.canvasData, () => {
            fabricCanvasRef.current?.renderAll();
          });
        }
      }
    } catch (error) {
      console.error('Error loading drawing:', error);
    }
  };

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

      // Load reading progress
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

  const startReadingTimer = useCallback(() => {
    readingTimerRef.current = setInterval(() => {
      setReadingTime(prev => {
        const newTime = prev + 1;
        if (newTime % 30 === 0) { // Save progress every 30 seconds
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

  const saveDrawing = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      const canvasData = fabricCanvasRef.current.toJSON();
      await fetch(`/api/ebooks/drawing/${ebook.pages[currentPage].id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          canvasData
        })
      });
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  };

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      saveDrawing();
      saveUserPreferences();
      setCurrentPage(currentPage - 1);
      setIsBookmarked(bookmarks.some(b => b.page === currentPage - 1));
    }
  }, [currentPage, bookmarks, saveDrawing, saveUserPreferences]);

  const goToNextPage = useCallback(() => {
    if (currentPage < ebook.pages.length - 1) {
      saveDrawing();
      saveUserPreferences();
      setCurrentPage(currentPage + 1);
      setIsBookmarked(bookmarks.some(b => b.page === currentPage + 1));
    }
  }, [currentPage, ebook.pages.length, bookmarks, saveDrawing, saveUserPreferences]);

  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < ebook.pages.length) {
      saveDrawing();
      saveUserPreferences();
      setCurrentPage(pageIndex);
      setIsBookmarked(bookmarks.some(b => b.page === pageIndex));
    }
  }, [ebook.pages.length, bookmarks, saveDrawing, saveUserPreferences]);

  const toggleBookmark = useCallback(async () => {
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/ebooks/bookmarks/${ebook.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, page: currentPage })
        });
        if (response.ok) {
          setBookmarks(prev => prev.filter(b => b.page !== currentPage));
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        const bookmark = {
          id: Date.now().toString(),
          page: currentPage,
          note: `Page ${currentPage + 1}`,
          timestamp: new Date()
        };
        const response = await fetch(`/api/ebooks/bookmarks/${ebook.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, ...bookmark })
        });
        if (response.ok) {
          setBookmarks(prev => [...prev, bookmark]);
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
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

  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    if (!drawingMode) {
      setEraserMode(false); // 그리기 모드 활성화 시 지우개 모드 해제
    }
  };

  const toggleEraserMode = () => {
    if (!drawingMode) {
      setDrawingMode(true); // 그리기 모드가 아니면 먼저 활성화
    }
    setEraserMode(!eraserMode);
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      saveDrawing();
    }
  };

  const undoLastAction = () => {
    // Fabric.js의 undo 기능 구현
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        fabricCanvasRef.current.remove(objects[objects.length - 1]);
        saveDrawing();
      }
    }
  };

  const toggleAnswer = async (answerId: string) => {
    if (showAnswers[answerId]) {
      // 이미 표시된 경우 숨기기
      setShowAnswers(prev => ({ ...prev, [answerId]: false }));
      return;
    }

    try {
      const response = await fetch(`/api/ebooks/answer/${ebook.pages[currentPage].id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answerId })
      });

      if (response.ok) {
        setShowAnswers(prev => ({ ...prev, [answerId]: true }));
      }
    } catch (error) {
      console.error('Error toggling answer:', error);
    }
  };

  const currentPageData = ebook.pages[currentPage];

  const processContent = (content: string): string => {
    // 정답 토글 버튼 처리
    return content.replace(
      /<span class="answer-toggle" data-id="([^"]*)"[^>]*>【정답보기】<\/span>/g,
      (match, answerId) => {
        const answer = currentPageData.answers?.find(a => a.id === answerId);
        if (showAnswers[answerId] && answer) {
          return `<span class="answer-revealed" style="background-color: #e8f5e8; padding: 2px 4px; border-radius: 3px; border: 1px solid #4caf50;">
            ${answer.answer}
            ${answer.explanation ? `<br><small>${answer.explanation}</small>` : ''}
          </span>`;
        }
        return `<button class="answer-toggle-btn" data-id="${answerId}" style="background-color: #ffffcc; cursor: pointer; padding: 2px 4px; border-radius: 3px; border: 1px solid #ddd;">【정답보기】</button>`;
      }
    );
  };

  useEffect(() => {
    // 정답 토글 버튼 이벤트 리스너
    const handleAnswerToggle = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('answer-toggle-btn')) {
        const answerId = target.getAttribute('data-id');
        if (answerId) {
          toggleAnswer(answerId);
        }
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('click', handleAnswerToggle);
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('click', handleAnswerToggle);
      }
    };
  }, [currentPage, showAnswers]);

  return (
    <div className="ebook-viewer">
      <div className="ebook-header">
        <h5>{ebook.title} - {ebook.author} (페이지 {currentPage + 1}/{ebook.pages.length})</h5>
        <button onClick={onClose}>
          <ArrowBack />
          닫기
        </button>
      </div>

      <div className="ebook-content-area">
        <div className="ebook-main-content">
          <div
            ref={contentRef}
            className="ebook-page-container"
            dangerouslySetInnerHTML={{
              __html: processContent(currentPageData.content)
            }}
          />

          <canvas
            ref={canvasRef}
            className="canvas-overlay"
            style={{
              zIndex: drawingMode ? 10 : 5,
              pointerEvents: drawingMode ? 'auto' : 'none',
              border: drawingMode ? '2px dashed #2196f3' : 'none'
            }}
          />
        </div>

        {drawingMode && (
          <div className="drawing-tools">
            <button
              className={`tool-pen ${!eraserMode ? 'active' : ''}`}
              onClick={() => setEraserMode(false)}
              style={{ backgroundColor: !eraserMode ? '#2196f3' : '#e0e0e0', color: !eraserMode ? '#fff' : '#000' }}
            >
              <Edit />
            </button>
            <button
              className={`tool-eraser ${eraserMode ? 'active' : ''}`}
              onClick={toggleEraserMode}
              style={{ backgroundColor: eraserMode ? '#f44336' : '#e0e0e0', color: eraserMode ? '#fff' : '#000' }}
              title="지우개"
            >
              🧹
            </button>
            <button className="tool-undo" onClick={undoLastAction}>
              <Undo />
            </button>
            <button className="tool-clear" onClick={clearCanvas}>
              <Clear />
            </button>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              disabled={eraserMode}
              style={{ width: 40, height: 40, border: 'none', borderRadius: '50%', opacity: eraserMode ? 0.5 : 1 }}
            />
            <input
              type="range"
              min="1"
              max="20"
              value={brushWidth}
              onChange={(e) => setBrushWidth(parseInt(e.target.value))}
              style={{ width: 100 }}
              title={`브러시 크기: ${brushWidth}`}
            />
          </div>
        )}
      </div>

      <div className="page-navigation">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
        >
          <ArrowBack />
        </button>
        <div className="page-info">
          {currentPage + 1} / {ebook.pages.length}
        </div>
        <button
          onClick={goToNextPage}
          disabled={currentPage === ebook.pages.length - 1}
        >
          <ArrowForward />
        </button>
      </div>

      {currentPageData.hasAnswers && (
        <button
          className={`answer-toggle-btn ${Object.values(showAnswers).some(Boolean) ? 'answers-shown' : ''}`}
          onClick={() => {
            // 모든 정답 토글
            const newShowAnswers: Record<string, boolean> = {};
            const hasAnyShown = Object.values(showAnswers).some(Boolean);
            currentPageData.answers?.forEach(answer => {
              newShowAnswers[answer.id] = !hasAnyShown;
            });
            setShowAnswers(newShowAnswers);
          }}
        >
          {Object.values(showAnswers).some(Boolean) ? '정답 숨기기' : '정답 보기'}
        </button>
      )}
    </div>
  );
};