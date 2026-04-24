import React from 'react';
import { ByRonalDigital } from '../components/ByRonalDigital';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// ============================================================
// SHAFAR Landing Page v2.0
// Design: Premium Dark, Mobile-First, Amber Identity
// Psicologia: Autoridade + Confiança + Exclusividade
// ============================================================

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #101010 0%, #0f0f0f 100%);
  color: #F5F5F5;
  overflow-x: hidden;
  position: relative;
`;

/* ===== NAV ===== */
const Nav = styled.nav`
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 0 1.5rem;
  background: #0D0D0D;
  border-bottom: 1px solid rgba(200, 146, 42, 0.14);
  box-sizing: border-box;

  @media (min-width: 768px) {
    height: 80px;
    padding: 0 3rem;
  }

  @media (min-width: 1280px) {
    padding: 0 calc((100% - 1200px) / 2);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: default;

  img {
    height: 34px;
    width: auto;
    border-radius: 8px;

    @media (min-width: 768px) {
      height: 40px;
    }
  }

  span {
    font-size: 1.25rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #C8922A 0%, #F5D78E 50%, #C8922A 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${gradientShift} 4s linear infinite;

    @media (min-width: 768px) {
      font-size: 1.4375rem;
    }
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    gap: 0.75rem;
  }
`;

const NavLink = styled.button`
  background: none;
  border: none;
  color: rgba(210, 210, 210, 0.85);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  transition: color 120ms ease;
  min-height: 40px;
  white-space: nowrap;

  &:hover { color: #F5F5F5; }

  @media (min-width: 768px) {
    font-size: 0.9375rem;
    padding: 0.5rem 1.125rem;
  }
`;

/* ===== HERO ===== */
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.25rem 4rem;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 5rem 2rem 5rem;
  }

  /* Grid de pontos de fundo */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(200, 146, 42, 0.08) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent);
    pointer-events: none;
    z-index: 0;
  }

  /* Glow central */
  &::after {
    content: '';
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(200, 146, 42, 0.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  background: rgba(200, 146, 42, 0.1);
  border: 1px solid rgba(200, 146, 42, 0.25);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #E8B84B;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;

  @media (min-width: 480px) {
    font-size: 0.8125rem;
    padding: 0.5rem 1.25rem;
    margin-bottom: 2rem;
  }
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E8B84B;
  animation: ${float} 2s ease-in-out infinite;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #F5F5F5;
  margin-bottom: 1.25rem;
  position: relative;
  z-index: 1;
  max-width: 820px;

  @media (min-width: 480px) {
    margin-bottom: 1.5rem;
  }

  @media (min-width: 768px) {
    margin-bottom: 1.75rem;
  }
`;

const TitleAccent = styled.span`
  background: linear-gradient(135deg, #C8922A 0%, #F5D78E 50%, #E8B84B 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 5s linear infinite;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(0.9375rem, 3vw, 1.125rem);
  font-weight: 400;
  color: #D2D2D2;
  line-height: 1.7;
  max-width: 560px;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const CTAGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 360px;
  position: relative;
  z-index: 1;

  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    gap: 1rem;
    max-width: 560px;
  }
`;

const CTAButton = styled(Button)`
  width: 100%;
  max-width: 360px;

  @media (min-width: 480px) {
    flex: 0 1 auto;
    width: clamp(180px, 35vw, 250px);
    max-width: 250px;
  }
`;

const FinalCTAButton = styled(Button)`
  width: min(100%, 320px);
  margin: 0 auto;

  @media (min-width: 768px) {
    width: 280px;
  }
`;

const SocialProof = styled.div`
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;

  @media (min-width: 480px) {
    flex-direction: row;
    gap: 2rem;
  }
`;

const ProofItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: #D2D2D2;

  span:first-child {
    color: #22C55E;
    font-size: 1rem;
  }
`;

/* ===== STATS ===== */
const StatsSection = styled.section`
  padding: 3rem 1.25rem;
  border-top: 1px solid #1A1A1A;
  border-bottom: 1px solid #1A1A1A;

  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const StatsGrid = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatLabel = styled.div`
  font-size: 0.8125rem;
  color: #D2D2D2;
  margin-top: 0.25rem;
  font-weight: 500;
`;

/* ===== FEATURES ===== */
const FeaturesSection = styled.section`
  padding: 5rem 1.25rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 7rem 2rem;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #C8922A;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #F5F5F5;
  line-height: 1.15;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  font-size: clamp(0.9375rem, 2vw, 1.0625rem);
  color: #D2D2D2;
  line-height: 1.7;
  max-width: 560px;
`;

const SectionHeader = styled.div`
  margin-bottom: 3.5rem;

  @media (min-width: 768px) {
    margin-bottom: 5rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: #1A1A1A;
  border: 1px solid #1A1A1A;
  border-radius: 20px;
  overflow: hidden;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  background: #0D0D0D;
  padding: 2rem 1.75rem;
  transition: background 200ms ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: #111111;

    .feature-icon {
      transform: scale(1.1) rotate(-5deg);
      box-shadow: 0 8px 20px rgba(200, 146, 42, 0.3);
    }
  }

  @media (min-width: 768px) {
    padding: 2.5rem 2rem;
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(200, 146, 42, 0.15) 0%, rgba(232, 184, 75, 0.08) 100%);
  border: 1px solid rgba(200, 146, 42, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.0625rem;
  font-weight: 700;
  color: #F5F5F5;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
`;

const FeatureDesc = styled.p`
  font-size: 0.875rem;
  color: #D2D2D2;
  line-height: 1.65;
`;

/* ===== PRICING ===== */
const PricingSection = styled.section`
  padding: 5rem 1.25rem;
  background: #0A0A0A;
  text-align: center;

  @media (min-width: 768px) {
    padding: 7rem 2rem;
  }
`;

const PricingGrid = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  margin-top: 3.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
`;

const PricingCard = styled.div<{ $featured?: boolean }>`
  background: ${p => p.$featured ? 'linear-gradient(180deg, #1C1610 0%, #141414 100%)' : '#141414'};
  border: 1px solid ${p => p.$featured ? 'rgba(200, 146, 42, 0.5)' : '#1E1E1E'};
  border-radius: 20px;
  padding: 2rem 1.75rem;
  text-align: left;
  position: relative;
  transition: transform 250ms ease, border-color 250ms ease;

  ${p => p.$featured && `
    transform: scale(1.02);
    box-shadow: 0 20px 60px rgba(200, 146, 42, 0.15);
  `}

  &:hover {
    transform: translateY(-4px) ${p => p.$featured ? 'scale(1.02)' : ''};
    border-color: ${p => p.$featured ? 'rgba(200, 146, 42, 0.7)' : '#2A2A2A'};
  }

  @media (min-width: 768px) {
    padding: 2.5rem 2rem;
  }
`;

const PricingBadge = styled.div`
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
  color: #0D0D0D;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 1rem;
  border-radius: 9999px;
  white-space: nowrap;
`;

const PlanName = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #D2D2D2;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
`;

const PlanPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #F5F5F5;
  line-height: 1;
  margin-bottom: 0.25rem;

  span {
    font-size: 1rem;
    font-weight: 500;
    color: #D2D2D2;
    letter-spacing: 0;
  }
`;

const PlanDesc = styled.p`
  font-size: 0.8125rem;
  color: #D2D2D2;
  margin-bottom: 1.75rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid #1E1E1E;
`;

const PlanFeatures = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 2rem;
`;

const PlanFeature = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: #D2D2D2;

  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
    border-radius: 50%;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22C55E;
    font-weight: 700;
    font-size: 0.65rem;
    margin-top: 2px;
  }
`;

/* ===== PIX ===== */
const PixSection = styled.section`
  padding: 5rem 1.25rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 7rem 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 5rem;
  }
