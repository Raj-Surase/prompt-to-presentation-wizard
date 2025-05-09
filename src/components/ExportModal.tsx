
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, FileText, FileImage, FileSpreadsheet } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const handleExport = (format: string) => {
    console.log(`Exporting to ${format}`);
    // In a real app, this would trigger the actual export functionality
    alert(`In a real implementation, this would export your presentation as ${format}!`);
    onClose();
  };

  const handleShare = () => {
    console.log("Sharing presentation");
    // In a real app, this would open share options
    alert("In a real implementation, this would open sharing options!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text">Export Presentation</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => handleExport('PowerPoint (.pptx)')}
            className="flex justify-between items-center bg-gray-400 hover:bg-gray-500 h-16 text-black"
          >
            <div className="flex items-center">
              <FileSpreadsheet className="mr-2" />
              <span>PowerPoint (.pptx)</span>
            </div>
            <Download size={18} />
          </Button>
          
          <Button 
            onClick={() => handleExport('PDF (.pdf)')}
            className="flex justify-between items-center bg-gray-400 hover:bg-gray-500 h-16 text-black"
          >
            <div className="flex items-center">
              <FileText className="mr-2" />
              <span>PDF Document (.pdf)</span>
            </div>
            <Download size={18} />
          </Button>
          
          <Button 
            onClick={() => handleExport('Images (.png)')}
            className="flex justify-between items-center bg-gray-400 hover:bg-gray-500 h-16 text-black"
          >
            <div className="flex items-center">
              <FileImage className="mr-2" />
              <span>Image Files (.png)</span>
            </div>
            <Download size={18} />
          </Button>
          
          <Button 
            onClick={handleShare}
            className="flex justify-between items-center bg-accent hover:bg-accent/80 h-16 mt-2"
          >
            <span>Share Presentation</span>
            <Share size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
