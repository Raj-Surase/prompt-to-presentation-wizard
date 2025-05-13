import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

// Types
interface User {
  supabase_user_id: string;
  email: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
}

interface AuthResponse {
  message?: string;
  user: User;
  session?: Session;
}

interface SessionResponse {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Default context value
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

// Session storage key
const SESSION_STORAGE_KEY = 'auth_session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const loadStoredSession = async () => {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          setSession(sessionData);
          
          // Validate the session
          await validateSession(sessionData.access_token);
        } catch (err) {
          console.error('Failed to validate stored session:', err);
          // Clear invalid session
          localStorage.removeItem(SESSION_STORAGE_KEY);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  // Validate session
  const validateSession = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await api.get<SessionResponse>('/session');
      setUser(response.data.user);
      return true;
    } catch (err) {
      console.error('Session validation failed:', err);
      // Clear invalid session
      setSession(null);
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Save session to localStorage
  const persistSession = (sessionData: Session) => {
    if (sessionData) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    }
  };

  // Sign up
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post<AuthResponse>('/api/signup', {
        email,
        password
      });
      
      // Check if we have a session (might not if email verification is required)
      if (response.data.session) {
        setUser(response.data.user);
        setSession(response.data.session);
        persistSession(response.data.session);
      } else {
        // We have a user but need verification
        setUser(response.data.user);
      }
    } catch (err: any) {
      console.error('Sign up failed:', err);
      // Format error message from the backend
      const errorMessage = err.response?.data?.error || 'Failed to sign up. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post<AuthResponse>('/api/signin', {
        email,
        password
      });
      
      if (!response.data.user || !response.data.session) {
        throw new Error('Invalid response from server');
      }
      
      setUser(response.data.user);
      setSession(response.data.session);
      persistSession(response.data.session);
    } catch (err: any) {
      console.error('Sign in failed:', err);
      // Format error message from the backend
      const errorMessage = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (accessToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In the real app, this would receive a token from Google OAuth
      const response = await api.post<AuthResponse>('/api/signin/google', {
        access_token: accessToken
      });
      
      if (!response.data.user || !response.data.session) {
        throw new Error('Invalid response from server');
      }
      
      setUser(response.data.user);
      setSession(response.data.session);
      persistSession(response.data.session);
    } catch (err: any) {
      console.error('Google sign in failed:', err);
      // Format error message from the backend
      const errorMessage = err.response?.data?.error || 'Failed to sign in with Google. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    if (!session?.access_token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Attempt to sign out on the server
      await api.post('/signout');
    } catch (err: any) {
      console.error('Sign out error on server:', err);
      // We'll still clear local state even if server signout fails
    } finally {
      // Always clear local state
      setUser(null);
      setSession(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => useContext(AuthContext); 