import { apiRequest } from '../axios';
import type {
  Comment,
  CourseComment,
  CourseCommentRequest,
  CommentCreateRequest,
  CommentUpdateRequest,
  PageResponse,
  PaginationParams
} from '../types';

export const commentService = {
  // 코스 댓글 목록 조회 (백엔드 API에 맞춰 수정: GET /api/comments?courseId=X)
  getCourseComments: (courseId: string, params: PaginationParams = {}): Promise<PageResponse<CourseComment>> =>
    apiRequest.get<PageResponse<CourseComment>>('/comments', {
      params: {
        courseId: courseId,
        page: params.page || 0, // 백엔드는 0부터 시작
        size: params.size || 20
      }
    }).then(response => response.data),

  // 댓글 목록 조회 (특정 대상에 대한) - 기존 호환성 유지
  getComments: (targetType: string, targetId: string, params: PaginationParams = {}): Promise<PageResponse<Comment>> =>
    apiRequest.get<PageResponse<Comment>>(`/comments/${targetType}/${targetId}`, {
      params: {
        page: (params.page || 0) + 1, // 백엔드는 1부터 시작
        size: params.size || 20
      }
    }).then(response => response.data),

  // 코스 댓글 작성 (백엔드 API에 맞춰 수정: POST /api/comments with courseId in body)
  createCourseComment: (courseId: string, commentData: CourseCommentRequest): Promise<CourseComment> =>
    apiRequest.post<CourseComment>('/comments', { courseId: parseInt(courseId), content: commentData.content })
      .then(response => response.data),

  // 코스 댓글 삭제 (백엔드 API에 맞춰 수정: DELETE /api/comments/{commentId})
  deleteCourseComment: (courseId: string, commentId: number): Promise<void> =>
    apiRequest.delete<void>(`/comments/${commentId}`)
      .then(response => response.data),

  // 코스 댓글 수정 (백엔드 API에 맞춰 수정: PATCH /api/comments/{commentId})
  updateCourseComment: (courseId: string, commentId: number, commentData: CourseCommentRequest): Promise<CourseComment> =>
    apiRequest.patch<CourseComment>(`/comments/${commentId}`, { content: commentData.content })
      .then(response => response.data),

  // 댓글 작성 (기존 호환성 유지)
  createComment: (targetType: string, targetId: string, commentData: CommentCreateRequest): Promise<Comment> =>
    apiRequest.post<Comment>(`/comments/${targetType}/${targetId}`, commentData)
      .then(response => response.data),

  // 댓글 수정 (기존 호환성 유지)
  updateComment: (commentId: number, commentData: CommentUpdateRequest): Promise<Comment> =>
    apiRequest.put<Comment>(`/comments/${commentId}`, commentData)
      .then(response => response.data),

  // 댓글 삭제 (기존 호환성 유지)
  deleteComment: (commentId: number): Promise<void> =>
    apiRequest.delete<void>(`/comments/${commentId}`)
      .then(response => response.data),

  // 대댓글 작성
  createReply: (parentCommentId: number, replyData: CommentCreateRequest): Promise<Comment> =>
    apiRequest.post<Comment>(`/comments/${parentCommentId}/replies`, replyData)
      .then(response => response.data),

  // 대댓글 목록 조회
  getReplies: (parentCommentId: number, params: PaginationParams = {}): Promise<PageResponse<Comment>> =>
    apiRequest.get<PageResponse<Comment>>(`/comments/${parentCommentId}/replies`, {
      params: {
        page: (params.page || 0) + 1,
        size: params.size || 10 // 대댓글은 더 적은 수로
      }
    }).then(response => response.data),

  // 댓글 좋아요/좋아요 취소
  toggleCommentLike: (commentId: number): Promise<{ isLiked: boolean; likeCount: number }> =>
    apiRequest.post<{ isLiked: boolean; likeCount: number }>(`/comments/${commentId}/like`)
      .then(response => response.data),

  // 댓글 신고
  reportComment: (commentId: number, reason: string): Promise<void> =>
    apiRequest.post<void>(`/comments/${commentId}/report`, { reason })
      .then(response => response.data),

  // 사용자의 댓글 목록 조회
  getUserComments: (userId: number, params: PaginationParams = {}): Promise<PageResponse<Comment>> =>
    apiRequest.get<PageResponse<Comment>>(`/users/${userId}/comments`, {
      params: {
        page: (params.page || 0) + 1,
        size: params.size || 20
      }
    }).then(response => response.data),

  // 내 댓글 목록 조회
  getMyComments: (params: PaginationParams = {}): Promise<PageResponse<Comment>> =>
    apiRequest.get<PageResponse<Comment>>('/my/comments', {
      params: {
        page: (params.page || 0) + 1,
        size: params.size || 20
      }
    }).then(response => response.data),

  // 댓글 상세 조회
  getCommentById: (commentId: number): Promise<Comment> =>
    apiRequest.get<Comment>(`/comments/${commentId}`)
      .then(response => response.data),

  // 댓글 개수 조회
  getCommentCount: (targetType: string, targetId: string): Promise<number> =>
    apiRequest.get<{ count: number }>(`/comments/${targetType}/${targetId}/count`)
      .then(response => response.data.count),
};