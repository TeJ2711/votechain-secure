import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'voter' | 'admin' | 'auditor';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, voterId: string) => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchAppUser(supabaseUser: SupabaseUser): Promise<AppUser | null> {
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', supabaseUser.id)
    .single();

  // Fetch role
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id);

  const role = (roles && roles.length > 0 ? roles[0].role : 'voter') as UserRole;

  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.user_metadata?.name || '',
    email: supabaseUser.email || '',
    role,
    walletAddress: profile?.wallet_address || undefined,
    avatarUrl: (profile as any)?.avatar_url || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        // Use setTimeout to avoid potential deadlocks with Supabase
        setTimeout(async () => {
          const appUser = await fetchAppUser(session.user);
          setUser(appUser);
          setIsLoading(false);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchAppUser(session.user).then(appUser => {
          setUser(appUser);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string, role: UserRole, voterId: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role, voter_id: voterId } },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const connectWallet = async (address: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ wallet_address: address }).eq('user_id', user.id);
    setUser(prev => prev ? { ...prev, walletAddress: address } : null);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, register, logout, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
