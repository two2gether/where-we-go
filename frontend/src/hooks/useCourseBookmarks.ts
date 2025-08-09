import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseBookmarkService } from '../api/services';
import { useAuthStore } from '../store/authStore';

export const useCourseBookmarks = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 코스 북마크 추가
  const addCourseBookmarkMutation = useMutation({
    mutationFn: (courseId: number) => courseBookmarkService.addCourseBookmark(courseId),
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'my', 'coursebookmarks'] });
    }
  });

  // 코스 북마크 삭제
  const removeCourseBookmarkMutation = useMutation({
    mutationFn: (courseId: number) => courseBookmarkService.removeCourseBookmark(courseId),
    onSuccess: () => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'my', 'coursebookmarks'] });
    }
  });

  const toggleCourseBookmark = async (courseId: number, isBookmarked: boolean) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      if (isBookmarked) {
        await removeCourseBookmarkMutation.mutateAsync(courseId);
      } else {
        await addCourseBookmarkMutation.mutateAsync(courseId);
      }
    } catch (error) {
      throw error;
    }
  };

  return {
    toggleCourseBookmark,
    addCourseBookmark: addCourseBookmarkMutation.mutateAsync,
    removeCourseBookmark: removeCourseBookmarkMutation.mutateAsync,
    isToggling: addCourseBookmarkMutation.isPending || removeCourseBookmarkMutation.isPending
  };
};