
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Describe your presentation topic and content here..."
            className="min-h-32 bg-black/60 text-foreground border-border rounded-xl px-4 py-3 resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={prompt.trim() === '' || isLoading}
          className="w-full rounded-xl bg-accent hover:bg-accent/80 transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse-slow">Generating presentation</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create Presentation <ArrowRight size={16} />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PromptInput;
