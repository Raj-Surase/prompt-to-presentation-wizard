
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Presentation } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="border-b border-gray-300 py-4 px-6 bg-white w-full shadow-sm">
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
            className="font-medium text-black"
          >
            Create
          </Button>
          
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-black hover:bg-black/90 font-medium text-white"
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
