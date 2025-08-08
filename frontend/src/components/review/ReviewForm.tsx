import React, { useState } from 'react';
import { useCreateReview, useUpdateReview } from '../../hooks/useReviews';
import { getReviewErrorMessage } from '../../utils/errorUtils';
import type { CreatePlaceReviewRequest, PlaceReview } from '../../api/types';

interface ReviewFormProps {
  placeId: string;
  placeName: string;
  existingReview?: PlaceReview;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  placeId,
  placeName,
  existingReview,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [content, setContent] = useState(existingReview?.content || '');

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    const reviewData: CreatePlaceReviewRequest = {
      placeId,
      content: content.trim(),
      rating,
    };

    try {
      if (isEditing) {
        await updateReviewMutation.mutateAsync({
          placeId,
          reviewData,
        });
      } else {
        await createReviewMutation.mutateAsync(reviewData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('리뷰 저장 실패:', error);
      const errorMessage = getReviewErrorMessage(error);
      alert(errorMessage);
    }
  };


  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition-colors ${
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-github-neutral-muted">
          {rating}점
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-github-border p-6">
      <h3 className="text-lg font-semibold text-github-neutral mb-4">
        {isEditing ? '리뷰 수정' : '리뷰 작성'}
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-github-neutral-muted mb-2">장소</p>
        <p className="font-medium text-github-neutral">{placeName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 평점 */}
        <div>
          <label className="block text-sm font-medium text-github-neutral mb-2">
            평점
          </label>
          {renderStarRating()}
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label className="block text-sm font-medium text-github-neutral mb-2">
            리뷰 내용 *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-github-neutral border border-github-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400"
            placeholder="이 장소에 대한 경험을 자세히 공유해주세요..."
            required
          />
          <p className="text-xs text-github-neutral-muted mt-1">
            {content.length}/500자
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={createReviewMutation.isPending || updateReviewMutation.isPending}
            className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createReviewMutation.isPending || updateReviewMutation.isPending
              ? (isEditing ? '수정 중...' : '작성 중...')
              : (isEditing ? '수정 완료' : '리뷰 작성')
            }
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
            >
              취소
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;