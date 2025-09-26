import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat
} from '@mui/icons-material';

export interface KPICardProps {
  title: string;
  value: number | string;
  label?: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  loading?: boolean;
  progress?: number; // 0-100 for progress bar
  target?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  label = '',
  change,
  changeType = 'neutral',
  icon,
  description,
  loading = false,
  progress,
  target,
  color = 'primary',
  size = 'medium'
}) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
      case 'decrease':
        return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
      default:
        return <TrendingFlat sx={{ fontSize: 16, color: 'text.secondary' }} />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'success.main';
      case 'decrease':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          minHeight: 120,
          padding: 2
        };
      case 'large':
        return {
          minHeight: 200,
          padding: 3
        };
      default:
        return {
          minHeight: 160,
          padding: 2.5
        };
    }
  };

  if (loading) {
    return (
      <Card sx={{ ...getSizeStyles() }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CircularProgress size={40} color={color} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        ...getSizeStyles(),
        cursor: 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              fontSize: size === 'small' ? '0.75rem' : '0.875rem'
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box sx={{
              color: `${color}.main`,
              opacity: 0.8,
              fontSize: size === 'small' ? 20 : 24
            }}>
              {icon}
            </Box>
          )}
        </Box>

        {/* Main Value */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            variant={size === 'small' ? 'h5' : size === 'large' ? 'h3' : 'h4'}
            color={`${color}.main`}
            sx={{
              fontWeight: 'bold',
              mb: 0.5,
              display: 'flex',
              alignItems: 'baseline',
              gap: 1
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
            {label && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: size === 'small' ? '0.7rem' : '0.875rem' }}
              >
                {label}
              </Typography>
            )}
          </Typography>

          {/* Change Indicator */}
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              {getTrendIcon()}
              <Typography
                variant="body2"
                sx={{
                  color: getChangeColor(),
                  fontWeight: 500,
                  fontSize: size === 'small' ? '0.7rem' : '0.75rem'
                }}
              >
                {change}
              </Typography>
            </Box>
          )}

          {/* Progress Bar */}
          {progress !== undefined && (
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  진행률
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={color}
                sx={{ borderRadius: 1 }}
              />
              {target && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  목표: {target.toLocaleString()}{label}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Description */}
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 'auto',
              fontSize: size === 'small' ? '0.65rem' : '0.75rem',
              lineHeight: 1.2
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};