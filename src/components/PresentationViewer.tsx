
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Download } from "lucide-react";
import { Topic } from './PresentationTopicEditor';
import { Separator } from "@/components/ui/separator";

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

  const selectSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="w-full max-w-6xl flex flex-col space-y-6">
      {/* App Bar */}
      <div className="w-full flex justify-between items-center bg-black p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold gradient-text">Presentation AI</h1>
        </div>
        <Button 
          onClick={onExport} 
          className="bg-accent hover:bg-accent/80 flex gap-2 items-center"
        >
          <Download size={16} /> Export Presentation
        </Button>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-6">
        {/* Left panel - Slide sequence (30% width) */}
        <div className="w-full md:w-[30%] bg-black p-4 rounded-lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Slide Sequence</h3>
            <p className="text-sm text-muted-foreground">
              {topics.length} slides in presentation
            </p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-none">
            {topics.map((topic, index) => (
              <div
                key={`slide-${index}`}
                className={`p-4 glass-panel cursor-pointer transition-all ${
                  index === currentSlide 
                    ? "border-accent border-2" 
                    : "border-white/5 hover:border-white/20"
                }`}
                onClick={() => selectSlide(index)}
              >
                <div className="flex items-start">
                  <span className="bg-accent/20 text-white px-2 py-1 rounded-md mr-2 text-xs">
                    {index + 1}
                  </span>
                  <h4 className="font-medium truncate">{topic.title}</h4>
                </div>
                <div className="mt-2 pl-8">
                  <p className="text-xs text-muted-foreground">
                    {topic.points.length} points
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator orientation="vertical" className="h-auto hidden md:block" />

        {/* Right panel - Slide preview (70% width) */}
        <div className="w-full md:w-[70%] flex flex-col bg-[#222222] rounded-lg p-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2 gradient-text">Presentation Preview</h2>
            <p className="text-muted-foreground">
              Slide {currentSlide + 1} of {topics.length}
            </p>
          </div>
          
          <Card className="w-full aspect-[16/9] flex items-center justify-center mb-6 flex-grow bg-black border border-white/10">
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
        </div>
      </div>
    </div>
  );
};

export default PresentationViewer;
