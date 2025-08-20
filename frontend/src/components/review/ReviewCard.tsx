import React from 'react';
import { useDeleteReview } from '../../hooks/useReviews';
import { useAuthStore } from '../../store/authStore';
import { getReviewErrorMessage } from '../../utils/errorUtils';
import type { PlaceReview } from '../../api/types';

interface ReviewCardProps {
  review: PlaceReview;
  showPlaceInfo?: boolean;
  onEdit?: (review: PlaceReview) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  showPlaceInfo = false,
  onEdit 
}) => {
  const { user } = useAuthStore();
  const deleteReviewMutation = useDeleteReview();

  const isMyReview = user?.userId === review.reviewer.userId;

  const handleDelete = async () => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await deleteReviewMutation.mutateAsync(review.placeId);
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        const errorMessage = getReviewErrorMessage(error);
        alert(errorMessage);
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-github-neutral-muted">
          {rating}.0
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white border border-github-border rounded-lg p-4 hover:border-github-border-muted transition-colors">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {review.reviewer.profileImage ? (
              <img
                src={review.reviewer.profileImage}
                alt={review.reviewer.nickname}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-github-canvas-subtle rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-github-neutral-muted">
                  {review.reviewer.nickname[0]?.toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-github-neutral">
                  {review.reviewer.nickname}
                </span>
                {isMyReview && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    내 리뷰
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {renderStars(review.rating)}
                <span className="text-xs text-github-neutral-muted">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* 메뉴 버튼 */}
          <div className="relative">
            <button
              className="text-github-neutral-muted hover:text-github-neutral p-1"
              onClick={(e) => {
                e.stopPropagation();
                // 드롭다운 메뉴 토글 로직
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>
          </div>
        </div>

        {/* 장소 정보는 백엔드 응답에 포함되지 않음 - showPlaceInfo 기능 비활성화 */}

        {/* 리뷰 내용 */}
        <div className="mb-4">
          <p className="text-github-neutral leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>
        </div>


        {/* 액션 버튼 - 내 리뷰인 경우만 수정/삭제 버튼 표시 */}
        {isMyReview && (
          <div className="flex items-center justify-end pt-3 border-t border-github-border space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="px-3 py-1 text-xs text-github-neutral border border-github-border rounded hover:bg-github-canvas-subtle"
              >
                수정
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleteReviewMutation.isPending}
              className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
            >
              {deleteReviewMutation.isPending ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

    </>
  );
};

export default ReviewCard;