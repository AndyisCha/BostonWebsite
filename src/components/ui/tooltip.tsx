import * as React from 'react';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';

export interface TooltipProps extends MuiTooltipProps {}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (props, ref) => {
    return <MuiTooltip {...props} ref={ref} />;
  }
);

Tooltip.displayName = 'Tooltip';

export interface TooltipTriggerProps {
  children: React.ReactNode;
}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

TooltipTrigger.displayName = 'TooltipTrigger';

export interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

TooltipContent.displayName = 'TooltipContent';

export interface TooltipProviderProps {
  children: React.ReactNode;
}

export const TooltipProvider = React.forwardRef<HTMLDivElement, TooltipProviderProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

TooltipProvider.displayName = 'TooltipProvider';

// Re-export for compatibility
export { TooltipTrigger as Trigger, TooltipContent as Content };