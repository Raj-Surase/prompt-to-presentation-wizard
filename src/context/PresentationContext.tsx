
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Topic } from '@/components/PresentationTopicEditor';

// Mock data for demonstration - this would be replaced with real AI processing
const mockProcessPrompt = async (prompt: string): Promise<Topic[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simple mock response based on the prompt
  const topics = [
    {
      title: "Introduction to " + prompt,
      points: [
        "Overview of key concepts",
        "Why this topic matters",
        "Goals of this presentation"
      ]
    },
    {
      title: "Key Components",
      points: [
        "Component 1: Core features",
        "Component 2: Implementation strategy",
        "Component 3: Benefits and advantages"
      ]
    },
    {
      title: "Real World Applications",
      points: [
        "Case study 1: Success story",
        "Case study 2: Challenges and solutions",
        "Future opportunities"
      ]
    },
    {
      title: "Conclusion",
      points: [
        "Summary of key points",
        "Next steps and recommendations",
        "Q&A and discussion"
      ]
    }
  ];
  
  return topics;
};

interface PresentationContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
  isLoading: boolean;
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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const processPrompt = async (inputPrompt: string) => {
    setPrompt(inputPrompt);
    setIsLoading(true);
    try {
      // In a real app, this would call an AI service to process the prompt
      const generatedTopics = await mockProcessPrompt(inputPrompt);
      setTopics(generatedTopics);
      setCurrentStep(1); // Move to topic editor step
    } catch (error) {
      console.error("Error processing prompt:", error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // This is now handled by the ExportModal component
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
        processPrompt,
        handleExport
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};
