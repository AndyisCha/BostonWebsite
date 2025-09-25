import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tabs, Tab, Alert, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails, Tooltip, Badge, Grid,
  CardHeader, Divider, Stack, Fab, Zoom
} from '@mui/material';
import {
  CloudUpload, Edit, Delete, Visibility, ExpandMore, Add,
  FileUpload, CheckCircle, Error as ErrorIcon, Info, Settings, Analytics,
  NavigateBefore, NavigateNext, Save, Close, Help, AddCircle,
  VolumeUp, PlayArrow
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/EbookManagement.css';

interface EbookFile {
  id: string;
  title: string;
  author: string;
  level: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  uploadProgress: number;
  pageCount?: number;
  hasAnswers: boolean;
  category: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface AnswerData {
  pageNumber: number;
  answers: Array<{
    id: string;
    answer: string;
    explanation?: string;
    position?: { x: number; y: number };
  }>;
}

interface AudioButton {
  id: string;
  pageNumber: number;
  title: string;
  audioUrl?: string;
  audioFile?: File;
  position: { x: number; y: number };
  duration?: number;
  isUploading?: boolean;
}

const EbookManagement: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [ebooks, setEbooks] = useState<EbookFile[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<EbookFile | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [answerDialog, setAnswerDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload form states
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    author: '',
    level: 'A1_1',
    description: '',
    category: [] as string[],
    tags: [] as string[],
    language: 'ko',
    country: 'KR'
  });

  const [answerData, setAnswerData] = useState<AnswerData[]>([]);
  const [audioButtons, setAudioButtons] = useState<AudioButton[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pagePreview, setPagePreview] = useState<string>('');
  const [editMode, setEditMode] = useState<'answers' | 'audio'>('answers');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.role === 'SUPER_MASTER') {
      loadEbooks();
    }
  }, [user]);

  const loadEbooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ebooks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEbooks(data);
      }
    } catch (error) {
      console.error('Failed to load ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.author) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('author', uploadForm.author);
    formData.append('level', uploadForm.level);
    formData.append('description', uploadForm.description);
    formData.append('category', JSON.stringify(uploadForm.category));
    formData.append('tags', JSON.stringify(uploadForm.tags));
    formData.append('language', uploadForm.language);
    formData.append('country', uploadForm.country);

    try {
      setLoading(true);
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setEbooks(prev => [response, ...prev]);
          setUploadDialog(false);
          resetUploadForm();
          alert('E-book이 성공적으로 업로드되었습니다!');
        } else {
          alert('업로드 중 오류가 발생했습니다.');
        }
        setLoading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        alert('업로드 실패');
        setLoading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', '/api/admin/ebooks/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('업로드 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [uploadForm]);

  const resetUploadForm = () => {
    setUploadForm({
      file: null,
      title: '',
      author: '',
      level: 'A1_1',
      description: '',
      category: [],
      tags: [],
      language: 'ko',
      country: 'KR'
    });
  };

  const handleAddAnswer = (ebookId: string) => {
    setSelectedEbook(ebooks.find(e => e.id === ebookId) || null);
    setAnswerDialog(true);
    setEditMode('answers');
    loadAnswerData(ebookId);
    loadAudioButtons(ebookId);
  };

  const loadAnswerData = async (ebookId: string) => {
    try {
      const response = await fetch(`/api/admin/ebooks/${ebookId}/answers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnswerData(data.answers || []);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(1);
        loadPagePreview(ebookId, 1);
      }
    } catch (error) {
      console.error('Failed to load answer data:', error);
    }
  };

  const loadPagePreview = async (ebookId: string, pageNumber: number) => {
    try {
      const response = await fetch(`/api/admin/ebooks/${ebookId}/page/${pageNumber}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPagePreview(imageUrl);
      }
    } catch (error) {
      console.error('Failed to load page preview:', error);
    }
  };

  const addAnswerToCurrentPage = () => {
    const currentPageData = answerData.find(page => page.pageNumber === currentPage);
    const newAnswer = {
      id: Date.now().toString(),
      answer: '',
      explanation: '',
      position: { x: 0, y: 0 }
    };

    if (currentPageData) {
      setAnswerData(prev => prev.map(page =>
        page.pageNumber === currentPage
          ? { ...page, answers: [...page.answers, newAnswer] }
          : page
      ));
    } else {
      setAnswerData(prev => [...prev, {
        pageNumber: currentPage,
        answers: [newAnswer]
      }]);
    }
  };

  const updateAnswer = (answerId: string, field: 'answer' | 'explanation', value: string) => {
    setAnswerData(prev => prev.map(page =>
      page.pageNumber === currentPage
        ? {
            ...page,
            answers: page.answers.map(answer =>
              answer.id === answerId ? { ...answer, [field]: value } : answer
            )
          }
        : page
    ));
  };

  const deleteAnswer = (answerId: string) => {
    setAnswerData(prev => prev.map(page =>
      page.pageNumber === currentPage
        ? {
            ...page,
            answers: page.answers.filter(answer => answer.id !== answerId)
          }
        : page
    ).filter(page => page.answers.length > 0));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (editMode === 'answers') {
      // Find the last added answer and update its position
      const currentPageData = answerData.find(page => page.pageNumber === currentPage);
      if (currentPageData && currentPageData.answers.length > 0) {
        const lastAnswer = currentPageData.answers[currentPageData.answers.length - 1];
        if (!lastAnswer.answer && !lastAnswer.position?.x) {
          setAnswerData(prev => prev.map(page =>
            page.pageNumber === currentPage
              ? {
                  ...page,
                  answers: page.answers.map((answer, index) =>
                    index === page.answers.length - 1
                      ? { ...answer, position: { x, y } }
                      : answer
                  )
                }
              : page
          ));
        }
      }
    } else if (editMode === 'audio') {
      // Add audio button at clicked position
      const audioButton: AudioButton = {
        id: Date.now().toString(),
        pageNumber: currentPage,
        title: `Audio ${currentPage}`,
        position: { x, y }
      };
      setAudioButtons(prev => [...prev, audioButton]);

      // Trigger file selection
      audioInputRef.current?.click();
    }
  };

  // Audio button management functions
  const loadAudioButtons = async (ebookId: string) => {
    try {
      const response = await fetch(`/api/ebooks/${ebookId}/audio`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAudioButtons(data.audioButtons || []);
      }
    } catch (error) {
      console.error('Failed to load audio buttons:', error);
    }
  };

  const handleAudioUpload = async (audioFile: File, buttonId: string) => {
    if (!selectedEbook) return;

    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('ebookId', selectedEbook.id);
    formData.append('pageNumber', currentPage.toString());
    formData.append('title', `Audio ${currentPage}`);

    // Update button to show uploading state
    setAudioButtons(prev => prev.map(btn =>
      btn.id === buttonId
        ? { ...btn, audioFile, isUploading: true }
        : btn
    ));

    try {
      const response = await fetch(`/api/ebooks/${selectedEbook.id}/audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAudioButtons(prev => prev.map(btn =>
          btn.id === buttonId
            ? { ...btn, audioUrl: data.audioUrl, isUploading: false }
            : btn
        ));
        alert('오디오 파일이 성공적으로 업로드되었습니다!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Audio upload error:', error);
      setAudioButtons(prev => prev.map(btn =>
        btn.id === buttonId
          ? { ...btn, isUploading: false }
          : btn
      ));
      alert('오디오 업로드 중 오류가 발생했습니다.');
    }
  };

  const deleteAudioButton = (buttonId: string) => {
    setAudioButtons(prev => prev.filter(btn => btn.id !== buttonId));
  };

  const updateAudioButtonTitle = (buttonId: string, title: string) => {
    setAudioButtons(prev => prev.map(btn =>
      btn.id === buttonId ? { ...btn, title } : btn
    ));
  };

  const saveAudioButtons = async () => {
    if (!selectedEbook) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/ebooks/${selectedEbook.id}/audio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ audioButtons })
      });

      if (response.ok) {
        alert('오디오 버튼이 성공적으로 저장되었습니다!');
      } else {
        alert('오디오 버튼 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Failed to save audio buttons:', error);
      alert('오디오 버튼 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswerData = async () => {
    if (!selectedEbook) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/ebooks/${selectedEbook.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers: answerData })
      });

      if (response.ok) {
        alert('정답이 성공적으로 저장되었습니다!');
        setAnswerDialog(false);
        loadEbooks(); // Refresh the list
      } else {
        alert('정답 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Failed to save answers:', error);
      alert('정답 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const deleteEbook = async (id: string) => {
    if (!confirm('정말로 이 E-book을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/ebooks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setEbooks(prev => prev.filter(e => e.id !== id));
        alert('E-book이 삭제되었습니다.');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <CloudUpload color="info" />;
      case 'processing': return <Settings className="rotating" />;
      case 'ready': return <CheckCircle color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <Info />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'info';
      case 'processing': return 'warning';
      case 'ready': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (user?.role !== 'SUPER_MASTER') {
    return (
      <Box p={3}>
        <Alert severity="error">
          이 페이지는 최고 마스터 계정만 접근할 수 있습니다.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3} className="ebook-management-container">
      <Typography variant="h4" gutterBottom className="gradient-text">
        📚 E-book 관리 대시보드
      </Typography>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label={
          <Badge badgeContent={ebooks.length} color="primary">
            E-book 목록
          </Badge>
        } />
        <Tab label="업로드" />
        <Tab label="통계" />
        <Tab label="설정" />
      </Tabs>

      {/* Tab 0: E-book List */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">등록된 E-book ({ebooks.length}권)</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setUploadDialog(true)}
                className="upload-btn"
              >
                새 E-book 업로드
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>상태</TableCell>
                    <TableCell>제목</TableCell>
                    <TableCell>저자</TableCell>
                    <TableCell>레벨</TableCell>
                    <TableCell>페이지</TableCell>
                    <TableCell>정답</TableCell>
                    <TableCell>등록일</TableCell>
                    <TableCell align="center">액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ebooks.map((ebook) => (
                    <TableRow key={ebook.id} hover>
                      <TableCell>
                        <Tooltip title={ebook.status}>
                          <Chip
                            icon={getStatusIcon(ebook.status)}
                            label={ebook.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(ebook.status) as any}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{ebook.title}</Typography>
                        {ebook.category.length > 0 && (
                          <Box mt={0.5}>
                            {ebook.category.map(cat => (
                              <Chip key={cat} label={cat} size="small" sx={{ mr: 0.5, fontSize: '0.6rem' }} />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{ebook.author}</TableCell>
                      <TableCell>
                        <Chip label={ebook.level.replace('_', '-')} size="small" />
                      </TableCell>
                      <TableCell>{ebook.pageCount || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={ebook.hasAnswers ? '있음' : '없음'}
                          color={ebook.hasAnswers ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(ebook.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="미리보기">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="정답 편집">
                            <IconButton
                              size="small"
                              onClick={() => handleAddAnswer(ebook.id)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="삭제">
                            <IconButton
                              size="small"
                              onClick={() => deleteEbook(ebook.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ebooks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="textSecondary">
                          등록된 E-book이 없습니다. 새 E-book을 업로드해보세요.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Upload */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              새 E-book 업로드
            </Typography>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>📤 EPUB 파일 업로드</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FileUpload />}
                    fullWidth
                    sx={{ p: 3, borderStyle: 'dashed' }}
                  >
                    EPUB 파일 선택 (최대 50MB)
                    <input
                      type="file"
                      accept=".epub"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadForm(prev => ({
                            ...prev,
                            file,
                            title: file.name.replace('.epub', '')
                          }));
                        }
                      }}
                    />
                  </Button>
                  {uploadForm.file && (
                    <Alert severity="info">
                      선택된 파일: {uploadForm.file.name} ({Math.round(uploadForm.file.size / 1024 / 1024)}MB)
                    </Alert>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>📝 메타데이터 입력</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    fullWidth
                    label="제목 *"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  />

                  <TextField
                    fullWidth
                    label="저자 *"
                    value={uploadForm.author}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, author: e.target.value }))}
                  />

                  <FormControl fullWidth>
                    <InputLabel>CEFR 레벨 *</InputLabel>
                    <Select
                      value={uploadForm.level}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, level: e.target.value }))}
                    >
                      {['A1_1', 'A1_2', 'A1_3', 'A2_1', 'A2_2', 'A2_3', 'A3_1', 'A3_2', 'A3_3',
                        'B1_1', 'B1_2', 'B1_3', 'B2_1', 'B2_2', 'B2_3', 'C1_1', 'C1_2', 'C1_3',
                        'C2_1', 'C2_2', 'C2_3'].map(level => (
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
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  />

                  <TextField
                    fullWidth
                    label="카테고리 (쉼표로 구분)"
                    placeholder="문법, 독해, 회화"
                    value={uploadForm.category.join(', ')}
                    onChange={(e) => setUploadForm(prev => ({
                      ...prev,
                      category: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                  />

                  <TextField
                    fullWidth
                    label="태그 (쉼표로 구분)"
                    placeholder="초급, 기초문법, 일상회화"
                    value={uploadForm.tags.join(', ')}
                    onChange={(e) => setUploadForm(prev => ({
                      ...prev,
                      tags: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    }))}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleFileUpload}
                disabled={!uploadForm.file || !uploadForm.title || !uploadForm.author || loading}
                startIcon={<CloudUpload />}
                fullWidth
              >
                {loading ? '업로드 중...' : 'E-book 업로드'}
              </Button>
            </Box>

            {loading && (
              <Box mt={2}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="textSecondary" align="center">
                  업로드 진행률: {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Answer Dialog */}
      <Dialog
        open={answerDialog}
        onClose={() => setAnswerDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editMode === 'answers' ? '📝 정답 편집' : '🔊 오디오 편집'}: {selectedEbook?.title}
            </Typography>
            <Box>
              <Button
                variant={editMode === 'answers' ? 'contained' : 'outlined'}
                onClick={() => setEditMode('answers')}
                sx={{ mr: 1 }}
              >
                정답 편집
              </Button>
              <Button
                variant={editMode === 'audio' ? 'contained' : 'outlined'}
                onClick={() => setEditMode('audio')}
              >
                오디오 편집
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {editMode === 'answers'
              ? '각 페이지별로 정답을 입력할 수 있습니다. 문제가 있는 페이지에만 정답을 추가하세요.'
              : '각 페이지에 오디오 버튼을 추가할 수 있습니다. 리딩 본문 위에 배치하여 사용자가 들을 수 있도록 합니다.'
            }
          </Typography>

          <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle2">
              {editMode === 'answers' ? '정답 입력 방식:' : '오디오 버튼 추가 방식:'}
            </Typography>
            <Typography variant="body2">
              {editMode === 'answers' ? (
                <>
                  1. 페이지별 정답: 각 페이지의 문제에 대한 정답 텍스트 입력<br/>
                  2. 설명 추가: 정답에 대한 해설 입력 (선택사항)<br/>
                  3. 위치 정보: 정답이 표시될 위치 좌표 (클릭으로 설정)
                </>
              ) : (
                <>
                  1. 페이지 클릭: 오디오 버튼을 배치할 위치를 클릭<br/>
                  2. 파일 업로드: MP3 파일을 선택하여 업로드<br/>
                  3. 제목 설정: 오디오 버튼의 제목을 설정 (선택사항)
                </>
              )}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Page Preview Section */}
            <Grid item xs={12} md={7}>
              <Card>
                <CardHeader
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">페이지 미리보기</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          onClick={() => {
                            if (currentPage > 1) {
                              const newPage = currentPage - 1;
                              setCurrentPage(newPage);
                              if (selectedEbook) {
                                loadPagePreview(selectedEbook.id, newPage);
                              }
                            }
                          }}
                          disabled={currentPage <= 1}
                        >
                          <NavigateBefore />
                        </IconButton>
                        <Typography variant="body2">
                          {currentPage} / {totalPages}
                        </Typography>
                        <IconButton
                          onClick={() => {
                            if (currentPage < totalPages) {
                              const newPage = currentPage + 1;
                              setCurrentPage(newPage);
                              if (selectedEbook) {
                                loadPagePreview(selectedEbook.id, newPage);
                              }
                            }
                          }}
                          disabled={currentPage >= totalPages}
                        >
                          <NavigateNext />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Box position="relative" display="inline-block" width="100%">
                    {pagePreview ? (
                      <Box position="relative">
                        <canvas
                          ref={canvasRef}
                          style={{
                            width: '100%',
                            maxHeight: '600px',
                            objectFit: 'contain',
                            cursor: 'crosshair',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px'
                          }}
                          onClick={handleCanvasClick}
                        />
                        <img
                          src={pagePreview}
                          alt={`Page ${currentPage}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            maxHeight: '600px',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            borderRadius: '8px'
                          }}
                        />
                        {/* Render answer positions */}
                        {editMode === 'answers' && answerData
                          .find(page => page.pageNumber === currentPage)?.answers
                          .map((answer, index) => (
                            answer.position && (
                              <Box
                                key={answer.id}
                                sx={{
                                  position: 'absolute',
                                  left: `${answer.position.x}%`,
                                  top: `${answer.position.y}%`,
                                  transform: 'translate(-50%, -50%)',
                                  width: '24px',
                                  height: '24px',
                                  backgroundColor: '#1976d2',
                                  color: 'white',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                  cursor: 'pointer',
                                  zIndex: 10
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const answerElement = document.getElementById(`answer-${answer.id}`);
                                  answerElement?.focus();
                                }}
                              >
                                {index + 1}
                              </Box>
                            )
                          ))
                        }

                        {/* Render audio buttons */}
                        {editMode === 'audio' && audioButtons
                          .filter(btn => btn.pageNumber === currentPage)
                          .map((audioBtn, index) => (
                            <Box
                              key={audioBtn.id}
                              sx={{
                                position: 'absolute',
                                left: `${audioBtn.position.x}%`,
                                top: `${audioBtn.position.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '40px',
                                height: '40px',
                                backgroundColor: audioBtn.audioUrl ? '#4caf50' : '#ff9800',
                                color: 'white',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                cursor: 'pointer',
                                zIndex: 10,
                                border: audioBtn.isUploading ? '2px dashed #fff' : 'none'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (audioBtn.audioUrl) {
                                  // Play audio preview
                                  const audio = new Audio(audioBtn.audioUrl);
                                  audio.play();
                                } else {
                                  // Focus on audio input
                                  const audioElement = document.getElementById(`audio-${audioBtn.id}`);
                                  audioElement?.focus();
                                }
                              }}
                            >
                              {audioBtn.isUploading ? '⏳' : audioBtn.audioUrl ? '🔊' : '📤'}
                            </Box>
                          ))
                        }
                      </Box>
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="400px"
                        bgcolor="#f5f5f5"
                        borderRadius={2}
                      >
                        <Typography color="textSecondary">
                          페이지를 로딩하는 중...
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    💡 <strong>사용법:</strong>
                    {editMode === 'answers' ? (
                      '페이지에서 정답이 위치할 곳을 클릭하면 답안 마커가 생성됩니다. 오른쪽 패널에서 정답과 설명을 입력하세요.'
                    ) : (
                      '페이지에서 오디오 버튼을 배치할 위치를 클릭하면 오디오 버튼이 생성됩니다. 오른쪽 패널에서 MP3 파일을 업로드하세요.'
                    )}
                  </Alert>
                </CardContent>
              </Card>
            </Grid>

            {/* Answer Input Section */}
            <Grid item xs={12} md={5}>
              <Card>
                <CardHeader
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">
                        {editMode === 'answers' ? '정답 입력' : '오디오 버튼 관리'}
                      </Typography>
                      <Tooltip title={editMode === 'answers' ? '새 정답 추가' : '현재 페이지 오디오 버튼 개수'}>
                        <Fab
                          size="small"
                          color="primary"
                          onClick={editMode === 'answers' ? addAnswerToCurrentPage : () => {}}
                        >
                          {editMode === 'answers' ? (
                            <AddCircle />
                          ) : (
                            <Typography variant="body2">
                              {audioButtons.filter(btn => btn.pageNumber === currentPage).length}
                            </Typography>
                          )}
                        </Fab>
                      </Tooltip>
                    </Box>
                  }
                />
                <Divider />
                <CardContent sx={{ maxHeight: '600px', overflow: 'auto' }}>
                  {editMode === 'answers' ? (
                    // Answers Mode
                    answerData
                      .find(page => page.pageNumber === currentPage)?.answers
                      .length === 0 || !answerData.find(page => page.pageNumber === currentPage) ? (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="300px"
                        textAlign="center"
                      >
                        <Help sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary" gutterBottom>
                          이 페이지에 아직 정답이 없습니다
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={addAnswerToCurrentPage}
                        >
                          첫 번째 정답 추가
                        </Button>
                      </Box>
                    ) : (
                      <Stack spacing={3}>
                        {answerData
                          .find(page => page.pageNumber === currentPage)?.answers
                          .map((answer, index) => (
                            <Card key={answer.id} variant="outlined">
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                  <Typography variant="subtitle2" color="primary">
                                    정답 #{index + 1}
                                    {answer.position && (
                                      <Chip
                                        label={`위치: ${Math.round(answer.position.x)}, ${Math.round(answer.position.y)}`}
                                        size="small"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => deleteAnswer(answer.id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>

                                <TextField
                                  id={`answer-${answer.id}`}
                                  fullWidth
                                  label="정답"
                                  value={answer.answer}
                                  onChange={(e) => updateAnswer(answer.id, 'answer', e.target.value)}
                                  margin="dense"
                                  placeholder="정답을 입력하세요"
                                  variant="outlined"
                                />

                                <TextField
                                  fullWidth
                                  label="해설 (선택사항)"
                                  value={answer.explanation || ''}
                                  onChange={(e) => updateAnswer(answer.id, 'explanation', e.target.value)}
                                  margin="dense"
                                  multiline
                                  rows={2}
                                  placeholder="정답에 대한 설명을 입력하세요"
                                  variant="outlined"
                                />

                                {!answer.position?.x && (
                                  <Alert severity="warning" sx={{ mt: 2 }}>
                                    왼쪽 페이지에서 이 정답의 위치를 클릭해주세요!
                                  </Alert>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        }
                      </Stack>
                    )
                  ) : (
                    // Audio Mode
                    audioButtons.filter(btn => btn.pageNumber === currentPage).length === 0 ? (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="300px"
                        textAlign="center"
                      >
                        <VolumeUp sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography color="textSecondary" gutterBottom>
                          이 페이지에 아직 오디오 버튼이 없습니다
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          왼쪽 페이지에서 오디오 버튼을 배치할 위치를 클릭하세요
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={3}>
                        {audioButtons
                          .filter(btn => btn.pageNumber === currentPage)
                          .map((audioBtn, index) => (
                            <Card key={audioBtn.id} variant="outlined">
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                  <Typography variant="subtitle2" color="primary">
                                    🔊 오디오 #{index + 1}
                                    <Chip
                                      label={`위치: ${Math.round(audioBtn.position.x)}, ${Math.round(audioBtn.position.y)}`}
                                      size="small"
                                      sx={{ ml: 1 }}
                                    />
                                    {audioBtn.isUploading && (
                                      <Chip
                                        label="업로드 중..."
                                        size="small"
                                        color="warning"
                                        sx={{ ml: 1 }}
                                      />
                                    )}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => deleteAudioButton(audioBtn.id)}
                                    disabled={audioBtn.isUploading}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Box>

                                <TextField
                                  id={`audio-${audioBtn.id}`}
                                  fullWidth
                                  label="버튼 제목"
                                  value={audioBtn.title}
                                  onChange={(e) => updateAudioButtonTitle(audioBtn.id, e.target.value)}
                                  margin="dense"
                                  placeholder="오디오 버튼 제목을 입력하세요"
                                  variant="outlined"
                                />

                                <Box sx={{ mt: 2 }}>
                                  <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    fullWidth
                                    disabled={audioBtn.isUploading}
                                  >
                                    {audioBtn.audioUrl ? 'MP3 파일 변경' : 'MP3 파일 업로드'}
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      hidden
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleAudioUpload(file, audioBtn.id);
                                        }
                                      }}
                                    />
                                  </Button>
                                </Box>

                                {audioBtn.audioFile && (
                                  <Alert severity="info" sx={{ mt: 2 }}>
                                    파일: {audioBtn.audioFile.name} ({Math.round(audioBtn.audioFile.size / 1024)}KB)
                                  </Alert>
                                )}

                                {audioBtn.audioUrl && (
                                  <Box sx={{ mt: 2 }}>
                                    <Button
                                      variant="contained"
                                      startIcon={<PlayArrow />}
                                      onClick={() => {
                                        const audio = new Audio(audioBtn.audioUrl);
                                        audio.play();
                                      }}
                                    >
                                      미리듣기
                                    </Button>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        }
                      </Stack>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Page Summary */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 전체 진행 상황
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="primary">
                      {answerData.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      정답이 있는 페이지
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="secondary">
                      {answerData.reduce((sum, page) => sum + page.answers.length, 0)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      총 정답 개수
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h3" color="success.main">
                      {Math.round((answerData.length / totalPages) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      완료율
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnswerDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={editMode === 'answers' ? saveAnswerData : saveAudioButtons}
            disabled={loading}
          >
            {editMode === 'answers' ? '정답 저장' : '오디오 저장'}
          </Button>
        </DialogActions>

        {/* Hidden audio file input */}
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const lastButton = audioButtons[audioButtons.length - 1];
              if (lastButton && !lastButton.audioFile) {
                handleAudioUpload(file, lastButton.id);
              }
            }
          }}
        />
      </Dialog>
    </Box>
  );
};

export default EbookManagement;