import { api } from '../axios';
import type { ApiResponse } from '../types';

// 코스 좋아요 응답 DTO
export interface CourseLikeResponseDto {
  likeId: number;
  courseId: number;
  userId: number;
  createdAt: string;
}

// 코스 좋아요 목록 응답 DTO  
export interface CourseLikeListResponseDto {
  likeId: number;
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  courseThumbnail?: string;
  createdAt: string;
}

export const courseLikeService = {
  // 코스 좋아요 추가
  addCourseLike: async (courseId: number): Promise<ApiResponse<CourseLikeResponseDto>> => {
    const response = await api.post(`/courses/${courseId}/like`);
    return response.data;
  },

  // 코스 좋아요 삭제
  removeCourseLike: async (courseId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/courses/${courseId}/like`);
    return response.data;
  }
};