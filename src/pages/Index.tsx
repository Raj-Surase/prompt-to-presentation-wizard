
import React from 'react';
import { usePresentationContext } from '@/context/PresentationContext';
import PromptInput from '@/components/PromptInput';
import PresentationTopicEditor from '@/components/PresentationTopicEditor';
import PresentationViewer from '@/components/PresentationViewer';

const Index = () => {
  const { 
    currentStep, 
    setCurrentStep,
    topics, 
    setTopics,
    isLoading,
    processPrompt,
    handleExport
  } = usePresentationContext();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PromptInput 
            onSubmit={processPrompt} 
            isLoading={isLoading} 
          />
        );
      case 1:
        return (
          <PresentationTopicEditor 
            initialTopics={topics}
            onProceed={(updatedTopics) => {
              setTopics(updatedTopics);
              setCurrentStep(2);
            }}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <PresentationViewer 
            topics={topics} 
            onExport={handleExport} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${currentStep !== 2 ? 'mesh-gradient' : 'bg-background'} flex flex-col items-center justify-center px-4 py-12`}>
      {currentStep !== 2 && (
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
            Presentation AI
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Transform your ideas into stunning presentations with AI assistance
          </p>
        </div>
      )}
      
      {renderStep()}
    </div>
  );
};

export default Index;
