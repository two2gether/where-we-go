import React, { useEffect, useRef, useState } from 'react';
import { Button, Card } from '../base';

interface MapViewProps {
  places?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  }[];
  center?: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  height?: string;
  onPlaceClick?: (placeId: number) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const MapView: React.FC<MapViewProps> = ({
  places = [],
  center = { latitude: 37.5665, longitude: 126.9780 }, // 서울 시청 기본값
  zoom = 10,
  height = '400px',
  onPlaceClick,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  
  // Google Maps API 로드
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key is not configured');
      return;
    }

    // 이미 로드된 경우
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    // Google Maps API 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);
  }, [isLoaded, center.latitude, center.longitude, zoom]);

  // 마커 추가/업데이트
  useEffect(() => {
    if (!map || !window.google) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    places.forEach(place => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
        title: place.name,
        animation: window.google.maps.Animation.DROP,
      });

      // 정보 창 생성
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${place.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${place.address}</p>
          </div>
        `
      });

      // 마커 클릭 이벤트
      marker.addListener('click', () => {
        // 다른 정보창 닫기
        markersRef.current.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        infoWindow.open(map, marker);
        onPlaceClick?.(place.id);
      });

      marker.infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (places.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        bounds.extend({ lat: place.latitude, lng: place.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [map, places, onPlaceClick]);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <Card variant="outlined" padding="lg" className={className}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p>지도를 표시하려면 Google Maps API 키가 필요합니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="outlined" padding="none" className={className}>
      {!isLoaded && (
        <div 
          className="flex items-center justify-center bg-gray-100"
          style={{ height }}
        >
          <div className="text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className={`${!isLoaded ? 'hidden' : ''}`}
      />
      
      {places.length === 0 && isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white"
          style={{ height }}
        >
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p>표시할 장소가 없습니다</p>
          </div>
        </div>
      )}
    </Card>
  );
};