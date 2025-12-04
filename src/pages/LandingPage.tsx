import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, Heading, Text, Flex, Grid } from '../components/ui/Container';
import { CalendarIcon, UsersIcon, ScissorsIcon, TeamIcon, SettingsIcon, DashboardIcon, PixIcon, BitcoinIcon, PaymentIcon, PixImage } from '../components/icons';

const LandingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.primary} 0%, ${props => props.theme.colors.background.secondary} 100%);
`;

const Header = styled.header`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[6]};
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: ${props => props.theme.spacing[2]};
`;

const NavButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  align-items: center;

  /* Responsividade para mobile */
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    gap: ${props => props.theme.spacing[2]};
  }
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  white-space: nowrap;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSizes['2xl']};
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.typography.fontSizes['3xl']};
  }
`;

const HeroSection = styled.section`
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[16]} ${props => props.theme.spacing[6]};
  }
`;

const HeroTitle = styled(Heading)`
  margin-bottom: ${props => props.theme.spacing[4]};
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.2;
  font-size: 1.75rem;
  padding: 0 ${props => props.theme.spacing[2]};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: 2.25rem;
    margin-bottom: ${props => props.theme.spacing[5]};
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: 3.5rem;
    margin-bottom: ${props => props.theme.spacing[6]};
    padding: 0;
  }
`;

const HeroSubtitle = styled(Text)`
  margin-bottom: ${props => props.theme.spacing[6]};
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  font-size: 0.95rem;
  padding: 0 ${props => props.theme.spacing[2]};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: 1.05rem;
    margin-bottom: ${props => props.theme.spacing[7]};
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: 1.25rem;
    margin-bottom: ${props => props.theme.spacing[8]};
    padding: 0;
  }
`;

const HeroBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: ${props => props.theme.radii.full};
  padding: 0.4rem 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  max-width: 90%;
  text-align: center;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0.5rem 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.85rem;
    max-width: none;
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    margin-bottom: 2rem;
    font-size: 0.9rem;
  }
`;

const HeroCTAContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  width: 100%;
  max-width: 100%;
  padding: 0 ${props => props.theme.spacing[2]};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: row;
    justify-content: center;
    max-width: none;
    padding: 0;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const HeroCTAButton = styled(Button)`
  width: 100%;
  white-space: normal;
  text-align: center;
  min-height: 52px;
  font-size: 0.95rem;
  line-height: 1.3;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  overflow: visible;
  word-break: keep-all;
  hyphens: auto;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    width: auto;
    white-space: normal;
    min-height: 56px;
    font-size: 1rem;
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
    min-width: 200px;
  }
`;

const NavButton = styled(Button)`
  font-size: 0.8rem;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  min-height: 36px;
  white-space: normal;
  word-break: keep-all;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: 0.9rem;
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    min-height: 44px;
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.typography.fontSizes.base};
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[5]};
    min-height: 48px;
  }
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

const PricingCard = styled(Card)<{ $isPopular?: boolean }>`
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$isPopular ? props.theme.colors.primary : props.theme.colors.border.primary};
  transform: ${props => props.$isPopular ? 'scale(1.05)' : 'scale(1)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  }

  &:hover {
    transform: ${props => props.$isPopular ? 'scale(1.07)' : 'scale(1.03)'};
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  color: white;
  padding: 0.4rem 1rem;
  border-radius: ${props => props.theme.radii.full};
  font-size: 0.75rem;
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${props => props.theme.shadows.md};
`;

const PlanName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const PlanDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  margin-bottom: 1.5rem;
  min-height: 2.5rem;
`;

const Price = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['4xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: ${props => props.theme.spacing[4]} 0;
  line-height: 1;
`;

const PriceInterval = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: normal;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  padding: 0.75rem 0;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;

  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.success};
    color: white;
    font-weight: bold;
    font-size: 0.75rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const PaymentSection = styled.section`
  padding: ${props => props.theme.spacing[12]} ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  text-align: center;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[16]} ${props => props.theme.spacing[6]};
  }
`;

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 3rem auto 0;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PaymentCard = styled(Card)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const PaymentMethodIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, rgba(0, 212, 170, 0.15) 0%, rgba(0, 184, 148, 0.15) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 212, 170, 0.3);
  transition: all 0.4s ease;

  &:hover {
    transform: scale(1.1);
    border-color: rgba(0, 212, 170, 0.6);
    box-shadow: 0 8px 32px rgba(0, 212, 170, 0.3);
  }

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    width: 120px;
    height: 120px;
  }
