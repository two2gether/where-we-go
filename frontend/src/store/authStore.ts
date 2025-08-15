import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/types';
import { isTokenExpired, isTokenExpiringSoon } from '../utils/token';

// Types (User는 types.ts에서 import)

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  lastLoginTime: number | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkTokenExpiration: () => boolean; // 토큰 만료 검사
  validateCurrentSession: () => Promise<boolean>; // 현재 세션 유효성 검사
}

// Store
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      lastLoginTime: null,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setToken: (token) => set({ 
        token,
        isAuthenticated: !!token 
      }),

      setRefreshToken: (refreshToken) => set({ refreshToken }),
      
      setLoading: (loading) => set({ loading }),

      login: (user, token, refreshToken = null) => set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        lastLoginTime: Date.now(),
      }),
      
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastLoginTime: null,
        });
        
        // Dispatch logout event for other tabs
        window.dispatchEvent(new CustomEvent('logout'));
      },

      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),

      // 토큰 만료 검사 - 클라이언트 사이드에서 JWT 토큰 만료 여부 확인
      checkTokenExpiration: () => {
        const { token } = useAuthStore.getState();
        
        if (!token) {
          return false; // 토큰이 없으면 만료된 것으로 간주
        }

        const expired = isTokenExpired(token);
        
        // 토큰이 만료된 경우 자동 로그아웃
        if (expired) {
          console.warn('Token expired, logging out automatically');
          useAuthStore.getState().logout();
          return false;
        }

        return true; // 토큰이 유효함
      },

      // 현재 세션 유효성 검사 - 토큰과 사용자 정보 모두 검증
      validateCurrentSession: async () => {
        const { token, user, isAuthenticated } = useAuthStore.getState();
        
        try {
          // 기본 상태 검사
          if (!token || !user || !isAuthenticated) {
            console.log('Session validation failed: missing token, user, or auth state');
            useAuthStore.getState().logout();
            return false;
          }

          // 토큰 만료 검사
          if (isTokenExpired(token)) {
            console.warn('Session validation failed: token expired');
            useAuthStore.getState().logout();
            return false;
          }

          // 토큰이 곧 만료될 예정인지 확인 (30분 이내)
          if (isTokenExpiringSoon(token)) {
            console.warn('Token will expire soon (within 30 minutes)');
            // 토큰 갱신 로직이 필요한 경우 여기에 추가
            // TODO: 자동 토큰 갱신 구현
          }

          return true; // 세션이 유효함
        } catch (error) {
          console.error('Session validation error:', error);
          useAuthStore.getState().logout();
          return false;
        }
      },
    }),
    {
      name: 'where-we-go-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
      }),
    }
  )
);