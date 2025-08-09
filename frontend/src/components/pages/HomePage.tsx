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
        {/* Statistics Section - 실제 데이터 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalCourses}+</div>
            <div className="text-sm font-medium text-blue-800">등록된 코스</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{totalPlaces}+</div>
            <div className="text-sm font-medium text-green-800">추천 장소</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {popularCourses.reduce((sum, course) => sum + (course.likeCount || 0), 0)}+
            </div>
            <div className="text-sm font-medium text-purple-800">총 좋아요</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {popularCourses.reduce((sum, course) => sum + (course.viewCount || 0), 0)}+
            </div>
            <div className="text-sm font-medium text-orange-800">총 조회수</div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex justify-center space-x-4">
            <Link to="/courses" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              코스 탐색하기
            </Link>
            <Link to="/places" className="inline-flex items-center px-6 py-3 border border-github-border text-base font-medium rounded-md text-primary-900 bg-github-canvas hover:bg-github-canvas-subtle transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              장소 둘러보기
            </Link>
            <Link to="/events" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              🔥 특가 이벤트
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="bg-github-canvas border border-github-border rounded-lg p-8 hover:border-github-border-muted transition-colors">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-900 mb-4">코스 탐색</h3>
            <p className="text-github-neutral leading-relaxed">
              전국 각지의 다양한 여행 코스를 둘러보고, 
              평점과 후기를 확인하여 완벽한 여행을 계획하세요.
            </p>
            <Link to="/courses" className="inline-block mt-4 text-secondary-600 hover:text-secondary-700 font-medium">
              코스 보러가기 →
            </Link>
          </div>
          
          <div className="bg-github-canvas border border-github-border rounded-lg p-8 hover:border-github-border-muted transition-colors">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-900 mb-4">장소 검색</h3>
            <p className="text-github-neutral leading-relaxed">
              관심 있는 장소들을 검색하고 탐색하여
              나만의 여행 코스에 추가해보세요.
            </p>
            <Link to="/places" className="inline-block mt-4 text-secondary-600 hover:text-secondary-700 font-medium">
              장소 찾아보기 →
            </Link>
          </div>
          
          <div className="bg-github-canvas border border-github-border rounded-lg p-8 hover:border-github-border-muted transition-colors">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-900 mb-4">코스 생성</h3>
            <p className="text-github-neutral leading-relaxed">
              나만의 특별한 여행 코스를 만들어 다른 여행자들과 
              소중한 경험을 공유해보세요.
            </p>
            <Link to="/places" className="inline-block mt-4 text-secondary-600 hover:text-secondary-700 font-medium">
              코스 만들기 →
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-8 hover:border-red-300 transition-colors">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-primary-900 mb-4">🔥 특가 이벤트</h3>
            <p className="text-github-neutral leading-relaxed">
              한정 기간 특가 혜택! 여행 상품을 할인된 가격으로 
              만나보세요. 놓치면 후회할 기회입니다.
            </p>
            <Link to="/events" className="inline-block mt-4 text-red-600 hover:text-red-700 font-medium">
              이벤트 보러가기 →
            </Link>
          </div>
        </div>

        {/* Popular Content Section - 실제 데이터만 */}
        <div className="max-w-4xl mx-auto mt-20">
          {/* Popular Courses - 실제 데이터 */}
          <div className="bg-github-canvas border border-github-border rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-primary-900">🔥 인기 코스</h3>
              <Link to="/courses" className="text-secondary-600 hover:text-secondary-700 font-medium text-sm">
                모두 보기 →
              </Link>
            </div>
            <div className="space-y-4">
              {popularCourses.length > 0 ? popularCourses.map((course, index) => (
                <Link
                  key={course.courseId}
                  to={`/courses/${course.courseId}`}
                  className="flex items-center space-x-4 p-4 bg-white rounded-md border border-github-border hover:border-github-border-muted hover:shadow-sm transition-all"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${
                    index === 0 ? 'from-blue-400 to-blue-600' :
                    index === 1 ? 'from-green-400 to-green-600' :
                    'from-purple-400 to-purple-600'
                  } rounded-md flex items-center justify-center text-white font-bold`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-900 mb-1">{course.title}</h4>
                    <p className="text-sm text-github-neutral mb-2">
                      {course.places?.slice(0, 3).map(place => place.placeName).join(' → ') || course.region}
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">{course.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-red-500">❤️</span>
                        <span className="text-sm font-medium">{course.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-blue-500">👁️</span>
                        <span className="text-sm font-medium">{course.viewCount || 0}</span>
                      </div>
                      <div className="text-xs text-github-neutral">
                        {new Date(course.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-12 text-github-neutral">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h4 className="text-lg font-semibold mb-2">아직 등록된 코스가 없습니다</h4>
                  <p className="mb-4">첫 번째 여행 코스를 만들어 다른 사람들과 공유해보세요!</p>
                  <Link 
                    to="/places" 
                    className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors font-medium"
                  >
                    코스 만들러 가기 →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg p-12 text-white mt-16">
          <h2 className="text-3xl font-bold mb-4">지금 시작해보세요!</h2>
          <p className="text-secondary-100 mb-8 text-lg">
            무료로 가입하고 나만의 여행 코스를 만들어보세요.
          </p>
          <Link to="/login" className="inline-flex items-center px-6 py-3 bg-white text-primary-900 hover:bg-gray-50 rounded-md text-lg font-semibold transition-colors shadow-md">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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