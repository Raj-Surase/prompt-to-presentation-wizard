import React, { useEffect, useState } from 'react';
import { usePresentationContext } from '@/context/PresentationContext';
import { useAuth } from '@/context/AuthContext';
import PresentationTopicEditor from '@/components/PresentationTopicEditor';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from "lucide-react";

interface SlideTitle {
  index: number;
  title: string;
}

const EditTopics = () => {
  const { topics, setTopics, isLoading, setIsLoading } = usePresentationContext();
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [presentationId, setPresentationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading presentation data...');
  const [slideTitles, setSlideTitles] = useState<SlideTitle[]>([]);

  useEffect(() => {
    // Check if we have a presentation ID from the previous step
    if (location.state?.presentationId) {
      setPresentationId(location.state.presentationId);
      fetchPresentationStatus(location.state.presentationId);
    }
  }, [location.state]);

  const fetchPresentationStatus = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/presentations/${id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch presentation data');
      }
      
      const data = await response.json();
      
      // If the presentation is still generating, poll for updates
      if (data.status === 'pending') {
        setLoadingMessage('Your presentation is being prepared. Please wait...');
        setTimeout(() => fetchPresentationStatus(id), 2000); // Poll every 2 seconds
        return;
      } else if (data.status === 'generating_ppt') {
        setLoadingMessage('Creating PowerPoint presentation...');
        setTimeout(() => fetchPresentationStatus(id), 2000); // Poll every 2 seconds
        return;
      } else if (data.status === 'modifying_ppt') {
        setLoadingMessage('Updating your presentation...');
        setTimeout(() => fetchPresentationStatus(id), 2000); // Poll every 2 seconds
        return;
      } else if (data.status === 'failed') {
        throw new Error(data.error_message || 'Presentation generation failed');
      } else if (data.status === 'completed') {
        // Once completed, set the presentation data and stop polling
        if (data.current_response) {
          const responseData = typeof data.current_response === 'string' 
            ? JSON.parse(data.current_response) 
            : data.current_response;
          
          // Extract slide titles from the response
          extractSlideTitles(responseData);
          
          // Store the full response data
          setTopics(responseData);
          setIsLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching presentation status:', err);
      setIsLoading(false);
    }
  };

  // Extract titles from the slides array in the API response
  const extractSlideTitles = (responseData: any) => {
    if (!responseData || !responseData.slides || !Array.isArray(responseData.slides)) {
      console.error('Invalid response data format', responseData);
      return;
    }

    const titles = responseData.slides.map((slide: any, index: number) => {
      // Get the title based on layout type
      let title = 'Untitled Slide';
      
      if (slide.placeholders) {
        if (slide.layout === 0 && slide.placeholders["presentation-topic"]) {
          title = slide.placeholders["presentation-topic"];
        } else if (slide.placeholders["title"]) {
          title = slide.placeholders["title"];
        }
      }
      
      return {
        index,
        title
      };
    });

    setSlideTitles(titles);
  };

  const handleProceed = (updatedTopics: any) => {
    if (!presentationId) return;
    
    try {
      // Create the updated order payload based on the order of slideTitles
      const newOrder = updatedTopics.map((topic: SlideTitle) => topic.index);
      
      // Call the API to update the slide order
      updateSlideOrder(presentationId, newOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const updateSlideOrder = async (id: number, newOrder: number[]) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Updating presentation structure...');
      
      const response = await fetch(`/api/presentations/${id}/structure`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          order: newOrder
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update presentation structure');
      }
      
      const data = await response.json();
      navigate('/preview', { state: { presentationId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update presentation structure');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-black">
          Presentation AI
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Transform your ideas into stunning presentations with AI assistance
        </p>
      </div>
      
      {isLoading ? (
        <div className="bg-white border border-gray-300 rounded-xl p-8 mb-5 w-full max-w-2xl flex flex-col items-center shadow-md">
          <div className="flex justify-center mb-4">
            <Loader2 size={40} className="animate-spin text-black" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-black">{loadingMessage}</h2>
          <p className="text-gray-600 text-center max-w-md">
            This process may take up to a minute to complete. Please be patient while we generate your presentation.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="text-red-500 bg-red-50 border border-red-300 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <PresentationTopicEditor 
            initialTopics={slideTitles}
            onProceed={handleProceed}
            isLoading={isLoading}
            presentationId={presentationId}
          />
        </>
      )}
    </div>
  );
};

export default EditTopics;
