import React, { useState } from 'react';
import { PdfUploader } from '../components/PdfUploader';
import { PdfViewer } from '../components/PdfViewer';
import { EpubViewer } from '../components/EpubViewer';
import { listUserPdfs } from '../services/pdfService';

/**
 * PDF/EPUB 파일 관리 페이지
 */
export const PdfTestPage: React.FC = () => {
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [viewPath, setViewPath] = useState<string | null>(null);
  const [pdfList, setPdfList] = useState<any[]>([]);
  const [showUploader, setShowUploader] = useState(true);
  const [userEmail] = useState('admin@bostonacademy.com');

  // 업로드 성공 핸들러
  const handleUploadSuccess = (objectPath: string, fileId: string) => {
    console.log('✅ 업로드 성공:', { objectPath, fileId });
    setUploadedPath(objectPath);
    alert(`업로드 완료!\n\nObject Path: ${objectPath}\nFile ID: ${fileId}`);

    // PDF 목록 새로고침
    loadPdfList();
  };

  // 업로드 에러 핸들러
  const handleUploadError = (error: Error) => {
    console.error('❌ 업로드 실패:', error);
    alert(`업로드 실패:\n${error.message}`);
  };

  // PDF 목록 로드
  const loadPdfList = async () => {
    try {
      const { pdfs } = await listUserPdfs();
      setPdfList(pdfs);
      console.log(`📋 PDF 목록 로드됨: ${pdfs.length}개`);
    } catch (error: any) {
      console.error('❌ 목록 로드 실패:', error);
      alert(`목록 로드 실패:\n${error.message}`);
    }
  };

  // 파일 보기
  const handleView = (objectPath: string) => {
    setViewPath(objectPath);
    setShowUploader(false);
  };

  // 뷰어 에러 핸들러
  const handleViewError = (error: Error) => {
    console.error('❌ 뷰어 에러:', error);
    alert(`뷰어 에러:\n${error.message}`);
  };

  // 업로더로 돌아가기
  const handleBackToUploader = () => {
    setViewPath(null);
    setShowUploader(true);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>📚 E-book 파일 관리 (PDF / EPUB)</h1>

      {/* 탭 네비게이션 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button
          onClick={() => { setShowUploader(true); setViewPath(null); }}
          style={{
            padding: '10px 20px',
            backgroundColor: showUploader ? '#2196f3' : '#e0e0e0',
            color: showUploader ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          📤 업로드
        </button>

        <button
          onClick={() => { setShowUploader(false); setViewPath(null); loadPdfList(); }}
          style={{
            padding: '10px 20px',
            backgroundColor: !showUploader && !viewPath ? '#2196f3' : '#e0e0e0',
            color: !showUploader && !viewPath ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          📋 내 E-book 목록
        </button>
      </div>

      {/* 업로더 섹션 */}
      {showUploader && !viewPath && (
        <div>
          <PdfUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            maxSizeMB={100}
          />

          {uploadedPath && (
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
              <h3>✅ 업로드 완료</h3>
              <div style={{ marginTop: '10px' }}>
                <strong>Object Path:</strong> <code>{uploadedPath}</code>
              </div>
              <button
                onClick={() => handleView(uploadedPath)}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                👁️ 바로 보기
              </button>
            </div>
          )}
        </div>
      )}

      {/* PDF 목록 섹션 */}
      {!showUploader && !viewPath && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>📋 내 E-book 목록</h2>
            <button
              onClick={loadPdfList}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              🔄 새로고침
            </button>
          </div>

          {pdfList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <p>업로드된 E-book이 없습니다.</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                "업로드" 탭에서 PDF 또는 EPUB 파일을 업로드하세요.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>파일명</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>크기</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>상태</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>업로드 시간</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {pdfList.map((pdf) => (
                  <tr key={pdf.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{pdf.file_name}</td>
                    <td style={{ padding: '12px' }}>{(pdf.size_bytes / 1024 / 1024).toFixed(2)} MB</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: pdf.status === 'ready' ? '#e8f5e9' : '#fff3e0',
                        color: pdf.status === 'ready' ? '#2e7d32' : '#f57c00',
                      }}>
                        {pdf.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{new Date(pdf.created_at).toLocaleString('ko-KR')}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleView(pdf.object_path)}
                        disabled={pdf.status !== 'ready'}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: pdf.status === 'ready' ? '#2196f3' : '#ccc',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: pdf.status === 'ready' ? 'pointer' : 'not-allowed',
                        }}
                      >
                        👁️ 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 뷰어 섹션 */}
      {viewPath && (
        <div>
          <button
            onClick={handleBackToUploader}
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              backgroundColor: '#757575',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ← 돌아가기
          </button>

          <div style={{ marginBottom: '10px' }}>
            <strong>파일 타입:</strong> {viewPath.toLowerCase().endsWith('.epub') ? '📚 EPUB' : '📄 PDF'}
            {' | '}
            <strong>Object Path:</strong> <code>{viewPath}</code>
          </div>

          {/* EPUB 또는 PDF 뷰어 선택 */}
          {viewPath.toLowerCase().endsWith('.epub') ? (
            <EpubViewer
              objectPath={viewPath}
              userEmail={userEmail}
              onError={handleViewError}
            />
          ) : (
            <PdfViewer
              objectPath={viewPath}
              userEmail={userEmail}
              onError={handleViewError}
            />
          )}
        </div>
      )}

      {/* 도움말 */}
      <div style={{ marginTop: '60px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '14px' }}>
        <h3>💡 사용 안내</h3>
        <ul>
          <li><strong>업로드:</strong> PDF 또는 EPUB 파일을 선택하여 업로드할 수 있습니다</li>
          <li><strong>보기:</strong> PDF와 EPUB 파일을 전용 뷰어에서 확인할 수 있습니다</li>
          <li><strong>그리기 기능:</strong> 펜과 지우개 도구로 파일에 메모를 남길 수 있습니다</li>
          <li><strong>보안:</strong> 모든 파일은 안전한 서명 URL로 보호됩니다 (1시간 유효)</li>
        </ul>
      </div>
    </div>
  );
};
