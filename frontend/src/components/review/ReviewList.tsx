import React, { useState } from 'react';
import { usePlaceReviews } from '../../hooks/useReviews';
import { useAuthStore } from '../../store/authStore';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import type { PlaceReview } from '../../api/types';

interface ReviewListProps {
  placeId: string;
  placeName: string;
  averageRating?: number; // 부모 컴포넌트에서 전달받는 평균 평점
}

const ReviewList: React.FC<ReviewListProps> = ({ placeId, placeName, averageRating }) => {
  const { user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<PlaceReview | null>(null);

  const { 
    data: reviewsData, 
    isLoading, 
    error 
  } = usePlaceReviews(placeId, page, 10);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleEditReview = (review: PlaceReview) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleCancelForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-github-border rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-github-neutral-muted mb-4">
          리뷰를 불러오는데 실패했습니다.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-github-neutral">
            리뷰 ({reviewsData?.totalElements || 0})
          </h2>
          {reviewsData && reviewsData.totalElements > 0 && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-github-neutral-muted">
              <span>평균 평점: ★ {averageRating?.toFixed(1) || '0.0'}</span>
              <span>총 {reviewsData.totalElements}개 리뷰</span>
            </div>
          )}
        </div>
        
        {user && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* 리뷰 작성/수정 폼 */}
      {showReviewForm && (
        <ReviewForm
          placeId={placeId}
          placeName={placeName}
          existingReview={editingReview || undefined}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancelForm}
        />
      )}

      {/* 리뷰 목록 */}
      {reviewsData && reviewsData.content.length > 0 ? (
        <div className="space-y-4">
          {reviewsData.content.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEditReview}
            />
          ))}

          {/* 페이지네이션 */}
          {reviewsData.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, reviewsData.totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(0, page - 2);
                  if (pageNum >= reviewsData.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md ${
                        pageNum === page
                          ? 'bg-primary-600 text-white'
                          : 'text-github-neutral border border-github-border hover:bg-github-canvas-subtle'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(Math.min(reviewsData.totalPages - 1, page + 1))}
                disabled={page >= reviewsData.totalPages - 1}
                className="px-3 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-github-canvas-subtle rounded-lg">
          <div className="text-github-neutral-muted mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-github-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium">아직 리뷰가 없습니다</p>
            <p className="text-sm mt-2">이 장소의 첫 번째 리뷰를 작성해보세요!</p>
          </div>
          
          {user && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              첫 리뷰 작성하기
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewList;