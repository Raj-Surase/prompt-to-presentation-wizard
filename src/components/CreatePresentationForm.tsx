import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { usePresentations } from '@/hooks/usePresentations';

const AVAILABLE_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean'
];

const SLIDE_COUNT_OPTIONS = [
  { value: 5, label: '5 slides (brief)' },
  { value: 10, label: '10 slides (standard)' },
  { value: 15, label: '15 slides (detailed)' },
  { value: 20, label: '20 slides (comprehensive)' }
];

const CreatePresentationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateNewPresentation } = usePresentations();
  
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState<number>(10);
  const [language, setLanguage] = useState<string>('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<{ prompt?: string }>({});

  const validateForm = () => {
    const newErrors: { prompt?: string } = {};
    
    if (!prompt.trim()) {
      newErrors.prompt = 'Please enter a presentation topic';
    } else if (prompt.trim().length < 10) {
      newErrors.prompt = 'Topic description is too short';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateNewPresentation(prompt, slideCount, language);
      
      toast({
        title: 'Presentation Generation Started',
        description: 'Your presentation is being created. You will be redirected to the edit page.',
      });
      
      // Navigate to the edit page with the new presentation ID
      navigate('/edit', { state: { presentationId: result.id } });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'Failed to generate presentation. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-base font-medium">
          Presentation Topic
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your presentation topic in detail, e.g. 'A comprehensive overview of renewable energy sources and their impact on climate change'"
          className={`min-h-[120px] ${errors.prompt ? 'border-red-500' : ''}`}
          disabled={isGenerating}
        />
        {errors.prompt && (
          <p className="text-sm text-red-500">{errors.prompt}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Be specific about your topic to get the best results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="slideCount" className="text-base font-medium">
            Number of Slides
          </Label>
          <Select
            value={slideCount.toString()}
            onValueChange={(value) => setSlideCount(parseInt(value))}
            disabled={isGenerating}
          >
            <SelectTrigger id="slideCount">
              <SelectValue placeholder="Select slide count" />
            </SelectTrigger>
            <SelectContent>
              {SLIDE_COUNT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language" className="text-base font-medium">
            Language
          </Label>
          <Select
            value={language}
            onValueChange={setLanguage}
            disabled={isGenerating}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90"
        disabled={isGenerating}
        size="lg"
      >
        {isGenerating ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Generating Presentation...
          </>
        ) : (
          'Generate Presentation'
        )}
      </Button>
    </form>
  );
};

export default CreatePresentationForm; 