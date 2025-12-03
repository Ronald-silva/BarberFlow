
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { supabaseApi } from '../services/supabaseApi';
import { PageContainer, Grid, Card, CardContent, Heading, Text, Flex } from '../components/ui/Container';

interface DashboardData {
    totalAppointments: number;
    faturamentoPrevisto: number;
    nextClientName: string;
}

// Styled Components
const StatsCard = styled(Card)`
  position: relative;
  overflow: hidden;
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  }
`;

const StatsValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['4xl']};
  font-weight: ${props => props.theme.typography.fontWeights.extrabold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1;
  margin-top: ${props => props.theme.spacing[3]};
  
  &.currency {
    background: linear-gradient(135deg, ${props => props.theme.colors.success} 0%, #25A244 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  &.appointments {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  &.client {
    background: linear-gradient(135deg, ${props => props.theme.colors.info} 0%, #0056CC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const StatsLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

const WelcomeSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[8]};
  padding: ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-radius: ${props => props.theme.radii.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const DateDisplay = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-top: ${props => props.theme.spacing[2]};
`;

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                try {
                    const result = await supabaseApi.getDashboardData(user.barbershopId, new Date());
                    setData(result);
                } catch (error) {
                    console.error('Erro ao carregar dados do dashboard:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user]);

    const formatDate = () => {
        return new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <Text $color="tertiary">Carregando dados do dashboard...</Text>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="fade-in">
            <WelcomeSection>
                <Flex $justify="between" $align="center" $responsive>
                    <div>
                        <Heading $level={1} $gradient>
                            Olá, {user?.name}! 👋
                        </Heading>
                        <DateDisplay>
                            {formatDate()}
                        </DateDisplay>
                    </div>
                </Flex>
            </WelcomeSection>

            <div style={{ marginBottom: '2rem' }}>
                <Heading $level={2} $color="primary" style={{ marginBottom: '0.5rem' }}>
                    Visão Geral de Hoje
                </Heading>
                <Text $color="tertiary">
                    Acompanhe o desempenho da sua barbearia em tempo real
                </Text>
            </div>

            <Grid $columns={3} $responsive>
                <StatsCard $variant="elevated" className="slide-in">
                    <CardContent>
                        <StatsLabel>Total de Agendamentos</StatsLabel>
                        <StatsValue className="appointments">
                            {data?.totalAppointments || 0}
                        </StatsValue>
                        <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                            {data?.totalAppointments === 1 ? 'agendamento hoje' : 'agendamentos hoje'}
                        </Text>
                    </CardContent>
                </StatsCard>

                <StatsCard $variant="elevated" className="slide-in" style={{ animationDelay: '0.1s' }}>
                    <CardContent>
                        <StatsLabel>Faturamento Previsto</StatsLabel>
                        <StatsValue className="currency">
                            R$ {data?.faturamentoPrevisto?.toFixed(2) || '0,00'}
                        </StatsValue>
                        <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                            receita estimada hoje
                        </Text>
                    </CardContent>
                </StatsCard>

                <StatsCard $variant="elevated" className="slide-in" style={{ animationDelay: '0.2s' }}>
                    <CardContent>
                        <StatsLabel>Próximo Cliente</StatsLabel>
                        <StatsValue className="client">
                            {data?.nextClientName === 'Nenhum' ? '—' : data?.nextClientName}
                        </StatsValue>
                        <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                            {data?.nextClientName === 'Nenhum' ? 'nenhum agendamento' : 'próximo atendimento'}
                        </Text>
                    </CardContent>
                </StatsCard>
            </Grid>
        </PageContainer>
    );
};

export default DashboardPage;
