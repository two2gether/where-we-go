import { apiRequest } from '../axios';
import type {
  Bookmark,
  BookmarkRequest,
  PageRequest,
  PageResponse
} from '../types';

export const bookmarkService = {
  // 북마크 목록 조회
  getBookmarks: (params: PageRequest & { type?: 'PLACE' | 'COURSE' } = {}): Promise<PageResponse<Bookmark>> =>
    apiRequest.get<PageResponse<Bookmark>>('/bookmarks', { params })
      .then(response => response.data),

  // 북마크 추가/제거 토글 (장소용)
  toggleBookmark: (bookmarkData: BookmarkRequest): Promise<{ bookmarked: boolean }> => {
    if (bookmarkData.type === 'PLACE') {
      // 장소 북마크는 별도 API 사용
      const placeId = bookmarkData.targetId;
      
      // 먼저 현재 북마크 상태를 확인하고 추가/제거 결정
      // 실제로는 현재 상태를 모르므로 POST로 시도하고, 실패하면 DELETE 시도
      return apiRequest.post<any>(`/places/${placeId}/bookmark`)
        .then(() => ({ bookmarked: true }))
        .catch(() => {
          // 이미 북마크가 있다면 제거
          return apiRequest.delete<any>(`/places/${placeId}/bookmark`)
            .then(() => ({ bookmarked: false }));
        });
    } else {
      // 코스 북마크는 기존 방식 사용
      return apiRequest.post<{ bookmarked: boolean }>('/bookmarks/toggle', bookmarkData)
        .then(response => response.data);
    }
  },

  // 북마크 상태 확인
  checkBookmark: (targetId: string, type: 'PLACE' | 'COURSE'): Promise<{ bookmarked: boolean }> =>
    apiRequest.get<{ bookmarked: boolean }>(`/bookmarks/check?targetId=${targetId}&type=${type}`)
      .then(response => response.data),

  // 북마크한 장소 목록 조회
  getBookmarkedPlaces: (params: PageRequest = {}): Promise<PageResponse<Bookmark>> =>
    apiRequest.get<PageResponse<Bookmark>>('/bookmarks/places', { params })
      .then(response => response.data),

  // 북마크한 코스 목록 조회
  getBookmarkedCourses: (params: PageRequest = {}): Promise<PageResponse<Bookmark>> =>
    apiRequest.get<PageResponse<Bookmark>>('/bookmarks/courses', { params })
      .then(response => response.data),

  // 북마크 삭제
  removeBookmark: (bookmarkId: number): Promise<void> =>
    apiRequest.delete<void>(`/bookmarks/${bookmarkId}`)
      .then(response => response.data),

  // 북마크 일괄 삭제
  removeBookmarks: (bookmarkIds: number[]): Promise<void> =>
    apiRequest.post<void>('/bookmarks/batch-delete', { bookmarkIds })
      .then(response => response.data),
};