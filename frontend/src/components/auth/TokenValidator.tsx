import React, { useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { isTokenExpired } from '../../utils/token';

/**
 * TokenValidator - 토큰 만료 검증 및 자동 로그아웃 처리
 * 앱 전체에서 토큰 상태를 모니터링하고 만료된 토큰 감지 시 자동 로그아웃
 */
export const TokenValidator: React.FC = () => {
  const { checkTokenExpiration, validateCurrentSession, isAuthenticated, token, logout } = useAuthStore();

  // 토큰 유효성 검사 함수
  const validateToken = useCallback(async () => {
    // 인증되지 않은 상태나 토큰이 없으면 검사하지 않음
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      // 클라이언트 사이드 토큰 만료 검사
      const isValid = checkTokenExpiration();
      
      if (!isValid) {
        console.log('Token validation failed - user logged out');
        return;
      }

      // 전체 세션 유효성 검사는 덜 빈번하게 수행
      // 주기적 검사에서만 수행하고 페이지 포커스에서는 생략
    } catch (error) {
      console.error('Token validation error:', error);
      // 검증 실패 시에도 즉시 로그아웃하지 않고 다음 검증까지 대기
    }
  }, [isAuthenticated, token, checkTokenExpiration]);

  // 페이지 포커스 시 토큰 검사
  useEffect(() => {
    const handleFocus = () => {
      validateToken();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [validateToken]);

  // 페이지 가시성 변경 시 토큰 검사
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateToken();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [validateToken]);

  // 주기적 토큰 검사 (5분마다)
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      validateToken();
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
  }, [isAuthenticated, validateToken]);

  // 초기 마운트 시 토큰 검사
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  // localStorage 변경 감지 (다른 탭에서 로그아웃한 경우)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'where-we-go-auth' && e.newValue === null) {
        // 다른 탭에서 로그아웃한 경우
        logout();
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [logout]);

  // 커스텀 로그아웃 이벤트 감지 (같은 탭에서의 로그아웃)
  useEffect(() => {
    const handleLogout = () => {
      // 현재 페이지가 로그인이 필요한 페이지인지 확인
      const protectedPaths = ['/my-courses', '/my-hotdeals', '/profile'];
      const currentPath = window.location.pathname;
      
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        window.location.href = '/login';
      }
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default TokenValidator;