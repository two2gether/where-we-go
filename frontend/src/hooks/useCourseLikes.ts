import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseLikeService } from '../api/services';
import { useAuthStore } from '../store/authStore';

export const useCourseLikes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 코스 좋아요 추가
  const addCourseLikeMutation = useMutation({
    mutationFn: (courseId: number) => courseLikeService.addCourseLike(courseId),
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'my', 'likes'] });
    }
  });

  // 코스 좋아요 삭제
  const removeCourseLikeMutation = useMutation({
    mutationFn: (courseId: number) => courseLikeService.removeCourseLike(courseId),
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'my', 'likes'] });
    }
  });

  const toggleCourseLike = async (courseId: number, isLiked: boolean) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      if (isLiked) {
        await removeCourseLikeMutation.mutateAsync(courseId);
      } else {
        await addCourseLikeMutation.mutateAsync(courseId);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    toggleCourseLike,
    addCourseLike: addCourseLikeMutation.mutateAsync,
    removeCourseLike: removeCourseLikeMutation.mutateAsync,
    isToggling: addCourseLikeMutation.isPending || removeCourseLikeMutation.isPending
  };
};