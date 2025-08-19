import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyCourses } from '../hooks/useUser';
import { convertThemesToDisplay } from '../constants/themes';
import LinearLayout from '../components/layout/LinearLayout';
import { Card, Button, Spinner, Badge } from '../components/base';
import { CourseCard } from '../components/domain';

const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const { data, isLoading, error } = useMyCourses(page, pageSize);
  
  const courses = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <LinearLayout 
        title="내 코스" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '내 코스' }
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
        title="내 코스" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '내 코스' }
        ]}
      >
        <Card variant="outlined" padding="lg" className="text-center border-red-200 bg-red-50">
          <p className="text-red-700 mb-3">코스 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </Card>
      </LinearLayout>
    );
  }

  return (
    <LinearLayout 
      title="내 코스" 
      breadcrumbs={[
        { label: '마이페이지', href: '/mypage' },
        { label: '내 코스' }
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
            🚀 내 코스 ({totalElements}개)
          </h2>
          <div className="flex gap-3">
            <Button 
              variant="primary"
              onClick={() => navigate('/courses/create')}
            >
              + 코스 만들기
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/mypage')}
            >
              ← 마이페이지
            </Button>
          </div>
        </div>
      </div>

      {courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => {
              const firstPlace = course.places?.[0];
              const thumbnail = firstPlace?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';
              
              return (
              <CourseCard
                key={course.courseId}
                id={course.courseId}
                title={course.title}
                description={course.description}
                thumbnail={thumbnail}
                region={course.region}
                theme={convertThemesToDisplay(course.themes)[0] || '테마 없음'}
                rating={course.averageRating}
                likeCount={course.likeCount}
                duration="1일" // 기본값
                author={{
                  name: course.nickname || '익명'
                }}
                onViewDetails={(id) => navigate(`/courses/${id}`)}
              />
              );
            })}
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
              🚀
            </div>
            <h3 
              className="mb-2"
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--notion-text)'
              }}
            >
              만든 코스가 없습니다
            </h3>
            <p 
              className="mb-6"
              style={{
                fontSize: '14px',
                color: 'var(--notion-text-light)'
              }}
            >
              나만의 여행 코스를 만들어보세요.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/courses/create')}
            >
              코스 만들기
            </Button>
          </div>
        </Card>
      )}
    </LinearLayout>
  );
};

export default MyCoursesPage;