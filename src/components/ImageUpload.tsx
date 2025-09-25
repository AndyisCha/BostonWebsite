import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Card,
  CardMedia,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
} from '@mui/icons-material';

interface UploadedImage {
  filename: string;
  originalName: string;
  size: number;
  url: string;
}

interface ImageUploadProps {
  onUpload?: (images: UploadedImage[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadImage = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '업로드에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  };

  const uploadMultipleImages = async (files: FileList): Promise<UploadedImage[]> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '업로드에 실패했습니다.');
    }

    const result = await response.json();
    return result.data;
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      // 파일 크기 검증
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`${file.name}이 너무 큽니다. (최대 ${maxSizeMB}MB)`);
        }
      }

      // 파일 개수 검증
      if (multiple && files.length > maxFiles) {
        throw new Error(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      }

      let newImages: UploadedImage[];

      if (multiple && files.length > 1) {
        newImages = await uploadMultipleImages(files);
      } else {
        const uploadedImage = await uploadImage(files[0]);
        newImages = [uploadedImage];
      }

      const updatedImages = multiple
        ? [...uploadedImages, ...newImages]
        : newImages;

      setUploadedImages(updatedImages);
      onUpload?.(updatedImages);

    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [uploadedImages, multiple, maxFiles, maxSizeMB, onUpload]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    handleFileSelect(event.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onUpload?.(newImages);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* 업로드 영역 */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: '2px dashed',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: dragOver ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload-input"
          type="file"
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={uploading}
        />
        <label htmlFor="image-upload-input" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
          <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {dragOver ? '파일을 놓아주세요' : '이미지를 업로드하세요'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            드래그 앤 드롭하거나 클릭하여 선택하세요
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
            파일 선택
          </Button>
        </label>
      </Box>

      {/* 업로드 진행률 */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            업로드 중...
          </Typography>
        </Box>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* 업로드된 이미지 목록 */}
      {uploadedImages.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            업로드된 이미지 ({uploadedImages.length})
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 2,
            }}
          >
            {uploadedImages.map((image, index) => (
              <Card key={index} sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={image.url}
                  alt={image.originalName}
                  sx={{ objectFit: 'cover' }}
                />
                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" noWrap title={image.originalName}>
                    {image.originalName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(image.size)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* 사용법 안내 */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        • 지원 형식: JPEG, PNG, GIF, WebP
        • 최대 파일 크기: {maxSizeMB}MB
        {multiple && ` • 최대 파일 개수: ${maxFiles}개`}
      </Typography>
    </Box>
  );
};

export default ImageUpload;