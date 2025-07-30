# Where We Go - 컴포넌트 아키텍처

## 컴포넌트 설계 원칙

### 1. 단일 책임 원칙 (Single Responsibility)
- 각 컴포넌트는 하나의 명확한 목적을 가집니다
- 재사용 가능한 로직은 커스텀 훅으로 분리합니다

### 2. 합성 패턴 (Composition Pattern)
- 상속보다 합성을 우선시합니다
- Compound Components 패턴을 활용합니다

### 3. 관심사의 분리 (Separation of Concerns)
- 비즈니스 로직과 UI 로직을 분리합니다
- 데이터 처리는 커스텀 훅에서 담당합니다

## 컴포넌트 계층 구조

### Level 1: 기본 컴포넌트 (Base Components)
가장 기본적인 UI 요소들로, 다른 컴포넌트의 구성 요소가 됩니다.

```typescript
// components/base/
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   ├── Input.types.ts
│   └── index.ts
├── Badge/
├── Avatar/
├── Icon/
├── Spinner/
└── Typography/
```

#### Button 컴포넌트
```typescript
// components/base/Button/Button.types.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// components/base/Button/Button.tsx
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'btn-base';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {!loading && leftIcon && leftIcon}
      {children}
      {!loading && rightIcon && rightIcon}
    </button>
  );
};
```

### Level 2: 복합 컴포넌트 (Composite Components)
기본 컴포넌트들을 조합하여 특정 기능을 제공하는 컴포넌트들입니다.

```typescript
// components/common/
├── Header/
│   ├── Header.tsx
│   ├── HeaderMenu.tsx
│   ├── HeaderSearch.tsx
│   └── index.ts
├── Navigation/
├── Modal/
├── Card/
├── Form/
├── SearchBar/
└── Pagination/
```

#### Modal 컴포넌트 (Compound Component Pattern)
```typescript
// components/common/Modal/Modal.types.ts
export interface ModalContextType {
  isOpen: boolean;
  onClose: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// components/common/Modal/Modal.tsx
const ModalContext = createContext<ModalContextType | null>(null);

export const Modal: React.FC<ModalProps> & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
} = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(ModalContext);
  
  return (
    <div className="modal-header">
      {children}
      <Button
        variant="ghost"
        size="sm"
        onClick={context?.onClose}
        rightIcon={<X className="icon-sm" />}
      />
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
```

### Level 3: 도메인 컴포넌트 (Domain Components)
비즈니스 로직과 밀접한 관련이 있는 컴포넌트들입니다.

```typescript
// components/domain/
├── auth/
│   ├── LoginForm/
│   ├── SignupForm/
│   └── AuthGuard/
├── course/
│   ├── CourseCard/
│   ├── CourseList/
│   ├── CourseDetail/
│   ├── CourseForm/
│   └── CourseFilters/
├── place/
│   ├── PlaceCard/
│   ├── PlaceSearch/
│   ├── PlaceMap/
│   └── PlaceBookmark/
└── user/
    ├── UserProfile/
    ├── UserBookmarks/
    └── UserCourses/
```

#### CourseCard 컴포넌트
```typescript
// components/domain/course/CourseCard/CourseCard.types.ts
export interface CourseCardProps {
  course: Course;
  onLike?: (courseId: number) => void;
  onBookmark?: (courseId: number) => void;
  onViewDetail?: (courseId: number) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

// components/domain/course/CourseCard/CourseCard.tsx
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onLike,
  onBookmark,
  onViewDetail,
  showActions = true,
  variant = 'default'
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(course.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(course.isBookmarked);

  const handleLike = async () => {
    if (!user) return;
    
    try {
      await onLike?.(course.id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to like course:', error);
    }
  };

  return (
    <Card className={cn('course-card', `course-card--${variant}`)}>
      <div className="course-card-image">
        <img
          src={course.thumbnail || '/placeholder-course.jpg'}
          alt={course.title}
          loading="lazy"
        />
        {showActions && (
          <div className="course-card-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              leftIcon={
                <Heart
                  className={cn('icon-sm', isLiked && 'text-red-500 fill-current')}
                />
              }
            >
              {course.likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              leftIcon={
                <Bookmark
                  className={cn('icon-sm', isBookmarked && 'text-primary-500 fill-current')}
                />
              }
            />
          </div>
        )}
      </div>
      
      <div className="course-card-content">
        <Badge variant="secondary">{course.theme}</Badge>
        <Typography variant="h3" className="course-card-title">
          {course.title}
        </Typography>
        <Typography variant="body2" className="course-card-description">
          {course.description}
        </Typography>
        
        <div className="course-card-meta">
          <div className="flex items-center gap-2">
            <MapPin className="icon-sm text-gray-400" />
            <Typography variant="caption">{course.region}</Typography>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="icon-sm text-gray-400" />
            <Typography variant="caption">{course.duration}</Typography>
          </div>
        </div>
        
        <div className="course-card-footer">
          <div className="flex items-center gap-2">
            <Avatar src={course.author.avatar} size="sm" />
            <Typography variant="caption">{course.author.name}</Typography>
          </div>
          <div className="flex items-center gap-1">
            <Star className="icon-sm text-yellow-400 fill-current" />
            <Typography variant="caption">{course.rating}</Typography>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

### Level 4: 페이지 컴포넌트 (Page Components)
전체 페이지를 구성하는 최상위 컴포넌트들입니다.

```typescript
// pages/
├── HomePage/
├── LoginPage/
├── CourseListPage/
├── CourseDetailPage/
├── CourseCreatePage/
├── PlaceSearchPage/
└── MyPage/
```

## 컴포넌트 패턴

### 1. Render Props Pattern
복잡한 로직을 재사용할 때 사용합니다.

```typescript
// components/common/DataProvider/DataProvider.tsx
interface DataProviderProps<T> {
  fetcher: () => Promise<T>;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export function DataProvider<T>({ fetcher, children }: DataProviderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
}

// 사용 예시
<DataProvider fetcher={() => courseService.getCourses()}>
  {({ data, loading, error, refetch }) => (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage onRetry={refetch} />}
      {data && <CourseList courses={data} />}
    </div>
  )}
