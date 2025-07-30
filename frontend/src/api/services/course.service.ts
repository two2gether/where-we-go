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
  // 코스 목록 조회 (검색 포함) - GET 요청 with Request Body (백엔드 설계 이슈)
  getCourses: (params: CourseSearchRequest = {}): Promise<PageResponse<Course>> => {
    // 백엔드 요구사항에 맞게 요청 데이터 변환
    let regionValue = params.region || '전체';
    
    // DB에 저장된 region 값과 매칭을 위한 변환
    if (regionValue === '서울') {
      // DB의 "경기, 서울"과 매칭하기 위해 정확한 값 사용
      regionValue = '경기, 서울';
    }
    
    const requestBody: any = {};
    
    // "전체"가 아닌 경우에만 region 필터 추가
    if (regionValue !== '전체') {
      requestBody.region = regionValue;
    }

    // themes가 있을 때만 추가 (null/undefined 방지)
    if (params.theme) {
      requestBody.themes = [params.theme];
    }

    // keyword가 있을 때만 추가
    if (params.keyword) {
      requestBody.keyword = params.keyword;
    }

    // Pageable 파라미터를 쿼리 파라미터로 전달
    const pageParams = {
      page: params.page || 0,
      size: params.size || 10,
      sort: 'createdAt,desc'
    };

    // 인증 상태 확인
    const authState = useAuthStore.getState();
    console.log('=== 인증 상태 확인 ===');
    console.log('  isAuthenticated:', authState.isAuthenticated);
    console.log('  token exists:', !!authState.token);
    console.log('  user:', authState.user?.username || 'no user');
    
    console.log('getCourses API 호출:', '/courses/list');
    console.log('  requestBody:', requestBody);
    console.log('  pageParams:', pageParams);
    console.log('  원본 params:', params); // 디버깅용

    // POST 요청으로 수정됨
    return apiRequest.post<any>('/courses/list', requestBody, { params: pageParams })
      .then(response => {
        console.log('getCourses 응답:', response); // 디버깅용
        console.log('getCourses 응답 data:', response.data); // 데이터 구조 확인
        console.log('getCourses 응답 data type:', typeof response.data); // 데이터 타입 확인
        
        // 빈 배열인 경우 디버깅 정보 추가
        if (response.data?.content?.length === 0) {
          console.log('⚠️ 빈 결과 - 요청 파라미터와 DB 데이터 확인 필요');
          console.log('  DB 코스 region: "경기, 서울"');
          console.log('  요청한 region:', requestBody.region);
          console.log('  요청 전체:', requestBody);
        } else if (response.data?.content?.length > 0) {
          console.log('✅ 코스 데이터 발견!');
          console.log('  첫 번째 코스 데이터:', response.data.content[0]);
          console.log('  첫 번째 코스 author:', response.data.content[0]?.author);
        }
        
        // 응답 데이터 검증
        if (!response?.data) {
          console.warn('getCourses: Invalid response structure', response);
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: pageParams.size,
            first: true,
            last: true,
            empty: true
          };
        }
        
        // 데이터가 객체인지 확인하고 반환
        const result = response.data;
        console.log('getCourses 최종 반환값:', result);
        return result;
      })
      .catch(error => {
        console.error('getCourses API failed:', error);
        // 빈 페이지 응답 반환
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: pageParams.size,
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

  // 내가 작성한 코스 목록 조회 (임시로 전체 코스 반환 - 백엔드에서 /users/courses 엔드포인트 구현 전까지)
  getMyCourses: (params: Omit<CourseSearchRequest, 'authorId'> = {}): Promise<PageResponse<Course>> => {
    // 임시로 전체 코스와 동일한 로직 사용 (백엔드에서 사용자별 필터링이 구현되면 수정 예정)
    let regionValue = params.region || '전체';
    
    // DB에 저장된 region 값과 매칭을 위한 변환
    if (regionValue === '서울') {
      regionValue = '경기, 서울';
    }
    
    const requestBody: any = {
      region: regionValue  // 백엔드 @NotBlank 요구사항으로 항상 포함
    };

    // themes가 있을 때만 추가 (null/undefined 방지)
    if (params.theme) {
      requestBody.themes = [params.theme];
    }

    // keyword가 있을 때 추가
    if (params.keyword) {
      requestBody.keyword = params.keyword;
    }

    // Pageable 파라미터를 쿼리 파라미터로 전달
    const pageParams = {
      page: params.page || 0,
      size: params.size || 10,
      sort: 'createdAt,desc'
    };

    console.log('getMyCourses API 호출:', '/courses/list (with myCoursesOnly)', requestBody, pageParams); // 디버깅용

    // 기존 getCourses와 동일한 방식 사용 (POST 요청)
    return apiRequest.post<any>('/courses/list', requestBody, { params: pageParams })
      .then(response => {
        if (!response?.data) {
          console.warn('getMyCourses: Invalid response structure', response);
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: pageParams.size,
            first: true,
            last: true,
            empty: true
          };
        }
        return response.data; // ApiResponse<PagedResponse<T>> 구조
      })
      .catch(error => {
        console.error('getMyCourses API failed:', error);
        // 빈 페이지 응답 반환
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: pageParams.size,
          first: true,
          last: true,
          empty: true
        };
      });
  },

  // 인기 코스 조회
  getPopularCourses: (region: string = '전체', themes?: string[], limit: number = 10): Promise<PageResponse<Course>> => {
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