import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GitHubLayout } from '../components/layout';
import { useCourses } from '../hooks/useCourses';
import { usePlaces } from '../hooks/usePlaces';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'places'>('all');

  // 코스 검색 - 백엔드에서 search 파라미터를 지원하지 않아 임시로 비활성화
  // Search parameter implementation pending backend support
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    page: 0,
    size: 20
    // search: query // 백엔드에서 아직 지원하지 않음
  }, { enabled: false }); // 임시로 비활성화

  // 장소 검색 - 기존 usePlaces 훅을 활용
  const { data: placesData, isLoading: placesLoading } = usePlaces({
    page: 0,
    size: 20,
    query: query
  });

  const courses = coursesData?.content || [];
  const places = placesData || []; // 장소 API는 배열을 직접 반환
  const totalResults = courses.length + places.length;

  const tabs = [
    { label: '전체', key: 'all' as const, count: totalResults },
    { label: '코스', key: 'courses' as const, count: courses.length },
    { label: '장소', key: 'places' as const, count: places.length }
  ];

  const isLoading = coursesLoading || placesLoading;

  if (!query) {
    return (
      <GitHubLayout title="검색">
        <div 
          className="text-center py-16"
          style={{ color: 'var(--notion-text-light)' }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--notion-text)', marginBottom: '8px' }}>
            검색어를 입력해주세요
          </h2>
          <p>코스나 장소를 검색해보세요.</p>
        </div>
      </GitHubLayout>
    );
  }

  return (
    <GitHubLayout 
      title={`"${query}" 검색 결과`}
      subtitle={`${totalResults}개의 결과를 찾았습니다`}
    >
      <div className="space-y-6">
        {/* 탭 네비게이션 */}
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? '500' : '400',
                color: activeTab === tab.key ? 'var(--notion-text)' : 'var(--notion-text-light)',
                background: activeTab === tab.key ? 'var(--notion-white)' : 'transparent',
                border: '1px solid var(--notion-gray-light)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab.label}
              <span 
                style={{
                  backgroundColor: 'var(--notion-gray-light)',
                  color: 'var(--notion-text-light)',
                  fontSize: '12px',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontWeight: '500'
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="animate-pulse p-6 rounded-lg"
                style={{
                  background: 'var(--notion-white)',
                  border: '1px solid var(--notion-gray-light)'
                }}
              >
                <div 
                  className="h-4 rounded mb-2"
                  style={{ background: 'var(--notion-gray-light)', width: '60%' }}
                />
                <div 
                  className="h-3 rounded"
                  style={{ background: 'var(--notion-gray-light)', width: '40%' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* 검색 결과 */}
        {!isLoading && (
          <>
            {/* 전체 탭 */}
            {activeTab === 'all' && (
              <div className="space-y-6">
                {/* 코스 섹션 */}
                {courses.length > 0 && (
                  <div>
                    <h3 
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--notion-text)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      🚀 코스 ({courses.length})
                    </h3>
                    <div className="space-y-3">
                      {courses.slice(0, 5).map((course) => (
                        <CourseCard key={course.courseId} course={course} />
                      ))}
                      {courses.length > 5 && (
                        <button
                          onClick={() => setActiveTab('courses')}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            color: 'var(--notion-blue)',
                            background: 'transparent',
                            border: '1px solid var(--notion-gray-light)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          코스 결과 더보기 ({courses.length - 5}개)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 장소 섹션 */}
                {places.length > 0 && (
                  <div>
                    <h3 
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'var(--notion-text)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📍 장소 ({places.length})
                    </h3>
                    <div className="space-y-3">
                      {places.slice(0, 5).map((place) => (
                        <PlaceCard key={place.placeId} place={place} />
                      ))}
                      {places.length > 5 && (
                        <button
                          onClick={() => setActiveTab('places')}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            color: 'var(--notion-blue)',
                            background: 'transparent',
                            border: '1px solid var(--notion-gray-light)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          장소 결과 더보기 ({places.length - 5}개)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 코스 탭 */}
            {activeTab === 'courses' && (
              <div className="space-y-3">
                {courses.map((course) => (
                  <CourseCard key={course.courseId} course={course} />
                ))}
                {courses.length === 0 && <NoResults type="코스" query={query} />}
              </div>
            )}

            {/* 장소 탭 */}
            {activeTab === 'places' && (
              <div className="space-y-3">
                {places.map((place) => (
                  <PlaceCard key={place.placeId} place={place} />
                ))}
                {places.length === 0 && <NoResults type="장소" query={query} />}
              </div>
            )}

            {/* 결과 없음 */}
            {totalResults === 0 && (
              <div 
                className="text-center py-16"
                style={{ color: 'var(--notion-text-light)' }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--notion-text)', marginBottom: '8px' }}>
                  검색 결과가 없습니다
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  "{query}"와 관련된 코스나 장소를 찾을 수 없습니다.
                </p>
                <div style={{ fontSize: '14px', color: 'var(--notion-text-light)' }}>
                  <p>• 검색어의 철자를 확인해보세요</p>
                  <p>• 다른 키워드로 검색해보세요</p>
                  <p>• 더 간단한 검색어를 사용해보세요</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GitHubLayout>
  );
};

// 코스 카드 컴포넌트
const CourseCard: React.FC<{ course: any }> = ({ course }) => (
  <Link
    to={`/courses/${course.courseId}`}
    style={{
      display: 'block',
      textDecoration: 'none',
      background: 'var(--notion-white)',
      border: '1px solid var(--notion-gray-light)',
      borderRadius: '8px',
      padding: '16px',
      transition: 'all 0.15s ease'
    }}
    className="hover:shadow-sm"
  >
    <h4 style={{
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--notion-text)',
      marginBottom: '8px'
    }}>
      {course.title}
    </h4>
    {course.description && (
      <p style={{
        fontSize: '14px',
        color: 'var(--notion-text-light)',
        marginBottom: '12px',
        lineHeight: '1.4'
      }}>
        {course.description.length > 100 
          ? `${course.description.slice(0, 100)}...` 
          : course.description}
      </p>
    )}
    <div 
      className="flex items-center space-x-4"
      style={{
        fontSize: '13px',
        color: 'var(--notion-text-light)'
      }}
    >
      <span>⭐ {course.averageRating?.toFixed(1) || '0.0'}</span>
      <span>❤️ {course.likeCount || 0}</span>
      <span>👁️ {course.viewCount || 0}</span>
      {course.region && <span>📍 {course.region}</span>}
    </div>
  </Link>
);

// 장소 카드 컴포넌트
const PlaceCard: React.FC<{ place: any }> = ({ place }) => (
  <Link
    to={`/places/${place.placeId}`}
    style={{
      display: 'block',
      textDecoration: 'none',
      background: 'var(--notion-white)',
      border: '1px solid var(--notion-gray-light)',
      borderRadius: '8px',
      padding: '16px',
      transition: 'all 0.15s ease'
    }}
    className="hover:shadow-sm"
  >
    <h4 style={{
      fontSize: '16px',
      fontWeight: '600',
      color: 'var(--notion-text)',
      marginBottom: '8px'
    }}>
      {place.name || place.placeName}
    </h4>
    {(place.address || place.roadAddress) && (
      <p style={{
        fontSize: '14px',
        color: 'var(--notion-text-light)',
        marginBottom: '12px'
      }}>
        {place.address || place.roadAddress}
      </p>
    )}
    <div 
      className="flex items-center space-x-4"
      style={{
        fontSize: '13px',
        color: 'var(--notion-text-light)'
      }}
    >
      {place.averageRating && <span>⭐ {place.averageRating.toFixed(1)}</span>}
      {place.reviewCount !== undefined && <span>리뷰 {place.reviewCount}개</span>}
      {place.category && <span>🏷️ {place.category}</span>}
    </div>
  </Link>
);

// 결과 없음 컴포넌트
const NoResults: React.FC<{ type: string; query: string }> = ({ type, query }) => (
  <div 
    className="text-center py-12"
    style={{ color: 'var(--notion-text-light)' }}
  >
    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
    <h3 style={{ 
      fontSize: '18px', 
      fontWeight: '600', 
      color: 'var(--notion-text)', 
      marginBottom: '8px' 
    }}>
      {type} 검색 결과가 없습니다
    </h3>
    <p>"{query}"와 관련된 {type.toLowerCase()}를 찾을 수 없습니다.</p>
  </div>
);

export default SearchPage;