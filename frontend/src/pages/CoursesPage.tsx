import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseCard, SearchFilter, EmptyState } from '../components/domain';
import { Button, Card, Spinner } from '../components/base';
import { GitHubLayout, GitHubSidebar, GitHubSidebarSection } from '../components/layout';
import { RegionFilter } from '../components/common/RegionFilter';
import { useInfiniteCourses, useMyCourses, useToggleCourseLike } from '../hooks/useCourses';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { useAuthStore } from '../store/authStore';
import type { Course } from '../api/types';


export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 현재 사용자 정보 가져오기
  const { user, isAuthenticated, token } = useAuthStore();
  
  // 디버깅용 로그
  console.log('=== 사용자 상태 확인 ===');
  console.log('user:', user);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('token exists:', !!token);
  console.log('user fields:', user ? Object.keys(user) : 'no user');

  // 검색어 디바운싱 (500ms 지연)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // API 파라미터 준비 (백엔드에서 검색을 지원하지 않으므로 keyword 제거, page 제거)
  const searchParams = useMemo(() => ({
    region: selectedRegion === '' ? '전체' : selectedRegion, // 빈 문자열은 '전체'로 변환
    theme: selectedTheme || undefined,
    size: 20,
  }), [selectedRegion, selectedTheme]);

  // API 호출 조건 로깅
  console.log('=== API 호출 조건 ===');
  console.log('activeTab:', activeTab);
  console.log('useInfiniteCourses enabled:', activeTab === 'all');
  console.log('useMyCourses enabled:', activeTab === 'my' && isAuthenticated);

  // React Query 훅 사용 - 활성 탭에 따라 조건부로 API 호출
  const { 
    data: infiniteCoursesData, 
    isLoading: isLoadingAll, 
    error: errorAll, 
    refetch: refetchAll,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteCourses(searchParams);
  const { data: myCoursesData, isLoading: isLoadingMy, error: errorMy, refetch: refetchMy } = useMyCourses({
    ...searchParams,
    enabled: activeTab === 'my' && isAuthenticated  // 'my' 탭이고 로그인된 경우만 호출
  });
  const toggleLikeMutation = useToggleCourseLike();

  // 현재 탭에 따라 데이터 선택
  const allInfiniteCourses = useMemo(() => {
    if (!infiniteCoursesData?.pages) return [];
    return infiniteCoursesData.pages.flatMap(page => page.content || []);
  }, [infiniteCoursesData]);

  const currentData = activeTab === 'all' ? { content: allInfiniteCourses } : myCoursesData;
  const allCourses = currentData?.content || [];
  
  // 백엔드에서 검색을 지원하지 않으므로 프론트엔드에서 필터링
  const courses = useMemo(() => {
    if (!debouncedSearchQuery) return allCourses;
    
    return allCourses.filter(course => 
      course.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [allCourses, debouncedSearchQuery]);
  
  const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingMy;
  const error = activeTab === 'all' ? errorAll : errorMy;
  const refetch = activeTab === 'all' ? refetchAll : refetchMy;

  // 무한 스크롤 적용 (all 탭일 때만)
  const observerTarget = useInfiniteScroll({
    hasNextPage: activeTab === 'all' ? hasNextPage : false,
    isFetchingNextPage,
    fetchNextPage,
  });

  // 스크롤 위치 추적 (sticky 검색바용)
  const scrollPosition = useScrollPosition();
  const isSearchSticky = scrollPosition > 150; // 150px 이상 스크롤하면 sticky 활성화

  // 지역 필터 변경 핸들러
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const handleLike = async (courseId: number) => {
    try {
      await toggleLikeMutation.mutateAsync(courseId);
    } catch (error) {
      console.error('Like toggle failed:', error);
    }
  };

  const handleViewDetails = (courseId: number) => {
    // 코스 상세 페이지로 이동
    navigate(`/courses/${courseId}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedTheme('');
  };

  // GitHub 스타일 탭 구성
  const tabs = [
    { label: '모든 코스', href: '/courses', active: activeTab === 'all', count: allInfiniteCourses?.length },
    { label: '내 코스', href: '/courses?tab=my', active: activeTab === 'my', count: myCoursesData?.content?.length },
  ];

  // 사이드바 구성
  const sidebar = (
    <GitHubSidebar>
      {/* 필터 섹션 */}
      <GitHubSidebarSection title="필터">
        <div className="space-y-4">
          {/* 2단계 지역 필터 */}
          <RegionFilter
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            className="pb-4 border-b border-gray-200"
            availableRegionsData={allCourses.map(course => ({ regionSummary: course.region }))}
          />

          {/* 테마 필터 */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              테마
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-github-border rounded-md bg-github-canvas focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            >
              <option value="">전체</option>
              <option value="자연">자연</option>
              <option value="문화">문화</option>
              <option value="맛집">맛집</option>
              <option value="카페">카페</option>
              <option value="체험">체험</option>
              <option value="힐링">힐링</option>
            </select>
          </div>

          {/* 필터 초기화 버튼 */}
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={resetFilters}
          >
            필터 초기화
          </Button>
        </div>
      </GitHubSidebarSection>

      {/* 탭 전환 섹션 */}
      <GitHubSidebarSection title="코스 보기">
        <div className="space-y-2">
          <Button
            variant={activeTab === 'all' ? 'primary' : 'ghost'}
            size="sm"
            fullWidth
            onClick={() => setActiveTab('all')}
          >
            모든 코스
          </Button>
          {isAuthenticated && (
            <Button
              variant={activeTab === 'my' ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => setActiveTab('my')}
            >
              내가 만든 코스
            </Button>
          )}
        </div>
      </GitHubSidebarSection>

      {/* 코스 생성 섹션 */}
      {isAuthenticated && (
        <GitHubSidebarSection title="코스 만들기">
          <div className="space-y-3">
            <div className="text-sm text-github-neutral">
              <p className="mb-2">나만의 여행 코스를 만들어보세요!</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => navigate('/places')}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              코스 만들기
            </Button>
          </div>
        </GitHubSidebarSection>
      )}

      {/* 비로그인 사용자 안내 */}
      {!isAuthenticated && (
        <GitHubSidebarSection title="더 많은 기능">
          <div className="space-y-3">
            <div className="text-sm text-github-neutral">
              <p className="mb-2">로그인하시면 다음 기능을 이용하실 수 있습니다:</p>
              <ul className="space-y-1 text-xs text-github-neutral-muted">
                <li>• 나만의 코스 생성</li>
                <li>• 코스 좋아요</li>
                <li>• 코스 북마크</li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => navigate('/login')}
            >
              로그인하기
            </Button>
          </div>
        </GitHubSidebarSection>
      )}
    </GitHubSidebar>
  );

  return (
    <GitHubLayout
      title="여행 코스"
      subtitle="전국 각지의 특별한 여행 코스를 발견하고, 나만의 여행을 계획해보세요"
      tabs={tabs}
      sidebar={sidebar}
    >
      {/* Sticky Search Bar */}
      <div 
        className={`sticky top-0 bg-white transition-all duration-300 ease-in-out z-30 ${
          isSearchSticky 
            ? 'shadow-md border-b border-github-border opacity-100 transform translate-y-0' 
            : 'shadow-none border-transparent opacity-0 transform -translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-github-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-github-border rounded-md bg-github-canvas text-primary-900 placeholder-github-neutral-muted focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                placeholder="코스 검색..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Original Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-github-neutral-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-github-border rounded-md bg-github-canvas text-primary-900 placeholder-github-neutral-muted focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            placeholder="코스 이름이나 설명으로 검색하세요..."
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="md" className="text-center border-red-200 bg-red-50">
          <p className="text-red-700 mb-3 text-sm">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </Card>
      )}

      {/* Course Grid */}
      {!isLoading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div 
              key={course.courseId || course.id || `course-${index}`}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CourseCard
                id={course.courseId || course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnailUrl || ''}
                region={course.region}
                theme={course.themes?.[0] || course.theme || ''}
                rating={course.averageRating || course.rating || 0}
                likeCount={course.likeCount || 0}
                duration={course.duration || ''}
                author={course.author || { 
                  name: user?.username || user?.name || user?.email || '작성자', 
                  avatar: user?.avatar || user?.profileImage || '' 
                }}
                onLike={handleLike}
                onViewDetails={handleViewDetails}
              />
            </div>
          ))}
        </div>
      )}

      {/* 무한 스크롤 트리거 및 로딩 표시 */}
      {!isLoading && !error && courses.length > 0 && activeTab === 'all' && (
        <div ref={observerTarget} className="py-8 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Spinner size="sm" />
              <span className="text-sm">더 많은 코스를 불러오는 중...</span>
            </div>
          )}
          {!hasNextPage && !isFetchingNextPage && (
            <div className="text-sm text-gray-500">
              모든 코스를 불러왔습니다.
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && courses.length === 0 && (
        <Card variant="outlined" padding="lg" className="text-center">
          <div className="py-8">
            <svg className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 713 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-lg font-medium text-primary-900 mb-2">
              {activeTab === 'my' ? "아직 생성한 코스가 없습니다" : "검색 결과가 없습니다"}
            </h3>
            <p className="text-github-neutral mb-4">
              {activeTab === 'my' 
                ? "장소 페이지에서 여러 장소를 선택해서 나만의 코스를 만들어보세요!" 
                : "다른 검색어나 필터를 시도해보세요."}
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={activeTab === 'my' ? () => window.location.href = '/places' : resetFilters}
            >
              {activeTab === 'my' ? "장소 선택하러 가기" : "필터 초기화"}
            </Button>
          </div>
        </Card>
      )}

      {/* Create Course CTA */}
      {courses.length > 0 && (
        <Card variant="outlined" padding="lg" className="text-center bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-200 mt-8">
          <div className="py-4">
            <svg className="mx-auto h-8 w-8 text-secondary-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">나만의 코스를 만들어보세요!</h3>
            <p className="text-github-neutral mb-4">특별한 여행 경험을 다른 사람들과 공유해보세요.</p>
            <Button 
              variant="primary" 
              size="md" 
              onClick={() => window.location.href = '/places'}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              코스 만들기
            </Button>
          </div>
        </Card>
      )}
    </GitHubLayout>
  );
};