import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '../api';
import type { Bookmark, BookmarkRequest, PageRequest } from '../api/types';

// Query Keys
export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  lists: () => [...bookmarkKeys.all, 'list'] as const,
  list: (params: PageRequest & { type?: 'PLACE' | 'COURSE' }) => [...bookmarkKeys.lists(), params] as const,
  places: () => [...bookmarkKeys.all, 'places'] as const,
  courses: () => [...bookmarkKeys.all, 'courses'] as const,
  check: (targetId: string, type: 'PLACE' | 'COURSE') => [...bookmarkKeys.all, 'check', targetId, type] as const,
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
    onSuccess: (result, variables) => {
      // 북마크 상태 캐시 업데이트
      queryClient.setQueryData(
        bookmarkKeys.check(variables.targetId, variables.type),
        { bookmarked: result.bookmarked }
      );
      
      // 북마크 목록 무효화
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.places() });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.courses() });
      
      // 장소/코스 목록의 북마크 상태도 업데이트
      if (variables.type === 'PLACE') {
        queryClient.invalidateQueries({ queryKey: ['places'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      }
    },
    onError: (error) => {
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