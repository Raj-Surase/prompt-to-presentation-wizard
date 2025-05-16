
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Presentation, LogOut, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <nav className="border-b border-white/10 py-4 px-6 bg-secondary/30 backdrop-blur-md w-full shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Presentation size={28} className="text-white transform transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 rounded-full blur-md scale-150 opacity-0 group-hover:opacity-50 transition-opacity"></div>
          </div>
          <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/70">PresentationAI</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full size-10 p-0 flex items-center justify-center border border-white/10 hover:bg-white/10">
                  <User size={18} className="text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-secondary/90 backdrop-blur-lg border-white/10">
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-white hover:bg-white/90 text-black font-medium"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
