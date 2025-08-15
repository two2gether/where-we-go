import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Spinner } from '../base';
import type { Place } from '../../api/types';
import { AVAILABLE_THEMES, convertThemesToEnum } from '../../constants/themes';

interface CourseCreationModalProps {
  selectedPlaceIds: string[];
  places?: Place[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (courseData: {
    title: string;
    description: string;
    themes: string[];
    region: string;
    isPublic: boolean;
    orderedPlaceIds: string[];
  }) => void;
}

// AVAILABLE_THEMES는 이제 constants/themes.ts에서 import됨

export const CourseCreationModal: React.FC<CourseCreationModalProps> = ({
  selectedPlaceIds,
  places = [],
  isOpen,
  onClose,
  onConfirm
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [region, setRegion] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [orderedPlaceIds, setOrderedPlaceIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 선택된 장소들의 정보를 가져오기
  const selectedPlaces = places.filter(place => selectedPlaceIds.includes(place.placeId));

  useEffect(() => {
    if (isOpen) {
      setOrderedPlaceIds([...selectedPlaceIds]);
      // 선택된 장소들의 모든 지역을 수집하여 설정
      if (selectedPlaceIds.length > 0 && places.length > 0) {
        const regions = new Set<string>();
        selectedPlaceIds.forEach(placeId => {
          const place = places.find(p => p.placeId === placeId);
          if (place && place.regionSummary) {
            const regionParts = place.regionSummary.split(' ');
            const mainRegion = regionParts[0];
            if (mainRegion) {
              regions.add(mainRegion);
            }
          }
        });
        
        // 지역들을 배열로 변환하고 정렬한 후 쉼표로 연결
        const regionArray = Array.from(regions).sort();
        setRegion(regionArray.join(', '));
      }
    }
  }, [isOpen, selectedPlaceIds]);

  const handleThemeToggle = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter(t => t !== theme));
    } else if (selectedThemes.length < 5) {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };

  const handlePlaceReorder = (fromIndex: number, toIndex: number) => {
    const newOrder = [...orderedPlaceIds];
    const [movedPlace] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedPlace);
    setOrderedPlaceIds(newOrder);
  };

