import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GoogleAuth from '@/components/GoogleAuth';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isLoading, error, signUp, signIn, clearError } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(location.search.includes('mode=signup'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  
  // Check if we have a 'from' location to redirect to after login
  const from = (location.state as any)?.from?.pathname || '/';
  
  // If already authenticated, redirect to the 'from' page or home
  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);
  
  // Show toast for errors
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error,
      });
      
      // Clear error after showing toast
      clearError();
    }
  }, [error, toast, clearError]);
  
  // Validate form inputs
  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
    } = {};
    let isValid = true;
    
    // Validate email
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      }
    } catch (err) {
      // Error is already handled in the auth context
    }
  };
  
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
    setFormErrors({});
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
              onClick={() => toast({
                description: "GitHub integration not implemented yet."
              })}
              disabled={isLoading}
            >
              <Github size={18} />
              <span>Continue with GitHub</span>
            </Button>
            <GoogleAuth />
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
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="email" className="flex justify-between">
                <span>Email Address</span>
                {formErrors.email && <span className="text-red-500 text-xs">{formErrors.email}</span>}
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) {
                    setFormErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                className={formErrors.email ? "border-red-500" : ""}
                placeholder="Enter your email"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password" className="flex justify-between">
                <span>Password</span>
                {formErrors.password && <span className="text-red-500 text-xs">{formErrors.password}</span>}
              </Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) {
                    setFormErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                className={formErrors.password ? "border-red-500" : ""}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                isSignUp ? 'Sign Up' : 'Log In'
              )}
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
                disabled={isLoading}
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
