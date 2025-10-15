/**
 * 보스턴어학원 애니메이션 & 트랜지션 토큰
 *
 * 규칙:
 * - 일관된 타이밍으로 부드러운 UX
 * - Reduced motion 대응 (접근성)
 * - CSS 변수로 제공 가능
 */

// ========================================
// 1. Duration (지속 시간)
// ========================================

export const duration = {
  /** 즉각 (0ms) */
  instant: '0ms',

  /** 매우 빠름 (75ms) - 미세한 피드백 */
  fastest: '75ms',

  /** 빠름 (150ms) - 호버, 포커스 */
  faster: '150ms',

  /** 기본 (200ms) - 일반적인 전환 */
  fast: '200ms',

  /** 보통 (300ms) - 표준 애니메이션 */
  normal: '300ms',

  /** 느림 (500ms) - 복잡한 전환 */
  slow: '500ms',

  /** 매우 느림 (700ms) - 큰 변화 */
  slower: '700ms',

  /** 가장 느림 (1000ms) - 특별한 효과 */
  slowest: '1000ms',
} as const;

// ========================================
// 2. Easing (가속도 곡선)
// ========================================

export const easing = {
  /** Linear - 일정한 속도 */
  linear: 'linear',

  /** Ease - 기본 가속/감속 */
  ease: 'ease',

  /** Ease In - 점점 빠르게 */
  easeIn: 'ease-in',

  /** Ease Out - 점점 느리게 (권장) */
  easeOut: 'ease-out',

  /** Ease In Out - 양쪽 부드럽게 */
  easeInOut: 'ease-in-out',

  // Cubic Bezier (Custom)
  /** 표준 - 자연스러운 움직임 */
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',

  /** 강조 - 시작 강조 */
  emphasized: 'cubic-bezier(0.0, 0, 0.2, 1)',

  /** 감속 - 끝에서 천천히 */
  decelerated: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  /** 가속 - 시작에서 빠르게 */
  accelerated: 'cubic-bezier(0.4, 0.0, 1, 1)',

  /** Sharp - 날카로운 전환 */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',

  /** Bounce - 튕기는 효과 */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  /** Elastic - 탄성 효과 */
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
} as const;

// ========================================
// 3. Keyframes (CSS 애니메이션)
// ========================================

