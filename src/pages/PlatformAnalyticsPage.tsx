import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageContainer, Card, CardContent, Heading, Text, Grid, PageTitleRow, PageTitleEmoji } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useToastContext } from '../contexts/ToastContext';
import { supabaseApi as api } from '../services/supabaseApi';

const AnalyticsPanel = styled.div`
  width: 100%;
  min-height: 260px;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid ${props => props.theme.colors.border.primary};
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
`;

const MetricCard = styled(Card)`
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

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.extrabold};
  background: linear-gradient(135deg, var(--bs-brand-main, #c8922a) 0%, var(--bs-brand-light, #e8b84b) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: ${props => props.theme.spacing[2]} 0;
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DataList = styled.ul`
  margin: 0;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const AnalyticsToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  width: 100%;
  margin-top: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[1]};
`;

interface PlatformAnalyticsData {
  monthlyRevenue: number;
  newBarbershopsThisMonth: number;
  newBarbershopsLastMonth: number;
  conversionRate: number;
  churnRate: number;
  planDistribution: Array<{ plan: string; count: number }>;
  dailyAppointments: Array<{ date: string; count: number }>;
}

const PlatformAnalyticsPage: React.FC = () => {
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);

  const loadAnalytics = async (showFeedback = false) => {
    setLoading(true);
    setRefreshing(true);
    try {
      const overview = await api.getPlatformAnalyticsOverview();
      setData(overview);
      if (showFeedback) {
        toast.success('Analytics atualizados com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao carregar analytics da plataforma:', error);
      setData({
        monthlyRevenue: 0,
        newBarbershopsThisMonth: 0,
        newBarbershopsLastMonth: 0,
        conversionRate: 0,
        churnRate: 0,
        planDistribution: [],
        dailyAppointments: [],
      });
      toast.error('Falha ao carregar analytics da plataforma.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Text>Carregando analytics da plataforma...</Text>
        </div>
      </PageContainer>
    );
  }

  const growthDelta = (data?.newBarbershopsThisMonth || 0) - (data?.newBarbershopsLastMonth || 0);

  return (
    <PageContainer className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <PageTitleRow>
          <Heading $level={1} $gradient>
            Analytics da Plataforma
          </Heading>
          <PageTitleEmoji aria-hidden>📈</PageTitleEmoji>
        </PageTitleRow>
        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
          Análise detalhada de performance e crescimento da plataforma
        </Text>
        <AnalyticsToolbar>
          <Button $variant="secondary" onClick={() => void loadAnalytics(true)} disabled={refreshing}>
            {refreshing ? 'Atualizando...' : 'Recarregar Analytics'}
          </Button>
        </AnalyticsToolbar>
      </div>

      <Grid $columns={4} $responsive style={{ marginBottom: '2rem' }}>
        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Receita Mensal</MetricLabel>
            <MetricValue>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data?.monthlyRevenue || 0)}
            </MetricValue>
            <Text $size="sm" $color="tertiary">
              soma das assinaturas ativas
            </Text>
          </CardContent>
        </MetricCard>

        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Novos Cadastros</MetricLabel>
            <MetricValue>{data?.newBarbershopsThisMonth || 0}</MetricValue>
            <Text $size="sm" $color={growthDelta >= 0 ? 'success' : 'secondary'}>
              {growthDelta >= 0 ? '↗' : '↘'} {Math.abs(growthDelta)} vs mês anterior
            </Text>
          </CardContent>
        </MetricCard>

        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Taxa de Conversão</MetricLabel>
            <MetricValue>{(data?.conversionRate || 0).toFixed(1)}%</MetricValue>
            <Text $size="sm" $color="tertiary">
              assinaturas ativas / novos cadastros
            </Text>
          </CardContent>
        </MetricCard>

        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Churn Rate</MetricLabel>
            <MetricValue>{(data?.churnRate || 0).toFixed(1)}%</MetricValue>
            <Text $size="sm" $color="tertiary">
              assinaturas canceladas no mês
            </Text>
          </CardContent>
        </MetricCard>
      </Grid>

      <Grid $columns={2} $responsive style={{ gap: '1.5rem' }}>
        <Card $variant="elevated">
          <CardContent>
            <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
              Distribuição por Plano
            </Heading>
            <AnalyticsPanel>
              <DataList>
                {data?.planDistribution.length ? data.planDistribution.map((item) => (
                  <li key={item.plan}>
                    <strong>{item.plan}</strong>: {item.count} assinatura{item.count !== 1 ? 's' : ''}
                  </li>
                )) : (
                  <li>Nenhuma assinatura ativa encontrada.</li>
                )}
              </DataList>
            </AnalyticsPanel>
          </CardContent>
        </Card>

        <Card $variant="elevated">
          <CardContent>
            <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
              Agendamentos nos Últimos 7 Dias
            </Heading>
            <AnalyticsPanel>
              <DataList>
                {data?.dailyAppointments.length ? data.dailyAppointments.map((item) => (
                  <li key={item.date}>
                    {new Date(`${item.date}T00:00:00`).toLocaleDateString('pt-BR')}: {item.count} agendamento{item.count !== 1 ? 's' : ''}
                  </li>
                )) : (
                  <li>Nenhum agendamento no período.</li>
                )}
              </DataList>
            </AnalyticsPanel>
          </CardContent>
        </Card>
      </Grid>

      <Card $variant="elevated" style={{ marginTop: '2rem' }}>
        <CardContent>
          <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
            🚀 Próximas Implementações
          </Heading>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
            <li>Gráficos interativos com Chart.js ou Recharts</li>
            <li>Filtros por período (semana, mês, ano)</li>
            <li>Exportação de relatórios em PDF/Excel</li>
            <li>Análise de cohort de usuários</li>
            <li>Métricas de LTV (Lifetime Value)</li>
            <li>Comparação com períodos anteriores</li>
          </ul>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default PlatformAnalyticsPage;
