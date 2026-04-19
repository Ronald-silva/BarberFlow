import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useToastContext } from '../contexts/ToastContext';
import { supabaseApi as api } from '../services/supabaseApi';
import { PageContainer, Grid, Card, CardContent, Heading, Text, Flex, PageTitleRow, PageTitleEmoji } from '../components/ui/Container';
import { Button } from '../components/ui/Button';

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
    background: linear-gradient(90deg, var(--bs-brand-main, #c8922a) 0%, var(--bs-brand-light, #e8b84b) 100%);
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
    background: linear-gradient(135deg, var(--bs-brand-main, #c8922a) 0%, var(--bs-brand-light, #e8b84b) 100%);
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
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.radii.lg};
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    border-color: var(--bs-brand-main, #c8922a);
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
  padding: ${props => props.theme.spacing[5]} ${props => props.theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-radius: ${props => props.theme.radii.xl};
  border: 1px solid ${props => props.theme.colors.border.primary};
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -40px;
    top: -40px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle,
      color-mix(in srgb, var(--bs-brand-main, #c8922a) 8%, transparent) 0%,
      transparent 70%);
    pointer-events: none;
  }
`;

const PlatformDashboardPage: React.FC = () => {
    const toast = useToastContext();
    const [data, setData] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPlatformData = async (showFeedback = false) => {
        setLoading(true);
        setRefreshing(true);
        try {
            const metrics = await api.getPlatformMetrics();
            const recentBarbershops = await api.getPlatformBarbershopSummaries(5);
            
            const statsData: PlatformStats = {
                totalBarbershops: metrics.totalBarbershops,
                totalRevenue: metrics.monthlyRevenue,
                activeSubscriptions: metrics.activeSubscriptions,
                totalAppointments: metrics.todayAppointments,
                recentBarbershops
            };
            
            setData(statsData);
            if (showFeedback) {
                toast.success('Dados da plataforma atualizados.');
            }
        } catch (error) {
            console.error('Erro ao carregar dados da plataforma:', error);
            const fallbackData: PlatformStats = {
                totalBarbershops: 0,
                totalRevenue: 0,
                activeSubscriptions: 0,
                totalAppointments: 0,
                recentBarbershops: []
            };
            setData(fallbackData);
            toast.error('Falha ao atualizar dados da plataforma.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadPlatformData();
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
                        <PageTitleRow>
                          <Heading $level={1} $gradient>
                            Dashboard da Plataforma
                          </Heading>
                          <PageTitleEmoji aria-hidden>🚀</PageTitleEmoji>
                        </PageTitleRow>
                        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
                            Gerencie todas as barbearias assinantes da sua plataforma
                        </Text>
                    </div>
                    <Button $variant="secondary" onClick={() => void loadPlatformData(true)} disabled={refreshing}>
                        {refreshing ? 'Atualizando...' : 'Recarregar Dados'}
                    </Button>
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
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.totalRevenue || 0)}
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
                            hoje
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
                        {data?.recentBarbershops.length ? data.recentBarbershops.map((barbershop) => (
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
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(barbershop.monthlyRevenue)}
                                    </RevenueValue>
                                    <Text $size="sm" $color="tertiary">
                                        /mês
                                    </Text>
                                </RevenueDisplay>
                            </BarbershopItem>
                        )) : (
                            <Text $color="tertiary">Nenhuma barbearia recente encontrada.</Text>
                        )}
                    </BarbershopsList>
                </CardContent>
            </Card>
        </PageContainer>
    );
};

export default PlatformDashboardPage;