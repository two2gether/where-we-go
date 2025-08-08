import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { GitHubLayout } from '../components/layout';

// Pages
import { CoursesPage } from '../pages/CoursesPage';
import { PlacesPage } from '../pages/PlacesPage';
import { LoginPage } from '../pages/LoginPage';
import PaymentPage from '../pages/PaymentPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentDetailPage from '../pages/PaymentDetailPage';
import MyPage from '../pages/MyPage';
import PlaceDetailPage from '../pages/PlaceDetailPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import { BookmarksPage } from '../pages/BookmarksPage';

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
  return <Outlet />;
};

const HomePage = () => {
  const tabs = [
    { label: '홈', href: '/', active: true },
    { label: '인기 코스', href: '/popular', active: false },
    { label: '최신 코스', href: '/recent', active: false },
  ];

  return (
    <GitHubLayout
      title="Where We Go"
      subtitle="나만의 여행 코스를 만들고 공유하세요. 다른 여행자들의 추천 코스를 발견하고 함께 특별한 여행을 계획해보세요."
      tabs={tabs}
    >
      <div className="text-center space-y-12">
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
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
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

const NotFoundPage = () => (
  <GitHubLayout
    title="페이지를 찾을 수 없습니다"
    subtitle="요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다."
  >
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="text-6xl font-bold text-github-neutral-muted mb-6">404</div>
        <svg className="mx-auto h-16 w-16 text-github-neutral-muted mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h1 className="text-2xl font-bold text-primary-900 mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="text-github-neutral mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-github-border text-sm font-medium rounded-md text-primary-900 bg-github-canvas hover:bg-github-canvas-subtle transition-colors"
          >
            이전 페이지
          </button>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  </GitHubLayout>
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
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <CoursesPage />
              </Suspense>
            ),
          },
          {
            path: ':courseId',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <CourseDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'places',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <PlacesPage />
              </Suspense>
            ),
          },
          {
            path: ':placeId',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <PlaceDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'payment',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <PaymentPage />
              </Suspense>
            ),
          },
          {
            path: 'success',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <PaymentSuccessPage />
              </Suspense>
            ),
          },
          {
            path: 'detail/:orderId',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <PaymentDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'mypage',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <MyPage />
          </Suspense>
        ),
      },
      {
        path: 'bookmarks',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <BookmarksPage />
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