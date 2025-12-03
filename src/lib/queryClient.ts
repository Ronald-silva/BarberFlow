// Configuração do React Query
import { QueryClient } from '@tanstack/react-query';
import { logError } from '../utils/errors';

// Configuração global do Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo de cache: 5 minutos
      staleTime: 1000 * 60 * 5,
      // Tempo antes de garbage collection: 10 minutos
      gcTime: 1000 * 60 * 10,
      // Retry automático em caso de erro
      retry: 1,
      // Refetch ao focar na janela
      refetchOnWindowFocus: false,
      // Handler de erro global
      onError: (error) => {
        logError(error, 'React Query');
      },
    },
    mutations: {
      // Handler de erro global para mutations
      onError: (error) => {
        logError(error, 'React Query Mutation');
      },
    },
  },
});