`;

const BenefitList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  text-align: left;
  
  li {
    padding: 0.5rem 0;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &::before {
      content: '✅';
      font-size: 1rem;
    }
  }
`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleScrollToPricing = () => {
    const element = document.querySelector('[data-section="pricing"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <CalendarIcon size={32} />,
      title: 'Agendamento Online',
      description: 'Sistema completo de agendamentos com calendário intuitivo e notificações automáticas.'
    },
    {
      icon: <PaymentIcon size={32} />,
      title: 'Pagamentos Modernos',
      description: 'PIX instantâneo integrado. Zero taxas, recebimento imediato 24/7. Seus clientes amam!'
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
    }
  ];

  return (
    <LandingContainer>
      <Header>
        <Nav>
          <Logo>BarberFlow</Logo>
          <NavButtons>
            <NavButton $variant="secondary" onClick={() => navigate('/login')}>
              Entrar
            </NavButton>
            <NavButton onClick={() => navigate('/register')}>
              Cadastrar
            </NavButton>
          </NavButtons>
        </Nav>
      </Header>

      <HeroSection>
        <HeroBadge>
          🚀 Plataforma Número #1 para Barbearias Modernas
        </HeroBadge>
        <HeroTitle $level={1} $gradient>
          Transforme Sua Barbearia em um Negócio de Alto Desempenho
        </HeroTitle>
        <HeroSubtitle $size="lg" $color="secondary">
          Sistema completo de gestão com agendamento inteligente, pagamentos modernos (PIX instantâneo)
          e relatórios em tempo real. Tudo que você precisa para escalar seu negócio.
        </HeroSubtitle>
        <HeroCTAContainer>
          <HeroCTAButton onClick={() => navigate('/register')} translate="no">
            Começar Teste Grátis
          </HeroCTAButton>
          <HeroCTAButton $variant="secondary" onClick={handleScrollToPricing} translate="no">
            Ver Planos
          </HeroCTAButton>
        </HeroCTAContainer>
        <Text $size="sm" $color="tertiary" style={{ marginTop: '1.5rem', padding: '0 1rem' }}>
          ✓ Sem cartão de crédito • ✓ Cancele quando quiser • ✓ Suporte em português
        </Text>
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

      <PaymentSection>
        <Heading $level={2} style={{ color: 'white', marginBottom: '1rem' }}>
          Pagamento Instantâneo com PIX
        </Heading>
        <Text $size="lg" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          O método de pagamento preferido dos brasileiros, agora integrado ao seu sistema.
          Receba instantaneamente, sem taxas, 24 horas por dia.
        </Text>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <PaymentCard $variant="elevated">
            <CardContent>
              <PaymentMethodIcon>
                <PixImage size={80} animate />
              </PaymentMethodIcon>
              <Heading $level={3} style={{ color: 'white', marginBottom: '1rem' }}>
                PIX Integrado
              </Heading>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem' }}>
                Aceite PIX de forma simples e automática. Seus clientes amam, você recebe na hora.
              </Text>
              <BenefitList>
                <li>Zero taxas para você e seus clientes</li>
                <li>Recebimento instantâneo (24/7)</li>
                <li>QR Code gerado automaticamente</li>
                <li>Confirmação em tempo real</li>
                <li>Todos os bancos do Brasil aceitam</li>
                <li>5% de desconto automático para clientes</li>
              </BenefitList>
            </CardContent>
          </PaymentCard>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            💡 <strong>Você Sabia?</strong> 78% dos brasileiros preferem pagar com PIX.
            Oferecer PIX pode aumentar suas conversões em até 40%!
          </Text>
        </div>
      </PaymentSection>

      <CTASection data-section="pricing">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Heading $level={2} $gradient style={{ marginBottom: '1rem' }}>
            Escolha o Plano Ideal para Seu Negócio
          </Heading>
          <Text $size="lg" $color="secondary" style={{ marginBottom: '3rem' }}>
            14 dias de teste grátis em todos os planos • Cancele quando quiser • Sem taxas escondidas
          </Text>

          <Grid $columns={3} $responsive style={{ marginTop: '3rem' }}>
            {/* Plano Básico */}
            <PricingCard $variant="elevated">
              <CardContent>
                <PlanName>Básico</PlanName>
                <PlanDescription>Ideal para barbearias pequenas</PlanDescription>
                <Price>
                  R$ 79<PriceInterval>/mês</PriceInterval>
                </Price>
                <FeaturesList>
                  <FeatureItem>Até 2 profissionais</FeatureItem>
                  <FeatureItem>Agendamentos ilimitados</FeatureItem>
                  <FeatureItem>Notificações WhatsApp</FeatureItem>
                  <FeatureItem>Gestão de clientes</FeatureItem>
                  <FeatureItem>Catálogo de serviços</FeatureItem>
                  <FeatureItem>Pagamentos PIX</FeatureItem>
                  <FeatureItem>Suporte por email</FeatureItem>
                </FeaturesList>
                <Button
                  $fullWidth
                  $variant="secondary"
                  onClick={() => navigate('/register')}
                  style={{ marginTop: 'auto' }}
                  translate="no"
                >
                  Começar Teste Grátis
                </Button>
              </CardContent>
            </PricingCard>

            {/* Plano Pro - POPULAR */}
            <PricingCard $variant="elevated" $isPopular>
              <PopularBadge>Mais Popular</PopularBadge>
              <CardContent>
                <PlanName>Pro</PlanName>
                <PlanDescription>Para barbearias em crescimento</PlanDescription>
                <Price>
                  R$ 149<PriceInterval>/mês</PriceInterval>
                </Price>
                <FeaturesList>
                  <FeatureItem>Até 5 profissionais</FeatureItem>
                  <FeatureItem>Agendamentos ilimitados</FeatureItem>
                  <FeatureItem>Notificações WhatsApp + SMS</FeatureItem>
                  <FeatureItem>Gestão completa de clientes</FeatureItem>
                  <FeatureItem>Catálogo avançado</FeatureItem>
                  <FeatureItem>Pagamentos PIX com desconto</FeatureItem>
                  <FeatureItem>Relatórios avançados</FeatureItem>
                  <FeatureItem>Suporte prioritário</FeatureItem>
                </FeaturesList>
                <Button
                  $fullWidth
                  onClick={() => navigate('/register')}
                  style={{ marginTop: 'auto' }}
                  translate="no"
                >
                  Começar Teste Grátis
                </Button>
              </CardContent>
            </PricingCard>

            {/* Plano Enterprise */}
            <PricingCard $variant="elevated">
              <CardContent>
                <PlanName>Enterprise</PlanName>
                <PlanDescription>Para grandes barbearias</PlanDescription>
                <Price>
                  R$ 299<PriceInterval>/mês</PriceInterval>
                </Price>
                <FeaturesList>
                  <FeatureItem>Profissionais ilimitados</FeatureItem>
                  <FeatureItem>Agendamentos ilimitados</FeatureItem>
                  <FeatureItem>Todas as notificações</FeatureItem>
                  <FeatureItem>CRM completo</FeatureItem>
                  <FeatureItem>Recursos premium</FeatureItem>
                  <FeatureItem>Todos os métodos de pagamento</FeatureItem>
                  <FeatureItem>Relatórios personalizados</FeatureItem>
                  <FeatureItem>API dedicada</FeatureItem>
                  <FeatureItem>Suporte 24/7</FeatureItem>
                </FeaturesList>
                <Button
                  $fullWidth
                  $variant="secondary"
                  onClick={() => navigate('/register')}
                  style={{ marginTop: 'auto' }}
                  translate="no"
                >
                  Começar Teste Grátis
                </Button>
              </CardContent>
            </PricingCard>
          </Grid>

          <Text $size="sm" $color="tertiary" style={{ marginTop: '3rem', textAlign: 'center' }}>
            💡 Todos os planos incluem 14 dias de teste grátis. Não é necessário cartão de crédito para começar.
          </Text>
        </div>
      </CTASection>
    </LandingContainer>
  );
};

export default LandingPage;