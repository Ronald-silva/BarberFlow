import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/supabaseApi';
import { User, Service } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { PageContainer, Heading, Text, Flex } from '../components/ui/Container';
import { Input } from '../components/ui/Input';
import { CalendarIcon } from '../components/icons';

interface AppointmentWithDetails {
    id: string;
    startDateTime: string;
    endDateTime: string;
    clientName: string;
    professionalId: string;
    services: Service[];
}

// Styled Components
const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing[4]};
    align-items: stretch;
  }
`;

const DateInput = styled(Input)`
  max-width: 200px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: 100%;
  }
`;

const ScheduleGrid = styled.div`
  background-color: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.radii.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border.primary};
  overflow: hidden;
`;

const GridContainer = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: 80px repeat(${props => props.columns}, 1fr);
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 60px repeat(${props => props.columns}, 1fr);
  }
`;

const HeaderCell = styled.div<{ isTime?: boolean }>`
  padding: ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.tertiary} 0%, ${props => props.theme.colors.background.elevated} 100%);
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  border-right: 1px solid ${props => props.theme.colors.border.primary};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  
  ${props => props.isTime && `
    background: ${props.theme.colors.background.secondary};
  `}
`;

const TimeSlot = styled.div`
  height: 60px;
  padding: ${props => props.theme.spacing[1]};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  border-right: 1px solid ${props => props.theme.colors.border.primary};
  background-color: ${props => props.theme.colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const ProfessionalColumn = styled.div`
  position: relative;
  border-right: 1px solid ${props => props.theme.colors.border.primary};
  
  &:last-child {
    border-right: none;
  }
`;

const TimeCell = styled.div`
  height: 60px;
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  background-color: ${props => props.theme.colors.background.elevated};
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.colors.interactive.hover};
  }
`;

const AppointmentCard = styled.div<{ top: number; height: number }>`
  position: absolute;
  top: ${props => props.top}px;
  left: 2px;
  right: 2px;
  height: ${props => props.height}px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: ${props => props.theme.colors.text.inverse};
  border-radius: ${props => props.theme.radii.md};
  padding: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.primaryLight};
  z-index: 10;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: ${props => props.theme.shadows.lg};
    z-index: 20;
  }
`;

const ClientName = styled.p`
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ServicesList = styled.p`
  margin: 0;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors.border.primary};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.tertiary};
`;

const SchedulePage: React.FC = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    
    const timeSlots = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    }, []);
    
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                try {
                    const [profs, apps] = await Promise.all([
                        api.getProfessionalsByBarbershop(user.barbershopId),
                        api.getAppointmentsForDate(user.barbershopId, selectedDate)
                    ]);
                    
                    if(user.role === 'member') {
                        setProfessionals(profs.filter(p => p.id === user.id));
                    } else {
                        setProfessionals(profs);
                    }

                    setAppointments(apps);
                } catch (error) {
                    console.error('Erro ao carregar agenda:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user, selectedDate]);
    
    const getAppointmentPosition = (app: AppointmentWithDetails) => {
        const start = new Date(app.startDateTime);
        const end = new Date(app.endDateTime);
        const top = (start.getHours() - 8 + start.getMinutes() / 60) * 60;
        const height = Math.max(((end.getTime() - start.getTime()) / (1000 * 60)), 30);
        return { top, height };
    };

    const formatDateForInput = (date: Date) => {
        return format(date, 'yyyy-MM-dd');
    };

    const formatDateDisplay = (date: Date) => {
        return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <Text $color="tertiary">Carregando agenda...</Text>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="fade-in">
            <ScheduleHeader>
                <div>
                    <Heading $level={1} $gradient>
                        Agenda
                    </Heading>
                    <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
                        {formatDateDisplay(selectedDate)}
                    </Text>
                </div>
                
                <Flex $align="center" $gap="0.75rem">
                    <CalendarIcon size={20} />
                    <DateInput
                        type="date"
                        value={formatDateForInput(selectedDate)}
                        onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                        $variant="filled"
                    />
                </Flex>
            </ScheduleHeader>

            {professionals.length === 0 ? (
                <EmptyState>
                    <Text $size="lg" $color="tertiary">
                        Nenhum profissional encontrado
                    </Text>
                </EmptyState>
            ) : (
                <ScheduleGrid className="slide-in">
                    <GridContainer $columns={professionals.length}>
                        {/* Header */}
                        <HeaderCell isTime />
                        {professionals.map(prof => (
                            <HeaderCell key={prof.id}>
                                {prof.name}
                            </HeaderCell>
                        ))}

                        {/* Time slots and appointments */}
                        {timeSlots.map((time, timeIndex) => (
                            <React.Fragment key={time}>
                                <TimeSlot>{time}</TimeSlot>
                                {professionals.map(prof => (
                                    <ProfessionalColumn key={`${prof.id}-${timeIndex}`}>
                                        <TimeCell />
                                        {timeIndex === 0 && appointments
                                            .filter(a => a.professionalId === prof.id)
                                            .map(app => {
                                                const { top, height } = getAppointmentPosition(app);
                                                return (
                                                    <AppointmentCard
                                                        key={app.id}
                                                        top={top}
                                                        height={height}
                                                        title={`${app.clientName} - ${app.services.map(s => s.name).join(', ')}`}
                                                    >
                                                        <ClientName>{app.clientName}</ClientName>
                                                        <ServicesList>
                                                            {app.services.map(s => s.name).join(', ')}
                                                        </ServicesList>
                                                    </AppointmentCard>
                                                );
                                            })
                                        }
                                    </ProfessionalColumn>
                                ))}
                            </React.Fragment>
                        ))}
                    </GridContainer>
                </ScheduleGrid>
            )}

            {appointments.length === 0 && professionals.length > 0 && (
                <EmptyState>
                    <Text $size="lg" $color="tertiary">
                        Nenhum agendamento para esta data
                    </Text>
                    <Text $size="sm" $color="disabled" style={{ marginTop: '0.5rem' }}>
                        Selecione outra data ou aguarde novos agendamentos
                    </Text>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default SchedulePage;