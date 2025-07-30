# Where We Go - 라우팅 및 상태관리 설계

## 목차
1. 라우팅 구조 설계
2. 상태 관리 전략
3. 데이터 플로우 아키텍처
4. 보안 및 권한 관리

---

## 1. 라우팅 구조 설계

### 라우트 계층 구조

```typescript
// src/router/routes.tsx
export const routeConfig = {
  // 공개 라우트
  public: {
    home: '/',
    login: '/login',
    signup: '/signup',
    courses: '/courses',
    courseDetail: '/courses/:id',
    places: '/places',
    placeDetail: '/places/:id',
    search: '/search',
  },
  
  // 보호된 라우트 (인증 필요)
  protected: {
    courseCreate: '/courses/create',
    courseEdit: '/courses/:id/edit',
    profile: '/profile',
    myBookmarks: '/profile/bookmarks',
    myCourses: '/profile/courses',
    settings: '/profile/settings',
  },
  
  // 관리자 라우트
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    courses: '/admin/courses',
    reports: '/admin/reports',
  }
};
```

### React Router v6 설정

```typescript
// src/router/AppRouter.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AuthGuard } from '../components/auth/AuthGuard';
import { AdminGuard } from '../components/auth/AdminGuard';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// 지연 로딩된 페이지 컴포넌트
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const CourseListPage = lazy(() => import('../pages/CourseListPage'));
const CourseDetailPage = lazy(() => import('../pages/CourseDetailPage'));
const CourseCreatePage = lazy(() => import('../pages/CourseCreatePage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // 공개 라우트
      {
        index: true,
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageSkeleton />}>
            <LoginPage />
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
                <CourseListPage />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <CourseDetailPage />
              </Suspense>
            ),
          },
          {
            path: 'create',
            element: (
              <AuthGuard>
                <Suspense fallback={<PageSkeleton />}>
                  <CourseCreatePage />
                </Suspense>
              </AuthGuard>
            ),
          },
        ],
      },
      
      // 보호된 라우트
      {
        path: 'profile',
        element: <AuthGuard />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageSkeleton />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: 'bookmarks',
            element: <UserBookmarksPage />,
          },
          {
            path: 'courses',
            element: <UserCoursesPage />,
          },
        ],
      },
      
      // 관리자 라우트
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <AdminUsersPage />,
          },
        ],
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
```

### 라우트 가드 구현

```typescript
// src/components/auth/AuthGuard.tsx
interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: UserRole;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = '/login',
  requiredRole
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// src/components/auth/AdminGuard.tsx
export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <AuthGuard requiredRole="ADMIN" redirectTo="/unauthorized">
      {children}
    </AuthGuard>
  );
};
```

### 브레드크럼 네비게이션

```typescript
// src/hooks/useBreadcrumb.ts
interface BreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

export const useBreadcrumb = (): BreadcrumbItem[] => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: '홈', path: '/', isActive: pathSegments.length === 0 }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isActive = index === pathSegments.length - 1;
      
      const breadcrumbConfig: Record<string, string> = {
        courses: '코스',
        places: '장소',
        profile: '마이페이지',
        create: '생성',
        edit: '수정',
        bookmarks: '북마크',
      };
      
      breadcrumbs.push({
        label: breadcrumbConfig[segment] || segment,
        path: currentPath,
        isActive,
      });
    });
    
    return breadcrumbs;
  }, [location.pathname]);
};
```

---

## 2. 상태 관리 전략

### Zustand Store 구조

```typescript
// src/store/types.ts
export interface RootState {
  auth: AuthState;
  ui: UIState;
  course: CourseState;
  place: PlaceState;
}

// 각 도메인별 상태 인터페이스
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  lastLoginTime: number | null;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  loadingStates: Record<string, boolean>;
  modals: Record<string, boolean>;
}

export interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  filters: CourseFilters;
  pagination: PaginationState;
  searchQuery: string;
  viewMode: 'grid' | 'list';
}
```

### 인증 상태 관리

