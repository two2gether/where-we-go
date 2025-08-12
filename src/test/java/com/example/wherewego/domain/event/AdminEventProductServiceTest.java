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
import com.example.wherewego.domain.eventproduct.dto.request.EventProductCreateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.request.EventProductUpdateRequestDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductCreateResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventProductUpdateResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventProductRepository;
import com.example.wherewego.domain.eventproduct.service.AdminEventProductService;
import com.example.wherewego.domain.user.entity.User;
import com.example.wherewego.domain.user.service.UserService;
import com.example.wherewego.global.exception.CustomException;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminEventService 테스트")
class AdminEventProductServiceTest {

	@Mock
	private EventProductRepository eventProductRepository;

	@Mock
	private UserService userService;

	@InjectMocks
	private AdminEventProductService adminEventProductService;

	@Nested
	@DisplayName("이벤트 상품 생성")
	class CreateEvent {

		@Test
		@DisplayName("관리자는 이벤트 상품을 생성할 수 있다")
		void shouldCreateEventSuccessfully() {
			// given
			Long adminId = 1L;
			EventProductCreateRequestDto requestDto = EventProductCreateRequestDto.builder()
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

			given(userService.getUserById(adminId)).willReturn(admin);
			given(eventProductRepository.save(any(EventProduct.class))).willReturn(saved);

			// when
			EventProductCreateResponseDto result = adminEventProductService.createEvent(requestDto, adminId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getProductId()).isEqualTo(1L);
		}

		@Test
		@DisplayName("관리자가 아닌 경우 예외를 던진다")
		void shouldThrowExceptionForNonAdmin() {
			// given
			Long userId = 2L;
			EventProductCreateRequestDto requestDto = EventProductCreateRequestDto.builder().build();

			User normalUser = User.builder()
				.id(userId)
				.role(UserRole.USER)
				.build();

			given(userService.getUserById(userId)).willReturn(normalUser);

			// when & then
			assertThatThrownBy(() -> adminEventProductService.createEvent(requestDto, userId))
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

			EventProductUpdateRequestDto requestDto = EventProductUpdateRequestDto.builder()
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

			given(eventProductRepository.findById(productId)).willReturn(Optional.of(existing));
			given(userService.getUserById(adminId)).willReturn(admin);
			given(existing.updateEventInfoFromRequest(
				any(), any(), any(), any(), any())).willReturn(updated);

			// when
			EventProductUpdateResponseDto result = adminEventProductService.updateEventInfo(productId, requestDto,
				adminId);

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
			EventProductUpdateRequestDto requestDto = EventProductUpdateRequestDto.builder().build();

			given(eventProductRepository.findById(productId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> adminEventProductService.updateEventInfo(productId, requestDto, userId))
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

			given(eventProductRepository.findByIdAndIsDeletedFalse(productId)).willReturn(Optional.of(existing));
			given(userService.getUserById(adminId)).willReturn(admin);

			// when
			adminEventProductService.deleteEventById(productId, adminId);

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

			given(eventProductRepository.findByIdAndIsDeletedFalse(productId)).willReturn(Optional.of(existing));
			given(userService.getUserById(userId)).willReturn(user);

			// when & then
			assertThatThrownBy(() -> adminEventProductService.deleteEventById(productId, userId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.UNAUTHORIZED_EVENT_PRODUCT_ACCESS.getMessage());
		}
	}
}