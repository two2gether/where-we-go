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
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  region: string;
  theme: string;
  rating: number;
  likeCount: number;
  duration: string;
  isPublic: boolean;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  places: CoursePlaceInfo[];
  createdAt: string;
  updatedAt: string;
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
  images: string[];
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
  images?: string[];
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

// 에러 응답 타입
export interface ErrorResponse {
  message: string;
  errorCode: string;
  timestamp: string;
  path: string;
}