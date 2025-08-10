package com.example.wherewego.domain.order;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.OrderStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.service.EventService;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.dto.response.MyOrderResponseDto;
import com.example.wherewego.domain.order.dto.response.OrderDetailResponseDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.order.service.OrderService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService 테스트")
class OrderServiceTest {

	@Mock
	private UserService userService;

	@Mock
	private EventService eventService;

	@Mock
	private OrderRepository orderRepository;

	@InjectMocks
	private OrderService orderService;

	@Nested
	@DisplayName("주문 생성")
	class CreateOrder {

		@Test
		@DisplayName("유효한 사용자와 상품으로 주문을 생성할 수 있다")
		void shouldCreateOrderSuccessfully() {
			// given
			Long userId = 1L;
			Long productId = 10L;
			int quantity = 2;
			int price = 5000;

			User user = mock(User.class);
			EventProduct product = mock(EventProduct.class);
			OrderCreateRequestDto requestDto = new OrderCreateRequestDto(productId, quantity);

			given(userService.getUserById(userId)).willReturn(user);
			given(eventService.getEventProductById(productId)).willReturn(product);
			given(product.getPrice()).willReturn(price);

			Order expectedOrder = mock(Order.class);
			given(orderRepository.save(any(Order.class))).willReturn(expectedOrder);

			// when
			Order result = orderService.createOrder(requestDto, userId);

			// then
			assertThat(result).isNotNull();
			verify(orderRepository, times(1)).save(any(Order.class));
		}

		@Test
		@DisplayName("사용자가 존재하지 않으면 예외가 발생한다")
		void shouldThrowIfUserNotFound() {
			// given
			Long userId = 1L;
			OrderCreateRequestDto requestDto = new OrderCreateRequestDto(10L, 1);

			given(userService.getUserById(userId)).willThrow(new CustomException(ErrorCode.USER_NOT_FOUND));

			// when & then
			assertThatThrownBy(() -> orderService.createOrder(requestDto, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.USER_NOT_FOUND.getMessage());
		}

		@Test
		@DisplayName("상품이 존재하지 않으면 예외가 발생한다")
		void shouldThrowIfProductNotFound() {
			// given
			Long userId = 1L;
			Long productId = 10L;
			OrderCreateRequestDto requestDto = new OrderCreateRequestDto(productId, 1);

			User user = mock(User.class);
			given(userService.getUserById(userId)).willReturn(user);
			given(eventService.getEventProductById(productId)).willThrow(new CustomException(ErrorCode.EVENT_PRODUCT_NOT_FOUND));

			// when & then
			assertThatThrownBy(() -> orderService.createOrder(requestDto, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.EVENT_PRODUCT_NOT_FOUND.getMessage());
		}
	}

	@Nested
	@DisplayName("주문 상세 조회")
	class GetOrderDetail {

		@Test
		@DisplayName("유효한 주문 ID와 사용자 ID로 주문 상세 정보를 조회할 수 있다")
		void shouldGetOrderDetail() {
			// given
			Long orderId = 1L;
			Long userId = 1L;
			
			User mockUser = mock(User.class);
			EventProduct mockProduct = mock(EventProduct.class);
			Order mockOrder = mock(Order.class);
			
			given(userService.getUserById(userId)).willReturn(mockUser);
			given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(mockOrder));
			
			given(mockOrder.getId()).willReturn(orderId);
			given(mockOrder.getOrderNo()).willReturn("ORDER123");
			given(mockOrder.getQuantity()).willReturn(2);
			given(mockOrder.getTotalPrice()).willReturn(20000);
			given(mockOrder.getStatus()).willReturn(OrderStatus.PENDING);
			given(mockOrder.getEventProduct()).willReturn(mockProduct);
			given(mockProduct.getProductName()).willReturn("테스트 상품");

			// when
			OrderDetailResponseDto result = orderService.getOrderDetail(orderId, userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getOrderId()).isEqualTo(orderId);
			assertThat(result.getOrderNo()).isEqualTo("ORDER123");
			verify(userService).getUserById(userId);
			verify(orderRepository).findByIdAndUserId(orderId, userId);
		}

		@Test
		@DisplayName("주문이 존재하지 않으면 예외를 던진다")
		void shouldThrowExceptionWhenOrderNotFound() {
			// given
			Long orderId = 1L;
			Long userId = 1L;
			
			User mockUser = mock(User.class);
			given(userService.getUserById(userId)).willReturn(mockUser);
			given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> orderService.getOrderDetail(orderId, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.ORDER_NOT_FOUND.getMessage());
		}
	}

	@Nested
	@DisplayName("내 주문 목록 조회")
	class GetMyOrders {

