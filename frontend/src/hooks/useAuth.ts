import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest, User } from '../api/types';

// Query Keys
export const authKeys = {
  me: ['auth', 'me'] as const,
  all: ['auth'] as const,
};

// 현재 사용자 정보 조회
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5분
    retry: false,
  });
};

// 로그인
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // 1. 로그인하여 토큰 받기
      const loginResponse = await authService.login(credentials);
      
      console.log('✅ Login API success, token:', loginResponse.token);
      
      // 2. 토큰 저장
      setToken(loginResponse.token);
      
      console.log('🔧 Token saved, waiting for next tick...');
      
      // 3. 토큰이 적용될 수 있도록 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🚀 About to call getCurrentUser...');
      
      // 4. 사용자 정보 조회
      const userInfo = await authService.getCurrentUser();
      
      console.log('✅ getCurrentUser success:', userInfo);
      
      return {
        user: userInfo,
        accessToken: loginResponse.token,
        refreshToken: '',
      };
    },
    onSuccess: (data) => {
      setUser(data.user);
      setRefreshToken(data.refreshToken);
      
      // 사용자 정보 캐시 업데이트
      queryClient.setQueryData(authKeys.me, data.user);
      
      // 다른 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'my'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// 회원가입
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      // 회원가입 성공
      console.log('Registration successful:', data);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};

// 로그아웃
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout: logoutStore } = useAuthStore();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logoutStore();
      
      // 모든 캐시 클리어
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // 에러가 발생해도 로컬 로그아웃 처리
      logoutStore();
      queryClient.clear();
    },
  });
};

// 프로필 업데이트
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (profileData: Partial<Pick<User, 'name' | 'avatar'>>) =>
      authService.updateProfile(profileData),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      
      // 캐시 업데이트
      queryClient.setQueryData(authKeys.me, updatedUser);
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

// 비밀번호 변경
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onError: (error) => {
      console.error('Password change failed:', error);
    },
  });
};

// 비밀번호 재설정 요청
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
    onError: (error) => {
      console.error('Password reset request failed:', error);
    },
  });
};

// 이메일 중복 확인
export const useCheckEmailExists = () => {
  return useMutation({
    mutationFn: (email: string) => authService.checkEmailExists(email),
    onError: (error) => {
      console.error('Email check failed:', error);
    },
  });
};