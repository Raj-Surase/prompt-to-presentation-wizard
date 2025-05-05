
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Download } from "lucide-react";
import { Topic } from './PresentationTopicEditor';

interface PresentationViewerProps {
  topics: Topic[];
  onExport: () => void;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({ topics, onExport }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < topics.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Presentation Preview</h2>
        <p className="text-muted-foreground">
          Slide {currentSlide + 1} of {topics.length}
        </p>
      </div>
      
      <Card className="glass-panel w-full aspect-[16/9] flex items-center justify-center mb-6">
        <CardContent className="p-10 w-full h-full flex flex-col">
          <h2 className="text-3xl font-bold mb-6 gradient-text">
            {topics[currentSlide].title}
          </h2>
          <ul className="space-y-4 list-disc pl-6">
            {topics[currentSlide].points.map((point, index) => (
              <li key={index} className="text-xl animate-enter" style={{ animationDelay: `${index * 0.1}s` }}>
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <div className="flex justify-between w-full mb-6">
        <Button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          variant="outline"
          className="flex gap-2 items-center"
        >
          <ArrowLeft size={16} /> Previous
        </Button>
        
        <Button 
          onClick={nextSlide}
          disabled={currentSlide === topics.length - 1}
          variant="outline"
          className="flex gap-2 items-center"
        >
          Next <ArrowRight size={16} />
        </Button>
      </div>
      
      <Button 
        onClick={onExport} 
        className="bg-accent hover:bg-accent/80 flex gap-2 items-center"
      >
        <Download size={16} /> Export Presentation
      </Button>
    </div>
  );
};

export default PresentationViewer;
