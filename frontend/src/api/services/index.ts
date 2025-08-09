export { authService } from './auth.service';
export { placeService } from './place.service';
export { courseService } from './course.service';
export { bookmarkService } from './bookmark.service';
export { paymentService } from './payment.service';
export { userService } from './user.service';
export { reviewService } from './review.service';
export { commentService } from './comment.service';
export { courseRatingService } from './courseRating.service';
export { notificationService } from './notification.service';
export { orderService } from './order.service';
export { courseLikeService } from './courseLike.service';
export { courseBookmarkService } from './courseBookmark.service';
export { eventProductService, adminEventProductService } from './eventProduct.service';

// Health Check Service (간단한 헬스체크 함수 추가)
export const healthService = {
  checkHealth: () => import('../axios').then(({ apiRequest }) => 
    apiRequest.get('/health').then(response => response.data)
  ),
  checkActuatorHealth: () => import('../axios').then(({ apiRequest }) => 
    apiRequest.get('/actuator/health').then(response => response.data)
  ),
};