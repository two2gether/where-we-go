import { apiRequest } from '../axios';
import type {
  Notification,
  NotificationRequest,
  PageResponse,
  PaginationParams
} from '../types';

export const notificationService = {
  // 알림 목록 조회 - apiRequest가 이미 래퍼 처리함
  getNotifications: (params: PaginationParams = {}): Promise<PageResponse<Notification>> =>
    apiRequest.get<any>('/users/mypage/notifications', {
      params: {
        page: params.page || 0, // Spring Data는 0부터 시작
        size: params.size || 10,
        sort: 'createdAt,desc'
      }
    }).then(response => {
      // apiRequest가 이미 response.data를 반환하므로 한번만 .data 접근
      return response.data;
    }),

  // 읽지 않은 알림 개수 조회 - apiRequest가 이미 래퍼 처리함
  getUnreadCount: (): Promise<number> =>
    apiRequest.get<any>('/notifications/unread-count')
      .then(response => {
        // apiRequest가 이미 response.data를 반환하므로 한번만 .data 접근
        return response.data || 0;
      }),

  // 알림 읽음 처리 - 백엔드가 직접 NotificationResponseDto를 반환
  markAsRead: (notificationId: number): Promise<Notification> =>
    apiRequest.patch<Notification>(`/users/mypage/notifications/${notificationId}`)
      .then(response => response.data),


  // 읽은 알림 전체 삭제 - apiRequest가 이미 래퍼 처리함
  deleteReadNotifications: (): Promise<void> =>
    apiRequest.delete<any>('/users/mypage/notifications/read')
      .then(response => response.data),

};