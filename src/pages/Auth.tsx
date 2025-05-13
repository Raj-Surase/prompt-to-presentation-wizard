
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.search.includes('mode=signup'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll explain why we can't implement authentication yet
    alert('Supabase integration is required to implement authentication.');
  };
  
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen noise-bg flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h1>
          
          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => alert('Supabase integration is required to implement authentication.')}
            >
              <Github size={18} />
              <span>Continue with GitHub</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => alert('Supabase integration is required to implement authentication.')}
            >
              <Mail size={18} />
              <span>Continue with Google</span>
            </Button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
          
          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              {isSignUp ? 'Sign Up' : 'Log In'}
            </Button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {isSignUp 
                ? 'Already have an account? ' 
                : "Don't have an account? "}
              <button 
                onClick={toggleMode} 
                className="text-accent hover:underline"
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