export const keyframes = {
  /** Fade In - 페이드 인 */
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,

  /** Fade Out - 페이드 아웃 */
  fadeOut: `
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `,

  /** Slide In Up - 아래에서 위로 */
  slideInUp: `
    @keyframes slideInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  /** Slide In Down - 위에서 아래로 */
  slideInDown: `
    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  /** Slide In Left - 왼쪽에서 */
  slideInLeft: `
    @keyframes slideInLeft {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  /** Slide In Right - 오른쪽에서 */
  slideInRight: `
    @keyframes slideInRight {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  /** Scale In - 확대 */
  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,

  /** Scale Out - 축소 */
  scaleOut: `
    @keyframes scaleOut {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.9);
        opacity: 0;
      }
    }
  `,

  /** Spin - 회전 */
  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,

  /** Pulse - 맥박 */
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,

  /** Shake - 흔들기 */
  shake: `
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-10px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(10px);
      }
    }
  `,

  /** Bounce - 튕기기 */
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,
} as const;

// ========================================
// 4. Transition Presets (전환 프리셋)
// ========================================

export const transitions = {
  /** 모든 속성 기본 전환 */
  all: `all ${duration.normal} ${easing.standard}`,

  /** 색상 전환 */
  color: `color ${duration.fast} ${easing.easeOut}`,

  /** 배경색 전환 */
  background: `background-color ${duration.fast} ${easing.easeOut}`,

  /** 테두리 전환 */
  border: `border ${duration.fast} ${easing.easeOut}`,

  /** 그림자 전환 */
  shadow: `box-shadow ${duration.fast} ${easing.easeOut}`,

  /** 변형 전환 (transform) */
  transform: `transform ${duration.normal} ${easing.standard}`,

  /** 투명도 전환 */
  opacity: `opacity ${duration.fast} ${easing.easeOut}`,

  /** 여백 전환 */
  spacing: `margin ${duration.fast} ${easing.easeOut}, padding ${duration.fast} ${easing.easeOut}`,

  /** 크기 전환 */
  size: `width ${duration.normal} ${easing.standard}, height ${duration.normal} ${easing.standard}`,

  /** 테마 전환 (다크/라이트 모드) */
  theme: `background-color ${duration.normal} ${easing.standard}, color ${duration.normal} ${easing.standard}, border-color ${duration.normal} ${easing.standard}`,
} as const;

// ========================================
// 5. Animation Presets (애니메이션 프리셋)
// ========================================

export const animations = {
  /** Fade In 애니메이션 */
  fadeIn: `fadeIn ${duration.normal} ${easing.easeOut} forwards`,

  /** Fade Out 애니메이션 */
  fadeOut: `fadeOut ${duration.normal} ${easing.easeOut} forwards`,

  /** Slide In Up 애니메이션 */
  slideInUp: `slideInUp ${duration.normal} ${easing.standard} forwards`,

  /** Slide In Down 애니메이션 */
  slideInDown: `slideInDown ${duration.normal} ${easing.standard} forwards`,

  /** Scale In 애니메이션 */
  scaleIn: `scaleIn ${duration.fast} ${easing.easeOut} forwards`,

  /** Spin 애니메이션 (무한 반복) */
  spin: `spin ${duration.slowest} ${easing.linear} infinite`,

  /** Pulse 애니메이션 (무한 반복) */
  pulse: `pulse ${duration.slower} ${easing.easeInOut} infinite`,

  /** Bounce 애니메이션 */
  bounce: `bounce ${duration.slow} ${easing.bounce}`,

  /** Shake 애니메이션 */
  shake: `shake ${duration.slow} ${easing.easeInOut}`,
} as const;

// ========================================
// 6. Reduced Motion (접근성)
// ========================================

/**
 * prefers-reduced-motion 미디어 쿼리 대응
 *
 * 사용자가 애니메이션 감소를 선호하는 경우
 * 애니메이션을 비활성화하거나 감소시킴
 */
export const reducedMotion = {
  /** 애니메이션 비활성화 */
  disable: `
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `,

  /** 애니메이션 감소 (추천) */
  reduce: `
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: ${duration.faster} !important;
        transition-duration: ${duration.faster} !important;
      }
    }
  `,
} as const;

// ========================================
// 7. Global Animations CSS
// ========================================

/**
 * 전역 애니메이션 CSS
 * <head>에 추가하거나 GlobalStyles로 주입
 */
export const globalAnimationsCSS = `
  ${Object.values(keyframes).join('\n')}

  ${reducedMotion.reduce}
`;

// ========================================
// 8. 타입 정의
// ========================================

export type Duration = keyof typeof duration;
export type Easing = keyof typeof easing;
export type KeyframeName = keyof typeof keyframes;
export type TransitionPreset = keyof typeof transitions;
export type AnimationPreset = keyof typeof animations;

// ========================================
// 9. 유틸리티 함수
// ========================================

/**
 * 커스텀 transition 생성
 */
export function createTransition(
  property: string | string[],
  durationKey: Duration = 'normal',
  easingKey: Easing = 'standard'
): string {
  const properties = Array.isArray(property) ? property : [property];
  return properties
    .map((prop) => `${prop} ${duration[durationKey]} ${easing[easingKey]}`)
    .join(', ');
}

/**
 * 커스텀 animation 생성
 */
export function createAnimation(
  keyframeName: string,
  durationKey: Duration = 'normal',
  easingKey: Easing = 'standard',
  iterationCount: string | number = 1,
  fillMode: 'none' | 'forwards' | 'backwards' | 'both' = 'forwards'
): string {
  return `${keyframeName} ${duration[durationKey]} ${easing[easingKey]} ${iterationCount} ${fillMode}`;
}

/**
 * 지연(delay) 추가
 */
export function withDelay(animation: string, delayMs: number): string {
  return `${animation} ${delayMs}ms`;
}
