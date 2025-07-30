import React, { useState, useMemo, useEffect } from 'react';
import { PlaceCard, SearchFilter, EmptyState, PlaceDetailModal, AddToCourseModal, CourseCreationModal } from '../components/domain';
import { Button, Card, Spinner } from '../components/base';
import { usePlaces } from '../hooks/usePlaces';
import { useToggleBookmark } from '../hooks/useBookmarks';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../api/axios';
import type { Place } from '../api/types';


export const PlacesPage: React.FC = () => {
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
      return saved ? JSON.parse(saved) : {};
    } catch {
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

  // 초기 로드 완료 시 플래그 업데이트
  useEffect(() => {
    if (isInitialLoad && (places || error)) {
      setIsInitialLoad(false);
    }
  }, [places, error, isInitialLoad]);
  const toggleBookmarkMutation = useToggleBookmark();

  // 서버에서 장소 데이터를 불러올 때 북마크 상태 초기화
  useEffect(() => {
    if (places && places.length > 0) {
      const serverBookmarkStates: Record<string, boolean> = {};
      let hasNewBookmarkData = false;
      
      places.forEach(place => {
        if (place.isBookmarked !== undefined && localBookmarkStates[place.placeId] === undefined) {
          serverBookmarkStates[place.placeId] = place.isBookmarked;
          hasNewBookmarkData = true;
        }
      });
      
      if (hasNewBookmarkData) {
        const updatedStates = {
          ...localBookmarkStates,
          ...serverBookmarkStates
        };
        setLocalBookmarkStates(updatedStates);
        try {
          localStorage.setItem('bookmarkStates', JSON.stringify(updatedStates));
        } catch (error) {
          console.warn('Failed to save initial bookmark states to localStorage:', error);
        }
      }
    }
  }, [places]);

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
    setSelectedPlaceId(placeId);
    setIsDetailModalOpen(true);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">장소 탐색</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          전국 각지의 특별한 장소들을 발견하고, 여행 계획에 추가해보세요.
        </p>
        
        {/* 비로그인 사용자 안내 */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-700 text-sm">
              💡 <strong>로그인하시면</strong> 장소 북마크, 코스 생성 등 더 많은 기능을 이용하실 수 있습니다.
              <button 
                onClick={() => window.location.href = '/login'}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                로그인하기
              </button>
            </p>
          </div>
        )}
      </div>

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
            options: [
              { value: '', label: '전체' },
              { value: '서울', label: '서울' },
              { value: '부산', label: '부산' },
              { value: '제주도', label: '제주도' },
              { value: '경주', label: '경주' },
              { value: '강릉', label: '강릉' },
              { value: '전주', label: '전주' }
            ],
            onChange: setSelectedRegion
          }
        ]}
      />

      {/* Selection Mode Controls */}
      <div className="flex justify-between items-center bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant={isSelectionMode ? "primary" : "outline"}
            onClick={toggleSelectionMode}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            iconPosition="left"
          >
            {isSelectionMode ? '선택 완료' : '장소 선택'}
          </Button>
          
          {isSelectionMode && (
            <span className="text-sm text-gray-600">
              {selectedPlaces.size}개 장소 선택됨
            </span>
          )}
        </div>

        {isSelectionMode && selectedPlaces.size > 0 && (
          <Button
            variant="primary"
            onClick={handleCreateCourseWithSelected}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            iconPosition="left"
          >
            선택한 장소로 코스 만들기
          </Button>
        )}
      </div>

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

      {/* Places Grid */}
      {!isLoading && !error && places && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map(place => {
            // 로컬 북마크 상태가 있으면 우선 사용, 없으면 서버 상태 사용
            const localBookmarkState = localBookmarkStates[place.placeId];
            const isBookmarked = isAuthenticated ? 
              (localBookmarkState !== undefined ? localBookmarkState : (place.isBookmarked || false)) : 
              false;
            
            return (
              <PlaceCard
                key={place.placeId}
                id={place.placeId}
                name={place.name}
                description={place.address}
                image={place.photo}
                category={place.category}
                region={place.regionSummary}
                rating={place.averageRating}
                reviewCount={place.reviewCount}
                isBookmarked={isBookmarked}
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
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!places || places.length === 0) && (
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 검색어나 필터를 시도해보세요."
          actionLabel="필터 초기화"
          onAction={resetFilters}
        />
      )}

      {/* Map View Toggle */}
      <div className="text-center">
        <Button 
          variant="outline" 
          size="lg"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
};