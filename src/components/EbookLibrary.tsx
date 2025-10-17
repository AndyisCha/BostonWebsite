import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, CardMedia, Typography, Button,
  Chip, Dialog, CircularProgress, Alert, TextField, Select, MenuItem,
  FormControl, InputLabel, Pagination, InputAdornment, IconButton,
  Collapse, Checkbox, FormControlLabel, FormGroup, Tooltip, Badge,
  Menu, MenuList, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Search, FilterList, Clear, ExpandMore, ExpandLess, GridView,
  ViewList, Bookmark, BookmarkBorder, Star, StarBorder,
  Share, Download, Visibility, AccessTime, TrendingUp, ArrowBack
} from '@mui/icons-material';
import { EbookViewer } from './EbookViewer';
import { PdfViewer } from './PdfViewer';
import { listUserPdfs } from '../services/pdfService';
import { ebookService, Answer, AudioButton } from '../services/ebookService';
import '../styles/EbookLibrary.css';

// EbookViewer에서 요구하는 타입 정의
interface EbookData {
  id: string;
  title: string;
  author: string;
  pages: Array<{
    id: string;
    pageNumber: number;
    content: string;
    hasAnswers: boolean;
    answers?: Array<{
      id: string;
      answer: string;
      explanation?: string;
    }>;
  }>;
}

interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  level: string;
  language?: string;
  country?: string;
  category?: string[];
  tags?: string[];
  coverImage?: string;
  pageCount?: number;
  isNew?: boolean;
  isHot?: boolean;
  hasAccess?: boolean;
  pages?: Array<{
    id: string;
    pageNumber: number;
    content: string;
    hasAnswers: boolean;
  }>;
  // PDF 관련 필드
  isPdf?: boolean;
  object_path?: string;
  file_name?: string;
}

interface SearchFilters {
  query: string;
  levels: string[];
  languages: string[];
  countries: string[];
  categories: string[];
  sort: string;
}

interface EbookLibraryProps {
  userId: string;
}

interface SelectedPdfData {
  path: string;
  id: string;
  answers: Answer[];
  audioButtons: AudioButton[];
}

