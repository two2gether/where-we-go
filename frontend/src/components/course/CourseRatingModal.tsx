import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseRatingService } from '../../api/services/courseRating.service';
import { useAuthStore } from '../../store/authStore';
import StarRating from '../rating/StarRating';
import type { CourseRating, CreateCourseRatingRequest } from '../../api/types';

interface CourseRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  existingRating?: CourseRating | null;
}

const CourseRatingModal: React.FC<CourseRatingModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  existingRating
}) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<{ rating?: string }>({});

  // 기존 평점이 있으면 데이터 채우기
  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
    } else {
      setRating(0);
    }
  }, [existingRating, isOpen]);

  // 평점 등록/수정 뮤테이션 (백엔드에서 하나의 API로 처리)
  const saveRatingMutation = useMutation({
    mutationFn: (ratingData: CreateCourseRatingRequest) =>
      courseRatingService.createOrUpdateCourseRating(ratingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] }); // 코스 상세 정보 업데이트
      handleClose();
      alert(existingRating ? '평점이 수정되었습니다.' : '평점이 등록되었습니다.');
    },
    onError: (error) => {
      console.error('평점 처리 실패:', error);
      alert(existingRating ? '평점 수정에 실패했습니다.' : '평점 등록에 실패했습니다.');
    }
  });

  // 평점 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: () => courseRatingService.deleteCourseRating(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] }); // 코스 상세 정보 업데이트
      handleClose();
      alert('평점이 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('평점 삭제 실패:', error);
      alert('평점 삭제에 실패했습니다.');
    }
  });

  const handleClose = () => {
    setRating(0);
    setErrors({});
    onClose();
  };

  const validateForm = () => {
    const newErrors: { rating?: string } = {};

    if (rating === 0) {
      newErrors.rating = '평점을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const ratingData = { 
      courseId,
      rating 
    };

    // 백엔드에서는 하나의 API로 등록/수정을 처리
    saveRatingMutation.mutate(ratingData);
  };

  const handleDelete = () => {
    if (!existingRating) return;
    
    if (confirm('평점을 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  if (!isOpen) return null;

  const isSubmitting = saveRatingMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-github-neutral">
            {existingRating ? '평점 수정' : '평점 주기'}
          </h2>
          <button
            onClick={handleClose}
            className="text-github-neutral-muted hover:text-github-neutral"
            disabled={isSubmitting || isDeleting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-github-neutral mb-2">{courseTitle}</h3>
          <p className="text-sm text-github-neutral-muted">
            이 코스는 어떠셨나요? 별점으로 평가해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 별점 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-github-neutral mb-3 text-center">
              평점을 선택해주세요 <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
                showNumber={true}
                className="mb-2"
              />
            </div>
            {errors.rating && (
              <p className="text-red-500 text-xs text-center mt-1">{errors.rating}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex space-x-2">
            {existingRating && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle transition-colors"
              disabled={isSubmitting || isDeleting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting
                ? (existingRating ? '수정 중...' : '등록 중...')
                : (existingRating ? '수정하기' : '등록하기')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseRatingModal;