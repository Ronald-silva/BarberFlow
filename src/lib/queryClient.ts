// Configuração do React Query
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { logError } from '../utils/errors';

// Configuração global do Query Client
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => logError(error, 'React Query'),
  }),
  mutationCache: new MutationCache({
    onError: (error) => logError(error, 'React Query Mutation'),
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {},
  },
});
