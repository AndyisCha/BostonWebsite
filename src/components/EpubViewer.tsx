import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import { fabric } from 'fabric';
import { requestViewUrl } from '../services/pdfService';

interface EpubViewerProps {
  objectPath: string;
  userEmail?: string;
  onError?: (error: Error) => void;
}

/**
 * EPUB 뷰어 컴포넌트 (epub.js + Canvas 그리기)
 *
 * 기능:
 * - EPUB 파일 렌더링
 * - Canvas 오버레이로 펜/지우개 기능
 * - 페이지 네비게이션
 */
export const EpubViewer: React.FC<EpubViewerProps> = ({
  objectPath,
  userEmail,
  onError,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Canvas 그리기 상태
  const [drawingMode, setDrawingMode] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);

  /**
   * EPUB 문서 로드
   */
  useEffect(() => {
    let isMounted = true;

    const loadEpub = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📖 EPUB 로드 시작:', objectPath);

        // 1. 서명된 보기 URL 요청
        const { url, expiresAt } = await requestViewUrl(objectPath);
        console.log('✅ 보기 URL 수신:', url, '만료:', expiresAt);

        // 2. epub.js로 문서 로드
        const book = ePub(url);
        bookRef.current = book;

        // 3. 렌더링 영역 설정
        if (viewerRef.current) {
          const rendition = book.renderTo(viewerRef.current, {
            width: '100%',
            height: 600,
            spread: 'none',
          });
          renditionRef.current = rendition;

          // 첫 페이지 표시
          await rendition.display();

          // 페이지 정보 추출
          const locations = await book.locations.generate(1024);
          setTotalPages(locations.length);
          setCurrentPage(1);

          console.log('✅ EPUB 로드 완료:', locations.length, '페이지');
        }

        if (!isMounted) return;

        setLoading(false);
      } catch (err: any) {
        console.error('❌ EPUB 로드 실패:', err);
        setError(err.message || 'EPUB 로드 실패');
        setLoading(false);

        if (onError) {
          onError(err);
        }
      }
    };

    loadEpub();

    return () => {
      isMounted = false;
      // Cleanup
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [objectPath, onError]);

  /**
   * Canvas 초기화
   */
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current && !loading) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: false,
        width: viewerRef.current?.offsetWidth || 800,
        height: 600,
        backgroundColor: 'transparent',
      });

      const brush = fabricCanvasRef.current.freeDrawingBrush;
      brush.color = brushColor;
      brush.width = brushWidth;
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [loading]);

  /**
   * Canvas 그리기 모드 업데이트
   */
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = drawingMode;

      if (drawingMode) {
        const brush = fabricCanvasRef.current.freeDrawingBrush;

        if (eraserMode) {
          brush.color = '#ffffff';
          brush.width = brushWidth * 2;
        } else {
          brush.color = brushColor;
          brush.width = brushWidth;
        }
      }
    }
  }, [drawingMode, brushColor, brushWidth, eraserMode]);

  /**
   * 페이지 네비게이션
   */
  const goToPreviousPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const goToNextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }
  };

  /**
   * Canvas 그리기 도구
   */
  const toggleDrawingMode = () => {
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
        <div>📖 EPUB 로딩 중...</div>
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
        }}
      >
        {/* 페이지 이동 */}
        <button onClick={goToPreviousPage} style={{ padding: '8px 16px' }}>
          ◀ 이전
        </button>

        <span style={{ padding: '0 10px', fontWeight: 'bold' }}>
          {currentPage} / {totalPages || '?'}
        </span>

        <button onClick={goToNextPage} style={{ padding: '8px 16px' }}>
          다음 ▶
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

      {/* EPUB 뷰어 + Canvas 오버레이 */}
      <div style={{ position: 'relative', border: '1px solid #ddd', overflow: 'auto', maxWidth: '100%' }}>
        <div ref={viewerRef} style={{ width: '100%', height: 600 }} />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: drawingMode ? 'auto' : 'none',
            zIndex: drawingMode ? 10 : 1,
            border: drawingMode ? '2px dashed #2196f3' : 'none',
          }}
        />
      </div>

      {/* 안내 메시지 */}
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        보스턴어학원 EPUB 뷰어 | 펜/지우개 도구로 메모를 남길 수 있습니다
      </div>
    </div>
  );
};
