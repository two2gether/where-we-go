import { AxiosError } from 'axios';
import type { ErrorResponse } from '../api/types';

/**
 * API 에러에서 사용자 친화적인 메시지를 추출합니다.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Axios 에러인 경우
    if ('response' in error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      
      // 서버에서 온 에러 응답이 있는 경우
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
      
      // HTTP 상태 코드별 기본 메시지
      switch (axiosError.response?.status) {
        case 400:
          return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
        case 401:
          return '로그인이 필요합니다.';
        case 403:
          return '권한이 없습니다.';
        case 404:
          return '요청한 리소스를 찾을 수 없습니다.';
        case 409:
          return '이미 등록된 데이터가 있습니다.';
        case 422:
          return '입력 데이터가 유효하지 않습니다.';
        case 500:
          return '서버 내부 오류가 발생했습니다.';
        default:
          return axiosError.message || '알 수 없는 오류가 발생했습니다.';
      }
    }
    
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * 리뷰 관련 에러 메시지를 처리합니다.
 */
export const getReviewErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);
  
  // 백엔드에서 오는 정확한 메시지가 있으면 그대로 사용
  if (message && message !== '알 수 없는 오류가 발생했습니다.') {
    return message;
  }
  
  // HTTP 상태 코드별 기본 메시지 (서버 메시지가 없는 경우)
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as any;
    switch (axiosError.response?.status) {
      case 409:
        return '이미 이 장소에 리뷰를 작성하셨습니다.';
      case 403:
        return '리뷰 작성 권한이 없습니다.';
      case 401:
        return '로그인 후 리뷰를 작성할 수 있습니다.';
      case 404:
        return '장소를 찾을 수 없습니다.';
      case 400:
        return '리뷰 내용이 올바르지 않습니다. 다시 확인해주세요.';
      default:
        return '리뷰 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  }
  
  return message;
};