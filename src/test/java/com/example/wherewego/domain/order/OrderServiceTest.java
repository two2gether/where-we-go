package com.example.wherewego.domain.order;

// import static org.assertj.core.api.AssertionsForClassTypes.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.domain.order.dto.request.OrderCreateRequestDto;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.order.service.OrderService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService 테스트")
class OrderServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private EventRepository eventRepository;

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

			given(userRepository.findByIdAndIsDeletedFalse(userId)).willReturn(Optional.of(user));
			given(eventRepository.findById(productId)).willReturn(Optional.of(product));
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

			given(userRepository.findByIdAndIsDeletedFalse(userId)).willReturn(Optional.empty());

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
			given(userRepository.findByIdAndIsDeletedFalse(userId)).willReturn(Optional.of(user));
			given(eventRepository.findById(productId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> orderService.createOrder(requestDto, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.EVENT_PRODUCT_NOT_FOUND.getMessage());
		}
	}
}
