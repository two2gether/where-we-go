import { api } from '../axios';

// 이미지 업로드 응답 타입
export interface ImageUploadResponse {
  imageUrl: string | null;
  message: string;
}

/**
 * 이미지 업로드 관련 API 서비스
 * 백엔드 ImageController 엔드포인트에 맞춰 구현
 */
export const imageService = {
  /**
   * 상품 이미지 업로드
   * POST /api/images/products
   */
  uploadProductImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/images/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 프로필 이미지 업로드
   * POST /api/images/profile
   */
  uploadProfileImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/images/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 코스 이미지 업로드
   * POST /api/images/courses
   */
  uploadCourseImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/images/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 장소 이미지 업로드
   * POST /api/images/places
   */
  uploadPlaceImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/images/places', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 일반 이미지 업로드
   * POST /api/images/general
   */
  uploadGeneralImage: async (file: File, folder: string = 'general'): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/images/general', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 이미지 삭제
   * DELETE /api/images
   */
  deleteImage: async (imageUrl: string): Promise<ImageUploadResponse> => {
    const response = await api.delete('/images', {
      params: { imageUrl }
    });
    return response.data;
  },
};