import { useState, useCallback } from 'react';
import type { FormDataState, ImageResult } from '../types';
import { useApi } from '../contexts/ApiContext';
import { useTranslation } from '../contexts/TranslationContext';
import { handleError, logError, ErrorType } from '../utils/errorHandler';

interface UseImageGenerationReturn {
  generateImages: (formData: FormDataState) => Promise<ImageResult[]>;
  isLoading: boolean;
  error: string | null;
  images: ImageResult[];
  setImages: React.Dispatch<React.SetStateAction<ImageResult[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Hook for managing image generation
 */
export const useImageGeneration = (): UseImageGenerationReturn => {
  const api = useApi();
  const { translateShotLabel, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageResult[]>([]);

  const generateImages = useCallback(
    async (formData: FormDataState): Promise<ImageResult[]> => {
      setIsLoading(true);
      setError(null);
      setImages([]);

      try {
        const shotLabels = {
          fullBody: translateShotLabel('fullBody'),
          medium: translateShotLabel('medium'),
          closeUp: translateShotLabel('closeUp'),
        };

        const generatedImages = await api.generateImages(formData, shotLabels);
        setImages(generatedImages);
        return generatedImages;
      } catch (err) {
        const appError = handleError(err);
        logError(appError, 'Image Generation');
        // 使用更具體的錯誤訊息，如果沒有則使用通用訊息
        const errorMessage = appError.userMessage || appError.message || t.errors.general;
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api, translateShotLabel, t]
  );

  return {
    generateImages,
    isLoading,
    error,
    images,
    setImages,
    setError,
  };
};

