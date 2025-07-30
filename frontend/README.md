# Where We Go - Frontend 설계서

## 프로젝트 개요

**Where We Go**는 여행 코스 공유 플랫폼으로, 사용자가 장소를 검색하고 코스를 생성하여 다른 사용자와 공유할 수 있는 웹 애플리케이션입니다.

## 기술 스택

### Core Framework
- **React 18** + **TypeScript** - 타입 안전성과 개발 생산성
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **React Router v6** - 클라이언트 사이드 라우팅

### UI & Styling
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **Headless UI** - 접근성을 고려한 unstyled 컴포넌트
- **Lucide React** - 일관된 아이콘 시스템

### State Management
- **Zustand** - 경량 상태 관리 라이브러리
- **React Query (TanStack Query)** - 서버 상태 관리 및 캐싱

### HTTP Client & API
- **Axios** - HTTP 클라이언트 (인터셉터 및 에러 핸들링)
- **Axios-Auth-Refresh** - 토큰 자동 갱신

### Maps & Location
- **Kakao Map SDK** - 지도 표시 및 위치 검색
- **Geolocation API** - 사용자 위치 정보

### Development Tools
- **ESLint** + **Prettier** - 코드 품질 및 포맷팅
- **Husky** + **lint-staged** - Git hooks 및 pre-commit 검사

## 백엔드 API 분석

### 주요 엔드포인트

#### 인증 (Auth)
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인 (JWT 토큰 발급)
- `POST /api/auth/logout` - 로그아웃 (토큰 블랙리스트)

#### 사용자 (User)
- `GET /api/users/me` - 마이페이지 조회
- `PATCH /api/users/me` - 프로필 수정
- `DELETE /api/users/me` - 회원탈퇴
- `GET /api/users/me/bookmarks` - 북마크한 장소/코스 조회

#### 코스 (Course)
- `GET /api/courses` - 코스 목록 조회 (필터링, 페이징)
- `POST /api/courses` - 코스 생성
- `GET /api/courses/{id}` - 코스 상세 조회
- `PATCH /api/courses/{id}` - 코스 수정
- `DELETE /api/courses/{id}` - 코스 삭제
- `GET /api/courses/popular` - 인기 코스 조회
- `POST /api/courses/{id}/like` - 코스 좋아요
- `POST /api/courses/{id}/rating` - 코스 평점 등록
- `POST /api/courses/{id}/bookmark` - 코스 북마크

#### 장소 (Place)
- `POST /api/places/search` - 장소 검색 (Kakao + Google Places)
- `GET /api/places/{id}/details` - 장소 상세 정보
- `POST /api/places/{id}/bookmark` - 장소 북마크
- `DELETE /api/places/{id}/bookmark` - 장소 북마크 해제

#### 댓글 (Comment)
- `GET /api/courses/{id}/comments` - 코스 댓글 조회
- `POST /api/courses/{id}/comments` - 댓글 작성
- `PATCH /api/comments/{id}` - 댓글 수정
- `DELETE /api/comments/{id}` - 댓글 삭제

### API 응답 형식
모든 API는 통일된 `ApiResponse<T>` 형식을 사용:
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
```

## 애플리케이션 아키텍처

### 디렉토리 구조
```
frontend/
├── public/
│   ├── kakao-maps.html       # Kakao Maps 초기화
│   └── index.html
├── src/
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── common/          # 공통 컴포넌트
│   │   ├── auth/            # 인증 관련 컴포넌트
│   │   ├── course/          # 코스 관련 컴포넌트
│   │   ├── place/           # 장소 관련 컴포넌트
│   │   └── layout/          # 레이아웃 컴포넌트
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── CourseList.tsx
│   │   ├── CourseDetail.tsx
│   │   ├── CourseCreate.tsx
│   │   ├── PlaceSearch.tsx
│   │   └── MyPage.tsx
│   ├── hooks/               # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useMap.ts
│   │   └── useGeolocation.ts
│   ├── services/            # API 서비스
│   │   ├── api.ts           # Axios 설정
│   │   ├── auth.ts          # 인증 API
│   │   ├── course.ts        # 코스 API
│   │   ├── place.ts         # 장소 API
│   │   └── user.ts          # 사용자 API
│   ├── store/               # 상태 관리
│   │   ├── auth.ts          # 인증 상태
│   │   ├── course.ts        # 코스 상태
│   │   └── ui.ts            # UI 상태
│   ├── types/               # TypeScript 타입 정의
│   │   ├── api.ts           # API 응답 타입
│   │   ├── auth.ts          # 인증 타입
│   │   ├── course.ts        # 코스 타입
│   │   └── place.ts         # 장소 타입
│   ├── utils/               # 유틸리티 함수
│   │   ├── format.ts        # 데이터 포맷팅
│   │   ├── validation.ts    # 데이터 검증
│   │   └── constants.ts     # 상수 정의
│   ├── styles/              # 스타일 파일
│   │   └── globals.css      # Tailwind CSS 설정
│   ├── App.tsx              # 메인 앱 컴포넌트
│   └── main.tsx             # 앱 진입점
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 핵심 기능 설계

