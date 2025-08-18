import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../api/services/course.service';
import { Course, UpdateCourseRequest, CourseTheme, CourseThemeLabels } from '../../api/types';
import { useAuthStore } from '../../store/authStore';

interface CourseEditFormProps {
  course: Course;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const CourseEditForm: React.FC<CourseEditFormProps> = ({
  course,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState<UpdateCourseRequest>({
    title: course.title,
    description: course.description || '',
    region: course.region || '',
    themes: [],
    isPublic: course.isPublic || false
  });

  const [selectedThemes, setSelectedThemes] = useState<Set<CourseTheme>>(new Set());

  // 기존 코스 데이터로 폼 초기화
  useEffect(() => {
    if (course.theme) {
      // 기존 theme이 문자열이라면 CourseTheme enum으로 변환 시도
      const themeKeys = Object.keys(CourseTheme) as Array<keyof typeof CourseTheme>;
      const matchingThemes = themeKeys.filter(key => 
        CourseThemeLabels[CourseTheme[key]] === course.theme
      );
      
      if (matchingThemes.length > 0) {
        const initialThemes = new Set<CourseTheme>([CourseTheme[matchingThemes[0]]]);
        setSelectedThemes(initialThemes);
        setFormData(prev => ({ ...prev, themes: Array.from(initialThemes) }));
      }
    }
  }, [course]);

  // 코스 수정 뮤테이션
  const updateCourseMutation = useMutation({
    mutationFn: (data: UpdateCourseRequest) => courseService.updateCourse(course.courseId, data),
    onSuccess: (response) => {
      // 캐시 무효화 - 코스 상세 페이지의 모든 캐시를 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['course'], 
        type: 'all' // 'course'로 시작하는 모든 쿼리 무효화
      });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      
      onSuccess?.();
    },
    onError: (error) => {
      console.error('코스 수정 실패:', error);
      // 에러 상태는 UI에서 표시 - 백엔드 메시지 사용
    }
  });

  // 폼 입력 핸들러
  const handleInputChange = (field: keyof UpdateCourseRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 테마 선택 핸들러
  const handleThemeToggle = (theme: CourseTheme) => {
    const newSelectedThemes = new Set(selectedThemes);
    
    if (newSelectedThemes.has(theme)) {
      newSelectedThemes.delete(theme);
    } else {
      if (newSelectedThemes.size < 5) { // 최대 5개 제한
        newSelectedThemes.add(theme);
      }
    }
    
    setSelectedThemes(newSelectedThemes);
    setFormData(prev => ({ ...prev, themes: Array.from(newSelectedThemes) }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      return;
    }

    if (!formData.title.trim()) {
      return;
    }

    updateCourseMutation.mutate(formData);
  };

  const isLoading = updateCourseMutation.isPending;
  const error = updateCourseMutation.error;
  
  // 백엔드 에러 메시지 추출 함수
  const getErrorMessage = (error: any): string => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return '코스 수정에 실패했습니다. 다시 시도해주세요.';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          코스 수정
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 제목 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            코스 제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="코스 제목을 입력하세요"
            required
            disabled={isLoading}
          />
        </div>

        {/* 설명 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            코스 설명
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="코스에 대한 설명을 입력하세요"
            disabled={isLoading}
          />
        </div>

        {/* 지역 */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            지역 *
          </label>
          <input
            type="text"
            id="region"
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 서울, 부산, 제주도"
            required
            disabled={isLoading}
          />
        </div>

        {/* 테마 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            테마 선택 (최대 5개)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.values(CourseTheme).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => handleThemeToggle(theme)}
                disabled={isLoading}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedThemes.has(theme)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {CourseThemeLabels[theme]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            선택된 테마: {selectedThemes.size}/5
          </p>
        </div>

        {/* 공개 여부 */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isPublic || false}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              이 코스를 공개합니다
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            공개된 코스는 다른 사용자들이 볼 수 있습니다
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {getErrorMessage(error)}
            </p>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.region.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '수정 중...' : '코스 수정'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditForm;