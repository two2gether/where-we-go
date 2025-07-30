import React, { useState, useMemo } from 'react';
import { CourseCard, SearchFilter, EmptyState } from '../components/domain';
import { Button, Card, Spinner } from '../components/base';
import { useCourses, useMyCourses, useToggleCourseLike } from '../hooks/useCourses';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/authStore';
import type { Course } from '../api/types';


export const CoursesPage: React.FC = () => {
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

  // API 파라미터 준비 (디바운싱된 검색어 사용)
  const searchParams = useMemo(() => ({
    keyword: debouncedSearchQuery || undefined,
    region: selectedRegion || '전체', // 백엔드 필수 필드
    theme: selectedTheme || undefined,
    page: 0,
    size: 20,
  }), [debouncedSearchQuery, selectedRegion, selectedTheme]);

  // React Query 훅 사용
  const { data: allCoursesData, isLoading: isLoadingAll, error: errorAll, refetch: refetchAll } = useCourses(searchParams);
  const { data: myCoursesData, isLoading: isLoadingMy, error: errorMy, refetch: refetchMy } = useMyCourses(searchParams);
  const toggleLikeMutation = useToggleCourseLike();

  // 현재 탭에 따라 데이터 선택
  const currentData = activeTab === 'all' ? allCoursesData : myCoursesData;
  const courses = currentData?.content || [];
  const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingMy;
  const error = activeTab === 'all' ? errorAll : errorMy;
  const refetch = activeTab === 'all' ? refetchAll : refetchMy;

  const handleLike = async (courseId: number) => {
    try {
      await toggleLikeMutation.mutateAsync(courseId);
    } catch (error) {
      console.error('Like toggle failed:', error);
    }
  };

  const handleViewDetails = (courseId: number) => {
    // TODO: 코스 상세 페이지로 이동
    console.log('View course details:', courseId);
    // 향후 라우터를 통한 페이지 이동 구현
    // navigate(`/courses/${courseId}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedTheme('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">여행 코스</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          전국 각지의 특별한 여행 코스를 발견하고, 나만의 여행을 계획해보세요.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            전체 코스
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'my'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            내 코스
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="코스 이름이나 설명으로 검색하세요..."
        filters={[
          {
            label: '지역',
            value: selectedRegion,
            options: [
              { value: '', label: '전체' },
              { value: '제주도', label: '제주도' },
              { value: '경주', label: '경주' },
              { value: '부산', label: '부산' },
              { value: '서울', label: '서울' },
              { value: '강릉', label: '강릉' }
            ],
            onChange: setSelectedRegion
          },
          {
            label: '테마',
            value: selectedTheme,
            options: [
              { value: '', label: '전체' },
              { value: '자연', label: '자연' },
              { value: '문화', label: '문화' },
              { value: '맛집', label: '맛집' },
              { value: '액티비티', label: '액티비티' },
              { value: '휴양', label: '휴양' }
            ],
            onChange: setSelectedTheme
          }
        ]}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="lg" className="text-center">
          <p className="text-error-600 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="outline" onClick={() => refetch()}>
            다시 시도
          </Button>
        </Card>
      )}

      {/* Course Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CourseCard
              key={course.courseId || course.id || `course-${index}`}
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
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && courses.length === 0 && (
        <EmptyState
          title={activeTab === 'my' ? "아직 생성한 코스가 없습니다" : "검색 결과가 없습니다"}
          description={
            activeTab === 'my' 
              ? "장소 페이지에서 여러 장소를 선택해서 나만의 코스를 만들어보세요!" 
              : "다른 검색어나 필터를 시도해보세요."
          }
          actionLabel={activeTab === 'my' ? "장소 선택하러 가기" : "필터 초기화"}
          onAction={activeTab === 'my' ? () => window.location.href = '/places' : resetFilters}
        />
      )}

      {/* Create Course CTA */}
      <Card variant="default" padding="lg" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">나만의 코스를 만들어보세요!</h2>
        <p className="text-primary-100 mb-6">특별한 여행 경험을 다른 사람들과 공유해보세요.</p>
        <Button variant="primary" size="lg" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold">
          코스 만들기
        </Button>
      </Card>
    </div>
  );
};