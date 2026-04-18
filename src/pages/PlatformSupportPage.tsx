import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PageContainer, Card, CardContent, Heading, Text, Grid } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useToastContext } from '../contexts/ToastContext';
import { supabaseApi as api } from '../services/supabaseApi';

const TicketCard = styled(Card)`
  cursor: pointer;
  transition: ${props => props.theme.transitions.base};
  border-left: 4px solid ${props => props.theme.colors.border.primary};

  &:hover {
    transform: translateX(4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }

  &.urgent {
    border-left-color: ${props => props.theme.colors.error};
  }

  &.high {
    border-left-color: ${props => props.theme.colors.warning};
  }

  &.normal {
    border-left-color: ${props => props.theme.colors.info};
  }

  &.low {
    border-left-color: ${props => props.theme.colors.success};
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[3]};
`;

const TicketTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const TicketMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $variant?: 'urgent' | 'high' | 'normal' | 'low' | 'open' | 'closed' }>`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  ${props => {
    switch (props.$variant) {
      case 'urgent':
        return `
          background: ${props.theme.colors.errorLight};
          color: ${props.theme.colors.error};
        `;
      case 'high':
        return `
          background: ${props.theme.colors.warningLight};
          color: ${props.theme.colors.warning};
        `;
      case 'normal':
        return `
          background: ${props.theme.colors.infoLight};
          color: ${props.theme.colors.info};
        `;
      case 'low':
        return `
          background: ${props.theme.colors.successLight};
          color: ${props.theme.colors.success};
        `;
      case 'open':
        return `
          background: color-mix(in srgb, var(--bs-brand-main, #c8922a) 15%, transparent);
          color: var(--bs-brand-light, #e8b84b);
        `;
      case 'closed':
        return `
          background: ${props.theme.colors.text.tertiary}20;
          color: ${props.theme.colors.text.tertiary};
        `;
      default:
        return '';
    }
  }}
`;

const StatsCard = styled(Card)`
  text-align: center;
  position: relative;
  overflow: hidden;

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
  background: linear-gradient(135deg, var(--bs-brand-main, #c8922a) 0%, var(--bs-brand-light, #e8b84b) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: ${props => props.theme.spacing[2]} 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
  flex-wrap: wrap;
`;

type SupportTicket = {
  id: string;
  title: string;
  barbershop: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'open' | 'closed';
  createdAt: string;
  source: 'email' | 'subscription';
};

const PlatformSupportPage: React.FC = () => {
  const toast = useToastContext();
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openTickets, setOpenTickets] = useState(0);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [resolutionRate, setResolutionRate] = useState(0);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const fetchSupportData = async (showFeedback = false) => {
    setLoading(true);
    setRefreshing(true);
    try {
      const overview = await api.getPlatformSupportOverview();
      setOpenTickets(overview.openTickets);
      setResolvedToday(overview.resolvedToday);
      setResolutionRate(overview.resolutionRate);
      setTickets(overview.tickets);
      if (showFeedback) {
        toast.success('Painel de suporte atualizado.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados de suporte:', error);
      setOpenTickets(0);
      setResolvedToday(0);
      setResolutionRate(0);
      setTickets([]);
      toast.error('Falha ao carregar dados de suporte.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchSupportData();
  }, []);

  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  }), [filter, tickets]);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Text>Carregando central de suporte...</Text>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <Heading $level={1} $gradient>
          Central de Suporte 💬
        </Heading>
        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
          Gerencie tickets e solicitações das barbearias
        </Text>
        <div style={{ marginTop: '1rem' }}>
          <Button $variant="secondary" onClick={() => void fetchSupportData(true)} disabled={refreshing}>
            {refreshing ? 'Atualizando...' : 'Recarregar Suporte'}
          </Button>
        </div>
      </div>

      <Grid $columns={4} $responsive style={{ marginBottom: '2rem' }}>
        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tickets Abertos
            </Text>
            <StatsValue>{openTickets}</StatsValue>
          </CardContent>
        </StatsCard>

        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Taxa de Resolução
            </Text>
            <StatsValue>{resolutionRate.toFixed(0)}%</StatsValue>
          </CardContent>
        </StatsCard>

        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resolvidos Hoje
            </Text>
            <StatsValue>{resolvedToday}</StatsValue>
          </CardContent>
        </StatsCard>

        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tickets no Painel
            </Text>
            <StatsValue>{tickets.length}</StatsValue>
          </CardContent>
        </StatsCard>
      </Grid>

      <FilterBar>
        <Button
          $variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          Todos ({tickets.length})
        </Button>
        <Button
          $variant={filter === 'open' ? 'primary' : 'secondary'}
          onClick={() => setFilter('open')}
        >
          Abertos ({tickets.filter(t => t.status === 'open').length})
        </Button>
        <Button
          $variant={filter === 'closed' ? 'primary' : 'secondary'}
          onClick={() => setFilter('closed')}
        >
          Resolvidos ({tickets.filter(t => t.status === 'closed').length})
        </Button>
      </FilterBar>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredTickets.length ? filteredTickets.map((ticket, index) => (
          <TicketCard
            key={ticket.id}
            $variant="elevated"
            className={`${ticket.priority} slide-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent>
              <TicketHeader>
                <div style={{ flex: 1 }}>
                  <TicketTitle>{ticket.title}</TicketTitle>
                  <Text $size="sm" $color="tertiary" style={{ marginTop: '0.5rem' }}>
                    {ticket.barbershop}
                  </Text>
                </div>
                <TicketMeta>
                  <Badge $variant={ticket.priority}>
                    {ticket.priority === 'urgent' ? 'Urgente' :
                     ticket.priority === 'high' ? 'Alta' :
                     ticket.priority === 'normal' ? 'Normal' : 'Baixa'}
                  </Badge>
                  <Badge $variant={ticket.status}>
                    {ticket.status === 'open' ? 'Aberto' : 'Resolvido'}
                  </Badge>
                </TicketMeta>
              </TicketHeader>
              <Text $size="sm" $color="tertiary">
                📅 {new Date(ticket.createdAt).toLocaleString('pt-BR')} • Fonte: {ticket.source === 'email' ? 'Email' : 'Assinatura'}
              </Text>
            </CardContent>
          </TicketCard>
        )) : (
          <Card $variant="elevated">
            <CardContent>
              <Text $color="tertiary">Nenhum ticket encontrado para o filtro selecionado.</Text>
            </CardContent>
          </Card>
        )}
      </div>

      <Card $variant="elevated" style={{ marginTop: '2rem' }}>
        <CardContent>
          <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
            🚀 Próximas Implementações
          </Heading>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
            <li>Sistema de tickets completo com respostas</li>
            <li>Chat em tempo real com barbearias</li>
            <li>Base de conhecimento (FAQ)</li>
            <li>Automação de respostas comuns</li>
            <li>Integração com email e WhatsApp</li>
            <li>SLA tracking e alertas</li>
          </ul>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default PlatformSupportPage;
