import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const CreatePresentationForm = ({ onSuccess }: { onSuccess: (presentationId: number) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [numberOfSlides, setNumberOfSlides] = useState<number>(5);
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          number_of_slides: numberOfSlides,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create presentation');
      }

      const data = await response.json();
      toast({
        title: "Presentation Created",
        description: "Your presentation is being generated."
      });
      onSuccess(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto bg-black/60 border border-border p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            Topic
          </label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the topic for your presentation"
            required
            className="bg-black/50 border-border"
          />
        </div>
        <div>
          <label htmlFor="numberOfSlides" className="block text-sm font-medium mb-1">
            Number of Slides
          </label>
          <Input
            type="number"
            id="numberOfSlides"
            value={numberOfSlides.toString()}
            onChange={(e) => setNumberOfSlides(Number(e.target.value))}
            min="3"
            max="20"
            required
            className="bg-black/50 border-border"
          />
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1">
            Language
          </label>
          <Input
            type="text"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
            className="bg-black/50 border-border"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/80">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Presentation
        </Button>
      </form>
    </Card>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  const handlePresentationCreated = (presentationId: number) => {
    navigate('/edit', { state: { presentationId } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-4 border-b border-border">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">AI Presentation Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create stunning presentations in seconds with the power of AI.
          </p>
        </div>
      </header>

      <main className="py-12 px-4">
        <div className="container mx-auto text-center">
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-accent hover:bg-accent/80">
            {showCreateForm ? 'Hide Create Form' : 'Create a New Presentation'}
          </Button>

          {showCreateForm && (
            <div className="mb-20">
              <CreatePresentationForm
                // @ts-ignore - This is a necessary workaround for the type error
                onSuccess={handlePresentationCreated}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-muted-foreground border-t border-border">
        <p>&copy; 2024 AI Presentation Generator</p>
      </footer>
    </div>
  );
};

export default Index;
