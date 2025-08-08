import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyPayment, usePaymentDetail } from '../hooks/usePayments';
import { GitHubLayout } from '../components/layout/GitHubLayout';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verifyPaymentMutation = useVerifyPayment();

  // URL에서 토스페이먼츠 파라미터 추출
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount'));

  const { data: paymentDetail, isLoading: isDetailLoading } = usePaymentDetail(
    verifyPaymentMutation.data?.orderId || 0
  );

  useEffect(() => {
    // 결제 검증 실행
    if (paymentKey && orderId && amount) {
      verifyPaymentMutation.mutate({
        paymentKey,
        orderId,
        amount,
      });
    }
  }, [paymentKey, orderId, amount]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewPaymentDetail = () => {
    if (paymentDetail?.orderId) {
      navigate(`/payment/detail/${paymentDetail.orderId}`);
    }
  };

  if (verifyPaymentMutation.isPending || isDetailLoading) {
    return (
      <GitHubLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg border border-github-border shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-github-neutral">결제 검증 중...</p>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  if (verifyPaymentMutation.isError) {
    return (
      <GitHubLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">결제 검증 실패</h1>
            <p className="text-github-neutral-muted mb-6">
              결제 검증에 실패했습니다. 고객센터에 문의해주세요.
            </p>
            <button
              onClick={handleGoHome}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </GitHubLayout>
    );
  }

  return (
    <GitHubLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-github-border shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-github-neutral mb-2">결제가 완료되었습니다!</h1>
          <p className="text-github-neutral-muted mb-6">
            결제가 성공적으로 처리되었습니다.
          </p>

          {paymentDetail && (
            <div className="bg-github-canvas-subtle rounded-md p-4 mb-6 text-left">
              <h2 className="font-semibold text-github-neutral mb-3">결제 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">주문번호</span>
                  <span>{paymentDetail.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">결제수단</span>
                  <span>{paymentDetail.payMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">결제금액</span>
                  <span className="font-semibold">{paymentDetail.paidAmount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-github-neutral-muted">결제일시</span>
                  <span>{new Date(paymentDetail.paidTs).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleViewPaymentDetail}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-semibold"
            >
              결제 상세 보기
            </button>
            <button
              onClick={handleGoHome}
              className="w-full px-6 py-2 text-github-neutral border border-github-border rounded-md hover:bg-github-canvas-subtle"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </GitHubLayout>
  );
};

export default PaymentSuccessPage;