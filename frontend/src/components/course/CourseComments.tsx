import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../api/axios';
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
      const response = await apiRequest.get<PageResponse<CourseComment>>(`/courses/${courseId}/comments`);
      return response.data;
    },
    enabled: !!courseId,
    staleTime: 30 * 1000, // 30초
  });

  // 댓글 작성 뮤테이션
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: CourseCommentRequest) => {
      const response = await apiRequest.post<CourseComment>(`/courses/${courseId}/comments`, commentData);
      return response.data;
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
      await apiRequest.delete(`/courses/${courseId}/comments/${commentId}`);
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
        <div className="bg-white rounded-lg border border-github-border p-4 mb-6">
          <h3 className="text-lg font-semibold text-github-neutral mb-4">댓글 작성</h3>
          <form onSubmit={handleSubmitComment}>
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="이 코스에 대한 의견을 남겨보세요..."
                className="w-full p-3 border border-github-border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-github-neutral-muted">
                  {newComment.length}/500
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSubmitting ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="bg-white rounded-lg border border-github-border">
        <div className="border-b border-github-border p-4">
          <h3 className="text-lg font-semibold text-github-neutral">
            댓글 ({commentsData?.totalElements || 0})
          </h3>
        </div>

        {isLoading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
            <p className="text-github-neutral-muted">댓글을 불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <svg className="w-8 h-8 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-600">댓글을 불러오는데 실패했습니다.</p>
          </div>
        )}

        {commentsData?.content && commentsData.content.length > 0 ? (
          <div className="divide-y divide-github-border">
            {commentsData.content.map((comment) => (
              <div key={comment.commentId} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {/* 프로필 이미지는 백엔드에서 제공하지 않으므로 기본 아바타 사용 */}
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {comment.nickname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-github-neutral">
                          {comment.nickname}
                        </h4>
                        <span className="text-xs text-github-neutral-muted">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-github-neutral whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                  
                  {/* 삭제 버튼 (본인 댓글만) */}
                  {user && user.id === comment.userId && (
                    <button
                      onClick={() => handleDeleteComment(comment.commentId)}
                      className="text-github-neutral-muted hover:text-red-600 p-1 ml-2"
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
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-github-neutral-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-github-neutral-muted mb-2">아직 댓글이 없습니다.</p>
              {!isAuthenticated && (
                <p className="text-sm text-github-neutral-muted">
                  <span className="text-primary-600 hover:text-primary-700 cursor-pointer">로그인</span>하고 첫 댓글을 남겨보세요!
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