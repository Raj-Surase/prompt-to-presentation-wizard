import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the Topic interface
interface Topic {
  title: string;
  points?: string[];
  content?: string;
  index?: number;
}

interface PresentationContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  topics: any; // Using any type to accommodate different response structures
  setTopics: (topics: any) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  processPrompt: (prompt: string) => Promise<void>;
  handleExport: () => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export const usePresentationContext = () => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentationContext must be used within a PresentationProvider');
  }
  return context;
};

export const PresentationProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [topics, setTopics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [presentationId, setPresentationId] = useState<number | null>(null);

  // This is no longer used directly as API calls are handled in the components
  const processPrompt = async (inputPrompt: string) => {
    setPrompt(inputPrompt);
    // The PromptInput component now handles API calls directly
  };

  const handleExport = () => {
    // This is now handled in the PresentationViewer component
    console.log("Export button clicked");
  };

  return (
    <PresentationContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        prompt,
        setPrompt,
        topics,
        setTopics,
        isLoading,
        setIsLoading,
        processPrompt,
        handleExport
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};
