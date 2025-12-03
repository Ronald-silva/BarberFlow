import React, { useState } from 'react';
import styled from 'styled-components';
import { PageContainer, Card, CardContent, Heading, Text, Grid } from '../components/ui/Container';
import { Button } from '../components/ui/Button';

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
          background: ${props.theme.colors.primaryLight}20;
          color: ${props.theme.colors.primary};
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
    background: linear-gradient(90deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  }
`;

const StatsValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['4xl']};
  font-weight: ${props => props.theme.typography.fontWeights.extrabold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
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

const PlatformSupportPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  const mockTickets = [
    {
      id: '1',
      title: 'Erro ao processar pagamento PIX',
      barbershop: 'Barbearia João Silva',
      priority: 'urgent' as const,
      status: 'open' as const,
      date: '2025-12-03',
      time: '10:30'
    },
    {
      id: '2',
      title: 'Dúvida sobre relatórios',
      barbershop: 'Barber Shop Maria',
      priority: 'normal' as const,
      status: 'open' as const,
      date: '2025-12-02',
      time: '15:45'
    },
    {
      id: '3',
      title: 'Solicitação de cancelamento de assinatura',
      barbershop: 'Espaço Masculino',
      priority: 'high' as const,
      status: 'open' as const,
      date: '2025-12-01',
      time: '09:15'
    },
    {
      id: '4',
      title: 'Como adicionar novo profissional?',
      barbershop: 'Barbearia Central',
      priority: 'low' as const,
      status: 'closed' as const,
      date: '2025-11-30',
      time: '14:20'
    },
  ];

  const filteredTickets = mockTickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  return (
    <PageContainer className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <Heading $level={1} $gradient>
          Central de Suporte 💬
        </Heading>
        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
          Gerencie tickets e solicitações das barbearias
        </Text>
      </div>

      <Grid $columns={4} $responsive style={{ marginBottom: '2rem' }}>
        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tickets Abertos
            </Text>
            <StatsValue>12</StatsValue>
          </CardContent>
        </StatsCard>

        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tempo Médio
            </Text>
            <StatsValue>2.4h</StatsValue>
          </CardContent>
        </StatsCard>

        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resolvidos Hoje
            </Text>
            <StatsValue>8</StatsValue>
          </CardContent>
        </StatsCard>

        <StatsCard $variant="elevated">
          <CardContent>
            <Text $size="sm" $color="tertiary" $weight="medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Satisfação
            </Text>
            <StatsValue>94%</StatsValue>
          </CardContent>
        </StatsCard>
      </Grid>

      <FilterBar>
        <Button
          $variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          Todos ({mockTickets.length})
        </Button>
        <Button
          $variant={filter === 'open' ? 'primary' : 'secondary'}
          onClick={() => setFilter('open')}
        >
          Abertos ({mockTickets.filter(t => t.status === 'open').length})
        </Button>
        <Button
          $variant={filter === 'closed' ? 'primary' : 'secondary'}
          onClick={() => setFilter('closed')}
        >
          Resolvidos ({mockTickets.filter(t => t.status === 'closed').length})
        </Button>
      </FilterBar>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredTickets.map((ticket, index) => (
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
                📅 {ticket.date} às {ticket.time}
              </Text>
            </CardContent>
          </TicketCard>
        ))}
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
