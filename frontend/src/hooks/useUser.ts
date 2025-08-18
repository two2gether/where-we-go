import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/services/user.service';
import { useAuthStore } from '../store/authStore';
import type { 
  MyPageUpdateRequest,
  WithdrawRequest
} from '../api/types';

// Query Keys
export const userKeys = {
  all: ['user'] as const,
  mypage: () => [...userKeys.all, 'mypage'] as const,
  comments: (page?: number, size?: number) => [...userKeys.all, 'comments', { page, size }] as const,
  bookmarks: (page?: number, size?: number, lat?: number, lng?: number) => 
    [...userKeys.all, 'bookmarks', { page, size, lat, lng }] as const,
  reviews: (page?: number, size?: number) => [...userKeys.all, 'reviews', { page, size }] as const,
  courses: (page?: number, size?: number) => [...userKeys.all, 'courses', { page, size }] as const,
  courseBookmarks: (page?: number, size?: number) => 
    [...userKeys.all, 'course-bookmarks', { page, size }] as const,
  courseLikes: (page?: number, size?: number) => 
    [...userKeys.all, 'course-likes', { page, size }] as const,
  notifications: (page?: number, size?: number) => 
    [...userKeys.all, 'notifications', { page, size }] as const,
  unreadCount: () => [...userKeys.all, 'unread-count'] as const,
};

// 마이페이지 정보 조회
export const useMyPage = () => {
  return useQuery({
    queryKey: userKeys.mypage(),
    queryFn: userService.getMyPage,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 마이페이지 정보 수정
export const useUpdateMyPage = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (updateData: MyPageUpdateRequest) => userService.updateMyPage(updateData),
    onSuccess: (updatedUser) => {
      // 마이페이지 캐시 업데이트
      queryClient.setQueryData(userKeys.mypage(), updatedUser);
      
      // AuthStore의 사용자 정보도 업데이트
      updateUser({
        nickname: updatedUser.nickname,
        profileImage: updatedUser.profileImage,
      });
      
      // 사용자 정보가 포함된 다른 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

// 회원 탈퇴
export const useWithdraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (withdrawData: WithdrawRequest) => userService.withdraw(withdrawData),
    onSuccess: () => {
      // 모든 사용자 관련 캐시 삭제
      queryClient.removeQueries({ queryKey: userKeys.all });
      queryClient.clear(); // 전체 캐시 클리어
    },
    onError: (error) => {
      console.error('Account withdrawal failed:', error);
    },
  });
};

// 내가 작성한 댓글 목록
export const useMyComments = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: userKeys.comments(page, size),
    queryFn: () => userService.getMyComments(page, size),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 내 장소 북마크 목록
export const useMyBookmarks = (
  page: number = 0, 
  size: number = 20,
  userLatitude?: number,
  userLongitude?: number
) => {
  return useQuery({
    queryKey: userKeys.bookmarks(page, size, userLatitude, userLongitude),
    queryFn: () => userService.getMyBookmarks(page, size, userLatitude, userLongitude),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 내가 작성한 리뷰 목록
export const useMyReviews = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: userKeys.reviews(page, size),
    queryFn: () => userService.getMyReviews(page, size),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 내가 만든 코스 목록
export const useMyCourses = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: userKeys.courses(page, size),
    queryFn: () => userService.getMyCourses(page, size),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 내가 북마크한 코스 목록
export const useMyCourseBookmarks = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: userKeys.courseBookmarks(page, size),
    queryFn: () => userService.getMyCourseBookmarks(page, size),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 내가 좋아요한 코스 목록
export const useMyCourseLikes = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: userKeys.courseLikes(page, size),
    queryFn: async () => {
      console.log('🔍 좋아요한 코스 API 호출:', { page, size });
      const result = await userService.getMyCourseLikes(page, size);
      console.log('🔍 좋아요한 코스 API 응답:', result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5분
    onError: (error) => {
      console.error('🚨 좋아요한 코스 API 에러:', error);
    },
  });
};

// 내 알림 목록
export const useMyNotifications = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: userKeys.notifications(page, size),
    queryFn: () => userService.getMyNotifications(page, size),
    staleTime: 30 * 1000, // 30초 (실시간성 중요)
    refetchOnWindowFocus: true,
  });
};

// 읽지 않은 알림 개수
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: userKeys.unreadCount(),
    queryFn: userService.getUnreadNotificationCount,
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
    refetchOnWindowFocus: true,
  });
};

// 알림 읽음 처리
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => userService.markNotificationAsRead(notificationId),
    onSuccess: (updatedNotification) => {
      // 알림 목록 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: userKeys.notifications() });
      
      // 읽지 않은 알림 개수 업데이트
      queryClient.invalidateQueries({ queryKey: userKeys.unreadCount() });
    },
    onError: (error) => {
      console.error('Mark notification as read failed:', error);
    },
  });
};

// 모든 알림 읽음 처리
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.markAllNotificationsAsRead,
    onSuccess: () => {
      // 알림 관련 모든 캐시 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: userKeys.unreadCount() });
    },
    onError: (error) => {
      console.error('Mark all notifications as read failed:', error);
    },
  });
};