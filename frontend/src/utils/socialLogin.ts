/**
 * 소셜 로그인 유틸리티 함수들
 * 구글과 카카오 OAuth 로그인을 위한 헬퍼 함수들을 제공합니다.
 */

// 소셜 로그인 제공업체 타입
export type SocialProvider = 'google' | 'kakao';

// 소셜 로그인 설정
interface SocialLoginConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scope: string;
  };
  kakao: {
    clientId: string;
    redirectUri: string;
  };
}

// 환경변수에서 소셜 로그인 설정 가져오기
const getSocialConfig = (): SocialLoginConfig => {
  // 프론트엔드 콜백 페이지로 설정 (SPA 방식)
  const frontendBaseUrl = window.location.origin;
  
  return {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${frontendBaseUrl}/auth/google/callback`,
      scope: 'openid profile email'
    },
    kakao: {
      clientId: import.meta.env.VITE_KAKAO_CLIENT_ID || '',
      redirectUri: import.meta.env.VITE_KAKAO_REDIRECT_URI || `${frontendBaseUrl}/auth/kakao/callback`
    }
  };
};

/**
 * 구글 OAuth 로그인 URL 생성
 */
export const getGoogleLoginUrl = (): string => {
  const config = getSocialConfig().google;
  
  if (!config.clientId) {
    throw new Error('Google Client ID가 설정되지 않았습니다. 환경변수 VITE_GOOGLE_CLIENT_ID를 확인하세요.');
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * 카카오 OAuth 로그인 URL 생성
 */
export const getKakaoLoginUrl = (): string => {
  const config = getSocialConfig().kakao;
  
  if (!config.clientId) {
    throw new Error('Kakao Client ID가 설정되지 않았습니다. 환경변수 VITE_KAKAO_CLIENT_ID를 확인하세요.');
  }

  console.log('카카오 로그인 설정:', {
    clientId: config.clientId,
    redirectUri: config.redirectUri
  });

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code'
    // scope 제거 - 카카오는 동의항목에서 설정하므로 불필요할 수 있음
  });

  const loginUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  console.log('카카오 로그인 URL:', loginUrl);
  console.log('카카오 로그인 파라미터:', {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code'
  });
  
  return loginUrl;
};

/**
 * 소셜 로그인 시작 - 새 창에서 OAuth 인증 페이지 열기
 */
export const startSocialLogin = (provider: SocialProvider): void => {
  let loginUrl: string;
  
  switch (provider) {
    case 'google':
      loginUrl = getGoogleLoginUrl();
      break;
    case 'kakao':
      loginUrl = getKakaoLoginUrl();
      break;
    default:
      throw new Error(`지원하지 않는 소셜 로그인 제공업체입니다: ${provider}`);
  }
  
  // 현재 창에서 소셜 로그인 페이지로 리다이렉트
  window.location.href = loginUrl;
};

/**
 * URL에서 인증 코드 추출
 * OAuth 콜백 페이지에서 사용됩니다.
 */
export const extractAuthCodeFromUrl = (url: string = window.location.href): string | null => {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('code');
};

/**
 * URL에서 에러 정보 추출
 * OAuth 콜백 페이지에서 에러 처리에 사용됩니다.
 */
export const extractAuthErrorFromUrl = (url: string = window.location.href): { error?: string; errorDescription?: string } => {
  const urlParams = new URLSearchParams(new URL(url).search);
  return {
    error: urlParams.get('error') || undefined,
    errorDescription: urlParams.get('error_description') || undefined
  };
};

/**
 * 소셜 로그인 제공업체 이름을 한글로 변환
 */
export const getProviderDisplayName = (provider: SocialProvider): string => {
  switch (provider) {
    case 'google':
      return '구글';
    case 'kakao':
      return '카카오';
    default:
      return provider;
  }
};

/**
 * 로컬 스토리지에서 소셜 로그인 상태 관리
 */
export const socialLoginStorage = {
  setProvider: (provider: SocialProvider) => {
    localStorage.setItem('socialLoginProvider', provider);
  },
  
  getProvider: (): SocialProvider | null => {
    return localStorage.getItem('socialLoginProvider') as SocialProvider | null;
  },
  
  clearProvider: () => {
    localStorage.removeItem('socialLoginProvider');
  },
  
  setReturnUrl: (url: string) => {
    localStorage.setItem('socialLoginReturnUrl', url);
  },
  
  getReturnUrl: (): string | null => {
    return localStorage.getItem('socialLoginReturnUrl');
  },
  
  clearReturnUrl: () => {
    localStorage.removeItem('socialLoginReturnUrl');
  }
};