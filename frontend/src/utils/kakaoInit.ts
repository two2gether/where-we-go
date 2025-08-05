// 카카오 SDK 초기화 유틸리티

export const initKakaoSDK = () => {
  if (typeof window !== 'undefined' && window.Kakao) {
    // 카카오 SDK가 이미 초기화되어 있는지 확인
    if (!window.Kakao.isInitialized()) {
      // 환경변수에서 카카오 앱 키 가져오기
      const kakaoAppKey = import.meta.env.VITE_KAKAO_APP_KEY;
      
      if (kakaoAppKey) {
        window.Kakao.init(kakaoAppKey);
        console.log('Kakao SDK initialized successfully');
      } else {
        console.warn('Kakao app key not found in environment variables');
      }
    }
  } else {
    console.warn('Kakao SDK not loaded');
  }
};

// 카카오 SDK 로드 상태 확인
export const isKakaoSDKLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.Kakao;
};

// 카카오 SDK 초기화 상태 확인
export const isKakaoSDKInitialized = (): boolean => {
  return isKakaoSDKLoaded() && window.Kakao.isInitialized();
};