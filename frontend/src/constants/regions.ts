/**
 * 한국 행정구역 상수 데이터 (1차 행정구역만)
 * 
 * Google Places API에서 실제로 제공되는 데이터에 맞춰 1차 행정구역만 사용
 */

export interface RegionOption {
  value: string;
  label: string;
}

/**
 * 한국 1차 행정구역 목록
 * 실제 여행 코스/장소가 많이 등록될 것으로 예상되는 지역들 위주로 구성
 */
export const KOREA_REGIONS: RegionOption[] = [
  { value: '', label: '전체' },
  
  // 특별시/광역시
  { value: '서울', label: '서울특별시' },
  { value: '부산', label: '부산광역시' },
  { value: '대구', label: '대구광역시' },
  { value: '인천', label: '인천광역시' },
  { value: '광주', label: '광주광역시' },
  { value: '대전', label: '대전광역시' },
  { value: '울산', label: '울산광역시' },
  { value: '세종', label: '세종특별자치시' },
  
  // 도 단위
  { value: '경기', label: '경기도' },
  { value: '강원', label: '강원특별자치도' },
  { value: '충북', label: '충청북도' },
  { value: '충남', label: '충청남도' },
  { value: '전북', label: '전북특별자치도' },
  { value: '전남', label: '전라남도' },
  { value: '경북', label: '경상북도' },
  { value: '경남', label: '경상남도' },
  { value: '제주', label: '제주특별자치도' },
  
  // 주요 관광도시 (별도 검색 편의용)
  { value: '제주도', label: '제주도' },
  { value: '경주', label: '경주' },
  { value: '강릉', label: '강릉' },
  { value: '여수', label: '여수' },
  { value: '전주', label: '전주' },
  { value: '안동', label: '안동' },
  { value: '춘천', label: '춘천' },
  { value: '속초', label: '속초' },
  { value: '통영', label: '통영' },
  { value: '거제', label: '거제' },
];

export const getRegionLabel = (value: string): string => {
  const region = KOREA_REGIONS.find(r => r.value === value);
  return region?.label || value;
};