# Where We Go - Design System

## 디자인 철학

**"Simple, Intuitive, Accessible"** - 여행 코스 공유의 즐거움에 집중할 수 있는 직관적이고 접근 가능한 디자인

## 컬러 시스템

### Primary Colors (여행 & 모험)
```css
/* 브랜드 컬러 - 따뜻한 여행의 느낌 */
--primary-50: #fef7ed    /* 배경 */
--primary-100: #fed7aa   /* 연한 강조 */
--primary-200: #fed7aa   /* 호버 상태 */
--primary-300: #fb923c   /* 보조 */
--primary-400: #f97316   /* 메인 강조 */
--primary-500: #ea580c   /* 메인 브랜드 */
--primary-600: #dc2626   /* 어두운 강조 */
--primary-700: #b91c1c   /* 진한 */
--primary-800: #991b1b   /* 매우 진한 */
--primary-900: #7f1d1d   /* 가장 진한 */
```

### Secondary Colors (자연 & 모험)
```css
/* 보조 컬러 - 자연스러운 녹색 */
--secondary-50: #f0fdf4
--secondary-100: #dcfce7
--secondary-200: #bbf7d0
--secondary-300: #86efac
--secondary-400: #4ade80
--secondary-500: #22c55e  /* 메인 보조 */
--secondary-600: #16a34a
--secondary-700: #15803d
--secondary-800: #166534
--secondary-900: #14532d
```

### Neutral Colors (가독성 & 균형)
```css
/* 그레이 스케일 */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### Semantic Colors (상태 & 피드백)
```css
/* 성공 */
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

/* 경고 */
--warning-50: #fffbeb
--warning-500: #f59e0b
--warning-600: #d97706

/* 에러 */
--error-50: #fef2f2
--error-500: #ef4444
--error-600: #dc2626

/* 정보 */
--info-50: #eff6ff
--info-500: #3b82f6
--info-600: #2563eb
```

## 타이포그래피

### 폰트 패밀리
```css
/* 메인 폰트 - 한글 최적화 */
--font-primary: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

/* 코드용 폰트 */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

/* 영문 디스플레이용 */
--font-display: 'Inter', sans-serif;
```

### 폰트 크기 & 줄높이
```css
/* 텍스트 크기 */
--text-xs: 0.75rem     /* 12px */
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-lg: 1.125rem    /* 18px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-3xl: 1.875rem   /* 30px */
--text-4xl: 2.25rem    /* 36px */
--text-5xl: 3rem       /* 48px */

/* 줄높이 */
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.625
```

### 폰트 두께
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

## 간격 시스템 (Spacing)

### 스페이싱 스케일 (8px 기준)
```css
--space-0: 0px
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
--space-20: 5rem      /* 80px */
--space-24: 6rem      /* 96px */
```

## 컴포넌트 디자인

### 버튼 시스템

#### Primary Button
```css
.btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 
         text-white font-medium 
         px-6 py-3 rounded-lg 
         transition-colors duration-200
         focus:ring-2 focus:ring-primary-300 focus:outline-none
         disabled:opacity-50 disabled:cursor-not-allowed;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-white hover:bg-gray-50 
         text-primary-600 border border-primary-200
         font-medium px-6 py-3 rounded-lg 
         transition-colors duration-200
         focus:ring-2 focus:ring-primary-300 focus:outline-none;
}
```

#### Icon Button
```css
.btn-icon {
  @apply p-2 rounded-lg
         hover:bg-gray-100 
         transition-colors duration-200
         focus:ring-2 focus:ring-primary-300 focus:outline-none;
}
```

### 입력 필드

#### Text Input
```css
.input-field {
  @apply w-full px-4 py-3 
         border border-gray-300 rounded-lg
         focus:border-primary-500 focus:ring-1 focus:ring-primary-500
         placeholder:text-gray-400
         transition-colors duration-200;
}

.input-field:invalid {
  @apply border-error-500 focus:border-error-500 focus:ring-error-500;
}
```

#### Search Input
```css
.search-input {
  @apply pl-10 pr-4 py-3
         bg-gray-50 border-0 rounded-full
         focus:bg-white focus:shadow-md
         placeholder:text-gray-500
         transition-all duration-200;
}
```

### 카드 컴포넌트

#### Course Card
```css
.course-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100
         hover:shadow-md hover:border-gray-200
         transition-all duration-200
         overflow-hidden;
}

.course-card-image {
  @apply w-full h-48 object-cover;
}

.course-card-content {
  @apply p-6;
}

