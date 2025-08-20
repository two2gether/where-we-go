import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventProductDetail, useOrders } from '../hooks';
import { Button, Spinner, Card, Badge } from '../components/base';
import { GitHubLayout } from '../components/layout';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/dateUtils';

const EventProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuthStore();
  const numericProductId = parseInt(productId || '0');
  
  const { data: productResponse, isLoading, error } = useEventProductDetail(numericProductId);
  const { createOrder } = useOrders();

  const handlePurchase = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!productResponse?.data) {
      alert('상품 정보를 불러올 수 없습니다.');
      return;
    }

    const product = productResponse.data;

    if (product.stock <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    if (confirm(`${product.productName}을 구매하시겠습니까?`)) {
      try {
        console.log('주문 생성 시작:', { productId: numericProductId, quantity: 1 });
        
        const order = await createOrder({
          productId: numericProductId,
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR');
  };

  if (isLoading) {
    return (
      <GitHubLayout title="이벤트 상품" subtitle="상품 정보를 불러오는 중입니다.">
        <div className="flex justify-center items-center min-h-64">
          <Spinner size="lg" />
        </div>
      </GitHubLayout>
    );
  }

  if (error || !productResponse?.data) {
    return (
      <GitHubLayout title="이벤트 상품" subtitle="상품을 찾을 수 없습니다.">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">상품 정보를 불러오는데 실패했습니다.</p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
            <Button variant="primary" onClick={() => navigate('/events')}>
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  const product = productResponse.data;
  const isInStock = product.stock > 0;

  return (
    <GitHubLayout
      title={product.productName}
      subtitle="이벤트 특가 상품"
    >
      <div className="max-w-4xl mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 상품 이미지 */}
          <div>
            {product.productImage ? (
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.productName}
                </h1>
                {isInStock ? (
                  <Badge variant="success">재고 {product.stock}개</Badge>
                ) : (
                  <Badge variant="error">품절</Badge>
                )}
              </div>
              
              <div className="mb-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {formatPrice(product.price)}원
                </div>
                <div className="text-sm text-gray-500">
                  등록일: {formatDate(product.createdAt)}
                </div>
              </div>
            </div>

            {/* 상품 설명 */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">상품 설명</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </Card>

            {/* 구매 버튼 */}
            <div className="space-y-3">
              {isInStock ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePurchase}
                  fullWidth
                  className="py-4 text-lg font-semibold"
                >
                  🛒 {formatPrice(product.price)}원에 구매하기
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  fullWidth
                  className="py-4 text-lg font-semibold"
                >
                  품절된 상품입니다
                </Button>
              )}
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/events')}
                fullWidth
              >
                다른 상품 보기
              </Button>
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">구매 전 확인사항</h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• 이벤트 상품은 한정 수량으로 판매됩니다.</li>
                <li>• 결제 완료 후 취소/환불이 어려울 수 있습니다.</li>
                <li>• 재고 소진 시 구매가 불가능합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </GitHubLayout>
  );
};

export default EventProductDetailPage;