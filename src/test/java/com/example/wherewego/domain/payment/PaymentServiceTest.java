package com.example.wherewego.domain.payment;

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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.order.entity.Order;
import com.example.wherewego.domain.order.repository.OrderRepository;
import com.example.wherewego.domain.payment.dto.request.CallbackRequestDto;
import com.example.wherewego.domain.payment.dto.request.PaymentRequestDto;
import com.example.wherewego.domain.payment.dto.response.PaymentResponseDto;
import com.example.wherewego.domain.payment.entity.Payment;
import com.example.wherewego.domain.payment.repository.PaymentRepository;
import com.example.wherewego.domain.payment.service.PaymentService;
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
	private OrderRepository orderRepository;

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
		Payment mockPayment = mock(Payment.class);

		PaymentResponseDto responseDto = PaymentResponseDto.builder()
			.code(0)
			.payToken("PAY-TOKEN-123")
			.checkoutPage("https://checkout.page")
			.build();

		given(orderRepository.findByOrderNo("ORDER123")).willReturn(Optional.of(mockOrder));
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
		PaymentResponseDto result = paymentService.requestPayment(requestDto);

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

		given(orderRepository.findByOrderNo("NOT_EXIST")).willReturn(Optional.empty());

		// when & then
		assertThatThrownBy(() -> paymentService.requestPayment(requestDto))
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
		Payment mockPayment = mock(Payment.class);

		PaymentResponseDto failResponse = PaymentResponseDto.builder()
			.code(-1) // 실패
			.msg("결제 실패")
			.errorCode("INVALID_REQUEST")
			.build();

		given(orderRepository.findByOrderNo("ORDER999")).willReturn(Optional.of(mockOrder));
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
		assertThatThrownBy(() -> paymentService.requestPayment(requestDto))
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
			given(orderRepository.findByOrderNo("ORDER123")).willReturn(Optional.of(mockOrder));
			given(paymentRepository.existsByOrderNo("ORDER123")).willReturn(false);

			// when
			paymentService.processPaymentApproval(callbackDto);

			// then
			verify(mockOrder).markAsPaid();
			verify(orderRepository).save(mockOrder);
			verify(paymentRepository).save(any(Payment.class));
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
			verify(orderRepository, never()).findByOrderNo(any());
			verify(orderRepository, never()).save(any());
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
			given(orderRepository.findByOrderNo("NOT_EXIST")).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> paymentService.processPaymentApproval(callbackDto))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.ORDER_NOT_FOUND.getMessage());
		}
	}
}
