import { apiRequest } from '../axios';
import { isTokenExpired, getTokenExpirationDate } from '../../utils/token';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  LoginResponse,
  User 
} from '../types';

export const authService = {
  // 로그인
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiRequest.post<LoginResponse>('/auth/login', credentials)
      .then(response => response.data),

  // 회원가입  
  register: (userData: RegisterRequest): Promise<User> =>
    apiRequest.post<User>('/auth/signup', userData)
      .then(response => response.data),

  // TODO: 백엔드에서 refresh token API 구현 후 활성화
  // refreshToken: (refreshToken: string): Promise<{ accessToken: string }> =>
  //   apiRequest.post<{ accessToken: string }>('/auth/refresh', { refreshToken })
  //     .then(response => response.data),

  // 로그아웃
  logout: (): Promise<void> =>
    apiRequest.post<void>('/auth/logout')
      .then(response => response.data),

  // 현재 사용자 정보 조회
  getCurrentUser: (): Promise<User> =>
    apiRequest.get<User>('/users/mypage')
      .then(response => response.data),

  // 구글 소셜 로그인
  googleLogin: (code: string): Promise<LoginResponse> =>
    apiRequest.get<LoginResponse>(`/auth/googlelogin?code=${encodeURIComponent(code)}`)
      .then(response => response.data),

  // 카카오 소셜 로그인
  kakaoLogin: (code: string): Promise<LoginResponse> =>
    apiRequest.get<LoginResponse>(`/auth/kakaologin?code=${encodeURIComponent(code)}`)
      .then(response => response.data),

  // TODO: 백엔드에서 비밀번호 관리 API들 구현 후 활성화
  // changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
  //   apiRequest.patch<void>('/auth/password', {
  //     currentPassword,
  //     newPassword
  //   }).then(response => response.data),

  // requestPasswordReset: (email: string): Promise<void> =>
  //   apiRequest.post<void>('/auth/password/reset-request', { email })
  //     .then(response => response.data),

  // resetPassword: (token: string, newPassword: string): Promise<void> =>
  //   apiRequest.post<void>('/auth/password/reset', {
  //     token,
  //     newPassword
  //   }).then(response => response.data),

  // checkEmailExists: (email: string): Promise<{ exists: boolean }> =>
  //   apiRequest.get<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`)
  //     .then(response => response.data),

  // updateProfile: (profileData: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> =>
  //   apiRequest.patch<User>('/auth/profile', profileData)
  //     .then(response => response.data),

  // deleteAccount: (): Promise<void> =>
  //   apiRequest.delete<void>('/auth/account')
  //     .then(response => response.data),

  // 토큰 유효성 검사 헬퍼 메서드
  validateToken: (token: string | null): boolean => {
    if (!token) return false;
    return !isTokenExpired(token);
  },

  // 토큰 만료 시간 확인
  getTokenExpiration: (token: string | null): Date | null => {
    return getTokenExpirationDate(token);
  },

  // 토큰이 곧 만료될지 확인 (로그인 연장 알림용)
  shouldRefreshToken: (token: string | null): boolean => {
    if (!token) return false;
    
    const expirationDate = getTokenExpirationDate(token);
    if (!expirationDate) return false;
    
    const now = new Date();
    const thirtyMinutes = 30 * 60 * 1000; // 30분
    
    return (expirationDate.getTime() - now.getTime()) < thirtyMinutes;
  },
};