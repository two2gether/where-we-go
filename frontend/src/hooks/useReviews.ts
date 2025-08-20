import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../api/services/review.service';
import type { 
  CreatePlaceReviewRequest,
  PlaceReview
} from '../api/types';

// Query Keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (placeId: string, page?: number, size?: number) => 
    [...reviewKeys.lists(), placeId, { page, size }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (reviewId: number) => [...reviewKeys.details(), reviewId] as const,
  my: () => [...reviewKeys.all, 'my'] as const,
  myList: (page?: number, size?: number) => [...reviewKeys.my(), { page, size }] as const,
  myForPlace: (placeId: string) => [...reviewKeys.all, 'my-for-place', placeId] as const,
};

// 장소별 리뷰 목록 조회
export const usePlaceReviews = (placeId: string, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: reviewKeys.list(placeId, page, size),
    queryFn: () => reviewService.getPlaceReviews(placeId, page, size),
    enabled: !!placeId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 리뷰 상세 조회 (백엔드에 해당 API 없음 - 제거)

// 내가 작성한 리뷰 목록
export const useMyReviews = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: reviewKeys.myList(page, size),
    queryFn: () => reviewService.getMyReviews(page, size),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 특정 장소에 대한 내 리뷰 조회
export const useMyReviewForPlace = (placeId: string) => {
  return useQuery({
    queryKey: reviewKeys.myForPlace(placeId),
    queryFn: () => reviewService.getMyReviewForPlace(placeId),
    enabled: !!placeId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 리뷰 작성
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: CreatePlaceReviewRequest) => reviewService.createReview(reviewData),
    onSuccess: (newReview) => {
      console.log('🎯 Review created, invalidating caches for placeId:', newReview.placeId);
      
      // 해당 장소의 리뷰 목록 무효화 (모든 페이지)
      queryClient.invalidateQueries({ 
        queryKey: reviewKeys.lists()
      });
      
      // 장소 상세 정보 강력한 캐시 무효화
      queryClient.removeQueries({ 
        queryKey: ['place', newReview.placeId] 
      });
      
      // 장소 상세 정보 즉시 재요청
      queryClient.refetchQueries({ 
        queryKey: ['place', newReview.placeId] 
      });
      
      // 내 리뷰 목록 무효화
      queryClient.invalidateQueries({ queryKey: reviewKeys.my() });
      
      // 특정 장소에 대한 내 리뷰 캐시 업데이트
      queryClient.setQueryData(
        reviewKeys.myForPlace(newReview.placeId),
        newReview
      );
      
      // MyPage 관련 쿼리들도 무효화 (리뷰 통계 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['mypage'] });
      
      console.log('✅ Cache invalidation completed');
    },
    onError: (error) => {
      console.error('Review creation failed:', error);
    },
  });
};

// 리뷰 수정
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ placeId, reviewData }: { 
      placeId: string; 
      reviewData: Partial<CreatePlaceReviewRequest> 
    }) => reviewService.updateReview(placeId, reviewData),
    onSuccess: (updatedReview, { placeId }) => {
      console.log('🎯 Review updated, invalidating caches for placeId:', placeId);
      
      // 해당 장소의 리뷰 목록 무효화 (모든 페이지)
      queryClient.invalidateQueries({ 
        queryKey: reviewKeys.lists()
      });
      
      // 장소 상세 정보 강제 무효화 및 즉시 재요청
      queryClient.invalidateQueries({ 
        queryKey: ['place', placeId] 
      });
      
      // 추가: 장소 상세 정보 즉시 재요청
      queryClient.refetchQueries({ 
        queryKey: ['place', placeId] 
      });
      
      // 내 리뷰 목록 무효화
      queryClient.invalidateQueries({ queryKey: reviewKeys.my() });
      
      // 특정 장소에 대한 내 리뷰 캐시 업데이트
      queryClient.setQueryData(reviewKeys.myForPlace(placeId), updatedReview);
      
      // MyPage 관련 쿼리들도 무효화 (리뷰 통계 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['mypage'] });
      
      console.log('✅ Cache invalidation completed');
    },
    onError: (error) => {
      console.error('Review update failed:', error);
    },
  });
};

// 리뷰 삭제
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: string) => reviewService.deleteReview(placeId),
    onSuccess: (_, placeId) => {
      console.log('🎯 Review deleted, invalidating caches for placeId:', placeId);
      
      // 해당 장소의 리뷰 목록 무효화 (모든 페이지)
      queryClient.invalidateQueries({ 
        queryKey: reviewKeys.lists()
      });
      
      // 장소 상세 정보 강제 무효화 및 즉시 재요청
      queryClient.invalidateQueries({ 
        queryKey: ['place', placeId] 
      });
      
      // 추가: 장소 상세 정보 즉시 재요청
      queryClient.refetchQueries({ 
        queryKey: ['place', placeId] 
      });
      
      // 내 리뷰 목록 무효화
      queryClient.invalidateQueries({ queryKey: reviewKeys.my() });
      
      // 특정 장소에 대한 내 리뷰 캐시 제거
      queryClient.removeQueries({ queryKey: reviewKeys.myForPlace(placeId) });
      
      // MyPage 관련 쿼리들도 무효화 (리뷰 통계 업데이트를 위해)
      queryClient.invalidateQueries({ queryKey: ['mypage'] });
      
      console.log('✅ Cache invalidation completed');
    },
    onError: (error) => {
      console.error('Review deletion failed:', error);
    },
  });
};

// 좋아요 및 신고 기능은 백엔드에서 지원하지 않음