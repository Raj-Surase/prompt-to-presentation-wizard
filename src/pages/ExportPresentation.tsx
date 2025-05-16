
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { getDownloadUrl, getExportUrl } from '@/lib/presentationService';
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";

const ExportPresentation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const [presentationId, setPresentationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (location.state?.presentationId) {
      setPresentationId(location.state.presentationId);
      // In a real app, you would fetch the thumbnail URL here
      setThumbnailUrl('/placeholder.svg');
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);
  
  const handleExport = (format: 'pptx' | 'pdf') => {
    if (!presentationId) return;
    
    setIsLoading(true);
    
    // In a real implementation, this would handle the actual download
    setTimeout(() => {
      window.open(getExportUrl(presentationId, format), '_blank');
      toast({
        title: `Export as ${format.toUpperCase()} started`,
        description: "Your file will download shortly.",
      });
      setIsLoading(false);
    }, 1000);
  };
  
  const handleBack = () => {
    navigate('/preview', { state: { presentationId } });
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Preview
        </Button>
        
        <Card className="glass-panel border-2 border-white/10 p-6">
          <h1 className="text-2xl font-bold mb-6 gradient-text">Export Presentation</h1>
          
          {thumbnailUrl && (
            <div className="mb-6 flex justify-center">
              <div className="rounded-xl overflow-hidden border-2 border-white/20 bg-black/40 w-full max-w-sm aspect-video flex items-center justify-center">
                <img 
                  src={thumbnailUrl} 
                  alt="Presentation thumbnail" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="grid gap-4">
            <Button 
              onClick={() => handleExport('pptx')}
              className="flex justify-between items-center bg-secondary hover:bg-secondary/80 h-16"
              disabled={isLoading}
            >
              <div className="flex items-center">
                <FileSpreadsheet className="mr-2" size={20} />
                <span>PowerPoint (.pptx)</span>
              </div>
              {isLoading ? <Spinner size="sm" /> : null}
            </Button>
            
            <Button 
              onClick={() => handleExport('pdf')}
              className="flex justify-between items-center bg-secondary hover:bg-secondary/80 h-16"
              disabled={isLoading}
            >
              <div className="flex items-center">
                <FileText className="mr-2" size={20} />
                <span>PDF Document (.pdf)</span>
              </div>
              {isLoading ? <Spinner size="sm" /> : null}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExportPresentation;
