import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseLikeService } from '../api/services';
import { useAuthStore } from '../store/authStore';

export const useCourseLikes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 코스 좋아요 추가
  const addCourseLikeMutation = useMutation({
    mutationFn: (courseId: number) => courseLikeService.addCourseLike(courseId),
    onSuccess: (data, courseId) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      // 🔧 수정: 올바른 쿼리 키 사용
      queryClient.invalidateQueries({ queryKey: ['user', 'course-likes'] });
      
      // 특정 코스 상세 정보 무효화
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'popular'] });
    }
  });

  // 코스 좋아요 삭제
  const removeCourseLikeMutation = useMutation({
    mutationFn: (courseId: number) => courseLikeService.removeCourseLike(courseId),
    onMutate: async (courseId) => {
      // 🚀 Optimistic update: 즉시 UI 업데이트
      await queryClient.cancelQueries({ queryKey: ['user', 'course-likes'] });
      const previousData = queryClient.getQueriesData({ queryKey: ['user', 'course-likes'] });
      
      // 좋아요 목록에서 해당 코스 제거
      queryClient.setQueriesData({ queryKey: ['user', 'course-likes'] }, (old: any) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.filter((like: any) => like.courseListDto.courseId !== courseId),
          totalElements: old.totalElements - 1
        };
      });
      
      return { previousData };
    },
    onSuccess: (data, courseId) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'course-likes'] });
      
      // 특정 코스 상세 정보 무효화
      queryClient.invalidateQueries({ queryKey: ['courses', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'popular'] });
    },
    onError: (err, courseId, context) => {
      // 에러 시 이전 상태로 복원
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
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
      // 실패 시 관련 쿼리를 다시 불러와서 올바른 상태로 복원
      queryClient.invalidateQueries({ queryKey: ['courses'] });
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