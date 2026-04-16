
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
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
  /** Recarrega dados da barbearia (ex.: após salvar cor ou logo em Configurações). */
  reloadBarbershop: () => Promise<void>;
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
        .maybeSingle();
      
      if (barbershopError) console.error('Failed to fetch barbershop', barbershopError);
      else if (barbershopData) setBarbershop(mapDbBarbershop(barbershopData));

      // Fetch subscription status
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('barbershop_id', currentUser.barbershopId)
        .in('status', ['active', 'trialing', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        console.error('Failed to fetch subscription', subError);
      } else if (subData) {
        setSubscription(subData as unknown as Subscription);
      } else {
        setSubscription(null);
      }
    }
  };

  const reloadBarbershop = useCallback(async () => {
    const uid = user?.barbershopId;
    if (!uid) return;
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error) {
      console.error('Falha ao recarregar barbearia', error);
      return;
    }
    if (data) setBarbershop(mapDbBarbershop(data));
  }, [user?.barbershopId]);

  useEffect(() => {
    const withTimeout = async <T,>(promise: PromiseLike<T>, timeoutMs: number): Promise<T | null> => {
      const timeoutPromise = new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), timeoutMs);
      });
      return Promise.race([Promise.resolve(promise), timeoutPromise]);
    };

    const initializeAuth = async () => {
      setLoading(true);
      const bootstrapGuardId = window.setTimeout(() => {
        console.warn('Auth bootstrap timed out; forcing loading=false');
        setLoading(false);
      }, 20000);

      try {
        // Verificar sessão do Supabase Auth
        const sessionResponse = await withTimeout(supabase.auth.getSession(), 8000);
        const session = sessionResponse?.data?.session ?? null;
        
        if (session?.user) {
          // Buscar dados completos do usuário
          const userQueryResponse = await withTimeout(
            supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            12000
          );
          const userData = userQueryResponse?.data ?? null;
          const userError = userQueryResponse?.error ?? null;
          
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
            // Não bloquear o bootstrap por dados secundários.
            void fetchAndSetData(currentUser).catch((error) => {
              console.error('Falha ao buscar dados complementares no bootstrap:', error);
            });
          } else {
            setUser(null);
            setBarbershop(null);
            setSubscription(null);
            localStorage.removeItem('shafar_user');
          }
        } else {
          // Limpar dados se não houver sessão
          setUser(null);
          setBarbershop(null);
          setSubscription(null);
          localStorage.removeItem('shafar_user');
        }
      } catch (error) {
        console.error('Falha ao inicializar autenticação:', error);
        setUser(null);
        setBarbershop(null);
        setSubscription(null);
        localStorage.removeItem('shafar_user');
      } finally {
        window.clearTimeout(bootstrapGuardId);
        // Nunca deixar a aplicação presa em loading (tela preta)
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Nunca bloquear o canal interno do Supabase Auth.
        void (async () => {
          try {
            if (event === 'SIGNED_IN' && session?.user) {
              const userResponse = await withTimeout(
                supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .single(),
                12000
              );
              const userData = userResponse?.data ?? null;

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
                void fetchAndSetData(currentUser).catch((error) => {
                  console.error('Falha ao buscar dados complementares após SIGNED_IN:', error);
                });
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setBarbershop(null);
              setSubscription(null);
              localStorage.removeItem('shafar_user');
            }
          } catch (error) {
            console.error('Falha no handler de onAuthStateChange:', error);
          }
        })();
      }
    );

    // Cleanup: cancelar subscription ao desmontar
    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);

    try {
      const loggedInUser = await api.login(email, pass);
      if (loggedInUser) {
        setUser(loggedInUser);
        localStorage.setItem('shafar_user', JSON.stringify(loggedInUser));

        // Dados complementares não devem travar o fluxo de autenticação.
        void fetchAndSetData(loggedInUser).catch((error) => {
          console.error('Falha ao carregar dados complementares após login:', error);
        });
        return true;
      }

      setUser(null);
      setBarbershop(null);
      setSubscription(null);
      localStorage.removeItem('shafar_user');
      return false;
    } catch (error) {
      // Permite a LoginPage exibir a causa real (credencial, rede, perfil, etc.).
      throw error;
    } finally {
      setLoading(false);
    }
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
    <AuthContext.Provider
      value={{ user, barbershop, subscription, login, logout, loading, reloadBarbershop }}
    >
      {children}
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
