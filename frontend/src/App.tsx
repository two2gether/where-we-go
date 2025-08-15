import React, { useEffect } from 'react';

import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { useLocationStore } from './store/locationStore';
import { initKakaoSDK } from './utils/kakaoInit';
import ApiMonitorPanel from './components/common/ApiMonitorPanel';
import ApiMonitorButton from './components/common/ApiMonitorButton';
import TokenValidator from './components/auth/TokenValidator';

export const App: React.FC = () => {
  const { user, isAuthenticated, loading, setLoading } = useAuthStore();
  const { theme } = useUIStore();
  const { lastUpdated } = useLocationStore();

  // Initialize authentication state, Kakao SDK, and location on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // Initialize Kakao SDK
        initKakaoSDK();

        // Check if user is stored in localStorage and token is valid
        const { token, isAuthenticated, checkTokenExpiration } = useAuthStore.getState();
        try {
          // 토큰이 있고 인증된 상태인 경우에만 검증
          if (token && isAuthenticated) {
            const isValidToken = checkTokenExpiration();
            if (isValidToken) {
              console.log('Auth session validated successfully');
            } else {
              console.log('Auth session validation failed - token expired');
            }
          } else {
            console.log('No authentication state to validate');
          }
        } catch (error) {
          console.error('Session validation error:', error);
          // 오류 시에도 앱 로딩을 계속 진행
        }

        // Initialize location if permission was previously granted and data exists
        const { latitude, longitude, isPermissionGranted } = useLocationStore.getState();
        if (isPermissionGranted && (!latitude || !longitude || !lastUpdated)) {
          // 권한이 있지만 위치 데이터가 없거나 오래된 경우 자동 갱신
          const now = Date.now();
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (!lastUpdated || (now - lastUpdated > thirtyMinutes)) {
            try {
              await useLocationStore.getState().requestLocation();
              console.log('Location initialized from previous permission');
            } catch (error) {
              console.log('Failed to initialize location:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [setLoading]);

  // Handle authentication across tabs (TokenValidator now handles most of this)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'where-we-go-auth') {
        // Reload the page if auth state changes in another tab
        if (!e.newValue && isAuthenticated) {
          // User logged out in another tab
          window.location.reload();
        } else if (e.newValue && !isAuthenticated) {
          // User logged in in another tab
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  // Update document title based on auth state
  useEffect(() => {
    const baseTitle = 'Where We Go';
    const userTitle = user ? ` - ${user.name}님` : '';
    document.title = `${baseTitle}${userTitle}`;
  }, [user]);

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }
  }, [theme]);

  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" aria-label="앱 로딩 중" />
          <p className="text-gray-600 text-sm">Where We Go를 시작하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* 토큰 유효성 검증기 - 전역 토큰 만료 감지 및 자동 로그아웃 */}
      <TokenValidator />
      
      <AppRouter />
      
      {/* API 모니터링 컴포넌트들 (개발 환경에서만) */}
      {import.meta.env.DEV && (
        <>
          <ApiMonitorButton />
          <ApiMonitorPanel />
        </>
      )}
    </div>
  );
};