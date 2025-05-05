
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export interface Topic {
  title: string;
  points: string[];
}

interface PresentationTopicEditorProps {
  initialTopics: Topic[];
  onProceed: (topics: Topic[]) => void;
  isLoading?: boolean;
}

const PresentationTopicEditor: React.FC<PresentationTopicEditorProps> = ({ 
  initialTopics, 
  onProceed,
  isLoading = false
}) => {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);

  const updateTopicTitle = (index: number, newTitle: string) => {
    const newTopics = [...topics];
    newTopics[index].title = newTitle;
    setTopics(newTopics);
  };

  const updateTopicPoint = (topicIndex: number, pointIndex: number, newPoint: string) => {
    const newTopics = [...topics];
    newTopics[topicIndex].points[pointIndex] = newPoint;
    setTopics(newTopics);
  };

  const addPoint = (topicIndex: number) => {
    const newTopics = [...topics];
    newTopics[topicIndex].points.push("");
    setTopics(newTopics);
  };

  const removePoint = (topicIndex: number, pointIndex: number) => {
    const newTopics = [...topics];
    newTopics[topicIndex].points.splice(pointIndex, 1);
    setTopics(newTopics);
  };

  const handleSubmit = () => {
    onProceed(topics);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Edit Your Presentation Topics</h2>
        <p className="text-muted-foreground">Customize the topics and points for your slides</p>
      </div>
      
      <div className="space-y-6 mb-6">
        {topics.map((topic, topicIndex) => (
          <Card key={topicIndex} className="glass-panel">
            <CardContent className="p-5">
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full bg-background/80 p-2 rounded border-border border mb-3 text-lg font-medium"
                  value={topic.title}
                  onChange={(e) => updateTopicTitle(topicIndex, e.target.value)}
                  placeholder="Slide title"
                />
                
                <div className="space-y-2">
                  {topic.points.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex gap-2">
                      <input
                        type="text"
                        className="w-full bg-background/50 p-2 rounded border-border/50 border"
                        value={point}
                        onChange={(e) => updateTopicPoint(topicIndex, pointIndex, e.target.value)}
                        placeholder="Add point"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removePoint(topicIndex, pointIndex)}
                        className="hover:bg-destructive/20"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => addPoint(topicIndex)} 
                  className="mt-2 text-sm"
                >
                  + Add Point
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full rounded-xl bg-accent hover:bg-accent/80 transition-all"
        disabled={isLoading}
      >
        <span className="flex items-center gap-2">
          Create Presentation <ArrowRight size={16} />
        </span>
      </Button>
    </div>
  );
};

export default PresentationTopicEditor;
