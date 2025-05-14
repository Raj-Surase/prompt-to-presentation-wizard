import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Download, Edit, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { usePresentationContext } from '@/context/PresentationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '@/lib/api';
import { updateSlideContent, getDownloadUrl, downloadPresentation } from '@/lib/presentationService';
import { useToast } from '@/components/ui/use-toast';

interface PresentationViewerProps {
  topics: any;
  onExport: () => void;
  presentationId?: number | null;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({ topics, onExport, presentationId }) => {
  const { toast } = useToast();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presentationData, setPresentationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading your presentation...');
  const [editMode, setEditMode] = useState(false);
  const [editedSlide, setEditedSlide] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (topics) {
      setPresentationData(topics);
      
      if (presentationId) {
        setExportUrl(getDownloadUrl(presentationId));
      }
    }
  }, [topics, presentationId]);

  // Hide success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleDownload = async () => {
    if (!presentationId) return;
    
    try {
      setIsDownloading(true);
      
      // Use the authenticated download method
      const blob = await downloadPresentation(presentationId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation_${presentationId}.pptx`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your presentation is being downloaded."
      });
    } catch (err) {
      console.error('Error downloading presentation:', err);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the presentation. Please try again."
      });
    } finally {
      setIsDownloading(false);
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
      
      // Call the API to update the slide using the service function 
      // which handles authentication headers
      await updateSlideContent(
        presentationId,
        currentSlideIndex,
        editedSlide.placeholders
      );
      
      // Update the local state with the edited data
      setPresentationData(updatedPresentationData);
      setEditMode(false);
      setIsSaving(false);
      setSaveSuccess(true);
      
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

  // Helper function to get title of slide from placeholders
  const getSlideTitle = (slide: any) => {
    const placeholders = slide?.placeholders || {};
    
    // Check for title in different formats based on layout
    if (slide.layout === 0) {
      return placeholders['presentation-topic'] || placeholders['topic-title'] || 'Title Slide';
    }
    
    return placeholders.title || 'Untitled Slide';
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

  // Determine which placeholders are used by this slide layout
  const getPlaceholderInputs = () => {
    const inputs = [];
    
    // Add all available placeholders for the current slide layout
    Object.keys(slidePlaceholders).forEach(key => {
      inputs.push(
        <div key={key}>
          <label className="text-sm font-medium mb-1 block capitalize">{key.replace(/-/g, ' ')}</label>
          {key.includes('content') || key.includes('body') ? (
            <Textarea
              value={slidePlaceholders[key] || ''}
              onChange={(e) => updateEditedPlaceholder(key, e.target.value)}
              className="bg-black/60 border-border min-h-[200px]"
              placeholder="Use <bullet>Item</bullet> syntax for bullet points"
            />
          ) : (
            <Input
              value={slidePlaceholders[key] || ''}
              onChange={(e) => updateEditedPlaceholder(key, e.target.value)}
              className="bg-black/60 border-border"
            />
          )}
        </div>
      );
    });
    
    return inputs;
  };

  // Helper function to render slide content based on layout
  const renderSlideContent = () => {
    switch (slideLayout) {
      case 0: // Title slide
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold mb-4">{slidePlaceholders['presentation-topic'] || "Title Slide"}</h1>
            <p className="text-xl text-muted-foreground">{slidePlaceholders['topic-subtitle'] || "Subtitle"}</p>
            {slidePlaceholders['quote'] && (
              <p className="mt-6 italic text-muted-foreground">"{slidePlaceholders['quote']}"</p>
            )}
          </div>
        );
      case 1: // Content slide
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">{slidePlaceholders.title || "Slide Title"}</h2>
            {slidePlaceholders.content ? (
              <div dangerouslySetInnerHTML={{ 
                __html: slidePlaceholders.content
                  .replace(/<bullet>/g, '<li>')
                  .replace(/<\/bullet>/g, '</li>')
                  .replace(/\n/g, '<br>') 
              }} className="list-disc pl-5" />
            ) : (
              <p className="text-muted-foreground">Content goes here</p>
            )}
          </div>
        );
      case 2: // Content with image
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">{slidePlaceholders.title || "Slide Title"}</h2>
            <div className="grid grid-cols-2 gap-6 flex-grow">
              <div>
                {slidePlaceholders.content ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: slidePlaceholders.content
                      .replace(/<bullet>/g, '<li>')
                      .replace(/<\/bullet>/g, '</li>')
                      .replace(/\n/g, '<br>') 
                  }} className="list-disc pl-5" />
                ) : (
                  <p className="text-muted-foreground">Content goes here</p>
                )}
              </div>
              <div className="bg-muted/20 rounded-lg flex items-center justify-center p-4">
                <div className="text-sm text-muted-foreground">[Image: {slidePlaceholders.image || "image.jpg"}]</div>
              </div>
            </div>
          </div>
        );
      case 3: // Text only
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">{slidePlaceholders.title || "Slide Title"}</h2>
            {slidePlaceholders.body ? (
              <div dangerouslySetInnerHTML={{ 
                __html: slidePlaceholders.body
                  .replace(/<bullet>/g, '<li>')
                  .replace(/<\/bullet>/g, '</li>')
                  .replace(/\n/g, '<br>') 
              }} className="list-disc pl-5" />
            ) : (
              <p className="text-muted-foreground">Body content goes here</p>
            )}
          </div>
        );
      case 6: // Two column content
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">{slidePlaceholders.title || "Slide Title"}</h2>
            <div className="grid grid-cols-2 gap-6 flex-grow">
              <div>
                {slidePlaceholders['content-1'] ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: slidePlaceholders['content-1']
                      .replace(/<bullet>/g, '<li>')
                      .replace(/<\/bullet>/g, '</li>')
                      .replace(/\n/g, '<br>') 
                  }} className="list-disc pl-5" />
                ) : (
                  <p className="text-muted-foreground">Left content</p>
                )}
              </div>
              <div>
                {slidePlaceholders['content-2'] ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: slidePlaceholders['content-2']
                      .replace(/<bullet>/g, '<li>')
                      .replace(/<\/bullet>/g, '</li>')
                      .replace(/\n/g, '<br>') 
                  }} className="list-disc pl-5" />
                ) : (
                  <p className="text-muted-foreground">Right content</p>
                )}
              </div>
            </div>
          </div>
        );
      case 7: // Compare layout
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">{slidePlaceholders.title || "Comparison"}</h2>
            <div className="grid grid-cols-2 gap-6 flex-grow">
              <div>
                <h3 className="text-lg font-medium mb-2">{slidePlaceholders['compare-title-1'] || "Option 1"}</h3>
                {slidePlaceholders['compare-content-1'] ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: slidePlaceholders['compare-content-1']
                      .replace(/<bullet>/g, '<li>')
                      .replace(/<\/bullet>/g, '</li>')
                      .replace(/\n/g, '<br>') 
                  }} className="list-disc pl-5" />
                ) : (
                  <p className="text-muted-foreground">Option 1 details</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">{slidePlaceholders['compare-title-2'] || "Option 2"}</h3>
                {slidePlaceholders['compare-content-2'] ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: slidePlaceholders['compare-content-2']
                      .replace(/<bullet>/g, '<li>')
                      .replace(/<\/bullet>/g, '</li>')
                      .replace(/\n/g, '<br>') 
                  }} className="list-disc pl-5" />
                ) : (
                  <p className="text-muted-foreground">Option 2 details</p>
                )}
              </div>
            </div>
          </div>
        );
      case 8: // Image with content
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">{slidePlaceholders.title || "Slide Title"}</h2>
            <div className="grid grid-cols-2 gap-6 flex-grow">
              <div className="bg-muted/20 rounded-lg flex items-center justify-center p-4">
                <div className="text-sm text-muted-foreground">[Image: {slidePlaceholders.image || "image.jpg"}]</div>
              </div>
              <div>
                {slidePlaceholders.content ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: slidePlaceholders.content
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
        );
      case 4: // Title only
      case 5: // Image only
      default:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">{slidePlaceholders.title || "Slide Title"}</h2>
            {slideLayout === 5 && (
              <div className="flex-grow flex items-center justify-center">
                <div className="bg-muted/20 rounded-lg flex items-center justify-center p-4 w-3/4 h-3/4">
                  <div className="text-sm text-muted-foreground">[Image: {slidePlaceholders.image || "image.jpg"}]</div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left panel - Slide structure */}
        <div className="md:col-span-1">
          <Card className="bg-black/60 border-border h-full">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3">Presentation Structure</h3>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {presentationData.slides.map((slide: any, index: number) => {
                  // Get title for slide
                  const slideTitle = getSlideTitle(slide);
                  
                  return (
                    <div 
                      key={index}
                      className={`
                        p-2 rounded cursor-pointer transition-all
                        ${currentSlideIndex === index ? 'bg-accent/20 border-l-2 border-accent' : 'bg-black/40 hover:bg-black/30'}
                      `}
                      onClick={() => goToSlide(index)}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium mr-2">
                          {index + 1}
                        </div>
                        <div className="overflow-hidden">
                          <p className="truncate text-sm font-medium">{slideTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {slide.layout === 0 ? 'Title Slide' : 
                             slide.layout === 1 ? 'Content' : 
                             slide.layout === 2 ? 'Content with Image' : 
                             slide.layout === 3 ? 'Text Only' :
                             slide.layout === 4 ? 'Title Only' :
                             slide.layout === 5 ? 'Image Only' :
                             slide.layout === 6 ? 'Two Column' :
                             slide.layout === 7 ? 'Comparison' :
                             slide.layout === 8 ? 'Image with Content' : 'Slide'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2" 
                onClick={handleDownload}
                disabled={!presentationId || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> 
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Download Presentation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right panel - Slide preview/editor */}
        <div className="md:col-span-3">
          <Card className="bg-black/60 border-border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={prevSlide} 
                    disabled={currentSlideIndex === 0 || editMode}
                    size="sm"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <span className="text-sm py-2 px-1">
                    Slide {currentSlideIndex + 1} of {presentationData.slides.length}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={nextSlide} 
                    disabled={currentSlideIndex === presentationData.slides.length - 1 || editMode}
                    size="sm"
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
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveSlide}
                        size="sm"
                        disabled={isSaving}
                        className="bg-accent hover:bg-accent/80"
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
                      className="bg-accent hover:bg-accent/80"
                    >
                      <Edit size={16} className="mr-2" /> Edit Slide
                    </Button>
                  )}
                </div>
              </div>

              {saveSuccess && (
                <Alert className="mb-4 bg-green-500/10 border-green-500/30">
                  <AlertDescription className="text-green-500">
                    Slide changes saved successfully!
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="aspect-[16/9] border border-border rounded-lg overflow-hidden">
                {editMode ? (
                  // Edit Mode
                  <div className="h-full bg-black/80 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {getPlaceholderInputs()}
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="h-full bg-black/80 p-6">
                    {renderSlideContent()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* JSON Data Viewer */}
          <Tabs defaultValue="preview" className="w-full mt-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="json">JSON Structure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="json" className="mt-2">
              <Card className="bg-black/60 border-border">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">Current Slide JSON</h3>
                  <div className="bg-black/80 rounded-md p-4 overflow-auto max-h-[200px]">
                    <pre className="text-xs">
                      {JSON.stringify(currentSlide, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-2">
              <Card className="bg-black/60 border-border">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">Slide Navigation</h3>
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {presentationData.slides.map((slide: any, index: number) => (
                      <div 
                        key={index}
                        className={`
                          cursor-pointer flex-shrink-0 w-16 h-12 border rounded overflow-hidden
                          ${currentSlideIndex === index ? 'border-accent' : 'border-border'}
                        `}
                        onClick={() => goToSlide(index)}
                      >
                        <div className="w-full h-full p-1 flex flex-col justify-center items-center text-[8px] text-center">
                          <div className="truncate w-full">
                            {index + 1}: {getSlideTitle(slide)}
                          </div>
                        </div>
                      </div>
                    ))}
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