  // 실시간으로 미리보기 순서를 계산하는 함수
  const getPreviewOrder = () => {
    if (draggedIndex === null || dragOverIndex === null) {
      return orderedPlaceIds;
    }
    
    const newOrder = [...orderedPlaceIds];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dragOverIndex, 0, draggedItem);
    return newOrder;
  };

  // 드래그앤드롭 핸들러들
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && overIndex !== draggedIndex) {
      setDragOverIndex(overIndex);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // 컨테이너를 완전히 벗어날 때만 dragOverIndex 리셋
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      handlePlaceReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };


  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('코스 제목을 입력해주세요.');
      return;
    }
    if (!region.trim()) {
      alert('지역을 입력해주세요.');
      return;
    }
    if (orderedPlaceIds.length === 0) {
      alert('최소 1개 이상의 장소를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onConfirm({
        title: title.trim(),
        description: description.trim(),
        themes: convertThemesToEnum(selectedThemes), // 백엔드 ENUM으로 변환
        region: region.trim(),
        isPublic,
        orderedPlaceIds
      });
    } catch (error) {
      console.error('Failed to create course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedThemes([]);
    setRegion('');
    setIsPublic(false);
    setOrderedPlaceIds([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">새 코스 만들기</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                코스 제목 *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 서울 맛집 투어"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                코스 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="코스에 대한 간단한 설명을 작성해주세요."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역 *
              </label>
              <Input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="예: 서울"
                maxLength={20}
              />
            </div>
          </div>

          {/* 테마 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테마 선택 (최대 5개)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeToggle(theme)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedThemes.includes(theme)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* 공개 설정 */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
              />
              <span className="text-sm text-gray-700">공개 코스로 설정 (현재: {isPublic ? '공개' : '비공개'})</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              공개 코스는 다른 사용자들이 볼 수 있습니다.
            </p>
          </div>

          {/* 장소 순서 정하기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              장소 순서 정하기 ({orderedPlaceIds.length}개)
            </label>
            <div 
              className="space-y-3 max-h-80 overflow-y-auto px-1"
              onDragLeave={handleDragLeave}
            >
              {getPreviewOrder().map((placeId, displayIndex) => {
                const place = selectedPlaces.find(p => p.placeId === placeId);
                const originalIndex = orderedPlaceIds.indexOf(placeId);
                if (!place) return null;

                const isDragged = draggedIndex === originalIndex;
                const isDropTarget = dragOverIndex === displayIndex && draggedIndex !== null;
                const isAnimating = draggedIndex !== null && !isDragged;

                return (
                  <div
                    key={placeId}
                    className={`relative bg-white border-2 rounded-xl px-5 py-4 flex items-center justify-between group cursor-move transition-all duration-300 ${
                      isDragged
                        ? 'opacity-40 transform scale-95 bg-primary-100 border-primary-400 shadow-2xl z-10' 
                        : isDropTarget
                          ? 'border-primary-400 bg-primary-50 shadow-lg transform scale-102'
                          : isAnimating
                            ? 'transform translate-y-0 transition-transform duration-300 ease-out'
                            : 'border-gray-200 hover:border-primary-200 hover:shadow-md'
                    }`}
                    style={{
                      transform: isAnimating && !isDragged ? 'translateY(0)' : undefined,
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalIndex)}
                    onDragOver={(e) => handleDragOver(e, displayIndex)}
                    onDragEnter={handleDragEnter}
                    onDrop={(e) => handleDrop(e, displayIndex)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* 드롭 인디케이터 */}
                    {isDropTarget && (
                      <div className="absolute -top-2 left-4 right-4 h-1 bg-primary-500 rounded-full opacity-80"></div>
                    )}
                    {/* 드래그 핸들 영역 */}
                    <div className="flex items-center space-x-4 flex-1 cursor-move">
                      {/* 드래그 핸들 - 6개 점으로 변경 */}
                      <div className="flex-shrink-0 text-gray-500 hover:text-primary-600 transition-colors p-1">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="8" cy="6" r="2"/>
                          <circle cx="16" cy="6" r="2"/>
                          <circle cx="8" cy="12" r="2"/>
                          <circle cx="16" cy="12" r="2"/>
                          <circle cx="8" cy="18" r="2"/>
                          <circle cx="16" cy="18" r="2"/>
                        </svg>
                      </div>
                      
                      {/* 순서 번호 - 실시간 업데이트 */}
                      <div className={`flex-shrink-0 w-12 h-12 text-white rounded-full flex items-center justify-center text-base font-bold shadow-sm transition-all duration-300 ${
                        isDragged 
                          ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                          : isDropTarget
                            ? 'bg-gradient-to-br from-primary-600 to-primary-700 transform scale-110'
                            : 'bg-gradient-to-br from-primary-500 to-primary-600'
                      }`}>
                        {displayIndex + 1}
                      </div>
                      
                      {/* 장소 정보 */}
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-semibold text-gray-900 text-base truncate mb-1">{place.name}</h4>
                        <p className="text-sm text-gray-500 truncate flex items-center">
                          <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {place.regionSummary}
                        </p>
                      </div>
                    </div>
                    
                    {/* 컨트롤 버튼들 - 항상 보이게 하되 투명도로 조절 */}
                    <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* 한 칸 위로 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceReorder(originalIndex, Math.max(0, originalIndex - 1));
                        }}
                        disabled={originalIndex === 0}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="위로 이동"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      
                      {/* 한 칸 아래로 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceReorder(originalIndex, Math.min(orderedPlaceIds.length - 1, originalIndex + 1));
                        }}
                        disabled={originalIndex === orderedPlaceIds.length - 1}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="아래로 이동"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !region.trim()}
            icon={isSubmitting ? <Spinner size="sm" /> : undefined}
          >
            {isSubmitting ? '생성 중...' : '코스 생성'}
          </Button>
        </div>
      </div>
    </div>
  );
};