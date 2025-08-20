import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../api/services/notification.service';
import type {
  Notification,
  NotificationRequest,
  PageResponse,
  PaginationParams
} from '../api/types';

// 알림 목록 조회
export const useNotifications = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 읽지 않은 알림 개수 조회
export const useUnreadNotificationCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled, // 인증된 사용자에게만 호출
    staleTime: 30 * 1000, // 30초
    refetchInterval: enabled ? 60 * 1000 : false, // 인증된 사용자만 자동 갱신
  });
};

// 알림 읽음 처리
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: number) => notificationService.markAsRead(notificationId),
    onSuccess: (updatedNotification, notificationId) => {
      // 모든 notifications 관련 캐시 무효화 (queryKey 불일치 문제 해결)
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    }
  });
};


// 알림 삭제
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: number) => notificationService.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // 알림 목록에서 해당 알림 제거
      queryClient.setQueriesData<PageResponse<Notification>>(
        { queryKey: ['notifications'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            content: oldData.content.filter(notification => 
              notification.notificationId !== notificationId
            ),
            totalElements: oldData.totalElements - 1
          };
        }
      );
      
      // 읽지 않은 알림 개수 갱신
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
    }
  });
};

// 모든 알림 삭제
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(),
    onSuccess: () => {
      // 모든 알림 관련 캐시 초기화
      queryClient.setQueriesData<PageResponse<Notification>>(
        { queryKey: ['notifications'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            content: [],
            totalElements: 0,
            totalPages: 0
          };
        }
      );
      
      queryClient.setQueryData(['notifications', 'unread-count'], 0);
    },
    onError: (error) => {
      console.error('Failed to delete all notifications:', error);
    }
  });
};

// 알림 설정 조회
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notifications', 'settings'],
    queryFn: () => notificationService.getNotificationSettings(),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 알림 설정 업데이트
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: NotificationRequest) => notificationService.updateNotificationSettings(settings),
    onSuccess: (updatedSettings) => {
      // 설정 캐시 업데이트
      queryClient.setQueryData(['notifications', 'settings'], updatedSettings);
    },
    onError: (error) => {
      console.error('Failed to update notification settings:', error);
    }
  });
};

// 특정 타입의 알림 조회
export const useNotificationsByType = (type: string, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['notifications', 'type', type, params],
    queryFn: () => notificationService.getNotificationsByType(type, params),
    enabled: !!type,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 최근 알림 조회
export const useRecentNotifications = (limit: number = 5) => {
  return useQuery({
    queryKey: ['notifications', 'recent', limit],
    queryFn: () => notificationService.getRecentNotifications(limit),
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 2 * 60 * 1000, // 2분마다 자동 갱신
  });
};