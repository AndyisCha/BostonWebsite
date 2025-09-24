// Mobile Performance Components and Hooks
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsed: 0,
    renderTime: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (currentTime - lastTime)),
          memoryUsed: (performance as any).memory?.usedJSHeapSize || 0,
          renderTime: currentTime - lastTime
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measurePerformance);
    };

    measurePerformance();
  }, []);

  return metrics;
};

export default { usePerformanceMonitor };