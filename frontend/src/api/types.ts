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

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

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
  apiKey: string;
  orderNo: string;
  amount: number;
  amountTaxFree: number;
  productDesc: string;
  retUrl: string;
  retCancelUrl: string;
  autoExecute: boolean;
  resultCallback?: string;
  callbackVersion?: string;
  productId?: number;
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

// 알림 관련 타입
export interface Notification {
  id: number;
  type: 'COMMENT' | 'LIKE' | 'BOOKMARK' | 'SYSTEM';
  title: string;
  content: string;
  isRead: boolean;
  relatedId?: number;
  relatedType?: 'COURSE' | 'PLACE' | 'COMMENT';
  createdAt: string;
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