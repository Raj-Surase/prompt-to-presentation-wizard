import api from './api';

export interface Presentation {
  id: number;
  prompt: string;
  number_of_slides: number;
  language: string;
  status: string;
  ppt_filename: string;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PresentationResponse {
  id: number;
  prompt: string;
  number_of_slides: number;
  language: string;
  current_response: any | null;
  status: string;
  ppt_filename: string;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GenerateResponse {
  id: number;
  status: string;
}

export interface SlideStructure {
  index: number;
  title: string;
}

// Get all presentations for authenticated user
export const getUserPresentations = async (): Promise<Presentation[]> => {
  try {
    const response = await api.get<{ presentations: Presentation[] }>('/api/presentations');
    return response.data.presentations;
  } catch (error) {
    console.error('Failed to fetch presentations:', error);
    throw error;
  }
};

// Generate a new presentation
export const generatePresentation = async (
  prompt: string,
  number_of_slides: number = 12,
  language: string = 'English'
): Promise<GenerateResponse> => {
  try {
    const response = await api.post<GenerateResponse>('/api/generate', {
      prompt,
      number_of_slides,
      language
    });
    return response.data;
  } catch (error) {
    console.error('Failed to generate presentation:', error);
    throw error;
  }
};

// Get presentation details
export const getPresentationDetails = async (id: number): Promise<PresentationResponse> => {
  try {
    const response = await api.get<PresentationResponse>(`/api/presentations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch presentation ${id}:`, error);
    throw error;
  }
};

// Modify an existing presentation
export const modifyPresentation = async (
  id: number,
  changes: Record<string, any>
): Promise<GenerateResponse> => {
  try {
    const response = await api.post<GenerateResponse>(`/api/modify/${id}`, { changes });
    return response.data;
  } catch (error) {
    console.error(`Failed to modify presentation ${id}:`, error);
    throw error;
  }
};

// Get presentation slide structure
export const getPresentationStructure = async (id: number): Promise<SlideStructure[]> => {
  try {
    const response = await api.get<{ structure: SlideStructure[] }>(`/api/presentations/${id}/structure`);
    return response.data.structure;
  } catch (error) {
    console.error(`Failed to fetch presentation structure ${id}:`, error);
    throw error;
  }
};

// Update slide order
export const updateSlideOrder = async (
  id: number,
  order: number[]
): Promise<GenerateResponse> => {
  try {
    const response = await api.put<GenerateResponse>(`/api/presentations/${id}/structure`, { order });
    return response.data;
  } catch (error) {
    console.error(`Failed to update slide order for presentation ${id}:`, error);
    throw error;
  }
};

// Update slide content
export const updateSlideContent = async (
  id: number,
  slideIndex: number,
  placeholders: Record<string, any>
): Promise<GenerateResponse> => {
  try {
    const response = await api.put<GenerateResponse>(`/api/presentations/${id}/slides/${slideIndex}`, { placeholders });
    return response.data;
  } catch (error) {
    console.error(`Failed to update slide ${slideIndex} for presentation ${id}:`, error);
    throw error;
  }
};

// Get download URL for presentation
export const getDownloadUrl = (id: number): string => {
  // Return the full URL for downloading
  return `${api.defaults.baseURL}/api/download/${id}`;
};

// Get export URL for presentation
export const getExportUrl = (id: number, format: 'pptx' | 'pdf'): string => {
  return `${api.defaults.baseURL}/api/export/${id}/${format}`;
};

// Download presentation directly (alternative to opening in new window)
export const downloadPresentation = async (id: number): Promise<Blob> => {
  try {
    // Use API client to get an authenticated response with the file
    const response = await api.get<Blob>(`/api/download/${id}`, {
      responseType: 'blob',
    });
    return new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });
  } catch (error) {
    console.error(`Failed to download presentation ${id}:`, error);
    throw error;
  }
};

// Export presentation to specific format
export const exportPresentation = async (id: number, format: 'pptx' | 'pdf'): Promise<Blob> => {
  try {
    // Use API client to get an authenticated response with the file
    const response = await api.get<Blob>(`/api/export/${id}/${format}`, {
      responseType: 'blob',
    });
    return new Blob([response.data], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    });
  } catch (error) {
    console.error(`Failed to export presentation ${id} to ${format}:`, error);
    throw error;
  }
};

// Helper function to format the status for display
export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'pending':
    case 'generating':
    case 'processing':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}; 