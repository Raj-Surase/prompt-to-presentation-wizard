
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, PlusCircle, GripVertical, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Textarea } from "@/components/ui/textarea";

export interface Topic {
  title: string;
  points: string[];
  id?: string; // Add id for drag and drop
  content?: string; // New field for single textfield content
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
  // Ensure topics have unique IDs and initialize content field
  const [topics, setTopics] = useState<Topic[]>(() => 
    initialTopics.map((topic, index) => ({
      ...topic,
      id: topic.id || `topic-${index}-${Date.now()}`,
      content: topic.points?.join('\n') || "" // Initialize content from points
    }))
  );

  const updateTopicTitle = (index: number, newTitle: string) => {
    const newTopics = [...topics];
    newTopics[index].title = newTitle;
    setTopics(newTopics);
  };

  const updateTopicContent = (index: number, newContent: string) => {
    const newTopics = [...topics];
    newTopics[index].content = newContent;
    // Also update points by splitting content by new lines
    newTopics[index].points = newContent.split('\n').filter(line => line.trim() !== '');
    setTopics(newTopics);
  };

  const addSlide = () => {
    const newSlide: Topic = {
      title: "New Slide",
      points: [""],
      content: "",
      id: `topic-${topics.length}-${Date.now()}`,
    };
    setTopics([...topics, newSlide]);
  };

  const removeSlide = (topicIndex: number) => {
    if (topics.length > 1) {
      const newTopics = [...topics];
      newTopics.splice(topicIndex, 1);
      setTopics(newTopics);
    }
  };

  // Handle drag and drop of topics
  const handleTopicDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = [...topics];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTopics(items);
  };

  const handleSubmit = () => {
    // Ensure points are properly set from content before proceeding
    const finalTopics = topics.map(topic => ({
      ...topic,
      points: topic.content ? topic.content.split('\n').filter(line => line.trim() !== '') : topic.points
    }));
    onProceed(finalTopics);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Edit Your Presentation Topics</h2>
        <p className="text-muted-foreground">Customize the topics and content for your slides</p>
      </div>
      
      <DragDropContext onDragEnd={handleTopicDragEnd}>
        <Droppable droppableId="topics">
          {(provided) => (
            <div 
              className="space-y-6 mb-6" 
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {topics.map((topic, topicIndex) => (
                <Draggable key={topic.id} draggableId={topic.id || `topic-${topicIndex}`} index={topicIndex}>
                  {(provided) => (
                    <Card 
                      className="glass-panel"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center mb-4">
                          <div 
                            className="mr-2 cursor-move p-2 hover:bg-white/5 rounded"
                            {...provided.dragHandleProps}
                          >
                            <GripVertical size={18} />
                          </div>
                          <input
                            type="text"
                            className="w-full rounded-input border border-white/30 bg-transparent"
                            value={topic.title}
                            onChange={(e) => updateTopicTitle(topicIndex, e.target.value)}
                            placeholder="Slide title"
                          />
                          {topics.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="ml-2 text-destructive hover:bg-destructive/20 hover:text-destructive"
                              onClick={() => removeSlide(topicIndex)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          )}
                        </div>
                        
                        {/* Single text area for slide content */}
                        <Textarea
                          className="w-full border border-white/20 bg-transparent p-2 rounded min-h-32 resize-vertical"
                          value={topic.content}
                          onChange={(e) => updateTopicContent(topicIndex, e.target.value)}
                          placeholder="Enter slide content here. Each line will become a bullet point in your presentation."
                        />
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={addSlide} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} /> Add Slide
        </Button>
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
