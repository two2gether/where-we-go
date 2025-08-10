import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Query Client 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 쿼리 옵션
      staleTime: 5 * 60 * 1000, // 5분
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // 401, 403 에러는 재시도하지 않음
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // 네트워크 에러는 최대 3번 재시도
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 기본 뮤테이션 옵션
      retry: false,
      onError: (error: any) => {
        console.error('Mutation error:', error);
        
        // 전역 에러 처리
        if (error?.response?.status === 401) {
          // 인증 에러 처리는 axios 인터셉터에서 처리됨
          return;
        }
        
        // 기타 에러에 대한 사용자 알림 (토스트 등)
        // Toast notification implementation pending
      },
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="top-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

export { queryClient };