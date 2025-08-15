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
    const queryParams: any = {
      page: params.page || 0,
      size: params.size || 10,
      sort: params.sort || 'createdAt,desc' // sort 파라미터 지원 추가
    };

    // 백엔드에서 region 처리 (null, 빈값, "전체" 모두 전체 조회로 처리됨)
    if (params.region && params.region !== '전체') {
      queryParams.region = params.region;
    } else {
      // "전체"이거나 없는 경우 백엔드에 "전체" 전달 (백엔드에서 처리)
      queryParams.region = '전체';
    }

    // themes가 있을 때만 추가 (백엔드는 CourseTheme enum 배열 형태)
    if (params.theme) {
      queryParams.themes = params.theme;
    }

    // GET 요청으로 변경 - 올바른 엔드포인트 사용
    return apiRequest.get<any>('/courses', { params: queryParams })
      .then(response => {
        // 백엔드 ApiResponse 구조: { success: boolean, message: string, data: PagedResponse }
        const actualData = response.data?.data || response.data;
        
        // 응답 데이터 검증
        if (!actualData) {
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
        
        return actualData;
      })
      .catch(error => {
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
  getCourseById: (id: number, userLatitude?: number, userLongitude?: number): Promise<Course> => {
    const params: Record<string, string> = {};
    
    if (userLatitude && userLongitude) {
      params.userLatitude = userLatitude.toString();
      params.userLongitude = userLongitude.toString();
    }
    
    return apiRequest.get<Course>(`/courses/${id}`, { params })
      .then(response => response.data);
  },

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

    // 올바른 백엔드 엔드포인트 사용: /api/users/mypage/courses
    return apiRequest.get<PageResponse<Course>>('/users/mypage/courses', { params: queryParams })
      .then(response => response.data)
      .catch(error => {
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
    const pageParams: any = {
      page: 0,
      size: limit
    };

    // 백엔드에서 region 처리 (null, 빈값, "전체" 모두 전체 조회로 처리됨)
    if (region && region !== '전체') {
      pageParams.region = region;
    } else {
      // "전체"이거나 없는 경우 백엔드에 "전체" 전달 (백엔드에서 처리)
      pageParams.region = '전체';
    }

    if (themes && themes.length > 0) {
      pageParams.themes = themes.join(',');
    }

    return apiRequest.get<any>('/courses/popular', { params: pageParams })
      .then(response => response.data.data); // ApiResponse<PagedResponse<T>> 구조
  },

  // TODO: 백엔드에서 추천 코스 API 구현 후 활성화
  // getRecommendedCourses: (limit: number = 10): Promise<Course[]> =>
  //   apiRequest.get<Course[]>(`/courses/recommendations?limit=${limit}`)
  //     .then(response => response.data),

  // 코스 좋아요/취소
  toggleLike: (courseId: number): Promise<{ liked: boolean; likeCount: number }> =>
    apiRequest.post<{ liked: boolean; likeCount: number }>(`/courses/${courseId}/like`)
      .then(response => response.data),


  // TODO: 백엔드에서 고급 코스 기능 API들 구현 후 활성화
  // getThemes: (): Promise<string[]> =>
  //   apiRequest.get<string[]>('/courses/themes')
  //     .then(response => response.data),

  // getRegions: (): Promise<string[]> =>
  //   apiRequest.get<string[]>('/courses/regions')
  //     .then(response => response.data),

  // copyCourse: (courseId: number, title?: string): Promise<Course> =>
  //   apiRequest.post<Course>(`/courses/${courseId}/copy`, { title })
  //     .then(response => response.data),

  // updateVisibility: (courseId: number, isPublic: boolean): Promise<Course> =>
  //   apiRequest.patch<Course>(`/courses/${courseId}/visibility`, { isPublic })
  //     .then(response => response.data),

  // getCoursesByAuthor: (
  //   authorId: number, 
  //   params: Omit<CourseSearchRequest, 'authorId'> = {}
  // ): Promise<PageResponse<Course>> =>
  //   apiRequest.get<PageResponse<Course>>(`/courses/author/${authorId}`, { params })
  //     .then(response => response.data),
};