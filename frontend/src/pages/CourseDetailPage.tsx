import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/axios';
import { courseService } from '../api/services/course.service';
import { useAuthStore } from '../store';
import { GitHubLayout } from '../components/layout/GitHubLayout';
import CourseMap from '../components/maps/CourseMap';
import CourseComments from '../components/course/CourseComments';
import CourseRatingModal from '../components/course/CourseRatingModal';
import StarRating from '../components/rating/StarRating';
import { convertThemesToDisplay } from '../constants/themes';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Course } from '../api/types';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'info' | 'places' | 'map' | 'comments'>('info');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // 로컬 좋아요 상태
  const [isBookmarked, setIsBookmarked] = useState(false); // 로컬 북마크 상태
  const queryClient = useQueryClient();
  
  // 위치 정보 가져오기
  const { latitude, longitude } = useGeolocation();

  // 코스 상세 정보 조회 (위치 정보 포함)
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId, latitude, longitude],
    queryFn: () => courseService.getCourseById(
      Number(courseId), 
      latitude || undefined, 
      longitude || undefined
    ),
    enabled: !!courseId,
    staleTime: 0,
  });

  // 코스 데이터가 로드되면 좋아요/북마크 상태 초기화
  React.useEffect(() => {
    if (course) {
      setIsLiked(course.isLiked || false);
      setIsBookmarked(course.isBookmarked || false);
    }
  }, [course]);


  // 평점 정보는 코스 상세 정보에 포함되어 있음 (averageRating, myRating 등)

  // 좋아요 토글 뮤테이션
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest.post(`/courses/${courseId}/like`);
      return response.data;
    },
    onSuccess: (data) => {
      // 응답에서 받은 좋아요 상태로 로컬 상태 업데이트
      if (data && typeof data.liked === 'boolean') {
        setIsLiked(data.liked);
      } else {
        // 응답에 liked 정보가 없다면 토글
        setIsLiked(prev => !prev);
      }
      // 코스 정보 다시 불러오기 (좋아요 수 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      alert('좋아요가 반영되었습니다.');
    },
    onError: (error) => {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    },
  });

  // 북마크 토글 뮤테이션
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest.post(`/courses/${courseId}/bookmark`);
      return response.data;
    },
    onSuccess: (data) => {
      // 응답에서 받은 북마크 상태로 로컬 상태 업데이트
      if (data && typeof data.bookmarked === 'boolean') {
        setIsBookmarked(data.bookmarked);
      } else {
        // 응답에 bookmarked 정보가 없다면 토글
        setIsBookmarked(prev => !prev);
      }
      // 코스 정보 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      alert('북마크가 반영되었습니다.');
    },
    onError: (error) => {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리에 실패했습니다.');
    },
  });

  const handleLike = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 좋아요 토글 실행
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 북마크 토글 실행
    bookmarkMutation.mutate();
  };

  const handleRating = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setIsRatingModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: `${course?.title} - Where We Go`,
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

  if (error || !course) {
    return (
      <GitHubLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-github-neutral mb-2">코스를 찾을 수 없습니다</h1>
            <p className="text-github-neutral-muted mb-6">
              요청하신 코스가 존재하지 않거나 접근할 수 없습니다.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              코스 목록으로 돌아가기
            </button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  const tabs = [
    { label: '코스 정보', href: '#info', active: activeTab === 'info', onClick: () => setActiveTab('info') },
    { label: `장소 목록 (${course.places?.length || 0})`, href: '#places', active: activeTab === 'places', onClick: () => setActiveTab('places') },
    { label: '지도보기', href: '#map', active: activeTab === 'map', onClick: () => setActiveTab('map') },
    { label: '댓글', href: '#comments', active: activeTab === 'comments', onClick: () => setActiveTab('comments') },
  ];

  return (
    <GitHubLayout title={course.title} tabs={tabs}>
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

        {/* 이미지 갤러리 (모든 장소의 이미지) */}
        {course.places && course.places.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {course.places
                .filter(place => place.imageUrl) // 이미지가 있는 장소만 필터링
                .sort((a, b) => a.visitOrder - b.visitOrder) // 방문 순서대로 정렬
                .map((place, index) => (
                <div key={place.placeId} className="relative group">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-48 object-cover rounded-lg border border-github-border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      // 이미지 클릭 시 새 탭에서 원본 이미지 열기
                      window.open(place.imageUrl, '_blank');
                    }}
                  />
                  {/* 이미지 위에 장소 정보 오버레이 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {place.visitOrder}
                      </div>
                      <div className="text-white text-sm font-medium truncate">
                        {place.name}
                      </div>
                    </div>
                    <div className="text-white/80 text-xs mt-1">
                      {place.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {course.places.filter(place => place.imageUrl).length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">이 코스에는 이미지가 포함된 장소가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* 코스 헤더 */}
        <div className="bg-white rounded-lg border border-github-border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-github-neutral">{course.title}</h1>
                {course.themes && course.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {convertThemesToDisplay(course.themes.slice(0, 3)).map((theme, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {theme}
                      </span>
                    ))}
                    {course.themes.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{course.themes.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-github-neutral-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{course.region}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-github-neutral-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>작성자: {course.nickname}</span>
                </div>
              </div>

              <p className="text-github-neutral-muted mb-4">{course.description}</p>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <StarRating 
                    rating={course.averageRating || 0} 
                    readonly={true}
                    size="sm"
                    showNumber={true}
                  />
                  {course.ratingCount && (
                    <span className="text-xs text-github-neutral-muted">
                      ({course.ratingCount}개 평점)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 text-github-neutral-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>좋아요 {course.likeCount || 0}</span>
                </div>

                <div className="flex items-center space-x-2 text-github-neutral-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 9a5 5 0 100-10 5 5 0 000 10zm0 0a5 5 0 01-5-5v-5h10v5a5 5 0 01-5 5z" />
                  </svg>
                  <span>{course.places?.length || 0}개 장소</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLiked 
                    ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                    : 'bg-white border-github-border text-github-neutral hover:bg-github-canvas-subtle'
                }`}
              >
                <svg 
                  className="w-4 h-4" 
                  fill={isLiked ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>
                  {likeMutation.isPending 
                    ? '처리 중...' 
                    : isLiked 
                      ? '좋아요 취소' 
                      : '좋아요'
                  }
                </span>
              </button>

              <button
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isBookmarked 
                    ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100'
                    : 'bg-white border-github-border text-github-neutral hover:bg-github-canvas-subtle'
                }`}
              >
                <svg 
                  className="w-4 h-4" 
                  fill={isBookmarked ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>
                  {bookmarkMutation.isPending 
                    ? '처리 중...' 
                    : isBookmarked 
                      ? '북마크 해제' 
                      : '북마크'
                  }
                </span>
              </button>

              <button
                onClick={handleRating}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors hover:bg-github-canvas-subtle ${
                  course.myRating ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white border-github-border text-github-neutral'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>
                  {course.myRating ? `내 평점 ${course.myRating}점` : '평점 주기'}
                </span>
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


        {/* 탭 컨텐츠 */}
        <div>
          {activeTab === 'info' && (
            <div className="bg-white rounded-lg border border-github-border p-6">
              <h2 className="text-xl font-semibold text-github-neutral mb-4">코스 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-github-neutral mb-2">설명</h3>
                  <p className="text-github-neutral-muted">{course.description}</p>
                </div>

                <div>
                  <h3 className="font-medium text-github-neutral mb-2">지역</h3>
                  <p className="text-github-neutral-muted">{course.region}</p>
                </div>

                <div>
                  <h3 className="font-medium text-github-neutral mb-2">작성자</h3>
                  <p className="text-github-neutral-muted">{course.nickname}</p>
                </div>

                <div>
                  <h3 className="font-medium text-github-neutral mb-2">생성일</h3>
                  <p className="text-github-neutral-muted">{new Date(course.createdAt).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="font-medium text-github-neutral mb-2">테마</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.themes && course.themes.length > 0 ? (
                      convertThemesToDisplay(course.themes).map((theme, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {theme}
                        </span>
                      ))
                    ) : (
                      <span className="text-github-neutral-muted text-sm">테마가 설정되지 않았습니다</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'places' && (
            <div className="bg-white rounded-lg border border-github-border p-6">
              <h2 className="text-xl font-semibold text-github-neutral mb-4">포함된 장소</h2>
              
              {course.places && course.places.length > 0 ? (
                <div className="space-y-4">
                  {course.places
                    .sort((a, b) => a.visitOrder - b.visitOrder)
                    .map((place, index) => (
                    <div key={place.placeId} className="border border-github-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {/* 장소 이미지 (있을 경우 큰 크기로 표시) */}
                      {place.imageUrl && (
                        <div className="relative">
                          <img
                            src={place.imageUrl}
                            alt={place.name}
                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // 이미지 클릭 시 새 탭에서 원본 이미지 열기
                              window.open(place.imageUrl, '_blank');
                            }}
                          />
                          {/* 방문 순서 배지 */}
                          <div className="absolute top-3 left-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                            {place.visitOrder}
                          </div>
                        </div>
                      )}
                      
                      {/* 장소 정보 */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* 이미지가 없는 경우에만 방문 순서 표시 */}
                            {!place.imageUrl && (
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                  {place.visitOrder}
                                </div>
                              </div>
                            )}
                            
                            <h4 className="font-medium text-github-neutral mb-2">
                              <button
                                onClick={() => navigate(`/places/${place.placeId}`)}
                                className="hover:text-primary-600 transition-colors"
                              >
                                {place.name}
                              </button>
                            </h4>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="inline-block px-2 py-1 bg-github-canvas-subtle text-github-neutral text-xs rounded">
                                {place.category}
                              </span>
                            </div>
                            
                            {/* 거리 정보 */}
                            <div className="space-y-2 mb-3">
                              {/* 현재 위치로부터의 거리 - 백엔드에서 계산된 값 사용 */}
                              {place.distanceFromUser && (
                                <div className="flex items-center space-x-1 text-xs text-blue-600">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span>현재 위치로부터 {place.distanceFromUser >= 1000 ? `${(place.distanceFromUser / 1000).toFixed(1)}km` : `${place.distanceFromUser}m`}</span>
                                </div>
                              )}
                              
                              {place.distanceFromPrevious && index > 0 && (
                                <div className="flex items-center space-x-1 text-xs text-green-600">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  <span>이전 장소로부터 {place.distanceFromPrevious >= 1000 ? `${(place.distanceFromPrevious / 1000).toFixed(1)}km` : `${place.distanceFromPrevious}m`}</span>
                                </div>
                              )}
                              
                              {/* 위치 정보가 없을 때 안내 메시지 */}
                              {!place.distanceFromUser && !latitude && (
                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>위치 정보를 설정하면 거리를 확인할 수 있습니다</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1 text-xs text-github-neutral-muted">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-github-neutral-muted">
                  <p>포함된 장소 정보가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div>
              {course.places && course.places.length > 0 ? (
                <CourseMap 
                  places={course.places} 
                  className="w-full"
                />
              ) : (
                <div className="bg-white rounded-lg border border-github-border p-6">
                  <div className="text-center py-8 text-github-neutral-muted">
                    <svg className="w-12 h-12 text-github-neutral-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>표시할 장소가 없습니다.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <CourseComments 
              courseId={courseId!} 
              className=""
            />
          )}
        </div>
      </div>

      {/* 평점 모달 */}
      <CourseRatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        courseId={Number(courseId)}
        courseTitle={course?.title || ''}
        existingRating={course?.myRating ? { 
          ratingId: 0, // 실제로는 사용되지 않음
          courseId: Number(courseId),
          userId: user?.id || 0,
          rating: course.myRating,
          createdAt: new Date().toISOString()
        } : null}
      />
    </GitHubLayout>
  );
};

export default CourseDetailPage;