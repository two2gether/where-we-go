import { apiRequest } from '../axios';
import type { 
  MyPageResponse,
  MyPageUpdateRequest,
  WithdrawRequest,
  Comment,
  PlaceReview,
  Notification,
  UserBookmarkList,
  CourseBookmark,
  CourseListResponse,
  CourseLike,
  PageResponse,
  Course
} from '../types';

export const userService = {
  // 마이페이지 조회
  getMyPage: (): Promise<MyPageResponse> =>
    apiRequest.get<MyPageResponse>('/users/mypage')
      .then(response => response.data),

  // 마이페이지 수정
  updateMyPage: (updateData: MyPageUpdateRequest): Promise<MyPageResponse> =>
    apiRequest.put<MyPageResponse>('/users/mypage', updateData)
      .then(response => response.data),

  // 회원 탈퇴
  withdraw: (withdrawData: WithdrawRequest): Promise<void> =>
    apiRequest.delete<void>('/users/withdraw', { data: withdrawData })
      .then(response => response.data),

  // 내가 작성한 댓글 목록
  getMyComments: (page: number = 0, size: number = 10): Promise<PageResponse<Comment>> =>
    apiRequest.get<PageResponse<Comment>>(`/users/mypage/comments?page=${page}&size=${size}&sort=createdAt,desc`)
      .then(response => response.data),

  // 내 장소 북마크 목록
  getMyBookmarks: (
    page: number = 0, 
    size: number = 20, 
    userLatitude?: number, 
    userLongitude?: number
  ): Promise<UserBookmarkList> => {
    let url = `/users/mypage/bookmarks?page=${page}&size=${size}`;
    if (userLatitude && userLongitude) {
      url += `&userLatitude=${userLatitude}&userLongitude=${userLongitude}`;
    }
    return apiRequest.get<UserBookmarkList>(url)
      .then(response => response.data);
  },

  // 내가 작성한 리뷰 목록
  getMyReviews: (page: number = 0, size: number = 10): Promise<PageResponse<PlaceReview>> =>
    apiRequest.get<PageResponse<PlaceReview>>(`/users/mypage/reviews?page=${page}&size=${size}`)
      .then(response => response.data),

  // 내가 만든 코스 목록
  getMyCourses: (page: number = 0, size: number = 20): Promise<PageResponse<CourseListResponse>> =>
    apiRequest.get<PageResponse<CourseListResponse>>(`/users/mypage/courses?page=${page}&size=${size}`)
      .then(response => response.data),

  // 내가 북마크한 코스 목록
  getMyCourseBookmarks: (page: number = 0, size: number = 20): Promise<PageResponse<CourseBookmark>> =>
    apiRequest.get<PageResponse<CourseBookmark>>(`/users/mypage/coursebookmark?page=${page}&size=${size}`)
      .then(response => response.data),

  // 내가 좋아요한 코스 목록
  getMyCourseLikes: (page: number = 0, size: number = 10): Promise<PageResponse<CourseLike>> =>
    apiRequest.get<PageResponse<CourseLike>>(`/users/mypage/likes?page=${page}&size=${size}`)
      .then(response => response.data),

  // 내 알림 목록
  getMyNotifications: (page: number = 0, size: number = 10): Promise<PageResponse<Notification>> =>
    apiRequest.get<PageResponse<Notification>>(`/users/mypage/notifications?page=${page}&size=${size}&sort=createdAt,desc`)
      .then(response => response.data),

  // 알림 읽음 처리
  markNotificationAsRead: (notificationId: number): Promise<Notification> =>
    apiRequest.patch<Notification>(`/users/mypage/notifications/${notificationId}`)
      .then(response => response.data),

  // 모든 알림 읽음 처리
  markAllNotificationsAsRead: (): Promise<void> =>
    apiRequest.patch<void>('/users/mypage/notifications/read-all')
      .then(response => response.data),

  // 읽지 않은 알림 개수
  getUnreadNotificationCount: (): Promise<{ count: number }> =>
    apiRequest.get<{ count: number }>('/users/mypage/notifications/unread-count')
      .then(response => response.data),
};