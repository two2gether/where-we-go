import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyCourseLikes } from '../hooks/useUser';
import { convertThemesToDisplay } from '../constants/themes';
import LinearLayout from '../components/layout/LinearLayout';
import { Card, Button, Spinner, Badge } from '../components/base';
import { CourseCard } from '../components/domain';

const MyLikesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const { data, isLoading, error } = useMyCourseLikes(page, pageSize);
  
  
  const likes = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <LinearLayout 
        title="좋아요한 코스" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '좋아요한 코스' }
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
        title="좋아요한 코스" 
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '좋아요한 코스' }
        ]}
      >
        <Card variant="outlined" padding="lg" className="text-center border-red-200 bg-red-50">
          <p className="text-red-700 mb-3">좋아요 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </Card>
      </LinearLayout>
    );
  }

  return (
    <LinearLayout 
      title="좋아요한 코스" 
      breadcrumbs={[
        { label: '마이페이지', href: '/mypage' },
        { label: '좋아요한 코스' }
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
            💖 좋아요한 코스 ({totalElements}개)
          </h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/mypage')}
          >
            ← 마이페이지
          </Button>
        </div>
      </div>

      {likes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {likes.map((like) => {
              // 🔍 상세 디버깅 (개발 환경에서만)
              if (import.meta.env.DEV) {
                console.group(`🔍 좋아요 코스 #${like.id} - ${like.courseListDto.title}`);
                console.log('전체 데이터:', like);
                console.log('코스 정보:', like.courseListDto);
                console.log('장소 배열:', like.courseListDto.places);
                console.log('장소 개수:', like.courseListDto.places?.length || 0);
                
                if (like.courseListDto.places && like.courseListDto.places.length > 0) {
                  like.courseListDto.places.forEach((place, index) => {
                    console.log(`장소 ${index + 1}:`, {
                      name: place.name,
                      imageUrl: place.imageUrl,
                      hasImage: !!place.imageUrl
                    });
                  });
                } else {
                  console.warn('⚠️ 장소 데이터가 없습니다!');
                }
                console.groupEnd();
              }
              
              const firstPlace = like.courseListDto.places?.[0];
              let thumbnail = firstPlace?.imageUrl;
              
              // 이미지 URL 유효성 검사 및 로깅
              if (import.meta.env.DEV) {
                console.log('Original thumbnail URL:', thumbnail);
                if (thumbnail && !thumbnail.startsWith('http')) {
                  console.warn('Invalid thumbnail URL detected:', thumbnail);
                }
              }
              
              // 기본 이미지로 대체하되, 빈 문자열도 체크
              if (!thumbnail || thumbnail.trim() === '') {
                thumbnail = 'https://via.placeholder.com/400x300?text=No+Image';
                if (import.meta.env.DEV) {
                  console.log('Using placeholder image');
                }
              }
              
              // 🎯 최종 이미지 URL 확인 및 테스트 (개발 환경에서만)
              if (import.meta.env.DEV) {
                console.log(`🖼️ 최종 썸네일 URL (코스: ${like.courseListDto.title}):`, thumbnail);
                
                if (!thumbnail || thumbnail.includes('placeholder')) {
                  console.log('💡 실제 이미지가 없어서 테스트 이미지 사용');
                  thumbnail = 'https://picsum.photos/400/300?random=' + Math.floor(Math.random() * 1000);
                }
                
                console.log('📱 브라우저 개발자 도구의 Network 탭에서 이미지 요청을 확인하세요!');
              }
              
              return (
              <CourseCard
                key={like.id}
                id={like.courseListDto.courseId}
                title={like.courseListDto.title}
                description={like.courseListDto.description}
                thumbnail={thumbnail}
                region={like.courseListDto.region}
                theme={convertThemesToDisplay(like.courseListDto.themes)[0] || '테마 없음'}
                rating={like.courseListDto.averageRating}
                likeCount={like.courseListDto.likeCount}
                duration="1일" // 기본값
                author={{
                  name: like.courseListDto.nickname || '익명'
                }}
                isLiked={true} // 좋아요 페이지에서는 모두 좋아요 상태
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
              💖
            </div>
            <h3 
              className="mb-2"
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--notion-text)'
              }}
            >
              좋아요한 코스가 없습니다
            </h3>
            <p 
              className="mb-6"
              style={{
                fontSize: '14px',
                color: 'var(--notion-text-light)'
              }}
            >
              관심있는 코스에 좋아요를 눌러보세요.
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

export default MyLikesPage;