import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
const AuthContext = createContext(undefined);
async function fetchUserProfile(supabaseUser) {
  // Fetch profile
  const {
    data: profile
  } = await supabase.from('profiles').select('name, email').eq('user_id', supabaseUser.id).single();

  // Fetch role
  const {
    data: roleData
  } = await supabase.from('user_roles').select('role').eq('user_id', supabaseUser.id).single();
  if (!profile || !roleData) return null;
  return {
    id: supabaseUser.id,
    email: profile.email,
    name: profile.name,
    role: roleData.role
  };
}
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid deadlock with Supabase auth
        setTimeout(async () => {
          const profile = await fetchUserProfile(session.user);
          setUser(profile);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({
      data: {
        session
      }
    }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  const login = async (email, password) => {
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return {
      success: false,
      error: error.message
    };
    return {
      success: true
    };
  };
  const signup = async (email, password, name, role) => {
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        },
        emailRedirectTo: window.location.origin
      }
    });
    if (error) return {
      success: false,
      error: error.message
    };
    return {
      success: true
    };
  };
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  return <AuthContext.Provider value={{
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}