import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';

// Pages
import { CoursesPage } from '../pages/CoursesPage';
import { PlacesPage } from '../pages/PlacesPage';
import { LoginPage } from '../pages/LoginPage';

// 임시 페이지 컴포넌트들
const PageSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

const Layout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // 에러가 발생해도 로컬 로그아웃은 진행 (이미 useLogout 훅에서 처리됨)
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold gradient-text">
                Where We Go
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                홈
              </Link>
              <Link 
                to="/courses" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                코스
              </Link>
              <Link 
                to="/places" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                장소
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces'}
                      alt={user?.nickname}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.nickname}님
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="btn-base btn-outline btn-sm"
                  >
                    {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-base btn-outline btn-sm">
                    로그인
                  </Link>
                  <Link to="/login" className="btn-base btn-primary btn-sm">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold gradient-text mb-4">Where We Go</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                나만의 여행 코스를 만들고 공유하며, 
                다른 여행자들의 특별한 경험을 발견해보세요.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/courses" className="hover:text-primary-600 transition-colors">코스 탐색</Link></li>
                <li><Link to="/places" className="hover:text-primary-600 transition-colors">장소 검색</Link></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">코스 만들기</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">마이페이지</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary-600 transition-colors">자주 묻는 질문</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">문의하기</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">개인정보처리방침</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 Where We Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const HomePage = () => (
  <div className="text-center space-y-12">
    {/* Hero Section */}
    <div className="space-y-6">
      <h1 className="text-5xl font-bold gradient-text">Where We Go</h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        나만의 여행 코스를 만들고 공유하세요. 
        다른 여행자들의 추천 코스를 발견하고 함께 특별한 여행을 계획해보세요.
      </p>
      <div className="flex justify-center space-x-4">
        <Link to="/courses" className="btn-base btn-primary btn-lg">
          코스 탐색하기
        </Link>
        <Link to="/places" className="btn-base btn-outline btn-lg">
          장소 둘러보기
        </Link>
      </div>
    </div>

    {/* Features Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
      <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">코스 탐색</h3>
        <p className="text-gray-600 leading-relaxed">
          전국 각지의 다양한 여행 코스를 둘러보고, 
          평점과 후기를 확인하여 완벽한 여행을 계획하세요.
        </p>
        <Link to="/courses" className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium">
          코스 보러가기 →
        </Link>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
        <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
          <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">장소 검색</h3>
        <p className="text-gray-600 leading-relaxed">
          관심 있는 장소들을 검색하고 탐색하여
          나만의 여행 코스에 추가해보세요.
        </p>
        <Link to="/places" className="inline-block mt-4 text-secondary-600 hover:text-secondary-700 font-medium">
          장소 찾아보기 →
        </Link>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
        <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
          <svg className="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">코스 생성</h3>
        <p className="text-gray-600 leading-relaxed">
          나만의 특별한 여행 코스를 만들어 다른 여행자들과 
          소중한 경험을 공유해보세요.
        </p>
        <a href="#" className="inline-block mt-4 text-info-600 hover:text-info-700 font-medium">
          코스 만들기 →
        </a>
      </div>
    </div>

    {/* CTA Section */}
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-white">
      <h2 className="text-3xl font-bold mb-4">지금 시작해보세요!</h2>
      <p className="text-primary-100 mb-8 text-lg">
        무료로 가입하고 나만의 여행 코스를 만들어보세요.
      </p>
      <Link to="/login" className="btn-base bg-white text-primary-600 hover:bg-gray-50 btn-lg font-semibold">
        무료로 시작하기
      </Link>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-600 mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <div className="space-x-4">
        <button 
          onClick={() => window.history.back()}
          className="btn-base btn-primary btn-md"
        >
          이전 페이지
        </button>
        <Link to="/" className="btn-base btn-outline btn-md">
          홈으로 가기
        </Link>
      </div>
    </div>
  </div>
);

// Router Configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'courses',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <CoursesPage />
          </Suspense>
        ),
      },
      {
        path: 'places',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <PlacesPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <LoginPage />
      </Suspense>
    ),
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};