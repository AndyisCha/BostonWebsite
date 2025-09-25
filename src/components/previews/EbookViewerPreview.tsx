import React, { useState, useRef, useEffect } from 'react';
import '../../styles/EbookViewer.css';

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

export const EbookViewerPreview: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState<'pen' | 'eraser'>('pen');
  const [brushColor, setBrushColor] = useState('#2196f3');
  const [brushWidth, setBrushWidth] = useState(3);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{x: number, y: number} | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ebook = {
    id: '1',
    title: 'Elementary Grammar Basics',
    author: 'John Smith',
    pages: [
      {
        id: '1',
        pageNumber: 1,
        content: `
          <div style="padding: 40px; font-family: Arial, sans-serif; line-height: 1.6;">
            <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Chapter 1: Present Tense</h1>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057;">Grammar Rule</h3>
              <p>The present simple tense is used to describe habits, general truths, and permanent situations.</p>
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 10px 0;">
                <strong>Structure:</strong> Subject + Verb (base form) + Object
              </div>
            </div>

            <h3 style="color: #495057; margin-top: 30px;">Examples:</h3>
            <ul style="margin: 15px 0;">
              <li>I <strong>eat</strong> breakfast every morning.</li>
              <li>She <strong>works</strong> in an office.</li>
              <li>The sun <strong>rises</strong> in the east.</li>
            </ul>

            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #1976d2; margin-bottom: 15px;">Practice Exercise</h4>
              <p>Complete the sentence with the correct form of the verb:</p>
              <p style="margin: 10px 0;">She _____ (go) to school every day.</p>
              <button class="answer-toggle-btn" data-id="answer1" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Show Answer</button>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #6c757d;">
              Page 1 of 3
            </div>
          </div>
        `,
        hasAnswers: true,
        answers: [
          {
            id: 'answer1',
            answer: 'goes',
            explanation: 'Third person singular (she) requires adding -s to the verb.'
          }
        ]
      },
      {
        id: '2',
        pageNumber: 2,
        content: `
          <div style="padding: 40px; font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #2c3e50; margin-bottom: 25px;">Negative Forms</h2>

            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404;">Important Note</h4>
              <p>To make negative sentences in present simple, we use 'do not' (don't) or 'does not' (doesn't).</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4 style="color: #495057;">Positive</h4>
                <ul>
                  <li>I like coffee.</li>
                  <li>He plays guitar.</li>
                  <li>They study English.</li>
                </ul>
              </div>
              <div style="background: #ffebee; padding: 20px; border-radius: 8px;">
                <h4 style="color: #c62828;">Negative</h4>
                <ul>
                  <li>I <strong>don't</strong> like coffee.</li>
                  <li>He <strong>doesn't</strong> play guitar.</li>
                  <li>They <strong>don't</strong> study English.</li>
                </ul>
              </div>
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #2e7d32;">Quick Quiz</h4>
              <p>Which sentence is correct?</p>
              <div style="margin: 15px 0;">
                <input type="radio" name="quiz1" id="q1a" style="margin-right: 8px;">
                <label for="q1a">She don't like pizza.</label>
              </div>
              <div style="margin: 15px 0;">
                <input type="radio" name="quiz1" id="q1b" style="margin-right: 8px;">
                <label for="q1b">She doesn't like pizza.</label>
              </div>
              <button class="answer-toggle-btn" data-id="answer2" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Check Answer</button>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #6c757d;">
              Page 2 of 3
            </div>
          </div>
        `,
        hasAnswers: true,
        answers: [
          {
            id: 'answer2',
            answer: 'B) She doesn\'t like pizza.',
            explanation: 'Third person singular (she) uses "doesn\'t", not "don\'t".'
          }
        ]
      },
      {
        id: '3',
        pageNumber: 3,
        content: `
          <div style="padding: 40px; font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #2c3e50; margin-bottom: 25px;">Question Forms</h2>

            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 25px; border-radius: 12px; margin: 20px 0;">
              <h3 style="color: #1565c0; margin-bottom: 15px;">Formation Rules</h3>
              <div style="background: white; padding: 15px; border-radius: 8px;">
                <p><strong>Yes/No Questions:</strong> Do/Does + Subject + Verb + ?</p>
                <p><strong>Wh- Questions:</strong> Wh-word + Do/Does + Subject + Verb + ?</p>
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Statement</th>
                  <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Question</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #dee2e6;">You like music.</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #dee2e6;"><strong>Do</strong> you like music?</td>
                </tr>
                <tr style="background: #f8f9fa;">
                  <td style="padding: 12px 15px; border-bottom: 1px solid #dee2e6;">She speaks French.</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #dee2e6;"><strong>Does</strong> she speak French?</td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px;">They work here.</td>
                  <td style="padding: 12px 15px;"><strong>Do</strong> they work here?</td>
                </tr>
              </tbody>
            </table>

            <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #7b1fa2;">Final Challenge</h4>
              <p>Transform this statement into a question:</p>
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0; font-style: italic;">
                "He studies mathematics at university."
              </div>
              <button class="answer-toggle-btn" data-id="answer3" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Reveal Answer</button>
            </div>

            <div style="margin-top: 40px; text-align: center;">
              <div style="background: #e8f5e8; display: inline-block; padding: 15px 30px; border-radius: 25px;">
                <span style="color: #2e7d32; font-weight: bold;">🎉 Chapter Complete! 🎉</span>
              </div>
              <div style="margin-top: 15px; color: #6c757d;">Page 3 of 3</div>
            </div>
          </div>
        `,
        hasAnswers: true,
        answers: [
          {
            id: 'answer3',
            answer: 'Does he study mathematics at university?',
            explanation: 'Use "Does" for third person singular and remove the -s from the main verb.'
          }
        ]
      }
    ]
  };

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      canvas.width = container.offsetWidth - 40; // 여백 고려
      canvas.height = container.offsetHeight - 40;
    }
  }, [currentPage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingMode || !canvasRef.current) return;

    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastPosition({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingMode || !canvasRef.current || !lastPosition) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);

    if (drawingTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    setLastPosition({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const toggleAnswer = (answerId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }));
  };

  const processContent = (content: string) => {
    return content.replace(
      /class="answer-toggle-btn" data-id="([^"]*)"/g,
      (match, answerId) => {
        return `class="answer-toggle-btn" data-id="${answerId}" onclick="window.toggleAnswer('${answerId}')"`;
      }
    );
  };

  useEffect(() => {
    // 글로벌 함수로 등록
    (window as any).toggleAnswer = toggleAnswer;

    return () => {
      delete (window as any).toggleAnswer;
    };
  }, []);

  const currentPageData = ebook.pages[currentPage];

  return (
    <div className="ebook-viewer">
      <div className="ebook-header">
        <h5>{ebook.title} - {ebook.author} (페이지 {currentPage + 1}/{ebook.pages.length})</h5>
        <button onClick={() => alert('E-book 뷰어를 닫습니다.')}>
          ← 닫기
        </button>
      </div>

      <div className="ebook-content-area">
        <div className="ebook-main-content" ref={containerRef}>
          <div
            className="ebook-page-container"
            dangerouslySetInnerHTML={{
              __html: processContent(currentPageData.content)
            }}
          />

          <canvas
            ref={canvasRef}
            className="canvas-overlay"
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: drawingMode ? 10 : 5,
              pointerEvents: drawingMode ? 'auto' : 'none',
              border: drawingMode ? '2px dashed #2196f3' : 'none',
              borderRadius: '8px'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* 정답 표시 */}
          {currentPageData.answers?.map(answer =>
            showAnswers[answer.id] && (
              <div
                key={answer.id}
                className="answer-revealed"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 15,
                  maxWidth: '300px',
                  textAlign: 'center'
                }}
              >
                <strong>정답:</strong> {answer.answer}
                {answer.explanation && (
                  <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>
                    {answer.explanation}
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* 그리기 도구 */}
        <div className="drawing-tools">
          <button
            className={`tool-pen ${drawingTool === 'pen' && drawingMode ? 'active' : ''}`}
            onClick={() => {
              setDrawingMode(true);
              setDrawingTool('pen');
            }}
            title="펜 도구"
          >
            ✏️
          </button>

          <button
            className={`tool-eraser ${drawingTool === 'eraser' && drawingMode ? 'active' : ''}`}
            onClick={() => {
              setDrawingMode(true);
              setDrawingTool('eraser');
            }}
            title="지우개 도구"
          >
            🧹
          </button>

          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={{ width: 40, height: 40, border: 'none', borderRadius: '50%', cursor: 'pointer' }}
            title="색상 선택"
          />

          <input
            type="range"
            min="1"
            max="20"
            value={brushWidth}
            onChange={(e) => setBrushWidth(parseInt(e.target.value))}
            style={{ width: 40, transform: 'rotate(-90deg)' }}
            title="브러시 크기"
          />

          <button
            className="tool-clear"
            onClick={clearCanvas}
            title="모두 지우기"
          >
            🗑️
          </button>

          <button
            className="tool-pen"
            onClick={() => setDrawingMode(!drawingMode)}
            style={{
              background: drawingMode ? '#4caf50' : '#6c757d'
            }}
            title="그리기 모드 토글"
          >
            {drawingMode ? '🔒' : '🔓'}
          </button>
        </div>
      </div>

      {/* 정답 토글 버튼 */}
      {currentPageData.hasAnswers && (
        <button
          className={`answer-toggle-btn ${Object.values(showAnswers).some(Boolean) ? 'answers-shown' : ''}`}
          onClick={() => {
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

      {/* 페이지 네비게이션 */}
      <div className="page-navigation">
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          ←
        </button>
        <div className="page-info">
          {currentPage + 1} / {ebook.pages.length}
        </div>
        <button
          onClick={() => setCurrentPage(Math.min(ebook.pages.length - 1, currentPage + 1))}
          disabled={currentPage === ebook.pages.length - 1}
        >
          →
        </button>
      </div>
    </div>
  );
};