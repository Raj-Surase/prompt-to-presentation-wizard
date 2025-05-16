import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ArrowLeft, FileText, FileSpreadsheet } from "lucide-react";

const ExportPresentation = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleDownload = async (format: string) => {
    if (!session?.access_token) {
      console.error("No access token available");
      return;
    }

    try {
      const response = await fetch(`/api/export/1/${format}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to download ${format}:`, response.status, response.statusText);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presentation.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/60 border border-border p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Export Presentation</h2>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start gap-2 border-white/20 hover:bg-secondary/30" onClick={() => handleDownload('pptx')}>
            <FileSpreadsheet size={16} />
            Export as PPTX
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 border-white/20 hover:bg-secondary/30" onClick={() => handleDownload('pdf')}>
            <FileText size={16} />
            Export as PDF
          </Button>
        </div>
        <Button variant="ghost" className="mt-4 w-full justify-start" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Go Back
        </Button>
      </Card>
    </div>
  );
};

export default ExportPresentation;
