import { api, ApiResponse } from './axios';

export interface ImageUploadResponse {
  imageUrl: string;
  message: string;
}

/**
 * 이미지 업로드 API 서비스
 */
export const imageService = {
  /**
   * 프로필 이미지 업로드
   */
  uploadProfileImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<ImageUploadResponse>>('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * 프로필 이미지 삭제
   */
  deleteProfileImage: async (): Promise<void> => {
    await api.delete('/users/profile/image');
  },

  /**
   * 장소 이미지 업로드
   */
  uploadPlaceImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<ImageUploadResponse>>('/images/places', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * 코스 이미지 업로드
   */
  uploadCourseImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<ImageUploadResponse>>('/images/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * 일반 이미지 업로드
   */
  uploadGeneralImage: async (file: File, folder: string = 'general'): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post<ApiResponse<ImageUploadResponse>>('/images/general', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * 이미지 삭제 (URL 기반)
   */
  deleteImage: async (imageUrl: string): Promise<void> => {
    await api.delete('/images', {
      params: { imageUrl }
    });
  },
};