import React, { useEffect } from 'react';

import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

export const App: React.FC = () => {
  const { user, isAuthenticated, loading, setLoading } = useAuthStore();
  const { theme } = useUIStore();

  // Initialize authentication state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // Check if user is stored in localStorage and token is valid
        const storedAuth = localStorage.getItem('where-we-go-auth');
        if (storedAuth) {
          const { state } = JSON.parse(storedAuth);
          if (state.token && state.user) {
            // Verify token validity with a simple API call
            // This will be handled by the axios interceptor
            try {
              // The token will be automatically attached by the store
              // If it's invalid, the interceptor will handle refresh or logout
              console.log('Auth initialized from storage');
            } catch (error) {
              console.error('Token validation failed:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setLoading]);

  // Handle authentication across tabs
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

    const handleLogoutEvent = () => {
      // Handle logout event from other tabs
      if (isAuthenticated) {
        window.location.href = '/login';
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogoutEvent);
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
      <AppRouter />
    </div>
  );
};