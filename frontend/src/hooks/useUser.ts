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
  const { isAuthenticated, logout, user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: userKeys.mypage(),
    queryFn: async () => {
      // 현재 인증된 사용자 정보 확인
      if (!currentUser) {
        logout();
        throw new Error('No authenticated user');
      }
      
      const data = await userService.getMyPage();
      
      // 응답 받은 데이터의 사용자 ID와 현재 로그인한 사용자 ID가 일치하는지 확인
      if (data.user?.userId && currentUser.userId && data.user.userId !== currentUser.userId) {
        // 캐시 완전 초기화 후 새로고침
        queryClient.clear();
        window.location.reload();
        throw new Error('User mismatch detected');
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    enabled: isAuthenticated && !!currentUser, // 인증과 사용자 정보가 모두 있어야 실행
    retry: (failureCount, error: any) => {
      // 401/403 에러의 경우 재시도하지 않음
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.warn('Authentication failed in useMyPage, logging out');
        logout();
        return false;
      }
      // 사용자 불일치 에러의 경우 재시도하지 않음
      if (error?.message === 'User mismatch detected' || error?.message === 'No authenticated user') {
        return false;
      }
      // 다른 에러의 경우 최대 2번 재시도
      return failureCount < 2;
    },
    onError: (error: any) => {
      console.error('MyPage data fetch error:', error);
      // 401/403 에러 시 추가 로그아웃 처리 (혹시 retry에서 누락된 경우)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
      }
    },
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
      
      // 각 코스의 이미지 정보 상세 로깅
      if (result?.content && Array.isArray(result.content)) {
        result.content.forEach((like, index) => {
          console.log(`🔍 좋아요 코스 ${index + 1}:`, {
            courseId: like.courseListDto?.courseId,
            title: like.courseListDto?.title,
            places: like.courseListDto?.places,
            placesCount: like.courseListDto?.places?.length,
            firstPlaceImage: like.courseListDto?.places?.[0]?.imageUrl
          });
        });
      }
      
      return result;
    },
    staleTime: 0, // 캐시 비활성화 (임시)
    cacheTime: 0, // 캐시 시간 0으로 설정 (임시)
    refetchOnMount: true, // 마운트시 항상 새로 가져오기
    refetchOnWindowFocus: true, // 창 포커스시 새로 가져오기
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

// 읽은 알림 전체 삭제
export const useDeleteReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteReadNotifications,
    onSuccess: () => {
      // 알림 관련 모든 캐시 무효화
      queryClient.invalidateQueries({ queryKey: userKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: userKeys.unreadCount() });
      alert('읽은 알림이 모두 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('Delete read notifications failed:', error);
      alert('읽은 알림 삭제에 실패했습니다.');
    },
  });
};