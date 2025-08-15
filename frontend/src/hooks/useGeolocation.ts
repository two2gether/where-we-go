import { useEffect } from 'react';
import { useLocationStore } from '../store/locationStore';

export const useGeolocation = (requestOnMount = false) => {
  const {
    latitude,
    longitude,
    error,
    isLoading,
    isPermissionGranted,
    lastUpdated,
    requestLocation: storeRequestLocation,
    clearLocation,
  } = useLocationStore();

  // 위치 권한 상태 확인
  const checkPermission = async () => {
    if (!navigator.permissions) return;
    
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      useLocationStore.getState().setPermissionGranted(permission.state === 'granted');
      
      // 권한 상태 변경 리스너
      permission.onchange = () => {
        useLocationStore.getState().setPermissionGranted(permission.state === 'granted');
      };
    } catch (error) {
      console.log('권한 확인 실패:', error);
    }
  };

  useEffect(() => {
    checkPermission();
    
    // 캐시된 위치 정보가 없거나 너무 오래된 경우, 자동 요청
    if (requestOnMount) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (!lastUpdated || (now - lastUpdated > fiveMinutes)) {
        storeRequestLocation();
      }
    }
  }, [requestOnMount, lastUpdated]);

  return {
    latitude,
    longitude,
    error,
    isLoading,
    isPermissionGranted,
    requestLocation: storeRequestLocation,
    clearLocation,
  };
};

// 두 지점 간 거리 계산 (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // 미터 단위로 반환
};