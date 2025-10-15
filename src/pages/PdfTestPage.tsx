import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, FormControl, InputLabel, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails, Grid, Alert, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import {
  ExpandMore, Visibility, Edit, VolumeUp, CloudUpload, Refresh,
  ArrowBack, Info, Assessment
} from '@mui/icons-material';
import { PdfUploader } from '../components/PdfUploader';
import { PdfViewer } from '../components/PdfViewer';
import { EpubViewer } from '../components/EpubViewer';
import { listUserPdfs } from '../services/pdfService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface MetadataForm {
  title: string;
  author: string;
  level: string;
  description: string;
  category: string[];
  tags: string[];
  language: string;
}

/**
 * E-book 파일 관리 페이지 (통합)
 */
export const PdfTestPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [viewPath, setViewPath] = useState<string | null>(null);
  const [pdfList, setPdfList] = useState<any[]>([]);
  const [userEmail] = useState('admin@bostonacademy.com');
  const [loading, setLoading] = useState(false);

  // 메타데이터 폼 상태
  const [metadata, setMetadata] = useState<MetadataForm>({
    title: '',
    author: '',
    level: 'A1_1',
    description: '',
    category: [],
    tags: [],
    language: 'ko'
  });

  // 정답/오디오 편집 다이얼로그
  const [editDialog, setEditDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [editMode, setEditMode] = useState<'answers' | 'audio'>('answers');

  useEffect(() => {
    if (tabValue === 1) {
      loadPdfList();
    }
  }, [tabValue]);

  // 업로드 성공 핸들러
  const handleUploadSuccess = (objectPath: string, fileId: string) => {
    console.log('✅ 업로드 성공:', { objectPath, fileId });
    setUploadedPath(objectPath);

    // TODO: 메타데이터를 서버에 저장
    console.log('📝 메타데이터:', metadata);

    // PDF 목록 새로고침
    loadPdfList();
  };

  // 업로드 에러 핸들러
  const handleUploadError = (error: Error) => {
    console.error('❌ 업로드 실패:', error);
  };

  // PDF 목록 로드
  const loadPdfList = async () => {
    try {
      setLoading(true);
      const { pdfs } = await listUserPdfs();
      setPdfList(pdfs);
      console.log(`📋 PDF 목록 로드됨: ${pdfs.length}개`);
    } catch (error: any) {
      console.error('❌ 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 파일 보기
  const handleView = (objectPath: string) => {
    setViewPath(objectPath);
  };

  // 뷰어 에러 핸들러
  const handleViewError = (error: Error) => {
    console.error('❌ 뷰어 에러:', error);
  };

  // 뷰어 닫기
  const handleCloseViewer = () => {
    setViewPath(null);
  };

  // 정답/오디오 편집 열기
  const handleOpenEdit = (file: any, mode: 'answers' | 'audio') => {
    setSelectedFile(file);
    setEditMode(mode);
    setEditDialog(true);
  };

  // 통계 데이터 계산
  const getStatistics = () => {
    const totalFiles = pdfList.length;
    const readyFiles = pdfList.filter(p => p.status === 'ready').length;
    const totalSize = pdfList.reduce((sum, p) => sum + (p.size_bytes || 0), 0) / 1024 / 1024;

    return { totalFiles, readyFiles, totalSize };
  };

  const stats = getStatistics();

  // 뷰어가 열려있으면 뷰어만 표시
  if (viewPath) {
    return (
      <Box p={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleCloseViewer}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          목록으로 돌아가기
        </Button>

        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>파일 타입:</strong> {viewPath.toLowerCase().endsWith('.epub') ? '📚 EPUB' : '📄 PDF'}
          {' | '}
          <strong>Object Path:</strong> <code>{viewPath}</code>
        </Alert>

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
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        📚 E-book 파일 관리
      </Typography>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="📤 업로드" />
        <Tab label="📋 목록" />
        <Tab label="📊 통계" />
      </Tabs>

      {/* 업로드 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* 파일 업로더 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <PdfUploader
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  maxSizeMB={100}
                />
              </CardContent>
            </Card>

            {uploadedPath && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">✅ 업로드 완료!</Typography>
                <Typography variant="body2">
                  <strong>Object Path:</strong> <code>{uploadedPath}</code>
                </Typography>
                <Button
                  onClick={() => handleView(uploadedPath)}
                  variant="contained"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  바로 보기
                </Button>
              </Alert>
            )}
          </Grid>

          {/* 메타데이터 입력 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📝 메타데이터 (선택사항)
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    fullWidth
                    label="제목"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    helperText="E-book 제목을 입력하세요"
                  />

                  <TextField
                    fullWidth
                    label="저자"
                    value={metadata.author}
                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                  />

                  <FormControl fullWidth>
                    <InputLabel>CEFR 레벨</InputLabel>
                    <Select
                      value={metadata.level}
                      onChange={(e) => setMetadata({ ...metadata, level: e.target.value })}
                    >
                      {['A1_1', 'A1_2', 'A1_3', 'A2_1', 'A2_2', 'A2_3',
                        'B1_1', 'B1_2', 'B1_3', 'B2_1', 'B2_2', 'B2_3',
                        'C1_1', 'C1_2', 'C1_3', 'C2_1', 'C2_2', 'C2_3'].map(level => (
                        <MenuItem key={level} value={level}>
                          {level.replace('_', '-')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="설명"
                    multiline
                    rows={3}
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    label="카테고리 (쉼표로 구분)"
                    placeholder="문법, 독해, 회화"
                    value={metadata.category.join(', ')}
                    onChange={(e) => setMetadata({
                      ...metadata,
                      category: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                  />

                  <TextField
                    fullWidth
                    label="태그 (쉼표로 구분)"
                    placeholder="초급, 기초문법, 일상회화"
                    value={metadata.tags.join(', ')}
                    onChange={(e) => setMetadata({
                      ...metadata,
                      tags: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 목록 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                내 E-book 목록 ({pdfList.length}권)
              </Typography>
              <Button
                startIcon={<Refresh />}
                onClick={loadPdfList}
                variant="outlined"
              >
                새로고침
              </Button>
            </Box>

            {loading ? (
              <LinearProgress />
            ) : pdfList.length === 0 ? (
              <Box textAlign="center" py={5}>
                <Typography color="textSecondary">
                  업로드된 E-book이 없습니다.
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  "업로드" 탭에서 PDF 또는 EPUB 파일을 업로드하세요.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>파일명</TableCell>
                      <TableCell>크기</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>업로드 시간</TableCell>
                      <TableCell align="center">액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pdfList.map((pdf) => (
                      <TableRow key={pdf.id} hover>
                        <TableCell>{pdf.file_name}</TableCell>
                        <TableCell>{(pdf.size_bytes / 1024 / 1024).toFixed(2)} MB</TableCell>
                        <TableCell>
                          <Chip
                            label={pdf.status}
                            color={pdf.status === 'ready' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(pdf.created_at).toLocaleString('ko-KR')}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} justifyContent="center">
                            <Tooltip title="보기">
                              <IconButton
                                onClick={() => handleView(pdf.object_path)}
                                disabled={pdf.status !== 'ready'}
                                color="primary"
                                size="small"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="정답 편집">
                              <IconButton
                                onClick={() => handleOpenEdit(pdf, 'answers')}
                                disabled={pdf.status !== 'ready'}
                                color="secondary"
                                size="small"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="오디오 편집">
                              <IconButton
                                onClick={() => handleOpenEdit(pdf, 'audio')}
                                disabled={pdf.status !== 'ready'}
                                color="info"
                                size="small"
                              >
                                <VolumeUp />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 통계 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Assessment sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h3" color="primary">
                    {stats.totalFiles}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    총 E-book 파일
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <CloudUpload sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h3" color="success.main">
                    {stats.readyFiles}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    사용 가능한 파일
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box textAlign="center">
                  <Info sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                  <Typography variant="h3" color="info.main">
                    {stats.totalSize.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    총 용량 (MB)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 파일 타입별 통계 */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              파일 타입별 분포
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  PDF 파일: {pdfList.filter(p => p.file_name.endsWith('.pdf')).length}개
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  EPUB 파일: {pdfList.filter(p => p.file_name.endsWith('.epub')).length}개
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 정답/오디오 편집 다이얼로그 */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode === 'answers' ? '📝 정답 편집' : '🔊 오디오 편집'}: {selectedFile?.file_name}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {editMode === 'answers'
                ? '이 기능은 곧 추가될 예정입니다. 페이지별로 정답을 입력하고 위치를 지정할 수 있습니다.'
                : '이 기능은 곧 추가될 예정입니다. 페이지별로 오디오 버튼을 추가하고 MP3 파일을 업로드할 수 있습니다.'
              }
            </Typography>
          </Alert>

          <Box textAlign="center" py={5}>
            <Typography variant="h6" color="textSecondary">
              🚧 개발 중...
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 도움말 */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          💡 사용 안내
        </Typography>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>업로드:</strong> PDF 또는 EPUB 파일을 선택하여 업로드할 수 있습니다 (최대 100MB)</li>
          <li><strong>메타데이터:</strong> 제목, 저자, 레벨 등의 정보를 입력하여 파일을 관리할 수 있습니다</li>
          <li><strong>보기:</strong> PDF와 EPUB 파일을 전용 뷰어에서 확인할 수 있습니다</li>
          <li><strong>그리기 기능:</strong> 펜과 지우개 도구로 파일에 메모를 남길 수 있습니다</li>
          <li><strong>보안:</strong> 모든 파일은 안전한 서명 URL로 보호됩니다 (1시간 유효)</li>
        </ul>
      </Alert>
    </Box>
  );
};
