import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail } from '../hooks';
import { Button, Spinner, Card } from '../components/base';
import { RefundButton } from '../components/payment';
import { GitHubLayout } from '../components/layout';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const numericOrderId = parseInt(orderId || '0');
  
  const { data: orderResponse, isLoading, error } = useOrderDetail(numericOrderId);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '결제 대기중';
      case 'READY':
        return '결제 준비완료';
      case 'DONE':
        return '결제 성공';
      case 'FAILED':
        return '결제 실패';
      case 'REFUNDED':
        return '환불 완료';
      case 'CANCELED':
        return '미결제';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'var(--notion-green)';
      case 'PENDING':
      case 'READY':
        return 'var(--notion-yellow)';
      case 'FAILED':
      case 'CANCELED':
        return 'var(--notion-red)';
      case 'REFUNDED':
        return 'var(--notion-text-light)';
      default:
        return 'var(--notion-text-light)';
    }
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  if (isLoading) {
    return (
      <GitHubLayout title="주문 상세" subtitle="주문 정보를 불러오는 중입니다.">
        <div className="flex justify-center items-center min-h-64">
          <Spinner size="lg" />
        </div>
      </GitHubLayout>
    );
  }

  if (error || !orderResponse?.data) {
    return (
      <GitHubLayout title="주문 상세" subtitle="주문을 찾을 수 없습니다.">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">주문 정보를 불러오는데 실패했습니다.</p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
            <Button variant="primary" onClick={() => navigate('/orders')}>
              주문 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  const order = orderResponse.data;

  return (
    <GitHubLayout
      title="주문 상세"
      subtitle="주문 정보를 자세히 확인하세요"
    >
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* 주문 기본 정보 */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                주문 상세 정보
              </h1>
              <p className="text-gray-600">주문번호: {order.orderNo}</p>
            </div>
            <div 
              className="px-3 py-1 text-sm font-medium rounded-full"
              style={{
                backgroundColor: 
                  order.status === 'DONE' ? 'var(--notion-green-bg)' :
                  (order.status === 'PENDING' || order.status === 'READY') ? 'var(--notion-yellow-bg)' :
                  (order.status === 'FAILED' || order.status === 'CANCELED') ? 'var(--notion-red-bg)' :
                  'var(--notion-gray-bg)',
                color: getStatusColor(order.status),
                border: `1px solid ${getStatusColor(order.status)}20`
              }}
            >
              {getStatusText(order.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">주문일시</h3>
              <p className="text-gray-900">{formatDateTime(order.orderedAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">수정일시</h3>
              <p className="text-gray-900">{formatDateTime(order.updatedAt)}</p>
            </div>
          </div>
        </Card>

        {/* 상품 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 상품</h2>
          
          <div className="flex space-x-6">
            {/* 상품 이미지 */}
            <div className="flex-shrink-0">
              {order.product.productImage ? (
                <img
                  src={order.product.productImage}
                  alt={order.product.productName}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* 상품 상세 정보 */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {order.product.productName}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {order.product.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">단가</h4>
                  <p className="text-gray-900 font-medium">{formatPrice(order.product.price)}원</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">수량</h4>
                  <p className="text-gray-900 font-medium">{order.quantity}개</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 결제 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">상품 금액</span>
              <span className="text-gray-900">{formatPrice(order.product.price * order.quantity)}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">수량</span>
              <span className="text-gray-900">{order.quantity}개</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">총 결제 금액</span>
                <span className="text-primary-600">{formatPrice(order.totalPrice)}원</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/orders')}
          >
            주문 목록으로 돌아가기
          </Button>
          
          {order.status === 'DONE' && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/payments/${order.orderId}`)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                결제 상세 보기
              </Button>
              <RefundButton 
                orderId={order.orderId} 
                size="lg" 
                onRefundSuccess={() => {
                  // 환불 성공 시 페이지 새로고침
                  window.location.reload();
                }}
              />
            </>
          )}
          
          {(order.status === 'PENDING' || order.status === 'READY') && (
            <Button
              variant="outline"
              size="lg"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => {
                if (confirm('정말로 주문을 취소하시겠습니까?')) {
                  // TODO: 주문 취소 로직 구현
                  alert('주문 취소 기능은 준비 중입니다.');
                }
              }}
            >
              주문 취소
            </Button>
          )}
        </div>
      </div>
    </GitHubLayout>
  );
};

export default OrderDetailPage;