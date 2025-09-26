# Boston Academy Design System

포괄적인 CSS 디자인 시스템으로, 일관성 있고 접근 가능한 사용자 인터페이스를 구현합니다.

## 파일 구조

```
src/styles/
├── tokens.css          # 디자인 토큰 (색상, 타이포그래피, 간격)
├── components.css      # 재사용 가능한 컴포넌트 스타일
├── themes.css          # 역할별 테마 시스템
├── global.css          # 글로벌 레이아웃 및 기본 스타일
├── accessibility.css   # 접근성 개선 스타일
└── README.md          # 이 문서
```

## 주요 기능

### 1. 디자인 토큰 시스템 (tokens.css)
- **색상 팔레트**: 브랜드 색상, 표면 색상, 텍스트 색상, 테두리 색상
- **타이포그래피**: 폰트 패밀리, 크기, 가중치, 행간
- **간격**: 8px 기반 일관된 간격 시스템
- **테두리 반경**: 다양한 크기의 둥근 모서리
- **그림자**: 깊이감을 위한 그림자 계층
- **애니메이션**: 일관된 지속 시간과 easing 함수

### 2. 컴포넌트 시스템 (components.css)
- **버튼**: Primary, Secondary, Success, Warning, Error 변형
- **카드**: 기본 카드, KPI 카드, 진행률 카드
- **폼**: 입력 필드, 라벨, 선택 상자
- **내비게이션**: 탭, 사이드바 내비게이션
- **테이블**: 반응형 테이블 스타일
- **상태 배지**: 활성, 비활성, 대기, 오류 상태
- **유틸리티 클래스**: 레이아웃, 간격, 텍스트 정렬

### 3. 역할별 테마 시스템 (themes.css)
- **Student 테마**: 학습에 최적화된 파란색 계열
- **Teacher 테마**: 교육에 적합한 주황색 계열
- **Admin 테마**: 관리용 빨간색 계열
- **다크 테마**: 각 역할별 다크모드 지원
- **고대비 모드**: 접근성을 위한 고대비 테마

### 4. 접근성 (accessibility.css)
- **키보드 포커스**: 명확한 포커스 표시
- **스크린 리더**: 시각적으로 숨겨진 텍스트
- **모션 감소**: `prefers-reduced-motion` 지원
- **고대비**: `prefers-contrast` 지원
- **강제 색상**: Windows 고대비 모드 지원

## 사용 방법

### 기본 컴포넌트 사용

```html
<!-- 기본 버튼 -->
<button class="btn btn-primary">저장</button>

<!-- KPI 카드 -->
<div class="kpi-card">
  <div class="kpi-value">1,234</div>
  <div class="kpi-label">총 학생 수</div>
</div>

<!-- 상태 배지 -->
<span class="status-badge status-active">활성</span>
```

### 역할별 테마 적용

HTML 루트 요소에 `data-role` 속성을 추가:

```html
<!-- Student 테마 -->
<html data-role="student">

<!-- Teacher 테마 -->
<html data-role="teacher">

<!-- Admin 테마 -->
<html data-role="admin">
```

### 다크 테마 적용

`data-theme` 속성을 추가:

```html
<html data-role="student" data-theme="dark">
```

### 고대비 모드

`data-accessibility` 속성을 추가:

```html
<html data-accessibility="high-contrast">
```

## 디자인 토큰 참조

### 색상
```css
/* 브랜드 색상 */
var(--brand-primary)    /* #5b7cff */
var(--brand-secondary)  /* #0b1b57 */
var(--brand-accent)     /* #7c3aed */
var(--brand-success)    /* #10b981 */
var(--brand-warning)    /* #f59e0b */
var(--brand-error)      /* #ef4444 */

/* 표면 색상 */
var(--bg-primary)       /* #ffffff */
var(--bg-secondary)     /* #f8fafc */
var(--surface-card)     /* #ffffff */

/* 텍스트 색상 */
var(--text-primary)     /* #1e293b */
var(--text-secondary)   /* #64748b */
var(--text-inverse)     /* #ffffff */
```

### 간격
```css
var(--space-1)  /* 4px */
var(--space-2)  /* 8px */
var(--space-3)  /* 12px */
var(--space-4)  /* 16px */
var(--space-6)  /* 24px */
var(--space-8)  /* 32px */
```

### 타이포그래피
```css
var(--font-size-xs)   /* 12px */
var(--font-size-sm)   /* 14px */
var(--font-size-base) /* 16px */
var(--font-size-lg)   /* 18px */
var(--font-size-xl)   /* 20px */
var(--font-size-2xl)  /* 24px */
var(--font-size-3xl)  /* 30px */
var(--font-size-4xl)  /* 36px */
```

## 반응형 디자인

디자인 시스템은 모바일 우선으로 설계되었습니다:

- **Mobile**: 기본 스타일 (0px+)
- **Tablet**: 768px+
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 성능 고려사항

- CSS 변수를 사용한 효율적인 테마 전환
- 최소한의 CSS 재계산을 위한 계층적 구조
- 프린트 스타일 최적화
- 접근성 기능의 점진적 향상

## 개발 가이드라인

### 새 컴포넌트 생성 시
1. 기존 토큰 사용
2. 의미적 네이밍 규칙 따르기
3. 접근성 고려
4. 모든 테마에서 테스트

### 색상 추가 시
1. tokens.css에 먼저 정의
2. 모든 테마 변형에 추가
3. 대비율 검사 (WCAG AA 준수)

### 애니메이션 추가 시
1. `prefers-reduced-motion` 고려
2. 디자인 토큰의 duration 사용
3. 성능 최적화된 속성만 사용

## 버전 히스토리

### v1.0.0 (현재)
- 초기 디자인 시스템 구축
- 역할별 테마 시스템
- 포괄적인 컴포넌트 라이브러리
- 접근성 최적화