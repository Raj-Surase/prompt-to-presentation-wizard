import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Download, Edit, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { usePresentationContext } from '@/context/PresentationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface PresentationViewerProps {
  topics: any;
  onExport: () => void;
  presentationId?: number | null;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({ topics, onExport, presentationId }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presentationData, setPresentationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading your presentation...');
  const [editMode, setEditMode] = useState(false);
  const [editedSlide, setEditedSlide] = useState<any>(null);

  useEffect(() => {
    if (topics) {
      setPresentationData(topics);
      
      if (presentationId) {
        setExportUrl(`/api/download/${presentationId}`);
      }
    }
  }, [topics, presentationId]);

  const handleDownload = () => {
    if (exportUrl) {
      window.open(exportUrl, '_blank');
    }
  };

  const handleEditSlide = () => {
    if (presentationData && presentationData.slides && presentationData.slides[currentSlideIndex]) {
      setEditedSlide({
        ...presentationData.slides[currentSlideIndex],
        placeholders: { ...presentationData.slides[currentSlideIndex].placeholders }
      });
      setEditMode(true);
    }
  };

  const handleSaveSlide = async () => {
    if (!presentationId || !editedSlide) return;
    
    try {
      setIsSaving(true);
      
      // Create a copy of the presentation data
      const updatedPresentationData = { ...presentationData };
      
      // Update the current slide with edited content
      updatedPresentationData.slides[currentSlideIndex] = editedSlide;
      
      // Call the API to update the slide
      const response = await fetch(`/api/presentations/${presentationId}/slides/${currentSlideIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeholders: editedSlide.placeholders
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update slide');
      }
      
      // Update the local state with the edited data
      setPresentationData(updatedPresentationData);
      setEditMode(false);
      setIsSaving(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error saving slide:', err);
      setIsSaving(false);
    }
  };

  const updateEditedPlaceholder = (key: string, value: string) => {
    if (!editedSlide) return;
    setEditedSlide({
      ...editedSlide,
      placeholders: {
        ...editedSlide.placeholders,
        [key]: value
      }
    });
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedSlide(null);
  };

  const nextSlide = () => {
    if (presentationData && presentationData.slides) {
      if (currentSlideIndex < presentationData.slides.length - 1) {
        setCurrentSlideIndex(currentSlideIndex + 1);
        setEditMode(false);
      }
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setEditMode(false);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < (presentationData?.slides?.length || 0)) {
      setCurrentSlideIndex(index);
      setEditMode(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Loader2 size={40} className="animate-spin text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{loadingMessage}</h2>
          <p className="text-muted-foreground">This may take up to a minute to complete</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  // No presentation data
  if (!presentationData || !presentationData.slides || presentationData.slides.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="bg-black/60 border border-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">No Presentation Data</h2>
          <p className="text-muted-foreground mb-4">
            There's no presentation data available to display.
          </p>
        </div>
      </div>
    );
  }

  // Get current slide data
  const currentSlide = presentationData.slides[currentSlideIndex];
  const slideToDisplay = editMode ? editedSlide : currentSlide;
  const slidePlaceholders = slideToDisplay?.placeholders || {};
  const slideLayout = slideToDisplay?.layout || 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left panel - Slide structure */}
        <div className="md:col-span-1">
          <Card className="bg-white border-gray-300 h-full shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 text-black">Presentation Structure</h3>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {presentationData?.slides?.map((slide: any, index: number) => {
                  // Get title based on slide layout
                  let slideTitle = `Slide ${index + 1}`;
                  
                  if (slide.layout === 0 && slide.placeholders["presentation-topic"]) {
                    slideTitle = slide.placeholders["presentation-topic"];
                  } else if (slide.placeholders["title"]) {
                    slideTitle = slide.placeholders["title"];
                  }
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        p-2 rounded cursor-pointer transition-all
                        ${currentSlideIndex === index ? 'bg-gray-200 border-l-2 border-black' : 'bg-gray-100 hover:bg-gray-200'}
                      `}
                      onClick={() => goToSlide(index)}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center text-xs font-medium mr-2">
                          {index + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className="truncate text-sm font-medium text-black">{slideTitle}</p>
                          <p className="text-xs text-gray-500">
                            {slide.layout === 0 ? 'Title Slide' : 
                             slide.layout === 1 ? 'Content with Image' : 
                             slide.layout === 2 ? 'Content with Image' :
                             slide.layout === 3 ? 'Content' :
                             slide.layout === 4 ? 'Title Only' :
                             slide.layout === 5 ? 'Title with Image' :
                             slide.layout === 6 ? 'Two Column Content' :
                             slide.layout === 7 ? 'Comparison' :
                             slide.layout === 8 ? 'Image with Content' : 'Text Only'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Separator className="my-4 bg-gray-300" />
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 border-gray-300 text-black" 
                onClick={handleDownload}
                disabled={!exportUrl}
              >
                <Download size={16} /> Download Presentation
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right panel - Slide preview/editor */}
        <div className="md:col-span-3">
          <Card className="bg-white border-gray-300 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={prevSlide} 
                    disabled={currentSlideIndex === 0 || editMode}
                    size="sm"
                    className="border-gray-300 text-black"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <span className="text-sm py-2 px-1 text-black">
                    Slide {currentSlideIndex + 1} of {presentationData?.slides?.length || 0}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={nextSlide} 
                    disabled={currentSlideIndex === (presentationData?.slides?.length || 0) - 1 || editMode}
                    size="sm"
                    className="border-gray-300 text-black"
                  >
                    <ArrowRight size={16} />
                  </Button>
                </div>
                
                <div>
                  {editMode ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={cancelEdit}
                        size="sm"
                        className="border-gray-300 text-black"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveSlide}
                        size="sm"
                        disabled={isSaving}
                        className="bg-black hover:bg-black/80 text-white"
                      >
                        {isSaving ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleEditSlide}
                      size="sm"
                      className="bg-black hover:bg-black/80 text-white"
                    >
                      <Edit size={16} className="mr-2" /> Edit Slide
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="aspect-[16/9] border border-gray-300 rounded-lg overflow-hidden">
                {editMode ? (
                  // Edit Mode
                  <div className="h-full bg-gray-50 p-6 overflow-y-auto">
                    {slideLayout === 0 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block text-black">Title</label>
                          <Input
                            value={slidePlaceholders["presentation-topic"] || ''}
                            onChange={(e) => updateEditedPlaceholder("presentation-topic", e.target.value)}
                            className="bg-white border-gray-400 text-black"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block text-black">Subtitle</label>
                          <Input
                            value={slidePlaceholders["topic-subtitle"] || ''}
                            onChange={(e) => updateEditedPlaceholder("topic-subtitle", e.target.value)}
                            className="bg-white border-gray-400 text-black"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block text-black">Quote</label>
                          <Input
                            value={slidePlaceholders["quote"] || ''}
                            onChange={(e) => updateEditedPlaceholder("quote", e.target.value)}
                            className="bg-white border-gray-400 text-black"
                          />
                        </div>
                      </div>
                    )}
                    
                    {(slideLayout >= 1 && slideLayout <= 8 && slideLayout !== 4) && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block text-black">Title</label>
                          <Input
                            value={slidePlaceholders["title"] || ''}
                            onChange={(e) => updateEditedPlaceholder("title", e.target.value)}
                            className="bg-white border-gray-400 text-black"
                          />
                        </div>
                        
                        {/* Layout 1, 2, 6: Content */}
                        {(slideLayout === 1 || slideLayout === 2) && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-black">Content</label>
                            <Textarea
                              value={slidePlaceholders["content"] || ''}
                              onChange={(e) => updateEditedPlaceholder("content", e.target.value)}
                              className="bg-white border-gray-400 text-black min-h-[200px]"
                              placeholder="Use <bullet>Item</bullet> syntax for bullet points"
                            />
                          </div>
                        )}
                        
                        {/* Layout 2, 5, 8: Image */}
                        {(slideLayout === 2 || slideLayout === 5 || slideLayout === 8) && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-black">Image Path</label>
                            <Input
                              value={slidePlaceholders["image"] || ''}
                              onChange={(e) => updateEditedPlaceholder("image", e.target.value)}
                              className="bg-white border-gray-400 text-black"
                              placeholder="e.g., image.jpg"
                            />
                          </div>
                        )}
                        
                        {/* Layout 3: Body */}
                        {slideLayout === 3 && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-black">Body</label>
                            <Textarea
                              value={slidePlaceholders["body"] || ''}
                              onChange={(e) => updateEditedPlaceholder("body", e.target.value)}
                              className="bg-white border-gray-400 text-black min-h-[200px]"
                              placeholder="Use <bullet>Item</bullet> syntax for bullet points"
                            />
                          </div>
                        )}
                        
                        {/* Layout 6: Two content columns */}
                        {slideLayout === 6 && (
                          <>
                            <div>
                              <label className="text-sm font-medium mb-1 block text-black">Content 1</label>
                              <Textarea
                                value={slidePlaceholders["content-1"] || ''}
                                onChange={(e) => updateEditedPlaceholder("content-1", e.target.value)}
                                className="bg-white border-gray-400 text-black min-h-[150px]"
                                placeholder="Use <bullet>Item</bullet> syntax for bullet points"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block text-black">Content 2</label>
                              <Textarea
                                value={slidePlaceholders["content-2"] || ''}
                                onChange={(e) => updateEditedPlaceholder("content-2", e.target.value)}
                                className="bg-white border-gray-400 text-black min-h-[150px]"
                                placeholder="Use <bullet>Item</bullet> syntax for bullet points"
                              />
                            </div>
                          </>
                        )}
                        
                        {/* Layout 7: Comparison slide */}
                        {slideLayout === 7 && (
                          <>
                            <div>
                              <label className="text-sm font-medium mb-1 block text-black">Compare Title 1</label>
                              <Input
                                value={slidePlaceholders["compare-title-1"] || ''}
                                onChange={(e) => updateEditedPlaceholder("compare-title-1", e.target.value)}
                                className="bg-white border-gray-400 text-black"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block text-black">Compare Content 1</label>
                              <Textarea
                                value={slidePlaceholders["compare-content-1"] || ''}
                                onChange={(e) => updateEditedPlaceholder("compare-content-1", e.target.value)}
                                className="bg-white border-gray-400 text-black min-h-[100px]"
                                placeholder="Use <bullet>Item</bullet> syntax for bullet points"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block text-black">Compare Title 2</label>
                              <Input
                                value={slidePlaceholders["compare-title-2"] || ''}
                                onChange={(e) => updateEditedPlaceholder("compare-title-2", e.target.value)}
                                className="bg-white border-gray-400 text-black"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block text-black">Compare Content 2</label>
                              <Textarea
                                value={slidePlaceholders["compare-content-2"] || ''}
                                onChange={(e) => updateEditedPlaceholder("compare-content-2", e.target.value)}
                                className="bg-white border-gray-400 text-black min-h-[100px]"
                                placeholder="Use <bullet>Item</bullet> syntax for bullet points"
                              />
                            </div>
                          </>
                        )}
                        
                        {/* Layout 8: Image with content */}
                        {slideLayout === 8 && (
                          <div>
                            <label className="text-sm font-medium mb-1 block text-black">Content</label>
                            <Textarea
                              value={slidePlaceholders["content"] || ''}
                              onChange={(e) => updateEditedPlaceholder("content", e.target.value)}
                              className="bg-white border-gray-400 text-black min-h-[150px]"
                              placeholder="Use <bullet>Item</bullet> syntax for bullet points"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Layout 4: Title only */}
                    {slideLayout === 4 && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block text-black">Title</label>
                          <Input
                            value={slidePlaceholders["title"] || ''}
                            onChange={(e) => updateEditedPlaceholder("title", e.target.value)}
                            className="bg-white border-gray-400 text-black"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // View Mode
                  <div className="h-full bg-white p-6 border-t border-gray-300">
                    {/* Layout 0: Title slide */}
                    {slideLayout === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <h1 className="text-3xl font-bold mb-4">{slidePlaceholders["presentation-topic"] || "Title Slide"}</h1>
                        <p className="text-xl text-muted-foreground mb-6">{slidePlaceholders["topic-subtitle"] || "Subtitle"}</p>
                        <p className="text-lg italic text-muted-foreground">{slidePlaceholders["quote"] || "Quote"}</p>
                      </div>
                    )}

                    {/* Layout 1: Title with content */}
                    {slideLayout === 1 && (
                      <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6">{slidePlaceholders["title"] || "Slide Title"}</h2>
                        <div>
                          {slidePlaceholders["content"] ? (
                            <div dangerouslySetInnerHTML={{ 
                              __html: slidePlaceholders["content"]
                                .replace(/<bullet>/g, '<li>')
                                .replace(/<\/bullet>/g, '</li>')
                                .replace(/\n/g, '<br>') 
                            }} className="list-disc pl-5" />
                          ) : (
                            <p className="text-muted-foreground">Content goes here</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Layout 2: Title with content and image */}
                    {slideLayout === 2 && (
                      <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6">{slidePlaceholders["title"] || "Slide Title"}</h2>
                        <div className="grid grid-cols-2 gap-6 flex-grow">
                          <div>
                            {slidePlaceholders["content"] ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: slidePlaceholders["content"]
                                  .replace(/<bullet>/g, '<li>')
                                  .replace(/<\/bullet>/g, '</li>')
                                  .replace(/\n/g, '<br>') 
                              }} className="list-disc pl-5" />
                            ) : (
                              <p className="text-muted-foreground">Content goes here</p>
                            )}
                          </div>
                          <div className="bg-muted/20 rounded-lg flex items-center justify-center p-4">
                            <div className="text-sm text-muted-foreground">[Image: {slidePlaceholders["image"] || "image.jpg"}]</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Layout 3: Title with body */}
                    {slideLayout === 3 && (
                      <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6">{slidePlaceholders["title"] || "Slide Title"}</h2>
                        {slidePlaceholders["body"] ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: slidePlaceholders["body"]
                              .replace(/<bullet>/g, '<li>')
                              .replace(/<\/bullet>/g, '</li>')
                              .replace(/\n/g, '<br>') 
                          }} className="list-disc pl-5" />
                        ) : (
                          <p className="text-muted-foreground">Body content goes here</p>
                        )}
                      </div>
                    )}

                    {/* Layout 4: Title only */}
                    {slideLayout === 4 && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <h1 className="text-3xl font-bold">{slidePlaceholders["title"] || "Title Only"}</h1>
                      </div>
                    )}

                    {/* Layout 5: Title with image */}
                    {slideLayout === 5 && (
                      <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6">{slidePlaceholders["title"] || "Slide Title"}</h2>
                        <div className="flex-grow flex items-center justify-center">
                          <div className="bg-muted/20 rounded-lg flex items-center justify-center p-4 max-w-[70%] max-h-[70%]">
                            <div className="text-sm text-muted-foreground">[Image: {slidePlaceholders["image"] || "image.jpg"}]</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Layout 6: Title with two content columns */}
                    {slideLayout === 6 && (
                      <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6">{slidePlaceholders["title"] || "Slide Title"}</h2>
                        <div className="grid grid-cols-2 gap-6 flex-grow">
                          <div>
                            {slidePlaceholders["content-1"] ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: slidePlaceholders["content-1"]
                                  .replace(/<bullet>/g, '<li>')
                                  .replace(/<\/bullet>/g, '</li>')
                                  .replace(/\n/g, '<br>') 
                              }} className="list-disc pl-5" />
                            ) : (
                              <p className="text-muted-foreground">Content 1 goes here</p>
                            )}
                          </div>
                          <div>
                            {slidePlaceholders["content-2"] ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: slidePlaceholders["content-2"]
                                  .replace(/<bullet>/g, '<li>')
                                  .replace(/<\/bullet>/g, '</li>')
                                  .replace(/\n/g, '<br>') 
                              }} className="list-disc pl-5" />
                            ) : (
                              <p className="text-muted-foreground">Content 2 goes here</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Layout 7: Comparison slide */}
                    {slideLayout === 7 && (
                      <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6">{slidePlaceholders["title"] || "Comparison Title"}</h2>
                        <div className="grid grid-cols-2 gap-6 flex-grow">
                          <div>
                            <h3 className="text-xl font-semibold mb-3">{slidePlaceholders["compare-title-1"] || "Comparison 1"}</h3>
                            {slidePlaceholders["compare-content-1"] ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: slidePlaceholders["compare-content-1"]
                                  .replace(/<bullet>/g, '<li>')
                                  .replace(/<\/bullet>/g, '</li>')
                                  .replace(/\n/g, '<br>') 
                              }} className="list-disc pl-5" />
                            ) : (
                              <p className="text-muted-foreground">Comparison content 1 goes here</p>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-3">{slidePlaceholders["compare-title-2"] || "Comparison 2"}</h3>
                            {slidePlaceholders["compare-content-2"] ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: slidePlaceholders["compare-content-2"]
                                  .replace(/<bullet>/g, '<li>')
                                  .replace(/<\/bullet>/g, '</li>')
                                  .replace(/\n/g, '<br>') 
                              }} className="list-disc pl-5" />
                            ) : (
                              <p className="text-muted-foreground">Comparison content 2 goes here</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Layout 8: Image with content */}
                    {slideLayout === 8 && (
                      <div className="flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-6">{slidePlaceholders["title"] || "Slide Title"}</h2>
                        <div className="grid grid-cols-2 gap-6 flex-grow">
                          <div className="bg-muted/20 rounded-lg flex items-center justify-center p-4">
                            <div className="text-sm text-muted-foreground">[Image: {slidePlaceholders["image"] || "image.jpg"}]</div>
                          </div>
                          <div>
                            {slidePlaceholders["content"] ? (
                              <div dangerouslySetInnerHTML={{ 
                                __html: slidePlaceholders["content"]
                                  .replace(/<bullet>/g, '<li>')
                                  .replace(/<\/bullet>/g, '</li>')
                                  .replace(/\n/g, '<br>') 
                              }} className="list-disc pl-5" />
                            ) : (
                              <p className="text-muted-foreground">Content goes here</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* JSON Data Viewer */}
          <Tabs defaultValue="preview" className="w-full mt-4">
            <TabsList className="border-b border-gray-300 bg-white">
              <TabsTrigger value="preview" className="text-black">Preview</TabsTrigger>
              <TabsTrigger value="json" className="text-black">JSON Structure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="json" className="mt-2">
              <Card className="bg-white border-gray-300 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2 text-black">Current Slide JSON</h3>
                  <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-[200px] border border-gray-300">
                    <pre className="text-xs text-black">
                      {JSON.stringify(currentSlide, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-2">
              <Card className="bg-white border-gray-300 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2 text-black">Slide Navigation</h3>
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {presentationData?.slides?.map((slide: any, index: number) => {
                      // Get title based on slide layout
                      let slideTitle = `Slide ${index + 1}`;
                      
                      if (slide.layout === 0 && slide.placeholders["presentation-topic"]) {
                        slideTitle = slide.placeholders["presentation-topic"];
                      } else if (slide.placeholders["title"]) {
                        slideTitle = slide.placeholders["title"];
                      }
                      
                      return (
                        <div 
                          key={index}
                          className={`
                            cursor-pointer flex-shrink-0 w-16 h-12 border rounded overflow-hidden
                            ${currentSlideIndex === index ? 'border-black' : 'border-gray-300'}
                          `}
                          onClick={() => goToSlide(index)}
                        >
                          <div className="w-full h-full p-1 flex flex-col justify-center items-center text-[8px] text-center bg-white text-black">
                            <div className="truncate w-full">
                              {index + 1}: {slideTitle}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PresentationViewer;
