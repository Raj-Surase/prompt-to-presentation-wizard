import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ListOrdered, LayoutDashboard, Languages, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PromptInputProps {
  onSubmit: (response: any) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState('15');
  const [presentationSize, setPresentationSize] = useState('16:9');
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      try {
        setError(null);
        setIsSubmitting(true);
        
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            number_of_slides: parseInt(slideCount),
            language: language
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate presentation');
        }
        
        const data = await response.json();
        
        // Pass the data to the parent component
        onSubmit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error generating presentation:', err);
        setIsSubmitting(false);
      }
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
            disabled={isSubmitting || isLoading}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Slides Count Dropdown */}
          <div>
            <Select value={slideCount} onValueChange={setSlideCount} disabled={isSubmitting || isLoading}>
              <SelectTrigger className="w-full bg-black/60 border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <ListOrdered size={16} />
                  <span>Slides: {slideCount}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {[...Array(9)].map((_, i) => {
                  const count = i + 12; // Start from 12 slides, go to 20
                  return (
                    <SelectItem key={count} value={count.toString()}>
                      {count} slides
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Presentation Size Dropdown */}
          <div>
            <Select value={presentationSize} onValueChange={setPresentationSize} disabled={isSubmitting || isLoading}>
              <SelectTrigger className="w-full bg-black/60 border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  <span>Size: {presentationSize}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="4:3">4:3 (Standard)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Dropdown */}
          <div>
            <Select value={language} onValueChange={setLanguage} disabled={isSubmitting || isLoading}>
              <SelectTrigger className="w-full bg-black/60 border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Languages size={16} />
                  <span>Language</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={prompt.trim() === '' || isSubmitting || isLoading}
          className="w-full rounded-xl bg-accent hover:bg-accent/80 transition-all h-12"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Generating presentation...
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
