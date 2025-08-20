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
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'map'>('info');
  const [scrollY, setScrollY] = useState(0);
  const queryClient = useQueryClient();

  // 스크롤 감지
  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 스티키 탭 표시 여부 결정 (600px 이상 스크롤하면 표시)
  const showStickyTabs = scrollY > 600;

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
      // 구글맵으로 길찾기
      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&destination_place_id=${encodeURIComponent(place.name)}`;
      window.open(url, '_blank');
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

  // 탭 클릭 시 해당 섹션으로 부드럽게 스크롤
  const handleTabClick = (tabName: 'info' | 'reviews' | 'map') => {
    setActiveTab(tabName);
    // 탭 컨텐츠 영역으로 스크롤 (약간 위쪽으로 오프셋)
    const tabContentElement = document.getElementById('tab-content');
    if (tabContentElement) {
      const offsetTop = tabContentElement.offsetTop - 100; // 100px 여유 공간
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const tabs = [
    { label: '장소 정보', href: '#info', active: activeTab === 'info', onClick: () => handleTabClick('info') },
    { label: `리뷰 (${place.reviewCount})`, href: '#reviews', active: activeTab === 'reviews', onClick: () => handleTabClick('reviews') },
    { label: '지도보기', href: '#map', active: activeTab === 'map', onClick: () => handleTabClick('map') },
  ];

  return (
    <GitHubLayout title={place.name} tabs={tabs}>
      {/* 스티키 탭 네비게이션 */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-github-border transition-all duration-300 ${
        showStickyTabs ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-github-neutral-muted hover:text-github-neutral"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                이전으로
              </button>
              <span className="text-sm font-medium text-github-neutral truncate">{place.name}</span>
            </div>
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.href}
                  onClick={tab.onClick}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    tab.active 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-github-neutral-muted hover:text-github-neutral hover:bg-github-canvas-subtle'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6" id="tab-content">
          <nav className="flex space-x-1 bg-github-canvas-subtle p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.href}
                onClick={tab.onClick}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab.active
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-github-neutral-muted hover:text-github-neutral'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
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

          {activeTab === 'map' && (
            <div className="bg-white rounded-lg border border-github-border p-6">
              <h2 className="text-xl font-semibold text-github-neutral mb-4">지도 위치</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm">지도 영역</p>
                    <p className="text-xs mt-1">Google Maps 통합 예정</p>
                  </div>
                </div>
                
                <div className="text-sm text-github-neutral-muted">
                  <p><strong>주소:</strong> {place.address}</p>
                  {place.roadAddress && place.roadAddress !== place.address && (
                    <p><strong>도로명:</strong> {place.roadAddress}</p>
                  )}
                  <p><strong>좌표:</strong> {place.latitude}, {place.longitude}</p>
                </div>

                <button
                  onClick={handleDirections}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Google Maps에서 길찾기</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </GitHubLayout>
  );
};

export default PlaceDetailPage;