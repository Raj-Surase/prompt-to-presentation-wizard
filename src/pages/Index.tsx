
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, PenLine, Users, Sparkles, Download, Calendar, FileText, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { formatStatus, getStatusColor, getDownloadUrl } from '@/lib/presentationService';
import { format, parseISO } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { usePresentations } from '@/hooks/usePresentations';
import { CreatePresentationForm } from '@/components/CreatePresentationForm';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import WelcomeMessage from '@/components/WelcomeMessage';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { presentations: userPresentations, loading, error } = usePresentations();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Check if this is a new login/signup by looking for a URL parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('welcome') === 'true' && user) {
      setShowWelcome(true);
      // Remove the parameter from URL without refreshing
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Dummy explore projects (these could be replaced with actual featured presentations in the future)
  const exploreProjects = [
    { id: 101, title: "How to Create Effective Slides", author: "Jane Smith", likes: 243, image: "presentation1.jpg" },
    { id: 102, title: "Data Visualization Best Practices", author: "John Doe", likes: 189, image: "presentation2.jpg" },
    { id: 103, title: "Remote Team Communication", author: "Alex Johnson", likes: 156, image: "presentation3.jpg" },
    { id: 104, title: "Annual Financial Report Template", author: "Sara Williams", likes: 132, image: "presentation4.jpg" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {showWelcome && <WelcomeMessage username={user?.email} />}
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text animate-float">
            Presentation AI
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Transform your ideas into stunning presentations with AI assistance
          </p>
        </div>
        
        {/* Create Presentation Form Section */}
        <div className="w-full max-w-2xl mx-auto mb-16">
          <div className="glass-panel p-6 animate-fade-in">
            <div className="flex items-center mb-4 gap-2">
              <Zap size={22} className="text-white animate-pulse-slow" />
              <h2 className="text-xl font-bold">Create New Presentation</h2>
            </div>
            <CreatePresentationForm onSuccess={(presentationId) => {
              toast({
                title: "Presentation created!",
                description: "Redirecting to edit page...",
              });
              navigate("/edit", { state: { presentationId } });
            }} />
          </div>
        </div>
        
        {/* Recent Projects Section */}
        <div className="w-full max-w-5xl mx-auto mt-8 px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PenLine size={22} className="animate-bounce-subtle" />
              Your Projects
            </h2>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 animate-pulse-slow">
              <Spinner centered size="lg" />
              <p className="mt-4 text-muted-foreground animate-pulse">Loading your presentations...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-destructive/20 rounded-lg border border-destructive/30">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-destructive/50 text-destructive"
                onClick={() => navigate('/create')}
              >
                Try Creating a Presentation
              </Button>
            </div>
          ) : !user || userPresentations.length === 0 ? (
            <div className="text-center p-8 glass-panel animate-fade-in">
              <h3 className="text-lg font-medium mb-2">{!user ? "Sign in to view your presentations" : "No presentations yet"}</h3>
              <p className="text-muted-foreground mb-4">{!user ? "Create an account to start building AI-powered presentations" : "Create your first AI-powered presentation above!"}</p>
              {!user && (
                <Button onClick={() => navigate('/auth')} className="animate-scale-pulse">Sign In</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userPresentations.map(presentation => (
                <div 
                  key={presentation.id} 
                  className="glass-panel hover-3d p-4 cursor-pointer transition-all"
                  onClick={() => navigate('/preview', { state: { presentationId: presentation.id, fromIndex: true } })}
                >
                  <div className="bg-gray-800/50 rounded-lg h-32 mb-3 flex items-center justify-center">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate flex-1">{presentation.prompt}</h3>
                    {presentation.status === 'completed' && (
                      <a 
                        href={getDownloadUrl(presentation.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-white"
                        title="Download presentation"
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{presentation.number_of_slides} slides</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(presentation.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className={`text-xs font-medium ${getStatusColor(presentation.status)}`}>
                      {formatStatus(presentation.status)}
                    </span>
                    <span className="text-xs">
                      {presentation.language}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Explore Section */}
        <div className="w-full max-w-5xl mx-auto mt-16 px-4 mb-16">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={22} className="animate-spin-slow" />
              Explore
            </h2>
            <Button variant="ghost" onClick={() => navigate('/explore')} className="text-white/80 hover:text-white">See all</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exploreProjects.map(project => (
              <div 
                key={project.id} 
                className="project-card hover-3d"
                onClick={() => navigate('/preview', { state: { presentationId: project.id, fromIndex: true } })}
              >
                <div className="project-image bg-gray-800/50 flex items-center justify-center">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Users size={15} />
                      {project.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={15} /> 
                      {project.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