`;

const PixSectionWrapper = styled.section`
  background: #080808;
  padding: 1px 0;
`;

const PixCard = styled.div`
  background: linear-gradient(135deg, #141414 0%, #0D0D0D 100%);
  border: 1px solid #1E1E1E;
  border-radius: 24px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  margin-top: 2.5rem;

  @media (min-width: 768px) {
    margin-top: 0;
    padding: 3rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(0, 195, 120, 0.08) 0%, transparent 70%);
  }
`;

const SubtitleSpaced = styled(SectionSubtitle)`
  margin-top: 0.75rem;
`;

const SubtitleCentered = styled(SectionSubtitle)`
  margin: 0.75rem auto 0;
`;

const PixCardHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const PixIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 0.5rem;
`;

const PixTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #F5F5F5;
  letter-spacing: -0.03em;
`;

const PixSubtitle = styled.div`
  font-size: 0.875rem;
  color: #D2D2D2;
  margin-top: 0.5rem;
`;

const PixStatusCard = styled.div`
  background: rgba(0, 195, 120, 0.06);
  border: 1px solid rgba(0, 195, 120, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  text-align: center;
`;

const PixStatusLabel = styled.div`
  font-size: 0.75rem;
  color: #22C55E;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
`;

const PixStatusValue = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: #F5F5F5;
`;

const PixStatusTime = styled.div`
  font-size: 0.8125rem;
  color: #D2D2D2;
  margin-top: 0.25rem;
`;

const PixBenefits = styled.ul`
  list-style: none;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

const PixBenefit = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: #D2D2D2;

  span:first-child { font-size: 1.125rem; }
`;

/* ===== CTA FINAL ===== */
const FinalCTA = styled.section`
  padding: 5rem 1.25rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 8rem 2rem;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 50% at 50% 50%, rgba(200, 146, 42, 0.06) 0%, transparent 70%);
  }
`;

const FinalTitle = styled(SectionTitle)`
  max-width: 600px;
  margin: 0 auto 1rem;
  position: relative;
`;

const FinalDescription = styled.p`
  color: #D2D2D2;
  margin-bottom: 2.5rem;
  font-size: 1.0625rem;
`;

const FinalHint = styled.p`
  color: #BDBDBD;
  font-size: 0.8125rem;
  margin-top: 1.25rem;
`;

/* ===== FOOTER ===== */
const FooterBar = styled.footer`
  padding: 2rem 1.25rem;
  border-top: 1px solid #1A1A1A;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    padding: 1.75rem 2rem;
  }
`;

const Copyright = styled.div`
  color: #bdbdbd;
  font-size: 0.8125rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;

  @media (min-width: 640px) {
    align-items: flex-start;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: #D2D2D2;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: color 150ms;
  &:hover { color: #D2D2D2; }
`;

/* ===== COMPONENT ===== */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '📅', title: 'Agendamento Online', desc: 'Sistema intuitivo com calendário inteligente e confirmações automáticas para seus clientes.' },
    { icon: '💳', title: 'PIX Integrado', desc: 'Receba pagamentos PIX com QR Code automático. Zero taxas, confirmação em segundos.' },
    { icon: '👥', title: 'Gestão de Clientes', desc: 'Histórico completo por cliente, preferências e controle de retorno.' },
    { icon: '✂️', title: 'Catálogo de Serviços', desc: 'Configure serviços, preços e tempos de duração de forma simples.' },
    { icon: '👨‍💼', title: 'Múltiplos Profissionais', desc: 'Gerencie toda sua equipe com horários e permissões individuais.' },
    { icon: '📊', title: 'Relatórios em Tempo Real', desc: 'Acompanhe faturamento, taxa de retorno e performance da barbearia.' },
  ];

  const plans = [
    {
      name: 'Básico',
      price: 'R$ 29,90',
      desc: 'Ideal para começar',
      features: ['Até 2 profissionais', 'Agendamentos ilimitados', 'PIX integrado', 'Gestão de clientes', 'Suporte por email'],
    },
    {
      name: 'Profissional',
      price: 'R$ 59,90',
      desc: 'Para barbearias em crescimento',
      features: ['Até 5 profissionais', 'Tudo do Básico', 'Notificações automáticas', 'Relatórios avançados', 'Suporte prioritário'],
      featured: true,
    },
    {
      name: 'Premium',
      price: 'R$ 99,90',
      desc: 'Para grandes operações',
      features: ['Até 15 profissionais', 'Tudo do Profissional', 'CRM completo', 'API de integração', 'Suporte VIP 24/7'],
    },
  ];

  return (
    <Page>
      {/* NAV */}
      <Nav>
        <Logo>
          <img src="/logo.png" alt="Shafar" />
          <span>Shafar</span>
        </Logo>
        <NavActions>
          <NavLink onClick={() => navigate('/login')}>Entrar</NavLink>
          <Button $size="sm" onClick={() => navigate('/register')}>
            Começar grátis
          </Button>
        </NavActions>
      </Nav>

      {/* HERO */}
      <HeroSection>
        <HeroBadge>
          <BadgeDot /> Plataforma para barbearias modernas
        </HeroBadge>
        <HeroTitle>
          Sua barbearia no{' '}
          <TitleAccent>próximo nível</TitleAccent>
        </HeroTitle>
        <HeroSubtitle>
          Sistema completo de gestão com agendamento inteligente,
          PIX automático e relatórios em tempo real. Tudo que você
          precisa para crescer.
        </HeroSubtitle>
        <CTAGroup>
          <CTAButton $size="lg" onClick={() => navigate('/register')}>
            Começar grátis
          </CTAButton>
          <CTAButton $variant="secondary" $size="lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver planos
          </CTAButton>
        </CTAGroup>
        <SocialProof>
          <ProofItem><span>✓</span> Sem cartão de crédito</ProofItem>
          <ProofItem><span>✓</span> 14 dias grátis</ProofItem>
          <ProofItem><span>✓</span> Cancele quando quiser</ProofItem>
        </SocialProof>
      </HeroSection>

      {/* STATS */}
      <StatsSection>
        <StatsGrid>
          <StatCard>
            <StatNumber>500+</StatNumber>
            <StatLabel>Barbearias ativas</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>98%</StatNumber>
            <StatLabel>Satisfação dos clientes</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>R$2M+</StatNumber>
            <StatLabel>Gerenciados por mês</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>24/7</StatNumber>
            <StatLabel>Suporte dedicado</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* FEATURES */}
      <FeaturesSection>
        <SectionHeader>
          <SectionLabel>Funcionalidades</SectionLabel>
          <SectionTitle>Tudo que sua barbearia{' '}<br />precisa em um lugar</SectionTitle>
          <SubtitleSpaced>
            Desenvolvido especificamente para barbearias brasileiras,
            do agendamento ao pagamento.
          </SubtitleSpaced>
        </SectionHeader>
        <FeaturesGrid className="stagger">
          {features.map((f, i) => (
            <FeatureCard key={i}>
              <FeatureIcon className="feature-icon">{f.icon}</FeatureIcon>
              <FeatureTitle>{f.title}</FeatureTitle>
              <FeatureDesc>{f.desc}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>

      {/* PIX */}
      <PixSectionWrapper>
        <PixSection>
          <div>
            <SectionLabel>Pagamentos</SectionLabel>
            <SectionTitle>PIX: o jeito mais rápido de receber</SectionTitle>
            <SubtitleSpaced>
              78% dos brasileiros preferem pagar com PIX. Ofereça
              esse método e aumente suas conversões em até 40%.
            </SubtitleSpaced>
            <PixBenefits>
              <PixBenefit><span>⚡</span>Confirmação em menos de 3 segundos</PixBenefit>
              <PixBenefit><span>🔒</span>Zero taxas para você e seus clientes</PixBenefit>
              <PixBenefit><span>📱</span>QR Code gerado automaticamente</PixBenefit>
              <PixBenefit><span>🌙</span>Funciona 24 horas, 7 dias por semana</PixBenefit>
              <PixBenefit><span>🏦</span>Compatível com todos os bancos do Brasil</PixBenefit>
            </PixBenefits>
          </div>
          <PixCard>
            <PixCardHeader>
              <PixIcon>⚡</PixIcon>
              <PixTitle>PIX Integrado</PixTitle>
              <PixSubtitle>Recebimento instantâneo e automático</PixSubtitle>
            </PixCardHeader>
            <PixStatusCard>
              <PixStatusLabel>Status do Pagamento</PixStatusLabel>
              <PixStatusValue>✓ Confirmado</PixStatusValue>
              <PixStatusTime>há 2 segundos</PixStatusTime>
            </PixStatusCard>
          </PixCard>
        </PixSection>
      </PixSectionWrapper>

      {/* PRICING */}
      <PricingSection id="pricing">
        <SectionLabel>Planos</SectionLabel>
        <SectionTitle>Escolha o plano ideal</SectionTitle>
        <SubtitleCentered>
          14 dias de teste grátis em todos os planos. Sem taxas escondidas.
        </SubtitleCentered>
        <PricingGrid>
          {plans.map((p, i) => (
            <PricingCard key={i} $featured={p.featured}>
              {p.featured && <PricingBadge>Mais popular</PricingBadge>}
              <PlanName>{p.name}</PlanName>
              <PlanPrice>{p.price}<span>/mês</span></PlanPrice>
              <PlanDesc>{p.desc}</PlanDesc>
              <PlanFeatures>
                {p.features.map((f, j) => <PlanFeature key={j}>{f}</PlanFeature>)}
              </PlanFeatures>
              <Button
                $variant={p.featured ? 'primary' : 'secondary'}
                $fullWidth
                onClick={() => navigate('/register')}
              >
                Começar grátis
              </Button>
            </PricingCard>
          ))}
        </PricingGrid>
      </PricingSection>

      {/* FINAL CTA */}
      <FinalCTA>
        <SectionLabel>Pronto para crescer?</SectionLabel>
        <FinalTitle>
          Comece agora e{' '}
          <TitleAccent>transforme sua barbearia</TitleAccent>
        </FinalTitle>
        <FinalDescription>
          Junte-se a mais de 500 barbearias que já usam o Shafar.
        </FinalDescription>
        <FinalCTAButton $size="xl" onClick={() => navigate('/register')}>
          Criar conta grátis
        </FinalCTAButton>
        <FinalHint>
          Sem cartão de crédito • Cancele quando quiser
        </FinalHint>
      </FinalCTA>

      {/* FOOTER */}
      <FooterBar>
        <Copyright>
          © {new Date().getFullYear()} Shafar. Todos os direitos reservados.
          <ByRonalDigital />
        </Copyright>
        <FooterLinks>
          <FooterLink onClick={() => navigate('/privacy')}>Privacidade</FooterLink>
          <FooterLink onClick={() => navigate('/terms')}>Termos</FooterLink>
          <FooterLink onClick={() => navigate('/login')}>Entrar</FooterLink>
        </FooterLinks>
      </FooterBar>
    </Page>
  );
};

export default LandingPage;