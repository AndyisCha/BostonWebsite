import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  TextField,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  InputAdornment,
  Skeleton,
  Card,
  CardContent
} from '@mui/material';
import {
  Search,
  Refresh,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  GetApp
} from '@mui/icons-material';

export interface Column<T = any> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
}

export interface ActionButton<T = any> {
  icon: React.ReactNode;
  label: string;
  onClick: (row: T) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  pageable?: boolean;
  pageSize?: number;
  searchPlaceholder?: string;
  emptyMessage?: string;
  actions?: ActionButton<T>[];
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
  dense?: boolean;
  stickyHeader?: boolean;
  rowsPerPageOptions?: number[];
}

type Order = 'asc' | 'desc';

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchable = true,
  sortable = true,
  pageable = true,
  pageSize = 10,
  searchPlaceholder = '검색...',
  emptyMessage = '데이터가 없습니다',
  actions = [],
  onRefresh,
  title,
  subtitle,
  dense = false,
  stickyHeader = true,
  rowsPerPageOptions = [5, 10, 25, 50]
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0]?.id);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!search) return data;

    return data.filter(row => {
      return columns.some(column => {
        if (column.searchable === false) return false;
        const value = row[column.id];
        if (value == null) return false;
        return String(value).toLowerCase().includes(search.toLowerCase());
      });
    });
  }, [data, search, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === 'asc' ? -1 : 1;
      if (bValue == null) return order === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return order === 'asc' ? -1 : 1;
      if (aString > bString) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, order, orderBy, sortable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pageable) return sortedData;
    const start = page * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage, pageable]);

  const handleSort = (columnId: keyof T) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleActions = useMemo(() => {
    return actions.filter(action => !action.hidden || data.every(row => !action.hidden?.(row)));
  }, [actions, data]);

  const renderSkeleton = () => (
    <Card>
      <CardContent>
        {Array.from({ length: rowsPerPage }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
            {columns.map((column) => (
              <Skeleton key={String(column.id)} height={40} sx={{ flex: 1 }} />
            ))}
            {visibleActions.length > 0 && <Skeleton height={40} width={100} />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  if (loading) {
    return renderSkeleton();
  }

  return (
    <Card>
      {/* Header */}
      {(title || subtitle || searchable || onRefresh) && (
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              {title && (
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {searchable && (
                <TextField
                  size="small"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              {onRefresh && (
                <Tooltip title="새로고침">
                  <IconButton onClick={onRefresh} size="small">
                    <Refresh />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Results Summary */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              총 {sortedData.length}개 항목
            </Typography>
            {search && (
              <Chip
                label={`"${search}" 검색 결과`}
                size="small"
                onDelete={() => setSearch('')}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {visibleActions.length > 0 && (
                <TableCell align="right" style={{ minWidth: 100 }}>
                  작업
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (visibleActions.length > 0 ? 1 : 0)} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow hover key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.id)} align={column.align}>
                      {column.format ? column.format(row[column.id]) : row[column.id]}
                    </TableCell>
                  ))}
                  {visibleActions.length > 0 && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        {visibleActions.map((action, actionIndex) => {
                          if (action.hidden?.(row)) return null;

                          return (
                            <Tooltip key={actionIndex} title={action.label}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => action.onClick(row)}
                                  disabled={action.disabled?.(row)}
                                  color={action.color}
                                >
                                  {action.icon}
                                </IconButton>
                              </span>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pageable && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}개`}
        />
      )}
    </Card>
  );
}