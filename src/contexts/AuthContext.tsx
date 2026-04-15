
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Barbershop, Subscription } from '../types';
import { api, mapDbBarbershop } from '../services/supabaseApi';
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
      else if (barbershopData) setBarbershop(mapDbBarbershop(barbershopData));

      // Fetch subscription status
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('barbershop_id', currentUser.barbershopId)
        .in('status', ['active', 'trialing'])
        .single();

      if (subError && subError.code !== 'PGRST116') { // Ignore 'no rows found'
        console.error('Failed to fetch subscription', subError);
      } else if (subData) {
        setSubscription({
          ...subData,
          status: subData.status as Subscription['status'],
        });
      } else {
        setSubscription(null);
      }
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Verificar sessão do Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Buscar dados completos do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData && !userError) {
          const currentUser: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            barbershopId: userData.barbershop_id,
            role: userData.role as User['role'],
            workHours: Array.isArray(userData.work_hours) ? userData.work_hours : [],
          };
          
          setUser(currentUser);
          localStorage.setItem('shafar_user', JSON.stringify(currentUser));
          await fetchAndSetData(currentUser);
        }
      } else {
        // Limpar dados se não houver sessão
        setUser(null);
        setBarbershop(null);
        setSubscription(null);
        localStorage.removeItem('shafar_user');
      }
      
      setLoading(false);
    };
    
    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Buscar dados do usuário
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            const currentUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              barbershopId: userData.barbershop_id,
              role: userData.role as User['role'],
              workHours: Array.isArray(userData.work_hours) ? userData.work_hours : [],
            };
            
            setUser(currentUser);
            localStorage.setItem('shafar_user', JSON.stringify(currentUser));
            await fetchAndSetData(currentUser);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setBarbershop(null);
          setSubscription(null);
          localStorage.removeItem('shafar_user');
        } else if (event === 'TOKEN_REFRESHED') {
          // Token foi renovado automaticamente, nada a fazer
          console.log('Token refreshed successfully');
        }
      }
    );

    // Cleanup: cancelar subscription ao desmontar
    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);

    // Limpar sessão anterior antes de fazer login
    await supabase.auth.signOut();

    const loggedInUser = await api.login(email, pass);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('shafar_user', JSON.stringify(loggedInUser));
      await fetchAndSetData(loggedInUser);
      setLoading(false);
      return true;
    }
    setUser(null);
    setBarbershop(null);
    setSubscription(null);
    localStorage.removeItem('shafar_user');
    setLoading(false);
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBarbershop(null);
    setSubscription(null);
    localStorage.removeItem('shafar_user');
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
