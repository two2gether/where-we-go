# 백엔드 API 연결 가이드

## 🚀 백엔드 서버 시작하기

### 1. 백엔드 서버 실행
```bash
# 백엔드 디렉토리로 이동
cd ../  # (루트 디렉토리)

# Spring Boot 애플리케이션 실행
./gradlew bootRun
# 또는
gradle bootRun
```

### 2. 프론트엔드 환경 설정
```bash
# 프론트엔드 디렉토리에서
cp .env.example .env.development

# .env.development 파일 수정
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. 프론트엔드 서버 실행
```bash
npm run dev
```

## 🔗 API 연동 완료 사항

### ✅ 완료된 기능들

#### 1. 인증 시스템
- **로그인/회원가입**: `LoginPage` 완전 연동
- **자동 토큰 관리**: Axios 인터셉터로 자동 토큰 첨부
- **토큰 갱신**: 만료 시 자동 갱신 또는 로그아웃
- **로그아웃**: API 호출 후 상태 초기화

#### 2. 코스 관리
- **코스 목록**: 검색, 필터링, 페이지네이션
- **코스 좋아요**: 토글 기능
- **실시간 업데이트**: React Query로 캐시 관리

#### 3. 장소 관리  
- **장소 목록**: 검색, 카테고리/지역 필터링
- **북마크**: 장소 북마크 토글 기능
- **로딩/에러 상태**: 사용자 친화적 UI

#### 4. 상태 관리
- **전역 상태**: Zustand로 인증 상태 관리
- **서버 상태**: React Query로 API 데이터 캐싱
- **에러 처리**: 통합 에러 처리 시스템

## 🔧 API 엔드포인트 매핑

### 인증 (`/api/auth`)
```typescript
POST /api/auth/login      // 로그인
POST /api/auth/register   // 회원가입
POST /api/auth/logout     // 로그아웃
POST /api/auth/refresh    // 토큰 갱신
GET  /api/auth/me         // 현재 사용자 정보
```

### 코스 (`/api/courses`)
```typescript
GET    /api/courses              // 코스 목록 조회
GET    /api/courses/{id}         // 코스 상세 조회
POST   /api/courses/{id}/like    // 코스 좋아요 토글
GET    /api/courses/my           // 내 코스 목록
GET    /api/courses/popular      // 인기 코스
```

### 장소 (`/api/places`)
```typescript
GET /api/places                // 장소 목록 조회
GET /api/places/{id}           // 장소 상세 조회
GET /api/places/categories     // 카테고리 목록
GET /api/places/regions        // 지역 목록
GET /api/places/popular        // 인기 장소
```

### 북마크 (`/api/bookmarks`)
```typescript
POST   /api/bookmarks/toggle    // 북마크 토글
GET    /api/bookmarks           // 북마크 목록
GET    /api/bookmarks/places    // 북마크한 장소
GET    /api/bookmarks/courses   // 북마크한 코스
```

## 🎯 다음 연동 예정 기능

### 1. 코스 상세 페이지
- 코스 상세 정보 표시
- 장소별 경로 및 시간 정보
- 리뷰 및 평점 시스템

### 2. 코스 생성/편집
- 드래그 앤 드롭으로 장소 추가
- 경로 최적화
- 이미지 업로드

### 3. 사용자 프로필
- 프로필 정보 수정
- 내가 만든 코스 관리
- 북마크 관리

### 4. 지도 연동
- Google Maps 실제 연동
- 장소 위치 표시
- 경로 안내

## 🐛 현재 제한사항

1. **Mock 데이터**: 백엔드가 실행되지 않으면 API 호출 실패
2. **이미지 업로드**: 파일 업로드 기능 미구현
3. **실시간 알림**: WebSocket 연동 필요
4. **지도 API**: Google Maps API 키 필요

## 📝 백엔드 요구사항

### CORS 설정
```java
@CrossOrigin(origins = "http://localhost:5173")
```

### JWT 토큰 형식
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": 1,
    "name": "사용자명",
    "email": "user@example.com",
    "role": "USER",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 페이지네이션 응답 형식
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

## 🚀 실행 방법

1. **백엔드 서버 시작**: `http://localhost:8080`
2. **프론트엔드 서버 시작**: `http://localhost:5173`
3. **브라우저에서 접속**: `http://localhost:5173`

모든 API 연동이 완료되어 백엔드만 실행하면 바로 동작합니다! 🎉