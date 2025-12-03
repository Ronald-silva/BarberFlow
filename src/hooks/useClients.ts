// Hook para gerenciar clientes com React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/supabaseApi';
import { Client } from '../types';
import { logError } from '../utils/errors';

// Query keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (barbershopId?: string) => [...clientKeys.lists(), barbershopId] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

/**
 * Hook para buscar todos os clientes
 */
export function useClients(barbershopId?: string) {
  return useQuery({
    queryKey: clientKeys.list(barbershopId),
    queryFn: async () => {
      try {
        const clients = await api.getClients(barbershopId);
        return clients;
      } catch (error) {
        logError(error, 'useClients');
        throw error;
      }
    },
    enabled: !!barbershopId,
  });
}

/**
 * Hook para buscar um cliente específico
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: async () => {
      try {
        const client = await api.getClient(id);
        return client;
      } catch (error) {
        logError(error, 'useClient');
        throw error;
      }
    },
    enabled: !!id,
  });
}

/**
 * Hook para criar cliente
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const client = await api.createClient(data);
        return client;
      } catch (error) {
        logError(error, 'useCreateClient');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook para atualizar cliente
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      try {
        const client = await api.updateClient(id, data);
        return client;
      } catch (error) {
        logError(error, 'useUpdateClient');
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook para deletar cliente
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.deleteClient(id);
        return id;
      } catch (error) {
        logError(error, 'useDeleteClient');
        throw error;
      }
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
