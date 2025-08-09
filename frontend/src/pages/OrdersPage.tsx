import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyOrders, useOrders } from '../hooks';
import { OrderCard } from '../components/order';
import { Button, Spinner } from '../components/base';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const { data: ordersResponse, isLoading, error } = useMyOrders(currentPage, 10);
  const { deleteOrder } = useOrders();

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">주문 목록을 불러오는데 실패했습니다.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    );
  }

  const orders = ordersResponse?.content || [];
  const hasNextPage = ordersResponse && !ordersResponse.last;
  const hasPreviousPage = ordersResponse && !ordersResponse.first;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">내 주문 내역</h1>
        <p className="text-gray-600">주문한 코스와 이벤트 상품을 확인하세요.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">주문 내역이 없습니다</h3>
          <p className="text-gray-600 mb-6">새로운 코스를 주문해보세요!</p>
          <Button variant="primary" onClick={() => navigate('/courses')}>
            코스 둘러보기
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onViewDetail={handleViewDetail}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {(hasNextPage || hasPreviousPage) && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={!hasPreviousPage}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">
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
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;