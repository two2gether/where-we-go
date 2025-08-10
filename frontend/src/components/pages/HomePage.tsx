import React from 'react';
import { Link } from 'react-router-dom';
import { GitHubLayout } from '../layout';
import { useCourses } from '../../hooks/useCourses';
import { usePlaces } from '../../hooks/usePlaces';

const HomePage = () => {
  // 실제 데이터 가져오기
  const { data: coursesData } = useCourses({ page: 0, size: 3, sortBy: 'likeCount', sortDir: 'desc' });
  const { data: placesData } = usePlaces({ page: 0, size: 10 });

  const tabs = [
    { label: '홈', href: '/', active: true },
    { label: '인기 코스', href: '/popular', active: false },
    { label: '최신 코스', href: '/recent', active: false },
  ];

  // 실제 통계 데이터 계산
  const totalCourses = coursesData?.totalElements || 0;
  const totalPlaces = placesData?.totalElements || 0;
  const popularCourses = coursesData?.content || [];

  return (
    <GitHubLayout
      title="Where We Go"
      subtitle="나만의 여행 코스를 만들고 공유하세요. 다른 여행자들의 추천 코스를 발견하고 함께 특별한 여행을 계획해보세요."
      tabs={tabs}
    >
      <div className="text-center space-y-12">
        {/* Notion 스타일 Statistics Section - 실제 데이터 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div 
            className="text-center p-6 rounded-lg border"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <div 
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--notion-blue)',
                marginBottom: '8px'
              }}
            >
              {totalCourses}+
            </div>
            <div 
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--notion-text-light)'
              }}
            >
              등록된 코스
            </div>
          </div>
          <div 
            className="text-center p-6 rounded-lg border"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <div 
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--notion-blue)',
                marginBottom: '8px'
              }}
            >
              {totalPlaces}+
            </div>
            <div 
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--notion-text-light)'
              }}
            >
              추천 장소
            </div>
          </div>
          <div 
            className="text-center p-6 rounded-lg border"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <div 
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--notion-blue)',
                marginBottom: '8px'
              }}
            >
              {popularCourses.reduce((sum, course) => sum + (course.likeCount || 0), 0)}+
            </div>
            <div 
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--notion-text-light)'
              }}
            >
              총 좋아요
            </div>
          </div>
          <div 
            className="text-center p-6 rounded-lg border"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <div 
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--notion-blue)',
                marginBottom: '8px'
              }}
            >
              {popularCourses.reduce((sum, course) => sum + (course.viewCount || 0), 0)}+
            </div>
            <div 
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--notion-text-light)'
              }}
            >
              총 조회수
            </div>
          </div>
        </div>

        {/* Notion 스타일 Hero Section */}
        <div className="space-y-6">
          <div className="flex justify-center space-x-3">
            <Link 
              to="/courses" 
              className="inline-flex items-center px-5 py-3 text-base font-medium rounded-md transition-colors"
              style={{
                color: 'var(--notion-white)',
                background: 'var(--notion-blue)',
                border: 'none',
                textDecoration: 'none',
                gap: '8px'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              코스 탐색하기
            </Link>
            <Link 
              to="/places" 
              className="inline-flex items-center px-5 py-3 text-base font-medium rounded-md transition-colors"
              style={{
                color: 'var(--notion-text)',
                background: 'var(--notion-white)',
                border: '1px solid var(--notion-gray-light)',
                textDecoration: 'none',
                gap: '8px'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              장소 둘러보기
            </Link>
            <Link 
              to="/events" 
              className="inline-flex items-center px-5 py-3 text-base font-medium rounded-md transition-colors"
              style={{
                color: 'var(--notion-white)',
                background: 'var(--notion-red)',
                border: 'none',
                textDecoration: 'none',
                gap: '8px'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              🔥 특가 이벤트
            </Link>
          </div>
        </div>

        {/* Notion 스타일 Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          <div 
            className="rounded-lg p-6 transition-colors"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px'
            }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto"
              style={{
                background: 'var(--notion-gray-bg)',
                color: 'var(--notion-blue)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 
              className="mb-3"
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                textAlign: 'center'
              }}
            >
              코스 탐색
            </h3>
            <p 
              className="leading-relaxed mb-4"
              style={{
                color: 'var(--notion-text-light)',
                fontSize: '14px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}
            >
              전국 각지의 다양한 여행 코스를 둘러보고, 
              평점과 후기를 확인하여 완벽한 여행을 계획하세요.
            </p>
            <Link 
              to="/courses" 
              className="inline-block font-medium"
              style={{
                color: 'var(--notion-blue)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                textAlign: 'center'
              }}
            >
              코스 보러가기 →
            </Link>
          </div>
          
          <div 
            className="rounded-lg p-6 transition-colors"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px'
            }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto"
              style={{
                background: 'var(--notion-gray-bg)',
                color: 'var(--notion-blue)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 
              className="mb-3"
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                textAlign: 'center'
              }}
            >
              장소 검색
            </h3>
            <p 
              className="leading-relaxed mb-4"
              style={{
                color: 'var(--notion-text-light)',
                fontSize: '14px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}
            >
              관심 있는 장소들을 검색하고 탐색하여
              나만의 여행 코스에 추가해보세요.
            </p>
            <Link 
              to="/places" 
              className="inline-block font-medium"
              style={{
                color: 'var(--notion-blue)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                textAlign: 'center'
              }}
            >
              장소 찾아보기 →
            </Link>
          </div>
          
          <div 
            className="rounded-lg p-6 transition-colors"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px'
            }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto"
              style={{
                background: 'var(--notion-gray-bg)',
                color: 'var(--notion-blue)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 
              className="mb-3"
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                textAlign: 'center'
              }}
            >
              코스 생성
            </h3>
            <p 
              className="leading-relaxed mb-4"
              style={{
                color: 'var(--notion-text-light)',
                fontSize: '14px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}
            >
              나만의 특별한 여행 코스를 만들어 다른 여행자들과 
              소중한 경험을 공유해보세요.
            </p>
            <Link 
              to="/places" 
              className="inline-block font-medium"
              style={{
                color: 'var(--notion-blue)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                textAlign: 'center'
              }}
            >
              코스 만들기 →
            </Link>
          </div>
          
          <div 
            className="rounded-lg p-6 transition-colors"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-red)',
              borderRadius: '8px'
            }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 mx-auto"
              style={{
                background: 'var(--notion-red)',
                color: 'var(--notion-white)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 
              className="mb-3"
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--notion-text)',
                textAlign: 'center'
              }}
            >
              🔥 특가 이벤트
            </h3>
            <p 
              className="leading-relaxed mb-4"
              style={{
                color: 'var(--notion-text-light)',
                fontSize: '14px',
                lineHeight: '1.6',
                textAlign: 'center'
              }}
            >
              한정 기간 특가 혜택! 여행 상품을 할인된 가격으로 
              만나보세요. 놓치면 후회할 기회입니다.
            </p>
            <Link 
              to="/events" 
              className="inline-block font-medium"
              style={{
                color: 'var(--notion-red)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                textAlign: 'center'
              }}
            >
              이벤트 보러가기 →
            </Link>
          </div>
        </div>

        {/* Notion 스타일 Popular Content Section - 실제 데이터만 */}
        <div className="max-w-4xl mx-auto mt-20">
          {/* Notion 스타일 Popular Courses - 실제 데이터 */}
          <div 
            className="rounded-lg p-6"
            style={{
              background: 'var(--notion-white)',
              border: '1px solid var(--notion-gray-light)',
              borderRadius: '8px'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--notion-text)',
                  margin: 0
                }}
              >
                🔥 인기 코스
              </h3>
              <Link 
                to="/courses" 
                style={{
                  color: 'var(--notion-blue)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                모두 보기 →
              </Link>
            </div>
            <div className="space-y-3">
              {popularCourses.length > 0 ? popularCourses.map((course, index) => (
                <Link
                  key={course.courseId}
                  to={`/courses/${course.courseId}`}
                  className="flex items-center space-x-4 p-4 rounded-md transition-all"
                  style={{
                    background: 'var(--notion-gray-bg)',
                    border: '1px solid var(--notion-gray-light)',
                    borderRadius: '6px',
                    textDecoration: 'none'
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-md flex items-center justify-center font-bold"
                    style={{
                      background: index === 0 ? 'var(--notion-blue)' : 
                                  index === 1 ? '#22c55e' : 
                                  '#a855f7',
                      color: 'var(--notion-white)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="mb-1"
                      style={{
                        fontWeight: '600',
                        color: 'var(--notion-text)',
                        fontSize: '16px',
                        margin: 0,
                        marginBottom: '4px'
                      }}
                    >
                      {course.title}
                    </h4>
                    <p 
                      className="mb-2"
                      style={{
                        fontSize: '13px',
                        color: 'var(--notion-text-light)',
                        margin: 0,
                        marginBottom: '8px'
                      }}
                    >
                      {course.places?.slice(0, 3).map(place => place.placeName).join(' → ') || course.region}
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span>⭐</span>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--notion-text)' }}>
                          {course.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>❤️</span>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--notion-text)' }}>
                          {course.likeCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>👁️</span>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--notion-text)' }}>
                          {course.viewCount || 0}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--notion-text-light)' }}>
                        {new Date(course.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div 
                  className="text-center py-12"
                  style={{ color: 'var(--notion-text-light)' }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                  <h4 
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--notion-text)'
                    }}
                  >
                    아직 등록된 코스가 없습니다
                  </h4>
                  <p style={{ marginBottom: '16px', color: 'var(--notion-text-light)' }}>
                    첫 번째 여행 코스를 만들어 다른 사람들과 공유해보세요!
                  </p>
                  <Link 
                    to="/places" 
                    className="inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors"
                    style={{
                      background: 'var(--notion-blue)',
                      color: 'var(--notion-white)',
                      textDecoration: 'none',
                      gap: '4px'
                    }}
                  >
                    코스 만들러 가기 →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notion 스타일 CTA Section */}
        <div 
          className="rounded-lg p-12 mt-16"
          style={{
            background: 'var(--notion-blue)',
            borderRadius: '12px',
            color: 'var(--notion-white)',
            textAlign: 'center'
          }}
        >
          <h2 
            style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '12px',
              color: 'var(--notion-white)'
            }}
          >
            지금 시작해보세요!
          </h2>
          <p 
            style={{
              fontSize: '16px',
              marginBottom: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.5'
            }}
          >
            무료로 가입하고 나만의 여행 코스를 만들어보세요.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center px-6 py-3 rounded-md text-lg font-semibold transition-colors"
            style={{
              background: 'var(--notion-white)',
              color: 'var(--notion-blue)',
              textDecoration: 'none',
              gap: '8px',
              fontWeight: '600',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            무료로 시작하기
          </Link>
        </div>
      </div>
    </GitHubLayout>
  );
};

export default HomePage;