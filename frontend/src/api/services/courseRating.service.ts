import { api } from '../axios';
import type { ApiResponse } from '../types';

// 코스 평점 응답 DTO
export interface CourseRatingResponseDto {
  ratingId: number;
  courseId: number;
  userId: number;
  rating: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 코스 평점 관련 API 서비스
 * 백엔드 CourseRatingController 엔드포인트에 맞춰 구현
 */
export const courseRatingService = {
  /**
   * 코스 평점 등록/수정
   * POST /api/ratings
   * 기존 평점이 있으면 덮어쓰기로 업데이트됨
   */
  createOrUpdateCourseRating: async (ratingData: { courseId: number; rating: number }): Promise<ApiResponse<CourseRatingResponseDto>> => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },

  /**
   * 코스 평점 삭제
   * DELETE /api/ratings
   */
  deleteCourseRating: async (courseId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete('/ratings', { 
      data: { courseId },
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
};