</DataProvider>
```

### 2. Higher-Order Component (HOC) Pattern
공통 기능을 여러 컴포넌트에 주입할 때 사용합니다.

```typescript
// hoc/withAuth.tsx
interface WithAuthProps {
  user: User | null;
  isAuthenticated: boolean;
}

export function withAuth<P extends WithAuthProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: Omit<P, keyof WithAuthProps>) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return (
      <WrappedComponent
        {...(props as P)}
        user={user}
        isAuthenticated={isAuthenticated}
      />
    );
  };
}

// 사용 예시
const ProtectedCourseCreate = withAuth(CourseCreatePage);
```

### 3. Context Provider Pattern
깊은 props drilling을 방지하고 전역 상태를 관리합니다.

```typescript
// contexts/CourseContext.tsx
interface CourseContextType {
  courses: Course[];
  filters: CourseFilters;
  loading: boolean;
  updateFilters: (filters: Partial<CourseFilters>) => void;
  refetchCourses: () => void;
}

const CourseContext = createContext<CourseContextType | null>(null);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<CourseFilters>({});
  const [loading, setLoading] = useState(false);

  const updateFilters = useCallback((newFilters: Partial<CourseFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourses(filters);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const value = useMemo(() => ({
    courses,
    filters,
    loading,
    updateFilters,
    refetchCourses
  }), [courses, filters, loading, updateFilters, refetchCourses]);

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourseContext must be used within CourseProvider');
  }
  return context;
};
```

## 컴포넌트 문서화

### PropTypes & TypeScript
모든 컴포넌트는 명확한 타입 정의를 가져야 합니다.

```typescript
// components/domain/course/CourseCard/CourseCard.types.ts
export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  theme: CourseTheme;
  region: string;
  duration: string;
  likeCount: number;
  rating: number;
  isLiked: boolean;
  isBookmarked: boolean;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  places: Place[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseCardProps {
  /** 표시할 코스 데이터 */
  course: Course;
  
  /** 좋아요 버튼 클릭 핸들러 */
  onLike?: (courseId: number) => Promise<void>;
  
  /** 북마크 버튼 클릭 핸들러 */
  onBookmark?: (courseId: number) => Promise<void>;
  
  /** 상세보기 버튼 클릭 핸들러 */
  onViewDetail?: (courseId: number) => void;
  
  /** 액션 버튼들을 표시할지 여부 */
  showActions?: boolean;
  
  /** 카드 변형 스타일 */
  variant?: 'default' | 'compact' | 'detailed';
  
  /** 추가 CSS 클래스명 */
  className?: string;
}
```

### Storybook 통합
각 컴포넌트는 Storybook 스토리를 포함합니다.

```typescript
// components/domain/course/CourseCard/CourseCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CourseCard } from './CourseCard';
import { mockCourse } from '../../../__mocks__/course';

const meta: Meta<typeof CourseCard> = {
  title: 'Domain/Course/CourseCard',
  component: CourseCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'detailed'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    course: mockCourse,
    showActions: true,
  },
};

export const Compact: Story = {
  args: {
    course: mockCourse,
    variant: 'compact',
    showActions: false,
  },
};

export const Detailed: Story = {
  args: {
    course: mockCourse,
    variant: 'detailed',
    showActions: true,
  },
};
```

## 성능 최적화

### 1. React.memo 사용
불필요한 리렌더링을 방지합니다.

```typescript
export const CourseCard = React.memo<CourseCardProps>(({
  course,
  onLike,
  onBookmark,
  ...props
}) => {
  // 컴포넌트 구현
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.course.likeCount === nextProps.course.likeCount &&
    prevProps.course.isLiked === nextProps.course.isLiked
  );
});
```

### 2. 지연 로딩
큰 컴포넌트는 지연 로딩합니다.

```typescript
// pages/CourseDetailPage/index.ts
export const CourseDetailPage = lazy(() => 
  import('./CourseDetailPage').then(module => ({
    default: module.CourseDetailPage
  }))
);
```

### 3. 가상화
긴 리스트는 가상화를 적용합니다.

```typescript
// components/domain/course/VirtualCourseList.tsx
import { FixedSizeList as List } from 'react-window';

export const VirtualCourseList: React.FC<{
  courses: Course[];
  height: number;
}> = ({ courses, height }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <CourseCard course={courses[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={courses.length}
      itemSize={300}
      overscanCount={3}
    >
      {Row}
    </List>
  );
};
```

이 컴포넌트 아키텍처를 통해 확장 가능하고 유지보수가 용이한 프론트엔드 애플리케이션을 구축할 수 있습니다.