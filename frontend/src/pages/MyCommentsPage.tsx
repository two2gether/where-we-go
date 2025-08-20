import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyComments } from '../hooks/useUser';
import LinearLayout from '../components/layout/LinearLayout';
import { Card, Button, Spinner } from '../components/base';

const MyCommentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const { data, isLoading, error } = useMyComments(page, pageSize);
  
  const comments = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <LinearLayout 
        title="내 댓글" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '내 댓글' }
        ]}
      >
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </LinearLayout>
    );
  }

  if (error) {
    return (
      <LinearLayout 
        title="내 댓글" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '내 댓글' }
        ]}
      >
        <Card variant="outlined" padding="lg" className="text-center border-red-200 bg-red-50">
          <p className="text-red-700 mb-3">댓글 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </Card>
      </LinearLayout>
    );
  }

  return (
    <LinearLayout 
      title="내 댓글" 
      breadcrumbs={[
        { label: '마이페이지', href: '/mypage' },
        { label: '내 댓글' }
      ]}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'var(--notion-text)',
              margin: 0
            }}
          >
            💬 내 댓글 ({totalElements}개)
          </h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/mypage')}
          >
            ← 마이페이지
          </Button>
        </div>
      </div>

      {comments.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {comments.map((comment) => (
              <Card key={comment.id} variant="outlined" padding="md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Link 
                      to={`/courses/${comment.courseId}`}
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--notion-blue)',
                        textDecoration: 'none'
                      }}
                    >
                      {comment.courseTitle || `코스 #${comment.courseId}`}
                    </Link>
                    <div 
                      style={{
                        fontSize: '12px',
                        color: 'var(--notion-text-light)'
                      }}
                    >
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p 
                    style={{
                      fontSize: '14px',
                      color: 'var(--notion-text)',
                      lineHeight: '1.5',
                      marginBottom: '12px'
                    }}
                  >
                    {comment.content}
                  </p>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/courses/${comment.courseId}`)}
                    >
                      코스 보기
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                이전
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card variant="outlined" padding="lg" className="text-center">
          <div className="py-16">
            <div 
              className="text-6xl mb-4"
              style={{ color: 'var(--notion-text-light)' }}
            >
              💬
            </div>
            <h3 
              className="mb-2"
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--notion-text)'
              }}
            >
              작성한 댓글이 없습니다
            </h3>
            <p 
              className="mb-6"
              style={{
                fontSize: '14px',
                color: 'var(--notion-text-light)'
              }}
            >
              관심있는 코스에 댓글을 남겨보세요.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/courses')}
            >
              코스 둘러보기
            </Button>
          </div>
        </Card>
      )}
    </LinearLayout>
  );
};

export default MyCommentsPage;