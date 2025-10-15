import React, { useState, useRef } from 'react';
import { uploadPdf } from '../services/pdfService';

interface PdfUploaderProps {
  onUploadSuccess?: (objectPath: string, fileId: string) => void;
  onUploadError?: (error: Error) => void;
  maxSizeMB?: number; // 최대 파일 크기 (MB)
}

/**
 * PDF 업로드 컴포넌트
 *
 * 사용법:
 * <PdfUploader
 *   onUploadSuccess={(objectPath, fileId) => console.log('업로드 완료:', objectPath)}
 *   onUploadError={(error) => console.error('업로드 실패:', error)}
 *   maxSizeMB={100}
 * />
 */
export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  maxSizeMB = 100,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // 파일 타입 검증 (PDF 또는 EPUB)
    const validTypes = ['application/pdf', 'application/epub+zip'];
    if (!validTypes.includes(file.type)) {
      setError('PDF 또는 EPUB 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증
    if (file.size > maxSizeBytes) {
      setError(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
      return;
    }

    setSelectedFile(file);
    console.log('파일 선택됨:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  };

  // 파일 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      console.log('업로드 시작:', selectedFile.name);

      // uploadPdf 함수로 전체 업로드 프로세스 실행
      const { objectPath, fileId } = await uploadPdf(selectedFile, (progressValue) => {
        setProgress(progressValue);
        console.log(`업로드 진행률: ${progressValue}%`);
      });

      console.log('업로드 성공:', objectPath);
      setProgress(100);

      // 성공 콜백 호출
      if (onUploadSuccess) {
        onUploadSuccess(objectPath, fileId);
      }

      // 상태 초기화
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      console.error('업로드 실패:', err);
      setError(err.message || '업로드 중 오류가 발생했습니다.');

      // 에러 콜백 호출
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
    }
  };

  // 파일 선택 취소
  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '600px' }}>
      <h3>E-book 업로드 (PDF / EPUB)</h3>

      {/* 파일 선택 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,application/epub+zip,.epub"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ marginBottom: '10px' }}
        />
        <div style={{ fontSize: '12px', color: '#666' }}>
          최대 파일 크기: {maxSizeMB}MB | 허용 형식: PDF, EPUB
        </div>
      </div>

      {/* 선택된 파일 정보 */}
      {selectedFile && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <div><strong>파일명:</strong> {selectedFile.name}</div>
          <div><strong>크기:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
          <div><strong>타입:</strong> {selectedFile.type}</div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* 진행률 표시 */}
      {uploading && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>업로드 중... {progress}%</div>
          <div style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#4caf50',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: selectedFile && !uploading ? '#2196f3' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
          }}
        >
          {uploading ? '업로드 중...' : '업로드'}
        </button>

        {selectedFile && !uploading && (
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
};
