
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Presentation } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="border-b border-gray-200 py-4 px-6 bg-white/80 backdrop-blur-sm w-full">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-2">
          <Presentation size={28} className="text-accent" />
          <span className="font-bold text-xl">PresentationAI</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create')}
            className="font-medium"
          >
            Create
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/auth')}
            className="font-medium"
          >
            Login
          </Button>
          
          <Button 
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-accent hover:bg-accent/90 font-medium"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
