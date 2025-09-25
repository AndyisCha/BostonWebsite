// codeRefactoring.ts - 코드 리팩토링 유틸리티

import React, { ReactNode } from 'react';

// 1. 타입 가드 함수들
export const typeGuards = {
  isString: (value: unknown): value is string => typeof value === 'string',
  isNumber: (value: unknown): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  isArray: <T>(value: unknown): value is T[] => Array.isArray(value),
  isObject: (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  isFunction: (value: unknown): value is Function => typeof value === 'function',
  isPromise: <T>(value: unknown): value is Promise<T> =>
    value instanceof Promise || (
      typeof value === 'object' &&
      value !== null &&
      'then' in value &&
      typeof (value as any).then === 'function'
    ),
  isNotNull: <T>(value: T | null): value is T => value !== null,
  isNotUndefined: <T>(value: T | undefined): value is T => value !== undefined,
  isNotEmpty: (value: string | any[] | null | undefined): value is string | any[] =>
    value !== null && value !== undefined && value.length > 0
};

// 2. 함수형 프로그래밍 유틸리티
export const fp = {
  // 함수 합성
  compose: <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value),

  // 파이프 연산
  pipe: <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value),

  // 커링
  curry: <Args extends any[], Return>(
    fn: (...args: Args) => Return
  ) => {
    return function curried(...args: Partial<Args>): any {
      if (args.length >= fn.length) {
        return fn(...(args as Args));
      }
      return (...nextArgs: any[]) => curried(...args, ...nextArgs);
    };
  },

  // 부분 적용
  partial: <Args extends any[], Return>(
    fn: (...args: Args) => Return,
    ...partialArgs: Partial<Args>
  ) => (...remainingArgs: any[]): Return =>
    fn(...(partialArgs as Args), ...(remainingArgs as any)),

  // 메모이제이션
  memoize: <Args extends any[], Return>(
    fn: (...args: Args) => Return,
    keyGenerator?: (...args: Args) => string
  ): (...args: Args) => Return => {
    const cache = new Map<string, Return>();

    return (...args: Args): Return => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }
};

// 3. 에러 핸들링 유틸리티
export class Result<T, E = Error> {
  constructor(
    private _value?: T,
    private _error?: E,
    private _isSuccess: boolean = true
  ) {}

  static success<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, undefined, true);
  }

  static failure<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error, false);
  }

  isSuccess(): boolean {
    return this._isSuccess;
  }

  isFailure(): boolean {
    return !this._isSuccess;
  }

  getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed Result');
    }
    return this._value!;
  }

  getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful Result');
    }
    return this._error!;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      try {
        return Result.success(fn(this._value!));
      } catch (error) {
        return Result.failure(error as E);
      }
    }
    return Result.failure(this._error!);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      try {
        return fn(this._value!);
      } catch (error) {
        return Result.failure(error as E);
      }
    }
    return Result.failure(this._error!);
  }

  fold<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this._isSuccess ? onSuccess(this._value!) : onFailure(this._error!);
  }
}

// 4. 옵셔널 체이닝 유틸리티
export class Optional<T> {
  constructor(private _value: T | null | undefined) {}

  static of<T>(value: T | null | undefined): Optional<T> {
    return new Optional(value);
  }

  static empty<T>(): Optional<T> {
    return new Optional<T>(null);
  }

  isPresent(): boolean {
    return this._value !== null && this._value !== undefined;
  }

  isEmpty(): boolean {
    return !this.isPresent();
  }

  get(): T {
    if (!this.isPresent()) {
      throw new Error('No value present');
    }
    return this._value!;
  }

  orElse(other: T): T {
    return this.isPresent() ? this._value! : other;
  }

  orElseGet(supplier: () => T): T {
    return this.isPresent() ? this._value! : supplier();
  }

  map<U>(mapper: (value: T) => U): Optional<U> {
    if (this.isPresent()) {
      try {
        return Optional.of(mapper(this._value!));
      } catch {
        return Optional.empty();
      }
    }
    return Optional.empty();
  }

  filter(predicate: (value: T) => boolean): Optional<T> {
    if (this.isPresent() && predicate(this._value!)) {
      return this;
    }
    return Optional.empty();
  }

  ifPresent(consumer: (value: T) => void): void {
    if (this.isPresent()) {
      consumer(this._value!);
    }
  }
}

// 5. 불변성 헬퍼
export const immutable = {
  // 객체 업데이트
  updateObject: <T extends Record<string, any>>(
    obj: T,
    updates: Partial<T>
  ): T => ({ ...obj, ...updates }),

  // 중첩 객체 업데이트
  updateNested: <T>(obj: T, path: string, value: any): T => {
    const keys = path.split('.');
    const result = { ...obj } as any;
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = { ...current[key] };
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  },

  // 배열 업데이트
  updateArray: <T>(arr: T[], index: number, value: T): T[] => [
    ...arr.slice(0, index),
    value,
    ...arr.slice(index + 1)
  ],

  // 배열에서 제거
  removeFromArray: <T>(arr: T[], index: number): T[] => [
    ...arr.slice(0, index),
    ...arr.slice(index + 1)
  ],

  // 배열에 추가
  addToArray: <T>(arr: T[], item: T, index?: number): T[] => {
    if (index === undefined) {
      return [...arr, item];
    }
    return [...arr.slice(0, index), item, ...arr.slice(index)];
  },

  // 깊은 복사
  deepCopy: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
      return obj.map(item => immutable.deepCopy(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const copy: any = {};
      Object.keys(obj).forEach(key => {
        copy[key] = immutable.deepCopy((obj as any)[key]);
      });
      return copy;
    }

    return obj;
  }
};

