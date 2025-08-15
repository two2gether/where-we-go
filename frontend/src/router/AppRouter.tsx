import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLogout } from '../hooks/useAuth';
import { GitHubLayout } from '../components/layout';
import HomePage from '../components/pages/HomePage';

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
import OrdersPage from '../pages/OrdersPage';
import EventProductsPage from '../pages/EventProductsPage';
import EventProductDetailPage from '../pages/EventProductDetailPage';
import SearchPage from '../pages/SearchPage';
import ProductManagePage from '../pages/admin/ProductManagePage';
import ProductCreatePage from '../pages/admin/ProductCreatePage';
import ProductEditPage from '../pages/admin/ProductEditPage';
import SocialLoginCallback from '../components/auth/SocialLoginCallback';

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
        path: 'orders',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <OrdersPage />
          </Suspense>
        ),
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <SearchPage />
          </Suspense>
        ),
      },
      {
        path: 'events',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <EventProductsPage />
              </Suspense>
            ),
          },
          {
            path: ':productId',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <EventProductDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: 'products',
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<PageSkeleton />}>
                    <ProductManagePage />
                  </Suspense>
                ),
              },
              {
                path: 'create',
                element: (
                  <Suspense fallback={<PageSkeleton />}>
                    <ProductCreatePage />
                  </Suspense>
                ),
              },
              {
                path: ':productId/edit',
                element: (
                  <Suspense fallback={<PageSkeleton />}>
                    <ProductEditPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
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
  {
    path: '/auth/:provider/callback',
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <SocialLoginCallback />
      </Suspense>
    ),
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};