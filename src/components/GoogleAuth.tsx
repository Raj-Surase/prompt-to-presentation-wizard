import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

/**
 * GoogleAuth component
 * 
 * This component simulates Google OAuth authentication for demo purposes.
 * In production, you would use a proper OAuth library.
 */
const GoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Demo Mode",
        description: "Using a simulated Google token for authentication demo",
      });
      
      // In a real implementation, we would get a real token from Google OAuth
      // For demo purposes, we'll use a dummy token
      const dummyToken = "google-oauth-demo-token";
      await signInWithGoogle(dummyToken);
      
      toast({
        title: "Authentication Successful",
        description: "Successfully authenticated with Google (demo)",
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to sign in with Google.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      <Mail size={18} />
      <span>Continue with Google</span>
    </Button>
  );
};

export default GoogleAuth; 