export const EbookLibrary: React.FC<EbookLibraryProps> = ({ userId }) => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<EbookData | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<SelectedPdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bookmarkedBooks, setBookmarkedBooks] = useState<Set<string>>(new Set());
  const [recentBooks, setRecentBooks] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    bookId: string;
  } | null>(null);
  const [previewBook, setPreviewBook] = useState<Ebook | null>(null);
  const [recommendations, setRecommendations] = useState<Ebook[]>([]);
  const [readingHistory, setReadingHistory] = useState<{[bookId: string]: number}>({});

  // 검색 및 필터링 상태
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    levels: [],
    languages: [],
    countries: [],
    categories: [],
    sort: 'latest'
  });
  const [showFilters, setShowFilters] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const booksPerPage = 12;

  // Enhanced interaction functions
  const toggleBookmark = useCallback((bookId: string) => {
    setBookmarkedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      // Save to localStorage
      localStorage.setItem('bookmarkedBooks', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  }, []);

  const addToRecentBooks = useCallback((bookId: string) => {
    setRecentBooks(prev => {
      const updated = [bookId, ...prev.filter(id => id !== bookId)].slice(0, 10);
      localStorage.setItem('recentBooks', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateReadingProgress = useCallback((bookId: string, progress: number) => {
    setReadingHistory(prev => {
      const updated = { ...prev, [bookId]: progress };
      localStorage.setItem('readingHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent, bookId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      bookId
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handlePreview = useCallback((book: Ebook) => {
    setPreviewBook(book);
  }, []);

  useEffect(() => {
    loadUserEbooks();
    loadUserPreferences();
  }, [userId]);

  useEffect(() => {
    searchEbooks();
  }, [filters, currentPage]);

  // Load user preferences from localStorage
  const loadUserPreferences = useCallback(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedBooks');
    const savedRecent = localStorage.getItem('recentBooks');
    const savedHistory = localStorage.getItem('readingHistory');

    if (savedBookmarks) {
      setBookmarkedBooks(new Set(JSON.parse(savedBookmarks)));
    }
    if (savedRecent) {
      setRecentBooks(JSON.parse(savedRecent));
    }
    if (savedHistory) {
      setReadingHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 기본 사용자 E-book 로드 (초기 로드용)
  const loadUserEbooks = async () => {
    try {
      setLoading(true);

      // ebooks 테이블과 pdfs 테이블 모두 조회
      const [ebooksResponse, pdfsData] = await Promise.all([
        fetch(`/api/ebooks/user/${userId}`).catch(() => ({ ok: false, json: async () => [] })),
        listUserPdfs().catch(() => ({ pdfs: [], count: 0 }))
      ]);

      let allEbooks: Ebook[] = [];

      // ebooks 테이블 데이터 추가
      if (ebooksResponse.ok) {
        const ebooksData = await ebooksResponse.json();
        allEbooks = [...ebooksData];
      }

      // pdfs 테이블 데이터 추가 (PDF 형식으로 변환)
      const pdfsFormatted: Ebook[] = pdfsData.pdfs.map((pdf: any) => ({
        id: pdf.id,
        title: pdf.file_name || pdf.title || 'Untitled PDF',
        author: pdf.author || 'Unknown',
        description: pdf.description,
        level: pdf.level || 'A1_1',
        pageCount: pdf.page_count,
        isNew: false,
        isHot: false,
        hasAccess: pdf.status === 'ready',
        isPdf: true,
        object_path: pdf.object_path,
        file_name: pdf.file_name
      }));
      allEbooks = [...allEbooks, ...pdfsFormatted];

      setEbooks(allEbooks);
      setTotalBooks(allEbooks.length);
      setTotalPages(Math.ceil(allEbooks.length / booksPerPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터링 함수
  const searchEbooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters.query) params.append('query', filters.query);
      if (filters.levels.length > 0) params.append('level', filters.levels.join(','));
      if (filters.languages.length > 0) params.append('language', filters.languages.join(','));
      if (filters.countries.length > 0) params.append('country', filters.countries.join(','));
      if (filters.categories.length > 0) params.append('category', filters.categories.join(','));
      params.append('sort', filters.sort);
      params.append('page', currentPage.toString());
      params.append('limit', booksPerPage.toString());

      const response = await fetch(`/api/ebooks/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to search ebooks');
      }

      const data = await response.json();
      setEbooks(data.ebooks);
      setTotalBooks(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // 검색 실패 시 기본 사용자 E-book으로 fallback
      if (filters.query === '' && filters.levels.length === 0) {
        loadUserEbooks();
      }
    } finally {
      setLoading(false);
    }
  };

  const openEbook = async (ebook: Ebook) => {
    try {
      // 접근 권한 확인
      if (ebook.hasAccess === false) {
        setError('이 E-book에 접근할 권한이 없습니다.');
        return;
      }

      // PDF 파일인 경우 PdfViewer 사용
      if (ebook.isPdf && ebook.object_path) {
        // PDF의 정답 및 오디오 버튼 데이터 불러오기
        const [answersResult, audioButtonsResult] = await Promise.all([
          ebookService.getAnswers(ebook.id).catch(() => ({ success: true, data: { answers: [] } })),
          ebookService.getAudioButtons(ebook.id).catch(() => ({ success: true, data: { audioButtons: [] } }))
        ]);

        setSelectedPdf({
          path: ebook.object_path,
          id: ebook.id,
          answers: answersResult.data.answers || [],
          audioButtons: audioButtonsResult.data.audioButtons || []
        });
        return;
      }

      // 일반 ebook인 경우 기존 로직 사용
      const response = await fetch(`/api/ebooks/${ebook.id}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('이 E-book에 접근할 권한이 없습니다.');
          return;
        }
        throw new Error('Failed to load ebook content');
      }

      const fullEbook = await response.json();

      // EbookViewer에서 요구하는 형식으로 변환
      const ebookForViewer = {
        id: fullEbook.id,
        title: fullEbook.title,
        author: fullEbook.author,
        pages: fullEbook.pages || []
      };

      setSelectedEbook(ebookForViewer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const closeEbook = () => {
    setSelectedEbook(null);
    setSelectedPdf(null);
  };

  // 필터 핸들러 함수들
  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    setCurrentPage(1);
  };

  const handleLevelChange = (levels: string[]) => {
    setFilters(prev => ({ ...prev, levels }));
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      levels: [],
      languages: [],
      countries: [],
      categories: [],
      sort: 'latest'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLevelColor = (level: string) => {
    const levelColors: Record<string, string> = {
      'A1_1': '#4caf50', 'A1_2': '#4caf50', 'A1_3': '#4caf50',
      'A2_1': '#8bc34a', 'A2_2': '#8bc34a', 'A2_3': '#8bc34a',
      'A3_1': '#cddc39', 'A3_2': '#cddc39', 'A3_3': '#cddc39',
      'B1_1': '#ffeb3b', 'B1_2': '#ffeb3b', 'B1_3': '#ffeb3b',
      'B2_1': '#ffc107', 'B2_2': '#ffc107', 'B2_3': '#ffc107',
      'C1_1': '#ff9800', 'C1_2': '#ff9800', 'C1_3': '#ff9800',
      'C2_1': '#f44336', 'C2_2': '#f44336', 'C2_3': '#f44336'
    };
    return levelColors[level] || '#757575';
  };

  const formatLevel = (level: string) => {
    return level.replace('_', '-');
  };

  // PDF 에러 핸들러 (useCallback으로 메모이제이션)
  const handlePdfError = useCallback((error: Error) => {
    console.error('PDF 로드 에러:', error);
    setError(error.message);
  }, []);

  // PDF 뷰어 표시
  if (selectedPdf) {
    return (
      <Box p={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={closeEbook}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          목록으로 돌아가기
        </Button>
        <PdfViewer
          objectPath={selectedPdf.path}
          userEmail={userId}
          onError={handlePdfError}
          answers={selectedPdf.answers}
          audioButtons={selectedPdf.audioButtons}
        />
      </Box>
    );
  }

  // Ebook 뷰어 표시
  if (selectedEbook) {
    return (
      <EbookViewer
        ebook={selectedEbook}
        userId={userId}
        onClose={closeEbook}
      />
    );
  }

  // 레벨 옵션 정의
  const levelOptions = [
    { value: 'A1_1', label: 'A1-1' },
    { value: 'A1_2', label: 'A1-2' },
    { value: 'A1_3', label: 'A1-3' },
    { value: 'A2_1', label: 'A2-1' },
    { value: 'A2_2', label: 'A2-2' },
    { value: 'A2_3', label: 'A2-3' },
    { value: 'A3_1', label: 'A3-1' },
    { value: 'A3_2', label: 'A3-2' },
    { value: 'A3_3', label: 'A3-3' },
    { value: 'B1_1', label: 'B1-1' },
    { value: 'B1_2', label: 'B1-2' },
    { value: 'B1_3', label: 'B1-3' },
    { value: 'B2_1', label: 'B2-1' },
    { value: 'B2_2', label: 'B2-2' },
    { value: 'C1_1', label: 'C1-1' },
    { value: 'C1_2', label: 'C1-2' },
    { value: 'C2_1', label: 'C2-1' },
    { value: 'C2_2', label: 'C2-2' }
  ];

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'title', label: '제목순' },
    { value: 'level_asc', label: '레벨 낮은순' },
    { value: 'level_desc', label: '레벨 높은순' },
    { value: 'popular', label: '인기순' }
  ];

  return (
    <div className="ebook-library-container">
      <div className="library-header">
        <Typography variant="h4" gutterBottom>
          E-book 라이브러리
        </Typography>

        {/* Enhanced Search Bar */}
        <div className="search-section enhanced-search">
          <div className="search-header">
            <div className="view-toggle">
              <Tooltip title="그리드 보기">
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  size="small"
                >
                  <GridView />
                </IconButton>
              </Tooltip>
              <Tooltip title="리스트 보기">
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  size="small"
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </div>
            <Badge badgeContent={bookmarkedBooks.size} color="primary">
              <Tooltip title="북마크된 책">
                <IconButton size="small">
                  <Bookmark />
                </IconButton>
              </Tooltip>
            </Badge>
          </div>

          <TextField
            fullWidth
            placeholder="E-book 제목, 저자, 태그로 검색..."
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: filters.query && (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleQueryChange('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
            className="enhanced-search-input"
          />

          {/* Recent Books Section */}
          {recentBooks.length > 0 && (
            <div className="recent-books-section">
              <Typography variant="subtitle2" gutterBottom>
                최근 본 책
              </Typography>
              <div className="recent-books-list">
                {recentBooks.slice(0, 5).map(bookId => {
                  const book = ebooks.find(e => e.id === bookId);
                  if (!book) return null;
                  return (
                    <Tooltip key={bookId} title={book.title}>
                      <Chip
                        label={book.title.length > 15 ? `${book.title.slice(0, 15)}...` : book.title}
                        size="small"
                        onClick={() => openEbook(book)}
                        className="recent-book-chip"
                        icon={<AccessTime />}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

          <div className="filter-controls">
            <Button
              startIcon={<FilterList />}
              endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
            >
              필터 {filters.levels.length > 0 && `(${filters.levels.length})`}
            </Button>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>정렬</InputLabel>
              <Select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                label="정렬"
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(filters.levels.length > 0 || filters.query) && (
              <Button
                startIcon={<Clear />}
                onClick={clearAllFilters}
                color="secondary"
              >
                필터 초기화
              </Button>
            )}
          </div>

          {/* 필터 패널 */}
          <Collapse in={showFilters}>
            <div className="filter-panel">
              <div className="filter-group">
                <Typography variant="subtitle2" gutterBottom>
                  레벨 선택
                </Typography>
                <FormGroup row>
                  {levelOptions.map(option => (
                    <FormControlLabel
                      key={option.value}
                      control={
                        <Checkbox
                          checked={filters.levels.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleLevelChange([...filters.levels, option.value]);
                            } else {
                              handleLevelChange(filters.levels.filter(l => l !== option.value));
                            }
                          }}
                        />
                      }
                      label={option.label}
                    />
                  ))}
                </FormGroup>
              </div>
            </div>
          </Collapse>
        </div>

        {/* 검색 결과 정보 */}
        <div className="search-results-info">
          <Typography variant="body2" color="textSecondary">
            총 {totalBooks}권의 E-book {filters.query && `"${filters.query}" 검색 결과`}
          </Typography>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="ebook-grid">
            {ebooks.length === 0 ? (
              <div className="empty-state">
                <p>접근 가능한 E-book이 없습니다. 관리자에게 문의하세요.</p>
              </div>
            ) : (
              ebooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className={`ebook-card ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}
                  onContextMenu={(e) => handleContextMenu(e, ebook.id)}
                >
                  <div className="ebook-card-header">
                    {ebook.isPdf && <span className="badge badge-pdf">📄 PDF</span>}
                    {ebook.isNew && <span className="badge badge-new">NEW</span>}
                    {ebook.isHot && <span className="badge badge-hot">HOT</span>}
                    {!ebook.hasAccess && <span className="badge badge-locked">🔒</span>}

                    {/* Enhanced Action Buttons */}
                    <div className="card-actions">
                      <Tooltip title={bookmarkedBooks.has(ebook.id) ? "북마크 제거" : "북마크 추가"}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(ebook.id);
                          }}
                          className="bookmark-btn"
                        >
                          {bookmarkedBooks.has(ebook.id) ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="미리보기">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(ebook);
                          }}
                          className="preview-btn"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>

                  {ebook.coverImage && (
                    <img
                      className="ebook-cover"
                      src={`/api/ebooks/cover/${ebook.coverImage}`}
                      alt={ebook.title}
                      onClick={() => handlePreview(ebook)}
                    />
                  )}

                  <div className="ebook-info">
                    <div className="info-header">
                      <div className={`level-chip level-${ebook.level.toLowerCase().replace('_', '')}`}>
                        {formatLevel(ebook.level)}
                      </div>
                      {readingHistory[ebook.id] && (
                        <div className="reading-progress">
                          <div className="progress-circle">
                            <div
                              className="progress-fill"
                              style={{
                                transform: `rotate(${(readingHistory[ebook.id] / 100) * 360}deg)`
                              }}
                            />
                            <span>{Math.round(readingHistory[ebook.id])}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <h6 onClick={() => openEbook(ebook)} className="clickable-title">
                      {ebook.title}
                    </h6>

                    <div className="author">
                      저자: {ebook.author}
                    </div>

                    {ebook.description && (
                      <div className="description">
                        {ebook.description}
                      </div>
                    )}

                    {ebook.category && ebook.category.length > 0 && (
                      <div className="categories">
                        {ebook.category.map((cat, index) => (
                          <Chip
                            key={index}
                            label={cat}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: '20px', mr: 0.5, mb: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilters(prev => ({ ...prev, categories: [cat] }));
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="book-meta">
                      {ebook.pageCount && (
                        <div className="page-count">
                          📄 {ebook.pageCount}페이지
                        </div>
                      )}
                      {recentBooks.includes(ebook.id) && (
                        <div className="recent-indicator">
                          <AccessTime fontSize="small" /> 최근 읽음
                        </div>
                      )}
                    </div>

                    <div className="card-bottom">
                      <button
                        onClick={() => {
                          openEbook(ebook);
                          addToRecentBooks(ebook.id);
                        }}
                        disabled={ebook.hasAccess === false}
                        className={`read-button ${ebook.hasAccess === false ? 'disabled' : ''}`}
                      >
                        {ebook.hasAccess === false ? '접근 불가' :
                         readingHistory[ebook.id] ? '계속 읽기' : '읽기 시작'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {ebooks.length > 0 && totalPages > 1 && (
            <div className="pagination-container">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  '& .MuiPagination-ul': {
                    justifyContent: 'center'
                  }
                }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 1 }}>
                {currentPage} / {totalPages} 페이지 (총 {totalBooks}권)
              </Typography>
            </div>
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuList dense>
          <ListItemButton onClick={() => {
            const book = ebooks.find(e => e.id === contextMenu?.bookId);
            if (book) openEbook(book);
            handleCloseContextMenu();
          }}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>읽기</ListItemText>
          </ListItemButton>

          <ListItemButton onClick={() => {
            if (contextMenu?.bookId) toggleBookmark(contextMenu.bookId);
            handleCloseContextMenu();
          }}>
            <ListItemIcon>
              {contextMenu?.bookId && bookmarkedBooks.has(contextMenu.bookId) ?
                <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
            </ListItemIcon>
            <ListItemText>북마크 {contextMenu?.bookId && bookmarkedBooks.has(contextMenu.bookId) ? '제거' : '추가'}</ListItemText>
          </ListItemButton>

          <ListItemButton onClick={() => {
            // Share functionality
            handleCloseContextMenu();
          }}>
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            <ListItemText>공유</ListItemText>
          </ListItemButton>

          <ListItemButton onClick={() => {
            // Download functionality
            handleCloseContextMenu();
          }}>
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>다운로드</ListItemText>
          </ListItemButton>
        </MenuList>
      </Menu>

      {/* Preview Dialog */}
      <Dialog
        open={previewBook !== null}
        onClose={() => setPreviewBook(null)}
        maxWidth="md"
        fullWidth
        className="preview-dialog"
      >
        {previewBook && (
          <>
            <div className="preview-header">
              <div className="preview-info">
                <Typography variant="h5" gutterBottom>
                  {previewBook.title}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  저자: {previewBook.author}
                </Typography>
                <div className="preview-meta">
                  <Chip
                    label={formatLevel(previewBook.level)}
                    size="small"
                    className={`level-chip level-${previewBook.level.toLowerCase().replace('_', '')}`}
                  />
                  {previewBook.pageCount && (
                    <Typography variant="body2" color="textSecondary">
                      총 {previewBook.pageCount}페이지
                    </Typography>
                  )}
                </div>
              </div>
              {previewBook.coverImage && (
                <img
                  src={`/api/ebooks/cover/${previewBook.coverImage}`}
                  alt={previewBook.title}
                  className="preview-cover"
                />
              )}
            </div>

            <div className="preview-content">
              {previewBook.description && (
                <Typography variant="body1" paragraph>
                  {previewBook.description}
                </Typography>
              )}

              {previewBook.category && previewBook.category.length > 0 && (
                <div className="preview-categories">
                  <Typography variant="subtitle2" gutterBottom>
                    카테고리:
                  </Typography>
                  <div>
                    {previewBook.category.map((cat, index) => (
                      <Chip
                        key={index}
                        label={cat}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="preview-actions">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    openEbook(previewBook);
                    addToRecentBooks(previewBook.id);
                    setPreviewBook(null);
                  }}
                  disabled={previewBook.hasAccess === false}
                  startIcon={<Visibility />}
                >
                  {previewBook.hasAccess === false ? '접근 불가' :
                   readingHistory[previewBook.id] ? '계속 읽기' : '읽기 시작'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => {
                    toggleBookmark(previewBook.id);
                  }}
                  startIcon={bookmarkedBooks.has(previewBook.id) ? <Bookmark /> : <BookmarkBorder />}
                >
                  {bookmarkedBooks.has(previewBook.id) ? '북마크 제거' : '북마크 추가'}
                </Button>
              </div>
            </div>
          </>
        )}
      </Dialog>

      {/* EbookViewer Dialog */}
      {selectedEbook && (
        <Dialog
          open={!!selectedEbook}
          onClose={closeEbook}
          maxWidth={false}
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              width: '95vw',
              height: '95vh',
              maxWidth: 'none',
              maxHeight: 'none'
            }
          }}
        >
          <EbookViewer
            ebook={selectedEbook}
            userId={userId}
            onClose={closeEbook}
          />
        </Dialog>
      )}
    </div>
  );
};