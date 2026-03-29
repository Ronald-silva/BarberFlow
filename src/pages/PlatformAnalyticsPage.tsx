import React from 'react';
import styled from 'styled-components';
import { PageContainer, Card, CardContent, Heading, Text, Grid } from '../components/ui/Container';

const ChartPlaceholder = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-radius: ${props => props.theme.radii.lg};
  border: 2px dashed ${props => props.theme.colors.border.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
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
    background: linear-gradient(90deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  }
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.extrabold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
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

const PlatformAnalyticsPage: React.FC = () => {
  return (
    <PageContainer className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <Heading $level={1} $gradient>
          Analytics da Plataforma 📈
        </Heading>
        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
          Análise detalhada de performance e crescimento da plataforma
        </Text>
      </div>

      <Grid $columns={4} $responsive style={{ marginBottom: '2rem' }}>
        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Receita Mensal</MetricLabel>
            <MetricValue>R$ 15.890</MetricValue>
            <Text $size="sm" $color="success">
              ↗ +12.5% vs mês anterior
            </Text>
          </CardContent>
        </MetricCard>

        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Novos Cadastros</MetricLabel>
            <MetricValue>24</MetricValue>
            <Text $size="sm" $color="success">
              ↗ +8 este mês
            </Text>
          </CardContent>
        </MetricCard>

        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Taxa de Conversão</MetricLabel>
            <MetricValue>68%</MetricValue>
            <Text $size="sm" $color="success">
              ↗ +5% vs mês anterior
            </Text>
          </CardContent>
        </MetricCard>

        <MetricCard $variant="elevated">
          <CardContent>
            <MetricLabel>Churn Rate</MetricLabel>
            <MetricValue>2.1%</MetricValue>
            <Text $size="sm" $color="success">
              ↘ -0.3% vs mês anterior
            </Text>
          </CardContent>
        </MetricCard>
      </Grid>

      <Grid $columns={2} $responsive style={{ gap: '1.5rem' }}>
        <Card $variant="elevated">
          <CardContent>
            <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
              Crescimento de Receita
            </Heading>
            <ChartPlaceholder>
              📊 Gráfico de Receita Mensal
            </ChartPlaceholder>
            <Text $size="sm" $color="tertiary" style={{ marginTop: '1rem' }}>
              Integração com Chart.js em breve
            </Text>
          </CardContent>
        </Card>

        <Card $variant="elevated">
          <CardContent>
            <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
              Cadastros por Mês
            </Heading>
            <ChartPlaceholder>
              📊 Gráfico de Cadastros
            </ChartPlaceholder>
            <Text $size="sm" $color="tertiary" style={{ marginTop: '1rem' }}>
              Integração com Chart.js em breve
            </Text>
          </CardContent>
        </Card>

        <Card $variant="elevated">
          <CardContent>
            <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
              Agendamentos por Plano
            </Heading>
            <ChartPlaceholder>
              📊 Gráfico de Pizza
            </ChartPlaceholder>
            <Text $size="sm" $color="tertiary" style={{ marginTop: '1rem' }}>
              Integração com Chart.js em breve
            </Text>
          </CardContent>
        </Card>

        <Card $variant="elevated">
          <CardContent>
            <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
              Retenção de Clientes
            </Heading>
            <ChartPlaceholder>
              📊 Gráfico de Retenção
            </ChartPlaceholder>
            <Text $size="sm" $color="tertiary" style={{ marginTop: '1rem' }}>
              Integração com Chart.js em breve
            </Text>
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
