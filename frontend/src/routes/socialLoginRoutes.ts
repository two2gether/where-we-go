/**
 * 소셜 로그인 라우팅 설정 가이드
 * 
 * React Router에 다음 라우트들을 추가해야 합니다:
 */

/*
// App.tsx 또는 라우터 설정 파일에 추가

import SocialLoginCallback from './components/auth/SocialLoginCallback';

// 라우트 설정 예시
const routes = [
  // ... 기존 라우트들
  
  // 소셜 로그인 콜백 라우트
  {
    path: '/auth/:provider/callback',
    element: <SocialLoginCallback />,
  },
  
  // 또는 개별적으로
  {
    path: '/auth/google/callback',
    element: <SocialLoginCallback />,
  },
  {
    path: '/auth/kakao/callback',
    element: <SocialLoginCallback />,
  },
];
*/

/**
 * 환경변수 설정 가이드
 * 
 * .env 파일에 다음 환경변수들을 추가하세요:
 */

/*
# Google OAuth 설정
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Kakao OAuth 설정  
VITE_KAKAO_CLIENT_ID=your_kakao_client_id_here
VITE_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback

# 백엔드 API URL (이미 설정되어 있을 것)
VITE_API_BASE_URL=http://localhost:8080
*/

/**
 * 사용법 예시
 */

/*
// 로그인 페이지에서 소셜 로그인 버튼 사용
import SocialLoginButtons from './components/auth/SocialLoginButtons';

function LoginPage() {
  return (
    <div>
      // ... 기존 로그인 폼
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <div className="mt-6">
          <SocialLoginButtons returnUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}
*/

/**
 * OAuth 애플리케이션 설정 (개발자 콘솔에서)
 * 
 * Google Cloud Console:
 * 1. https://console.cloud.google.com/ 에서 프로젝트 생성
 * 2. OAuth 2.0 클라이언트 ID 생성
 * 3. 승인된 리디렉션 URI 추가:
 *    - http://localhost:3000/auth/google/callback (개발)
 *    - https://yourdomain.com/auth/google/callback (프로덕션)
 * 
 * Kakao Developers:
 * 1. https://developers.kakao.com/ 에서 앱 생성
 * 2. 플랫폼 등록 > Web 플랫폼 추가
 * 3. Redirect URI 등록:
 *    - http://localhost:3000/auth/kakao/callback (개발)  
 *    - https://yourdomain.com/auth/kakao/callback (프로덕션)
 * 4. 동의 항목 설정: 닉네임, 이메일 등 필요한 정보 선택
 */

export {}; // 모듈로 인식되도록