import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { GitHubLayout } from '../components/layout';
import { PlaceCard } from '../components/domain';
import { Button, Card, Spinner } from '../components/base';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../api/axios';
import type { UserBookmarkList } from '../api/types';

export const BookmarksPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'places' | 'courses'>('places');

  // 북마크한 장소 목록 조회
  const { data: bookmarkData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-bookmarks'],
    queryFn: () => apiRequest.get<UserBookmarkList>('/users/mypage/bookmarks').then(res => res.data),
    enabled: isAuthenticated,
  });

  // 북마크 토글 함수
  const toggleBookmark = async (placeId: string) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 북마크 제거 (북마크 페이지에서는 제거만 가능)
      await apiRequest.delete(`/places/${placeId}/bookmark`);
      alert('북마크에서 제거되었습니다.');
      
      // 데이터 새로고침
      refetch();
    } catch (error) {
      console.error('북마크 제거 실패:', error);
      alert('북마크 제거에 실패했습니다.');
    }
  };

  const handleViewDetails = (placeId: string) => {
    navigate(`/places/${placeId}`);
  };

  const handleAddToCourse = (placeId: string) => {
    // 코스에 추가 기능 (추후 구현)
    alert('코스 추가 기능은 준비 중입니다.');
  };

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <GitHubLayout title="북마크">
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-2xl font-semibold text-github-neutral mb-2">로그인이 필요합니다</h2>
          <p className="text-github-neutral-muted mb-6">
            북마크 기능을 사용하려면 먼저 로그인해주세요.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
          >
            로그인하기
          </Button>
        </div>
      </GitHubLayout>
    );
  }

  const bookmarks = bookmarkData?.content || [];

  // GitHub 스타일 탭 구성 (클릭 가능하도록 수정)
  const tabs = [
    { 
      label: `장소 북마크 (${bookmarks.filter(b => b.place).length})`, 
      href: '#places', 
      active: activeTab === 'places',
      onClick: () => setActiveTab('places')
    },
    { 
      label: `코스 북마크 (${bookmarks.filter(b => b.course).length})`, 
      href: '#courses', 
      active: activeTab === 'courses',
      onClick: () => setActiveTab('courses')
    },
  ];

  return (
    <GitHubLayout
      title="내 북마크"
      subtitle="저장해둔 장소와 코스를 확인하고 관리하세요"
      tabs={tabs}
    >

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <Card variant="outlined" padding="md" className="text-center border-red-200 bg-red-50">
          <p className="text-red-700 mb-3 text-sm">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </Card>
      )}

      {/* 북마크 목록 */}
      {!isLoading && !error && (
        <>
          {/* 장소 북마크 탭 */}
          {activeTab === 'places' && (
            <>
              {bookmarks.filter(b => b.place).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {bookmarks
                    .filter(bookmark => bookmark.place)
                    .map((bookmark) => (
                      <PlaceCard
                        key={bookmark.place.placeId}
                        id={bookmark.place.placeId}
                        name={bookmark.place.name}
                        description={bookmark.place.address}
                        image={bookmark.place.photo}
                        category={bookmark.place.category}
                        region={bookmark.place.regionSummary}
                        rating={bookmark.place.averageRating}
                        reviewCount={bookmark.place.reviewCount}
                        isBookmarked={true}
                        address={bookmark.place.address}
                        tags={[bookmark.place.category]}
                        onBookmarkToggle={() => toggleBookmark(bookmark.place.placeId)}
                        onViewDetails={() => handleViewDetails(bookmark.place.placeId)}
                        onAddToCourse={() => handleAddToCourse(bookmark.place.placeId)}
                      />
                    ))}
                </div>
              ) : (
                <Card variant="outlined" padding="lg" className="text-center">
                  <div className="py-8">
                    <svg className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-primary-900 mb-2">북마크한 장소가 없습니다</h3>
                    <p className="text-github-neutral mb-4">
                      관심있는 장소를 북마크하여 나중에 쉽게 찾아보세요.
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
            </>
          )}

          {/* 코스 북마크 탭 */}
          {activeTab === 'courses' && (
            <Card variant="outlined" padding="lg" className="text-center">
              <div className="py-8">
                <svg className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 className="text-lg font-medium text-primary-900 mb-2">북마크한 코스가 없습니다</h3>
                <p className="text-github-neutral mb-4">
                  관심있는 여행 코스를 북마크하여 나중에 쉽게 찾아보세요.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/courses')}
                >
                  코스 둘러보기
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </GitHubLayout>
  );
};