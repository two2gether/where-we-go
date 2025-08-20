import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api/axios';
import { courseService } from '../api/services/course.service';
import { bookmarkService } from '../api/services/bookmark.service';
import { useAuthStore } from '../store';
import { GitHubLayout } from '../components/layout/GitHubLayout';
import CourseMap from '../components/maps/CourseMap';
import CourseComments from '../components/course/CourseComments';
import CourseRatingModal from '../components/course/CourseRatingModal';
import CourseEditForm from '../components/course/CourseEditForm';
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 편집 모달 상태
  const [isLiked, setIsLiked] = useState(false); // 로컬 좋아요 상태
  const [isBookmarked, setIsBookmarked] = useState(false); // 로컬 북마크 상태
  const [scrollY, setScrollY] = useState(0);
  const queryClient = useQueryClient();
  
  // 위치 정보 가져오기
  const { latitude, longitude } = useGeolocation();

  // 스크롤 감지
  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 스티키 탭 표시 여부 결정 (600px 이상 스크롤하면 표시)
  const showStickyTabs = scrollY > 600;

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
      return courseService.toggleLike(parseInt(courseId!));
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
    },
    onError: (error) => {
      console.error('좋아요 처리 실패:', error);
      // 에러 시 원래 상태로 롤백
      setIsLiked(prev => !prev);
    },
  });

  // 북마크 토글 뮤테이션
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return bookmarkService.toggleBookmark({
        targetId: courseId!,
        type: 'COURSE'
      });
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
    },
    onError: (error) => {
      console.error('북마크 처리 실패:', error);
      // 에러 시 원래 상태로 롤백
      setIsBookmarked(prev => !prev);
    },
  });

  const handleLike = () => {
    if (!user) {
      // 로그인하지 않은 사용자는 아무 동작하지 않음 (버튼이 비활성화됨)
      return;
    }
    
    // 낙관적 업데이트: 즉시 UI 상태 변경
    setIsLiked(prev => !prev);
    // 좋아요 토글 실행
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!user) {
      // 로그인하지 않은 사용자는 아무 동작하지 않음 (버튼이 비활성화됨)
      return;
    }
    
    // 낙관적 업데이트: 즉시 UI 상태 변경
    setIsBookmarked(prev => !prev);
    // 북마크 토글 실행
    bookmarkMutation.mutate();
  };

  const handleRating = () => {
    if (!user) {
      // 로그인하지 않은 사용자는 아무 동작하지 않음 (버튼이 비활성화되어 있어야 함)
      return;
    }
    setIsRatingModalOpen(true);
  };


  const handleEdit = () => {
    if (!user) {
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // 코스 데이터 새로고침은 CourseEditForm에서 처리됨
    // 추가로 현재 페이지의 쿼리도 다시 실행
    queryClient.invalidateQueries({ 
      queryKey: ['course', courseId],
      refetchType: 'active' // 현재 활성화된 쿼리만 다시 실행
    });
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  // 코스 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: () => courseService.deleteCourse(Number(courseId)),
    onSuccess: () => {
      alert('코스가 삭제되었습니다.');
      navigate('/courses');
    },
    onError: (error) => {
      console.error('코스 삭제 실패:', error);
      alert('코스 삭제에 실패했습니다.');
    },
  });

  const handleDelete = () => {
    if (!user || !isAuthor) {
      return;
    }
    
    if (confirm('정말로 이 코스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteMutation.mutate();
    }
  };

  // 현재 사용자가 코스 작성자인지 확인 (닉네임으로 비교)
  const isAuthor = user && course && course.nickname === user.nickname;

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

  // 탭 클릭 시 해당 섹션으로 부드럽게 스크롤
  const handleTabClick = (tabName: 'info' | 'places' | 'map' | 'comments') => {
    setActiveTab(tabName);
    // 탭 컨텐츠 영역으로 스크롤 (약간 위쪽으로 오프셋)
    const tabContentElement = document.getElementById('tab-content');
    if (tabContentElement) {
      const offsetTop = tabContentElement.offsetTop - 100; // 100px 여유 공간
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const tabs = [
    { label: '코스 정보', href: '#info', active: activeTab === 'info', onClick: () => handleTabClick('info') },
    { label: `장소 목록 (${course.places?.length || 0})`, href: '#places', active: activeTab === 'places', onClick: () => handleTabClick('places') },
    { label: '지도보기', href: '#map', active: activeTab === 'map', onClick: () => handleTabClick('map') },
    { label: '댓글', href: '#comments', active: activeTab === 'comments', onClick: () => handleTabClick('comments') },
  ];

  return (
    <GitHubLayout title={course.title} tabs={tabs}>
      {/* 스티키 탭 네비게이션 */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-github-border transition-all duration-300 ${
        showStickyTabs ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-github-neutral-muted hover:text-github-neutral hover:bg-github-canvas-subtle rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                뒤로
              </button>
              <div className="h-6 w-px bg-github-border"></div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-github-neutral truncate max-w-[300px]">
                  {course.title}
                </h1>
                {course.themes && course.themes.length > 0 && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    {convertThemesToDisplay(course.themes)[0]}
                  </span>
                )}
              </div>
            </div>
            
            {/* 스티키 탭 메뉴 */}
            <div className="flex items-center border border-github-border rounded-lg overflow-hidden bg-white">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={tab.onClick}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-r border-github-border last:border-r-0 ${
                    tab.active 
                      ? 'bg-primary-600 text-white' 
                      : 'text-github-neutral hover:bg-github-canvas-subtle'
                  }`}
                >
                  {tab.label.split(' ')[0]} {/* 첫 단어만 표시 */}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 py-2 text-sm text-github-neutral-muted hover:text-github-neutral hover:bg-github-canvas-subtle rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전으로
          </button>
        </div>

        {/* 메인 컨텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 코스 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 코스 헤더 카드 */}
            <div className="bg-white rounded-xl shadow-sm border border-github-border overflow-hidden">
              {/* 대표 이미지 (첫 번째 장소 이미지 또는 기본 이미지) */}
              <div className="relative h-80 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-50">
                {course.places && course.places.length > 0 && course.places[0].imageUrl ? (
                  <img
                    src={course.places[0].imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-20 h-20 text-primary-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <p className="text-primary-600 font-semibold text-lg">{course.region}</p>
                      <p className="text-primary-500 text-sm mt-1">여행 코스</p>
                    </div>
                  </div>
                )}
                
                {/* 헤더 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    {/* 상단: 테마 및 메타 정보 */}
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {course.themes && course.themes.length > 0 && (
                          convertThemesToDisplay(course.themes.slice(0, 4)).map((theme, index) => (
                            <span key={index} className="px-3 py-1 bg-white/25 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/30">
                              {theme}
                            </span>
                          ))
                        )}
                        {course.themes && course.themes.length > 4 && (
                          <span className="px-3 py-1 bg-white/25 backdrop-blur-sm text-white text-sm rounded-full border border-white/30">
                            +{course.themes.length - 4}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{course.region}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{course.places?.length || 0}개 장소</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 9a5 5 0 100-10 5 5 0 000 10zm0 0a5 5 0 01-5-5v-5h10v5a5 5 0 01-5 5z" />
                          </svg>
                          <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* 메인 타이틀 */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{course.title}</h1>
                    
                    {/* 하단: 작성자 및 통계 */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{course.nickname}</p>
                          <p className="text-white/70 text-sm">코스 작성자</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <StarRating 
                              rating={course.averageRating || 0} 
                              readonly={true}
                              size="sm"
                              showNumber={false}
                            />
                          </div>
                          <div className="text-white font-bold text-lg">{(course.averageRating || 0).toFixed(1)}</div>
                        </div>
                        
                        <div className="w-px h-12 bg-white/30"></div>
                        
                        <div className="text-center">
                          <svg className="w-5 h-5 text-red-400 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <div className="text-white font-bold text-lg">{course.likeCount || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 코스 설명 */}
              <div className="p-6">
                <div className="bg-github-canvas-subtle rounded-lg p-4">
                  <h3 className="font-medium text-github-neutral mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    코스 설명
                  </h3>
                  <p className="text-github-neutral-muted leading-relaxed">{course.description}</p>
                </div>
              </div>
            </div>

            {/* 이미지 갤러리 카드 */}
            {course.places && course.places.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-github-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-github-neutral">코스 갤러리</h2>
                  <span className="text-sm text-github-neutral-muted">
                    {course.places.filter(place => place.imageUrl).length}개 사진
                  </span>
                </div>
                
                {course.places.filter(place => place.imageUrl).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {course.places
                      .filter(place => place.imageUrl)
                      .sort((a, b) => a.visitOrder - b.visitOrder)
                      .map((place) => (
                      <div key={place.placeId} className="relative group">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-40 object-cover rounded-lg border border-github-border cursor-pointer hover:opacity-90 transition-all hover:shadow-md"
                          onClick={() => window.open(place.imageUrl, '_blank')}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {place.visitOrder}
                            </div>
                            <div className="text-white text-sm font-medium truncate">
                              {place.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-github-canvas-subtle rounded-lg border-2 border-dashed border-github-border">
                    <svg className="w-12 h-12 text-github-neutral-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-github-neutral-muted">이 코스에는 이미지가 포함된 장소가 없습니다</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 오른쪽: 액션 패널 */}
          <div className="space-y-6">
            {/* 액션 버튼들 카드 */}
            <div className="bg-white rounded-xl shadow-sm border border-github-border p-6">
              <h3 className="text-lg font-semibold text-github-neutral mb-4">액션</h3>
              <div className="space-y-3">
                {/* 편집 & 삭제 버튼들 (작성자만) */}
                {isAuthor && (
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-github-border">
                    <button
                      onClick={handleEdit}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </button>
                  </div>
                )}

                {/* 사용자 액션 버튼들 */}
                <button
                  onClick={handleLike}
                  disabled={likeMutation.isPending || !user}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLiked 
                      ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  } ${!user ? 'opacity-50' : ''}`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill={isLiked ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{isLiked ? '좋아요 취소' : '좋아요'}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending || !user}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isBookmarked 
                      ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  } ${!user ? 'opacity-50' : ''}`}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill={isBookmarked ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>{isBookmarked ? '북마크 해제' : '북마크'}</span>
                </button>

                <button
                  onClick={handleRating}
                  disabled={!user}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    course.myRating 
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  } ${!user ? 'opacity-50' : ''}`}
                >
                  <svg className="w-5 h-5" fill={course.myRating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>{course.myRating ? `평점 수정 (${course.myRating}점)` : '평점 남기기'}</span>
                </button>

                {!user && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700 text-center">
                      로그인하면 좋아요, 북마크, 평점 기능을 사용할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 여행 가이드 카드 */}
            <div className="bg-white rounded-xl shadow-sm border border-github-border p-6">
              <h3 className="text-lg font-semibold text-github-neutral mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                여행 정보
              </h3>
              <div className="space-y-4">
                <div className="bg-github-canvas-subtle rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-github-neutral">방문 장소</p>
                      <p className="text-sm text-github-neutral-muted">{course.places?.length || 0}곳의 특별한 장소</p>
                    </div>
                  </div>
                  
                  {course.places && course.places.length > 0 && (
                    <div className="text-xs text-github-neutral-muted">
                      <p className="mb-1">추천 방문 순서:</p>
                      <div className="flex flex-wrap gap-1">
                        {course.places.slice(0, 3).map((place, index) => (
                          <span key={place.placeId} className="inline-flex items-center gap-1 px-2 py-1 bg-white border rounded-md">
                            <span className="w-4 h-4 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">
                              {place.visitOrder}
                            </span>
                            <span className="truncate max-w-[80px]">{place.name}</span>
                          </span>
                        ))}
                        {course.places.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                            +{course.places.length - 3}곳
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-primary-50 rounded-lg">
                    <div className="text-lg font-bold text-primary-600">{(course.averageRating || 0).toFixed(1)}</div>
                    <div className="text-xs text-primary-600">평점</div>
                    <StarRating 
                      rating={course.averageRating || 0} 
                      readonly={true}
                      size="xs"
                      showNumber={false}
                    />
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{course.likeCount || 0}</div>
                    <div className="text-xs text-red-600">좋아요</div>
                    <svg className="w-3 h-3 text-red-500 mx-auto mt-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>

                <div className="pt-4 border-t border-github-border">
                  <div className="text-xs text-github-neutral-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <span>작성자</span>
                      <span className="font-medium text-github-neutral">{course.nickname}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>생성일</span>
                      <span className="font-medium text-github-neutral">
                        {new Date(course.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>공개 상태</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.isPublic 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {course.isPublic ? '공개' : '비공개'}
                      </span>
                    </div>
                  </div>
                </div>

                {course.themes && course.themes.length > 0 && (
                  <div className="pt-4 border-t border-github-border">
                    <p className="text-sm font-medium text-github-neutral mb-2">코스 테마</p>
                    <div className="flex flex-wrap gap-1">
                      {convertThemesToDisplay(course.themes).map((theme, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md font-medium">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* 탭 컨텐츠 */}
        <div id="tab-content" className="mt-8">
          {activeTab === 'info' && (
            <div className="bg-white rounded-xl shadow-sm border border-github-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-github-neutral">코스 상세 정보</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-github-neutral mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      설명
                    </h3>
                    <p className="text-github-neutral-muted leading-relaxed bg-github-canvas-subtle p-3 rounded-lg">
                      {course.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-github-neutral mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      지역
                    </h3>
                    <p className="text-github-neutral-muted font-medium">{course.region}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-github-neutral mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      작성자
                    </h3>
                    <p className="text-github-neutral-muted font-medium">{course.nickname}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-github-neutral mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 9a5 5 0 100-10 5 5 0 000 10zm0 0a5 5 0 01-5-5v-5h10v5a5 5 0 01-5 5z" />
                      </svg>
                      생성일
                    </h3>
                    <p className="text-github-neutral-muted font-medium">
                      {new Date(course.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {course.themes && course.themes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-github-border">
                  <h3 className="font-medium text-github-neutral mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    테마
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {convertThemesToDisplay(course.themes).map((theme, index) => (
                      <span key={index} className="px-3 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'places' && (
            <div className="bg-white rounded-xl shadow-sm border border-github-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-github-neutral">여행 장소</h2>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                  {course.places?.length || 0}개 장소
                </span>
              </div>
              
              {course.places && course.places.length > 0 ? (
                <div className="space-y-6">
                  {course.places
                    .sort((a, b) => a.visitOrder - b.visitOrder)
                    .map((place, index) => (
                    <div key={place.placeId} className="group border border-github-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-200">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        {/* 이미지 영역 */}
                        <div className="relative lg:col-span-1">
                          {place.imageUrl ? (
                            <img
                              src={place.imageUrl}
                              alt={place.name}
                              className="w-full h-48 lg:h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(place.imageUrl, '_blank')}
                            />
                          ) : (
                            <div className="w-full h-48 lg:h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {/* 방문 순서 배지 */}
                          <div className="absolute top-4 left-4 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                            {place.visitOrder}
                          </div>
                        </div>
                        
                        {/* 정보 영역 */}
                        <div className="lg:col-span-2 p-6">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="text-lg font-semibold text-github-neutral group-hover:text-primary-600 transition-colors">
                                  <button
                                    onClick={() => navigate(`/places/${place.placeId}`)}
                                    className="hover:text-primary-600 transition-colors text-left"
                                  >
                                    {place.name}
                                  </button>
                                </h4>
                                <span className="px-2 py-1 bg-github-canvas-subtle text-github-neutral text-xs rounded-md font-medium ml-3 flex-shrink-0">
                                  {place.category}
                                </span>
                              </div>
                              
                              {/* 거리 정보 */}
                              <div className="flex flex-wrap gap-4 mb-4">
                                {place.distanceFromUser && (
                                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>현재 위치에서 {place.distanceFromUser >= 1000 ? `${(place.distanceFromUser / 1000).toFixed(1)}km` : `${place.distanceFromUser}m`}</span>
                                  </div>
                                )}
                                
                                {place.distanceFromPrevious && index > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-md">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span>이전 장소에서 {place.distanceFromPrevious >= 1000 ? `${(place.distanceFromPrevious / 1000).toFixed(1)}km` : `${place.distanceFromPrevious}m`}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-github-neutral-muted pt-3 border-t border-github-border">
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span>{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</span>
                              </div>
                              <button
                                onClick={() => navigate(`/places/${place.placeId}`)}
                                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                              >
                                장소 상세보기 →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-github-neutral-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-github-neutral-muted">포함된 장소 정보가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="bg-white rounded-xl shadow-sm border border-github-border overflow-hidden">
              {course.places && course.places.length > 0 ? (
                <>
                  <div className="p-6 border-b border-github-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-github-neutral">코스 지도</h2>
                    </div>
                  </div>
                  <CourseMap 
                    places={course.places} 
                    className="w-full min-h-[500px]"
                  />
                </>
              ) : (
                <div className="p-6">
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-github-neutral-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-github-neutral-muted">표시할 장소가 없습니다.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="bg-white rounded-xl shadow-sm border border-github-border">
              <div className="p-6 border-b border-github-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-github-neutral">댓글</h2>
                </div>
              </div>
              <CourseComments 
                courseId={courseId!} 
                className="p-6"
              />
            </div>
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

      {/* 편집 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CourseEditForm
              course={course}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}
    </GitHubLayout>
  );
};

export default CourseDetailPage;