
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
          Presentation AI
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Transform your ideas into stunning presentations with AI assistance
        </p>
        
        <Button 
          onClick={() => navigate('/create')}
          className="rounded-xl bg-accent hover:bg-accent/80 transition-all px-8 py-3 text-lg"
        >
          <span className="flex items-center gap-2">
            Get Started <ArrowRight size={18} />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Index;
