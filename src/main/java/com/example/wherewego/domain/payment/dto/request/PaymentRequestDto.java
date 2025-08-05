package com.example.wherewego.domain.payment.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 토스 결제 생성 요청 DTO
 * 토스 결제를 생성할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {
	/**
	 * 가맹점 API Key (절대 노출 금지)
	 */
	@NotBlank(message = "API 키는 필수입니다.")
	private String apiKey;

	/**
	 * 주문 번호 (고유해야 함)
	 */
	@NotBlank(message = "주문번호는 필수입니다.")
	private String orderNo;

	/**
	 * 총 결제 금액 (원 단위)
	 */
	@NotNull(message = "결제 금액은 필수입니다.")
	@Min(value = 1, message = "결제 금액은 1원 이상이어야 합니다.")
	private Integer amount;

	/**
	 * 비과세 금액 (없으면 0)
	 */
	@NotNull(message = "비과세 금액은 필수입니다.")
	@Min(value = 0, message = "비과세 금액은 0 이상이어야 합니다.")
	private Integer amountTaxFree;

	/**
	 * 상품 설명
	 */
	@NotBlank(message = "상품 설명은 필수입니다.")
	private String productDesc;

	/**
	 * 결제 성공 후 리디렉션될 URL
	 */
	@NotBlank(message = "결제 성공 URL은 필수입니다.")
	private String retUrl;

	/**
	 * 결제 취소 시 리디렉션될 URL
	 */
	@NotBlank(message = "결제 취소 URL은 필수입니다.")
	private String retCancelUrl;

	/**
	 * 자동 승인 여부 (true: 자동 승인)
	 */
	private boolean autoExecute;

	/**
	 * 자동 승인 시 결제 결과 콜백 URL
	 */
	private String resultCallback;

	/**
	 * 콜백 버전 (권장: V2)
	 */
	private String callbackVersion;
}
