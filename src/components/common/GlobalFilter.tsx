import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Typography,
  Autocomplete,
  Button,
  Collapse,
  IconButton
} from '@mui/material';
import {
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';

export interface FilterOption {
  value: string;
  label: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface GlobalFilterProps {
  countries?: FilterOption[];
  branches?: FilterOption[];
  selectedCountries?: string[];
  selectedBranches?: string[];
  dateRange?: DateRange;
  onCountriesChange?: (countries: string[]) => void;
  onBranchesChange?: (branches: string[]) => void;
  onDateRangeChange?: (dateRange: DateRange) => void;
  onReset?: () => void;
  showCountryFilter?: boolean;
  showBranchFilter?: boolean;
  showDateFilter?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  customFilters?: React.ReactNode;
}

export const GlobalFilter: React.FC<GlobalFilterProps> = ({
  countries = [],
  branches = [],
  selectedCountries = [],
  selectedBranches = [],
  dateRange = { start: null, end: null },
  onCountriesChange,
  onBranchesChange,
  onDateRangeChange,
  onReset,
  showCountryFilter = true,
  showBranchFilter = true,
  showDateFilter = true,
  expanded = false,
  onExpandedChange,
  customFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleExpandToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
  };

  const handleReset = () => {
    onCountriesChange?.([]);
    onBranchesChange?.([]);
    onDateRangeChange?.({ start: null, end: null });
    onReset?.();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCountries.length > 0) count++;
    if (selectedBranches.length > 0) count++;
    if (dateRange.start || dateRange.end) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ pb: isExpanded ? 2 : '16px !important' }}>
        {/* Filter Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              필터
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount}개 적용`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeFiltersCount > 0 && (
              <Button
                startIcon={<Clear />}
                onClick={handleReset}
                size="small"
                variant="outlined"
                color="secondary"
              >
                초기화
              </Button>
            )}
            <IconButton onClick={handleExpandToggle} size="small">
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Active Filters Summary */}
        {!isExpanded && activeFiltersCount > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedCountries.map(country => {
              const countryLabel = countries.find(c => c.value === country)?.label || country;
              return (
                <Chip
                  key={country}
                  label={`국가: ${countryLabel}`}
                  size="small"
                  variant="filled"
                  color="primary"
                  onDelete={() => onCountriesChange?.(selectedCountries.filter(c => c !== country))}
                />
              );
            })}
            {selectedBranches.map(branch => {
              const branchLabel = branches.find(b => b.value === branch)?.label || branch;
              return (
                <Chip
                  key={branch}
                  label={`지점: ${branchLabel}`}
                  size="small"
                  variant="filled"
                  color="secondary"
                  onDelete={() => onBranchesChange?.(selectedBranches.filter(b => b !== branch))}
                />
              );
            })}
            {(dateRange.start || dateRange.end) && (
              <Chip
                label={`기간: ${dateRange.start?.toLocaleDateString() || '시작'} - ${dateRange.end?.toLocaleDateString() || '종료'}`}
                size="small"
                variant="filled"
                color="info"
                onDelete={() => onDateRangeChange?.({ start: null, end: null })}
              />
            )}
          </Box>
        )}

        {/* Expanded Filter Controls */}
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              {/* Country Filter */}
              {showCountryFilter && (
                <FormControl fullWidth size="small">
                  <Autocomplete
                    multiple
                    options={countries}
                    value={countries.filter(country => selectedCountries.includes(country.value))}
                    onChange={(_, newValue) => onCountriesChange?.(newValue.map(v => v.value))}
                    getOptionLabel={(option) => option.label}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.label}
                          size="small"
                          {...getTagProps({ index })}
                          key={option.value}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="국가"
                        placeholder="국가를 선택하세요"
                      />
                    )}
                  />
                </FormControl>
              )}

              {/* Branch Filter */}
              {showBranchFilter && (
                <FormControl fullWidth size="small">
                  <Autocomplete
                    multiple
                    options={branches}
                    value={branches.filter(branch => selectedBranches.includes(branch.value))}
                    onChange={(_, newValue) => onBranchesChange?.(newValue.map(v => v.value))}
                    getOptionLabel={(option) => option.label}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.label}
                          size="small"
                          {...getTagProps({ index })}
                          key={option.value}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="지점"
                        placeholder="지점을 선택하세요"
                      />
                    )}
                  />
                </FormControl>
              )}

              {/* Date Range Filter */}
              {showDateFilter && (
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <DatePicker
                      label="시작일"
                      value={dateRange.start}
                      onChange={(date) => onDateRangeChange?.({ ...dateRange, start: date })}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <DatePicker
                      label="종료일"
                      value={dateRange.end}
                      onChange={(date) => onDateRangeChange?.({ ...dateRange, end: date })}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Box>
                </LocalizationProvider>
              )}

              {/* Custom Filters */}
              {customFilters}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};