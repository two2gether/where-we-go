package com.example.wherewego.domain.event;

import static org.assertj.core.api.AssertionsForClassTypes.*;
import static org.mockito.BDDMockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.wherewego.domain.auth.enums.UserRole;
import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.eventproduct.dto.request.EventCreateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.request.EventUpdateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventCreateResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventUpdateResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.domain.eventproduct.service.AdminEventService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.repository.UserRepository;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminEventService 테스트")
class AdminEventServiceTest {

	@Mock
	private EventRepository eventRepository;

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private AdminEventService adminEventService;

	@Nested
	@DisplayName("이벤트 상품 생성")
	class CreateEvent {

		@Test
		@DisplayName("관리자는 이벤트 상품을 생성할 수 있다")
		void shouldCreateEventSuccessfully() {
			// given
			Long adminId = 1L;
			EventCreateRequestDto requestDto = EventCreateRequestDto.builder()
				.productName("한정판 티셔츠")
				.productImage("https://image.com/tshirt.jpg")
				.description("멋진 한정판 티셔츠")
				.price(20000)
				.stock(100)
				.build();

			User admin = User.builder()
				.id(adminId)
				.role(UserRole.ADMIN)
				.build();

			EventProduct saved = EventProduct.builder()
				.id(1L)
				.productName("한정판 티셔츠")
				.description("멋진 한정판 티셔츠")
				.stock(100)
				.build();

			given(userRepository.findByIdAndIsDeletedFalse(adminId)).willReturn(Optional.of(admin));
			given(eventRepository.save(any(EventProduct.class))).willReturn(saved);

			// when
			EventCreateResponseDto result = adminEventService.createEvent(requestDto, adminId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getProductId()).isEqualTo(1L);
		}

		@Test
		@DisplayName("관리자가 아닌 경우 예외를 던진다")
		void shouldThrowExceptionForNonAdmin() {
			// given
			Long userId = 2L;
			EventCreateRequestDto requestDto = EventCreateRequestDto.builder().build();

			User normalUser = User.builder()
				.id(userId)
				.role(UserRole.USER)
				.build();

			given(userRepository.findByIdAndIsDeletedFalse(userId)).willReturn(Optional.of(normalUser));

			// when & then
			assertThatThrownBy(() -> adminEventService.createEvent(requestDto, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.UNAUTHORIZED_EVENT_PRODUCT_ACCESS.getMessage());
		}
	}

	@Nested
	@DisplayName("이벤트 상품 수정")
	class UpdateEvent {

		@Test
		@DisplayName("관리자는 이벤트 상품을 수정할 수 있다")
		void shouldUpdateEventSuccessfully() {
			// given
			Long adminId = 1L;
			Long productId = 100L;

			EventUpdateRequestDto requestDto = EventUpdateRequestDto.builder()
				.productName("수정된 상품")
				.productImage("https://image.com/new.jpg")
				.description("설명")
				.price(30000)
				.stock(50)
				.build();

			User admin = User.builder()
				.id(adminId)
				.role(UserRole.ADMIN)
				.build();

			EventProduct existing = mock(EventProduct.class);
			EventProduct updated = EventProduct.builder()
				.id(productId)
				.productName("수정된 상품")
				.build();

			given(eventRepository.findById(productId)).willReturn(Optional.of(existing));
			given(userRepository.findById(adminId)).willReturn(Optional.of(admin));
			given(existing.updateEventInfoFromRequest(
				any(), any(), any(), any(), any())).willReturn(updated);

			// when
			EventUpdateResponseDto result = adminEventService.updateEventInto(productId, requestDto, adminId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getProductName()).isEqualTo("수정된 상품");
		}

		@Test
		@DisplayName("이벤트 상품이 없으면 예외 발생")
		void shouldThrowWhenProductNotFound() {
			// given
			Long productId = 100L;
			Long userId = 1L;
			EventUpdateRequestDto requestDto = EventUpdateRequestDto.builder().build();

			given(eventRepository.findById(productId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> adminEventService.updateEventInto(productId, requestDto, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.EVENT_PRODUCT_NOT_FOUND.getMessage());
		}
	}

	@Nested
	@DisplayName("이벤트 상품 삭제")
	class DeleteEvent {

		@Test
		@DisplayName("관리자는 이벤트 상품을 삭제할 수 있다 (soft delete)")
		void shouldDeleteEventSuccessfully() {
			// given
			Long adminId = 1L;
			Long productId = 123L;

			User admin = User.builder()
				.id(adminId)
				.role(UserRole.ADMIN)
				.build();

			EventProduct existing = mock(EventProduct.class);

			given(eventRepository.findByIdAndIsDeletedFalse(productId)).willReturn(Optional.of(existing));
			given(userRepository.findById(adminId)).willReturn(Optional.of(admin));

			// when
			adminEventService.deleteEventById(productId, adminId);

			// then
			verify(existing, times(1)).softDelete();
		}

		@Test
		@DisplayName("관리자가 아니면 삭제할 수 없다")
		void shouldThrowWhenNonAdminTriesToDelete() {
			// given
			Long userId = 2L;
			Long productId = 123L;

			User user = User.builder()
				.id(userId)
				.role(UserRole.USER)
				.build();

			EventProduct existing = mock(EventProduct.class);

			given(eventRepository.findByIdAndIsDeletedFalse(productId)).willReturn(Optional.of(existing));
			given(userRepository.findById(userId)).willReturn(Optional.of(user));

			// when & then
			assertThatThrownBy(() -> adminEventService.deleteEventById(productId, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.UNAUTHORIZED_EVENT_PRODUCT_ACCESS.getMessage());
		}
	}
}