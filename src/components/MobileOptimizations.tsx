import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import {
  Box, Fab, Zoom, SpeedDial, SpeedDialAction, SpeedDialIcon,
  Drawer, SwipeableDrawer, useTheme, IconButton, Typography,
  Collapse, Alert
} from '@mui/material';
import {
  KeyboardArrowUp, Menu, Close, Home, Search, Settings,
  Bookmark, Share, Download, Brightness4, Brightness7,
  VolumeUp, VolumeOff, Fullscreen, FullscreenExit,
  TouchApp, PanTool
} from '@mui/icons-material';
import { useResponsive } from '../hooks/useResponsive';

// Scroll to top button for mobile
interface ScrollToTopProps {
  threshold?: number;
  smooth?: boolean;
}

export const MobileScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 300,
  smooth = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  if (!isMobile) return null;

  return (
    <Zoom in={isVisible}>
      <Fab
        color="primary"
        size="small"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: 'rgba(25, 118, 210, 0.9)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            background: 'rgba(25, 118, 210, 1)',
          }
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
};

// Mobile-optimized SpeedDial
interface MobileSpeedDialProps {
  actions: Array<{
    icon: ReactNode;
    name: string;
    onClick: () => void;
  }>;
  fabIcon?: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const MobileSpeedDial: React.FC<MobileSpeedDialProps> = ({
  actions,
  fabIcon = <SpeedDialIcon />,
  direction = 'up'
}) => {
  const [open, setOpen] = useState(false);
  const { isMobile } = useResponsive();
  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!isMobile) return null;

  return (
    <SpeedDial
      ariaLabel="Mobile Quick Actions"
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        '& .MuiSpeedDial-fab': {
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }
      }}
      icon={fabIcon}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction={direction}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => {
            action.onClick();
            handleClose();
          }}
          sx={{
            '& .MuiSpeedDialAction-fab': {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }
          }}
        />
      ))}
    </SpeedDial>
  );
};

// Swipeable mobile drawer
interface MobileDrawerProps {
  children: ReactNode;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  title?: string;
  disableSwipeToOpen?: boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  children,
  open,
  onOpen,
  onClose,
  anchor = 'left',
  title,
  disableSwipeToOpen = false
}) => {
  const { isMobile } = useResponsive();
  const theme = useTheme();

  if (!isMobile) {
    return (
      <Drawer
        anchor={anchor}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: anchor === 'left' || anchor === 'right' ? 280 : 'auto',
            height: anchor === 'top' || anchor === 'bottom' ? 'auto' : '100%',
          }
        }}
      >
        {title && (
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">{title}</Typography>
          </Box>
        )}
        {children}
      </Drawer>
    );
  }

  return (
    <SwipeableDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={disableSwipeToOpen}
      PaperProps={{
        sx: {
          width: anchor === 'left' || anchor === 'right' ? '85vw' : '100vw',
          maxWidth: anchor === 'left' || anchor === 'right' ? 320 : 'none',
          height: anchor === 'top' || anchor === 'bottom' ? 'auto' : '100%',
          borderRadius: anchor === 'left' ? '0 20px 20px 0' :
                       anchor === 'right' ? '20px 0 0 20px' :
                       anchor === 'top' ? '0 0 20px 20px' : '20px 20px 0 0',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
    >
      {title && (
        <Box sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      )}
      <Box sx={{
        p: 2,
        // Add safe area padding
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
      }}>
        {children}
      </Box>
    </SwipeableDrawer>
  );
};

// Touch-friendly button with haptic feedback
interface TouchButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  hapticFeedback?: boolean;
  className?: string;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  hapticFeedback = true,
  className
}) => {
  const { isTouchDevice } = useResponsive();
  const theme = useTheme();

  const handleClick = useCallback(() => {
    // Haptic feedback for touch devices
    if (hapticFeedback && isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }

    onClick();
  }, [onClick, hapticFeedback, isTouchDevice]);

  const sizeStyles = {
    small: { minHeight: 44, padding: '8px 12px', fontSize: '0.875rem' },
    medium: { minHeight: 48, padding: '12px 16px', fontSize: '1rem' },
    large: { minHeight: 56, padding: '16px 24px', fontSize: '1.125rem' }
  };

  return (
    <Box
      component="button"
      onClick={handleClick}
      disabled={disabled}
      className={`touch-button ${className || ''}`}
      sx={{
        ...sizeStyles[size],
        width: fullWidth ? '100%' : 'auto',
        border: variant === 'contained' ? 'none' : `2px solid ${theme.palette.primary.main}`,
        borderRadius: '12px',
        background: variant === 'contained'
          ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
          : variant === 'outlined' ? 'transparent' : 'none',
        color: variant === 'contained' ? 'white' : theme.palette.primary.main,
        fontWeight: 600,
        fontFamily: theme.typography.fontFamily,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        // Touch-specific styles
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        // Ensure minimum touch target size
        '&:active': {
          transform: disabled ? 'none' : 'scale(0.98)',
          filter: disabled ? 'none' : 'brightness(0.9)',
        },
        '&:hover': {
          transform: disabled ? 'none' : 'translateY(-2px)',
          boxShadow: disabled ? 'none' : '0 6px 20px rgba(0, 0, 0, 0.15)',
        },
        // Focus styles for accessibility
        '&:focus': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        }
      }}
    >
      {children}
    </Box>
  );
};

// Mobile notification banner
interface MobileNotificationProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

export const MobileNotification: React.FC<MobileNotificationProps> = ({
  message,
  type = 'info',
  action,
  dismissible = true,
  onDismiss,
  autoHideDuration = 5000
}) => {
  const [visible, setVisible] = useState(true);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible || !isMobile) return null;

  return (
    <Collapse in={visible}>
      <Alert
        severity={type}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {action && (
              <TouchButton
                onClick={action.onClick}
                variant="text"
                size="small"
              >
                {action.label}
              </TouchButton>
            )}
            {dismissible && (
              <IconButton
                size="small"
                onClick={handleDismiss}
                sx={{ color: 'inherit' }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          borderRadius: 0,
          backdropFilter: 'blur(10px)',
          // Safe area padding for notched devices
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {message}
      </Alert>
    </Collapse>
  );
};

// Gesture hint component
interface GestureHintProps {
  gesture: 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'tap' | 'long-press';
  message: string;
  show: boolean;
  onDismiss: () => void;
}

export const GestureHint: React.FC<GestureHintProps> = ({
  gesture,
  message,
  show,
  onDismiss
}) => {
  const { isTouchDevice } = useResponsive();

  const getGestureIcon = () => {
    switch (gesture) {
      case 'tap':
        return <TouchApp />;
      case 'long-press':
        return <PanTool />;
      default:
        return <TouchApp />;
    }
  };

  if (!isTouchDevice) return null;

  return (
    <Collapse in={show}>
      <Alert
        icon={getGestureIcon()}
        severity="info"
        onClose={onDismiss}
        sx={{
          position: 'fixed',
          bottom: 100,
          left: 16,
          right: 16,
          zIndex: 1200,
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.95)',
          '& .MuiAlert-message': {
            fontSize: '0.875rem',
          }
        }}
      >
        {message}
      </Alert>
    </Collapse>
  );
};

export default {
  MobileScrollToTop,
  MobileSpeedDial,
  MobileDrawer,
  TouchButton,
  MobileNotification,
  GestureHint
};