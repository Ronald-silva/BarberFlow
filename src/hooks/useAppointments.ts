// Hook para gerenciar agendamentos com React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/supabaseApi';
import { Appointment } from '../types';
import { logError } from '../utils/errors';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: any) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

/**
 * Hook para buscar todos os agendamentos
 */
export function useAppointments(barbershopId?: string, date?: Date) {
  return useQuery({
    queryKey: appointmentKeys.list({ barbershopId, date }),
    queryFn: async () => {
      try {
        const appointments = await api.getAppointments(barbershopId, date);
        return appointments;
      } catch (error) {
        logError(error, 'useAppointments');
        throw error;
      }
    },
    enabled: !!barbershopId,
  });
}

/**
 * Hook para buscar um agendamento específico
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      try {
        const appointment = await api.getAppointment(id);
        return appointment;
      } catch (error) {
        logError(error, 'useAppointment');
        throw error;
      }
    },
    enabled: !!id,
  });
}

/**
 * Hook para criar agendamento
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const appointment = await api.createAppointment(data);
        return appointment;
      } catch (error) {
        logError(error, 'useCreateAppointment');
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidar todas as queries de agendamentos
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Hook para atualizar agendamento
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      try {
        const appointment = await api.updateAppointment(id, data);
        return appointment;
      } catch (error) {
        logError(error, 'useUpdateAppointment');
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidar query específica e lista
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Hook para deletar agendamento
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.deleteAppointment(id);
        return id;
      } catch (error) {
        logError(error, 'useDeleteAppointment');
        throw error;
      }
    },
    onSuccess: (id) => {
      // Remover da cache e invalidar lista
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Hook para cancelar agendamento
 */
export function useCancelAppointment() {
  const { mutate: updateAppointment, ...rest } = useUpdateAppointment();

  const cancelAppointment = (id: string) => {
    updateAppointment({ id, data: { status: 'canceled' } });
  };

  return {
    cancelAppointment,
    ...rest,
  };
}
