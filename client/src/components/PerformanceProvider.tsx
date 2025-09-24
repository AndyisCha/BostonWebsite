// PerformanceProvider.tsx - 성능 최적화 컨텍스트 제공자

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  PerformanceMetrics,
  APICache,
  ImageOptimizer,
  MemoryMonitor,
  performanceConfig
} from '../utils/performanceOptimization';

interface PerformanceContextType {
  // 성능 메트릭
  metrics: PerformanceMetrics;

  // 캐시 관리
  apiCache: APICache;
  imageOptimizer: ImageOptimizer;

  // 메모리 모니터링
  memoryMonitor: MemoryMonitor;
  memoryInfo: any;

  // 성능 설정
  config: typeof performanceConfig;

  // 성능 상태
  performanceScore: number;
  isLowPerformanceDevice: boolean;

  // 액션
  clearAllCaches: () => void;
  enablePerformanceMode: (mode: 'high' | 'balanced' | 'battery') => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [performanceScore, setPerformanceScore] = useState<number>(100);
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState<boolean>(false);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'balanced' | 'battery'>('balanced');

  // 싱글톤 인스턴스들
  const metrics = PerformanceMetrics.getInstance();
  const apiCache = APICache.getInstance();
  const imageOptimizer = ImageOptimizer.getInstance();
  const memoryMonitor = MemoryMonitor.getInstance();

  useEffect(() => {
    // 초기 성능 측정
    measureInitialPerformance();

    // 메모리 모니터링 시작
    memoryMonitor.addObserver(handleMemoryUpdate);
    memoryMonitor.startMonitoring(5000);

    // 성능 관련 이벤트 리스너
    window.addEventListener('load', handlePageLoad);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('load', handlePageLoad);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const measureInitialPerformance = () => {
    // 디바이스 성능 점수 계산
    let score = 100;

    // CPU 코어 수
    const cores = navigator.hardwareConcurrency || 1;
    if (cores < 4) score -= 20;

    // 메모리 정보
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) score -= 30;

    // 연결 타입
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        score -= 40;
      } else if (connection.effectiveType === '3g') {
        score -= 20;
      }
    }

    setPerformanceScore(score);
    setIsLowPerformanceDevice(score < 60);

    // 저성능 디바이스인 경우 배터리 모드로 자동 전환
    if (score < 60) {
      setPerformanceMode('battery');
      applyPerformanceMode('battery');
    }
  };

  const handleMemoryUpdate = (info: any) => {
    setMemoryInfo(info);
    metrics.recordMetric('memoryUsage', info.usedJSHeapSize);

    // 메모리 사용량이 높으면 캐시 정리
    const memoryUsageRatio = info.usedJSHeapSize / info.totalJSHeapSize;
    if (memoryUsageRatio > 0.8) {
      console.warn('High memory usage detected, clearing caches...');
      apiCache.clear();
      imageOptimizer.clearCache();
    }
  };

  const handlePageLoad = () => {
    const loadTime = performance.now();
    metrics.recordMetric('pageLoadTime', loadTime);

    // Core Web Vitals 측정
    measureCoreWebVitals();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 탭이 비활성화될 때 불필요한 작업 중단
      pauseNonEssentialOperations();
    } else {
      // 탭이 활성화될 때 작업 재개
      resumeOperations();
    }
  };

  const measureCoreWebVitals = () => {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        metrics.recordMetric('LCP', entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        metrics.recordMetric('FID', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      metrics.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  };

  const pauseNonEssentialOperations = () => {
    // 애니메이션 중지
    document.body.style.animationPlayState = 'paused';

    // 타이머 정리 (실제로는 더 정교한 관리 필요)
    if (performanceMode === 'battery') {
      // 배터리 모드에서는 더 적극적으로 최적화
    }
  };

  const resumeOperations = () => {
    // 애니메이션 재개
    document.body.style.animationPlayState = 'running';
  };

  const applyPerformanceMode = (mode: 'high' | 'balanced' | 'battery') => {
    const root = document.documentElement;

    switch (mode) {
      case 'high':
        root.style.setProperty('--animation-duration', '0.3s');
        root.style.setProperty('--transition-duration', '0.2s');
        performanceConfig.imageOptimization.quality = 95;
        break;

      case 'balanced':
        root.style.setProperty('--animation-duration', '0.2s');
        root.style.setProperty('--transition-duration', '0.15s');
        performanceConfig.imageOptimization.quality = 85;
        break;

      case 'battery':
        root.style.setProperty('--animation-duration', '0.1s');
        root.style.setProperty('--transition-duration', '0.05s');
        performanceConfig.imageOptimization.quality = 70;

        // 애니메이션 비활성화
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          root.style.setProperty('--animation-duration', '0s');
          root.style.setProperty('--transition-duration', '0s');
        }
        break;
    }
  };

  const clearAllCaches = () => {
    apiCache.clear();
    imageOptimizer.clearCache();

    // 브라우저 캐시도 정리 (가능한 경우)
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  };

  const enablePerformanceMode = (mode: 'high' | 'balanced' | 'battery') => {
    setPerformanceMode(mode);
    applyPerformanceMode(mode);

    // 로컬 스토리지에 설정 저장
    localStorage.setItem('performanceMode', mode);
  };

  const value: PerformanceContextType = {
    metrics,
    apiCache,
    imageOptimizer,
    memoryMonitor,
    memoryInfo,
    config: performanceConfig,
    performanceScore,
    isLowPerformanceDevice,
    clearAllCaches,
    enablePerformanceMode
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

// 성능 컨텍스트를 사용하는 훅
export const usePerformance = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// 성능 메트릭을 측정하는 훅
export const usePerformanceMetrics = (componentName: string) => {
  const { metrics } = usePerformance();

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      metrics.recordMetric(`${componentName}_renderTime`, renderTime);
    };
  }, [componentName, metrics]);

  const recordMetric = (metricName: string, value: number) => {
    metrics.recordMetric(`${componentName}_${metricName}`, value);
  };

  return { recordMetric };
};

// 메모리 사용량 모니터링 훅
export const useMemoryMonitor = () => {
  const { memoryInfo } = usePerformance();

  return {
    memoryInfo,
    memoryUsageRatio: memoryInfo
      ? memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize
      : 0,
    isHighMemoryUsage: memoryInfo
      ? (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) > 0.8
      : false
  };
};

// 성능 적응형 컴포넌트 렌더링 훅
export const useAdaptiveRendering = (highQualityComponent: ReactNode, lowQualityComponent: ReactNode) => {
  const { isLowPerformanceDevice, performanceScore } = usePerformance();

  if (isLowPerformanceDevice || performanceScore < 70) {
    return lowQualityComponent;
  }

  return highQualityComponent;
};

export default PerformanceProvider;