import { api } from '../axios';
import type { ApiResponse } from '../types';

// 코스 북마크 응답 DTO
export interface CourseBookmarkResponseDto {
  bookmarkId: number;
  courseId: number;
  userId: number;
  createdAt: string;
}

// 사용자 코스 북마크 목록 응답 DTO
export interface UserCourseBookmarkListDto {
  bookmarkId: number;
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  courseThumbnail?: string;
  createdAt: string;
}

export const courseBookmarkService = {
  // 코스 북마크 추가
  addCourseBookmark: async (courseId: number): Promise<ApiResponse<CourseBookmarkResponseDto>> => {
    const response = await api.post('/bookmarks', { courseId });
    return response.data;
  },

  // 코스 북마크 삭제
  removeCourseBookmark: async (courseId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete('/bookmarks', { 
      data: { courseId },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
};