
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ListOrdered, LayoutDashboard, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState('5');
  const [presentationSize, setPresentationSize] = useState('16:9');
  const [language, setLanguage] = useState('English');

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Slides Count Dropdown */}
          <div>
            <Select value={slideCount} onValueChange={setSlideCount}>
              <SelectTrigger className="w-full bg-black/60 border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <ListOrdered size={16} />
                  <span>Slides: {slideCount}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} slide{i !== 0 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Presentation Size Dropdown */}
          <div>
            <Select value={presentationSize} onValueChange={setPresentationSize}>
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
            <Select value={language} onValueChange={setLanguage}>
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
                <SelectItem value="Italian">Italian</SelectItem>
                <SelectItem value="Portuguese">Portuguese</SelectItem>
                <SelectItem value="Dutch">Dutch</SelectItem>
                <SelectItem value="Russian">Russian</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="Korean">Korean</SelectItem>
                <SelectItem value="Chinese">Chinese</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
