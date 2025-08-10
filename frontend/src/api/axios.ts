import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useApiMonitorStore } from '../store/apiMonitorStore';

// Axios 설정 타입 확장
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      requestId: string;
      startTime: number;
      logId: string;
    };
  }
}

// API Base URL - 환경 변수로 관리 (Vite 프록시 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Axios 인스턴스 생성
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const startTime = Date.now();
    
    // 토큰이 있으면 Authorization 헤더에 추가
    const { token, isAuthenticated } = useAuthStore.getState();
    
    console.log('🔍 Request interceptor - token:', token?.substring(0, 20) + '...', 'isAuthenticated:', isAuthenticated);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set:', config.headers.Authorization?.substring(0, 30) + '...');
    } else {
      console.log('❌ No token or headers, not setting Authorization');
    }
    
    // API 모니터링 로그 추가
    const { isEnabled, addLog } = useApiMonitorStore.getState();
    if (isEnabled) {
      const requestId = Math.random().toString(36).substring(7);
      config.metadata = { requestId, startTime, logId: `${requestId}-${startTime}` }; // 메타데이터 추가
      
      console.log('🔍 API Monitor - Adding request log:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL || ''}${config.url || ''}`,
        data: config.data,
        params: config.params
      });
      
      // 요청 로그 추가
      const logEntry = {
        method: config.method?.toUpperCase() || 'UNKNOWN',
        url: `${config.baseURL || ''}${config.url || ''}`,
        requestHeaders: { ...config.headers }, // 깊은 복사
        requestData: config.data ? JSON.parse(JSON.stringify(config.data)) : null, // 깊은 복사
        requestParams: config.params ? JSON.parse(JSON.stringify(config.params)) : null, // 깊은 복사
        requestId: requestId, // requestId 추가
        type: 'request' as const,
      };
      
      addLog(logEntry);
    }
    
    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // API 모니터링 로그 업데이트
    const { isEnabled, updateLogResponse } = useApiMonitorStore.getState();
    if (isEnabled && response.config.metadata) {
      const { requestId, startTime } = response.config.metadata;
      const duration = Date.now() - startTime;
      
      console.log('🔍 API Monitor - Updating response log:', {
        status: response.status,
        data: response.data,
        duration,
        url: response.config.url
      });
      
      // 응답 데이터 깊은 복사
      const responseData = response.data ? JSON.parse(JSON.stringify(response.data)) : null;
      
      // requestId를 사용해서 올바른 로그를 찾아서 업데이트
      updateLogResponse(requestId, responseData, response.status, duration);
    }
    
    // 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // API 모니터링 에러 로그 업데이트
    const { isEnabled, updateLogError } = useApiMonitorStore.getState();
    if (isEnabled && originalRequest.metadata) {
      const { requestId, startTime } = originalRequest.metadata;
      const duration = Date.now() - startTime;
      
      updateLogError(requestId, error.response?.data || error.message, error.response?.status, duration);
    }
    
    // 비로그인 상태에서 접근 가능한 API 엔드포인트 정의
    const publicEndpoints = [
      'places/search',
      'places/',
      'places',
      'courses/',
      'courses',
      'auth/login',
      'auth/signup',
      'auth/refresh'
    ];
    
    // 현재 요청이 public 엔드포인트인지 확인
    const requestUrl = originalRequest.url || '';
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      requestUrl.includes(endpoint)
    );
    
    if (import.meta.env.DEV) {
      console.log('🔎 Endpoint check:', {
        requestUrl,
        publicEndpoints,
        isPublicEndpoint
      });
    }
    
    // 401/403 에러 처리
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { refreshToken, logout, setToken, isAuthenticated } = useAuthStore.getState();
      
      // 디버깅 로그
      if (import.meta.env.DEV) {
        console.log('🔍 API Error Debug:', {
          url: originalRequest.url,
          status: error.response?.status,
          isPublicEndpoint,
          isAuthenticated,
          hasRefreshToken: !!refreshToken
        });
      }
      
      // Public endpoint는 인증 없이 접근 허용 (403/401 에러여도 토큰 없이 재시도)
      if (isPublicEndpoint) {
        console.log('🔓 Public endpoint - retrying without token');
        // 토큰 없이 재시도
        delete originalRequest.headers.Authorization;
        return api(originalRequest);
      }
      
      if (refreshToken) {
        try {
          // 토큰 재발급 요청
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data;
          setToken(accessToken);
          
          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // 리프레시 토큰도 만료된 경우
          console.error('Token refresh failed:', refreshError);
          
          // Public endpoint라면 토큰 없이 재시도 (이미 위에서 처리됨)
          if (isPublicEndpoint) {
            delete originalRequest.headers.Authorization;
            return api(originalRequest);
          }
          
          // Private endpoint라면 로그아웃
          console.log('🔐 Private endpoint - token refresh failed, redirecting to login');
          logout();
          window.location.href = '/login';
        }
      } else {
        // 리프레시 토큰이 없는 경우
        console.log('❌ No refresh token');
        
        // Public endpoint가 아닌 경우에만 로그아웃 처리
        if (!isPublicEndpoint) {
          console.log('🔐 Private endpoint - redirecting to login');
          logout();
          window.location.href = '/login';
        }
      }
    }
    
    // 에러 로깅
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        message: error.message,
        response: error.response?.data,
        requestData: error.config?.data, // 요청 데이터도 로깅
        requestParams: error.config?.params, // 요청 파라미터도 로깅
      });
    }
    
    return Promise.reject(error);
  }
);

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// API 에러 타입 정의
export interface ApiError {
  message: string;
  errorCode?: string;
  statusCode: number;
}

// 공통 API 요청 헬퍼 함수들
export const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.get(url, config).then(response => response.data),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.post(url, data, config).then(response => response.data),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.put(url, data, config).then(response => response.data),
    
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.patch(url, data, config).then(response => response.data),
    
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.delete(url, config).then(response => response.data),
    
  request: <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    api.request(config).then(response => response.data),
};

export default api;