import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseRatingService } from '../api/services/courseRating.service';
import { useAuthStore } from '../store/authStore';

export const useCourseRatings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 코스 평점 등록/수정
  const createOrUpdateCourseRatingMutation = useMutation({
    mutationFn: ({ courseId, rating }: { courseId: number; rating: number }) => 
      courseRatingService.createOrUpdateCourseRating(courseId, rating),
    onSuccess: (data, { courseId }) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'my', 'ratings'] });
      
      // 특정 코스 상세 정보 무효화
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'popular'] });
    }
  });

  // 코스 평점 삭제
  const deleteCourseRatingMutation = useMutation({
    mutationFn: (courseId: number) => courseRatingService.deleteCourseRating(courseId),
    onSuccess: (data, courseId) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'my', 'ratings'] });
      
      // 특정 코스 상세 정보 무효화
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'popular'] });
    }
  });

  const updateCourseRating = async (courseId: number, rating: number) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      await createOrUpdateCourseRatingMutation.mutateAsync({ courseId, rating });
    } catch (error) {
      throw error;
    }
  };

  const removeCourseRating = async (courseId: number) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      await deleteCourseRatingMutation.mutateAsync(courseId);
    } catch (error) {
      throw error;
    }
  };

  return {
    updateCourseRating,
    removeCourseRating,
    isUpdating: createOrUpdateCourseRatingMutation.isPending,
    isDeleting: deleteCourseRatingMutation.isPending,
    isLoading: createOrUpdateCourseRatingMutation.isPending || deleteCourseRatingMutation.isPending
  };
};