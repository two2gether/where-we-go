import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { useAuthStore } from '../../store';

interface ProfileImageUploaderProps {
  /**
   * 현재 프로필 이미지 URL
   */
  currentImageUrl?: string;
  
  /**
   * 업로드 완료 콜백
   */
  onUploadComplete?: (imageUrl: string) => void;
  
  /**
   * 삭제 완료 콜백
   */
  onDeleteComplete?: () => void;
  
  /**
   * 미리보기 크기 (기본: 128px)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * 편집 모드 여부 (기본: true)
   */
  editable?: boolean;
  
  /**
   * 컨테이너 클래스
   */
  className?: string;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  currentImageUrl,
  onUploadComplete,
  onDeleteComplete,
  size = 'lg',
  editable = true,
  className = ''
}) => {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { updateUser } = useAuthStore();

  // 사이즈별 클래스 정의
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  // 업로드 완료 처리
  const handleUploadComplete = (imageUrl: string) => {
    // 사용자 스토어의 프로필 이미지 업데이트
    updateUser({ profileImage: imageUrl });
    
    setSuccess('프로필 이미지가 성공적으로 업데이트되었습니다.');
    setError('');
    
    // 3초 후 성공 메시지 제거
    setTimeout(() => setSuccess(''), 3000);
    
    onUploadComplete?.(imageUrl);
  };

  // 삭제 완료 처리
  const handleDeleteComplete = () => {
    // 사용자 스토어의 프로필 이미지 제거
    updateUser({ profileImage: null });
    
    setSuccess('프로필 이미지가 성공적으로 삭제되었습니다.');
    setError('');
    
    // 3초 후 성공 메시지 제거
    setTimeout(() => setSuccess(''), 3000);
    
    onDeleteComplete?.();
  };

  // 에러 처리
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
    
    // 5초 후 에러 메시지 제거
    setTimeout(() => setError(''), 5000);
  };

  // 읽기 전용 모드
  if (!editable) {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-full border-2 border-gray-200`}>
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-1/2 h-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 메시지 알림 */}
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md">
          {success}
        </div>
      )}

      {/* 현재 프로필 이미지 */}
      <div className="flex flex-col items-center space-y-3">
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-full border-2 border-gray-200`}>
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="현재 프로필 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-1/2 h-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 text-center">
          프로필 이미지
        </p>
      </div>

      {/* 이미지 업로더 */}
      <ImageUploader
        type="profile"
        currentImageUrl={currentImageUrl}
        onUploadComplete={handleUploadComplete}
        onDeleteComplete={handleDeleteComplete}
        onError={handleError}
        uploadButtonText="새 이미지 선택"
        previewClassName="w-20 h-20"
        allowDragDrop={true}
      />

      {/* 도움말 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 권장 사이즈: 300x300px 이상의 정사각형 이미지</p>
        <p>• 지원 형식: JPEG, PNG, GIF, WebP</p>
        <p>• 최대 크기: 10MB</p>
      </div>
    </div>
  );
};

export default ProfileImageUploader;