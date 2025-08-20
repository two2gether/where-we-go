import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage: () => void;
  rootMargin?: string;
}

/**
 * 무한 스크롤 커스텀 훅
 * 
 * Intersection Observer API를 사용하여 스크롤이 끝에 도달했을 때
 * 자동으로 다음 페이지를 로드하는 기능을 제공
 */
export const useInfiniteScroll = ({
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  rootMargin = '100px'
}: UseInfiniteScrollProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      
      // 화면에 보이고, 다음 페이지가 있고, 현재 로딩 중이 아닐 때만 실행
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // viewport를 root로 사용
      rootMargin, // 100px 전에 미리 로드 시작
      threshold: 0.1 // 10%가 보이면 트리거
    });

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleIntersection, rootMargin]);

  return observerTarget;
};