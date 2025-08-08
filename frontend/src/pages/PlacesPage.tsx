import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaceCard, SearchFilter, EmptyState, PlaceDetailModal, AddToCourseModal, CourseCreationModal } from '../components/domain';
import { Button, Card, Spinner } from '../components/base';
import { GitHubLayout, GitHubSidebar, GitHubSidebarSection } from '../components/layout';
import { usePlaces } from '../hooks/usePlaces';
import { useToggleBookmark } from '../hooks/useBookmarks';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../api/axios';
import type { Place } from '../api/types';
import { KOREA_REGIONS } from '../constants/regions';


export const PlacesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddToCourseModalOpen, setIsAddToCourseModalOpen] = useState(false);
  const [selectedPlaceForCourse, setSelectedPlaceForCourse] = useState<{ id: string; name: string } | null>(null);
  
  // 다중 선택 상태 관리
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [selectedPlacesData, setSelectedPlacesData] = useState<Place[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isCourseCreationModalOpen, setIsCourseCreationModalOpen] = useState(false);
  
  // 북마크 상태를 로컬에서 관리 (localStorage에서 초기값 로드)
  const [localBookmarkStates, setLocalBookmarkStates] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bookmarkStates');
      const parsed = saved ? JSON.parse(saved) : {};
      console.log('📦 Initial localStorage bookmarkStates:', parsed);
      return parsed;
    } catch {
      console.log('📦 Failed to parse localStorage bookmarkStates');
      return {};
    }
  });

  // 검색어 디바운싱 (500ms 지연)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // API 파라미터 준비 (디바운싱된 검색어 사용)
  const searchParams = useMemo(() => ({
    keyword: debouncedSearchQuery || undefined,
    category: selectedCategory || undefined,
    region: selectedRegion || undefined,
    page: 0,
    size: 20,
  }), [debouncedSearchQuery, selectedCategory, selectedRegion]);

  // React Query 훅 사용
  const { data: places, isLoading, error, refetch } = usePlaces(searchParams);

  // 검색 결과에서 동적으로 지역 목록 생성
  const availableRegions = useMemo(() => {
    const regions = [{ value: '', label: '전체' }];
    
    if (places && places.length > 0) {
      const regionSet = new Set<string>();
      places.forEach(place => {
        if (place.regionSummary) {
          // 지역 문자열을 파싱해서 주요 지역만 추출
          const mainRegion = place.regionSummary.split(' ')[0];
          if (mainRegion && mainRegion !== '전체') {
            regionSet.add(mainRegion);
          }
        }
      });
      
      // 정렬해서 지역 옵션 생성
      Array.from(regionSet)
        .sort()
        .forEach(region => {
          regions.push({ value: region, label: region });
        });
    }
    
    return regions;
  }, [places]);

  // 초기 로드 완료 시 플래그 업데이트
  useEffect(() => {
    if (isInitialLoad && (places || error)) {
      setIsInitialLoad(false);
    }
  }, [places, error, isInitialLoad]);
  const toggleBookmarkMutation = useToggleBookmark();

  // 사용자 로그인 상태가 변경될 때 북마크 상태 초기화
  useEffect(() => {
    if (!isAuthenticated) {
      // 로그아웃 시 북마크 상태 초기화
      setLocalBookmarkStates({});
      try {
        localStorage.removeItem('bookmarkStates');
        console.log('🧹 Cleared bookmark states on logout');
      } catch (error) {
        console.warn('Failed to clear bookmark states:', error);
      }
    }
  }, [isAuthenticated]);

  // 서버에서 장소 데이터를 불러올 때 북마크 상태 동기화 (서버 상태 우선)
  useEffect(() => {
    if (places && places.length > 0 && isAuthenticated) {
      console.log('🔄 Syncing bookmark states with server data...');
      const serverBookmarkStates: Record<string, boolean> = {};
      
      places.forEach(place => {
        const serverState = place.isBookmarked || false;
        serverBookmarkStates[place.placeId] = serverState;
        console.log(`🔍 Place ${place.name}: server=${serverState}, local=${localBookmarkStates[place.placeId]}`);
      });
      
      console.log('📝 Server bookmark states:', serverBookmarkStates);
      setLocalBookmarkStates(serverBookmarkStates);
      
      try {
        localStorage.setItem('bookmarkStates', JSON.stringify(serverBookmarkStates));
        console.log('💾 Saved server states to localStorage');
      } catch (error) {
        console.warn('Failed to save bookmark states to localStorage:', error);
      }
    } else if (places && places.length > 0 && !isAuthenticated) {
      // 비로그인 사용자의 경우 모든 북마크 상태를 false로 설정
      setLocalBookmarkStates({});
    }
  }, [places, isAuthenticated]);

  const toggleBookmark = async (placeId: string) => {
    // 비로그인 사용자는 알림만 표시
    if (!isAuthenticated) {
      alert('북마크 기능을 사용하려면 로그인이 필요합니다.');
      return;
    }
    
    try {
      // 현재 북마크 상태 확인 (로컬 상태 우선, 없으면 서버 상태)
      const currentPlace = places?.find(p => p.placeId === placeId);
      const serverBookmarkState = currentPlace?.isBookmarked || false;
      const localBookmarkState = localBookmarkStates[placeId];
      const isCurrentlyBookmarked = localBookmarkState !== undefined ? localBookmarkState : serverBookmarkState;
      
      console.log(`Current bookmark state for ${placeId}:`, isCurrentlyBookmarked);
      
      // 즉시 UI 업데이트 (낙관적 업데이트)
      const newBookmarkState = !isCurrentlyBookmarked;
      const newStates = {
        ...localBookmarkStates,
        [placeId]: newBookmarkState
      };
      setLocalBookmarkStates(newStates);
      
      // localStorage에 저장
      try {
        localStorage.setItem('bookmarkStates', JSON.stringify(newStates));
      } catch (error) {
        console.warn('Failed to save bookmark states to localStorage:', error);
      }
      
      let result;
      try {
        if (isCurrentlyBookmarked) {
          // 이미 북마크된 상태라면 제거
          result = await apiRequest.delete(`/places/${placeId}/bookmark`);
          console.log('Bookmark removed:', result);
        } else {
          // 북마크되지 않은 상태라면 추가
          result = await apiRequest.post(`/places/${placeId}/bookmark`);
          console.log('Bookmark added:', result);
        }
      } catch (apiError: any) {
        // 409 Conflict 에러가 발생한 경우 (이미 북마크 존재)
        if (apiError.response?.status === 409) {
          console.log('Conflict detected - bookmark already exists, trying to remove...');
          result = await apiRequest.delete(`/places/${placeId}/bookmark`);
          console.log('Bookmark removed after conflict:', result);
          // 409 에러의 경우 실제로는 제거되었으므로 상태를 false로 설정
          const conflictStates = {
            ...localBookmarkStates,
            [placeId]: false
          };
          setLocalBookmarkStates(conflictStates);
          try {
            localStorage.setItem('bookmarkStates', JSON.stringify(conflictStates));
          } catch (error) {
            console.warn('Failed to save bookmark states to localStorage:', error);
          }
        } else {
          // API 에러 시 원래 상태로 되돌리기
          const revertStates = {
            ...localBookmarkStates,
            [placeId]: isCurrentlyBookmarked
          };
          setLocalBookmarkStates(revertStates);
          try {
            localStorage.setItem('bookmarkStates', JSON.stringify(revertStates));
          } catch (error) {
            console.warn('Failed to save bookmark states to localStorage:', error);
          }
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Bookmark toggle failed:', error);
    }
  };

  const handleViewDetails = (placeId: string) => {
    // 장소 상세 페이지로 이동
    navigate(`/places/${placeId}`);
  };

  const handleAddToCourse = (placeId: string) => {
    // 비로그인 사용자는 알림만 표시
    if (!isAuthenticated) {
      alert('코스 추가 기능을 사용하려면 로그인이 필요합니다.');
      return;
    }
    
    const place = places?.find(p => p.placeId === placeId);
    if (place) {
      setSelectedPlaceForCourse({ id: placeId, name: place.name });
      setIsAddToCourseModalOpen(true);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRegion('');
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPlaceId(null);
  };

  const handleCloseAddToCourseModal = () => {
    setIsAddToCourseModalOpen(false);
    setSelectedPlaceForCourse(null);
  };

  const handleConfirmAddToCourse = async (courseId: number, placeId: string) => {
    try {
      // TODO: 실제 API 구현 필요 - 백엔드에 코스에 장소 추가 API 확인 필요
      console.log('Adding place to course:', { courseId, placeId });
      
      // 임시 API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 성공 메시지 표시
      alert(`장소가 코스에 추가되었습니다!`);
      
      // 모달 닫기
      setIsAddToCourseModalOpen(false);
      setSelectedPlaceForCourse(null);
      
    } catch (error) {
      console.error('Failed to add place to course:', error);
      alert('코스에 장소를 추가하는데 실패했습니다.');
    }
  };

  // 다중 선택 관련 핸들러들
  const toggleSelectionMode = () => {
    // 비로그인 사용자는 알림만 표시
    if (!isAuthenticated) {
      alert('장소 선택 기능을 사용하려면 로그인이 필요합니다.');
      return;
    }
    
    setIsSelectionMode(!isSelectionMode);
    setSelectedPlaces(new Set());
    setSelectedPlacesData([]);
  };

  const handlePlaceSelect = (placeId: string) => {
    const newSelectedPlaces = new Set(selectedPlaces);
    const newSelectedPlacesData = [...selectedPlacesData];
    
    if (newSelectedPlaces.has(placeId)) {
      // 선택 해제
      newSelectedPlaces.delete(placeId);
      const updatedData = newSelectedPlacesData.filter(place => place.placeId !== placeId);
      setSelectedPlacesData(updatedData);
    } else {
      // 선택 추가
      newSelectedPlaces.add(placeId);
      const placeData = places?.find(place => place.placeId === placeId);
      if (placeData && !newSelectedPlacesData.some(p => p.placeId === placeId)) {
        newSelectedPlacesData.push(placeData);
        setSelectedPlacesData(newSelectedPlacesData);
      }
    }
    setSelectedPlaces(newSelectedPlaces);
  };

  const handleCreateCourseWithSelected = () => {
    if (selectedPlaces.size === 0) {
      alert('코스에 포함할 장소를 최소 1개 이상 선택해주세요.');
      return;
    }
    setIsCourseCreationModalOpen(true);
  };

  const handleCloseCourseCreationModal = () => {
    setIsCourseCreationModalOpen(false);
  };

  const handleConfirmCourseCreation = async (courseData: { title: string; description: string; themes: string[]; region: string; isPublic: boolean; orderedPlaceIds: string[] }) => {
    try {
      console.log('Creating course with data:', courseData);
      
      // 실제 API 호출
      const courseCreateRequest = {
        title: courseData.title,
        description: courseData.description,
        themes: courseData.themes,
        region: courseData.region,
        isPublic: courseData.isPublic,
        placeIds: courseData.orderedPlaceIds // API 스펙에 맞게 필드명 변경
      };
      
      const response = await apiRequest.post('/courses', courseCreateRequest);
      console.log('Course created successfully:', response);
      
      // 성공 메시지 표시
      alert(`"${courseData.title}" 코스가 성공적으로 생성되었습니다!`);
      
      // 상태 초기화
      setIsCourseCreationModalOpen(false);
      setIsSelectionMode(false);
      setSelectedPlaces(new Set());
      setSelectedPlacesData([]);
      
      // 코스 페이지로 이동 (내 코스 탭)
      setTimeout(() => {
        window.location.href = '/courses';
      }, 1000);
      
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('코스 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // GitHub 스타일 탭 구성
  const tabs = [
    { label: '모든 장소', href: '/places', active: true, count: places?.length },
    { label: '북마크', href: '/bookmarks', active: false },
    { label: '최근 본 장소', href: '/recent', active: false },
  ];

  // 사이드바 구성
  const sidebar = (
    <GitHubSidebar>
      {/* 필터 섹션 */}
      <GitHubSidebarSection title="필터">
        <div className="space-y-4">
          {/* 카테고리 필터 */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-github-border rounded-md bg-github-canvas focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            >
              <option value="">전체</option>
              <option value="관광지">관광지</option>
              <option value="맛집">맛집</option>
              <option value="숙박">숙박</option>
              <option value="문화재">문화재</option>
              <option value="시장">시장</option>
              <option value="카페">카페</option>
            </select>
          </div>

          {/* 지역 필터 */}
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-2">
              지역
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-github-border rounded-md bg-github-canvas focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
            >
              {availableRegions.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
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
          
          {/* 북마크 상태 초기화 버튼 (디버깅용) */}
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => {
                setLocalBookmarkStates({});
                localStorage.removeItem('bookmarkStates');
                console.log('🧹 Manually cleared all bookmark states');
                // 페이지 새로고침으로 서버 상태 다시 로드
                window.location.reload();
              }}
              className="mt-2 text-xs"
            >
              북마크 상태 초기화
            </Button>
          )}
        </div>
      </GitHubSidebarSection>

      {/* 선택 모드 섹션 */}
      {isAuthenticated && (
        <GitHubSidebarSection 
          title="장소 관리" 
          action={
            <Button
              variant={isSelectionMode ? "primary" : "secondary"}
              size="sm"
              onClick={toggleSelectionMode}
            >
              {isSelectionMode ? '완료' : '선택'}
            </Button>
          }
        >
          <div className="space-y-3">
            {isSelectionMode && (
              <div className="text-sm text-github-neutral">
                <p>{selectedPlaces.size}개 장소가 선택됨</p>
              </div>
            )}
            
            {isSelectionMode && selectedPlaces.size > 0 && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleCreateCourseWithSelected}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                코스 만들기
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              fullWidth
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              }
            >
              지도에서 보기
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
                <li>• 장소 북마크</li>
                <li>• 여행 코스 생성</li>
                <li>• 리뷰 작성</li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => window.location.href = '/login'}
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
      title="장소 탐색"
      subtitle="전국 각지의 숨겨진 보석 같은 장소들을 발견하고, 나만의 특별한 여행 코스를 만들어보세요"
      tabs={tabs}
      sidebar={sidebar}
    >

      {/* Search and Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="장소 이름이나 태그로 검색하세요..."
        filters={[
          {
            label: '카테고리',
            value: selectedCategory,
            options: [
              { value: '', label: '전체' },
              { value: '관광지', label: '관광지' },
              { value: '맛집', label: '맛집' },
              { value: '숙박', label: '숙박' },
              { value: '문화재', label: '문화재' },
              { value: '시장', label: '시장' },
              { value: '카페', label: '카페' }
            ],
            onChange: setSelectedCategory
          },
          {
            label: '지역',
            value: selectedRegion,
            options: availableRegions,
            onChange: setSelectedRegion
          }
        ]}
      />

        {/* Selection Mode Controls */}
        <Card variant="outlined" padding="md">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button
                variant={isSelectionMode ? "primary" : "secondary"}
                size="sm"
                onClick={toggleSelectionMode}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                }
                iconPosition="left"
              >
                {isSelectionMode ? '선택 완료' : '장소 선택'}
              </Button>
              
              {isSelectionMode && (
                <div className="flex items-center space-x-2 bg-github-canvas-subtle px-2 py-1 rounded-md border border-github-border">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span className="text-xs text-github-neutral font-medium">
                    {selectedPlaces.size}개 선택됨
                  </span>
                </div>
              )}
            </div>

            {isSelectionMode && selectedPlaces.size > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateCourseWithSelected}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                }
                iconPosition="left"
              >
                코스 만들기
              </Button>
            )}
          </div>
        </Card>

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

        {/* Places Grid */}
        {!isLoading && !error && places && (
          <>
            {/* 검색 결과 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-github-neutral">
                  검색 결과
                </h2>
                <p className="text-sm text-github-neutral-muted mt-1">
                  {places.length}개의 장소를 찾았습니다
                  {(searchQuery || selectedCategory || selectedRegion) && (
                    <>
                      {' '}• 필터: {[
                        searchQuery && `"${searchQuery}"`,
                        selectedCategory && selectedCategory,
                        selectedRegion && selectedRegion
                      ].filter(Boolean).join(', ')}
                    </>
                  )}
                </p>
              </div>
              
              {/* 뷰 모드 토글 (향후 리스트/그리드 뷰용) */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-github-neutral-muted hover:text-github-neutral transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 개선된 그리드 레이아웃 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {places.map((place, index) => {
                // 로컬 북마크 상태가 있으면 우선 사용, 없으면 서버 상태 사용
                const localBookmarkState = localBookmarkStates[place.placeId];
                const isBookmarked = isAuthenticated ? 
                  (localBookmarkState !== undefined ? localBookmarkState : (place.isBookmarked || false)) : 
                  false;
                
                // 디버깅용 로그 (처음 몇 개만)
                if (index < 3) {
                  console.log(`🔍 Place ${place.name}:`, {
                    placeId: place.placeId,
                    serverBookmark: place.isBookmarked,
                    localBookmark: localBookmarkState,
                    finalBookmark: isBookmarked,
                    isAuthenticated
                  });
                }
                
                return (
                  <div 
                    key={place.placeId}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                  >
                    <PlaceCard
                      id={place.placeId}
                      name={place.name}
                      description={place.address}
                      image={place.photo}
                      category={place.category}
                      region={place.regionSummary}
                      rating={place.averageRating}
                      reviewCount={place.reviewCount}
                      isBookmarked={isAuthenticated ? (localBookmarkStates[place.placeId] ?? place.isBookmarked ?? false) : false}
                      address={place.address}
                      tags={[place.category]} // 임시로 카테고리를 태그로 사용
                      onBookmarkToggle={() => toggleBookmark(place.placeId)}
                      onViewDetails={() => handleViewDetails(place.placeId)}
                      onAddToCourse={() => handleAddToCourse(place.placeId)}
                      // 선택 모드 관련
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedPlaces.has(place.placeId)}
                      onSelect={handlePlaceSelect}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!places || places.length === 0) && (
          <Card variant="outlined" padding="lg" className="text-center">
            <div className="py-8">
              <svg className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-primary-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-github-neutral mb-4">다른 검색어나 필터를 시도해보세요.</p>
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                필터 초기화
              </Button>
            </div>
          </Card>
        )}

      {/* Map View Toggle */}
      <div className="text-center mt-8">
        <Button 
          variant="outline" 
          size="md"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          }
          iconPosition="left"
        >
          지도에서 보기
        </Button>
      </div>

      {/* 장소 상세보기 모달 */}
      <PlaceDetailModal
        placeId={selectedPlaceId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      {/* 코스에 추가 모달 */}
      <AddToCourseModal
        placeId={selectedPlaceForCourse?.id || null}
        placeName={selectedPlaceForCourse?.name}
        isOpen={isAddToCourseModalOpen}
        onClose={handleCloseAddToCourseModal}
        onAddToCourse={handleConfirmAddToCourse}
      />

      {/* 코스 생성 모달 */}
      <CourseCreationModal
        selectedPlaceIds={Array.from(selectedPlaces)}
        places={selectedPlacesData}
        isOpen={isCourseCreationModalOpen}
        onClose={handleCloseCourseCreationModal}
        onConfirm={handleConfirmCourseCreation}
      />
    </GitHubLayout>
  );
};