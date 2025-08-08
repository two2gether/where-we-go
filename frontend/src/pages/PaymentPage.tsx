import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreatePayment } from '../hooks/usePayments';
import { GitHubLayout } from '../components/layout/GitHubLayout';
import type { PaymentRequest } from '../api/types';

interface PaymentPageProps {}

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createPaymentMutation = useCreatePayment();

  // URL에서 주문 정보 받기 (또는 state에서)
  const orderInfo = location.state?.orderInfo || {
    orderNo: `ORDER_${Date.now()}`,
    amount: 30000,
    orderName: '여행 코스 이용권',
  };

  const [paymentData, setPaymentData] = useState<PaymentRequest>({
    orderNo: orderInfo.orderNo,
    payMethod: 'CARD',
    amount: orderInfo.amount,
    orderName: orderInfo.orderName,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });

  const handlePaymentMethodChange = (method: 'CARD' | 'ACCOUNT' | 'TOSS_MONEY') => {
    setPaymentData(prev => ({ ...prev, payMethod: method }));
  };

  const handlePayment = async () => {
    try {
      const response = await createPaymentMutation.mutateAsync(paymentData);
      
      // 토스페이먼츠 결제 페이지로 리다이렉트
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      console.error('결제 요청 실패:', error);
      alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <GitHubLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-github-border shadow-sm">
          <div className="border-b border-github-border p-6">
            <h1 className="text-2xl font-semibold text-github-neutral">결제하기</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* 주문 정보 */}
            <div>
              <h2 className="text-lg font-semibold text-github-neutral mb-4">주문 정보</h2>
              <div className="bg-github-canvas-subtle rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">주문번호</span>
                  <span className="font-medium">{paymentData.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">상품명</span>
                  <span className="font-medium">{paymentData.orderName}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-github-neutral-muted">결제 금액</span>
                  <span className="font-bold text-primary-600">
                    {paymentData.amount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 결제 수단 선택 */}
            <div>
              <h2 className="text-lg font-semibold text-github-neutral mb-4">결제 수단</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-github-border rounded-md cursor-pointer hover:bg-github-canvas-subtle">
                  <input
                    type="radio"
                    name="payMethod"
                    value="CARD"
                    checked={paymentData.payMethod === 'CARD'}
                    onChange={() => handlePaymentMethodChange('CARD')}
                    className="w-4 h-4 text-primary-600 border-github-border focus:ring-primary-500"
                  />
                  <span className="ml-3 text-github-neutral">신용카드/체크카드</span>
                </label>

                <label className="flex items-center p-4 border border-github-border rounded-md cursor-pointer hover:bg-github-canvas-subtle">
                  <input
                    type="radio"
                    name="payMethod"
                    value="ACCOUNT"
                    checked={paymentData.payMethod === 'ACCOUNT'}
                    onChange={() => handlePaymentMethodChange('ACCOUNT')}
                    className="w-4 h-4 text-primary-600 border-github-border focus:ring-primary-500"
                  />
                  <span className="ml-3 text-github-neutral">계좌이체</span>
                </label>

                <label className="flex items-center p-4 border border-github-border rounded-md cursor-pointer hover:bg-github-canvas-subtle">
                  <input
                    type="radio"
                    name="payMethod"
                    value="TOSS_MONEY"
                    checked={paymentData.payMethod === 'TOSS_MONEY'}
                    onChange={() => handlePaymentMethodChange('TOSS_MONEY')}
                    className="w-4 h-4 text-primary-600 border-github-border focus:ring-primary-500"
                  />
                  <span className="ml-3 text-github-neutral">토스머니</span>
                </label>
              </div>
            </div>

            {/* 결제 버튼 */}
            <div className="pt-4">
              <button
                onClick={handlePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPaymentMutation.isPending ? '결제 요청 중...' : `${paymentData.amount.toLocaleString()}원 결제하기`}
              </button>
            </div>

            {/* 취소 버튼 */}
            <button
              onClick={() => navigate(-1)}
              className="w-full py-2 px-4 text-github-neutral-muted hover:text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
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