import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../../api/services/comment.service';
import { useAuthStore } from '../../store/authStore';
import { CourseComment, CourseCommentRequest, PageResponse } from '../../api/types';

interface CourseCommentsProps {
  courseId: string;
  className?: string;
}

const CourseComments: React.FC<CourseCommentsProps> = ({ courseId, className = '' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 목록 조회
  const { data: commentsData, isLoading, error } = useQuery({
    queryKey: ['course-comments', courseId],
    queryFn: async () => {
      return await commentService.getCourseComments(courseId);
    },
    enabled: !!courseId,
    staleTime: 30 * 1000, // 30초
  });

  // 댓글 작성 뮤테이션
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: CourseCommentRequest) => {
      return await commentService.createCourseComment(courseId, commentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-comments', courseId] });
      setNewComment('');
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
      setIsSubmitting(false);
    }
  });

  // 댓글 삭제 뮤테이션
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await commentService.deleteCourseComment(courseId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-comments', courseId] });
    },
    onError: (error) => {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    createCommentMutation.mutate({ content: newComment.trim() });
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 30) return `${days}일 전`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`${className}`}>
      {/* 댓글 작성 폼 */}
      {isAuthenticated && (
        <div className="linear-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-linear-text-primary mb-4">댓글 작성</h3>
          <form onSubmit={handleSubmitComment}>
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="이 코스에 대한 의견을 남겨보세요..."
                className="linear-input resize-none"
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-linear-text-tertiary">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className={`linear-button linear-button-primary ${isSubmitting || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="linear-card">
        <div className="border-b border-linear-border-primary p-6">
          <h3 className="text-lg font-semibold text-linear-text-primary">
            댓글 ({commentsData?.totalElements || 0})
          </h3>
        </div>

        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-linear-primary mx-auto mb-3"></div>
            <p className="text-linear-text-secondary">댓글을 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <svg className="w-8 h-8 text-linear-error mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-linear-error">댓글을 불러오는데 실패했습니다.</p>
          </div>
        )}

        {commentsData?.content && commentsData.content.length > 0 ? (
          <div className="space-y-4 p-6">
            {commentsData.content.map((comment, index) => (
              <div key={comment.commentId} className={`linear-thread ${index === commentsData.content.length - 1 ? 'mb-0' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="linear-avatar">
                        <span>
                          {comment.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-sm font-semibold text-linear-text-primary">
                          {comment.nickname}
                        </h4>
                        {comment.isMine && (
                          <span className="linear-badge linear-badge-primary text-xs">
                            내 댓글
                          </span>
                        )}
                        <span className="text-xs text-linear-text-tertiary">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-linear-text-primary whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                  
                  {/* 삭제 버튼 (본인 댓글만) - isMine 필드 활용 */}
                  {comment.isMine && (
                    <button
                      onClick={() => handleDeleteComment(comment.commentId)}
                      className="text-linear-text-tertiary hover:text-linear-error p-1 transition-colors"
                      title="댓글 삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-linear-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-linear-text-secondary mb-3">아직 댓글이 없습니다.</p>
              {!isAuthenticated && (
                <p className="text-sm text-linear-text-tertiary">
                  <span className="text-linear-primary hover:text-linear-primary-dark cursor-pointer transition-colors">로그인</span>하고 첫 댓글을 남겨보세요!
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CourseComments;