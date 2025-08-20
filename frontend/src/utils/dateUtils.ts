/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 백엔드에서 오는 마이크로초가 포함된 ISO 날짜 문자열을 안전하게 파싱합니다.
 * 예: "2025-08-19T12:18:31.02601" -> Date 객체
 * 
 * @param dateString - 백엔드에서 온 날짜 문자열
 * @returns Date 객체 또는 null (파싱 실패 시)
 */
export const parseBackendDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    // 마이크로초가 포함된 경우 밀리초로 truncate (ISO 8601 표준에 맞춤)
    let normalizedDate = dateString;
    
    // 마이크로초가 포함된 경우 (소수점 이하 6자리)
    if (dateString.includes('.') && dateString.includes('T')) {
      const [datePart, timePart] = dateString.split('T');
      const [time, fractional] = timePart.split('.');
      
      // 마이크로초를 밀리초로 변환 (처음 3자리만 사용)
      const milliseconds = fractional ? fractional.substring(0, 3).padEnd(3, '0') : '000';
      normalizedDate = `${datePart}T${time}.${milliseconds}Z`;
    } else if (!dateString.endsWith('Z') && !dateString.includes('+')) {
      // Z나 타임존 정보가 없으면 UTC로 처리
      normalizedDate = `${dateString}Z`;
    }
    
    const date = new Date(normalizedDate);
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Date parsing error:', error, dateString);
    return null;
  }
};

/**
 * 날짜를 한국어 형식으로 포맷합니다.
 * 
 * @param date - Date 객체 또는 날짜 문자열
 * @param options - Intl.DateTimeFormat 옵션
 * @returns 포맷된 날짜 문자열
 */
export const formatDate = (
  date: Date | string | null | undefined, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  if (!date) return '날짜 정보 없음';
  
  const dateObj = typeof date === 'string' ? parseBackendDate(date) : date;
  
  if (!dateObj) return '유효하지 않은 날짜';
  
  try {
    return dateObj.toLocaleDateString('ko-KR', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '날짜 포맷 오류';
  }
};

/**
 * 날짜와 시간을 한국어 형식으로 포맷합니다.
 * 
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 포맷된 날짜시간 문자열
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

/**
 * 상대적인 시간을 표시합니다 (예: "3분 전", "2시간 전")
 * 
 * @param date - Date 객체 또는 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export const formatRelativeTime = (date: Date | string | null | undefined): string => {
  if (!date) return '알 수 없음';
  
  const dateObj = typeof date === 'string' ? parseBackendDate(date) : date;
  
  if (!dateObj) return '알 수 없음';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return '방금 전';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 30) {
    return `${diffDays}일 전`;
  } else {
    return formatDate(dateObj);
  }
};