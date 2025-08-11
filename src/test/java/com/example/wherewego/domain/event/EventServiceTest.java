package com.example.wherewego.domain.event;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.util.List;
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
import com.example.wherewego.domain.eventproduct.dto.response.EventDetailResponseDto;
import com.example.wherewego.domain.eventproduct.dto.response.EventListResponseDto;
import com.example.wherewego.domain.eventproduct.entity.EventProduct;
import com.example.wherewego.domain.eventproduct.repository.EventRepository;
import com.example.wherewego.domain.eventproduct.service.EventService;
import com.example.wherewego.global.exception.CustomException;
import com.example.wherewego.global.response.PagedResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("EventService 테스트")
class EventServiceTest {

	@Mock
	private EventRepository eventRepository;

	@InjectMocks
	private EventService eventService;

	@Nested
	@DisplayName("이벤트 목록 조회")
	class FindAllEvents {

		@Test
		@DisplayName("삭제되지 않은 이벤트 상품 목록을 페이징하여 조회할 수 있다")
		void shouldReturnPagedEventList() {
			// given
			Pageable pageable = PageRequest.of(0, 10);

			EventProduct event1 = EventProduct.builder()
				.id(1L)
				.productName("상품1")
				.build();

			EventProduct event2 = EventProduct.builder()
				.id(2L)
				.productName("상품2")
				.build();

			List<EventProduct> events = List.of(event1, event2);
			Page<EventProduct> eventPage = new PageImpl<>(events, pageable, events.size());

			given(eventRepository.findAllByIsDeletedFalse(pageable)).willReturn(eventPage);

			// when
			PagedResponse<EventListResponseDto> result = eventService.findAllEvents(pageable);

			// then
			assertThat(result).isNotNull();
			List<EventListResponseDto> content = result.getContent();
			assertThat(content).hasSize(2);
			assertThat(result.getContent().get(0).getProductId()).isEqualTo(1L);
		}
	}

	@Nested
	@DisplayName("이벤트 상세 조회")
	class FindEventById {

		@Test
		@DisplayName("삭제되지 않은 이벤트 상품을 조회하고 조회수를 증가시킬 수 있다")
		void shouldReturnEventDetail() {
			// given
			Long productId = 1L;

			EventProduct event = mock(EventProduct.class);
			given(eventRepository.findByIdAndIsDeletedFalse(productId)).willReturn(Optional.of(event));
			given(event.getId()).willReturn(productId);

			// when
			EventDetailResponseDto result = eventService.findEventById(productId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getProductId()).isEqualTo(productId);
			verify(event, times(1)).incrementViewCount();
		}

		@Test
		@DisplayName("삭제되었거나 존재하지 않는 상품이면 예외를 던진다")
		void shouldThrowExceptionIfProductNotFound() {
			// given
			Long productId = 999L;
			given(eventRepository.findByIdAndIsDeletedFalse(productId)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> eventService.findEventById(productId))
				.isInstanceOf(CustomException.class)
				.hasMessage(ErrorCode.EVENT_PRODUCT_NOT_FOUND.getMessage());
		}
	}
}
