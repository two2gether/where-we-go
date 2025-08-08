import { apiRequest } from '../axios';
import type { 
  PlaceReview,
  CreatePlaceReviewRequest,
  PageResponse
} from '../types';

export const reviewService = {
  // 장소 리뷰 목록 조회
  getPlaceReviews: (
    placeId: string, 
    page: number = 0, 
    size: number = 10
  ): Promise<PageResponse<PlaceReview>> =>
    apiRequest.get<PageResponse<PlaceReview>>(`/places/${placeId}/reviews?page=${page}&size=${size}`)
      .then(response => response.data),

  // 리뷰 작성 (장소별)
  createReview: (reviewData: CreatePlaceReviewRequest): Promise<PlaceReview> =>
    apiRequest.post<PlaceReview>(`/places/${reviewData.placeId}/reviews`, {
      content: reviewData.content,
      rating: reviewData.rating
    }).then(response => response.data),

  // 리뷰 수정 (장소별 - 내 리뷰)
  updateReview: (placeId: string, reviewData: Partial<CreatePlaceReviewRequest>): Promise<PlaceReview> =>
    apiRequest.put<PlaceReview>(`/places/${placeId}/reviews`, {
      content: reviewData.content,
      rating: reviewData.rating
    }).then(response => response.data),

  // 리뷰 삭제 (장소별 - 내 리뷰)
  deleteReview: (placeId: string): Promise<void> =>
    apiRequest.delete<void>(`/places/${placeId}/reviews`)
      .then(response => response.data),

  // 내가 작성한 리뷰 목록 (이미 userService에 있지만 별도로도 제공)
  getMyReviews: (page: number = 0, size: number = 10): Promise<PageResponse<PlaceReview>> =>
    apiRequest.get<PageResponse<PlaceReview>>(`/users/mypage/reviews?page=${page}&size=${size}`)
      .then(response => response.data),

  // 특정 장소에 대한 내 리뷰 조회 (리뷰 목록에서 확인하는 방식으로 대체)
  getMyReviewForPlace: (placeId: string): Promise<PlaceReview | null> => {
    // 백엔드에 해당 엔드포인트가 없으므로 null 반환
    // 실제로는 리뷰 목록을 조회해서 현재 사용자의 리뷰를 찾아야 함
    return Promise.resolve(null);
  },
};