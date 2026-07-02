import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseOnline } from '../lib/supabase';
import { User as AppUser } from '../types';

interface AuthContextType {
  session: any;
  user: AppUser | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: any) => {
    try {
      // Get user metadata (supports both real Supabase and offline mock)
      const metadata = authUser.user_metadata || {};
      const fullName = metadata.full_name || authUser.email?.split('@')[0] || 'User';
      const role = (metadata.role as 'buyer' | 'farmer') || 'buyer';

      setUser({
        id: authUser.id,
        name: fullName,
        email: authUser.email || '',
        role: role,
        verified: true,
      });
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
