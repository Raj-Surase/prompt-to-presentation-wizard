import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Download, Edit, Loader2, Save, ChevronDown, ChevronUp, Pencil, FileText, FileSpreadsheet } from "lucide-react";
import { usePresentationContext } from '@/context/PresentationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
  const { session } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [structureEditMode, setStructureEditMode] = useState(false);
  const [structureOrder, setStructureOrder] = useState<any[]>([]);
  const [structureLoading, setStructureLoading] = useState(false);
  const [tab, setTab] = useState<string>('slides');
  const [pdfNumPages, setPdfNumPages] = useState<number>(0);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);


  // Set up PDF.js worker
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const pdfUrl = presentationId ? `/api/presentations/${presentationId}/preview` : null;

  useEffect(() => {
    if (topics) {
      setPresentationData(topics);
      
      if (presentationId) {
        setExportUrl(`/api/download/${presentationId}`);
      }
    }
  }, [topics, presentationId]);

  // PDF Viewer height and width
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
  
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  

  // Hide success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Initialize structureOrder from presentationData on load
  useEffect(() => {
    if (presentationData && presentationData.slides) {
      // Map slides to structure format: { index, title }
      const structure = presentationData.slides.map((slide: any, idx: number) => ({
        index: idx,
        title: slide.layout === 0 ? (slide.placeholders["presentation-topic"] || slide.placeholders["topic-title"] || "Title Slide") : (slide.placeholders.title || "Untitled Slide")
      }));
      setStructureOrder(structure);
    }
  }, [presentationData]);

  // Optionally, still fetch from API when edit mode is enabled
  useEffect(() => {
    if (structureEditMode && presentationId) {
      setStructureLoading(true);
      fetch(`/api/presentations/${presentationId}/structure`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setStructureOrder(data.structure || []);
          setStructureLoading(false);
        })
        .catch(() => setStructureLoading(false));
    }
  }, [structureEditMode, presentationId, session]);

  // Fetch PDF as Blob when PDF tab is selected
  useEffect(() => {
    if (tab === 'pdf' && pdfUrl) {
      setPdfLoading(true);
      setPdfError(null);
      fetch(pdfUrl, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch PDF');
          return res.blob();
        })
        .then(blob => {
          setPdfBlob(blob);
          setPdfLoading(false);
        })
        .catch(err => {
          setPdfError('Failed to load PDF preview.');
          setPdfLoading(false);
        });
    }
  }, [tab, pdfUrl, session?.access_token]);

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
      
      // Call the API to update the slide
      const response = await fetch(`/api/presentations/${presentationId}/slides/${currentSlideIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
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

  const downloadPresentation = async (id: number) => {
    const response = await fetch(`/api/download/${id}`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });
    if (!response.ok) throw new Error('Failed to download');
    return await response.blob();
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= structureOrder.length) return;
    const newOrder = [...structureOrder];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setStructureOrder(newOrder);
  };

  const saveStructureOrder = async () => {
    if (!presentationId) return;
    setStructureLoading(true);
    try {
      const order = structureOrder.map(slide => slide.index);
      const response = await fetch(`/api/presentations/${presentationId}/structure`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ order })
      });
      if (!response.ok) throw new Error('Failed to update structure');
      setStructureEditMode(false);
      // Optionally reload presentation data here
      window.location.reload(); // or trigger a refetch if you want to be more elegant
    } catch (err) {
      setError('Failed to update structure');
    } finally {
      setStructureLoading(false);
    }
  };

  const handlePdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPdfNumPages(numPages);
    setPdfPage(1);
    setPdfLoading(false);
  };
  const handlePdfLoadError = (err: any) => {
    setPdfError('Failed to load PDF preview.');
    setPdfLoading(false);
  };

  const handleExportFile = async (format: 'pptx' | 'pdf') => {
    if (!presentationId) return;
    try {
      const res = await fetch(`/api/export/${presentationId}/${format}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined
      });
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation_${presentationId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: 'Export Started', description: `Your ${format.toUpperCase()} file is being downloaded.` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Export Failed', description: `Could not export the ${format.toUpperCase()} file.` });
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
        <div className="order-2 md:order-1 md:col-span-1">
          <Card className="bg-black/60 border-border h-full shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Presentation Structure</h3>
                <button type="button" onClick={() => setStructureEditMode(e => !e)} className="ml-2 p-1 hover:bg-gray-800 rounded" title="Edit Structure">
                  <Pencil size={18} />
                </button>
              </div>
              {structureEditMode ? (
                <div>
                  {structureLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                  ) : (
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-2">
                      {structureOrder.map((slide, idx) => (
                        <div key={slide.index} className="flex items-center p-2 bg-gray-900/80 rounded mb-1">
                        <span className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-xs font-medium mr-2">{idx + 1}</span>
                        <span className="flex-1 truncate text-sm font-medium text-white">{slide.title}</span>
                          <button onClick={() => moveSlide(idx, idx - 1)} disabled={idx === 0} className="p-1"><ChevronUp size={16} /></button>
                          <button onClick={() => moveSlide(idx, idx + 1)} disabled={idx === structureOrder.length - 1} className="p-1"><ChevronDown size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={saveStructureOrder} disabled={structureLoading} className="bg-accent hover:bg-accent/80">Save</Button>
                    <Button variant="outline" onClick={() => setStructureEditMode(false)} disabled={structureLoading}>Cancel</Button>
                        </div>
                      </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {structureOrder.map((slide, idx) => (
                    <div key={slide.index} className="flex items-center p-2 bg-gray-900/80 rounded mb-1">
                      <span className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-xs font-medium mr-2">{idx + 1}</span>
                      <span className="flex-1 truncate text-sm font-medium text-white">{slide.title}</span>
                    </div>
                  ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right panel - Slide preview/editor */}
        <div className="order-1 md:order-2 md:col-span-3">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex items-center mb-4 gap-2">
              <TabsList>
                <TabsTrigger value="slides">Slides</TabsTrigger>
                <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => handleExportFile('pptx')} title="Export as PPTX">
                  <FileSpreadsheet size={16} className="mr-1" /> PPTX
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExportFile('pdf')} title="Export as PDF">
                  <FileText size={16} className="mr-1" /> PDF
                </Button>
              </div>
            </div>
            <TabsContent value="slides">
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
                      <div className="h-full bg-black/80 p-6 overflow-y-auto">
                        <div className="space-y-4">{getPlaceholderInputs()}</div>
                      </div>
                    ) : (
                      <div className="h-full bg-black/80 p-6">{renderSlideContent()}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* <div style={{ height: '18px' }}></div>
              <Card className="bg-black/60 border-border">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">Slide Navigation</h3>
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {presentationData.slides.map((slide: any, index: number) => (
                      <div
                        key={index}
                        className={`cursor-pointer flex-shrink-0 w-16 h-12 border rounded overflow-hidden ${currentSlideIndex === index ? 'border-accent' : 'border-border'}`}
                        onClick={() => goToSlide(index)}
                      >
                        <div className="w-full h-full p-1 flex flex-col justify-center items-center text-[8px] text-center">
                          <div className="truncate w-full">{index + 1}: {getSlideTitle(slide)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card> */}
            </TabsContent>

            <TabsContent value="pdf">
              <Card className="bg-black/60 border-border">
                <CardContent className="p-4 flex flex-col items-center">
                  {pdfError && (
                    <Alert className="mb-4 bg-red-500/10 border-red-500/30">
                      <AlertDescription className="text-red-500">{pdfError}</AlertDescription>
                    </Alert>
                  )}

                  {pdfLoading && (
                    <div className="flex flex-col items-center justify-center h-96">
                      <Loader2 className="animate-spin mb-2" /> Loading PDF...
                    </div>
                  )}

                  {!pdfLoading && pdfBlob && (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex justify-start mb-2 gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => setPdfPage(p => Math.max(1, p - 1))} disabled={pdfPage <= 1}>Prev</Button>
                        <span className="text-sm py-2 px-1">Page {pdfPage} of {pdfNumPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPdfPage(p => Math.min(pdfNumPages, p + 1))} disabled={pdfPage >= pdfNumPages}>Next</Button>
                      </div>

                      {/* Container that scales */}
                      <div
                        ref={containerRef}
                        className="aspect-[16/9] w-full max-w-4xl border border-border rounded-lg bg-white flex items-center justify-center overflow-auto"
                      >
                        <Document
                          file={pdfBlob}
                          onLoadSuccess={handlePdfLoadSuccess}
                          onLoadError={handlePdfLoadError}
                          loading={<div className="flex flex-col items-center justify-center h-96"><Loader2 className="animate-spin mb-2" /> Loading PDF...</div>}
                          error={<div className="text-red-500">Failed to load PDF.</div>}
                        >
                          <Page
                            pageNumber={pdfPage}
                            width={containerWidth} // dynamic width
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                          />
                        </Document>
                      </div>
                    </div>
                  )}
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
