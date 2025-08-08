import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../api/services/comment.service';
import type {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  PageResponse,
  PaginationParams
} from '../api/types';

// 댓글 목록 조회
export const useComments = (targetType: string, targetId: string, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['comments', targetType, targetId, params],
    queryFn: () => commentService.getComments(targetType, targetId, params),
    enabled: !!targetType && !!targetId,
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
  });
};

// 댓글 작성
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ targetType, targetId, commentData }: { 
      targetType: string; 
      targetId: string; 
      commentData: CommentCreateRequest 
    }) => commentService.createComment(targetType, targetId, commentData),
    onSuccess: (newComment, { targetType, targetId }) => {
      // 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['comments', targetType, targetId] 
      });
      
      // 댓글 개수 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['comments', targetType, targetId, 'count'] 
      });
      
      // 내 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['my-comments'] 
      });
    },
    onError: (error) => {
      console.error('Failed to create comment:', error);
    }
  });
};

// 댓글 수정
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, commentData }: { 
      commentId: number; 
      commentData: CommentUpdateRequest 
    }) => commentService.updateComment(commentId, commentData),
    onSuccess: (updatedComment) => {
      // 해당 댓글이 포함된 모든 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['comments'] 
      });
      
      // 특정 댓글 캐시 업데이트
      queryClient.setQueryData(['comments', updatedComment.commentId], updatedComment);
    },
    onError: (error) => {
      console.error('Failed to update comment:', error);
    }
  });
};

// 댓글 삭제
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: number) => commentService.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      // 모든 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['comments'] 
      });
      
      // 특정 댓글 캐시 제거
      queryClient.removeQueries({ 
        queryKey: ['comments', commentId] 
      });
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error);
    }
  });
};

// 대댓글 작성
export const useCreateReply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ parentCommentId, replyData }: { 
      parentCommentId: number; 
      replyData: CommentCreateRequest 
    }) => commentService.createReply(parentCommentId, replyData),
    onSuccess: (_, { parentCommentId }) => {
      // 대댓글 목록 캐시 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['comments', parentCommentId, 'replies'] 
      });
      
      // 전체 댓글 목록도 무효화 (댓글 수 업데이트)
      queryClient.invalidateQueries({ 
        queryKey: ['comments'] 
      });
    },
    onError: (error) => {
      console.error('Failed to create reply:', error);
    }
  });
};

// 대댓글 목록 조회
export const useReplies = (parentCommentId: number, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['comments', parentCommentId, 'replies', params],
    queryFn: () => commentService.getReplies(parentCommentId, params),
    enabled: !!parentCommentId,
    staleTime: 1 * 60 * 1000, // 1분
  });
};

// 댓글 좋아요 토글
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: number) => commentService.toggleCommentLike(commentId),
    onSuccess: (result, commentId) => {
      // 댓글 목록에서 해당 댓글의 좋아요 상태 업데이트
      queryClient.setQueriesData<PageResponse<Comment>>(
        { queryKey: ['comments'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            content: oldData.content.map(comment => 
              comment.commentId === commentId
                ? { ...comment, isLiked: result.isLiked, likeCount: result.likeCount }
                : comment
            )
          };
        }
      );
      
      // 특정 댓글 캐시도 업데이트
      queryClient.setQueryData(['comments', commentId], (oldComment: Comment | undefined) => 
        oldComment ? { ...oldComment, isLiked: result.isLiked, likeCount: result.likeCount } : undefined
      );
    },
    onError: (error) => {
      console.error('Failed to toggle comment like:', error);
    }
  });
};

// 댓글 신고
export const useReportComment = () => {
  return useMutation({
    mutationFn: ({ commentId, reason }: { commentId: number; reason: string }) => 
      commentService.reportComment(commentId, reason),
    onError: (error) => {
      console.error('Failed to report comment:', error);
    }
  });
};

// 사용자의 댓글 목록 조회
export const useUserComments = (userId: number, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['user-comments', userId, params],
    queryFn: () => commentService.getUserComments(userId, params),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 내 댓글 목록 조회
export const useMyComments = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['my-comments', params],
    queryFn: () => commentService.getMyComments(params),
    staleTime: 1 * 60 * 1000, // 1분
  });
};

// 댓글 상세 조회
export const useComment = (commentId: number) => {
  return useQuery({
    queryKey: ['comments', commentId],
    queryFn: () => commentService.getCommentById(commentId),
    enabled: !!commentId,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 댓글 개수 조회
export const useCommentCount = (targetType: string, targetId: string) => {
  return useQuery({
    queryKey: ['comments', targetType, targetId, 'count'],
    queryFn: () => commentService.getCommentCount(targetType, targetId),
    enabled: !!targetType && !!targetId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};