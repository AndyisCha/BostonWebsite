import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { fabric } from 'fabric';
import { requestViewUrl } from '../services/pdfService';
import { Answer, AudioButton } from '../services/ebookService';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  objectPath: string;
  userEmail?: string;
  watermarkText?: string;
  onError?: (error: Error) => void;
  onPdfLoaded?: (numPages: number) => void;
  answers?: Answer[];
  audioButtons?: AudioButton[];
}

/**
 * PDF 뷰어 컴포넌트 (pdf.js + Canvas 그리기)
 *
 * 기능:
 * - PDF 렌더링 (pdf.js)
 * - 워터마크
 * - Canvas 그리기 (펜/지우개)
 */
export const PdfViewer: React.FC<PdfViewerProps> = ({
  objectPath,
  userEmail,
  watermarkText,
  onError,
  onPdfLoaded,
  answers = [],
  audioButtons = [],
}) => {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);

  // Canvas 그리기 상태
  const [drawingMode, setDrawingMode] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);

  /**
   * 워터마크 그리기
   */
  const drawWatermark = (ctx: CanvasRenderingContext2D, text: string) => {
    const { width, height } = ctx.canvas;

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#000000';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  /**
   * PDF 페이지 렌더링
   */
  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !pdfCanvasRef.current) return;

    try {
      console.log(`페이지 ${pageNum} 렌더링 중...`);

      const page = await pdfDoc.getPage(pageNum);
      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context를 가져올 수 없습니다.');
      }

      const viewport = page.getViewport({ scale });

      // Canvas 크기 설정
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // PDF 페이지 렌더링
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // 워터마크 추가
      const watermark = watermarkText || '보스턴어학원';
      drawWatermark(context, watermark);

      // Drawing Canvas 크기 업데이트 (초기화는 별도 useEffect에서)
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.setWidth(viewport.width);
        fabricCanvasRef.current.setHeight(viewport.height);
        console.log('📐 Drawing Canvas 크기 업데이트:', { width: viewport.width, height: viewport.height });
      }

      console.log(`페이지 ${pageNum} 렌더링 완료`);
    } catch (err: any) {
      console.error('페이지 렌더링 실패:', err);
      setError(`페이지 렌더링 실패: ${err.message}`);
    }
  };

  /**
   * PDF 문서 로드
   */
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('PDF 로드 시작:', objectPath);

        const { url, expiresAt } = await requestViewUrl(objectPath);
        console.log('보기 URL 수신:', url, '만료:', expiresAt);

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        console.log('PDF 로드 완료:', pdf.numPages, '페이지');

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);

        // 페이지 수를 부모 컴포넌트로 전달
        if (onPdfLoaded) {
          onPdfLoaded(pdf.numPages);
        }
      } catch (err: any) {
        console.error('PDF 로드 실패:', err);
        setError(err.message || 'PDF 로드 실패');
        setLoading(false);

        if (onError) {
          onError(err);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [objectPath, onError]);

  /**
   * Fabric.js Canvas 초기화 (한 번만 실행)
   */
  useEffect(() => {
    // 초기화 타이머로 PDF 렌더링 완료를 기다림
    const initTimer = setInterval(() => {
      if (drawingCanvasRef.current && !fabricCanvasRef.current && pdfCanvasRef.current && pdfCanvasRef.current.width > 0) {
        clearInterval(initTimer);

        const width = pdfCanvasRef.current.width;
        const height = pdfCanvasRef.current.height;

        console.log('🎨 Drawing Canvas 초기화 시작:', { width, height });

        fabricCanvasRef.current = new fabric.Canvas(drawingCanvasRef.current, {
          isDrawingMode: false,
          width: width,
          height: height,
          backgroundColor: 'transparent',
          selection: false, // 객체 선택 비활성화
        });

        const brush = fabricCanvasRef.current.freeDrawingBrush;
        brush.color = brushColor;
        brush.width = brushWidth;
        brush.globalCompositeOperation = 'source-over'; // 기본 그리기 모드

        // Fabric.js가 생성한 wrapper에 스타일 적용
        const canvasWrapper = fabricCanvasRef.current.wrapperEl;
        console.log('🔍 Canvas wrapper 찾기:', canvasWrapper);

        if (canvasWrapper) {
          canvasWrapper.style.position = 'absolute';
          canvasWrapper.style.top = '0';
          canvasWrapper.style.left = '0';
          canvasWrapper.style.pointerEvents = 'none'; // 초기에는 비활성화
          canvasWrapper.style.zIndex = '1';
          console.log('📦 Canvas wrapper 스타일 적용됨');
        }

        console.log('✅ Drawing Canvas 초기화 완료', fabricCanvasRef.current);
      }
    }, 100);

    return () => {
      clearInterval(initTimer);
      // 컴포넌트 언마운트 시에만 dispose
      if (fabricCanvasRef.current) {
        console.log('🗑️ Drawing Canvas dispose');
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []); // 빈 배열: 컴포넌트 마운트/언마운트 시에만 실행

  /**
   * 현재 페이지 렌더링
   */
  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  /**
   * Canvas 그리기 모드 업데이트
   */
  useEffect(() => {
    console.log('🔧 Canvas 모드 업데이트:', {
      fabricCanvasExists: !!fabricCanvasRef.current,
      drawingMode,
      eraserMode,
      brushColor,
      brushWidth
    });

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = drawingMode;
      console.log('✅ isDrawingMode 설정됨:', drawingMode);

      // Wrapper div의 pointerEvents도 업데이트
      const canvasWrapper = drawingCanvasRef.current?.parentElement;
      if (canvasWrapper) {
        canvasWrapper.style.pointerEvents = drawingMode ? 'auto' : 'none';
        canvasWrapper.style.zIndex = drawingMode ? '10' : '1';
        console.log('📦 Wrapper pointerEvents:', drawingMode ? 'auto' : 'none');
      }

      if (drawingMode) {
        // 항상 PencilBrush 사용
        if (!fabricCanvasRef.current.freeDrawingBrush || fabricCanvasRef.current.freeDrawingBrush.type !== 'pencil') {
          fabricCanvasRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvasRef.current);
        }

        const brush = fabricCanvasRef.current.freeDrawingBrush;

        if (eraserMode) {
          // 지우개 모드: destination-out으로 실제로 지우기
          brush.width = brushWidth * 3;
          brush.color = 'rgba(255, 255, 255, 1)'; // 색상은 중요하지 않음

          // Path 생성 시 globalCompositeOperation 적용을 위한 이벤트 핸들러
          fabricCanvasRef.current.off('path:created');
          fabricCanvasRef.current.on('path:created', (e: any) => {
            const path = e.path;
            path.globalCompositeOperation = 'destination-out';
            fabricCanvasRef.current?.renderAll();
          });

          console.log('🧹 지우개 모드 활성화:', { width: brushWidth * 3 });
        } else {
          // 펜 모드: 일반 그리기
          brush.width = brushWidth;
          brush.color = brushColor;

          // 이벤트 핸들러 제거하고 기본 동작으로
          fabricCanvasRef.current.off('path:created');
          fabricCanvasRef.current.on('path:created', (e: any) => {
            const path = e.path;
            path.globalCompositeOperation = 'source-over';
            fabricCanvasRef.current?.renderAll();
          });

          console.log('✏️ 펜 모드 활성화:', { color: brushColor, width: brushWidth });
        }
      }
    } else {
      console.error('❌ fabricCanvasRef.current가 null입니다!');
    }
  }, [drawingMode, brushColor, brushWidth, eraserMode]);

  /**
   * 페이지 네비게이션
   */
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * 확대/축소
   */
  const zoomIn = () => setScale(scale + 0.25);
  const zoomOut = () => setScale(Math.max(0.5, scale - 0.25));

  /**
   * Canvas 그리기 도구
   */
  const toggleDrawingMode = () => {
    console.log('🖊️ 펜 버튼 클릭:', {
      before: drawingMode,
      after: !drawingMode,
      fabricCanvasExists: !!fabricCanvasRef.current
    });
    setDrawingMode(!drawingMode);
    if (!drawingMode) {
      setEraserMode(false);
    }
  };

  const toggleEraserMode = () => {
    if (!drawingMode) {
      setDrawingMode(true);
    }
    setEraserMode(!eraserMode);
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
    }
  };

  const undoLastAction = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        fabricCanvasRef.current.remove(objects[objects.length - 1]);
      }
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>📄 PDF 로딩 중...</div>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#c62828' }}>
        <div>⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      {/* 컨트롤 패널 */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* 페이지 이동 */}
        <button onClick={goToPreviousPage} disabled={currentPage <= 1} style={{ padding: '8px 16px' }}>
          ◀ 이전
        </button>

        <span style={{ padding: '0 10px', fontWeight: 'bold' }}>
          {currentPage} / {numPages}
        </span>

        <button onClick={goToNextPage} disabled={currentPage >= numPages} style={{ padding: '8px 16px' }}>
          다음 ▶
        </button>

        <div style={{ width: '1px', height: '30px', backgroundColor: '#ccc', margin: '0 10px' }} />

        {/* 확대/축소 */}
        <button onClick={zoomOut} style={{ padding: '8px 16px' }}>
          축소 -
        </button>

        <span style={{ padding: '0 10px' }}>{Math.round(scale * 100)}%</span>

        <button onClick={zoomIn} style={{ padding: '8px 16px' }}>
          확대 +
        </button>

        <div style={{ width: '1px', height: '30px', backgroundColor: '#ccc', margin: '0 10px' }} />

        {/* 그리기 도구 */}
        <button
          onClick={toggleDrawingMode}
          style={{
            padding: '8px 16px',
            backgroundColor: drawingMode && !eraserMode ? '#2196f3' : '#e0e0e0',
            color: drawingMode && !eraserMode ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✏️ 펜
        </button>

        <button
          onClick={toggleEraserMode}
          style={{
            padding: '8px 16px',
            backgroundColor: eraserMode ? '#f44336' : '#e0e0e0',
            color: eraserMode ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          🧹 지우개
        </button>

        {drawingMode && !eraserMode && (
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={{ width: 40, height: 40, border: 'none', borderRadius: '50%' }}
          />
        )}

        <input
          type="range"
          min="1"
          max="20"
          value={brushWidth}
          onChange={(e) => setBrushWidth(parseInt(e.target.value))}
          style={{ width: 100 }}
          title={`브러시 크기: ${brushWidth}`}
        />

        <button onClick={undoLastAction} style={{ padding: '8px 16px' }}>
          ↶ 실행 취소
        </button>

        <button onClick={clearCanvas} style={{ padding: '8px 16px' }}>
          🗑️ 전체 지우기
        </button>
      </div>

      {/* PDF 뷰어 + Canvas 오버레이 */}
      <div
        ref={containerRef}
        style={{ position: 'relative', border: '1px solid #ddd', overflow: 'hidden', maxWidth: '100%' }}
      >
        {/* PDF 렌더링 Canvas */}
        <canvas ref={pdfCanvasRef} style={{ display: 'block' }} />

        {/* 그리기 Canvas (오버레이) - Fabric.js가 wrapper를 자동 생성 */}
        <canvas
          ref={drawingCanvasRef}
          id="drawing-canvas"
          style={{
            border: drawingMode ? '2px dashed #2196f3' : 'none',
          }}
        />

        {/* 정답/오디오 버튼 오버레이 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5,
        }}>
          {/* 정답 표시 */}
          {answers
            .filter(answer => answer.pageNumber === currentPage)
            .map((answer) => {
              const fontSize = answer.fontSize || 16;
              const color = answer.color || '#4caf50';
              const textX = answer.textX ?? answer.x;
              const textY = answer.textY ?? (answer.y - 10);

              return (
                <div key={answer.id}>
                  {/* 열쇠 아이콘 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${answer.x}%`,
                      top: `${answer.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: '24px',
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                    title={answer.text}
                  >
                    🔑
                  </div>

                  {/* 정답 텍스트 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${textX}%`,
                      top: `${textY}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: color,
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: `${fontSize}px`,
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'auto',
                      cursor: 'help',
                      zIndex: 9,
                      border: `2px solid ${color}`,
                    }}
                  >
                    {answer.text}
                  </div>
                </div>
              );
            })}

          {/* 오디오 버튼 표시 */}
          {audioButtons
            .filter(button => button.pageNumber === currentPage)
            .map((button) => (
              <button
                key={button.id}
                onClick={() => {
                  const audio = new Audio(button.audioUrl);
                  audio.play().catch(err => console.error('오디오 재생 실패:', err));
                }}
                style={{
                  position: 'absolute',
                  left: `${button.x}%`,
                  top: `${button.y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(33, 150, 243, 0.9)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 1)';
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
                title={button.label || '오디오 재생'}
              >
                {button.label || '🔊'}
              </button>
            ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        보스턴어학원 PDF 뷰어 | 펜/지우개 도구로 메모를 남길 수 있습니다
      </div>
    </div>
  );
};
