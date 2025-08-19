import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMyOrders, useOrders } from '../hooks';
import { OrderCard } from '../components/order';
import { Button, Spinner, Card } from '../components/base';
import { GitHubLayout } from '../components/layout';
import type { OrderStatus } from '../api/services/order.service';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  
  // URL에서 status 파라미터 읽기 - 백엔드 OrderStatus enum 값 직접 사용
  const statusParam = searchParams.get('status');
  const currentStatus: OrderStatus | undefined = 
    (statusParam as OrderStatus) || undefined; // 전체 주문

  const { data: ordersResponse, isLoading, error } = useMyOrders(currentPage, 10, currentStatus);
  
  // 각 탭별 count를 위한 별도 쿼리들
  const { data: allOrdersResponse } = useMyOrders(0, 1, undefined);
  const { data: processingOrdersResponse } = useMyOrders(0, 1, 'PENDING');
  const { data: completedOrdersResponse } = useMyOrders(0, 1, 'DONE');
  
  const { deleteOrder } = useOrders();

  // 상태가 변경될 때마다 페이지를 0으로 리셋
  React.useEffect(() => {
    setCurrentPage(0);
  }, [statusParam]);

  const handleViewDetail = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (confirm('주문을 취소하시겠습니까?')) {
      try {
        await deleteOrder(orderId);
        alert('주문이 취소되었습니다.');
      } catch (error) {
        console.error('주문 취소 실패:', error);
        alert('주문 취소에 실패했습니다.');
      }
    }
  };

  const orders = ordersResponse?.data?.content || [];
  const hasNextPage = ordersResponse?.data && !ordersResponse.data.last;
  const hasPreviousPage = ordersResponse?.data && !ordersResponse.data.first;

  // 탭 클릭 핸들러
  const handleTabClick = (status?: string) => {
    setCurrentPage(0); // 페이지를 처음으로 리셋
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  // 상태별 주문 개수 표시를 위한 탭 구성
  const tabs = [
    { 
      label: '전체 주문', 
      onClick: () => handleTabClick(), 
      active: !statusParam, 
      count: allOrdersResponse?.data?.totalElements || 0
    },
    { 
      label: '진행중인 주문', 
      onClick: () => handleTabClick('PENDING'), 
      active: statusParam === 'PENDING',
      count: processingOrdersResponse?.data?.totalElements || 0
    },
    { 
      label: '완료된 주문', 
      onClick: () => handleTabClick('DONE'), 
      active: statusParam === 'DONE',
      count: completedOrdersResponse?.data?.totalElements || 0
    },
  ];

  return (
    <GitHubLayout
      title="주문 내역"
      subtitle="주문한 이벤트 상품과 여행 패키지를 확인하고 관리하세요"
      tabs={tabs}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card variant="outlined" padding="lg" className="text-center border-red-200 bg-red-50">
          <p className="text-red-700 mb-3 text-sm">주문 목록을 불러오는데 실패했습니다.</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders.length === 0 && (
        <Card variant="outlined" padding="lg" className="text-center">
          <div className="py-8">
            <svg 
              className="mx-auto h-12 w-12 text-github-neutral-muted mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--notion-text-light)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--notion-text)' }}
            >
              주문 내역이 없습니다
            </h3>
            <p 
              className="mb-4 text-sm"
              style={{ color: 'var(--notion-text-light)' }}
            >
              새로운 여행 상품을 주문해보세요!
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/events')}>
              상품 둘러보기
            </Button>
          </div>
        </Card>
      )}

      {/* Orders List */}
      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="space-y-4 mb-8">
            {orders.map((order, index) => (
              <div 
                key={order.orderId}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <OrderCard
                  order={order}
                  onViewDetail={handleViewDetail}
                  onCancel={handleCancelOrder}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(hasNextPage || hasPreviousPage) && (
            <Card variant="outlined" padding="md" className="text-center">
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!hasPreviousPage}
                >
                  이전
                </Button>
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--notion-text-light)' }}
                >
                  페이지 {currentPage + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                >
                  다음
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </GitHubLayout>
  );
};

export default OrdersPage;