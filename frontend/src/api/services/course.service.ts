import { apiRequest } from '../axios';
import { useAuthStore } from '../../store/authStore';
import type {
  Course,
  CourseSearchRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
  PageResponse
} from '../types';

export const courseService = {
  // 코스 목록 조회 - GET 요청
  getCourses: async (params: CourseSearchRequest = {}): Promise<PageResponse<Course>> => {
    const region = params.region || '전체';
    
    // "전체" 지역인 경우 여러 주요 지역에서 데이터를 가져와서 합치기
    if (region === '전체') {
      const majorRegions = ['서울', '부산', '제주', '강릉', '경주', '전주', '여수', '대구', '인천', '대전'];
      const allResults: Course[] = [];
      let totalElements = 0;
      
      const queryParams: any = {
        page: 0,
        size: Math.ceil((params.size || 10) / majorRegions.length) + 2, // 더 많은 데이터 요청
        sort: 'createdAt,desc'
      };

      // 백엔드에서 키워드 검색을 지원하지 않음
      if (params.theme) {
        queryParams.themes = params.theme;
      }

      console.log('getCourses - 전체 지역 검색 시작');

      // 각 지역별로 API 호출
      for (const regionName of majorRegions) {
        try {
          const regionParams = { ...queryParams, region: regionName };
          console.log(`  지역별 호출: ${regionName}`, regionParams);
          
          const response = await apiRequest.get<any>('/courses', { params: regionParams });
          const actualData = response.data?.data || response.data;
          
          if (actualData?.content?.length > 0) {
            allResults.push(...actualData.content);
            totalElements += actualData.totalElements || actualData.content.length;
            console.log(`  ${regionName} 결과: ${actualData.content.length}개`);
          }
        } catch (error) {
          console.warn(`지역 ${regionName} 검색 실패:`, error);
          // 실패한 지역은 무시하고 계속 진행
        }
      }

      // 중복 제거 (ID 기준)
      const uniqueResults = allResults.filter((course, index, self) => 
        index === self.findIndex(c => (c.id || c.courseId) === (course.id || course.courseId))
      );

      // 최신순 정렬 및 페이지네이션 적용
      const sortedResults = uniqueResults.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );

      const page = params.page || 0;
      const size = params.size || 10;
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedResults = sortedResults.slice(startIndex, endIndex);

      console.log(`전체 지역 검색 완료: ${uniqueResults.length}개 발견, ${paginatedResults.length}개 반환`);

      return {
        content: paginatedResults,
        totalElements: uniqueResults.length,
        totalPages: Math.ceil(uniqueResults.length / size),
        number: page,
        size: size,
        first: page === 0,
        last: endIndex >= uniqueResults.length,
        empty: paginatedResults.length === 0
      };
    }

    // 특정 지역 검색인 경우 기존 로직 사용
    const queryParams: any = {
      page: params.page || 0,
      size: params.size || 10,
      sort: 'createdAt,desc'
    };

    queryParams.region = region;

    // 백엔드에서 키워드 검색을 지원하지 않음 - 주석 처리
    // TODO: 백엔드에서 keyword 검색 기능 구현 필요
    // if (params.keyword) {
    //   queryParams.keyword = params.keyword;
    // }

    // themes가 있을 때만 추가 (백엔드는 CourseTheme enum 배열 형태)
    if (params.theme) {
      queryParams.themes = params.theme;
    }

    // 인증 상태 확인
    const authState = useAuthStore.getState();
    console.log('=== 인증 상태 확인 ===');
    console.log('  isAuthenticated:', authState.isAuthenticated);
    console.log('  token exists:', !!authState.token);
    console.log('  user:', authState.user?.username || 'no user');
    
    console.log('getCourses API 호출:', '/courses');
    console.log('  queryParams:', queryParams);
    console.log('  원본 params:', params);

    // GET 요청으로 변경 - 올바른 엔드포인트 사용
    return apiRequest.get<any>('/courses', { params: queryParams })
      .then(response => {
        console.log('getCourses 응답:', response); // 디버깅용
        console.log('getCourses 응답 data:', response.data); // 데이터 구조 확인
        console.log('getCourses 응답 data type:', typeof response.data); // 데이터 타입 확인
        
        // 백엔드 ApiResponse 구조: { success: boolean, message: string, data: PagedResponse }
        const actualData = response.data?.data || response.data;
        
        // 빈 배열인 경우 디버깅 정보 추가
        if (actualData?.content?.length === 0) {
          console.log('⚠️ 빈 결과 - 요청 파라미터와 DB 데이터 확인 필요');
          console.log('  요청한 region:', queryParams.region);
          console.log('  요청 전체:', queryParams);
        } else if (actualData?.content?.length > 0) {
          console.log('✅ 코스 데이터 발견!');
          console.log('  첫 번째 코스 데이터:', actualData.content[0]);
          console.log('  첫 번째 코스 author:', actualData.content[0]?.author);
        }
        
        // 응답 데이터 검증
        if (!actualData) {
          console.warn('getCourses: Invalid response structure', response);
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: queryParams.size,
            first: true,
            last: true,
            empty: true
          };
        }
        
        // 백엔드 응답에서 data 필드 추출
        console.log('getCourses 최종 반환값:', actualData);
        return actualData;
      })
      .catch(error => {
        console.error('getCourses API failed:', error);
        // 빈 페이지 응답 반환
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: queryParams.size,
          first: true,
          last: true,
          empty: true
        };
      });
  },

  // 코스 상세 조회
  getCourseById: (id: number): Promise<Course> =>
    apiRequest.get<Course>(`/courses/${id}`)
      .then(response => response.data),

  // 코스 생성
  createCourse: (courseData: CreateCourseRequest): Promise<Course> =>
    apiRequest.post<Course>('/courses', courseData)
      .then(response => response.data),

  // 코스 수정
  updateCourse: (id: number, courseData: UpdateCourseRequest): Promise<Course> =>
    apiRequest.put<Course>(`/courses/${id}`, courseData)
      .then(response => response.data),

  // 코스 삭제
  deleteCourse: (id: number): Promise<void> =>
    apiRequest.delete<void>(`/courses/${id}`)
      .then(response => response.data),

  // 내가 작성한 코스 목록 조회
  getMyCourses: (params: Omit<CourseSearchRequest, 'authorId'> = {}): Promise<PageResponse<Course>> => {
    const queryParams: any = {
      page: params.page || 0,
      size: params.size || 10,
    };

    // 필터 파라미터 추가
    if (params.region && params.region !== '전체') {
      queryParams.region = params.region;
    }
    if (params.theme) {
      queryParams.theme = params.theme;
    }
    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }

    console.log('getMyCourses API 호출:', '/users/mypage/courses', queryParams);

    // 올바른 백엔드 엔드포인트 사용: /api/users/mypage/courses
    return apiRequest.get<PageResponse<Course>>('/users/mypage/courses', { params: queryParams })
      .then(response => {
        console.log('getMyCourses 응답:', response);
        return response.data;
      })
      .catch(error => {
        console.error('getMyCourses API failed:', error);
        // 빈 페이지 응답 반환
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: queryParams.size,
          first: true,
          last: true,
          empty: true
        };
      });
  },

  // 인기 코스 조회
  getPopularCourses: async (region: string = '전체', themes?: string[], limit: number = 10): Promise<PageResponse<Course>> => {
    // 전체 지역인 경우 주요 지역들에서 인기 코스를 가져와서 합치기
    if (region === '전체') {
      const majorRegions = ['서울', '부산', '제주', '강릉', '경주', '전주', '여수', '대구'];
      const allResults: Course[] = [];
      
      const queryParams = {
        themes: themes?.join(','),
        page: 0,
        size: Math.ceil(limit / majorRegions.length) + 1
      };

      for (const regionName of majorRegions) {
        try {
          const regionParams = { ...queryParams, region: regionName };
          const response = await apiRequest.get<any>('/courses/popular', { params: regionParams });
          const actualData = response.data?.data || response.data;
          
          if (actualData?.content?.length > 0) {
            allResults.push(...actualData.content);
          }
        } catch (error) {
          console.warn(`인기 코스 지역 ${regionName} 검색 실패:`, error);
        }
      }

      // 중복 제거 및 북마크 수 기준 정렬
      const uniqueResults = allResults.filter((course, index, self) => 
        index === self.findIndex(c => (c.id || c.courseId) === (course.id || course.courseId))
      );

      const sortedResults = uniqueResults
        .sort((a, b) => (b.bookmarkCount || 0) - (a.bookmarkCount || 0))
        .slice(0, limit);

      return {
        content: sortedResults,
        totalElements: sortedResults.length,
        totalPages: 1,
        number: 0,
        size: limit,
        first: true,
        last: true,
        empty: sortedResults.length === 0
      };
    }

    // 특정 지역인 경우 기존 로직
    const pageParams = {
      region,
      themes: themes?.join(','),
      page: 0,
      size: limit
    };

    return apiRequest.get<any>('/courses/popular', { params: pageParams })
      .then(response => response.data.data); // ApiResponse<PagedResponse<T>> 구조
  },

  // 추천 코스 조회
  getRecommendedCourses: (limit: number = 10): Promise<Course[]> =>
    apiRequest.get<Course[]>(`/courses/recommendations?limit=${limit}`)
      .then(response => response.data),

  // 코스 좋아요/취소
  toggleLike: (courseId: number): Promise<{ liked: boolean; likeCount: number }> =>
    apiRequest.post<{ liked: boolean; likeCount: number }>(`/courses/${courseId}/like`)
      .then(response => response.data),


  // 코스 테마 목록 조회
  getThemes: (): Promise<string[]> =>
    apiRequest.get<string[]>('/courses/themes')
      .then(response => response.data),

  // 코스 지역 목록 조회
  getRegions: (): Promise<string[]> =>
    apiRequest.get<string[]>('/courses/regions')
      .then(response => response.data),

  // 코스 복사
  copyCourse: (courseId: number, title?: string): Promise<Course> =>
    apiRequest.post<Course>(`/courses/${courseId}/copy`, { title })
      .then(response => response.data),

  // 코스 공개/비공개 설정
  updateVisibility: (courseId: number, isPublic: boolean): Promise<Course> =>
    apiRequest.patch<Course>(`/courses/${courseId}/visibility`, { isPublic })
      .then(response => response.data),

  // 특정 작성자의 코스 목록 조회
  getCoursesByAuthor: (
    authorId: number, 
    params: Omit<CourseSearchRequest, 'authorId'> = {}
  ): Promise<PageResponse<Course>> =>
    apiRequest.get<PageResponse<Course>>(`/courses/author/${authorId}`, { params })
      .then(response => response.data),
};