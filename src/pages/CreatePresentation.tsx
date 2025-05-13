
import React, { useState } from 'react';
import { usePresentationContext } from '@/context/PresentationContext';
import PromptInput from '@/components/PromptInput';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const CreatePresentation = () => {
  const { setIsLoading } = usePresentationContext();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreatePresentation = async (response: any) => {
    try {
      // If we receive a successful response with an ID, redirect to edit page
      if (response && response.id) {
        navigate('/edit', { state: { presentationId: response.id } });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error handling presentation creation:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-bg flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-black">
            Presentation AI
          </h1>
          <p className="text-gray-700 max-w-md mx-auto">
            Transform your ideas into stunning presentations with AI assistance
          </p>
        </div>
        
        {error && (
          <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm mb-6 max-w-xl">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <PromptInput onSubmit={handleCreatePresentation} isLoading={false} />
      </div>
    </div>
  );
};

export default CreatePresentation;
