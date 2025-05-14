import React, { useEffect, useState } from 'react';
import { usePresentationContext } from '@/context/PresentationContext';
import PresentationTopicEditor from '@/components/PresentationTopicEditor';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import { 
  getPresentationDetails, 
  getPresentationStructure, 
  updateSlideOrder 
} from '@/lib/presentationService';

interface SlideTitle {
  index: number;
  title: string;
}

const EditTopics = () => {
  const { topics, setTopics, isLoading, setIsLoading } = usePresentationContext();
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
      
      const data = await getPresentationDetails(id);
      
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
        // Once completed, fetch the structure data
        await fetchPresentationStructure(id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching presentation status:', err);
      setIsLoading(false);
    }
  };

  // Fetch the structure endpoint for slide titles
  const fetchPresentationStructure = async (id: number) => {
    try {
      setLoadingMessage('Loading presentation structure...');
      
      // Use the service function to get structure with auth token
      const structure = await getPresentationStructure(id);
      
      // Set slide titles from the structure
      setSlideTitles(structure);
      
      // Also fetch the full presentation data to store it in context
      await fetchFullPresentationData(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load presentation structure');
      console.error('Error fetching presentation structure:', err);
      setIsLoading(false);
    }
  };

  // Fetch the full presentation data for context
  const fetchFullPresentationData = async (id: number) => {
    try {
      const data = await getPresentationDetails(id);
      
      if (data.current_response) {
        const responseData = typeof data.current_response === 'string' 
          ? JSON.parse(data.current_response) 
          : data.current_response;
        
        // Store the full response data in context
        setTopics(responseData);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching full presentation data:', err);
      // Don't set error here as we've already got the structure data
    }
  };

  const handleProceed = (updatedTopics: SlideTitle[]) => {
    if (!presentationId) return;
    
    try {
      // Create the updated order payload based on the order of slideTitles
      const newOrder = updatedTopics.map((topic: SlideTitle) => topic.index);
      
      // Call the API to update the slide order
      updateSlideOrder(presentationId, newOrder)
        .then(() => {
          // Navigate to preview with presentation ID
          navigate('/preview', { state: { presentationId } });
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to update presentation structure');
          setIsLoading(false);
        });
      
      // Show loading state while updating
      setIsLoading(true);
      setLoadingMessage('Updating presentation structure...');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
          Presentation AI
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Transform your ideas into stunning presentations with AI assistance
        </p>
      </div>
      
      {isLoading ? (
        <div className="bg-black/60 border border-border rounded-xl p-8 mb-5 w-full max-w-2xl flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <Loader2 size={40} className="animate-spin text-accent" />
          </div>
          <h2 className="text-xl font-bold mb-2">{loadingMessage}</h2>
          <p className="text-muted-foreground text-center max-w-md">
            This process may take up to a minute to complete. Please be patient while we generate your presentation.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
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
