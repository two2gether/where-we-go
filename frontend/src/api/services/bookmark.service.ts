import { apiRequest } from '../axios';
import type {
  Bookmark,
  BookmarkRequest,
  PageRequest,
  PageResponse,
  UserBookmarkListDto
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
      
      console.log(`🔄 Attempting to toggle bookmark for place: ${placeId}`);
      
      // POST로 시도하고, 실패하면 DELETE 시도 (간단한 토글 로직)
      return apiRequest.post<any>(`/places/${placeId}/bookmark`)
        .then((response) => {
          console.log('✅ Bookmark added successfully:', response);
          return { bookmarked: true };
        })
        .catch((error) => {
          console.log('📝 Bookmark add failed, trying to remove:', error.response?.status);
          if (error.response?.status === 409 || error.response?.status === 400) {
            // 이미 북마크가 있다면 제거
            return apiRequest.delete<any>(`/places/${placeId}/bookmark`)
              .then((response) => {
                console.log('✅ Bookmark removed successfully:', response);
                return { bookmarked: false };
              })
              .catch((deleteError) => {
                console.error('❌ Bookmark remove also failed:', deleteError);
                throw deleteError;
              });
          } else {
            throw error;
          }
        });
    } else {
      // 코스 북마크는 백엔드의 create/delete API 사용
      const courseId = parseInt(bookmarkData.targetId); // string을 number로 변환
      
      console.log(`🔄 Attempting to toggle bookmark for course: ${courseId}`);
      
      // POST로 시도하고, 실패하면 DELETE 시도 (토글 로직)
      return apiRequest.post<any>('/bookmarks', { courseId })
        .then((response) => {
          console.log('✅ Course bookmark added successfully:', response);
          return { bookmarked: true };
        })
        .catch((error) => {
          console.log('📝 Course bookmark add failed, trying to remove:', error.response?.status);
          if (error.response?.status === 409 || error.response?.status === 400) {
            // 이미 북마크가 있다면 제거
            return apiRequest.delete<any>('/bookmarks', { data: { courseId } })
              .then((response) => {
                console.log('✅ Course bookmark removed successfully:', response);
                return { bookmarked: false };
              })
              .catch((deleteError) => {
                console.error('❌ Course bookmark remove also failed:', deleteError);
                throw deleteError;
              });
          } else {
            throw error;
          }
        });
    }
  },

  // 북마크 상태 확인 (현재 사용하지 않음 - 백엔드 API 없음)
  checkBookmark: (targetId: string, type: 'PLACE' | 'COURSE'): Promise<{ bookmarked: boolean }> => {
    console.warn('checkBookmark API is not implemented in backend');
    return Promise.resolve({ bookmarked: false });
  },

  // 북마크한 장소 목록 조회
  getBookmarkedPlaces: (params: PageRequest = {}): Promise<UserBookmarkListDto> =>
    apiRequest.get<UserBookmarkListDto>('/users/mypage/bookmarks', { params })
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