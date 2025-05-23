import React, { useState, useEffect } from 'react';
import { usePresentationContext } from '@/context/PresentationContext';
import { useAuth } from '@/context/AuthContext';
import PresentationViewer from '@/components/PresentationViewer';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPresentationDetails } from '@/lib/presentationService';

const PreviewPresentation = () => {
  const { topics, setTopics, handleExport } = usePresentationContext();
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [presentationId, setPresentationId] = useState<number | null>(null);
  const fromIndex = location.state?.fromIndex;
  const [presentationData, setPresentationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading your presentation...');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [presentationMeta, setPresentationMeta] = useState<any>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a presentation ID from the location state
    if (location.state?.presentationId) {
      setPresentationId(location.state.presentationId);
      fetchPresentationData(location.state.presentationId);
      fetchPdfBlob(location.state.presentationId);
    }
  }, [location.state]);

  const fetchPresentationData = async (id: number) => {
    try {
      setIsLoading(true);
      setLoadingMessage('Loading presentation data...');
      const response = await fetch(`/api/presentations/${id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch presentation data');
      }
      
      const data = await response.json();
      
      // If the presentation is still generating, poll for updates
      if (data.status === 'pending') {
        setLoadingMessage('Your presentation is being prepared. Please wait...');
        setTimeout(() => fetchPresentationData(id), 2000); // Poll every 2 seconds
        return;
      } else if (data.status === 'generating_ppt') {
        setLoadingMessage('Creating PowerPoint presentation...');
        setTimeout(() => fetchPresentationData(id), 2000); // Poll every 2 seconds
        return;
      } else if (data.status === 'modifying_ppt' || data.status === 'updating_ppt') {
        setLoadingMessage('Updating your presentation...');
        setTimeout(() => fetchPresentationData(id), 2000); // Poll every 2 seconds
        return;
      } else if (data.status === 'failed') {
        throw new Error(data.error_message || 'Presentation generation failed');
      } else if (data.status === 'completed') {
        // Once completed, set the presentation data and stop polling
        if (data.current_response) {
          const responseData = typeof data.current_response === 'string' 
            ? JSON.parse(data.current_response) 
            : data.current_response;
          
          setPresentationData(responseData);
          setTopics(responseData);
          setIsLoading(false);
          
          // Fetch PDF blob after presentation data is completed
          fetchPdfBlob(id);
          
          // Show success alert when presentation is ready
          setSuccessMessage('Your presentation is ready!');
          setShowSuccessAlert(true);
          
          // Auto-hide the alert after 5 seconds
          setTimeout(() => {
            setShowSuccessAlert(false);
          }, 5000);
        } else {
          throw new Error('No presentation data found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching presentation status:', err);
      setIsLoading(false);
    }
  };

  const fetchPdfBlob = async (id: number) => {
    const pdfUrl = `/api/presentations/${id}/preview`;
    if (!pdfUrl) return;

    setPdfLoading(true);
    setPdfError(null);
    try {
      const response = await fetch(pdfUrl, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      setPdfBlob(blob);
      setPdfLoading(false);
    } catch (err) {
      setPdfError('Failed to load PDF preview.');
      setPdfLoading(false);
      console.error('Error fetching PDF blob:', err);
    }
  };

  const handleBackToEdit = () => {
    navigate('/edit', { state: { presentationId } });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Loader2 size={40} className="animate-spin text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{loadingMessage}</h2>
            <p className="text-muted-foreground">This may take up to a minute to complete</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Presentation</h2>
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleBackToEdit}>
              <ArrowLeft size={16} className="mr-2" /> Go Back to Edit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check for presentation data
  if (!presentationData || !presentationData.slides || presentationData.slides.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4">
          <Card className="bg-black/60 border border-border p-6">
            <h2 className="text-xl font-bold mb-2">No Presentation Data</h2>
            <p className="text-muted-foreground mb-4">
              There's no presentation data available to display.
            </p>
            <Button variant="outline" onClick={() => navigate('/create')}>
              Create a New Presentation
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        
        
        {presentationMeta && (
          <div className="mb-4">
            <Card className="bg-black/60 border-border p-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex-1">
                  <p className="text-muted-foreground">Topic</p>
                  <p className="font-medium">{presentationMeta.prompt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Slides</p>
                  <p className="font-medium">{presentationMeta.number_of_slides}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Language</p>
                  <p className="font-medium">{presentationMeta.language}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{presentationMeta.status}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        <PresentationViewer 
          topics={presentationData} 
          onExport={handleExport} 
          presentationId={presentationId}
          pdfBlob={pdfBlob}
          pdfLoading={pdfLoading}
          pdfError={pdfError}
        />
        
        {/* Success notification */}
        {showSuccessAlert && (
          <div className="fixed bottom-4 right-4 max-w-md z-50">
            <Alert className="bg-green-500/10 border-green-500/30">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {successMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPresentation;
