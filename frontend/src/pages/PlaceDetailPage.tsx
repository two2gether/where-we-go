import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placeService } from '../api/services/place.service';
import { bookmarkService } from '../api/services/bookmark.service';
import { apiRequest } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { GitHubLayout } from '../components/layout/GitHubLayout';
import { ReviewList } from '../components/review';

const PlaceDetailPage: React.FC = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const queryClient = useQueryClient();

  // 장소 상세 정보 조회
  const { data: place, isLoading, error } = useQuery({
    queryKey: ['place', placeId],
    queryFn: () => placeService.getPlaceById(placeId!),
    enabled: !!placeId,
    staleTime: 0, // 즉시 새로고침 가능하도록 설정 (임시)
  });

  // 북마크 토글 뮤테이션
  const bookmarkMutation = useMutation({
    mutationFn: () => {
      const isCurrentlyBookmarked = place?.isBookmarked;
      if (isCurrentlyBookmarked) {
        // 북마크 제거
        return apiRequest.delete<any>(`/places/${placeId}/bookmark`)
          .then(() => ({ bookmarked: false }));
      } else {
        // 북마크 추가
        return apiRequest.post<any>(`/places/${placeId}/bookmark`)
          .then(() => ({ bookmarked: true }));
      }
    },
    onSuccess: (data) => {
      // 장소 정보 쿼리 무효화하여 최신 북마크 상태 반영
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      
      // 성공 메시지 표시
      const message = data.bookmarked ? '북마크에 추가되었습니다.' : '북마크에서 제거되었습니다.';
      alert(message);
    },
    onError: (error) => {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리에 실패했습니다.');
    },
  });

  // 디버깅용 로그
  React.useEffect(() => {
    if (place) {
      console.log('🔍 Place data:', place);
      console.log('📊 Average rating:', place.averageRating, typeof place.averageRating);
      // 전역에서 접근 가능하도록 설정 (개발용)
      (window as any).currentPlace = place;
    }
  }, [place]);

  const handleBookmarkToggle = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 북마크 토글 실행
    bookmarkMutation.mutate();
  };

  const handleDirections = () => {
    if (place) {
      // 카카오맵이나 구글맵으로 길찾기
      const url = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.latitude},${place.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place?.name,
        text: `${place?.name} - Where We Go`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    }
  };

  if (isLoading) {
    return (
      <GitHubLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  if (error || !place) {
    return (
      <GitHubLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-github-neutral mb-2">장소를 찾을 수 없습니다</h1>
            <p className="text-github-neutral-muted mb-6">
              요청하신 장소가 존재하지 않거나 접근할 수 없습니다.
            </p>
            <button
              onClick={() => navigate('/places')}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              장소 목록으로 돌아가기
            </button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  const tabs = [
    { label: '장소 정보', href: '#info', active: activeTab === 'info' },
    { label: `리뷰 (${place.reviewCount})`, href: '#reviews', active: activeTab === 'reviews' },
  ];

  return (
    <GitHubLayout title={place.name} tabs={tabs}>
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-github-neutral-muted hover:text-github-neutral"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로
          </button>
        </div>

        {/* 메인 이미지 */}
        {place.photo && (
          <div className="mb-8">
            <img
              src={place.photo}
              alt={place.name}
              className="w-full h-64 md:h-80 object-cover rounded-lg border border-github-border"
            />
          </div>
        )}

        {/* 장소 헤더 */}
        <div className="bg-white rounded-lg border border-github-border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-github-neutral">{place.name}</h1>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {place.category}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-github-neutral-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{place.address}</span>
                </div>
                
                {place.phone && (
                  <div className="flex items-center space-x-2 text-github-neutral-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${place.phone}`} className="hover:text-primary-600">
                      {place.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= Math.round(place.averageRating) ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-medium">{place.averageRating}</span>
                  <span className="text-github-neutral-muted">({place.reviewCount} 리뷰)</span>
                </div>
                
                <div className="flex items-center space-x-1 text-github-neutral-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>북마크 {place.bookmarkCount}</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkMutation.isPending}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  place.isBookmarked
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                    : 'bg-white border-github-border text-github-neutral hover:bg-github-canvas-subtle'
                }`}
              >
                <svg className="w-4 h-4" fill={place.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>
                  {bookmarkMutation.isPending 
                    ? '처리 중...' 
                    : place.isBookmarked ? '북마크됨' : '북마크'
                  }
                </span>
              </button>

              <button
                onClick={handleDirections}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>길찾기</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>공유</span>
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-github-canvas-subtle p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-github-neutral-muted hover:text-github-neutral'
              }`}
            >
              장소 정보
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-github-neutral-muted hover:text-github-neutral'
              }`}
            >
              리뷰 ({place.reviewCount})
            </button>
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div>
          {activeTab === 'info' && (
            <div className="bg-white rounded-lg border border-github-border p-6">
              <h2 className="text-xl font-semibold text-github-neutral mb-4">장소 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-github-neutral mb-2">위치</h3>
                  <p className="text-github-neutral-muted">{place.address}</p>
                  {place.roadAddress && place.roadAddress !== place.address && (
                    <p className="text-sm text-github-neutral-muted mt-1">도로명: {place.roadAddress}</p>
                  )}
                </div>

                {place.phone && (
                  <div>
                    <h3 className="font-medium text-github-neutral mb-2">전화번호</h3>
                    <a 
                      href={`tel:${place.phone}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {place.phone}
                    </a>
                  </div>
                )}

                {place.placeUrl && (
                  <div>
                    <h3 className="font-medium text-github-neutral mb-2">웹사이트</h3>
                    <a 
                      href={place.placeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 break-all"
                    >
                      {place.placeUrl}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-github-neutral mb-2">카테고리</h3>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {place.category}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewList 
              placeId={place.placeId} 
              placeName={place.name}
              averageRating={place.averageRating}
            />
          )}
        </div>
      </div>
    </GitHubLayout>
  );
};

export default PlaceDetailPage;