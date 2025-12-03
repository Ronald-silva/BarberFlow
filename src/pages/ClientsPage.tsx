import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { supabaseApi } from '../services/supabaseApi';
import { Client } from '../types';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageContainer, Heading, Text, Flex } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UsersIcon } from '../components/icons';

// Styled Components
const ClientsHeader = styled.div`
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

const SearchContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
  max-width: 400px;
`;

const ClientsTable = styled.div`
  background-color: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.radii.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border.primary};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr auto;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.tertiary} 0%, ${props => props.theme.colors.background.elevated} 100%);
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1.5fr 1fr 1fr auto;
  }
`;

const HeaderCell = styled.div`
  padding: ${props => props.theme.spacing[4]};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.div<{ $inactive?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr auto;
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    background-color: ${props => props.theme.colors.interactive.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.$inactive && `
    opacity: 0.7;
    background-color: ${props.theme.colors.warningLight};
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1.5fr 1fr 1fr auto;
  }
`;

const TableCell = styled.div`
  padding: ${props => props.theme.spacing[4]};
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const ClientName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const ClientInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const WhatsAppLink = styled.a`
  color: ${props => props.theme.colors.success};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const LastVisitBadge = styled.span<{ $daysSince: number }>`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  
  ${props => {
    if (props.$daysSince <= 30) {
      return `
        background-color: ${props.theme.colors.successLight};
        color: ${props.theme.colors.success};
      `;
    } else if (props.$daysSince <= 90) {
      return `
        background-color: ${props.theme.colors.warningLight};
        color: ${props.theme.colors.warning};
      `;
    } else {
      return `
        background-color: ${props.theme.colors.errorLight};
        color: ${props.theme.colors.error};
      `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.tertiary};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.border.primary};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.primary};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SuccessMessage = styled.div<{ $show: boolean }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.successLight};
  color: ${props => props.theme.colors.success};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.success}40;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-bottom: ${props => props.theme.spacing[4]};
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '-10px'});
  transition: ${props => props.theme.transitions.base};
  display: ${props => props.$show ? 'block' : 'none'};
`;

const ErrorMessage = styled.div<{ $show: boolean }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.errorLight};
  color: ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.error}40;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-bottom: ${props => props.theme.spacing[4]};
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '-10px'});
  transition: ${props => props.theme.transitions.base};
  display: ${props => props.$show ? 'block' : 'none'};
`;

