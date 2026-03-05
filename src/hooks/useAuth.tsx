import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  connectWallet: (address: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for prototype
const DEMO_USERS: Record<string, User & { password: string }> = {
  'voter@demo.com': { id: 'v1', name: 'Alex Johnson', email: 'voter@demo.com', role: 'voter', password: 'demo123' },
  'admin@demo.com': { id: 'a1', name: 'Sarah Admin', email: 'admin@demo.com', role: 'admin', password: 'demo123' },
  'auditor@demo.com': { id: 'au1', name: 'James Observer', email: 'auditor@demo.com', role: 'auditor', password: 'demo123' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('votelytics_user');
    if (saved) setUser(JSON.parse(saved));
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const demo = DEMO_USERS[email];
    if (demo && demo.password === password) {
      const { password: _, ...userData } = demo;
      setUser(userData);
      localStorage.setItem('votelytics_user', JSON.stringify(userData));
      return;
    }
    // Check registered users
    const registered = localStorage.getItem(`votelytics_reg_${email}`);
    if (registered) {
      const regUser = JSON.parse(registered);
      if (regUser.password === password) {
        const { password: _, ...userData } = regUser;
        setUser(userData);
        localStorage.setItem('votelytics_user', JSON.stringify(userData));
        return;
      }
    }
    throw new Error('Invalid credentials');
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    await new Promise(r => setTimeout(r, 800));
    if (DEMO_USERS[email]) throw new Error('Email already exists');
    const newUser = { id: crypto.randomUUID(), name, email, role, password };
    localStorage.setItem(`votelytics_reg_${email}`, JSON.stringify(newUser));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    localStorage.setItem('votelytics_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('votelytics_user');
  };

  const connectWallet = (address: string) => {
    if (user) {
      const updated = { ...user, walletAddress: address };
      setUser(updated);
      localStorage.setItem('votelytics_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, connectWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