```typescript
// src/store/authStore.ts
interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: true,
      lastLoginTime: null,

      // 액션들
      login: async (credentials: LoginCredentials) => {
        try {
          set({ loading: true });
          
          const response = await authService.login(credentials);
          const { user, token, refreshToken } = response.data;
          
          // 토큰을 axios 헤더에 설정
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            lastLoginTime: Date.now(),
          });
          
          // 토큰 자동 갱신 설정
          setupTokenInterceptor();
          
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: () => {
        // API 호출로 서버에서 토큰 무효화
        authService.logout().catch(console.error);
        
        // 로컬 상태 초기화
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          lastLoginTime: null,
        });
        
        // axios 헤더에서 토큰 제거
        delete api.defaults.headers.common['Authorization'];
        
        // 다른 탭에 로그아웃 이벤트 전파
        window.dispatchEvent(new CustomEvent('logout'));
      },

      refreshToken: async () => {
        try {
          const { refreshToken: currentRefreshToken } = get();
          if (!currentRefreshToken) throw new Error('No refresh token');
          
          const response = await authService.refreshToken(currentRefreshToken);
          const { token, refreshToken: newRefreshToken } = response.data;
          
          set({
            token,
            refreshToken: newRefreshToken,
          });
          
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
        } catch (error) {
          // 토큰 갱신 실패 시 로그아웃
          get().logout();
          throw error;
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          const response = await userService.updateProfile(userData);
          set({ user: response.data });
        } catch (error) {
          throw error;
        }
      },

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'where-we-go-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
      }),
    }
  )
);

// 토큰 자동 갱신 인터셉터 설정
const setupTokenInterceptor = () => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        try {
          await useAuthStore.getState().refreshToken();
          // 원래 요청 재시도
          return api.request(error.config);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};
```

### UI 상태 관리

```typescript
// src/store/uiStore.ts
interface UIActions {
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // 초기 상태
      theme: 'system',
      sidebarOpen: false,
      notifications: [],
      loadingStates: {},
      modals: {},

      // 액션들
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),

      setTheme: (theme) => {
        set({ theme });
        
        // 시스템 테마인 경우 실제 테마 적용
        const actualTheme = theme === 'system' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light'
          : theme;
          
        document.documentElement.classList.toggle('dark', actualTheme === 'dark');
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(7);
        const newNotification = { ...notification, id };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        // 자동 제거 (5초 후)
        setTimeout(() => {
          get().removeNotification(id);
        }, 5000);
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      setLoading: (key, loading) => set((state) => ({
        loadingStates: {
          ...state.loadingStates,
          [key]: loading
        }
      })),

      openModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: true }
      })),

      closeModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: false }
      })),
    }),
    {
      name: 'where-we-go-ui',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
```

### 코스 상태 관리

```typescript
// src/store/courseStore.ts
interface CourseActions {
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: number, updates: Partial<Course>) => void;
  removeCourse: (id: number) => void;
  setCurrentCourse: (course: Course | null) => void;
  setFilters: (filters: Partial<CourseFilters>) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setPagination: (pagination: PaginationState) => void;
  resetFilters: () => void;
}

export const useCourseStore = create<CourseState & CourseActions>((set, get) => ({
  // 초기 상태
  courses: [],
  currentCourse: null,
  filters: {
    region: null,
    theme: null,
    duration: null,
    rating: null,
  },
  pagination: {
    page: 1,
    size: 12,
    total: 0,
    totalPages: 0,
  },
  searchQuery: '',
  viewMode: 'grid',

  // 액션들
  setCourses: (courses) => set({ courses }),
  
  addCourse: (course) => set((state) => ({
    courses: [course, ...state.courses]
  })),
  
  updateCourse: (id, updates) => set((state) => ({
    courses: state.courses.map(course =>
      course.id === id ? { ...course, ...updates } : course
    ),
    currentCourse: state.currentCourse?.id === id
      ? { ...state.currentCourse, ...updates }
      : state.currentCourse
  })),
  
  removeCourse: (id) => set((state) => ({
    courses: state.courses.filter(course => course.id !== id),
    currentCourse: state.currentCourse?.id === id ? null : state.currentCourse
  })),
  
  setCurrentCourse: (course) => set({ currentCourse: course }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
    pagination: { ...state.pagination, page: 1 } // 필터 변경 시 첫 페이지로
  })),
  
  setSearchQuery: (searchQuery) => set((state) => ({
    searchQuery,
    pagination: { ...state.pagination, page: 1 }
  })),
  
  setViewMode: (viewMode) => set({ viewMode }),
  
  setPagination: (pagination) => set({ pagination }),
  
  resetFilters: () => set({
    filters: {
      region: null,
      theme: null,
      duration: null,
      rating: null,
    },
    searchQuery: '',
    pagination: {
      page: 1,
      size: 12,
      total: 0,
      totalPages: 0,
    }
  }),
}));
```

---

## 3. 데이터 플로우 아키텍처

### React Query 통합

