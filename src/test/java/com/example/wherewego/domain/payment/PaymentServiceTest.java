package com.example.wherewego.domain.payment;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.common.enums.PaymentStatus;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.service.OrderService;
import com.example.wherewego.domain.payment.dto.request.CallbackRequestDto;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.payment.dto.request.RefundRequestDto;
import com.example.wherewego.domain.payment.dto.response.PaymentDetailResponseDto;
import com.example.wherewego.domain.payment.dto.response.PaymentResponseDto;
import com.example.wherewego.domain.payment.dto.response.RefundResponseDto;
import com.example.wherewego.domain.payment.entity.Payment;
import com.example.wherewego.domain.payment.repository.PaymentRepository;
import com.example.wherewego.domain.payment.service.PaymentService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.global.exception.CustomException;

import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService 테스트")
class PaymentServiceTest {

	@Mock
	private WebClient tossWebClient;

	@Mock
	private WebClient.RequestBodyUriSpec requestBodyUriSpec;

	@Mock
	private WebClient.RequestHeadersSpec requestHeadersSpec;

	@Mock
	private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

	@Mock
	private WebClient.RequestBodySpec requestBodySpec;

	@Mock
	private WebClient.ResponseSpec responseSpec;

	@Mock
	private PaymentRepository paymentRepository;

	@Mock
	private OrderService orderService;

	@Mock
	private EventProduct mockProduct; // 상품 mock

	@InjectMocks
	private PaymentService paymentService;

