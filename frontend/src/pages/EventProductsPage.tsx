import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventProducts, useOrders } from '../hooks';
import { EventProductCard } from '../components/event';
import { Button, Spinner } from '../components/base';
import { GitHubLayout } from '../components/layout';
import { useAuthStore } from '../store/authStore';

const EventProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(0);
  const { data: productsResponse, isLoading, error } = useEventProducts(currentPage, 12);
  const { createOrder } = useOrders();

  const handlePurchase = async (productId: number) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (confirm('이 상품을 구매하시겠습니까?')) {
      try {
        console.log('주문 생성 시작:', { productId, quantity: 1 });
        
        const order = await createOrder({
          productId,
          quantity: 1
        });
        
        console.log('주문 생성 응답:', order);
        
        // 응답 구조 확인
        const orderId = order?.data?.orderId;
        console.log('추출된 orderId:', orderId);
        
        if (orderId) {
          const paymentUrl = `/payment?orderId=${orderId}`;
          console.log('결제 페이지 URL:', paymentUrl);
          navigate(paymentUrl);
        } else {
          console.error('orderId를 찾을 수 없습니다:', order);
          alert('주문 ID를 받아올 수 없습니다.');
        }
      } catch (error) {
        console.error('주문 생성 실패:', error);
        alert(`주문 생성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    }
  };

  const handleViewDetail = (productId: number) => {
    navigate(`/events/${productId}`);
  };

  if (isLoading) {
    return (
      <GitHubLayout title="이벤트 상품" subtitle="특별한 할인 혜택으로 여행을 더욱 즐겁게!">
        <div className="flex justify-center items-center min-h-64">
          <Spinner size="lg" />
        </div>
      </GitHubLayout>
    );
  }

  if (error) {
    return (
      <GitHubLayout title="이벤트 상품" subtitle="특별한 할인 혜택으로 여행을 더욱 즐겁게!">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">이벤트 상품을 불러오는데 실패했습니다.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </GitHubLayout>
    );
  }

  const products = productsResponse?.data?.content || [];
  const hasNextPage = productsResponse?.data && !productsResponse.data.last;
  const hasPreviousPage = productsResponse?.data && !productsResponse.data.first;

  return (
    <GitHubLayout
      title="🔥 이벤트 상품"
      subtitle="한정 기간 특가 혜택! 놓치면 후회할 기회입니다."
    >
      <div className="max-w-7xl mx-auto py-8">

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">진행 중인 이벤트가 없습니다</h3>
          <p className="text-gray-600 mb-6">새로운 이벤트를 기다려주세요!</p>
          <Button variant="primary" onClick={() => navigate('/courses')}>
            코스 둘러보기
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <EventProductCard
                key={product.productId}
                eventProduct={product}
                onPurchase={handlePurchase}
                onViewDetail={handleViewDetail}
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
    </GitHubLayout>
  );
};

export default EventProductsPage;