### 1. 인증 시스템
- JWT 토큰 기반 인증
- 자동 토큰 갱신 (Refresh Token)
- 보호된 라우트 (Private Routes)
- 로그인 상태 지속 (Local Storage)

### 2. 지도 통합
- Kakao Map SDK 통합
- 실시간 장소 검색
- 마커 표시 및 클러스터링
- 사용자 위치 기반 서비스

### 3. 코스 관리
- 드래그 앤 드롭으로 코스 순서 조정
- 실시간 코스 미리보기
- 거리 및 소요시간 계산
- 테마별 코스 분류

### 4. 반응형 디자인
- Mobile-first 접근법
- Tailwind CSS 브레이크포인트 활용
- 터치 친화적 인터페이스

### 5. 성능 최적화
- React.lazy()를 통한 코드 스플리팅
- React Query 캐싱
- 이미지 지연 로딩
- 메모이제이션 (useMemo, useCallback)

## 상태 관리 설계

### Zustand Store 구조

#### 인증 스토어 (authStore)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

#### 코스 스토어 (courseStore)
```typescript
interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  filters: CourseFilters;
  setCourses: (courses: Course[]) => void;
  setCurrentCourse: (course: Course) => void;
  updateFilters: (filters: Partial<CourseFilters>) => void;
}
```

#### UI 스토어 (uiStore)
```typescript
interface UIState {
  sidebarOpen: boolean;
  loading: boolean;
  notifications: Notification[];
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Notification) => void;
}
```

## API 통신 설계

### Axios 인스턴스 구성
- Base URL 설정
- 요청/응답 인터셉터
- 자동 토큰 첨부
- 에러 핸들링 및 재시도 로직

### React Query 설정
- 캐시 전략 설정 (5분 stale time)
- 백그라운드 리페치
- 옵티미스틱 업데이트
- 에러 바운더리 통합

## 보안 고려사항

### 클라이언트 사이드 보안
- XSS 방지를 위한 입력값 검증
- CSRF 토큰 처리
- 민감한 정보 로컬 스토리지 제한
- Content Security Policy 설정

### 토큰 관리
- Access Token은 메모리에 저장
- Refresh Token은 HttpOnly 쿠키 권장
- 토큰 만료 시 자동 갱신
- 로그아웃 시 토큰 무효화

## 배포 전략

### 빌드 최적화
- Tree shaking을 통한 번들 크기 최적화
- 압축 및 Gzip 적용
- 정적 자산 CDN 배포
- 브라우저 캐싱 전략

### 환경 설정
- 개발/스테이징/프로덕션 환경 분리
- 환경변수를 통한 API URL 관리
- CI/CD 파이프라인 구축

## 개발 워크플로

### Git 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 통합 브랜치  
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 코드 품질 관리
- ESLint 규칙 엄격 적용
- Prettier를 통한 일관된 코드 포맷팅
- Husky pre-commit 훅
- TypeScript strict 모드 활성화

이 설계서를 바탕으로 단계적으로 프론트엔드 애플리케이션을 구현해 나갈 예정입니다.