```typescript
// src/hooks/api/useCourses.ts
export const useCourses = (filters?: CourseFilters, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseService.getCourses(filters),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
    ...options,
  });
};

export const useCourse = (id: number, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourse(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();
  
  return useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: (newCourse) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries(['courses']);
      queryClient.setQueryData(['course', newCourse.id], newCourse);
      
      // 성공 알림
      addNotification({
        type: 'success',
        title: '코스 생성 완료',
        message: '새로운 코스가 성공적으로 생성되었습니다.',
      });
    },
    onError: (error: ApiError) => {
      addNotification({
        type: 'error',
        title: '코스 생성 실패',
        message: error.message || '코스 생성 중 오류가 발생했습니다.',
      });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUIStore();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Course> }) =>
      courseService.updateCourse(id, data),
    onSuccess: (updatedCourse) => {
      // 옵티미스틱 업데이트
      queryClient.setQueryData(['course', updatedCourse.id], updatedCourse);
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries(['courses']);
      
      addNotification({
        type: 'success',
        title: '코스 수정 완료',
        message: '코스 정보가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error: ApiError, variables) => {
      // 롤백
      queryClient.invalidateQueries(['course', variables.id]);
      
      addNotification({
        type: 'error',
        title: '코스 수정 실패',
        message: error.message || '코스 수정 중 오류가 발생했습니다.',
      });
    },
  });
};
```

### 옵티미스틱 업데이트

```typescript
// src/hooks/api/useCourseLike.ts
export const useCourseLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, isLiked }: { courseId: number; isLiked: boolean }) =>
      isLiked ? courseService.unlikeCourse(courseId) : courseService.likeCourse(courseId),
    
    // 옵티미스틱 업데이트
    onMutate: async ({ courseId, isLiked }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries(['course', courseId]);
      await queryClient.cancelQueries(['courses']);
      
      // 이전 데이터 백업
      const previousCourse = queryClient.getQueryData(['course', courseId]);
      const previousCourses = queryClient.getQueryData(['courses']);
      
      // 옵티미스틱 업데이트 적용
      queryClient.setQueryData(['course', courseId], (old: Course | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !isLiked,
          likeCount: isLiked ? old.likeCount - 1 : old.likeCount + 1,
        };
      });
      
      // 코스 목록에도 반영
      queryClient.setQueryData(['courses'], (old: Course[] | undefined) => {
        if (!old) return old;
        return old.map(course =>
          course.id === courseId
            ? {
                ...course,
                isLiked: !isLiked,
                likeCount: isLiked ? course.likeCount - 1 : course.likeCount + 1,
              }
            : course
        );
      });
      
      return { previousCourse, previousCourses };
    },
    
    // 에러 시 롤백
    onError: (error, variables, context) => {
      if (context?.previousCourse) {
        queryClient.setQueryData(['course', variables.courseId], context.previousCourse);
      }
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
    },
    
    // 완료 후 데이터 동기화
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(['course', variables.courseId]);
    },
  });
};
```

---

## 4. 보안 및 권한 관리

### API 인터셉터 보안

```typescript
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CSRF 토큰 추가 (필요한 경우)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshToken();
        return api.request(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 권한 기반 접근 제어

```typescript
// src/hooks/usePermissions.ts
export enum Permission {
  COURSE_CREATE = 'course:create',
  COURSE_EDIT = 'course:edit',
  COURSE_DELETE = 'course:delete',
  ADMIN_ACCESS = 'admin:access',
  USER_MANAGE = 'user:manage',
}

export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    // 관리자는 모든 권한 보유
    if (user.role === 'ADMIN') return true;
    
    // 사용자별 권한 확인
    return user.permissions?.includes(permission) ?? false;
  }, [user]);
  
  const canAccessCourse = useCallback((course: Course): boolean => {
    if (!user) return false;
    
    // 작성자이거나 공개 코스인 경우
    return course.authorId === user.id || course.isPublic;
  }, [user]);
  
  const canEditCourse = useCallback((course: Course): boolean => {
    if (!user) return false;
    
    // 작성자이거나 관리자인 경우
    return course.authorId === user.id || user.role === 'ADMIN';
  }, [user]);
  
  return {
    hasPermission,
    canAccessCourse,
    canEditCourse,
  };
};

// 권한 기반 컴포넌트 렌더링
export const PermissionGuard: React.FC<{
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, fallback = null, children }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
```

### 보안 헤더 및 CSP

```typescript
// vite.config.ts
export default defineConfig({
  // ... 기타 설정
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://dapi.kakao.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.where-we-go.com",
        "font-src 'self'",
      ].join('; '),
    },
  },
});
```

이 라우팅 및 상태관리 설계를 통해 확장 가능하고 보안이 강robust한 클라이언트 사이드 애플리케이션을 구축할 수 있습니다.