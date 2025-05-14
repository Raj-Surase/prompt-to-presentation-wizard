import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowDown, ArrowUp, Trash, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  index: number;
  title: string;
}

interface PresentationTopicEditorProps {
  initialTopics: Slide[];
  onProceed: (updatedTopics: Slide[]) => void;
  isLoading: boolean;
  presentationId?: number;
}

const PresentationTopicEditor: React.FC<PresentationTopicEditorProps> = ({ 
  initialTopics, 
  onProceed, 
  isLoading,
  presentationId
}) => {
  const [topics, setTopics] = useState<Slide[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading presentation structure...');
  const navigate = useNavigate();

  useEffect(() => {
    if (initialTopics && initialTopics.length > 0) {
      setTopics(initialTopics);
    }
  }, [initialTopics]);

  const updateTopicTitle = (index: number, title: string) => {
    const newTopics = [...topics];
    const topicIndex = newTopics.findIndex(topic => topic.index === index);
    if (topicIndex !== -1) {
      newTopics[topicIndex].title = title;
      setTopics(newTopics);
    }
  };

  const moveTopicUp = (index: number) => {
    if (index <= 0 || index >= topics.length) return;
    const newTopics = [...topics];
    [newTopics[index - 1], newTopics[index]] = [newTopics[index], newTopics[index - 1]];
    setTopics(newTopics);
  };

  const moveTopicDown = (index: number) => {
    if (index < 0 || index >= topics.length - 1) return;
    const newTopics = [...topics];
    [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
    setTopics(newTopics);
  };

  const deleteTopic = (arrayIndex: number) => {
    if (topics.length <= 1) {
      setError('Presentation must have at least one slide');
      return;
    }
    const newTopics = topics.filter((_, i) => i !== arrayIndex);
    setTopics(newTopics);
  };

  const handleSubmit = async () => {
    if (topics.length === 0) {
      setError('No topics to proceed with');
      return;
    }

    try {
      setError(null);
      setIsUpdating(true);
      onProceed(topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error updating presentation:', err);
      setIsUpdating(false);
    }
  };

  if (isLoading || isUpdating) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 size={32} className="animate-spin text-accent" />
          </div>
          <p className="text-lg font-medium mb-2">{loadingMessage}</p>
          <p className="text-sm text-muted-foreground">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No slides available</p>
          <p className="text-sm text-muted-foreground">Please try again or create a new presentation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-black border border-border rounded-xl p-5 mb-5">
        <h2 className="bg-accent text-xl font-bold mb-3">Edit Presentation Structure</h2>
        <p className="text-muted-foreground mb-4">
          Reorder slides, edit titles, or remove unwanted slides before generating your presentation.
        </p>
        
        {error && (
          <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-3 mb-5">
          {topics.map((topic, arrayIndex) => (
            <Card key={arrayIndex} className="p-3 bg-black/40 border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                {arrayIndex + 1}
              </div>
              <Input
                value={topic.title}
                onChange={(e) => updateTopicTitle(topic.index, e.target.value)}
                className="flex-1 border-border bg-black/50"
              />
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => moveTopicUp(arrayIndex)}
                  disabled={arrayIndex === 0}
                  className="h-8 w-8"
                >
                  <ArrowUp size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => moveTopicDown(arrayIndex)}
                  disabled={arrayIndex === topics.length - 1}
                  className="h-8 w-8"
                >
                  <ArrowDown size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteTopic(arrayIndex)}
                  disabled={topics.length <= 1}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100/10"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={topics.length === 0}
          className="w-full bg-accent hover:bg-accent/80 h-12"
        >
          <span className="flex items-center gap-2">
            Proceed to Preview <ArrowRight size={16} />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default PresentationTopicEditor;
