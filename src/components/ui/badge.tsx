import * as React from 'react';
import { Chip } from '@mui/material';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const getVariantProps = () => {
      switch (variant) {
        case 'secondary':
          return { color: 'secondary' as const };
        case 'destructive':
          return { color: 'error' as const };
        case 'outline':
          return { variant: 'outlined' as const };
        default:
          return { color: 'primary' as const };
      }
    };

    return (
      <Chip
        ref={ref}
        label={children}
        size="small"
        className={className}
        {...getVariantProps()}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';