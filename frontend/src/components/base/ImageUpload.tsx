import React, { useState, useRef } from 'react';
import { imageService, ImageUploadResponse } from '../../api/services/image.service';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: string) => void;
  currentImage?: string;
  uploadType: 'product' | 'profile' | 'course' | 'place' | 'general';
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onError,
  currentImage,
  uploadType,
  disabled = false,
  className = '',
  placeholder = '이미지를 업로드하세요'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // 파일 크기 체크 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      onError?.('파일 크기가 10MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError?.('지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 지원)');
      return;
    }

    try {
      setIsUploading(true);
      let response: ImageUploadResponse;

      switch (uploadType) {
        case 'product':
          response = await imageService.uploadProductImage(file);
          break;
        case 'profile':
          response = await imageService.uploadProfileImage(file);
          break;
        case 'course':
          response = await imageService.uploadCourseImage(file);
          break;
        case 'place':
          response = await imageService.uploadPlaceImage(file);
          break;
        default:
          response = await imageService.uploadGeneralImage(file);
      }

      if (response.imageUrl) {
        onImageUploaded(response.imageUrl);
      } else {
        onError?.(response.message || '이미지 업로드에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Image upload failed:', error);
      const errorMessage = error.response?.data?.message || '이미지 업로드 중 오류가 발생했습니다.';
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    if (currentImage) {
      try {
        await imageService.deleteImage(currentImage);
        onImageUploaded('');
      } catch (error) {
        console.error('Failed to delete image:', error);
        // 삭제 실패해도 UI에서는 제거
        onImageUploaded('');
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      {currentImage ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={currentImage}
              alt="업로드된 이미지"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.png';
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                ×
              </button>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={openFileDialog}
              disabled={isUploading}
              className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
            >
              이미지 변경
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={disabled ? undefined : openFileDialog}
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="space-y-2">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-2">업로드 중...</p>
              </div>
            ) : (
              <>
                <div className="text-3xl text-gray-400">📁</div>
                <p className="text-sm text-gray-600">{placeholder}</p>
                <p className="text-xs text-gray-500">
                  클릭하거나 파일을 드래그해서 업로드하세요
                  <br />
                  (JPEG, PNG, GIF, WebP - 최대 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};