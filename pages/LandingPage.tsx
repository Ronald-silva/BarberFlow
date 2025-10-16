import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, Heading, Text, Flex, Grid } from '../components/ui/Container';
import { CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, SettingsIcon, DashboardIcon } from '../components/icons';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.primary} 0%, ${props => props.theme.colors.background.secondary} 100%);
`;

const Header = styled.header`
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[6]};
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.typography.fontSizes['3xl']};
  }
`;

const HeroSection = styled.section`
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[4]};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[16]} ${props => props.theme.spacing[6]};
  }
`;

const HeroTitle = styled(Heading)`
  margin-bottom: ${props => props.theme.spacing[6]};
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroSubtitle = styled(Text)`
  margin-bottom: ${props => props.theme.spacing[8]};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesSection = styled.section`
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[4]};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[16]} ${props => props.theme.spacing[6]};
  }
`;

const FeatureCard = styled(Card)`
  text-align: center;
  height: 100%;
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const FeatureIcon = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  border-radius: ${props => props.theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.text.inverse};
`;

const CTASection = styled.section`
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  text-align: center;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[16]} ${props => props.theme.spacing[6]};
  }
`;

const PricingCard = styled(Card)`
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
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  }
`;

const Price = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['4xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
  margin: ${props => props.theme.spacing[4]} 0;
`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CalendarIcon size={32} />,
      title: 'Agendamento Online',
      description: 'Sistema completo de agendamentos com calendário intuitivo e notificações automáticas.'
    },
    {
      icon: <UsersIcon size={32} />,
      title: 'Gestão de Clientes',
      description: 'Cadastro completo de clientes com histórico de serviços e preferências.'
    },
    {
      icon: <ScissorsIcon size={32} />,
      title: 'Catálogo de Serviços',
      description: 'Configure seus serviços, preços e duração de forma simples e organizada.'
    },
    {
      icon: <TeamIcon size={32} />,
      title: 'Equipe Completa',
      description: 'Gerencie profissionais, horários de trabalho e permissões de acesso.'
    },
    {
      icon: <DashboardIcon size={32} />,
      title: 'Relatórios Detalhados',
      description: 'Acompanhe faturamento, agendamentos e performance da sua barbearia.'
    },
    {
      icon: <SettingsIcon size={32} />,
      title: 'Configuração Flexível',
      description: 'Personalize horários, serviços e configurações conforme sua necessidade.'
    }
  ];

  return (
    <LandingContainer>
      <Header>
        <Nav>
          <Logo>BarberFlow</Logo>
          <Flex $gap="1rem">
            <Button $variant="secondary" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/register')}>
              Cadastrar Barbearia
            </Button>
          </Flex>
        </Nav>
      </Header>

      <HeroSection>
        <HeroTitle $level={1} $gradient>
          O Sistema Completo para Sua Barbearia
        </HeroTitle>
        <HeroSubtitle $size="lg" $color="secondary">
          Gerencie agendamentos, clientes e equipe em uma plataforma moderna e intuitiva. 
          Aumente sua produtividade e ofereça uma experiência excepcional aos seus clientes.
        </HeroSubtitle>
        <Flex $justify="center" $gap="1rem" $responsive>
          <Button size="lg" onClick={() => navigate('/register')}>
            Começar Gratuitamente
          </Button>
        </Flex>
      </HeroSection>

      <FeaturesSection>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Heading $level={2} $color="primary">
            Tudo que Sua Barbearia Precisa
          </Heading>
          <Text $size="lg" $color="tertiary" style={{ marginTop: '1rem' }}>
            Funcionalidades completas para modernizar seu negócio
          </Text>
        </div>

        <Grid $columns={3} $gap="2rem" $responsive>
          {features.map((feature, index) => (
            <FeatureCard key={index} $variant="elevated">
              <CardContent>
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                <Heading $level={4} $color="primary" style={{ marginBottom: '1rem' }}>
                  {feature.title}
                </Heading>
                <Text $color="secondary">
                  {feature.description}
                </Text>
              </CardContent>
            </FeatureCard>
          ))}
        </Grid>
      </FeaturesSection>

      <CTASection>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Heading $level={2} $gradient style={{ marginBottom: '2rem' }}>
            Pronto para Modernizar Sua Barbearia?
          </Heading>
          
          <PricingCard $variant="elevated" style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <CardContent>
              <Heading $level={3} $color="primary">
                Plano Completo
              </Heading>
              <Price>
                Gratuito
                <div style={{ fontSize: '1rem', fontWeight: 'normal', color: '#9CA3AF' }}>
                  para sempre
                </div>
              </Price>
              <ul style={{ 
                textAlign: 'left', 
                listStyle: 'none', 
                padding: 0,
                margin: '2rem 0'
              }}>
                <li style={{ padding: '0.5rem 0', color: '#E5E7EB' }}>✅ Agendamentos ilimitados</li>
                <li style={{ padding: '0.5rem 0', color: '#E5E7EB' }}>✅ Clientes ilimitados</li>
                <li style={{ padding: '0.5rem 0', color: '#E5E7EB' }}>✅ Equipe completa</li>
                <li style={{ padding: '0.5rem 0', color: '#E5E7EB' }}>✅ Relatórios detalhados</li>
                <li style={{ padding: '0.5rem 0', color: '#E5E7EB' }}>✅ Suporte técnico</li>
              </ul>
            </CardContent>
          </PricingCard>

          <Text $size="lg" $color="secondary" style={{ marginBottom: '2rem' }}>
            Cadastre sua barbearia em menos de 2 minutos e comece a usar hoje mesmo.
          </Text>
          
          <Button size="lg" onClick={() => navigate('/register')}>
            Cadastrar Minha Barbearia
          </Button>
        </div>
      </CTASection>
    </LandingContainer>
  );
};

export default LandingPage;