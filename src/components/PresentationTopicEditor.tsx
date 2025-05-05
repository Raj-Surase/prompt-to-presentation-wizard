
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, PlusCircle, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export interface Topic {
  title: string;
  points: string[];
  id?: string; // Add id for drag and drop
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
  // Ensure topics have unique IDs
  const [topics, setTopics] = useState<Topic[]>(() => 
    initialTopics.map((topic, index) => ({
      ...topic,
      id: topic.id || `topic-${index}-${Date.now()}`,
    }))
  );

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

  const addSlide = () => {
    const newSlide: Topic = {
      title: "New Slide",
      points: [""],
      id: `topic-${topics.length}-${Date.now()}`,
    };
    setTopics([...topics, newSlide]);
  };

  // Handle drag and drop of points within a topic
  const handlePointDragEnd = (result: DropResult, topicIndex: number) => {
    if (!result.destination) return;
    
    const newTopics = [...topics];
    const points = [...newTopics[topicIndex].points];
    const [movedPoint] = points.splice(result.source.index, 1);
    points.splice(result.destination.index, 0, movedPoint);
    
    newTopics[topicIndex].points = points;
    setTopics(newTopics);
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
    onProceed(topics);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 gradient-text">Edit Your Presentation Topics</h2>
        <p className="text-muted-foreground">Customize the topics and points for your slides</p>
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
                            className="w-full rounded-input"
                            value={topic.title}
                            onChange={(e) => updateTopicTitle(topicIndex, e.target.value)}
                            placeholder="Slide title"
                          />
                        </div>
                        
                        <DragDropContext onDragEnd={(result) => handlePointDragEnd(result, topicIndex)}>
                          <Droppable droppableId={`topic-${topicIndex}-points`}>
                            {(provided) => (
                              <div 
                                className="space-y-2"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {topic.points.map((point, pointIndex) => (
                                  <Draggable 
                                    key={`point-${topicIndex}-${pointIndex}`}
                                    draggableId={`point-${topicIndex}-${pointIndex}`}
                                    index={pointIndex}
                                  >
                                    {(provided) => (
                                      <div 
                                        className="flex gap-2 items-center"
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                      >
                                        <div 
                                          className="cursor-move p-1 hover:bg-white/5 rounded"
                                          {...provided.dragHandleProps}
                                        >
                                          <GripVertical size={16} />
                                        </div>
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
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addPoint(topicIndex)} 
                          className="mt-4 text-sm flex items-center gap-1"
                        >
                          <PlusCircle size={16} /> Add Point
                        </Button>
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
