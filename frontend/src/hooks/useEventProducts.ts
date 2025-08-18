import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventProductService, adminEventProductService } from '../api/services';
import type { 
  EventProductCreateRequestDto,
  EventProductUpdateRequestDto 
} from '../api/services/eventProduct.service';

// 일반 사용자용 이벤트 상품 훅
export const useEventProducts = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['eventProducts', 'active', page, size],
    queryFn: () => eventProductService.getActiveEventProducts(page, size),
    select: (data) => data.data
  });
};

export const useEventProductDetail = (eventProductId: number) => {
  return useQuery({
    queryKey: ['eventProducts', eventProductId],
    queryFn: () => eventProductService.getEventProductDetail(eventProductId),
    select: (data) => data.data,
    enabled: !!eventProductId
  });
};

// 관리자용 이벤트 상품 훅 (일반 사용자 API 사용)
export const useAdminEventProducts = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ['admin', 'eventProducts', page, size],
    queryFn: () => eventProductService.getActiveEventProducts(page, size),
    select: (data) => data.data
  });
};

export const useEventProductMutations = () => {
  const queryClient = useQueryClient();

  // 이벤트 상품 생성
  const createEventProductMutation = useMutation({
    mutationFn: (data: EventProductCreateRequestDto) => 
      adminEventProductService.createEventProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventProducts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'eventProducts'] });
    }
  });

  // 이벤트 상품 수정
  const updateEventProductMutation = useMutation({
    mutationFn: ({ eventProductId, data }: { eventProductId: number; data: EventProductUpdateRequestDto }) =>
      adminEventProductService.updateEventProduct(eventProductId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventProducts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'eventProducts'] });
    }
  });

  // 이벤트 상품 삭제
  const deleteEventProductMutation = useMutation({
    mutationFn: (eventProductId: number) => 
      adminEventProductService.deleteEventProduct(eventProductId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventProducts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'eventProducts'] });
    }
  });

  return {
    createEventProduct: createEventProductMutation.mutateAsync,
    updateEventProduct: updateEventProductMutation.mutateAsync,
    deleteEventProduct: deleteEventProductMutation.mutateAsync,
    isCreating: createEventProductMutation.isPending,
    isUpdating: updateEventProductMutation.isPending,
    isDeleting: deleteEventProductMutation.isPending
  };
};