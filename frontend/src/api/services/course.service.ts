import { apiRequest } from '../axios';
import { useAuthStore } from '../../store/authStore';
import type {
  Course,
  CourseSearchRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
  UpdateCourseResponse,
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

    // 🔧 수정: 전체 검색 시 region 파라미터를 아예 보내지 않음
    if (params.region && params.region !== '전체') {
      queryParams.region = params.region;
    }
    // "전체"이거나 없는 경우 region 파라미터를 생략 (백엔드에서 null로 처리됨)

    // themes가 있을 때만 추가 (백엔드는 CourseTheme enum 배열 형태)
    if (params.theme) {
      queryParams.themes = params.theme;
    }

    // GET 요청으로 변경 - apiRequest가 이미 래퍼 처리함
    return apiRequest.get<any>('/courses', { params: queryParams })
      .then(response => {
        // apiRequest가 이미 response.data를 반환하므로 한번만 .data 접근
        const actualData = response.data;
        
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

  // 코스 수정 - 백엔드 PATCH API에 맞게 수정
  updateCourse: (id: number, courseData: UpdateCourseRequest): Promise<UpdateCourseResponse> =>
    apiRequest.patch<UpdateCourseResponse>(`/courses/${id}`, courseData)
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

    // 🔧 수정: 전체 검색 시 region 파라미터를 아예 보내지 않음
    if (region && region !== '전체') {
      pageParams.region = region;
    }
    // "전체"이거나 없는 경우 region 파라미터를 생략 (백엔드에서 null로 처리됨)

    if (themes && themes.length > 0) {
      pageParams.themes = themes.join(',');
    }

    return apiRequest.get<any>('/courses/popular', { params: pageParams })
      .then(response => {
        // 🔍 인기코스 API 응답 디버깅 (개발 환경에서만)
        if (import.meta.env?.DEV) {
          console.group('🔥 인기코스 API Raw 응답');
          console.log('📋 Request params:', pageParams);
          console.log('📊 Full response:', response);
          console.log('📊 Response data:', response.data);
          
          if (response.data?.content && Array.isArray(response.data.content)) {
            console.log('📊 인기코스 개수:', response.data.content.length);
            
            response.data.content.forEach((course, index) => {
              console.group(`🔥 인기코스 ${index + 1}: ${course.title}`);
              console.log('📋 전체 코스 데이터:', course);
              console.log('🗺️ Places 데이터:', course.places);
              console.log('🗺️ Places 개수:', course.places?.length || 0);
              
              if (course.places && course.places.length > 0) {
                course.places.forEach((place, pIndex) => {
                  console.log(`  🗺️ 장소 ${pIndex + 1}:`, {
                    name: place.name,
                    imageUrl: place.imageUrl,
                    hasImageUrl: !!place.imageUrl
                  });
                });
              } else {
                console.warn('⚠️ 인기코스에 장소 데이터가 없습니다!');
              }
              console.groupEnd();
            });
          } else {
            console.error('❌ 인기코스 content 배열이 없거나 유효하지 않음');
          }
          
          console.groupEnd();
        }
        
        return response.data;
      }); // apiRequest가 이미 래퍼 처리함
  },

  // TODO: 백엔드에서 추천 코스 API 구현 후 활성화
  // getRecommendedCourses: (limit: number = 10): Promise<Course[]> =>
  //   apiRequest.get<Course[]>(`/courses/recommendations?limit=${limit}`)
  //     .then(response => response.data),

  // 코스 좋아요/취소 - 백엔드의 create/delete API 사용
  toggleLike: (courseId: number): Promise<{ liked: boolean; likeCount: number }> => {
    // 먼저 좋아요 생성을 시도하고, 실패하면 삭제를 시도하는 토글 로직
    return apiRequest.post('/likes', { courseId })
      .then(() => ({ liked: true, likeCount: 1 })) // 좋아요 생성 성공
      .catch((error) => {
        if (error.response?.status === 409 || error.response?.status === 400) {
          // 이미 좋아요가 있다면 삭제 시도
          return apiRequest.delete('/likes', { data: { courseId } })
            .then(() => ({ liked: false, likeCount: 0 }));
        }
        throw error;
      });
  },


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