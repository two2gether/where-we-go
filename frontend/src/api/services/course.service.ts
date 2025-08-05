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
  getCourses: (params: CourseSearchRequest = {}): Promise<PageResponse<Course>> => {
    // 백엔드 API 스펙에 맞게 쿼리 파라미터 구성  
    const queryParams: any = {
      region: params.region || '서울', // DB에 서울 지역 코스가 있으므로 기본값을 서울로 설정
      page: params.page || 0,
      size: params.size || 10,
      sort: 'createdAt,desc'
    };


    // themes가 있을 때만 추가
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

    // GET 요청으로 변경
    return apiRequest.get<any>('/courses', { params: queryParams })
      .then(response => {
        console.log('getCourses 응답:', response); // 디버깅용
        console.log('getCourses 응답 data:', response.data); // 데이터 구조 확인
        console.log('getCourses 응답 data type:', typeof response.data); // 데이터 타입 확인
        
        // 빈 배열인 경우 디버깅 정보 추가
        if (response.data?.content?.length === 0) {
          console.log('⚠️ 빈 결과 - 요청 파라미터와 DB 데이터 확인 필요');
          console.log('  요청한 region:', queryParams.region);
          console.log('  요청 전체:', queryParams);
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

  // 내가 작성한 코스 목록 조회 (임시로 전체 코스와 동일한 API 사용)
  getMyCourses: (params: Omit<CourseSearchRequest, 'authorId'> = {}): Promise<PageResponse<Course>> => {
    // 임시로 전체 코스와 동일한 로직 사용
    const queryParams: any = {
      region: params.region || '서울', // 기본값을 서울로 통일
      page: params.page || 0,
      size: params.size || 10,
      sort: 'createdAt,desc'
    };

    // themes가 있을 때만 추가
    if (params.theme) {
      queryParams.themes = params.theme;
    }

    console.log('getMyCourses API 호출:', '/courses (임시)', queryParams);

    // getCourses와 동일한 방식 사용 (GET 요청)
    return apiRequest.get<any>('/courses', { params: queryParams })
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