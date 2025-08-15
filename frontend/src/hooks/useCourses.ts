import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { courseService } from '../api';
import type { Course, CourseSearchRequest, CreateCourseRequest, UpdateCourseRequest } from '../api/types';

// Query Keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params: CourseSearchRequest) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: number) => [...courseKeys.details(), id] as const,
  my: () => [...courseKeys.all, 'my'] as const,
  myList: (params: Omit<CourseSearchRequest, 'authorId'>) => [...courseKeys.my(), params] as const,
  popular: () => [...courseKeys.all, 'popular'] as const,
  recommendations: () => [...courseKeys.all, 'recommendations'] as const,
  themes: () => [...courseKeys.all, 'themes'] as const,
  regions: () => [...courseKeys.all, 'regions'] as const,
  byAuthor: (authorId: number) => [...courseKeys.all, 'author', authorId] as const,
};

// 코스 목록 조회 (페이지네이션)
export const useCourses = (
  params: CourseSearchRequest = {}, 
  options: { enabled?: boolean } = {}
) => {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 마운트 시 재조회 방지
    refetchOnReconnect: false, // 재연결 시 재조회 방지
    enabled, // 조건부 실행
  });
};

// 무한 스크롤을 위한 코스 목록 조회
export const useInfiniteCourses = (params: Omit<CourseSearchRequest, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: [...courseKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 0 }) => 
      courseService.getCourses({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // 마지막 페이지이거나 내용이 없으면 undefined 반환
      if (lastPage.last || !lastPage.content || lastPage.content.length === 0) {
        return undefined;
      }
      return lastPage.number + 1;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// 코스 상세 조회
export const useCourse = (id: number) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 내가 작성한 코스 목록
export const useMyCourses = (params: Omit<CourseSearchRequest, 'authorId'> & { enabled?: boolean } = {}) => {
  const { enabled = true, ...courseParams } = params;
  return useQuery({
    queryKey: courseKeys.myList(courseParams),
    queryFn: () => courseService.getMyCourses(courseParams),
    staleTime: 2 * 60 * 1000, // 2분
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 마운트 시 재조회 방지
    refetchOnReconnect: false, // 재연결 시 재조회 방지
    enabled, // 조건부 실행
  });
};

// 인기 코스 조회
export const usePopularCourses = (region: string = '전체', themes?: string[], limit: number = 10) => {
  return useQuery({
    queryKey: [...courseKeys.popular(), region, themes, limit],
    queryFn: () => courseService.getPopularCourses(region, themes, limit),
    staleTime: 30 * 60 * 1000, // 30분
  });
};

// 추천 코스 조회
export const useRecommendedCourses = (limit: number = 10) => {
  return useQuery({
    queryKey: [...courseKeys.recommendations(), limit],
    queryFn: () => courseService.getRecommendedCourses(limit),
    staleTime: 15 * 60 * 1000, // 15분
  });
};

// 코스 테마 목록
export const useCourseThemes = () => {
  return useQuery({
    queryKey: courseKeys.themes(),
    queryFn: courseService.getThemes,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

// 코스 지역 목록
export const useCourseRegions = () => {
  return useQuery({
    queryKey: courseKeys.regions(),
    queryFn: courseService.getRegions,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

// 특정 작성자의 코스 목록
export const useCoursesByAuthor = (
  authorId: number, 
  params: Omit<CourseSearchRequest, 'authorId'> = {}
) => {
  return useQuery({
    queryKey: [...courseKeys.byAuthor(authorId), params],
    queryFn: () => courseService.getCoursesByAuthor(authorId, params),
    enabled: !!authorId,
    staleTime: 5 * 60 * 1000,
  });
};

// 코스 생성
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData: CreateCourseRequest) => courseService.createCourse(courseData),
    onSuccess: (newCourse) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
      
      // 새 코스 캐시에 추가
      queryClient.setQueryData(courseKeys.detail(newCourse.id), newCourse);
    },
    onError: (error) => {
      console.error('Course creation failed:', error);
    },
  });
};

// 코스 수정
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) =>
      courseService.updateCourse(id, data),
    onSuccess: (updatedCourse) => {
      // 캐시 업데이트
      queryClient.setQueryData(courseKeys.detail(updatedCourse.id), updatedCourse);
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
    },
    onError: (error) => {
      console.error('Course update failed:', error);
    },
  });
};

// 코스 삭제
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => courseService.deleteCourse(id),
    onSuccess: (_, deletedId) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: courseKeys.detail(deletedId) });
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
      queryClient.invalidateQueries({ queryKey: courseKeys.popular() });
    },
    onError: (error) => {
      console.error('Course deletion failed:', error);
    },
  });
};

// 코스 좋아요/취소
export const useToggleCourseLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => courseService.toggleLike(courseId),
    onSuccess: (result, courseId) => {
      // 코스 상세 캐시 업데이트
      queryClient.setQueryData(courseKeys.detail(courseId), (oldData: Course | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          likeCount: result.likeCount,
        };
      });
      
      // 코스 목록 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
    onError: (error) => {
      console.error('Course like toggle failed:', error);
    },
  });
};

// 코스 복사
export const useCopyCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, title }: { courseId: number; title?: string }) =>
      courseService.copyCourse(courseId, title),
    onSuccess: (copiedCourse) => {
      // 내 코스 목록 무효화
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
      
      // 복사된 코스 캐시에 추가
      queryClient.setQueryData(courseKeys.detail(copiedCourse.id), copiedCourse);
    },
    onError: (error) => {
      console.error('Course copy failed:', error);
    },
  });
};

// 코스 공개/비공개 설정
export const useUpdateCourseVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, isPublic }: { courseId: number; isPublic: boolean }) =>
      courseService.updateVisibility(courseId, isPublic),
    onSuccess: (updatedCourse) => {
      // 캐시 업데이트
      queryClient.setQueryData(courseKeys.detail(updatedCourse.id), updatedCourse);
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.my() });
    },
    onError: (error) => {
      console.error('Course visibility update failed:', error);
    },
  });
};