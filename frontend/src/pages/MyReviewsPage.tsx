import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyReviews } from '../hooks/useUser';
import LinearLayout from '../components/layout/LinearLayout';
import { Card, Button, Spinner, Badge } from '../components/base';

const MyReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const { data, isLoading, error } = useMyReviews(page, pageSize);
  
  const reviews = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
        style={{ fontSize: '16px' }}
      >
        ⭐
      </span>
    ));
  };

  if (isLoading) {
    return (
      <LinearLayout 
        title="내 리뷰" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '내 리뷰' }
        ]}
      >
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </LinearLayout>
    );
  }

  if (error) {
    return (
      <LinearLayout 
        title="내 리뷰" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '내 리뷰' }
        ]}
      >
        <Card variant="outlined" padding="lg" className="text-center border-red-200 bg-red-50">
          <p className="text-red-700 mb-3">리뷰 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </Card>
      </LinearLayout>
    );
  }

  return (
    <LinearLayout 
      title="내 리뷰" 
      breadcrumbs={[
        { label: '마이페이지', href: '/mypage' },
        { label: '내 리뷰' }
      ]}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--notion-text)',
              margin: 0
            }}
          >
            📝 내 리뷰 ({totalElements}개)
          </h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/mypage')}
          >
            ← 마이페이지
          </Button>
        </div>
      </div>

      {reviews.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {reviews.map((review) => (
              <Card key={review.reviewId} variant="outlined" padding="md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/places/${review.place.placeId}`}
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'var(--notion-blue)',
                          textDecoration: 'none'
                        }}
                      >
                        {review.place.name}
                      </Link>
                      <p 
                        style={{
                          fontSize: '13px',
                          color: 'var(--notion-text-light)',
                          marginTop: '2px'
                        }}
                      >
                        {review.place.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-1">
                        {renderStars(review.rating)}
                      </div>
                      <div 
                        style={{
                          fontSize: '12px',
                          color: 'var(--notion-text-light)'
                        }}
                      >
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <p 
                    style={{
                      fontSize: '14px',
                      color: 'var(--notion-text)',
                      lineHeight: '1.5',
                      marginBottom: '12px'
                    }}
                  >
                    {review.content}
                  </p>

                  {review.reviewImages && review.reviewImages.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.reviewImages.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image.imageUrl}
                          alt={`리뷰 이미지 ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                      {review.reviewImages.length > 3 && (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            +{review.reviewImages.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/places/${review.place.placeId}`)}
                    >
                      장소 보기
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                이전
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card variant="outlined" padding="lg" className="text-center">
          <div className="py-16">
            <div 
              className="text-6xl mb-4"
              style={{ color: 'var(--notion-text-light)' }}
            >
              📝
            </div>
            <h3 
              className="mb-2"
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--notion-text)'
              }}
            >
              작성한 리뷰가 없습니다
            </h3>
            <p 
              className="mb-6"
              style={{
                fontSize: '14px',
                color: 'var(--notion-text-light)'
              }}
            >
              방문한 장소에 리뷰를 남겨보세요.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/places')}
            >
              장소 둘러보기
            </Button>
          </div>
        </Card>
      )}
    </LinearLayout>
  );
};

export default MyReviewsPage;