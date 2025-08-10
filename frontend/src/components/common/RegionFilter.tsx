import React, { useState, useEffect } from 'react';
import { KOREA_REGIONS, type RegionOption } from '../../constants/regions';

interface RegionFilterProps {
  selectedRegion?: string;
  onRegionChange: (region: string) => void;
  className?: string;
  // API 응답에서 추출한 지역 데이터를 받기 위한 prop
  availableRegionsData?: { regionSummary: string }[];
}

/**
 * 동적 2차 지역 필터 컴포넌트
 * 
 * 1차 지역 선택 → API 응답에서 2차 지역 동적 생성 방식
 */
export const RegionFilter: React.FC<RegionFilterProps> = ({
  selectedRegion = '',
  onRegionChange,
  className = '',
  availableRegionsData = []
}) => {
  const [selectedLevel1, setSelectedLevel1] = useState<string>('');
  const [selectedLevel2, setSelectedLevel2] = useState<string>('');
  const [level2Options, setLevel2Options] = useState<RegionOption[]>([]);

  // 초기값 설정 - selectedRegion 파싱
  useEffect(() => {
    if (selectedRegion) {
      const parts = selectedRegion.split(' ');
      if (parts.length >= 2) {
        setSelectedLevel1(parts[0]);
        setSelectedLevel2(parts.slice(1).join(' ')); // 나머지를 2차 지역으로
      } else {
        setSelectedLevel1(selectedRegion);
        setSelectedLevel2('');
      }
    } else {
      setSelectedLevel1('');
      setSelectedLevel2('');
    }
  }, [selectedRegion]);

  // API 응답 데이터에서 2차 지역 옵션 동적 생성
  useEffect(() => {
    if (selectedLevel1 && availableRegionsData.length > 0) {
      const level2Set = new Set<string>();
      
      availableRegionsData.forEach(item => {
        if (item.regionSummary) {
          const parts = item.regionSummary.split(' ');
          
          // 1차 지역이 일치하는 경우에만 2차 지역 추출
          if (parts.length >= 2 && parts[0] === selectedLevel1) {
            const level2 = parts.slice(1).join(' '); // 나머지 부분을 2차 지역으로
            if (level2.trim()) {
              level2Set.add(level2);
            }
          }
        }
      });

      // Set을 배열로 변환하고 정렬
      const options = Array.from(level2Set)
        .sort()
        .map(region => ({
          value: region,
          label: region
        }));

      setLevel2Options(options);
    } else {
      setLevel2Options([]);
    }
  }, [selectedLevel1, availableRegionsData]);

  const handleLevel1Select = (level1Value: string) => {
    setSelectedLevel1(level1Value);
    setSelectedLevel2(''); // level1 변경 시 level2 초기화
    
    // 1차만 선택한 경우 바로 적용
    onRegionChange(level1Value);
  };

  const handleLevel2Select = (level2Value: string) => {
    setSelectedLevel2(level2Value);
    const fullRegion = level2Value ? `${selectedLevel1} ${level2Value}` : selectedLevel1;
    onRegionChange(fullRegion);
  };

  const resetSelection = () => {
    setSelectedLevel1('');
    setSelectedLevel2('');
    onRegionChange('');
  };

  const getCurrentDisplayText = () => {
    if (!selectedLevel1) return '전체';
    if (!selectedLevel2) return selectedLevel1;
    return `${selectedLevel1} ${selectedLevel2}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 현재 선택된 지역 표시 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">지역 선택</h3>
        <div className="text-sm text-gray-500">
          {getCurrentDisplayText()}
        </div>
      </div>

      {/* 1차 행정구역 선택 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          시/도 선택
        </label>
        <div className="flex flex-wrap gap-2">
          {KOREA_REGIONS.map((region) => (
            <button
              key={region.value}
              onClick={() => handleLevel1Select(region.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                selectedLevel1 === region.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2차 지역 선택 (API 응답 기반 동적 생성) */}
      {selectedLevel1 && level2Options.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            세부 지역 선택 ({level2Options.length}개 지역)
          </label>
          <div className="flex flex-wrap gap-2">
            {/* 전체 옵션 (해당 시/도 전체) */}
            <button
              onClick={() => handleLevel2Select('')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                !selectedLevel2
                  ? 'bg-secondary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {selectedLevel1} 전체
            </button>
            
            {/* API 응답에서 추출한 2차 지역 옵션들 */}
            {level2Options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleLevel2Select(option.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  selectedLevel2 === option.value
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택 초기화 버튼 */}
      {(selectedLevel1 || selectedLevel2) && (
        <div className="pt-2">
          <button
            onClick={resetSelection}
            className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
          >
            선택 초기화
          </button>
        </div>
      )}
    </div>
  );
};