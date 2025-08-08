import { apiRequest } from '../axios';
import type {
  Notification,
  NotificationRequest,
  PageResponse,
  PaginationParams
} from '../types';

export const notificationService = {
  // 알림 목록 조회
  getNotifications: (params: PaginationParams = {}): Promise<PageResponse<Notification>> =>
    apiRequest.get<PageResponse<Notification>>('/notifications', {
      params: {
        page: (params.page || 0) + 1, // 백엔드는 1부터 시작
        size: params.size || 20
      }
    }).then(response => response.data),

  // 읽지 않은 알림 개수 조회
  getUnreadCount: (): Promise<number> =>
    apiRequest.get<{ count: number }>('/notifications/unread/count')
      .then(response => response.data.count),

  // 알림 읽음 처리
  markAsRead: (notificationId: number): Promise<void> =>
    apiRequest.put<void>(`/notifications/${notificationId}/read`)
      .then(response => response.data),

  // 모든 알림 읽음 처리
  markAllAsRead: (): Promise<void> =>
    apiRequest.put<void>('/notifications/read-all')
      .then(response => response.data),

  // 알림 삭제
  deleteNotification: (notificationId: number): Promise<void> =>
    apiRequest.delete<void>(`/notifications/${notificationId}`)
      .then(response => response.data),

  // 모든 알림 삭제
  deleteAllNotifications: (): Promise<void> =>
    apiRequest.delete<void>('/notifications/all')
      .then(response => response.data),

  // 알림 설정 조회
  getNotificationSettings: (): Promise<NotificationRequest> =>
    apiRequest.get<NotificationRequest>('/notifications/settings')
      .then(response => response.data),

  // 알림 설정 업데이트
  updateNotificationSettings: (settings: NotificationRequest): Promise<NotificationRequest> =>
    apiRequest.put<NotificationRequest>('/notifications/settings', settings)
      .then(response => response.data),

  // 특정 타입의 알림 조회
  getNotificationsByType: (type: string, params: PaginationParams = {}): Promise<PageResponse<Notification>> =>
    apiRequest.get<PageResponse<Notification>>(`/notifications/type/${type}`, {
      params: {
        page: (params.page || 0) + 1,
        size: params.size || 20
      }
    }).then(response => response.data),

  // 최근 알림 조회 (상위 N개)
  getRecentNotifications: (limit: number = 5): Promise<Notification[]> =>
    apiRequest.get<Notification[]>(`/notifications/recent?limit=${limit}`)
      .then(response => response.data),
};