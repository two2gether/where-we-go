import { apiRequest } from '../axios';
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

  // 토큰 갱신
  refreshToken: (refreshToken: string): Promise<{ accessToken: string }> =>
    apiRequest.post<{ accessToken: string }>('/auth/refresh', { refreshToken })
      .then(response => response.data),

  // 로그아웃
  logout: (): Promise<void> =>
    apiRequest.post<void>('/auth/logout')
      .then(response => response.data),

  // 현재 사용자 정보 조회
  getCurrentUser: (): Promise<User> =>
    apiRequest.get<User>('/users/mypage')
      .then(response => response.data),

  // 비밀번호 변경
  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    apiRequest.patch<void>('/auth/password', {
      currentPassword,
      newPassword
    }).then(response => response.data),

  // 비밀번호 재설정 요청
  requestPasswordReset: (email: string): Promise<void> =>
    apiRequest.post<void>('/auth/password/reset-request', { email })
      .then(response => response.data),

  // 비밀번호 재설정
  resetPassword: (token: string, newPassword: string): Promise<void> =>
    apiRequest.post<void>('/auth/password/reset', {
      token,
      newPassword
    }).then(response => response.data),

  // 이메일 중복 확인
  checkEmailExists: (email: string): Promise<{ exists: boolean }> =>
    apiRequest.get<{ exists: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`)
      .then(response => response.data),

  // 사용자 프로필 업데이트
  updateProfile: (profileData: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> =>
    apiRequest.patch<User>('/auth/profile', profileData)
      .then(response => response.data),

  // 계정 탈퇴
  deleteAccount: (): Promise<void> =>
    apiRequest.delete<void>('/auth/account')
      .then(response => response.data),
};