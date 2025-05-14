import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Presentation,
  getUserPresentations,
  getPresentationDetails,
  generatePresentation,
  PresentationResponse,
  GenerateResponse
} from '@/lib/presentationService';

interface UsePresentationsResult {
  presentations: Presentation[];
  loading: boolean;
  error: string | null;
  fetchPresentations: () => Promise<void>;
  generateNewPresentation: (
    prompt: string,
    numSlides?: number,
    language?: string
  ) => Promise<GenerateResponse>;
  getPresentationById: (id: number) => Promise<PresentationResponse>;
}

export function usePresentations(): UsePresentationsResult {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPresentations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserPresentations();
      setPresentations(data);
    } catch (err: any) {
      console.error('Error fetching presentations:', err);
      setError(err?.response?.data?.error || 'Failed to load presentations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, [user]);

  const generateNewPresentation = async (
    prompt: string,
    numSlides: number = 12,
    language: string = 'English'
  ): Promise<GenerateResponse> => {
    try {
      setLoading(true);
      const response = await generatePresentation(prompt, numSlides, language);
      // Refresh presentations list after generation starts
      await fetchPresentations();
      return response;
    } catch (err: any) {
      console.error('Error generating presentation:', err);
      const errorMessage = err?.response?.data?.error || 'Failed to generate presentation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPresentationById = async (id: number): Promise<PresentationResponse> => {
    try {
      return await getPresentationDetails(id);
    } catch (err: any) {
      console.error(`Error fetching presentation ${id}:`, err);
      const errorMessage = err?.response?.data?.error || 'Failed to fetch presentation details';
      throw new Error(errorMessage);
    }
  };

  return {
    presentations,
    loading,
    error,
    fetchPresentations,
    generateNewPresentation,
    getPresentationById
  };
} 