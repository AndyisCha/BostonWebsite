// useOptimizedState.ts - 최적화된 상태 관리 훅

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createDebouncedFunction, createThrottledFunction } from '../utils/performanceOptimization';

// 1. 디바운스된 상태 업데이트 훅
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] => {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  const debouncedSetValue = useMemo(
    () => createDebouncedFunction(setDebouncedValue, delay),
    [delay]
  );

  const setValue = useCallback((value: T) => {
    setImmediateValue(value);
    debouncedSetValue(value);
  }, [debouncedSetValue]);

  return [immediateValue, debouncedValue, setValue];
};

// 2. 스로틀된 상태 업데이트 훅
export const useThrottledState = <T>(
  initialValue: T,
  delay: number = 100
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(initialValue);

  const throttledSetValue = useMemo(
    () => createThrottledFunction(setValue, delay),
    [delay]
  );

  return [value, throttledSetValue];
};

// 3. 배치 상태 업데이트 훅
export const useBatchedState = <T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void, () => void] => {
  const [state, setState] = useState<T>(initialState);
  const pendingUpdates = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    Object.assign(pendingUpdates.current, updates);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => ({ ...prevState, ...pendingUpdates.current }));
      pendingUpdates.current = {};
      timeoutRef.current = null;
    }, 0);
  }, []);

  const flushUpdates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setState(prevState => ({ ...prevState, ...pendingUpdates.current }));
      pendingUpdates.current = {};
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate, flushUpdates];
};

// 4. 메모이제이션된 계산 값 훅
export const useMemoizedComputation = <T, D extends readonly unknown[]>(
  computeFn: () => T,
  deps: D,
  equalityFn?: (a: T, b: T) => boolean
): T => {
  const lastDeps = useRef<D>();
  const lastResult = useRef<T>();

  return useMemo(() => {
    if (
      lastDeps.current === undefined ||
      !deps.every((dep, index) => Object.is(dep, lastDeps.current![index]))
    ) {
      const newResult = computeFn();

      if (equalityFn && lastResult.current !== undefined) {
        if (equalityFn(lastResult.current, newResult)) {
          return lastResult.current;
        }
      }

      lastResult.current = newResult;
      lastDeps.current = deps;
    }

    return lastResult.current!;
  }, deps);
};

// 5. 최적화된 이벤트 핸들러 훅
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  optimization: 'debounce' | 'throttle' = 'debounce',
  delay: number = 300
): T => {
  const optimizedCallback = useMemo(() => {
    if (optimization === 'debounce') {
      return createDebouncedFunction(callback, delay);
    } else {
      return createThrottledFunction(callback, delay);
    }
  }, [callback, optimization, delay, ...deps]);

  return optimizedCallback as T;
};

// 6. 상태 변화 추적 훅
export const useStateTracker = <T>(
  value: T,
  maxHistory: number = 10
): {
  current: T;
  previous: T | undefined;
  history: T[];
  hasChanged: boolean;
  changeCount: number;
} => {
  const [history, setHistory] = useState<T[]>([value]);
  const [changeCount, setChangeCount] = useState(0);
  const previousValue = useRef<T>();

  useEffect(() => {
    if (!Object.is(value, previousValue.current)) {
      setHistory(prev => {
        const newHistory = [...prev, value];
        return newHistory.slice(-maxHistory);
      });
      setChangeCount(prev => prev + 1);
      previousValue.current = value;
    }
  }, [value, maxHistory]);

  return {
    current: value,
    previous: history[history.length - 2],
    history,
    hasChanged: changeCount > 0,
    changeCount
  };
};

// 7. 조건부 상태 업데이트 훅
export const useConditionalState = <T>(
  initialValue: T,
  condition: (newValue: T, currentValue: T) => boolean
): [T, (value: T) => boolean] => {
  const [state, setState] = useState<T>(initialValue);

  const conditionalSetState = useCallback((newValue: T): boolean => {
    if (condition(newValue, state)) {
      setState(newValue);
      return true;
    }
    return false;
  }, [state, condition]);

  return [state, conditionalSetState];
};

// 8. 지연 상태 초기화 훅
export const useLazyState = <T>(
  initializer: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T | null>(null);
  const initialized = useRef(false);

  if (!initialized.current) {
    setState(initializer());
    initialized.current = true;
  }

  return [state as T, setState as React.Dispatch<React.SetStateAction<T>>];
};

