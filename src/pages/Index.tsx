import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, PenLine, Users, Sparkles, Download, Calendar, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { formatStatus, getStatusColor, getDownloadUrl } from '@/lib/presentationService';
import { format, parseISO } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { usePresentations } from '@/hooks/usePresentations';

const Index = () => {
  const navigate = useNavigate();
  const { presentations: userPresentations, loading, error } = usePresentations();
  
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
    { id: 101, title: "How to Create Effective Slides", author: "Jane Smith", likes: 243 },
    { id: 102, title: "Data Visualization Best Practices", author: "John Doe", likes: 189 },
    { id: 103, title: "Remote Team Communication", author: "Alex Johnson", likes: 156 },
    { id: 104, title: "Annual Financial Report Template", author: "Sara Williams", likes: 132 }
  ];

  return (
    <div className="min-h-screen mesh-gradient flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-16">
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
        
        {/* Recent Projects Section */}
        <div className="w-full max-w-5xl mx-auto mt-8 px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <PenLine size={22} />
              Your Projects
            </h2>
            <Button variant="outline" onClick={() => navigate('/create')}>Create New</Button>
          </div>
          
          {loading ? (
            <Spinner centered size="lg" />
          ) : error ? (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate('/create')}
              >
                Create Your First Presentation
              </Button>
            </div>
          ) : userPresentations.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-2">No presentations yet</h3>
              <p className="text-gray-600 mb-4">Create your first AI-powered presentation now!</p>
              <Button onClick={() => navigate('/create')}>Create Presentation</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userPresentations.map(presentation => (
                <div 
                  key={presentation.id} 
                  className="glass-panel p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/preview', { state: { presentationId: presentation.id } })}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate flex-1">{presentation.prompt}</h3>
                    {presentation.status === 'completed' && (
                      <a 
                        href={getDownloadUrl(presentation.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-600 hover:text-accent"
                        title="Download presentation"
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{presentation.number_of_slides} slides</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(presentation.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
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
              <Sparkles size={22} />
              Explore
            </h2>
            <Button variant="ghost" onClick={() => navigate('/explore')}>See all</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exploreProjects.map(project => (
              <div 
                key={project.id} 
                className="glass-panel p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate('/preview', { state: { presentationId: project.id } })}
              >
                <h3 className="font-semibold truncate">{project.title}</h3>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
