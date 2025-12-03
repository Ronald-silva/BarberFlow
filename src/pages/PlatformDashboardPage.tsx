import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { supabaseApi as api } from '../services/supabaseApi';
import { PageContainer, Grid, Card, CardContent, Heading, Text, Flex } from '../components/ui/Container';

interface PlatformStats {
    totalBarbershops: number;
    totalRevenue: number;
    activeSubscriptions: number;
    totalAppointments: number;
    recentBarbershops: Array<{
        id: string;
        name: string;
        slug: string;
        createdAt: string;
        status: 'active' | 'inactive' | 'trial';
        monthlyRevenue: number;
    }>;
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
  
  &.revenue {
    background: linear-gradient(135deg, ${props => props.theme.colors.success} 0%, #25A244 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  &.barbershops {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  &.subscriptions {
    background: linear-gradient(135deg, ${props => props.theme.colors.info} 0%, #0056CC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  &.appointments {
    background: linear-gradient(135deg, ${props => props.theme.colors.warning} 0%, #D97706 100%);
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

const BarbershopsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

const BarbershopItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.radii.lg};
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const BarbershopInfo = styled.div`
  flex: 1;
`;

const BarbershopName = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
`;

const BarbershopMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
`;

const StatusBadge = styled.span<{ $status: 'active' | 'inactive' | 'trial' }>`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => {
    switch (props.$status) {
      case 'active':
        return `
          background: ${props.theme.colors.successLight};
          color: ${props.theme.colors.success};
        `;
      case 'trial':
        return `
          background: ${props.theme.colors.warningLight};
          color: ${props.theme.colors.warning};
        `;
      case 'inactive':
        return `
          background: ${props.theme.colors.errorLight};
          color: ${props.theme.colors.error};
        `;
      default:
        return '';
    }
  }}
`;

const RevenueDisplay = styled.div`
  text-align: right;
`;

const RevenueValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.success};
`;

const WelcomeSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[8]};
  padding: ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-radius: ${props => props.theme.radii.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const PlatformDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlatformData = async () => {
            setLoading(true);
            try {
                // Carregar métricas da plataforma do Supabase
                const metrics = await api.getPlatformMetrics();
                const barbershops = await api.getAllBarbershops();
                
                const mockData: PlatformStats = {
                    totalBarbershops: metrics.totalBarbershops,
                    totalRevenue: metrics.monthlyRevenue,
                    activeSubscriptions: metrics.activeSubscriptions,
                    totalAppointments: metrics.todayAppointments,
                    recentBarbershops: barbershops.slice(0, 5).map(b => ({
                        id: b.id,
                        name: b.name,
                        slug: b.slug,
                        createdAt: new Date().toISOString().split('T')[0], // Placeholder
                        status: 'active' as const,
                        monthlyRevenue: Math.random() * 1000 // Placeholder
                    }))
                };
                
                setData(mockData);
            } catch (error) {
                console.error('Erro ao carregar dados da plataforma:', error);
                // Fallback para dados mock em caso de erro
                const fallbackData: PlatformStats = {
                    totalBarbershops: 0,
                    totalRevenue: 0,
                    activeSubscriptions: 0,
                    totalAppointments: 0,
                    recentBarbershops: []
                };
                setData(fallbackData);
            } finally {
                setLoading(false);
            }
        };

        fetchPlatformData();
    }, []);

    if (loading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Text>Carregando dados da plataforma...</Text>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="fade-in">
            <WelcomeSection>
                <Flex $justify="between" $align="center" $responsive>
                    <div>
                        <Heading $level={1} $gradient>
                            Dashboard da Plataforma 🚀
                        </Heading>
                        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
                            Gerencie todas as barbearias assinantes da sua plataforma
                        </Text>
                    </div>
                </Flex>
            </WelcomeSection>

            <div style={{ marginBottom: '2rem' }}>
                <Heading $level={2} $color="primary" style={{ marginBottom: '0.5rem' }}>
                    Métricas da Plataforma
                </Heading>
                <Text $color="tertiary">
                    Visão geral do desempenho da sua plataforma de agendamentos
                </Text>
            </div>

            <Grid $columns={4} $responsive>
                <StatsCard $variant="elevated" className="slide-in">
                    <CardContent>
                        <StatsLabel>Total de Barbearias</StatsLabel>
                        <StatsValue className="barbershops">
                            {data?.totalBarbershops || 0}
                        </StatsValue>
                        <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                            assinantes cadastrados
                        </Text>
                    </CardContent>
                </StatsCard>

                <StatsCard $variant="elevated" className="slide-in" style={{ animationDelay: '0.1s' }}>
                    <CardContent>
                        <StatsLabel>Receita Total</StatsLabel>
                        <StatsValue className="revenue">
                            R$ {data?.totalRevenue?.toFixed(2) || '0,00'}
                        </StatsValue>
                        <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                            receita mensal
                        </Text>
                    </CardContent>
                </StatsCard>

                <StatsCard $variant="elevated" className="slide-in" style={{ animationDelay: '0.2s' }}>
                    <CardContent>
                        <StatsLabel>Assinaturas Ativas</StatsLabel>
                        <StatsValue className="subscriptions">
                            {data?.activeSubscriptions || 0}
                        </StatsValue>
                        <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                            planos ativos
                        </Text>
                    </CardContent>
                </StatsCard>

                <StatsCard $variant="elevated" className="slide-in" style={{ animationDelay: '0.3s' }}>
                    <CardContent>
                        <StatsLabel>Total Agendamentos</StatsLabel>
                        <StatsValue className="appointments">
                            {data?.totalAppointments || 0}
                        </StatsValue>
                        <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                            este mês
                        </Text>
                    </CardContent>
                </StatsCard>
            </Grid>

            <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
                <Heading $level={2} $color="primary" style={{ marginBottom: '0.5rem' }}>
                    Barbearias Recentes
                </Heading>
                <Text $color="tertiary">
                    Últimas barbearias que se cadastraram na plataforma
                </Text>
            </div>

            <Card $variant="elevated">
                <CardContent>
                    <BarbershopsList>
                        {data?.recentBarbershops.map((barbershop) => (
                            <BarbershopItem key={barbershop.id}>
                                <BarbershopInfo>
                                    <BarbershopName>{barbershop.name}</BarbershopName>
                                    <BarbershopMeta>
                                        <span>/{barbershop.slug}</span>
                                        <span>•</span>
                                        <span>Cadastrado em {new Date(barbershop.createdAt).toLocaleDateString('pt-BR')}</span>
                                        <StatusBadge $status={barbershop.status}>
                                            {barbershop.status === 'active' ? 'Ativo' : 
                                             barbershop.status === 'trial' ? 'Trial' : 'Inativo'}
                                        </StatusBadge>
                                    </BarbershopMeta>
                                </BarbershopInfo>
                                <RevenueDisplay>
                                    <RevenueValue>
                                        R$ {barbershop.monthlyRevenue.toFixed(2)}
                                    </RevenueValue>
                                    <Text $size="sm" $color="tertiary">
                                        /mês
                                    </Text>
                                </RevenueDisplay>
                            </BarbershopItem>
                        ))}
                    </BarbershopsList>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default PlatformDashboardPage;