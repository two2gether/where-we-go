package com.example.wherewego.domain.order.service;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.repository.EventProductRepository;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.payment.repository.PaymentRepository;

@Service
public class OrderCleanupService {

	private final OrderRepository orderRepository;
	private final EventProductRepository eventProductRepository;
	private final PaymentRepository paymentRepository;

	public OrderCleanupService(OrderRepository orderRepository,
		EventProductRepository eventProductRepository,
		PaymentRepository paymentRepository) {
		this.orderRepository = orderRepository;
		this.eventProductRepository = eventProductRepository;
		this.paymentRepository = paymentRepository;
	}

	private final int SECOND = 1000;

	@Scheduled(fixedRate = 60 * SECOND)
	@Transactional
	public void removeStalePendingOrders() {
		LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);

		EnumSet<OrderStatus> targetStatuses = java.util.EnumSet.of(OrderStatus.PENDING, OrderStatus.READY);

		List<Order> stale = orderRepository
			.findAllByStatusInAndCreatedAtBefore(targetStatuses, cutoff);

		for (Order order : stale) {
			Long orderId = order.getId();
			Long productId = order.getEventProduct().getId();
			int quantity = order.getQuantity();

			// 1) 상태를 [PENDING, READY] -> CANCELED 로 '조건부 원자 업데이트'
			int updated = orderRepository.updateStatusIfCurrent(
				orderId,
				OrderStatus.CANCELED,
				targetStatuses
			);

			// 2) 상태가 실제로 CANCELED 로 바뀐 경우에만 재고 복구 + 결제 만료
			if (updated == 1) {
				eventProductRepository.increaseStock(productId, quantity);
				paymentRepository.markExpiredIfReady(orderId);
			}
			// updated == 0 이면 이미 다른 상태(DONE 등)로 처리된 건이므로 건너뜀
		}
	}
}