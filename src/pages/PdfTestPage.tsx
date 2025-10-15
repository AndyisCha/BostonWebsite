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
  ArrowBack, Info, Assessment, Delete
} from '@mui/icons-material';
import { PdfUploader } from '../components/PdfUploader';
import { PdfViewer } from '../components/PdfViewer';
import { EpubViewer } from '../components/EpubViewer';
import { listUserPdfs } from '../services/pdfService';
import { ebookService, Answer as EbookAnswer, AudioButton as EbookAudioButton } from '../services/ebookService';

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

interface Answer {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface AudioButton {
  id: string;
  pageNumber: number;
  audioUrl: string;
  x: number;
  y: number;
  label?: string;
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

  // 정답 편집 상태
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10); // PdfViewer의 onPdfLoaded에서 업데이트됨
  const [newAnswerText, setNewAnswerText] = useState('');

  // 오디오 편집 상태
  const [audioButtons, setAudioButtons] = useState<AudioButton[]>([]);
  const [uploadingAudio, setUploadingAudio] = useState(false);

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
  const handleOpenEdit = async (file: any, mode: 'answers' | 'audio') => {
    setSelectedFile(file);
    setEditMode(mode);
    setCurrentPage(1);
    setEditDialog(true);

    // 서버에서 기존 정답/오디오 데이터 로드
    try {
      if (mode === 'answers') {
        const response = await ebookService.getAnswers(file.id);
        if (response.data?.answers) {
          setAnswers(response.data.answers);
        }
      } else {
        const response = await ebookService.getAudioButtons(file.id);
        if (response.data?.audioButtons) {
          setAudioButtons(response.data.audioButtons);
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // 실패해도 다이얼로그는 열림 (빈 상태로)
      setAnswers([]);
      setAudioButtons([]);
    }
  };

  // 정답 추가
  const handleAddAnswer = () => {
    if (!newAnswerText.trim()) return;

    const newAnswer: Answer = {
      id: `answer-${Date.now()}`,
      pageNumber: currentPage,
      text: newAnswerText,
      x: 50, // 기본 위치 (%)
      y: 50,
      width: 200,
      height: 40
    };

    setAnswers([...answers, newAnswer]);
    setNewAnswerText('');
  };

  // 정답 삭제
  const handleDeleteAnswer = (answerId: string) => {
    setAnswers(answers.filter(a => a.id !== answerId));
  };

  // 정답 수정
  const handleUpdateAnswer = (answerId: string, updates: Partial<Answer>) => {
    setAnswers(answers.map(a => a.id === answerId ? { ...a, ...updates } : a));
  };

  // 오디오 버튼 추가
  const handleAddAudioButton = (audioUrl: string) => {
    const newButton: AudioButton = {
      id: `audio-${Date.now()}`,
      pageNumber: currentPage,
      audioUrl,
      x: 50,
      y: 50,
      label: '🔊 재생'
    };

    setAudioButtons([...audioButtons, newButton]);
  };

  // 오디오 버튼 삭제
  const handleDeleteAudioButton = (buttonId: string) => {
    setAudioButtons(audioButtons.filter(b => b.id !== buttonId));
  };

  // 정답/오디오 저장
  const handleSaveEdits = async () => {
    if (!selectedFile?.id) {
      alert('파일 ID가 없습니다.');
      return;
    }

    try {
      if (editMode === 'answers') {
        await ebookService.saveAnswers(selectedFile.id, answers);
        alert('정답이 저장되었습니다!');
      } else {
        await ebookService.saveAudioButtons(selectedFile.id, audioButtons);
        alert('오디오 버튼이 저장되었습니다!');
      }

      setEditDialog(false);
    } catch (error: any) {
      console.error('저장 실패:', error);
      alert(`저장에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
    }
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
            onPdfLoaded={(numPages) => setTotalPages(numPages)}
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editMode === 'answers' ? '📝 정답 편집' : '🔊 오디오 편집'}: {selectedFile?.file_name}
        </DialogTitle>
        <DialogContent>
          {/* 페이지 네비게이션 */}
          <Box display="flex" alignItems="center" gap={2} mb={3} p={2} bgcolor="grey.100" borderRadius={1}>
            <Typography variant="body2" fontWeight="bold">
              페이지:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              이전
            </Button>
            <Typography variant="body1" fontWeight="bold">
              {currentPage} / {totalPages}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              다음
            </Button>
            <TextField
              size="small"
              type="number"
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value) || 1;
                setCurrentPage(Math.max(1, Math.min(totalPages, page)));
              }}
              sx={{ width: 80 }}
              inputProps={{ min: 1, max: totalPages }}
            />
          </Box>

          {editMode === 'answers' ? (
            /* 정답 편집 UI */
            <Box>
              <Typography variant="h6" gutterBottom>
                페이지 {currentPage}의 정답 ({answers.filter(a => a.pageNumber === currentPage).length}개)
              </Typography>

              {/* 새 정답 추가 */}
              <Card sx={{ mb: 2, p: 2, bgcolor: 'primary.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  ➕ 새 정답 추가
                </Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="정답 텍스트를 입력하세요"
                    value={newAnswerText}
                    onChange={(e) => setNewAnswerText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAnswer()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddAnswer}
                    disabled={!newAnswerText.trim()}
                  >
                    추가
                  </Button>
                </Box>
              </Card>

              {/* 정답 목록 */}
              <Box>
                {answers.filter(a => a.pageNumber === currentPage).length === 0 ? (
                  <Alert severity="info">
                    이 페이지에 추가된 정답이 없습니다.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {answers
                      .filter(a => a.pageNumber === currentPage)
                      .map((answer) => (
                        <Grid item xs={12} key={answer.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start">
                                <Box flex={1}>
                                  <TextField
                                    fullWidth
                                    value={answer.text}
                                    onChange={(e) =>
                                      handleUpdateAnswer(answer.id, { text: e.target.value })
                                    }
                                    variant="standard"
                                    sx={{ mb: 2 }}
                                  />
                                  <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="X 위치 (%)"
                                        type="number"
                                        value={answer.x}
                                        onChange={(e) =>
                                          handleUpdateAnswer(answer.id, {
                                            x: parseInt(e.target.value) || 0
                                          })
                                        }
                                        inputProps={{ min: 0, max: 100 }}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Y 위치 (%)"
                                        type="number"
                                        value={answer.y}
                                        onChange={(e) =>
                                          handleUpdateAnswer(answer.id, {
                                            y: parseInt(e.target.value) || 0
                                          })
                                        }
                                        inputProps={{ min: 0, max: 100 }}
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                  sx={{ ml: 1 }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  💡 위치는 페이지 전체 크기 대비 백분율(%)로 설정됩니다. (0~100)
                </Typography>
              </Alert>
            </Box>
          ) : (
            /* 오디오 편집 UI */
            <Box>
              <Typography variant="h6" gutterBottom>
                페이지 {currentPage}의 오디오 버튼 ({audioButtons.filter(b => b.pageNumber === currentPage).length}개)
              </Typography>

              {/* 새 오디오 버튼 추가 */}
              <Card sx={{ mb: 2, p: 2, bgcolor: 'info.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  ➕ 새 오디오 버튼 추가
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  disabled={uploadingAudio}
                >
                  {uploadingAudio ? '업로드 중...' : '🎵 MP3 파일 선택'}
                  <input
                    type="file"
                    hidden
                    accept="audio/mpeg,audio/mp3"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        setUploadingAudio(true);

                        if (!selectedFile?.id) {
                          alert('파일 ID가 없습니다.');
                          return;
                        }

                        // 실제 오디오 파일 업로드
                        const response = await ebookService.uploadAudioFile(
                          selectedFile.id,
                          file,
                          currentPage
                        );

                        if (response.data?.audioUrl) {
                          handleAddAudioButton(response.data.audioUrl);
                          alert('오디오 파일이 업로드되었습니다!');
                        }
                      } catch (error: any) {
                        console.error('오디오 업로드 실패:', error);
                        alert(`오디오 업로드에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
                      } finally {
                        setUploadingAudio(false);
                      }
                    }}
                  />
                </Button>
              </Card>

              {/* 오디오 버튼 목록 */}
              <Box>
                {audioButtons.filter(b => b.pageNumber === currentPage).length === 0 ? (
                  <Alert severity="info">
                    이 페이지에 추가된 오디오 버튼이 없습니다.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    {audioButtons
                      .filter(b => b.pageNumber === currentPage)
                      .map((button) => (
                        <Grid item xs={12} key={button.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start">
                                <Box flex={1}>
                                  <Typography variant="body2" gutterBottom>
                                    🔊 {button.label || '오디오 버튼'}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary" gutterBottom display="block">
                                    파일: {button.audioUrl.substring(0, 50)}...
                                  </Typography>
                                  <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="X 위치 (%)"
                                        type="number"
                                        value={button.x}
                                        onChange={(e) =>
                                          setAudioButtons(
                                            audioButtons.map(b =>
                                              b.id === button.id
                                                ? { ...b, x: parseInt(e.target.value) || 0 }
                                                : b
                                            )
                                          )
                                        }
                                        inputProps={{ min: 0, max: 100 }}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        label="Y 위치 (%)"
                                        type="number"
                                        value={button.y}
                                        onChange={(e) =>
                                          setAudioButtons(
                                            audioButtons.map(b =>
                                              b.id === button.id
                                                ? { ...b, y: parseInt(e.target.value) || 0 }
                                                : b
                                            )
                                          )
                                        }
                                        inputProps={{ min: 0, max: 100 }}
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteAudioButton(button.id)}
                                  sx={{ ml: 1 }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  💡 오디오 버튼은 페이지에 겹쳐서 표시됩니다. 적절한 위치에 배치하세요.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveEdits}>
            저장
          </Button>
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
