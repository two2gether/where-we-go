/**
 * 지리적 위치 정보 사용 가능 여부를 확인하는 유틸리티
 */

/**
 * 현재 환경에서 Geolocation API 사용이 가능한지 확인
 * @returns HTTPS 환경이거나 localhost에서 실행 중인 경우 true
 */
export const isGeolocationAvailable = (): boolean => {
  // Geolocation API 지원 여부 확인
  if (!navigator.geolocation) {
    return false;
  }

  // HTTPS 환경이거나 localhost인 경우만 허용
  return (
    location.protocol === 'https:' || 
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'
  );
};

/**
 * Geolocation 사용 불가 이유를 반환
 * @returns 사용 불가 이유 메시지
 */
export const getGeolocationUnavailableReason = (): string => {
  if (!navigator.geolocation) {
    return '이 브라우저에서는 위치 서비스를 지원하지 않습니다.';
  }

  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return 'HTTP 환경에서는 위치 서비스를 사용할 수 없습니다. 지역을 직접 선택해주세요.';
  }

  return '위치 서비스를 사용할 수 없습니다.';
};