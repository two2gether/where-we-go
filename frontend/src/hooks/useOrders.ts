import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../api/services';
import type { 
  OrderCreateRequestDto, 
  OrderCreateResponseDto,
  MyOrderResponseDto,
  OrderDetailResponseDto
} from '../api/services/order.service';

export const useOrders = () => {
  const queryClient = useQueryClient();

  // 주문 생성
  const createOrderMutation = useMutation({
    mutationFn: (data: OrderCreateRequestDto) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  // 주문 삭제
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: number) => orderService.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  return {
    createOrder: createOrderMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
    getOrderDetail: orderService.getOrderDetail,
    isCreating: createOrderMutation.isPending,
    isDeleting: deleteOrderMutation.isPending
  };
};

export const useMyOrders = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['orders', 'my', page, size],
    queryFn: () => orderService.getMyOrders(page, size),
    select: (data) => data.data
  });
};

export const useOrderDetail = (orderId: number) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => orderService.getOrderDetail(orderId),
    select: (data) => data.data,
    enabled: !!orderId
  });
};