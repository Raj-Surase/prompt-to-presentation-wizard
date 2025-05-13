
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, PenLine, Users, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Index = () => {
  const navigate = useNavigate();

  // Dummy projects data
  const userProjects = [
    { id: 1, title: "Marketing Strategy 2024", slides: 15, updated: "2 days ago" },
    { id: 2, title: "Product Launch Overview", slides: 12, updated: "1 week ago" },
    { id: 3, title: "Team Building Workshop", slides: 8, updated: "3 weeks ago" }
  ];

  // Dummy explore projects
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userProjects.map(project => (
              <div 
                key={project.id} 
                className="glass-panel p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/preview?id=${project.id}`)}
              >
                <h3 className="font-semibold truncate">{project.title}</h3>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{project.slides} slides</span>
                  <span>Updated {project.updated}</span>
                </div>
              </div>
            ))}
          </div>
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
                onClick={() => navigate(`/preview?id=${project.id}`)}
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
