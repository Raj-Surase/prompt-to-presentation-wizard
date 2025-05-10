
import React from 'react';
import { usePresentationContext } from '@/context/PresentationContext';
import PresentationTopicEditor from '@/components/PresentationTopicEditor';
import { useNavigate } from 'react-router-dom';

const EditTopics = () => {
  const { topics, setTopics, isLoading } = usePresentationContext();
  const navigate = useNavigate();

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
      
      <PresentationTopicEditor 
        initialTopics={topics}
        onProceed={(updatedTopics) => {
          setTopics(updatedTopics);
          navigate('/preview');
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditTopics;
