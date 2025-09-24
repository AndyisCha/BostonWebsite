import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ImageUpload from './ImageUpload';

interface UploadedImage {
  filename: string;
  originalName: string;
  size: number;
  url: string;
}

const ImageUploadExample: React.FC = () => {
  const [singleImage, setSingleImage] = useState<UploadedImage[]>([]);
  const [multipleImages, setMultipleImages] = useState<UploadedImage[]>([]);

  const handleSingleUpload = (images: UploadedImage[]) => {
    setSingleImage(images);
    console.log('단일 이미지 업로드:', images);
  };

  const handleMultipleUpload = (images: UploadedImage[]) => {
    setMultipleImages(images);
    console.log('다중 이미지 업로드:', images);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        이미지 업로드 예시
      </Typography>

      {/* 단일 이미지 업로드 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          단일 이미지 업로드
        </Typography>
        <ImageUpload
          onUpload={handleSingleUpload}
          multiple={false}
          maxSizeMB={5}
        />
      </Paper>

      {/* 다중 이미지 업로드 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          다중 이미지 업로드 (최대 5개)
        </Typography>
        <ImageUpload
          onUpload={handleMultipleUpload}
          multiple={true}
          maxFiles={5}
          maxSizeMB={3}
        />
      </Paper>

      {/* 결과 표시 */}
      {(singleImage.length > 0 || multipleImages.length > 0) && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            업로드 결과
          </Typography>
          <Typography variant="body2">
            단일 이미지: {singleImage.length}개
          </Typography>
          <Typography variant="body2">
            다중 이미지: {multipleImages.length}개
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ImageUploadExample;