import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PlaceCard, SearchFilter, EmptyState, PlaceDetailModal, AddToCourseModal, CourseCreationModal } from '../components/domain';
import { Button, Card, Spinner } from '../components/base';
import { GitHubLayout, GitHubSidebar, GitHubSidebarSection } from '../components/layout';
import { RegionFilter } from '../components/common/RegionFilter';
import { useInfinitePlaces, useNearbyPlaces, placeKeys } from '../hooks/usePlaces';
import { useToggleBookmark, useBookmarkedPlaces, bookmarkKeys } from '../hooks/useBookmarks';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import { isGeolocationAvailable, getGeolocationUnavailableReason } from '../utils/geolocation';
import { apiRequest } from '../api/axios';
import type { Place } from '../api/types';


export const PlacesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  // 위치 스토어에서 상태 가져오기
  const { latitude, longitude, isPermissionGranted, isLoading: isLocationLoading, error: locationError, requestLocation } = useLocationStore();
  
  // 위치 권한 섹션을 숨길지 결정하는 로컬 상태 (세션 동안만 유지)
  const [isLocationSectionHidden, setIsLocationSectionHidden] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddToCourseModalOpen, setIsAddToCourseModalOpen] = useState(false);
  const [selectedPlaceForCourse, setSelectedPlaceForCourse] = useState<{ id: string; name: string } | null>(null);
  
  // 탭 상태 관리 (모든 장소, 북마크만 장소, 최근 본 장소)
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'recent'>('all');
  
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

  // API 파라미터 준비 (디바운싱된 검색어 사용, page 제거, 위치 정보 추가)
  const searchParams = useMemo(() => ({
    keyword: debouncedSearchQuery || undefined,
    category: selectedCategory || undefined,
    region: selectedRegion || undefined,
    size: 20,
    // 위치 정보가 있으면 추가
    ...(latitude && longitude ? { 
      latitude, 
      longitude,
      radius: 10000 // 10km 반경
    } : {})
  }), [debouncedSearchQuery, selectedCategory, selectedRegion, latitude, longitude]);

  // 위치 기반 근처 장소 조회 (위치가 있을 때만)
  const nearbyPlacesQuery = useNearbyPlaces(
    latitude || 0,
    longitude || 0,
    10000, // 10km 반경
    selectedCategory || undefined
  );

  // 기존 무한 스크롤 장소 조회 (일반 검색용)
  const { 
    data: infinitePlacesData, 
    isLoading: isInfinitePlacesLoading, 
    error: infinitePlacesError, 
    refetch: refetchInfinitePlaces,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  } = useInfinitePlaces(searchParams);

  // 현재 사용할 데이터와 상태 결정
  const shouldUseNearby = !!(latitude && longitude && !debouncedSearchQuery && !selectedRegion);
  const isLoading = shouldUseNearby ? nearbyPlacesQuery.isLoading : isInfinitePlacesLoading;
  const error = shouldUseNearby ? nearbyPlacesQuery.error : infinitePlacesError;
  const refetch = shouldUseNearby ? nearbyPlacesQuery.refetch : refetchInfinitePlaces;
  
  // 데이터 소스에 따라 장소 목록 생성
  const allPlaces = useMemo(() => {
    if (shouldUseNearby) {
      // 근처 장소 데이터 사용
      const nearbyData = nearbyPlacesQuery.data || [];
      console.log('Using nearby places:', nearbyData.length);
      return nearbyData;
    } else {
      // 무한 스크롤 데이터 사용
      if (!infinitePlacesData?.pages) return [];
      
      console.log('Processing infinite places data:', infinitePlacesData.pages);
      
      return infinitePlacesData.pages.flatMap(page => {
        // PageResponse 형태인 경우 .content에서 추출
        if (page && typeof page === 'object' && 'content' in page) {
          console.log(`Processing page ${page.number}: ${page.content?.length || 0} places`);
          return page.content || [];
        }
        // 배열인 경우 그대로 반환 (하위 호환성)
        console.log('Processing page as array:', page?.length || 0, 'places');
        return Array.isArray(page) ? page : [];
      });
    }
  }, [shouldUseNearby, nearbyPlacesQuery.data, infinitePlacesData]);

  // 무한 스크롤 적용 (근처 장소 모드가 아닐 때만)
  const observerTarget = useInfiniteScroll({
    hasNextPage: shouldUseNearby ? false : hasNextPage, // 근처 장소 모드에서는 무한 스크롤 비활성화
    isFetchingNextPage: shouldUseNearby ? false : isFetchingNextPage,
    fetchNextPage: shouldUseNearby ? () => {} : fetchNextPage,
  });

  // 스크롤 위치 추적 (sticky 검색바용)
  const scrollPosition = useScrollPosition();
  const isSearchSticky = scrollPosition > 150; // 150px 이상 스크롤하면 sticky 활성화

  // 북마크된 장소를 API로 조회 (카운트용 - 인증된 사용자만 호출)
  const bookmarkedPlacesQuery = useBookmarkedPlaces({
    page: 0,
    size: 1 // 카운트만 필요하므로 1개만 조회
  }, {
    enabled: isAuthenticated // 인증된 사용자일 때만 호출하여 리다이렉트 방지
  });
  
  // 북마크 탭용 전체 데이터 조회 (탭 활성화 시에만)
  const bookmarkedPlacesFullQuery = useBookmarkedPlaces({
    page: 0,
    size: 100 // 충분히 큰 size로 모든 북마크 장소 조회
  }, {
    enabled: activeTab === 'bookmarks' && isAuthenticated // 북마크 탭이고 인증된 사용자일 때만 호출
  });
  
  // 북마크 데이터와 로딩 상태
  const bookmarkedPlacesData = activeTab === 'bookmarks' ? bookmarkedPlacesFullQuery.data : null;
  const isBookmarkedPlacesLoading = activeTab === 'bookmarks' ? bookmarkedPlacesFullQuery.isLoading : false;

  // 탭에 따른 장소 필터링
  const places = useMemo(() => {
    if (!allPlaces) return [];
    
    console.log('🔄 Filtering places for tab:', activeTab);
    console.log('Total places:', allPlaces.length);
    console.log('Authentication status:', isAuthenticated);
    
    switch (activeTab) {
      case 'bookmarks':
        // 북마크된 장소만 표시 (API 응답 사용)
        if (!isAuthenticated) {
          console.log('❌ User not authenticated, returning empty bookmarks');
          return [];
        }
        
        if (isBookmarkedPlacesLoading) {
          console.log('⏳ Loading bookmarked places from API...');
          return []; // 로딩 중에는 빈 배열 반환
        }
        
        const apiBookmarkedPlaces = bookmarkedPlacesData?.content || [];
        console.log(`🔖 Found ${apiBookmarkedPlaces.length} bookmarked places from API`);
        
        // 북마크된 장소들을 API 응답에서 직접 추출
        const bookmarkedPlaces = apiBookmarkedPlaces.map(bookmarkItem => bookmarkItem.place);
        console.log('🔖 Extracted places from bookmark items:', bookmarkedPlaces.map(p => p.name));
        
        console.log(`✅ Matched ${bookmarkedPlaces.length} places from current search with API bookmarks`);
        return bookmarkedPlaces;
        
      case 'recent':
        // 최근 본 장소 (백엔드 API 필요)
        console.log('📚 Recent tab selected (not implemented)');
        return [];
        
      case 'all':
      default:
        console.log(`📋 Showing all ${allPlaces.length} places`);
        return allPlaces;
    }
  }, [allPlaces, activeTab, isAuthenticated, bookmarkedPlacesData, isBookmarkedPlacesLoading]);

  // 지역 필터 변경 핸들러
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  // 초기 로드 완료 시 플래그 업데이트
  useEffect(() => {
    if (isInitialLoad && (allPlaces || error)) {
      setIsInitialLoad(false);
    }
  }, [allPlaces, error, isInitialLoad]);
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
    if (allPlaces && allPlaces.length > 0 && isAuthenticated) {
      console.log('🔄 Syncing bookmark states with server data...');
      const serverBookmarkStates: Record<string, boolean> = {};
      
      allPlaces.forEach(place => {
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
    } else if (allPlaces && allPlaces.length > 0 && !isAuthenticated) {
      // 비로그인 사용자의 경우 모든 북마크 상태를 false로 설정
      setLocalBookmarkStates({});
    }
  }, [allPlaces, isAuthenticated]);

  const toggleBookmark = async (placeId: string) => {
    console.log(`🚀 Starting bookmark toggle for place: ${placeId}`);
    
    // 비로그인 사용자는 알림만 표시
    if (!isAuthenticated) {
      console.log('❌ User not authenticated');
      alert('북마크 기능을 사용하려면 로그인이 필요합니다.');
      return;
    }
    
    try {
      // 현재 북마크 상태 확인 (로컬 상태 우선, 없으면 서버 상태)
      const currentPlace = allPlaces?.find(p => p.placeId === placeId);
      const serverBookmarkState = currentPlace?.isBookmarked || false;
      const localBookmarkState = localBookmarkStates[placeId];
      const isCurrentlyBookmarked = localBookmarkState !== undefined ? localBookmarkState : serverBookmarkState;
      
      console.log(`📊 Current bookmark state:`, {
        placeId,
        placeName: currentPlace?.name,
        serverBookmarkState,
        localBookmarkState,
        isCurrentlyBookmarked,
        newState: !isCurrentlyBookmarked
      });
      
      // 즉시 UI 업데이트 (낙관적 업데이트)
      const newBookmarkState = !isCurrentlyBookmarked;
      const newStates = {
        ...localBookmarkStates,
        [placeId]: newBookmarkState
      };
      setLocalBookmarkStates(newStates);
      console.log('🎨 UI updated optimistically');
      
      // localStorage에 저장
      try {
        localStorage.setItem('bookmarkStates', JSON.stringify(newStates));
      } catch (error) {
        console.warn('Failed to save bookmark states to localStorage:', error);
      }

      // useToggleBookmark 훅 사용
      console.log('📡 Calling API via useToggleBookmark hook...');
      const result = await toggleBookmarkMutation.mutateAsync({
        targetId: placeId,
        type: 'PLACE'
      });
      
      console.log('✅ API response:', result);

      console.log('🔄 Refreshing bookmark queries...');
      // 추가로 북마크 카운트 쿼리도 강제 재실행
      await bookmarkedPlacesQuery.refetch();
      if (activeTab === 'bookmarks') {
        await bookmarkedPlacesFullQuery.refetch();
      }
      console.log('✅ All queries refreshed successfully');
      
    } catch (error) {
      console.error('❌ Bookmark toggle failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // API 에러 시 원래 상태로 되돌리기
      const currentPlace = allPlaces?.find(p => p.placeId === placeId);
      const originalBookmarkState = currentPlace?.isBookmarked || false;
      const revertStates = {
        ...localBookmarkStates,
        [placeId]: originalBookmarkState
      };
      setLocalBookmarkStates(revertStates);
      console.log('🔄 Reverted UI state due to error');
      
      try {
        localStorage.setItem('bookmarkStates', JSON.stringify(revertStates));
      } catch (localError) {
        console.warn('Failed to save reverted bookmark states to localStorage:', localError);
      }
      
      // 사용자에게 에러 알림
      alert('북마크 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
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
    
    const place = allPlaces?.find(p => p.placeId === placeId);
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
      // Course place addition API implementation pending
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
      const placeData = allPlaces?.find(place => place.placeId === placeId);
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
      // 실제 API 호출
      const courseCreateRequest = {
        title: courseData.title,
        description: courseData.description,
        themes: courseData.themes, // 이미 CourseCreationModal에서 ENUM으로 변환됨
        region: courseData.region,
        isPublic: courseData.isPublic,
        placeIds: courseData.orderedPlaceIds // API 스펙에 맞게 필드명 변경
      };
      
      const response = await apiRequest.post('/courses', courseCreateRequest);
      
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

  // 북마크된 장소 개수 계산 (API 기준)
  const bookmarkedCount = useMemo(() => {
    if (!isAuthenticated) {
      console.log('📊 Bookmark count: 0 (not authenticated)');
      return 0;
    }
    // 카운트용 API 쿼리에서 전체 북마크 개수 사용
    const count = bookmarkedPlacesQuery.data?.totalElements || 0;
    console.log('📊 Bookmark count updated:', count);
    return count;
  }, [bookmarkedPlacesQuery.data, isAuthenticated]);

  // GitHub 스타일 탭 구성 - 현재 페이지 내 필터링으로 변경
  const tabs = [
    { 
      label: '모든 장소', 
      href: '#all',
      active: activeTab === 'all',
      count: allPlaces?.length,
      onClick: () => setActiveTab('all')
    },
    { 
      label: '북마크한 장소', 
      href: '#bookmarks',
      active: activeTab === 'bookmarks',
      count: bookmarkedCount,
      onClick: () => {
        if (!isAuthenticated) {
          alert('북마크 기능을 사용하려면 로그인이 필요합니다.');
          return;
        }
        console.log('🔖 Switching to bookmarks tab...');
        console.log('Will fetch bookmarked places from API...');
        setActiveTab('bookmarks');
      }
    },
    { 
      label: '최근 본 장소', 
      href: '#recent',
      active: activeTab === 'recent',
      count: 0, // 백엔드 API 구현 후 실제 카운트 표시
      onClick: () => {
        // 최근 본 장소 기능은 백엔드 작업 필요
        alert('최근 본 장소 기능은 개발 중입니다. 백엔드 API 작업이 필요합니다.');
      }
    },
  ];

  // 사이드바 구성
  const sidebar = (
    <GitHubSidebar>
      {/* 위치 정보 섹션 */}
      <GitHubSidebarSection title="내 위치">
        <div className="space-y-3">
          {latitude && longitude ? (
            <div className="text-sm text-green-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>위치가 설정되었습니다</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                거리 기준 정렬이 활성화됩니다
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                내 위치를 설정하면 각 장소까지의 거리를 확인할 수 있습니다.
              </p>
              {isGeolocationAvailable() ? (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={requestLocation}
                  disabled={isLocationLoading}
                icon={
                  isLocationLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  )
                }
              >
                {isLocationLoading ? '위치 확인 중...' : '내 위치 설정'}
              </Button>
              ) : (
                <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    위치 서비스 사용 불가
                  </div>
                  <p className="text-xs text-gray-500">
                    {getGeolocationUnavailableReason()}
                  </p>
                </div>
              )}
              {locationError && (
                <p className="text-xs text-red-600 mt-2">
                  {locationError}
                </p>
              )}
            </div>
          )}
        </div>
      </GitHubSidebarSection>

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

          {/* 2단계 지역 필터 */}
          <RegionFilter
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            className="pb-4 border-b border-gray-200"
            availableRegionsData={allPlaces || []}
          />

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
                placeholder="장소 검색..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 위치 권한 요청 섹션 */}
      {!isPermissionGranted && !isLocationSectionHidden && (
        <div 
          className="rounded-lg p-6 mb-8"
          style={{
            background: 'linear-gradient(135deg, var(--notion-blue) 0%, #4f46e5 100%)',
            borderRadius: '12px',
            color: 'var(--notion-white)',
            textAlign: 'center'
          }}
        >
          <div className="flex flex-col items-center space-y-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            <div>
              <h3 
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '8px',
                  color: 'var(--notion-white)'
                }}
              >
                📍 가까운 장소부터 찾아보세요
              </h3>
              <p 
                style={{
                  fontSize: '16px',
                  marginBottom: '0',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.5'
                }}
              >
                내 위치를 설정하시면 가까운 장소부터 우선적으로 보여드리고,<br />
                각 장소까지의 정확한 거리를 확인하실 수 있습니다.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {isGeolocationAvailable() ? (
                <button
                  onClick={requestLocation}
                  disabled={isLocationLoading}
                className="inline-flex items-center px-6 py-3 rounded-md text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--notion-white)',
                  color: 'var(--notion-blue)',
                  border: 'none',
                  gap: '8px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {isLocationLoading ? (
                  <>
                    <Spinner size="sm" />
                    위치 확인 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    위치 권한 허용하기
                  </>
                )}
              </button>
              ) : (
                <div className="inline-flex items-center px-6 py-3 rounded-md text-sm text-gray-600 bg-gray-100 gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {getGeolocationUnavailableReason()}
                </div>
              )}
              
              <button
                className="inline-flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--notion-white)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px'
                }}
                onClick={() => {
                  // 나중에 하기 - 세션 동안 위치 권한 섹션을 숨김
                  setIsLocationSectionHidden(true);
                }}
              >
                나중에 하기
              </button>
            </div>
            
            {locationError && (
              <div 
                className="mt-3 p-3 rounded-md text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--notion-white)',
                  borderRadius: '6px'
                }}
              >
                ⚠️ {locationError}
              </div>
            )}
            
            <div className="text-xs text-white/70 mt-2">
              💡 위치 정보는 거리 계산에만 사용되며 저장되지 않습니다
            </div>
          </div>
        </div>
      )}

      {/* 위치 설정 완료 알림 */}
      {isPermissionGranted && latitude && longitude && (
        <div 
          className="rounded-lg p-4 mb-8"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '8px',
            color: 'var(--notion-white)',
            textAlign: 'center'
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">✅ 위치가 설정되었습니다! 이제 가까운 장소부터 우선적으로 보여드립니다.</span>
          </div>
        </div>
      )}

      {/* Original Search and Filters */}
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
            options: [{ value: '', label: '전체' }], // 간소화된 옵션
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
      {(isLoading || (activeTab === 'bookmarks' && isBookmarkedPlacesLoading)) && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
          {activeTab === 'bookmarks' && isBookmarkedPlacesLoading && (
            <p className="ml-3 text-sm text-gray-500">북마크한 장소를 불러오는 중...</p>
          )}
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
        {!isLoading && !(activeTab === 'bookmarks' && isBookmarkedPlacesLoading) && !error && places && (
          <>
            {/* 검색 결과 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-github-neutral">
                  {shouldUseNearby ? '📍 내 주변 장소' : '검색 결과'}
                </h2>
                <p className="text-sm text-github-neutral-muted mt-1">
                  {places.length}개의 장소를 찾았습니다
                  {shouldUseNearby && (
                    <span className="text-blue-600"> • 거리순으로 정렬됨</span>
                  )}
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

            {/* 무한 스크롤 트리거 및 로딩 표시 */}
            <div ref={observerTarget} className="py-8 flex justify-center">
              {!shouldUseNearby && isFetchingNextPage && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Spinner size="sm" />
                  <span className="text-sm">더 많은 장소를 불러오는 중...</span>
                </div>
              )}
              {shouldUseNearby && places.length > 0 && (
                <div className="text-sm text-blue-600">
                  📍 주변 {places.length}개 장소 (10km 반경 내)
                </div>
              )}
              {!shouldUseNearby && !hasNextPage && !isFetchingNextPage && places.length > 0 && (
                <div className="text-sm text-gray-500">
                  모든 장소를 불러왔습니다.
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!places || places.length === 0) && (
          <Card variant="outlined" padding="lg" className="text-center">
            <div className="py-8">
              {activeTab === 'bookmarks' ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-primary-900 mb-2">북마크한 장소가 없습니다</h3>
                  <p className="text-github-neutral mb-4">
                    관심있는 장소의 ❤️ 버튼을 눌러 북마크하면 여기서 쉽게 찾을 수 있습니다.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('all')}>
                    모든 장소 보기
                  </Button>
                </>
              ) : activeTab === 'recent' ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-primary-900 mb-2">최근 본 장소가 없습니다</h3>
                  <p className="text-github-neutral mb-4">장소를 둘러본 후 여기서 확인하세요.</p>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('all')}>
                    장소 둘러보기
                  </Button>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-medium text-primary-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-github-neutral mb-4">다른 검색어나 필터를 시도해보세요.</p>
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    필터 초기화
                  </Button>
                </>
              )}
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