const ClientsPage: React.FC = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInactive, setShowInactive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClients = async () => {
            if (user) {
                setLoading(true);
                try {
                    const result = await supabaseApi.getClientsByBarbershop(user.barbershopId);
                    setClients(result);
                } catch (error) {
                    console.error('Erro ao carregar clientes:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchClients();
    }, [user]);

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.whatsapp.includes(searchTerm);
        
        if (showInactive) {
            const daysSinceLastVisit = differenceInDays(new Date(), new Date(client.lastVisit));
            return matchesSearch && daysSinceLastVisit > 90;
        }
        
        return matchesSearch;
    });

    const clientStats = {
        total: clients.length,
        active: clients.filter(c => differenceInDays(new Date(), new Date(c.lastVisit)) <= 30).length,
        inactive: clients.filter(c => differenceInDays(new Date(), new Date(c.lastVisit)) > 90).length,
    };

    const handleRecoveryMessage = (clientName: string, clientWhatsapp: string) => {
        const link = `${window.location.origin}/#/book/navalha-dourada`;
        const message = `Olá, ${clientName}! 👋\n\nSentimos sua falta aqui na barbearia! 💈\n\nComo incentivo para você voltar, estamos oferecendo 10% de desconto no seu próximo corte. Que tal agendar?\n\n🔗 ${link}`;
        
        const whatsappUrl = `https://wa.me/${clientWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        setSuccessMessage('Mensagem de recuperação enviada!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDeleteClient = async (clientId: string, clientName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente ${clientName}?`)) {
            try {
                await supabaseApi.deleteClient(clientId);
                setClients(prev => prev.filter(c => c.id !== clientId));
                setSuccessMessage('Cliente excluído com sucesso!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                setError('Erro ao excluir cliente. Tente novamente.');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const formatWhatsApp = (whatsapp: string) => {
        const cleaned = whatsapp.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        return whatsapp;
    };

    const getDaysSinceLastVisit = (lastVisit: string) => {
        return differenceInDays(new Date(), new Date(lastVisit));
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <Text $color="tertiary">Carregando clientes...</Text>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="fade-in">
            <ClientsHeader>
                <div>
                    <Heading $level={1} $gradient>
                        Clientes
                    </Heading>
                    <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
                        Gerencie sua base de clientes
                    </Text>
                </div>
                
                <Button
                    $variant={showInactive ? "secondary" : "primary"}
                    onClick={() => setShowInactive(!showInactive)}
                >
                    {showInactive ? 'Mostrar Todos' : 'Recuperar Clientes'}
                </Button>
            </ClientsHeader>

            <StatsContainer>
                <StatCard>
                    <StatValue>{clientStats.total}</StatValue>
                    <StatLabel>Total de Clientes</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>{clientStats.active}</StatValue>
                    <StatLabel>Clientes Ativos</StatLabel>
                </StatCard>
                <StatCard>
                    <StatValue>{clientStats.inactive}</StatValue>
                    <StatLabel>Clientes Inativos</StatLabel>
                </StatCard>
            </StatsContainer>

            <SuccessMessage $show={!!successMessage}>
                ✓ {successMessage}
            </SuccessMessage>

            <ErrorMessage $show={!!error}>
                ✗ {error}
            </ErrorMessage>

            <SearchContainer>
                <Input
                    type="text"
                    placeholder="Buscar por nome ou WhatsApp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    $variant="filled"
                />
            </SearchContainer>
            
            <ClientsTable className="slide-in">
                <TableHeader>
                    <HeaderCell>Cliente</HeaderCell>
                    <HeaderCell>WhatsApp</HeaderCell>
                    <HeaderCell>Última Visita</HeaderCell>
                    {showInactive && <HeaderCell>Ação</HeaderCell>}
                </TableHeader>
                
                {filteredClients.length === 0 ? (
                    <EmptyState>
                        <UsersIcon size={48} />
                        <Text $size="lg" $color="tertiary" style={{ marginTop: '1rem' }}>
                            {searchTerm ? 'Nenhum cliente encontrado' : showInactive ? 'Nenhum cliente inativo' : 'Nenhum cliente cadastrado'}
                        </Text>
                        {searchTerm && (
                            <Text $size="sm" $color="disabled" style={{ marginTop: '0.5rem' }}>
                                Tente buscar por outro termo
                            </Text>
                        )}
                    </EmptyState>
                ) : (
                    filteredClients.map(client => {
                        const daysSince = getDaysSinceLastVisit(client.lastVisit);
                        return (
                            <TableRow key={client.id} $inactive={daysSince > 90}>
                                <TableCell>
                                    <ClientInfo>
                                        <ClientName>{client.name}</ClientName>
                                    </ClientInfo>
                                </TableCell>
                                <TableCell>
                                    <WhatsAppLink 
                                        href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {formatWhatsApp(client.whatsapp)}
                                    </WhatsAppLink>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div style={{ marginBottom: '0.25rem' }}>
                                            {format(new Date(client.lastVisit), 'dd/MM/yyyy', { locale: ptBR })}
                                        </div>
                                        <LastVisitBadge $daysSince={daysSince}>
                                            {daysSince === 0 ? 'Hoje' : 
                                             daysSince === 1 ? 'Ontem' : 
                                             `${daysSince} dias atrás`}
                                        </LastVisitBadge>
                                    </div>
                                </TableCell>
                                {showInactive && (
                                    <TableCell>
                                        <Button
                                            $variant="success"
                                            $size="sm"
                                            onClick={() => handleRecoveryMessage(client.name, client.whatsapp)}
                                        >
                                            Enviar Mensagem
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })
                )}
            </ClientsTable>
        </PageContainer>
    );
};

export default ClientsPage;