	@Test
	@DisplayName("결제 요청이 정상적으로 처리되면 응답 DTO를 반환한다")
	void shouldReturnPaymentResponse() {
		// given
		PaymentRequestDto requestDto = PaymentRequestDto.builder()
			.orderNo("ORDER123")
			.amount(10000)
			.build();

		Order mockOrder = mock(Order.class);
		User mockUser = mock(User.class);
		Payment mockPayment = mock(Payment.class);

		PaymentResponseDto responseDto = PaymentResponseDto.builder()
			.code(0)
			.payToken("PAY-TOKEN-123")
			.checkoutPage("https://checkout.page")
			.build();

		given(mockOrder.getUser()).willReturn(mockUser);
		given(mockUser.getId()).willReturn(1L);
		given(orderService.getOrderByOrderNo("ORDER123")).willReturn(mockOrder);
		given(paymentRepository.save(any(Payment.class))).willReturn(mockPayment);

		// WebClient mock 체인 설정
		given(tossWebClient.post()).willReturn(requestBodyUriSpec);
		given(requestBodyUriSpec.uri(anyString())).willReturn(requestBodySpec);
		given(requestBodySpec.header(eq(HttpHeaders.AUTHORIZATION), anyString())).willReturn(requestBodySpec);
		given(requestBodySpec.header(eq(HttpHeaders.CONTENT_TYPE), eq(MediaType.APPLICATION_JSON_VALUE))).willReturn(
			requestBodySpec);
		given(requestBodySpec.bodyValue(requestDto)).willReturn(requestHeadersSpec);
		given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
		given(responseSpec.onStatus(any(), any())).willReturn(responseSpec);
		given(responseSpec.bodyToMono(PaymentResponseDto.class)).willReturn(Mono.just(responseDto));

		// when
		PaymentResponseDto result = paymentService.requestPayment(requestDto, 1L);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getCode()).isEqualTo(0);
		assertThat(result.getCheckoutPage()).isEqualTo("https://checkout.page");
		verify(paymentRepository, times(2)).save(any(Payment.class));
	}

	@Test
	@DisplayName("주문번호가 존재하지 않으면 예외를 던진다")
	void shouldThrowExceptionWhenOrderNotFound() {
		// given
		PaymentRequestDto requestDto = PaymentRequestDto.builder()
			.orderNo("NOT_EXIST")
			.amount(5000)
			.build();

		given(orderService.getOrderByOrderNo("NOT_EXIST")).willThrow(new CustomException(ErrorCode.ORDER_NOT_FOUND));

		// when & then
		assertThatThrownBy(() -> paymentService.requestPayment(requestDto, 1L))
			.isInstanceOf(CustomException.class)
			.hasMessage(ErrorCode.ORDER_NOT_FOUND.getMessage());
	}

	@Test
	@DisplayName("결제 응답 코드가 실패일 경우 예외를 던진다")
	void shouldThrowExceptionWhenTossFails() {
		// given
		PaymentRequestDto requestDto = PaymentRequestDto.builder()
			.orderNo("ORDER999")
			.amount(3000)
			.build();

		Order mockOrder = mock(Order.class);
		User mockUser = mock(User.class);
		Payment mockPayment = mock(Payment.class);

		PaymentResponseDto failResponse = PaymentResponseDto.builder()
			.code(-1) // 실패
			.msg("결제 실패")
			.errorCode("INVALID_REQUEST")
			.build();

		given(mockOrder.getUser()).willReturn(mockUser);
		given(mockUser.getId()).willReturn(1L);
		given(orderService.getOrderByOrderNo("ORDER999")).willReturn(mockOrder);
		given(paymentRepository.save(any(Payment.class))).willReturn(mockPayment);

		given(tossWebClient.post()).willReturn(requestBodyUriSpec);
		given(requestBodyUriSpec.uri(anyString())).willReturn(requestBodySpec);
		given(requestBodySpec.header(eq(HttpHeaders.AUTHORIZATION), anyString())).willReturn(requestBodySpec);
		given(requestBodySpec.header(eq(HttpHeaders.CONTENT_TYPE), eq(MediaType.APPLICATION_JSON_VALUE))).willReturn(
			requestBodySpec);
		given(requestBodySpec.bodyValue(requestDto)).willReturn(requestHeadersSpec);
		given(requestHeadersSpec.retrieve()).willReturn(responseSpec);
		given(responseSpec.onStatus(any(), any())).willReturn(responseSpec);
		given(responseSpec.bodyToMono(PaymentResponseDto.class)).willReturn(Mono.just(failResponse));

		// when & then
		assertThatThrownBy(() -> paymentService.requestPayment(requestDto, 1L))
			.isInstanceOf(CustomException.class)
			.hasMessage(ErrorCode.TOSS_PAYMENT_FAILED.getMessage());
	}

	@Nested
	@DisplayName("processPaymentApproval 메서드")
	class ProcessPaymentApproval {

		@Test
		@DisplayName("정상적인 콜백 요청이면 주문을 결제 완료 상태로 변경하고 저장한다")
		void shouldProcessPaymentApproval() {
			// given
			CallbackRequestDto callbackDto = CallbackRequestDto.builder()
				.orderNo("ORDER123")
				.paidAmount(10000)
				.payToken("TOKEN123")
				.build();

			Order mockOrder = mock(Order.class);
			given(orderService.getOrderByOrderNo("ORDER123")).willReturn(mockOrder);
			given(paymentRepository.existsByOrderNo("ORDER123")).willReturn(false);

			// 재고 관련 메서드 mocking
			given(mockOrder.getEventProduct()).willReturn(mockProduct);
			given(mockOrder.getQuantity()).willReturn(2);
			given(mockProduct.getStock()).willReturn(10);

			// when
			paymentService.processPaymentApproval(callbackDto);

			// then
			verify(mockProduct).getStock();
			verify(mockProduct).decreaseStock(2);
			verify(mockOrder).markAsPaid();
			verify(orderService).updateOrder(mockOrder);
			verify(paymentRepository).save(any(Payment.class));
		}

		@Test
		@DisplayName("재고가 부족하면 예외를 던진다")
		void shouldThrowExceptionWhenOutOfStock() {
			// given
			CallbackRequestDto callbackDto = CallbackRequestDto.builder()
				.orderNo("ORDER123")
				.paidAmount(10000)
				.payToken("TOKEN123")
				.build();

			Order mockOrder = mock(Order.class);
			given(orderService.getOrderByOrderNo("ORDER123")).willReturn(mockOrder);
			given(paymentRepository.existsByOrderNo("ORDER123")).willReturn(false);

			given(mockOrder.getEventProduct()).willReturn(mockProduct);
			given(mockOrder.getQuantity()).willReturn(5);
			given(mockProduct.getStock()).willReturn(3); // 재고 부족 상황

			// when & then
			assertThatThrownBy(() -> paymentService.processPaymentApproval(callbackDto))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.EVENT_PRODUCT_OUT_OF_STOCK.getMessage());

			verify(mockProduct, atLeastOnce()).getStock();
			verify(mockProduct, never()).decreaseStock(anyInt());
			verify(mockOrder, never()).markAsPaid();
			verify(orderService, never()).updateOrder(any());
			verify(paymentRepository, never()).save(any());
		}

		@Test
		@DisplayName("이미 저장된 결제 정보면 중복 저장을 하지 않는다")
		void shouldNotProcessIfAlreadyExists() {
			// given
			CallbackRequestDto callbackDto = CallbackRequestDto.builder()
				.orderNo("ORDER123")
				.paidAmount(10000)
				.payToken("TOKEN123")
				.build();

			given(paymentRepository.existsByOrderNo("ORDER123")).willReturn(true);

			// when
			paymentService.processPaymentApproval(callbackDto);

			// then
			verify(orderService, never()).getOrderByOrderNo(any());
			verify(orderService, never()).updateOrder(any());
			verify(paymentRepository, never()).save(any());
		}

		@Test
		@DisplayName("주문 내역이 없으면 예외를 던진다")
		void shouldThrowExceptionIfOrderNotFound() {
			// given
			CallbackRequestDto callbackDto = CallbackRequestDto.builder()
				.orderNo("NOT_EXIST")
				.build();

			given(paymentRepository.existsByOrderNo("NOT_EXIST")).willReturn(false);
			given(orderService.getOrderByOrderNo("NOT_EXIST")).willThrow(new CustomException(ErrorCode.ORDER_NOT_FOUND));

			// when & then
			assertThatThrownBy(() -> paymentService.processPaymentApproval(callbackDto))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.ORDER_NOT_FOUND.getMessage());
		}
	}

	@Nested
	@DisplayName("결제 상세 조회")
	class GetPaymentDetail {

		@Test
		@DisplayName("유효한 주문 ID와 사용자 ID로 결제 상세 정보를 조회할 수 있다")
		void shouldGetPaymentDetail() {
			// given
			Long orderId = 1L;
			Long userId = 1L;
			
			Order mockOrder = mock(Order.class);
			Payment mockPayment = mock(Payment.class);
			
			given(paymentRepository.findByOrderIdAndUserId(orderId, userId))
				.willReturn(Optional.of(mockPayment));
			given(mockPayment.getPaymentStatus()).willReturn(PaymentStatus.DONE);
			given(mockPayment.getCreatedAt()).willReturn(LocalDateTime.now().minusDays(1));
			given(mockPayment.getAmount()).willReturn(10000);
			given(mockPayment.getOrder()).willReturn(mockOrder);

			// when
			PaymentDetailResponseDto result = paymentService.getPaymentDetail(orderId, userId);

			// then
			assertThat(result).isNotNull();
			verify(paymentRepository).findByOrderIdAndUserId(orderId, userId);
		}

		@Test
		@DisplayName("결제 정보가 없으면 예외를 던진다")
		void shouldThrowExceptionWhenPaymentNotFound() {
			// given
			Long orderId = 1L;
			Long userId = 1L;
			
			given(paymentRepository.findByOrderIdAndUserId(orderId, userId))
				.willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> paymentService.getPaymentDetail(orderId, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.PAYMENT_NOT_FOUND.getMessage());
		}
	}

	@Nested
	@DisplayName("환불 요청")
	class RequestRefund {

		@Test
		@DisplayName("결제 상세 정보를 조회할 수 있다")
		void shouldGetPaymentDetailWithRefundInfo() {
			// given
			Long orderId = 1L;
			Long userId = 1L;
			
			Payment mockPayment = mock(Payment.class);
			Order mockOrder = mock(Order.class);
			
			given(paymentRepository.findByOrderIdAndUserId(orderId, userId))
				.willReturn(Optional.of(mockPayment));
			
			// Mock all methods needed by PaymentMapper.toPaymentDetailDto
			given(mockPayment.getId()).willReturn(1L);
			given(mockPayment.getOrder()).willReturn(mockOrder);
			given(mockOrder.getId()).willReturn(orderId);
			given(mockPayment.getOrderNo()).willReturn("ORDER123");
			given(mockPayment.getPayMethod()).willReturn("CARD");
			given(mockPayment.getAmount()).willReturn(10000);
			given(mockPayment.getDiscountedAmount()).willReturn(0);
			given(mockPayment.getPaidAmount()).willReturn(10000);
			given(mockPayment.getPaidTs()).willReturn("20240101123000");
			given(mockPayment.getPaymentStatus()).willReturn(PaymentStatus.DONE);
			given(mockPayment.getTransactionId()).willReturn("TXN123");
			given(mockPayment.getCardNumber()).willReturn("1234567812345678");
			given(mockPayment.getCardCompanyCode()).willReturn(1);
			given(mockPayment.getCardAuthorizationNo()).willReturn("AUTH123");
			given(mockPayment.getSpreadOut()).willReturn(0);
			given(mockPayment.getNoInterest()).willReturn(false);
			given(mockPayment.getCardMethodType()).willReturn("CREDIT");
			given(mockPayment.getCardNum4Print()).willReturn("5678");
			given(mockPayment.getSalesCheckLinkUrl()).willReturn("http://test.com");
			
			// Mock refund info check methods
			given(mockPayment.getCreatedAt()).willReturn(LocalDateTime.now().minusDays(1)); // 7일 이내
			given(mockPayment.getRefundReason()).willReturn(null);
			given(mockPayment.getRefundedAt()).willReturn(null);

			// when
			PaymentDetailResponseDto result = paymentService.getPaymentDetail(orderId, userId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getPaymentId()).isEqualTo(1L);
			assertThat(result.getOrderId()).isEqualTo(orderId);
			verify(paymentRepository).findByOrderIdAndUserId(orderId, userId);
		}

		@Test
		@DisplayName("이미 환불된 결제에 대해서는 예외를 던진다")
		void shouldThrowExceptionWhenAlreadyRefunded() {
			// given
			Long orderId = 1L;
			Long userId = 1L;
			RefundRequestDto requestDto = RefundRequestDto.builder()
				.refundReason("단순 변심")
				.build();
			
			Payment mockPayment = mock(Payment.class);
			
			given(paymentRepository.findByOrderIdAndUserId(orderId, userId))
				.willReturn(Optional.of(mockPayment));
			given(mockPayment.getPaymentStatus()).willReturn(PaymentStatus.REFUND_REQUESTED); // 환불 요청됨

			// when & then
			assertThatThrownBy(() -> paymentService.requestRefund(orderId, requestDto, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.INVALID_PAYMENT_STATUS.getMessage());
		}

		@Test
		@DisplayName("환불 기간이 만료된 결제에 대해서는 예외를 던진다")
		void shouldThrowExceptionWhenRefundTimeExpired() {
			// given
			Long orderId = 1L;
			Long userId = 1L;
			RefundRequestDto requestDto = RefundRequestDto.builder()
				.refundReason("단순 변심")
				.build();
			
			Payment mockPayment = mock(Payment.class);
			
			given(paymentRepository.findByOrderIdAndUserId(orderId, userId))
				.willReturn(Optional.of(mockPayment));
			given(mockPayment.getPaymentStatus()).willReturn(PaymentStatus.DONE);
			given(mockPayment.getCreatedAt()).willReturn(LocalDateTime.now().minusDays(8)); // 7일 초과

			// when & then
			assertThatThrownBy(() -> paymentService.requestRefund(orderId, requestDto, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.REFUND_TIME_EXPIRED.getMessage());
		}
	}
}
