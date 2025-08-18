import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCreatePayment } from '../hooks/usePayments';
import { useOrders } from '../hooks';
import { useAuthStore } from '../store/authStore';
import { GitHubLayout } from '../components/layout/GitHubLayout';
import { Spinner } from '../components/base';
import type { PaymentRequest } from '../api/types';

interface PaymentPageProps {}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, token, user } = useAuthStore();
  const createPaymentMutation = useCreatePayment();
  const { getOrderDetail } = useOrders();
  
  const orderId = searchParams.get('orderId');
  
  console.log('PaymentPage - 인증 상태:', { isAuthenticated, hasToken: !!token, user: user?.nickname });
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [paymentData, setPaymentData] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!isAuthenticated || !token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      
      if (!orderId) {
        alert('주문 정보가 없습니다.');
        navigate('/events');
        return;
      }

      try {
        setIsLoading(true);
        const orderResponse = await getOrderDetail(parseInt(orderId));
        const order = orderResponse.data;
        
        console.log('주문 정보 조회 성공:', order);
        
        setOrderDetail(order);
        
        const paymentRequestData = {
          apiKey: import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_dummy',
          orderNo: order.orderNo,
          amount: order.totalPrice,
          amountTaxFree: 0,
          productDesc: `${order.product.productName} ${order.quantity}개`,
          retUrl: `${window.location.origin}/payment/success`,
          retCancelUrl: `${window.location.origin}/payment/fail`,
          autoExecute: true,
          callbackVersion: 'V2',
          quantity: order.quantity
        };
        
        console.log('결제 데이터 생성:', paymentRequestData);
        setPaymentData(paymentRequestData);
      } catch (error) {
        console.error('주문 정보 조회 실패:', error);
        alert('주문 정보를 불러오는데 실패했습니다.');
        navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, navigate, getOrderDetail, isAuthenticated, token]);

  const handlePaymentMethodChange = () => {
    // 토스페이먼츠는 백엔드에서 처리하므로 여기서는 별도 처리 불필요
  };

  const handlePayment = async () => {
    if (!paymentData) {
      console.error('결제 데이터가 없습니다.');
      alert('결제 정보가 누락되었습니다.');
      return;
    }
    
    console.log('결제 요청 데이터:', paymentData);
    
    try {
      console.log('결제 API 호출 시작...');
      const response = await createPaymentMutation.mutateAsync(paymentData);
      console.log('결제 API 응답:', response);
      
      // 토스페이먼츠 결제 페이지로 리다이렉트
      if (response.code === 0 && response.checkoutPage) {
        console.log('결제 페이지로 리다이렉트:', response.checkoutPage);
        window.location.href = response.checkoutPage;
      } else {
        console.error('결제 페이지 생성 실패:', response);
        const errorMsg = response.msg || '결제 페이지를 생성할 수 없습니다.';
        alert(`결제 실패: ${errorMsg}`);
      }
    } catch (error) {
      console.error('결제 요청 실패:', error);
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
      }
      if ((error as any)?.response) {
        console.error('서버 응답 에러:', (error as any).response.data);
        console.error('상태 코드:', (error as any).response.status);
      }
      alert(`결제 요청에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  if (isLoading) {
    return (
      <GitHubLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">주문 정보를 불러오는 중...</p>
        </div>
      </GitHubLayout>
    );
  }

  if (!paymentData || !orderDetail) {
    return (
      <GitHubLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <p className="text-red-600">주문 정보를 찾을 수 없습니다.</p>
        </div>
      </GitHubLayout>
    );
  }

  return (
    <GitHubLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-semibold text-gray-900">결제하기</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* 주문 정보 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 정보</h2>
              <div className="bg-gray-50 rounded-md p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-medium text-gray-900 text-sm">{orderDetail.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">상품명</span>
                  <span className="font-medium text-gray-900">{orderDetail.product.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수량</span>
                  <span className="font-medium text-gray-900">{orderDetail.quantity}개</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700 font-semibold">총 결제금액</span>
                    <span className="font-bold text-blue-600">
                      {orderDetail.totalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 안내 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 안내</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">토스페이먼츠로 결제합니다</h3>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• 신용카드, 체크카드, 계좌이체, 간편결제 등 다양한 결제수단을 지원합니다</li>
                      <li>• 결제 과정에서 결제수단을 선택할 수 있습니다</li>
                      <li>• 안전하고 빠른 결제를 위해 토스페이먼츠를 사용합니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 버튼 */}
            <div className="pt-4">
              <button
                onClick={handlePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPaymentMutation.isPending ? '결제 요청 중...' : `${orderDetail.totalPrice.toLocaleString()}원 결제하기`}
              </button>
            </div>

            {/* 취소 버튼 */}
            <button
              onClick={() => navigate(-1)}
              className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </GitHubLayout>
  );
};

export default PaymentPage;