// 9. 상태 동기화 훅
export const useSyncedState = <T>(
  externalValue: T,
  onExternalChange?: (value: T) => void
): [T, (value: T) => void] => {
  const [internalValue, setInternalValue] = useState<T>(externalValue);
  const lastExternalValue = useRef<T>(externalValue);

  // 외부 값 변화 감지
  useEffect(() => {
    if (!Object.is(externalValue, lastExternalValue.current)) {
      setInternalValue(externalValue);
      lastExternalValue.current = externalValue;
    }
  }, [externalValue]);

  const setValue = useCallback((value: T) => {
    setInternalValue(value);
    onExternalChange?.(value);
  }, [onExternalChange]);

  return [internalValue, setValue];
};

// 10. 상태 유효성 검사 훅
export const useValidatedState = <T>(
  initialValue: T,
  validator: (value: T) => boolean,
  errorCallback?: (value: T) => void
): [T, (value: T) => boolean, boolean] => {
  const [state, setState] = useState<T>(initialValue);
  const [isValid, setIsValid] = useState(validator(initialValue));

  const setValidatedState = useCallback((value: T): boolean => {
    const valid = validator(value);

    if (valid) {
      setState(value);
      setIsValid(true);
      return true;
    } else {
      setIsValid(false);
      errorCallback?.(value);
      return false;
    }
  }, [validator, errorCallback]);

  return [state, setValidatedState, isValid];
};

// 11. 상태 지속성 훅
export const usePersistedState = <T>(
  key: string,
  initialValue: T,
  storage: Storage = localStorage
): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = storage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.warn(`Failed to load persisted state for key "${key}":`, error);
      return initialValue;
    }
  });

  const setPersistedState = useCallback((value: T) => {
    try {
      setState(value);
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to persist state for key "${key}":`, error);
    }
  }, [key, storage]);

  return [state, setPersistedState];
};

// 12. 상태 머지 훅
export const useMergedState = <T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T> | ((prev: T) => Partial<T>)) => void] => {
  const [state, setState] = useState<T>(initialState);

  const mergeState = useCallback((updates: Partial<T> | ((prev: T) => Partial<T>)) => {
    setState(prevState => {
      const newUpdates = typeof updates === 'function' ? updates(prevState) : updates;
      return { ...prevState, ...newUpdates };
    });
  }, []);

  return [state, mergeState];
};

// 13. 상태 리셋 훅
export const useResettableState = <T>(
  initialValue: T
): [T, (value: T) => void, () => void] => {
  const [state, setState] = useState<T>(initialValue);
  const initialValueRef = useRef<T>(initialValue);

  const resetState = useCallback(() => {
    setState(initialValueRef.current);
  }, []);

  return [state, setState, resetState];
};

// 14. 상태 비교 훅
export const useStateComparison = <T>(
  value: T,
  compareWith: T,
  compareFn?: (a: T, b: T) => boolean
): {
  isEqual: boolean;
  isDifferent: boolean;
  similarity: number;
} => {
  return useMemo(() => {
    const isEqual = compareFn ? compareFn(value, compareWith) : Object.is(value, compareWith);

    return {
      isEqual,
      isDifferent: !isEqual,
      similarity: isEqual ? 1 : 0
    };
  }, [value, compareWith, compareFn]);
};

// 15. 상태 통계 훅
export const useStateStatistics = <T>(
  value: T,
  windowSize: number = 100
): {
  updateCount: number;
  updateRate: number; // per second
  averageUpdateInterval: number;
  lastUpdateTime: number;
} => {
  const [statistics, setStatistics] = useState({
    updateCount: 0,
    updateRate: 0,
    averageUpdateInterval: 0,
    lastUpdateTime: Date.now()
  });

  const updateTimes = useRef<number[]>([]);

  useEffect(() => {
    const now = Date.now();
    updateTimes.current.push(now);

    // 윈도우 크기 유지
    if (updateTimes.current.length > windowSize) {
      updateTimes.current.shift();
    }

    const times = updateTimes.current;
    const updateCount = times.length;

    if (updateCount > 1) {
      const totalTime = now - times[0];
      const averageInterval = totalTime / (updateCount - 1);
      const updateRate = updateCount > 1 ? (updateCount - 1) / (totalTime / 1000) : 0;

      setStatistics({
        updateCount,
        updateRate,
        averageUpdateInterval: averageInterval,
        lastUpdateTime: now
      });
    }
  }, [value, windowSize]);

  return statistics;
};

export default {
  useDebouncedState,
  useThrottledState,
  useBatchedState,
  useMemoizedComputation,
  useOptimizedCallback,
  useStateTracker,
  useConditionalState,
  useLazyState,
  useSyncedState,
  useValidatedState,
  usePersistedState,
  useMergedState,
  useResettableState,
  useStateComparison,
  useStateStatistics
};