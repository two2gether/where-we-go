import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../api/services';
import { useAuthStore } from '../../store/authStore';
import { extractAuthCodeFromUrl, extractAuthErrorFromUrl, socialLoginStorage, getProviderDisplayName } from '../../utils/socialLogin';
import type { SocialProvider } from '../../utils/socialLogin';

/**
 * 소셜 로그인 콜백 처리 컴포넌트
 * OAuth 제공업체에서 리다이렉트된 후 인증 코드를 처리합니다.
 */
const SocialLoginCallback: React.FC = () => {
  const { provider } = useParams<{ provider: SocialProvider }>();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isProcessingRef = useRef(false); // React Strict Mode 대응

  useEffect(() => {
    // 시작할 때 이전 처리 기록들 정리
    const cleanupOldProcessedCodes = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('social_login_processed_')) {
          localStorage.removeItem(key);
        }
      });
    };
    cleanupOldProcessedCodes();

    const handleSocialLogin = async () => {
      if (isProcessingRef.current) {
        return;
      }

      if (!provider) {
        setStatus('error');
        setErrorMessage('잘못된 소셜 로그인 제공업체입니다.');
        return;
      }

      // 카카오 로그인 비활성화
      if (provider === 'kakao') {
        setStatus('error');
        setErrorMessage('카카오 로그인은 현재 지원하지 않습니다.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
        return;
      }

      // URL에서 인증 코드 추출
      const code = extractAuthCodeFromUrl();
      
      if (!code) {
        setStatus('error');
        setErrorMessage('인증 코드를 받지 못했습니다. 다시 시도해주세요.');
        return;
      }

      // 이미 처리된 코드인지 확인 (localStorage 기반)
      const processedCodeKey = `social_login_processed_${code}`;
      const isAlreadyProcessed = localStorage.getItem(processedCodeKey);
      
      if (isAlreadyProcessed) {
        localStorage.removeItem(processedCodeKey);
      }

      try {
        isProcessingRef.current = true;
        localStorage.setItem(processedCodeKey, 'true');

        // URL에서 에러 먼저 확인
        const { error, errorDescription } = extractAuthErrorFromUrl();
        if (error) {
          throw new Error(errorDescription || `소셜 로그인이 취소되었거나 실패했습니다: ${error}`);
        }

        // 백엔드 콜백 API 호출 (구글만)
        const response = await authService.googleLogin(code);
        
        // 토큰 추출
        const token = response.token || response.data?.token;
        
        if (!token) {
          throw new Error(`로그인 응답에서 토큰을 받지 못했습니다.`);
        }

        // 토큰을 먼저 AuthStore에 저장
        const { setToken } = useAuthStore.getState();
        setToken(token);
        
        // 토큰이 적용될 수 있도록 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 100));

        // 사용자 정보 조회
        const userResponse = await authService.getCurrentUser();
        
        // 로그인 상태 업데이트
        login(userResponse.data || userResponse, token);

        setStatus('success');

        // 리다이렉트 URL이 있으면 해당 페이지로, 없으면 홈으로
        const returnUrl = socialLoginStorage.getReturnUrl() || '/';
        socialLoginStorage.clearReturnUrl();
        socialLoginStorage.clearProvider();

        // 3초 후 리다이렉트
        setTimeout(() => {
          navigate(returnUrl, { replace: true });
        }, 3000);

      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || '소셜 로그인 중 오류가 발생했습니다.');
        
        // 실패한 코드 처리 기록 제거
        localStorage.removeItem(processedCodeKey);
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } finally {
        isProcessingRef.current = false;
      }
    };

    handleSocialLogin();
  }, [provider, navigate, login]);

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {provider ? `${getProviderDisplayName(provider)} 로그인 처리 중...` : '소셜 로그인 처리 중...'}
          </p>
          <p className="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 성공 상태
  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">로그인 성공!</h2>
          <p className="mt-2 text-gray-600">
            {provider && `${getProviderDisplayName(provider)} 계정으로 성공적으로 로그인되었습니다.`}
          </p>
          <p className="mt-2 text-sm text-gray-500">잠시 후 페이지가 이동됩니다...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">로그인 실패</h2>
        <p className="mt-2 text-gray-600">{errorMessage}</p>
        <p className="mt-4 text-sm text-gray-500">3초 후 로그인 페이지로 이동됩니다...</p>
        <button 
          onClick={() => navigate('/login', { replace: true })}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          로그인 페이지로 이동
        </button>
      </div>
    </div>
  );
};

export default SocialLoginCallback;