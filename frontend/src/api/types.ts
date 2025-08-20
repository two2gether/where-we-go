// 공통 타입 정의
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 사용자 관련 타입
export interface User {
  userId: number;
  nickname: string;
  email: string;
  profileImage?: string;
  provider?: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterWithImageRequest {
  nickname: string;
  email: string;
  password: string;
  profileImageFile?: File;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  token: string;
}

// 장소 관련 타입
export interface Place {
  placeId: string;
  name: string;
  category: string;
  regionSummary: string;
  region?: {
    depth1: string;
    depth2: string;
  };
  address: string;
  roadAddress?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  averageRating: number;
  reviewCount: number;
  googleRating?: number;
  placeUrl?: string;
  bookmarkCount?: number;
  isBookmarked?: boolean;
  photo?: string;
}

export interface PlaceSearchRequest extends PageRequest {
  keyword?: string;
  category?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface CreatePlaceRequest {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  region: string;
  tags: string[];
}

// 코스 관련 타입
export interface Course {
  id?: number; // 백엔드 응답에서 사용할 수 있는 id 필드
  courseId: number;
  nickname: string;
  title: string;
  description: string;
  themes: string[];
  region: string;
  places: CoursePlace[];
  likeCount: number;
  averageRating: number;
  ratingCount?: number; // 총 평점 개수
  myRating?: number; // 현재 사용자의 평점 (로그인된 경우)
  isLiked?: boolean; // 현재 사용자의 좋아요 여부
  isBookmarked?: boolean; // 현재 사용자의 북마크 여부
  isPublic: boolean;
  createdAt: string;
}

// 코스 내 장소 정보 (백엔드 응답에 맞게 수정)
export interface CoursePlace {
  placeId: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  distanceFromUser?: number | null;
  distanceFromPrevious?: number | null;
  visitOrder: number;
  imageUrl?: string;
}

export interface CoursePlaceInfo {
  id: number;
  place: Place;
  order: number;
  visitDuration: number;
  memo?: string;
}

export interface CourseSearchRequest extends PageRequest {
  keyword?: string;
  region?: string;
  theme?: string;
  authorId?: number;
  sort?: string; // 정렬 파라미터 추가 (예: 'likeCount,desc', 'createdAt,desc')
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  thumbnailUrl?: string;
  region: string;
  theme: string;
  duration: string;
  isPublic: boolean;
  places: {
    placeId: string;
    order: number;
    visitDuration: number;
    memo?: string;
  }[];
}

// 코스 테마 enum (백엔드 CourseTheme과 일치)
export enum CourseTheme {
  HEALING = 'HEALING',
  SENSIBILITY = 'SENSIBILITY',
  ANNIVERSARY = 'ANNIVERSARY',
  ROMANTIC = 'ROMANTIC',
  ACTIVITY = 'ACTIVITY',
  FOOD_TOUR = 'FOOD_TOUR',
  CAFE_TOUR = 'CAFE_TOUR',
  ONE_DAY = 'ONE_DAY',
  DAILY = 'DAILY',
  HOT_PLACE = 'HOT_PLACE',
  DRIVE = 'DRIVE',
  BEST_SHOT = 'BEST_SHOT',
  PICNIC = 'PICNIC',
  TRAVEL = 'TRAVEL',
  RAINY_DAY = 'RAINY_DAY',
  REFRESH = 'REFRESH'
}

// 코스 테마 한국어 이름 매핑
export const CourseThemeLabels: Record<CourseTheme, string> = {
  [CourseTheme.HEALING]: '힐링',
  [CourseTheme.SENSIBILITY]: '감성',
  [CourseTheme.ANNIVERSARY]: '기념일',
  [CourseTheme.ROMANTIC]: '로맨틱',
  [CourseTheme.ACTIVITY]: '액티비티',
  [CourseTheme.FOOD_TOUR]: '맛집탐방',
  [CourseTheme.CAFE_TOUR]: '카페투어',
  [CourseTheme.ONE_DAY]: '당일치기',
  [CourseTheme.DAILY]: '일상',
  [CourseTheme.HOT_PLACE]: '핫플',
  [CourseTheme.DRIVE]: '드라이브',
  [CourseTheme.BEST_SHOT]: '인생샷',
  [CourseTheme.PICNIC]: '피크닉',
  [CourseTheme.TRAVEL]: '여행',
  [CourseTheme.RAINY_DAY]: '비오는날',
  [CourseTheme.REFRESH]: '기분전환'
};

// 백엔드 CourseUpdateRequestDto와 일치하는 코스 수정 요청 타입
export interface UpdateCourseRequest {
  title: string;
  description?: string;
  themes?: CourseTheme[];
  region: string;
  isPublic?: boolean;
}

// 백엔드 CourseUpdateResponseDto와 일치하는 코스 수정 응답 타입
export interface UpdateCourseResponse {
  courseId: number;
  userId: number;
  title: string;
  description?: string;
  themes: CourseTheme[];
  region: string;
  likeCount: number;
  averageRating: number;
  viewCount: number;
  commentCount: number;
  isPublic: boolean;
  createdAt: string;
}

// 코스 댓글 관련 타입 (백엔드 응답 구조에 맞게 수정)
export interface CourseComment {
  commentId: number; // id 대신 commentId 사용
  courseId: number;
  userId: number;
  nickname: string; // author.nickname 대신 직접 nickname 제공
  content: string;
  createdAt: string;
  isMine?: boolean; // 현재 사용자가 작성한 댓글인지 여부
}

export interface CourseCommentRequest {
  content: string;
}

// 코스 목록 응답 타입 (백엔드 CourseListResponseDto와 매칭)
export interface CourseListResponse {
  courseId: number;
  nickname: string;
  title: string;
  description: string;
  themes: string[];
  region: string;
  places: CoursePlaceInfo[];
  likeCount: number;
  averageRating: number;
  isPublic: boolean;
  createdAt: string;
  isLiked?: boolean; // 현재 사용자의 좋아요 여부
  isBookmarked?: boolean; // 현재 사용자의 북마크 여부
  myRating?: number; // 현재 사용자의 평점
  commentCount?: number;
  bookmarkCount?: number;
}

// 북마크 관련 타입
export interface Bookmark {
  id: number;
  user: User;
  place?: Place;
  course?: Course;
  type: 'PLACE' | 'COURSE';
  createdAt: string;
}

export interface BookmarkRequest {
  targetId: string;
  type: 'PLACE' | 'COURSE';
}

// 리뷰 관련 타입
export interface Review {
  id: number;
  content: string;
  rating: number;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  place?: Place;
  course?: Course;
  type: 'PLACE' | 'COURSE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  targetId: string;
  type: 'PLACE' | 'COURSE';
  content: string;
  rating: number;
}

export interface ReviewSearchRequest extends PageRequest {
  targetId?: string;
  type?: 'PLACE' | 'COURSE';
  authorId?: number;
  minRating?: number;
  maxRating?: number;
}

// 좋아요 관련 타입
export interface LikeRequest {
  targetId: number;
  type: 'COURSE' | 'REVIEW';
}

// 파일 업로드 관련 타입
export interface FileUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// 결제 관련 타입 (백엔드 PaymentRequestDto와 매칭)
export interface PaymentRequest {
  orderNo: string;
  amount: number;
  amountTaxFree: number;
  productDesc: string;
  retUrl: string;
  retCancelUrl: string;
  autoExecute: boolean;
  resultCallback?: string;
  callbackVersion?: string;
  quantity?: number;
}

export interface PaymentResponse {
  code: number;
  checkoutPage: string;
  payToken: string;
  msg?: string;
  errorCode?: string;
}

export interface PaymentDetailResponse {
  paymentId: number;
  orderId: number;
  orderNo: string;
  payMethod: 'CARD' | 'ACCOUNT' | 'TOSS_MONEY';
  amount: number;
  discountedAmount: number;
  paidAmount: number;
  paidTs: string;
  paymentStatus: 'PENDING' | 'DONE' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  transactionId: string;
  // 환불 관련 정보
  refundable?: boolean;
  refundReason?: string;
  refundedAt?: string;
  refundUnavailableReason?: string;
  cardInfo?: {
    cardNumber: string;
    cardCompanyCode: number;
    cardAuthorizationNo: string;
    spreadOut: number;
    noInterest: boolean;
    cardMethodType: string;
    cardNum4Print: string;
    salesCheckLinkUrl: string;
  };
  accountInfo?: {
    accountBankCode: string;
    accountBankName: string;
    accountNumber: string;
  };
}

export interface RefundRequest {
  refundReason: string;
  refundAmount?: number;
}

export interface RefundResponse {
  refundId: number;
  orderId: number;
  refundAmount: number;
  refundReason: string;
  refundStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  refundRequestedAt: string;
}

// 주문 관련 타입
export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// 사용자 마이페이지 관련 타입
export interface MyPageResponse {
  userId: number;
  nickname: string;
  email: string;
  profileImage?: string;
  createdAt: string;
}

export interface MyPageUpdateRequest {
  nickname?: string;
  profileImage?: string;
}

export interface WithdrawRequest {
  password: string;
}

// 댓글 관련 타입
export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    nickname: string;
    profileImage?: string;
  };
  courseId: number;
  courseTitle: string;
  createdAt: string;
  updatedAt: string;
  isMine?: boolean; // 현재 사용자가 작성한 댓글인지 여부
}

