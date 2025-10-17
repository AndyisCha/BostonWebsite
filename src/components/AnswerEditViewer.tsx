import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Box, Typography, IconButton, TextField, Button } from '@mui/material';
import { ZoomIn, ZoomOut, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { requestViewUrl } from '../services/pdfService';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export interface Answer {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  visible?: boolean;
}

interface AnswerEditViewerProps {
  objectPath: string;
  currentPage: number;
  answers: Answer[];
  onPageChange: (page: number) => void;
  onAnswersChange: (answers: Answer[]) => void;
  onPdfLoaded?: (numPages: number) => void;
}

/**
 * 정답 편집 전용 PDF 뷰어
 * - PDF 렌더링
 * - 드래그 가능한 열쇠 아이콘
 * - 클릭하여 정답 표시/숨김
 * - 텍스트 스타일 편집 (색상, 크기)
 */
export const AnswerEditViewer: React.FC<AnswerEditViewerProps> = ({
  objectPath,
  currentPage,
  answers,
  onPageChange,
  onAnswersChange,
  onPdfLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // 선택된 정답 (스타일 편집용)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // 드래깅 상태
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  /**
   * PDF 문서 로드
   */
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const { url } = await requestViewUrl(objectPath);
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);

        if (onPdfLoaded) {
          onPdfLoaded(pdf.numPages);
        }
      } catch (err: any) {
        console.error('PDF 로드 실패:', err);
        setError(err.message || 'PDF 로드 실패');
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [objectPath]);

  /**
   * PDF 페이지 렌더링
   */
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;

        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        setCanvasSize({ width: viewport.width, height: viewport.height });

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (err) {
        console.error('페이지 렌더링 실패:', err);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  /**
   * 정답 추가
   */
  const handleAddAnswer = () => {
    const newAnswer: Answer = {
      id: `answer-${Date.now()}`,
      pageNumber: currentPage,
      text: '새 정답',
      x: 50,
      y: 50,
      fontSize: 16,
      color: '#4caf50',
      visible: false,
    };

    onAnswersChange([...answers, newAnswer]);
    setSelectedAnswer(newAnswer.id);
  };

  /**
   * 정답 삭제
   */
  const handleDeleteAnswer = (id: string) => {
    onAnswersChange(answers.filter(a => a.id !== id));
    if (selectedAnswer === id) {
      setSelectedAnswer(null);
    }
  };

  /**
   * 정답 업데이트
   */
  const handleUpdateAnswer = (id: string, updates: Partial<Answer>) => {
    onAnswersChange(
      answers.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  };

  /**
   * 열쇠 아이콘 드래그 시작
   */
  const handleMouseDown = (e: React.MouseEvent, answer: Answer) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const answerX = (answer.x / 100) * canvasSize.width;
    const answerY = (answer.y / 100) * canvasSize.height;

    setDraggingId(answer.id);
    setDragOffset({
      x: clickX - answerX,
      y: clickY - answerY,
    });
  };

  /**
   * 드래그 중
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = ((mouseX - dragOffset.x) / canvasSize.width) * 100;
    const newY = ((mouseY - dragOffset.y) / canvasSize.height) * 100;

    handleUpdateAnswer(draggingId, {
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY)),
    });
  };

  /**
   * 드래그 종료
   */
  const handleMouseUp = () => {
    setDraggingId(null);
  };

  /**
   * 열쇠 아이콘 클릭 (정답 표시/숨김 토글)
   */
  const handleKeyClick = (answer: Answer) => {
    if (draggingId) return; // 드래그 중이면 무시

    handleUpdateAnswer(answer.id, { visible: !answer.visible });
    setSelectedAnswer(answer.id);
  };

  // 현재 페이지의 정답들
  const pageAnswers = answers.filter(a => a.pageNumber === currentPage);
  const selected = answers.find(a => a.id === selectedAnswer);

  if (loading) {
    return <Box p={3} textAlign="center">📄 PDF 로딩 중...</Box>;
  }

  if (error) {
    return <Box p={3} textAlign="center" color="error.main">⚠️ {error}</Box>;
  }

  return (
    <Box>
      {/* 컨트롤 패널 */}
      <Box display="flex" gap={1} mb={2} p={1.5} bgcolor="grey.100" borderRadius={1} alignItems="center" flexWrap="wrap">
        {/* 페이지 네비게이션 */}
        <IconButton
          size="small"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <NavigateBefore />
        </IconButton>

        <Typography variant="body2" fontWeight="bold">
          {currentPage} / {numPages}
        </Typography>

        <IconButton
          size="small"
          onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
          disabled={currentPage >= numPages}
        >
          <NavigateNext />
        </IconButton>

        <Box sx={{ width: '1px', height: 24, bgcolor: 'grey.400', mx: 1 }} />

        {/* 확대/축소 */}
        <IconButton size="small" onClick={() => setScale(Math.max(0.5, scale - 0.25))}>
          <ZoomOut />
        </IconButton>

        <Typography variant="body2">{Math.round(scale * 100)}%</Typography>

        <IconButton size="small" onClick={() => setScale(scale + 0.25)}>
          <ZoomIn />
        </IconButton>

        <Box sx={{ width: '1px', height: 24, bgcolor: 'grey.400', mx: 1 }} />

        {/* 정답 추가 */}
        <Button variant="contained" size="small" onClick={handleAddAnswer}>
          🔑 정답 추가
        </Button>

        <Typography variant="caption" color="text.secondary" ml={2}>
          💡 열쇠를 드래그하여 위치 조정, 클릭하여 정답 표시/숨김
        </Typography>
      </Box>

      <Box display="flex" gap={2}>
        {/* PDF 뷰어 */}
        <Box
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          sx={{
            position: 'relative',
            border: '1px solid #ddd',
            overflow: 'hidden',
            cursor: draggingId ? 'grabbing' : 'default',
            flex: 1,
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block' }} />

          {/* 정답 열쇠 아이콘 오버레이 */}
          {pageAnswers.map((answer) => {
            const fontSize = answer.fontSize || 16;
            const color = answer.color || '#4caf50';

            return (
              <div key={answer.id}>
                {/* 열쇠 아이콘 */}
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e, answer);
                  }}
                  onClick={() => handleKeyClick(answer)}
                  style={{
                    position: 'absolute',
                    left: `${answer.x}%`,
                    top: `${answer.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: '32px',
                    cursor: draggingId === answer.id ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    zIndex: 10,
                    filter: selectedAnswer === answer.id ? 'drop-shadow(0 0 8px #2196f3)' : 'none',
                  }}
                  title={answer.text}
                >
                  🔑
                </div>

                {/* 정답 텍스트 (visible일 때만) - 드래그 가능 */}
                {answer.visible && (
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(e, answer);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${answer.x}%`,
                      top: `${answer.y}%`,
                      transform: 'translate(-50%, calc(-100% - 45px))',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: color,
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: `${fontSize}px`,
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      whiteSpace: 'nowrap',
                      cursor: draggingId === answer.id ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      zIndex: 9,
                      border: `2px solid ${color}`,
                    }}
                  >
                    {answer.text}
                  </div>
                )}
              </div>
            );
          })}
        </Box>

        {/* 스타일 편집 패널 */}
        {selected && (
          <Box
            sx={{
              width: 280,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              color: 'text.primary',  // 명시적으로 텍스트 색상 지정
            }}
          >
            <Typography variant="h6" gutterBottom color="text.primary">
              정답 편집
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="정답 텍스트"
                value={selected.text}
                onChange={(e) => handleUpdateAnswer(selected.id, { text: e.target.value })}
                size="small"
              />

              <Box>
                <Typography variant="caption" gutterBottom display="block" color="text.primary">
                  텍스트 색상
                </Typography>
                <input
                  type="color"
                  value={selected.color || '#4caf50'}
                  onChange={(e) => handleUpdateAnswer(selected.id, { color: e.target.value })}
                  style={{
                    width: '100%',
                    height: 40,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" gutterBottom display="block" color="text.primary">
                  텍스트 크기: {selected.fontSize || 16}px
                </Typography>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={selected.fontSize || 16}
                  onChange={(e) => handleUpdateAnswer(selected.id, { fontSize: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </Box>

              <Box>
                <Typography variant="caption" gutterBottom display="block" color="text.primary">
                  위치
                </Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    label="X (%)"
                    type="number"
                    size="small"
                    value={Math.round(selected.x)}
                    onChange={(e) => handleUpdateAnswer(selected.id, { x: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Y (%)"
                    type="number"
                    size="small"
                    value={Math.round(selected.y)}
                    onChange={(e) => handleUpdateAnswer(selected.id, { y: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDeleteAnswer(selected.id)}
              >
                이 정답 삭제
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
