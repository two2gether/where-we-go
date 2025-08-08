import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// API 로그 타입 정의
export interface ApiLogEntry {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestHeaders?: Record<string, any>;
  requestData?: any;
  requestParams?: any;
  responseData?: any;
  error?: any;
  type: 'request' | 'response' | 'error';
  requestId?: string; // requestId 필드 추가
}

interface ApiMonitorState {
  isEnabled: boolean;
  isVisible: boolean;
  logs: ApiLogEntry[];
  maxLogs: number;
  filter: {
    method: string;
    status: string;
    search: string;
  };
}

interface ApiMonitorActions {
  toggleEnabled: () => void;
  toggleVisible: () => void;
  addLog: (log: Omit<ApiLogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setFilter: (filter: Partial<ApiMonitorState['filter']>) => void;
  updateLogResponse: (requestId: string, responseData: any, status: number, duration: number) => void;
  updateLogError: (requestId: string, error: any, status?: number, duration?: number) => void;
}

export const useApiMonitorStore = create<ApiMonitorState & ApiMonitorActions>()(
  persist(
    (set, get) => ({
      // Initial state
      isEnabled: import.meta.env.DEV, // 개발 환경에서만 기본 활성화
      isVisible: false,
      logs: [],
      maxLogs: 100, // 최대 100개까지만 저장
      filter: {
        method: 'ALL',
        status: 'ALL',
        search: '',
      },

      // Actions
      toggleEnabled: () => set((state) => ({ isEnabled: !state.isEnabled })),

      toggleVisible: () => set((state) => ({ isVisible: !state.isVisible })),

      addLog: (log) => {
        const id = Math.random().toString(36).substring(7);
        const timestamp = Date.now();
        const newLog = { ...log, id, timestamp };
        
        console.log('🔍 API Monitor Store - Adding log:', newLog);
        
        set((state) => {
          const newLogs = [newLog, ...state.logs].slice(0, state.maxLogs);
          console.log('🔍 API Monitor Store - Total logs:', newLogs.length);
          return { logs: newLogs };
        });
      },

      clearLogs: () => set({ logs: [] }),

      setFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter }
      })),

      updateLogResponse: (logId, responseData, status, duration) => {
        set((state) => {
          // logId로 정확한 로그를 찾아서 업데이트
          const logs = [...state.logs];
          const targetLogIndex = logs.findIndex((log) => 
            log.requestId === logId && log.type === 'request'
          );
          
          console.log('🔍 API Monitor Store - Updating response:', {
            logId,
            targetLogIndex,
            responseData,
            status,
            duration,
            totalLogs: logs.length
          });
          
          if (targetLogIndex !== -1) {
            const updatedLog = {
              ...logs[targetLogIndex],
              responseData,
              status,
              duration,
              type: status >= 400 ? 'error' : 'response' as const,
            };
            
            console.log('🔍 API Monitor Store - Updated log:', updatedLog);
            logs[targetLogIndex] = updatedLog;
          } else {
            console.warn(`🔍 API Monitor Store - No log found with logId: ${logId}`);
          }
          
          return { logs };
        });
      },

      updateLogError: (logId, error, status, duration) => {
        set((state) => {
          // logId로 정확한 로그를 찾아서 업데이트
          const logs = [...state.logs];
          const targetLogIndex = logs.findIndex((log) => 
            log.requestId === logId && log.type === 'request'
          );
          
          if (targetLogIndex !== -1) {
            logs[targetLogIndex] = {
              ...logs[targetLogIndex],
              error,
              status,
              duration,
              type: 'error' as const,
            };
          } else {
            console.warn(`🔍 API Monitor Store - No log found for error update with logId: ${logId}`);
          }
          
          return { logs };
        });
      },
    }),
    {
      name: 'api-monitor',
      partialize: (state) => ({
        isEnabled: state.isEnabled,
        maxLogs: state.maxLogs,
      }),
    }
  )
);