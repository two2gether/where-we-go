import { apiRequest } from '../axios';
import type {
  CourseRating,
  CreateCourseRatingRequest
} from '../types';

/**
 * 코스 평점 관련 API 서비스
 * 백엔드 CourseRatingController 엔드포인트에 맞춰 구현
 */
export const courseRatingService = {
  /**
   * 코스 평점 등록/수정
   * POST /api/courses/{courseId}/rating
   * 기존 평점이 있으면 덮어쓰기로 업데이트됨
   */
  createOrUpdateCourseRating: (ratingData: CreateCourseRatingRequest): Promise<CourseRating> =>
    apiRequest.post<CourseRating>(`/courses/${ratingData.courseId}/rating`, ratingData)
      .then(response => response.data),

  /**
   * 코스 평점 삭제
   * DELETE /api/courses/{courseId}/rating
   */
  deleteCourseRating: (courseId: number): Promise<void> =>
    apiRequest.delete<void>(`/courses/${courseId}/rating`)
      .then(() => undefined),
};