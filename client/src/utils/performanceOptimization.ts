// performanceOptimization.ts - 성능 최적화 유틸리티

import { debounce, throttle } from 'lodash';
import { lazy } from 'react';

// 1. 컴포넌트 지연 로딩
export const lazyLoadComponent = (importFunc: () => Promise<any>) => {
  return lazy(importFunc);
};

// 예시: 지연 로딩될 컴포넌트들
export const LazyUserProfile = lazyLoadComponent(() => import('../components/UserProfile'));
export const LazyAdvancedSettings = lazyLoadComponent(() => import('../components/AdvancedSettings'));
export const LazyEbookLibrary = lazyLoadComponent(() => import('../components/EbookLibrary'));
export const LazyEbookManagement = lazyLoadComponent(() => import('../components/EbookManagement'));
export const LazyLevelTest = lazyLoadComponent(() => import('../components/EnhancedLevelTestComponent'));

// 2. 메모이제이션 헬퍼
export const createMemoizedSelector = <T, R>(
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
) => {
  let lastResult: R;
  let lastArgs: T;

  return (state: T): R => {
    if (lastArgs === undefined || !Object.is(lastArgs, state)) {
      lastResult = selector(state);
      lastArgs = state;
    }

    if (equalityFn && lastResult !== undefined) {
      const newResult = selector(state);
      if (!equalityFn(lastResult, newResult)) {
        lastResult = newResult;
      }
    }

    return lastResult;
  };
};

// 3. 디바운스 및 스로틀 헬퍼
export const createDebouncedFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): T => {
  return debounce(func, delay) as T;
};

export const createThrottledFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 100
): T => {
  return throttle(func, delay) as T;
};

// 4. 이미지 최적화
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  async loadImage(src: string): Promise<HTMLImageElement> {
    // 캐시에서 확인
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    // 이미 로딩 중인지 확인
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // 새로운 이미지 로딩
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      img.onerror = (error) => {
        this.loadingPromises.delete(src);
        reject(error);
      };
      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.loadImage(url)));
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

// 5. API 응답 캐싱
export class APICache {
  private static instance: APICache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache();
    }
    return APICache.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 패턴 기반 무효화
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// 6. 메모리 사용량 모니터링
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private observers: ((info: any) => void)[] = [];

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  startMonitoring(interval: number = 10000): void {
    setInterval(() => {
      const memInfo = this.getMemoryInfo();
      if (memInfo) {
        this.observers.forEach(observer => observer(memInfo));
      }
    }, interval);
  }

  addObserver(observer: (info: any) => void): void {
    this.observers.push(observer);
  }

  removeObserver(observer: (info: any) => void): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
}

// 7. 번들 크기 분석
export const bundleAnalyzer = {
  logComponentSize: (componentName: string, component: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component ${componentName} loaded:`, {
        timestamp: new Date().toISOString(),
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 'N/A'
      });
    }
  },

  measureRenderTime: (componentName: string, renderFn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      renderFn();
      const end = performance.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    } else {
      renderFn();
    }
  }
};

// 8. 가상 스크롤링 헬퍼
export class VirtualScrollHelper {
  private containerHeight: number;
  private itemHeight: number;
  private totalItems: number;
  private overscan: number;

  constructor(
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 5
  ) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.overscan = overscan;
  }

  calculateVisibleRange(scrollTop: number): { start: number; end: number } {
    const visibleStart = Math.floor(scrollTop / this.itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(this.containerHeight / this.itemHeight),
      this.totalItems
    );

    return {
      start: Math.max(0, visibleStart - this.overscan),
      end: Math.min(this.totalItems, visibleEnd + this.overscan)
    };
  }

  getTotalHeight(): number {
    return this.totalItems * this.itemHeight;
  }

  getOffsetY(startIndex: number): number {
    return startIndex * this.itemHeight;
  }
}

// 9. 상태 업데이트 최적화
export const batchStateUpdates = (updates: (() => void)[]): void => {
  // React 18의 automatic batching 활용
  updates.forEach(update => update());
};

// 10. 이벤트 리스너 최적화
export class EventListenerManager {
  private listeners = new Map<string, { element: Element; handler: EventListener; options?: any }>();

  add(key: string, element: Element, event: string, handler: EventListener, options?: any): void {
    // 기존 리스너 제거
    this.remove(key);

    const optimizedHandler = this.optimizeHandler(handler);
    element.addEventListener(event, optimizedHandler, options);

    this.listeners.set(key, { element, handler: optimizedHandler, options });
  }

  remove(key: string): void {
    const listener = this.listeners.get(key);
    if (listener) {
      listener.element.removeEventListener(key.split('-')[1], listener.handler, listener.options);
      this.listeners.delete(key);
    }
  }

  removeAll(): void {
    this.listeners.forEach((listener, key) => {
      this.remove(key);
    });
  }

  private optimizeHandler(handler: EventListener): EventListener {
    return createThrottledFunction(handler, 16); // 60fps에 맞춤
  }
}

// 11. CSS 애니메이션 최적화
export const optimizeAnimations = {
  // will-change 속성 관리
  enableWillChange: (element: HTMLElement, properties: string[]): void => {
    element.style.willChange = properties.join(', ');
  },

  disableWillChange: (element: HTMLElement): void => {
    element.style.willChange = 'auto';
  },

  // 애니메이션 성능 체크
  checkAnimationPerformance: (): boolean => {
    return 'requestAnimationFrame' in window && 'transform' in document.documentElement.style;
  },

  // 리덕션 모션 체크
  respectsReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// 12. 웹워커 활용
export class WorkerManager {
  private workers = new Map<string, Worker>();

  createWorker(name: string, script: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!;
    }

    const blob = new Blob([script], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    this.workers.set(name, worker);

    return worker;
  }

  terminateWorker(name: string): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }
  }

  terminateAll(): void {
    this.workers.forEach((worker, name) => {
      this.terminateWorker(name);
    });
  }
}

// 13. 전역 성능 설정
export const performanceConfig = {
  // 개발 환경에서만 성능 로깅
  enableLogging: process.env.NODE_ENV === 'development',

  // 이미지 최적화 설정
  imageOptimization: {
    quality: 85,
    format: 'webp',
    fallback: 'jpg'
  },

  // 캐싱 설정
  caching: {
    apiTTL: 5 * 60 * 1000, // 5분
    imageTTL: 30 * 60 * 1000, // 30분
    maxCacheSize: 50 * 1024 * 1024 // 50MB
  },

  // 가상 스크롤링 설정
  virtualScrolling: {
    itemHeight: 60,
    overscan: 5,
    threshold: 100 // 100개 이상의 아이템부터 가상 스크롤링 적용
  }
};

// 14. 성능 메트릭 수집
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics = new Map<string, number[]>();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetrics(name: string): { avg: number; min: number; max: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    this.metrics.forEach((values, name) => {
      result[name] = this.getMetrics(name);
    });
    return result;
  }
}

export default {
  lazyLoadComponent,
  createMemoizedSelector,
  createDebouncedFunction,
  createThrottledFunction,
  ImageOptimizer,
  APICache,
  MemoryMonitor,
  bundleAnalyzer,
  VirtualScrollHelper,
  EventListenerManager,
  optimizeAnimations,
  WorkerManager,
  performanceConfig,
  PerformanceMetrics
};