// 6. 유효성 검사 빌더
export class ValidationBuilder<T> {
  private rules: Array<(value: T) => string | null> = [];

  required(message: string = 'This field is required'): this {
    this.rules.push((value: T) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return null;
    });
    return this;
  }

  minLength(min: number, message?: string): this {
    this.rules.push((value: T) => {
      if (typeof value === 'string' && value.length < min) {
        return message || `Minimum length is ${min}`;
      }
      return null;
    });
    return this;
  }

  maxLength(max: number, message?: string): this {
    this.rules.push((value: T) => {
      if (typeof value === 'string' && value.length > max) {
        return message || `Maximum length is ${max}`;
      }
      return null;
    });
    return this;
  }

  pattern(regex: RegExp, message?: string): this {
    this.rules.push((value: T) => {
      if (typeof value === 'string' && !regex.test(value)) {
        return message || 'Invalid format';
      }
      return null;
    });
    return this;
  }

  custom(validator: (value: T) => string | null): this {
    this.rules.push(validator);
    return this;
  }

  validate(value: T): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const error = rule(value);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 7. 이벤트 버스
export class EventBus {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();

  on<T extends any[]>(event: string, callback: (...args: T) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const callbacks = this.events.get(event)!;
    callbacks.push(callback);

    // 구독 해제 함수 반환
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  emit<T extends any[]>(event: string, ...args: T): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for '${event}':`, error);
        }
      });
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!callback) {
      this.events.delete(event);
      return;
    }

    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  clear(): void {
    this.events.clear();
  }
}

// 8. 상태 머신
export class StateMachine<State extends string, Event extends string> {
  private currentState: State;
  private transitions: Map<string, State> = new Map();
  private listeners: Array<(from: State, to: State, event: Event) => void> = [];

  constructor(initialState: State) {
    this.currentState = initialState;
  }

  addTransition(from: State, event: Event, to: State): this {
    this.transitions.set(`${from}:${event}`, to);
    return this;
  }

  transition(event: Event): boolean {
    const key = `${this.currentState}:${event}`;
    const nextState = this.transitions.get(key);

    if (nextState) {
      const previousState = this.currentState;
      this.currentState = nextState;

      this.listeners.forEach(listener => {
        listener(previousState, nextState, event);
      });

      return true;
    }

    return false;
  }

  getState(): State {
    return this.currentState;
  }

  canTransition(event: Event): boolean {
    const key = `${this.currentState}:${event}`;
    return this.transitions.has(key);
  }

  onTransition(listener: (from: State, to: State, event: Event) => void): () => void {
    this.listeners.push(listener);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// 9. 지연 실행 관리자
export class DeferredExecutor {
  private queue: Array<{
    id: string;
    fn: () => void | Promise<void>;
    priority: number;
    delay: number;
  }> = [];

  private isProcessing = false;

  add(
    id: string,
    fn: () => void | Promise<void>,
    priority: number = 0,
    delay: number = 0
  ): void {
    // 기존 항목 제거 (덮어쓰기)
    this.queue = this.queue.filter(item => item.id !== id);

    this.queue.push({ id, fn, priority, delay });
    this.queue.sort((a, b) => b.priority - a.priority);

    this.processQueue();
  }

  remove(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(item => item.id !== id);
    return this.queue.length < initialLength;
  }

  clear(): void {
    this.queue = [];
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;

      if (item.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, item.delay));
      }

      try {
        await item.fn();
      } catch (error) {
        console.error(`Error executing deferred task '${item.id}':`, error);
      }
    }

    this.isProcessing = false;
  }
}

// 10. 컴포넌트 팩토리
export const createComponentFactory = <Props extends Record<string, any>>(
  baseComponent: React.ComponentType<Props>,
  defaultProps?: Partial<Props>,
  enhancers?: Array<(Component: React.ComponentType<Props>) => React.ComponentType<Props>>
) => {
  return (overrideProps?: Partial<Props>) => {
    let Component = baseComponent;

    if (enhancers) {
      Component = enhancers.reduce(
        (comp, enhancer) => enhancer(comp),
        Component
      );
    }

    return (props: Props) =>
      React.createElement(Component, { ...defaultProps, ...props, ...overrideProps });
  };
};

// 11. HOC 빌더
export const withEnhancement = <Props extends Record<string, any>>(
  enhancements: Record<string, any>
) => (Component: React.ComponentType<Props>) => {
  const EnhancedComponent = (props: Props) =>
    React.createElement(Component, { ...props, ...enhancements });

  EnhancedComponent.displayName = `withEnhancement(${Component.displayName || Component.name})`;
  return EnhancedComponent;
};

// 전역 인스턴스들
export const globalEventBus = new EventBus();
export const globalDeferredExecutor = new DeferredExecutor();

export default {
  typeGuards,
  fp,
  Result,
  Optional,
  immutable,
  ValidationBuilder,
  EventBus,
  StateMachine,
  DeferredExecutor,
  createComponentFactory,
  withEnhancement,
  globalEventBus,
  globalDeferredExecutor
};