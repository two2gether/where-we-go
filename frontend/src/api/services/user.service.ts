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
  UserCourseBookmarkListDto,
  CourseListResponse,
  CourseLike,
  PageResponse,
  Course
} from '../types';

export const userService = {
  // 마이페이지 조회 - apiRequest가 이미 래퍼 처리함
  getMyPage: (): Promise<MyPageResponse> =>
    apiRequest.get<any>('/users/mypage')
      .then(response => response.data),

  // 마이페이지 수정 - apiRequest가 이미 래퍼 처리함
  updateMyPage: (updateData: MyPageUpdateRequest): Promise<MyPageResponse> =>
    apiRequest.put<any>('/users/mypage', updateData)
      .then(response => response.data),

  // 회원 탈퇴
  withdraw: (withdrawData: WithdrawRequest): Promise<void> =>
    apiRequest.delete<void>('/users/withdraw', { data: withdrawData })
      .then(response => response.data),

  // 내가 작성한 댓글 목록 - apiRequest가 이미 래퍼 처리함
  getMyComments: (page: number = 0, size: number = 10): Promise<PageResponse<Comment>> =>
    apiRequest.get<any>(`/users/mypage/comments?page=${page}&size=${size}&sort=createdAt,desc`)
      .then(response => response.data),

  // 내 장소 북마크 목록 - apiRequest가 이미 래퍼 처리함
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
    return apiRequest.get<any>(url)
      .then(response => response.data);
  },

  // 내가 작성한 리뷰 목록 - apiRequest가 이미 래퍼 처리함
  getMyReviews: (page: number = 0, size: number = 10): Promise<PageResponse<PlaceReview>> =>
    apiRequest.get<any>(`/users/mypage/reviews?page=${page}&size=${size}`)
      .then(response => response.data),

  // 내가 만든 코스 목록 - apiRequest가 이미 래퍼 처리함
  getMyCourses: (page: number = 0, size: number = 20): Promise<PageResponse<CourseListResponse>> =>
    apiRequest.get<any>(`/users/mypage/courses?page=${page}&size=${size}`)
      .then(response => response.data),

  // 내가 북마크한 코스 목록 - apiRequest가 이미 래퍼 처리함
  getMyCourseBookmarks: (page: number = 0, size: number = 20): Promise<PageResponse<UserCourseBookmarkListDto>> =>
    apiRequest.get<any>(`/users/mypage/coursebookmark?page=${page}&size=${size}`)
      .then(response => response.data),

  // 내가 좋아요한 코스 목록 - apiRequest가 이미 래퍼 처리함
  getMyCourseLikes: (page: number = 0, size: number = 10): Promise<PageResponse<CourseLike>> =>
    apiRequest.get<any>(`/users/mypage/likes?page=${page}&size=${size}`)
      .then(response => {
        // 🔍 Raw API 응답 로깅 (개발 환경에서만)
        if (import.meta.env?.DEV) {
          console.group('🌐 좋아요 API Raw 응답 - DETAILED');
          console.log('🔍 apiRequest 래퍼 응답:', response);
          console.log('🔍 response.data (백엔드 data 필드):', response.data);
          
          // apiRequest는 백엔드 response의 data 필드를 반환해야 함
          const actualData = response.data || response;
          console.log('🔍 실제 사용할 데이터:', actualData);
          
          if (actualData?.content && Array.isArray(actualData.content)) {
            console.log('📊 컨텐츠 배열 길이:', actualData.content.length);
            
            actualData.content.forEach((item, index) => {
              console.group(`📝 아이템 ${index + 1}`);
              console.log('전체 아이템:', item);
              console.log('courseListDto:', item.courseListDto);
              
              if (item.courseListDto?.places) {
                console.log('🗺️ Places 배열:', item.courseListDto.places);
                console.log('🗺️ Places 길이:', item.courseListDto.places.length);
                
                item.courseListDto.places.forEach((place, pIndex) => {
                  console.log(`  장소 ${pIndex + 1}:`, {
                    name: place.name,
                    imageUrl: place.imageUrl,
                    hasImageUrl: !!place.imageUrl
                  });
                });
              } else {
                console.error('❌ places 배열이 없음!');
              }
              console.groupEnd();
            });
          } else {
            console.error('❌ content 배열이 없거나 유효하지 않음');
          }
          
          console.groupEnd();
        }
        
        // 🔧 수정: 백엔드 응답 구조에 맞게 data 필드 추출
        return response.data || response;
      }),

  // 내 알림 목록 - apiRequest가 이미 래퍼 처리함
  getMyNotifications: (page: number = 0, size: number = 10): Promise<PageResponse<Notification>> =>
    apiRequest.get<any>(`/users/mypage/notifications?page=${page}&size=${size}&sort=createdAt,desc`)
      .then(response => response.data),

  // 알림 읽음 처리 - apiRequest가 이미 래퍼 처리함
  markNotificationAsRead: (notificationId: number): Promise<Notification> =>
    apiRequest.patch<any>(`/users/mypage/notifications/${notificationId}`)
      .then(response => response.data),

  // 읽은 알림 전체 삭제 - 백엔드 API 복원
  deleteReadNotifications: (): Promise<void> =>
    apiRequest.delete<void>('/users/mypage/notifications/read')
      .then(response => response.data),

  // 읽지 않은 알림 개수 - apiRequest가 이미 래퍼 처리함
  getUnreadNotificationCount: (): Promise<{ count: number }> =>
    apiRequest.get<any>('/notifications/unread-count')
      .then(response => ({ count: response.data })),
};