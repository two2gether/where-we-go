import React from 'react';
import { Card, Badge, Button } from '../base';
import type { MyOrderResponseDto } from '../../api/services/order.service';

interface OrderCardProps {
  order: MyOrderResponseDto;
  onViewDetail: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetail,
  onCancel,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DONE':
        return '완료';
      case 'PENDING':
        return '대기중';
      case 'CANCELLED':
        return '취소됨';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  return (
    <div 
      className={`rounded-lg border transition-all duration-200 hover:shadow-sm ${className}`}
      style={{
        background: 'var(--notion-white)',
        border: '1px solid var(--notion-gray-light)',
        borderRadius: '8px',
        padding: '24px'
      }}
    >
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ 
                color: 'var(--notion-text)',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              {order.productName}
            </h3>
            <div className="space-y-1">
              <p 
                className="text-sm"
                style={{ color: 'var(--notion-text-light)' }}
              >
                주문번호: {order.orderNo}
              </p>
              <p 
                className="text-sm"
                style={{ color: 'var(--notion-text-light)' }}
              >
                주문일: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div 
            className="px-3 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: 
                order.status === 'DONE' ? 'var(--notion-green-bg)' :
                order.status === 'PENDING' ? 'var(--notion-yellow-bg)' :
                order.status === 'CANCELLED' ? 'var(--notion-red-bg)' :
                'var(--notion-gray-bg)',
              color: 
                order.status === 'DONE' ? 'var(--notion-green)' :
                order.status === 'PENDING' ? 'var(--notion-yellow)' :
                order.status === 'CANCELLED' ? 'var(--notion-red)' :
                'var(--notion-text-light)',
              border: '1px solid ' + (
                order.status === 'DONE' ? 'var(--notion-green-light)' :
                order.status === 'PENDING' ? 'var(--notion-yellow-light)' :
                order.status === 'CANCELLED' ? 'var(--notion-red-light)' :
                'var(--notion-gray-light)')
            }}
          >
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Divider */}
        <div 
          style={{ 
            height: '1px', 
            backgroundColor: 'var(--notion-gray-light)',
            margin: '8px 0'
          }} 
        />

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p 
              className="text-sm"
              style={{ color: 'var(--notion-text-light)' }}
            >
              수량: {order.quantity}개
            </p>
            <p 
              className="text-lg font-semibold"
              style={{ 
                color: 'var(--notion-text)',
                fontSize: '18px',
                fontWeight: '600'
              }}
            >
              {formatPrice(order.totalPrice)}원
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetail(order.orderId)}
            >
              상세보기
            </Button>
            {order.status === 'PENDING' && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(order.orderId)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                주문취소
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};