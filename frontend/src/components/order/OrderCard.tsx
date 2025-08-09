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
    <Card className={className} hover>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {order.productName}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              주문번호: {order.orderNo}
            </p>
            <p className="text-sm text-gray-500">
              주문일: {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge variant={getStatusColor(order.status) as any}>
            {getStatusText(order.status)}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>수량: {order.quantity}개</p>
            <p className="text-lg font-semibold text-gray-900">
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
    </Card>
  );
};