export interface CreateCommentRequest {
  courseId: number;
  content: string;
}

// 리뷰 관련 타입 (백엔드 응답에 맞게 수정)
export interface PlaceReview {
  reviewId: number;
  placeId: string;
  placeName: string; // 백엔드에서 제공하는 장소 이름
  reviewer: {
    userId: number;
    nickname: string;
    profileImage?: string;
  };
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isMyReview: boolean;
}

export interface CreatePlaceReviewRequest {
  placeId: string;
  content: string;
  rating: number;
}

// 코스 평점 관련 타입 (댓글과 별개)
export interface CourseRating {
  ratingId: number;
  courseId: number;
  userId: number;
  rating: number; // 1-5점
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCourseRatingRequest {
  courseId: number;
  rating: number; // 1-5점
}

// CourseRatingSummary 타입도 제거 (코스 상세 정보에 포함됨)

// 알림 관련 타입 (백엔드 NotificationResponseDto에 맞게 수정)
export interface Notification {
  notificationId: number;  // Long notificationId
  receiverId: number;      // Long receiverId  
  type: 'LIKE' | 'COMMENT'; // NotificationType enum
  message: string;         // String message (백엔드에서는 content가 아닌 message)
  isRead: boolean;         // boolean isRead
  createdAt: string;       // LocalDateTime createdAt
}

// 북마크 관련 타입 (백엔드 응답 구조에 맞게 수정)
export interface BookmarkItem {
  bookmarkId: number;
  place: Place;
  createdAt: string;
}

export interface UserBookmarkList {
  content: BookmarkItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 백엔드 UserBookmarkListDto와 매칭되는 타입
export interface UserBookmarkListDto {
  content: BookmarkItemDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 백엔드 BookmarkItem과 매칭되는 타입
export interface BookmarkItemDto {
  bookmarkId: number;
  place: Place;
  createdAt: string;
}

export interface CourseBookmark {
  id: number;
  course: Course;
  createdAt: string;
}

// 내가 북마크한 코스 목록 응답 타입 (백엔드 UserCourseBookmarkListDto와 매칭)
export interface UserCourseBookmarkListDto {
  courseId: number;
  title: string;
  description: string;
  themes: string[];
  region: string;
  likeCount: number;
  averageRating: number;
  isPublic: boolean;
  places: CoursePlace[];
  createdAt: string;
  bookmarkCreatedAt: string;
  isMine?: boolean; // 현재 사용자가 생성한 코스인지 여부
}

// 좋아요 관련 타입 (백엔드 CourseLikeListResponseDto와 매칭)
export interface CourseLike {
  id: number;
  userId: number;
  courseListDto: {
    courseId: number;
    nickname: string;
    title: string;
    description: string;
    themes: string[];
    region: string;
    places: Array<{
      placeId: string;
      name: string;
      category: string;
      latitude: number;
      longitude: number;
      distanceFromUser?: number | null;
      distanceFromPrevious?: number | null;
      visitOrder: number;
      imageUrl?: string;
    }>;
    likeCount: number;
    averageRating: number;
    isPublic: boolean;
  };
  createdAt?: string; // 생성일시 (선택사항)
}

// 에러 응답 타입
export interface ErrorResponse {
  message: string;
  errorCode: string;
  timestamp: string;
  path: string;
}