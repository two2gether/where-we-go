import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '../api';
import type { Bookmark, BookmarkRequest, PageRequest } from '../api/types';

// Query Keys
export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  list: (params: PageRequest & { type?: 'PLACE' | 'COURSE' }, userId: number) => 
    [...bookmarkKeys.lists(), params, 'user', userId] as const, // 북마크 목록은 사용자별
  places: (userId: number) => 
    [...bookmarkKeys.all, 'places', 'user', userId] as const, // 북마크한 장소는 사용자별
  courses: (userId: number) => 
    [...bookmarkKeys.all, 'courses', 'user', userId] as const, // 북마크한 코스는 사용자별
  check: (targetId: string, type: 'PLACE' | 'COURSE', userId: number) => 
    [...bookmarkKeys.all, 'check', targetId, type, 'user', userId] as const, // 북마크 상태는 사용자별
};

// 북마크 목록 조회
export const useBookmarks = (params: PageRequest & { type?: 'PLACE' | 'COURSE' } = {}) => {
  return useQuery({
    queryKey: bookmarkKeys.list(params),
    queryFn: () => bookmarkService.getBookmarks(params),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 북마크한 장소 목록
export const useBookmarkedPlaces = (params: PageRequest = {}, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...bookmarkKeys.places(), params],
    queryFn: () => bookmarkService.getBookmarkedPlaces(params),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false, // 기본적으로 활성화, 명시적으로 false일 때만 비활성화
  });
};

// 북마크한 코스 목록
export const useBookmarkedCourses = (params: PageRequest = {}) => {
  return useQuery({
    queryKey: [...bookmarkKeys.courses(), params],
    queryFn: () => bookmarkService.getBookmarkedCourses(params),
    staleTime: 2 * 60 * 1000,
  });
};

// 북마크 상태 확인
export const useCheckBookmark = (targetId: string, type: 'PLACE' | 'COURSE') => {
  return useQuery({
    queryKey: bookmarkKeys.check(targetId, type),
    queryFn: () => bookmarkService.checkBookmark(targetId, type),
    enabled: !!(targetId && type),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 북마크 토글
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkData: BookmarkRequest) => bookmarkService.toggleBookmark(bookmarkData),
    onMutate: async (variables) => {
      // 낙관적 업데이트: 즉시 UI 반영
      const checkKey = bookmarkKeys.check(variables.targetId, variables.type);
      await queryClient.cancelQueries({ queryKey: checkKey });
      
      const previousData = queryClient.getQueryData(checkKey);
      
      // 임시로 북마크 상태 토글
      queryClient.setQueryData(checkKey, (oldData: any) => ({
        bookmarked: !oldData?.bookmarked
      }));
      
      return { previousData, checkKey };
    },
    onSuccess: (result, variables, context) => {
      // 서버 응답으로 정확한 데이터 업데이트
      queryClient.setQueryData(
        context.checkKey,
        { bookmarked: result.bookmarked }
      );
      
      // 현재 사용자의 북마크 목록만 무효화 (다른 사용자에게 영향 없음)
      queryClient.invalidateQueries({ 
        queryKey: bookmarkKeys.lists(),
        exact: false,
        predicate: (query) => query.queryKey.includes('user')
      });
      
      queryClient.invalidateQueries({ 
        queryKey: bookmarkKeys.places(),
        exact: false,
        predicate: (query) => query.queryKey.includes('user')
      });
      
      queryClient.invalidateQueries({ 
        queryKey: bookmarkKeys.courses(),
        exact: false,
        predicate: (query) => query.queryKey.includes('user')
      });

      // MyPage 관련 쿼리들도 무효화 (통계 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['mypage'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['my-course-bookmarks'] });
      
      // 북마크 상태는 개인적이지만, 목록은 모든 사용자에게 영향 없음
      // 별도 처리 불필요 (북마크 여부는 개인 상태)
    },
    onError: (error, variables, context) => {
      // 에러 시 이전 상태로 복원
      if (context?.previousData && context?.checkKey) {
        queryClient.setQueryData(context.checkKey, context.previousData);
      }
      console.error('Bookmark toggle failed:', error);
    },
  });
};

// 북마크 삭제
export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkId: number) => bookmarkService.removeBookmark(bookmarkId),
    onSuccess: () => {
      // 북마크 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    },
    onError: (error) => {
      console.error('Bookmark removal failed:', error);
    },
  });
};

// 북마크 일괄 삭제
export const useRemoveBookmarks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkIds: number[]) => bookmarkService.removeBookmarks(bookmarkIds),
    onSuccess: () => {
      // 북마크 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all });
    },
    onError: (error) => {
      console.error('Bulk bookmark removal failed:', error);
    },
  });
};