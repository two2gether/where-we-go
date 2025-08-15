// JWT 토큰 유틸리티 함수들

/**
 * JWT 토큰이 만료되었는지 확인
 * @param token JWT 토큰
 * @returns 만료된 경우 true, 유효한 경우 false
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    // JWT 토큰의 payload 부분 디코딩
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
    
    // exp 클레임이 없으면 만료된 것으로 간주
    if (!payload.exp) return true;
    
    // 만료 시간과 현재 시간 비교 (5분 여유 시간 추가)
    const bufferTime = 5 * 60; // 5분
    return payload.exp < (currentTime + bufferTime);
  } catch (error) {
    console.error('Token validation error:', error);
    return true; // 디코딩 오류 시 만료된 것으로 간주
  }
};

/**
 * JWT 토큰에서 사용자 정보 추출
 * @param token JWT 토큰
 * @returns 사용자 정보 또는 null
 */
export const getUserFromToken = (token: string | null): any | null => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user || payload.sub || null;
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
};

/**
 * 토큰의 만료 시간 얻기
 * @param token JWT 토큰
 * @returns 만료 시간 (Date) 또는 null
 */
export const getTokenExpirationDate = (token: string | null): Date | null => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return null;
    
    return new Date(payload.exp * 1000); // exp는 초 단위이므로 밀리초로 변환
  } catch (error) {
    console.error('Token expiration parsing error:', error);
    return null;
  }
};

/**
 * 토큰이 곧 만료될 예정인지 확인 (30분 이내)
 * @param token JWT 토큰
 * @returns 곧 만료될 예정이면 true
 */
export const isTokenExpiringSoon = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (!payload.exp) return false;
    
    const thirtyMinutes = 30 * 60; // 30분
    return payload.exp < (currentTime + thirtyMinutes);
  } catch (error) {
    console.error('Token expiration check error:', error);
    return false;
  }
};