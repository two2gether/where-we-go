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
   * 기존 평점이 있으면 먼저 삭제 후 다시 등록
   */
  createOrUpdateCourseRating: async (ratingData: { courseId: number; rating: number }): Promise<ApiResponse<CourseRatingResponseDto>> => {
    try {
      // 먼저 평점 등록 시도
      const response = await api.post('/ratings', ratingData);
      return response.data;
    } catch (error: any) {
      // 409 Conflict (이미 평점 존재) 에러인 경우 삭제 후 다시 등록
      if (error.response?.status === 409) {
        // 기존 평점 삭제
        await api.delete('/ratings', { 
          data: { courseId: ratingData.courseId },
          headers: { 'Content-Type': 'application/json' }
        });
        // 새로운 평점 등록
        const response = await api.post('/ratings', ratingData);
        return response.data;
      }
      // 다른 에러는 그대로 던짐
      throw error;
    }
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