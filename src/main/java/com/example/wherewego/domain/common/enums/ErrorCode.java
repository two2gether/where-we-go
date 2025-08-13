package com.example.wherewego.domain.common.enums;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {

	// 공통 에러 정의
	UNEXPECTED_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "알 수 없는 에러가 발생하였습니다."),
	METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "지원하는 HTTP 메서드가 아닙니다."),
	INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
	MISSING_TOKEN(HttpStatus.UNAUTHORIZED, "토큰이 존재하지 않습니다."),
	INVALID_REQUEST(HttpStatus.BAD_REQUEST, "요청 형식이 올바르지 않습니다."),
	VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "입력 값이 유효하지 않습니다."),

	// 유저 관련 에러 정의
	USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다."),
	ALREADY_WITHDRAW_USER(HttpStatus.BAD_REQUEST, "이미 회원탈퇴된 유저입니다."),
	DUPLICATE_NICKNAME(HttpStatus.BAD_REQUEST, "이미 존재하는 닉네임입니다."),
	DUPLICATE_EMAIL(HttpStatus.BAD_REQUEST, "이미 사용 중인 이메일입니다."),
	INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다."),
	INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 올바르지 않습니다."),
	UNAUTHORIZED_USER(HttpStatus.UNAUTHORIZED, "로그인 하지 않은 사용자입니다."),
	MISSING_USER_ID(HttpStatus.BAD_REQUEST, "사용자 ID는 필수입니다."),
	MISSING_COURSE_ID(HttpStatus.BAD_REQUEST, "코스 ID는 필수입니다."),

	// 코스 관련 에러 정의
	COURSE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 코스입니다."),
	UNAUTHORIZED_COURSE_ACCESS(HttpStatus.FORBIDDEN, "해당 코스에 대한 권한이 없습니다."),

	// 이벤트 상품 에러 정의
	EVENT_PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 상품입니다."),
	UNAUTHORIZED_EVENT_PRODUCT_ACCESS(HttpStatus.FORBIDDEN, "해당 상품에 대한 권한이 없습니다."),
	EVENT_PRODUCT_OUT_OF_STOCK(HttpStatus.NOT_FOUND, "남은 재고가 없습니다."),

	// 토스 결제 관련 에러 정의
	TOSS_PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "토스 결제 요청에 실패했습니다."),

	// 주문 관련 에러 정의
	ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "주문이 존재하지 않습니다."),
	UNAUTHORIZED_ORDER_ACCESS(HttpStatus.FORBIDDEN, "해당 주문에 대한 권한이 없습니다."),
	ORDER_ALREADY_EXISTS_FOR_USER(HttpStatus.CONFLICT, "이미 진행 중인 주문이 있습니다."),
	ONLY_ONE_ITEM_ALLOWED(HttpStatus.BAD_REQUEST, "하나의 상품만 주문할 수 있습니다."),

	// 결제 관련 에러 정의
	PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "결제 정보를 찾을 수 없습니다."),

	// 환불 관련 에러 정의
	INVALID_PAYMENT_STATUS(HttpStatus.BAD_REQUEST, "결제 완료된 건만 환불 가능합니다."),
	REFUND_TIME_EXPIRED(HttpStatus.BAD_REQUEST, "환불 가능 기간이 지났습니다."),
	REFUND_ALREADY_REQUESTED(HttpStatus.CONFLICT, "이미 환불 요청된 결제입니다."),
	REFUND_PROCESSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "환불 처리 중 오류가 발생했습니다."),

	// 외부 API 관련 에러 정의
	EXTERNAL_API_ERROR(HttpStatus.BAD_GATEWAY, "외부 API 호출에 실패했습니다."),

	// 북마크 관련 에러 정의
	BOOKMARK_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 북마크한 장소입니다."),
	BOOKMARK_NOT_FOUND(HttpStatus.NOT_FOUND, "북마크한 기록이 없습니다."),

	// 장소 관련 에러 정의
	PLACE_NOT_FOUND(HttpStatus.NOT_FOUND, "장소 정보를 찾을 수 없습니다."),
	PLACE_API_ERROR(HttpStatus.BAD_GATEWAY, "장소 정보 조회에 실패했습니다."),

	// 리뷰 관련 에러 정의
	REVIEW_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 리뷰를 작성한 장소입니다."),
	REVIEW_NOT_FOUND(HttpStatus.NOT_FOUND, "작성한 리뷰가 없습니다."),

	// 평점 관련 에러 정의
	RATING_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 평점을 등록한 코스입니다."),
	RATING_NOT_FOUND(HttpStatus.NOT_FOUND, "등록된 평점이 없습니다."),
	INVALID_RATING_VALUE(HttpStatus.BAD_REQUEST, "유효하지 않은 평점 값입니다."),

	// 좋아요 관련 에러 정의
	LIKE_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "이미 좋아요를 누른 코스입니다."),
	LIKE_NOT_FOUND(HttpStatus.NOT_FOUND, "좋아요를 누른 적이 없는 코스입니다."),
	LIKE_CONFLICT(HttpStatus.CONFLICT, "좋아요 처리 중 충돌이 발생했습니다."),

	// 댓글 관련 에러 정의
	COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 댓글입니다."),
	UNAUTHORIZED_COMMENT_ACCESS(HttpStatus.FORBIDDEN, "해당 댓글에 대한 권한이 없습니다."),
	CANNOT_COMMENT_ON_PRIVATE_COURSE(HttpStatus.FORBIDDEN, "비공개 코스에는 댓글을 작성할 수 없습니다."),

	// 알림 관련 에러 정의
	NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 알림입니다."),
	UNAUTHORIZED_NOTIFICATION_ACCESS(HttpStatus.FORBIDDEN, "해당 알림에 대한 권한이 없습니다."),
	INVALID_NOTIFICATION_TYPE(HttpStatus.BAD_REQUEST, "유효하지 않은 알림 유형입니다."),

	// 설정 및 구성 관련 에러 정의
	MISSING_API_KEY(HttpStatus.INTERNAL_SERVER_ERROR, "필수 API 키가 설정되지 않았습니다."),
	GOOGLE_API_KEY_MISSING(HttpStatus.INTERNAL_SERVER_ERROR, "구글 Maps API 키가 필요합니다."),

	// 구글 로그인 관련 에러 정의
	GOOGLE_ACCESS_TOKEN_REQUEST_FAILED(HttpStatus.UNAUTHORIZED, "구글 액세스 토큰 요청 실패"),
	GOOGLE_USER_INFO_REQUEST_FAILED(HttpStatus.UNAUTHORIZED, "구글 사용자 정보 요청 실패"),

	// 카카오 로그인 관련 에러 정의
	KAKAO_ACCESS_TOKEN_REQUEST_FAILED(HttpStatus.UNAUTHORIZED, "카카오 액세스 토큰 요청 실패"),
	KAKAO_USER_INFO_REQUEST_FAILED(HttpStatus.UNAUTHORIZED, "카카오 사용자 정보 요청 실패");

	private final HttpStatus status;
	private final String message;

	ErrorCode(HttpStatus status, String message) {
		this.status = status;
		this.message = message;
	}

}