.course-card-title {
  @apply font-semibold text-lg text-gray-900 mb-2;
}

.course-card-description {
  @apply text-gray-600 text-sm leading-relaxed mb-4;
}

.course-card-footer {
  @apply flex items-center justify-between pt-4 border-t border-gray-100;
}
```

#### Place Card
```css
.place-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-100
         p-4 hover:shadow-md transition-shadow duration-200;
}
```

### 네비게이션

#### Header Navigation
```css
.header-nav {
  @apply bg-white/95 backdrop-blur-sm border-b border-gray-100
         sticky top-0 z-50;
}

.nav-item {
  @apply px-4 py-2 rounded-md text-gray-700
         hover:text-primary-600 hover:bg-primary-50
         transition-colors duration-200;
}

.nav-item.active {
  @apply text-primary-600 bg-primary-50;
}
```

#### Mobile Menu
```css
.mobile-menu {
  @apply fixed inset-0 z-50 bg-white
         transform transition-transform duration-300;
}

.mobile-menu-overlay {
  @apply fixed inset-0 bg-black/50 z-40;
}
```

### 모달 & 오버레이

#### Modal
```css
.modal-overlay {
  @apply fixed inset-0 bg-black/50 z-50 
         flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-white rounded-xl shadow-xl
         max-w-md w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply px-6 py-4 border-b border-gray-100;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-100
         flex justify-end gap-3;
}
```

## 반응형 디자인

### 브레이크포인트
```css
/* Mobile First 접근법 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 반응형 그리드
```css
/* 코스 그리드 */
.course-grid {
  @apply grid gap-6
         grid-cols-1 
         sm:grid-cols-2 
         lg:grid-cols-3 
         xl:grid-cols-4;
}

/* 장소 그리드 */
.place-grid {
  @apply grid gap-4
         grid-cols-1 
         md:grid-cols-2 
         lg:grid-cols-3;
}
```

## 애니메이션 & 전환

### 기본 전환
```css
.transition-base {
  @apply transition-all duration-200 ease-in-out;
}

.transition-slow {
  @apply transition-all duration-300 ease-in-out;
}

.transition-fast {
  @apply transition-all duration-150 ease-in-out;
}
```

### 페이드 애니메이션
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.fade-out {
  animation: fadeOut 0.3s ease-out;
}
```

### 로딩 스피너
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  @apply w-6 h-6 border-2 border-gray-200 border-t-primary-500 rounded-full;
  animation: spin 1s linear infinite;
}
```

## 접근성 (Accessibility)

### 포커스 관리
```css
.focus-visible {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}

.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0
         bg-primary-600 text-white px-4 py-2 z-50;
}
```

### 색상 대비
- 모든 텍스트는 WCAG 2.1 AA 기준 이상의 대비비 준수
- 최소 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)

### 스크린 리더 지원
```css
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden 
         whitespace-nowrap border-0;
}

.not-sr-only {
  @apply static w-auto h-auto p-0 m-0 overflow-visible 
         whitespace-normal;
}
```

## 다크 모드 지원

### 다크 모드 변수
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: theme('colors.gray.900');
    --bg-secondary: theme('colors.gray.800');
    --text-primary: theme('colors.gray.100');
    --text-secondary: theme('colors.gray.300');
    --border-color: theme('colors.gray.700');
  }
}
```

## 성능 최적화

### Critical CSS
- Above-the-fold 콘텐츠의 스타일을 인라인으로 포함
- 폰트 로딩 최적화 (font-display: swap)

### 이미지 최적화
```css
.image-responsive {
  @apply w-full h-auto max-w-full;
}

.image-cover {
  @apply w-full h-full object-cover;
}

.image-lazy {
  @apply transition-opacity duration-300 opacity-0;
}

.image-lazy.loaded {
  @apply opacity-100;
}
```

## 아이콘 시스템

### Lucide React 아이콘 사용
- 일관된 스타일과 크기
- 접근성을 위한 적절한 aria-label
- 상황별 의미 전달

### 아이콘 크기
```css
.icon-xs { @apply w-3 h-3; }   /* 12px */
.icon-sm { @apply w-4 h-4; }   /* 16px */
.icon-md { @apply w-5 h-5; }   /* 20px */
.icon-lg { @apply w-6 h-6; }   /* 24px */
.icon-xl { @apply w-8 h-8; }   /* 32px */
```

이 디자인 시스템을 바탕으로 일관되고 사용자 친화적인 인터페이스를 구축합니다.