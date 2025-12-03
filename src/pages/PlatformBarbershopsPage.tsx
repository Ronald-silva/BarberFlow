import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabaseApi as api } from '../services/supabaseApi';
import { Barbershop } from '../types';
import { PageContainer, Grid, Card, CardContent, Heading, Text, Flex } from '../components/ui/Container';

// Styled Components
const BarbershopCard = styled(Card)`
  position: relative;
  overflow: hidden;
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const BarbershopHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const BarbershopLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.lg};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.inverse};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  font-size: ${props => props.theme.typography.fontSizes.lg};
`;

const BarbershopInfo = styled.div`
  flex: 1;
`;

const BarbershopName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
`;

const BarbershopSlug = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  font-family: monospace;
`;

const BarbershopMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
`;

const MetaItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
`;

const MetaLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const MetaValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
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

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.radii.lg};
  background: ${props => props.theme.colors.background.elevated};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes.base};
  transition: ${props => props.theme.transitions.base};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.text.tertiary};
`;

const PlatformBarbershopsPage: React.FC = () => {
    const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBarbershops = async () => {
            setLoading(true);
            try {
                const data = await api.getAllBarbershops();
                setBarbershops(data);
            } catch (error) {
                console.error('Erro ao carregar barbearias:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBarbershops();
    }, []);

    const filteredBarbershops = barbershops.filter(barbershop =>
        barbershop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barbershop.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Text>Carregando barbearias...</Text>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <Heading $level={1} $gradient>
                    Barbearias da Plataforma 💈
                </Heading>
                <Text $color="secondary" style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
                    Gerencie todas as barbearias cadastradas na sua plataforma
                </Text>
                
                <Flex $justify="between" $align="center" $responsive style={{ marginBottom: '2rem' }}>
                    <SearchBar
                        type="text"
                        placeholder="Buscar barbearias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Text $size="sm" $color="tertiary">
                        {filteredBarbershops.length} barbearia{filteredBarbershops.length !== 1 ? 's' : ''} encontrada{filteredBarbershops.length !== 1 ? 's' : ''}
                    </Text>
                </Flex>
            </div>

            {filteredBarbershops.length === 0 ? (
                <EmptyState>
                    <Heading $level={3} $color="tertiary">
                        {searchTerm ? 'Nenhuma barbearia encontrada' : 'Nenhuma barbearia cadastrada'}
                    </Heading>
                    <Text $color="tertiary" style={{ marginTop: '0.5rem' }}>
                        {searchTerm 
                            ? 'Tente ajustar os termos de busca'
                            : 'As barbearias aparecerão aqui quando se cadastrarem na plataforma'
                        }
                    </Text>
                </EmptyState>
            ) : (
                <Grid $columns={3} $responsive>
                    {filteredBarbershops.map((barbershop, index) => (
                        <BarbershopCard 
                            key={barbershop.id} 
                            $variant="elevated" 
                            className="slide-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardContent>
                                <BarbershopHeader>
                                    <BarbershopLogo>
                                        {barbershop.logoUrl ? (
                                            <img 
                                                src={barbershop.logoUrl} 
                                                alt={barbershop.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                                            />
                                        ) : (
                                            barbershop.name.charAt(0).toUpperCase()
                                        )}
                                    </BarbershopLogo>
                                    <BarbershopInfo>
                                        <BarbershopName>{barbershop.name}</BarbershopName>
                                        <BarbershopSlug>/{barbershop.slug}</BarbershopSlug>
                                    </BarbershopInfo>
                                    <StatusBadge $status="active">
                                        Ativo
                                    </StatusBadge>
                                </BarbershopHeader>

                                <BarbershopMeta>
                                    <MetaItem>
                                        <MetaLabel>Endereço:</MetaLabel>
                                        <MetaValue>{barbershop.address || 'Não informado'}</MetaValue>
                                    </MetaItem>
                                    <MetaItem>
                                        <MetaLabel>Link de Agendamento:</MetaLabel>
                                        <MetaValue style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                            /book/{barbershop.slug}
                                        </MetaValue>
                                    </MetaItem>
                                    <MetaItem>
                                        <MetaLabel>Status:</MetaLabel>
                                        <MetaValue style={{ color: '#10B981' }}>
                                            Assinatura Ativa
                                        </MetaValue>
                                    </MetaItem>
                                </BarbershopMeta>
                            </CardContent>
                        </BarbershopCard>
                    ))}
                </Grid>
            )}
        </PageContainer>
    );
};

export default PlatformBarbershopsPage;