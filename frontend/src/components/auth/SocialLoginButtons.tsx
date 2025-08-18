import React from 'react';
import { startSocialLogin, socialLoginStorage, type SocialProvider } from '../../utils/socialLogin';

interface SocialLoginButtonsProps {
  /** 로그인 성공 후 리다이렉트할 URL (선택사항) */
  returnUrl?: string;
  /** 버튼들 사이의 간격 클래스 (기본값: 'space-y-3') */
  className?: string;
}

/**
 * 소셜 로그인 버튼들 컴포넌트
 * 구글과 카카오 소셜 로그인을 위한 버튼들을 제공합니다.
 */
const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  returnUrl, 
  className = 'space-y-3' 
}) => {
  const handleSocialLogin = (provider: SocialProvider) => {
    try {
      // 리턴 URL 저장 (있는 경우)
      if (returnUrl) {
        socialLoginStorage.setReturnUrl(returnUrl);
      }
      
      // 사용된 소셜 제공업체 저장
      socialLoginStorage.setProvider(provider);
      
      // 소셜 로그인 시작 (OAuth 페이지로 리다이렉트)
      startSocialLogin(provider);
    } catch (error: any) {
      console.error(`${provider} 로그인 오류:`, error);
      alert(error.message || '소셜 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={className}>
      {/* 구글 로그인 버튼 */}
      <button
        onClick={() => handleSocialLogin('google')}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        구글로 로그인
      </button>

      {/* 카카오 로그인 버튼 */}
      <button
        onClick={() => handleSocialLogin('kakao')}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-yellow-400 text-sm font-medium text-gray-900 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm2.5 6.5h-5a.5.5 0 0 0 0 1h2v.5a.5.5 0 0 0 1 0V10h2a.5.5 0 0 0 0-1zm-2.5 2.5c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5z"/>
        </svg>
        카카오로 로그인
      </button>
      
      {/* 환경변수 설정 안내 (개발 환경에서만) */}
      {import.meta.env.DEV && (
        (!import.meta.env.VITE_GOOGLE_CLIENT_ID || !import.meta.env.VITE_KAKAO_CLIENT_ID) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>개발자 안내:</strong> 소셜 로그인을 사용하려면 다음 환경변수를 설정하세요:
            </p>
            <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
              {!import.meta.env.VITE_GOOGLE_CLIENT_ID && <li>VITE_GOOGLE_CLIENT_ID</li>}
              {!import.meta.env.VITE_KAKAO_CLIENT_ID && <li>VITE_KAKAO_CLIENT_ID</li>}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default SocialLoginButtons;