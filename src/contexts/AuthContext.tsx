
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Barbershop, Subscription } from '../types';
import { api } from '../services/supabaseApi';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  barbershop: Barbershop | null;
  subscription: Subscription | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetData = async (currentUser: User) => {
    if (currentUser && currentUser.barbershopId) {
      // Fetch barbershop details
      const { data: barbershopData, error: barbershopError } = await supabase
        .from('barbershops')
        .select('*')
        .eq('id', currentUser.barbershopId)
        .single();
      
      if (barbershopError) console.error('Failed to fetch barbershop', barbershopError);
      else setBarbershop(barbershopData);

      // Fetch subscription status
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('barbershop_id', currentUser.barbershopId)
        .in('status', ['active', 'trialing'])
        .single();

      if (subError && subError.code !== 'PGRST116') { // Ignore 'no rows found'
        console.error('Failed to fetch subscription', subError);
      } else {
        setSubscription(subData);
      }
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem('barberflow_user');
      if (storedUser) {
        const currentUser: User = JSON.parse(storedUser);
        setUser(currentUser);
        await fetchAndSetData(currentUser);
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);

    // Limpar sessão anterior antes de fazer login
    await supabase.auth.signOut();

    const loggedInUser = await api.login(email, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('barberflow_user', JSON.stringify(loggedInUser));
      await fetchAndSetData(loggedInUser);
      setLoading(false);
      return true;
    }
    setUser(null);
    setBarbershop(null);
    setSubscription(null);
    localStorage.removeItem('barberflow_user');
    setLoading(false);
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBarbershop(null);
    setSubscription(null);
    localStorage.removeItem('barberflow_user');
    window.location.hash = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, barbershop, subscription, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
