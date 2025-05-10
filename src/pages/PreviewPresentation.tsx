
import React from 'react';
import { usePresentationContext } from '@/context/PresentationContext';
import PresentationViewer from '@/components/PresentationViewer';

const PreviewPresentation = () => {
  const { topics, handleExport } = usePresentationContext();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <PresentationViewer 
        topics={topics} 
        onExport={handleExport} 
      />
    </div>
  );
};

export default PreviewPresentation;