		@Test
		@DisplayName("사용자의 전체 주문 목록을 조회할 수 있다")
		void shouldGetMyOrdersWithoutStatus() {
			// given
			Long userId = 1L;
			Pageable pageable = PageRequest.of(0, 10);
			
			User mockUser = mock(User.class);
			Order order1 = mock(Order.class);
			Order order2 = mock(Order.class);
			EventProduct product1 = mock(EventProduct.class);
			EventProduct product2 = mock(EventProduct.class);
			
			given(userService.getUserById(userId)).willReturn(mockUser);
			
			Page<Order> orderPage = new PageImpl<>(Arrays.asList(order1, order2), pageable, 2);
			given(orderRepository.findOrdersByUserId(userId, pageable)).willReturn(orderPage);
			
			// Mock order1
			given(order1.getId()).willReturn(1L);
			given(order1.getOrderNo()).willReturn("ORDER001");
			given(order1.getQuantity()).willReturn(1);
			given(order1.getTotalPrice()).willReturn(10000);
			given(order1.getStatus()).willReturn(OrderStatus.DONE);
			given(order1.getEventProduct()).willReturn(product1);
			given(product1.getProductName()).willReturn("상품1");
			given(product1.getProductImage()).willReturn("image1.jpg");
			given(order1.getCreatedAt()).willReturn(LocalDateTime.now().minusDays(1));
			
			// Mock order2
			given(order2.getId()).willReturn(2L);
			given(order2.getOrderNo()).willReturn("ORDER002");
			given(order2.getQuantity()).willReturn(2);
			given(order2.getTotalPrice()).willReturn(30000);
			given(order2.getStatus()).willReturn(OrderStatus.PENDING);
			given(order2.getEventProduct()).willReturn(product2);
			given(product2.getProductName()).willReturn("상품2");
			given(product2.getProductImage()).willReturn("image2.jpg");
			given(order2.getCreatedAt()).willReturn(LocalDateTime.now().minusDays(2));

			// when
			PagedResponse<MyOrderResponseDto> result = orderService.getMyOrders(userId, pageable, null);

			// then
			assertThat(result).isNotNull();
			assertThat(result.content()).hasSize(2);
			assertThat(result.totalElements()).isEqualTo(2);
			verify(userService).getUserById(userId);
			verify(orderRepository).findOrdersByUserId(userId, pageable);
		}

		@Test
		@DisplayName("특정 상태의 주문 목록을 조회할 수 있다")
		void shouldGetMyOrdersWithStatus() {
			// given
			Long userId = 1L;
			Pageable pageable = PageRequest.of(0, 10);
			OrderStatus status = OrderStatus.DONE;
			
			User mockUser = mock(User.class);
			Order order1 = mock(Order.class);
			EventProduct product1 = mock(EventProduct.class);
			
			given(userService.getUserById(userId)).willReturn(mockUser);
			
			Page<Order> orderPage = new PageImpl<>(Arrays.asList(order1), pageable, 1);
			given(orderRepository.findOrdersByUserIdAndStatus(userId, status, pageable)).willReturn(orderPage);
			
			// Mock order1
			given(order1.getId()).willReturn(1L);
			given(order1.getOrderNo()).willReturn("ORDER001");
			given(order1.getQuantity()).willReturn(1);
			given(order1.getTotalPrice()).willReturn(10000);
			given(order1.getStatus()).willReturn(OrderStatus.DONE);
			given(order1.getEventProduct()).willReturn(product1);
			given(product1.getProductName()).willReturn("상품1");
			given(product1.getProductImage()).willReturn("image1.jpg");
			given(order1.getCreatedAt()).willReturn(LocalDateTime.now().minusDays(1));

			// when
			PagedResponse<MyOrderResponseDto> result = orderService.getMyOrders(userId, pageable, status);

			// then
			assertThat(result).isNotNull();
			assertThat(result.content()).hasSize(1);
			assertThat(result.totalElements()).isEqualTo(1);
			verify(userService).getUserById(userId);
			verify(orderRepository).findOrdersByUserIdAndStatus(userId, status, pageable);
		}

		@Test
		@DisplayName("사용자가 존재하지 않으면 예외를 던진다")
		void shouldThrowExceptionWhenUserNotFound() {
			// given
			Long userId = 1L;
			Pageable pageable = PageRequest.of(0, 10);
			
			given(userService.getUserById(userId)).willThrow(new CustomException(ErrorCode.USER_NOT_FOUND));

			// when & then
			assertThatThrownBy(() -> orderService.getMyOrders(userId, pageable, null))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.USER_NOT_FOUND.getMessage());
		}
	}
}
