import React, { useState } from 'react';
import { Button, Card, Spinner } from '../base';
import { useMyCourses } from '../../hooks/useCourses';
import type { Course } from '../../api/types';

interface AddToCourseModalProps {
  placeId: string | null;
  placeName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCourse?: (courseId: number, placeId: string) => void;
}

export const AddToCourseModal: React.FC<AddToCourseModalProps> = ({
  placeId,
  placeName = '선택한 장소',
  isOpen,
  onClose,
  onAddToCourse
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  // 모달이 열려있을 때만 코스 데이터 조회
  const { data: coursesData, isLoading, error } = useMyCourses({ enabled: isOpen });
  
  // 에러 시 더미 데이터 제공 (테스트용)
  const dummyCourses = [
    {
      id: 1,
      title: '서울 맛집 투어',
      region: '서울',
      theme: '맛집탐방',
      places: [{ id: '1', name: '장소1' }, { id: '2', name: '장소2' }]
    },
    {
      id: 2,
      title: '부산 해변가 코스',
      region: '부산',
      theme: '힐링',
      places: [{ id: '3', name: '장소3' }]
    },
    {
      id: 3,
      title: '제주 드라이브',
      region: '제주도',
      theme: '드라이브',
      places: []
    }
  ];
  
  const courses = error ? dummyCourses : (coursesData?.content || []);

  const handleAddToCourse = () => {
    if (selectedCourseId && placeId && onAddToCourse) {
      onAddToCourse(selectedCourseId, placeId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">코스에 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            <span className="font-medium text-gray-900">{placeName}</span>을(를) 추가할 코스를 선택해주세요.
          </p>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {error && courses.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ 서버에서 코스를 불러올 수 없어 테스트용 데이터를 표시합니다.
              </p>
            </div>
          )}

          {courses.length === 0 && !isLoading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">아직 생성한 코스가 없습니다.</p>
              <Button 
                variant="primary"
                onClick={() => {
                  // TODO: 새 코스 생성 페이지로 이동
                  console.log('Navigate to create new course');
                  onClose();
                }}
              >
                새 코스 만들기
              </Button>
            </div>
          )}

          {courses.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  padding="md"
                  className={`cursor-pointer transition-all ${
                    selectedCourseId === course.id
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.region} • {course.theme}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {course.places?.length || 0}개 장소
                      </p>
                    </div>
                    <div className="ml-4">
                      {selectedCourseId === course.id ? (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {courses.length > 0 && (
          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button 
              variant="primary"
              disabled={!selectedCourseId}
              onClick={handleAddToCourse}
            >
              추가하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};