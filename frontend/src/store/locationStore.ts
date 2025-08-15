import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationState {
  // 위치 정보
  latitude: number | null;
  longitude: number | null;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  isPermissionGranted: boolean;
  lastUpdated: number | null;
  
  // 액션
  setLocation: (latitude: number, longitude: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPermissionGranted: (granted: boolean) => void;
  clearLocation: () => void;
  requestLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      latitude: null,
      longitude: null,
      isLoading: false,
      error: null,
      isPermissionGranted: false,
      lastUpdated: null,

      // 액션들
      setLocation: (latitude: number, longitude: number) => {
        set({
          latitude,
          longitude,
          error: null,
          isPermissionGranted: true,
          lastUpdated: Date.now(),
        });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      setPermissionGranted: (isPermissionGranted: boolean) => {
        set({ isPermissionGranted });
      },

      clearLocation: () => {
        set({
          latitude: null,
          longitude: null,
          error: null,
          isPermissionGranted: false,
          lastUpdated: null,
        });
      },

      requestLocation: async () => {
        const { setLoading, setLocation, setError, setPermissionGranted } = get();

        if (!navigator.geolocation) {
          setError('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5분간 캐시
              }
            );
          });

          setLocation(position.coords.latitude, position.coords.longitude);
          setPermissionGranted(true);
        } catch (error) {
          let errorMessage = '위치 정보를 가져올 수 없습니다.';
          
          if (error instanceof GeolocationPositionError) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = '위치 정보를 사용할 수 없습니다.';
                break;
              case error.TIMEOUT:
                errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
                break;
            }
          }

          setError(errorMessage);
          setPermissionGranted(false);
        } finally {
          setLoading(false);
        }
      },
    }),
    {
      name: 'location-store', // localStorage 키
      partialize: (state) => ({
        // 위치 정보와 권한 상태만 localStorage에 저장
        latitude: state.latitude,
        longitude: state.longitude,
        isPermissionGranted: state.isPermissionGranted,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);