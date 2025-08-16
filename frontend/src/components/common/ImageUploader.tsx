import React, { useState, useRef, useCallback } from 'react';
import { imageService, ImageUploadResponse } from '../../api/imageService';

interface ImageUploaderProps {
  /**
   * 업로드 타입
   */
  type: 'profile' | 'place' | 'course' | 'general';
  
  /**
   * 현재 이미지 URL (있는 경우)
   */
  currentImageUrl?: string;
  
  /**
   * 업로드 완료 콜백
   */
  onUploadComplete: (imageUrl: string) => void;
  
  /**
   * 삭제 완료 콜백
   */
  onDeleteComplete?: () => void;
  
  /**
   * 에러 콜백
   */
  onError?: (error: string) => void;
  
  /**
   * 업로드 버튼 텍스트 (기본: "이미지 업로드")
   */
  uploadButtonText?: string;
  
  /**
   * 미리보기 크기 클래스
   */
  previewClassName?: string;
  
  /**
   * 컨테이너 클래스
   */
  className?: string;
  
  /**
   * 드래그 앤 드롭 허용 여부
   */
  allowDragDrop?: boolean;
  
  /**
   * 일반 이미지일 때 폴더명
   */
  folder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  type,
  currentImageUrl,
  onUploadComplete,
  onDeleteComplete,
  onError,
  uploadButtonText = '이미지 업로드',
  previewClassName = 'w-32 h-32',
  className = '',
  allowDragDrop = true,
  folder = 'general'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 유효성 검증
  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return '지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 지원)';
    }

    if (file.size > maxSize) {
      return '파일 크기가 10MB를 초과할 수 없습니다.';
    }

    return null;
  };

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    setIsUploading(true);

    try {
      let response: ImageUploadResponse;

      switch (type) {
        case 'profile':
          response = await imageService.uploadProfileImage(file);
          break;
        case 'place':
          response = await imageService.uploadPlaceImage(file);
          break;
        case 'course':
          response = await imageService.uploadCourseImage(file);
          break;
        case 'general':
          response = await imageService.uploadGeneralImage(file, folder);
          break;
        default:
          throw new Error('지원하지 않는 업로드 타입입니다.');
      }

      setPreviewUrl(response.imageUrl);
      onUploadComplete(response.imageUrl);
    } catch (error: any) {
      let errorMessage = '이미지 업로드에 실패했습니다.';
      
      // 백엔드 ApiResponse 에러 메시지 처리
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } 
      // imageService에서 던진 에러 메시지 처리
      else if (error.message) {
        errorMessage = error.message;
      }
      
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [type, folder, onUploadComplete, onError]);

  // 파일 선택 처리
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // 입력값 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileUpload]);

  // 드래그 이벤트 처리
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allowDragDrop) {
      setIsDragging(true);
    }
  }, [allowDragDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!allowDragDrop) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [allowDragDrop, handleFileUpload]);

  // 이미지 삭제 처리
  const handleDelete = useCallback(async () => {
    if (type === 'profile') {
      try {
        await imageService.deleteProfileImage();
        setPreviewUrl(null);
        onDeleteComplete?.();
      } catch (error: any) {
        let errorMessage = '이미지 삭제에 실패했습니다.';
        
        // 백엔드 ApiResponse 에러 메시지 처리
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } 
        // imageService에서 던진 에러 메시지 처리
        else if (error.message) {
          errorMessage = error.message;
        }
        
        onError?.(errorMessage);
      }
    } else if (previewUrl && onDeleteComplete) {
      try {
        await imageService.deleteImage(previewUrl);
        setPreviewUrl(null);
        onDeleteComplete();
      } catch (error: any) {
        let errorMessage = '이미지 삭제에 실패했습니다.';
        
        // 백엔드 ApiResponse 에러 메시지 처리
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } 
        // imageService에서 던진 에러 메시지 처리
        else if (error.message) {
          errorMessage = error.message;
        }
        
        onError?.(errorMessage);
      }
    }
  }, [type, previewUrl, onDeleteComplete, onError]);

  // 파일 선택 버튼 클릭
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 미리보기 영역 */}
      {previewUrl && (
        <div className="flex items-center space-x-4">
          <div className={`${previewClassName} relative overflow-hidden rounded-lg border border-gray-200`}>
            <img
              src={previewUrl}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
            disabled={isUploading}
          >
            삭제
          </button>
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">업로드 중...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div className="space-y-1">
              <p className="text-gray-600">
                {allowDragDrop ? '이미지를 드래그하거나 ' : ''}
                <button
                  onClick={handleButtonClick}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  {uploadButtonText}
                </button>
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, GIF, WebP 파일 (최대 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;