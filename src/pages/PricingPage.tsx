import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import {
  BillingProvider,
  createCheckoutSession,
  getSubscriptionPlans,
  resolveSubscriptionProvider,
  SubscriptionPlan,
} from '../services/subscriptionService';
import { DashboardShell, Card, Heading, Text } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { supabase } from '../services/supabase';

const PricingPage: React.FC = () => {
  const { user, barbershop } = useAuth();
  const { error: toastError } = useToastContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isInDashboard = location.pathname.includes('/dashboard/');

  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<{
    plan_id?: string;
    current_period_end?: string | null;
    status?: string;
    provider?: string;
    plan?: { name?: string };
  } | null>(null);
  const [provider, setProvider] = useState<BillingProvider>('stripe');

  useEffect(() => {
    void fetchPlans();
  }, []);

  useEffect(() => {
    if (!user || !barbershop) return;
    void fetchCurrentSubscription();
    void fetchProvider();
  }, [user, barbershop]);

  const fetchProvider = async () => {
    if (!barbershop) return;
    try {
      const currentProvider = await resolveSubscriptionProvider(barbershop.id);
      setProvider(currentProvider);
    } catch (err) {
      console.error('Erro ao resolver provider de assinatura:', err);
      setProvider('stripe');
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const activePlans = await getSubscriptionPlans();
      setPlans(activePlans);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      toastError('Não foi possível carregar os planos. Tente novamente em instantes.');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!barbershop) return;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan_id, current_period_end, status, provider')
      .eq('barbershop_id', barbershop.id)
      .in('status', ['active', 'trialing', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return;

    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('name')
      .eq('id', data.plan_id)
      .maybeSingle();

    setCurrentSubscription({ ...data, plan: planData ?? undefined });
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user || !barbershop) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);

    try {
      const checkoutUrl = await createCheckoutSession(planId, 'monthly', barbershop.id, provider);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Erro ao criar checkout:', err);
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Não foi possível iniciar o pagamento. Verifique a conexão ou tente outro horário.';
      toastError(msg);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renewLabel = currentSubscription?.current_period_end
    ? new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const statusLabel = (status?: string) => {
    if (status === 'active') return { text: 'Ativo', color: '#22c55e' };
    if (status === 'trialing') return { text: 'Teste grátis', color: '#3b82f6' };
    if (status === 'pending') return { text: 'Aguardando pagamento', color: '#f59e0b' };
    return { text: status ?? '', color: '#6b7280' };
  };

  return (
    <DashboardShell className="fade-in">
      <HeaderBlock $centered={!isInDashboard}>
        <Heading $level={1} $gradient>
          {isInDashboard ? 'Assinatura' : 'Escolha o plano ideal'}
        </Heading>
        <Lead $centered={!isInDashboard}>
          {isInDashboard
            ? 'Plano ativo, gateway de cobrança e upgrade em um só lugar.'
            : 'Comece com 14 dias grátis. Cancele quando quiser.'}
        </Lead>
        <ProviderChip aria-label="Gateway de pagamento">
          Cobrança: <strong>{provider === 'asaas' ? 'Asaas' : 'Stripe'}</strong>
        </ProviderChip>
      </HeaderBlock>

      {currentSubscription && (() => {
        const s = statusLabel(currentSubscription.status);
        return (
          <CurrentBanner $status={currentSubscription.status}>
            <BannerLeft>
              <BannerTitle>Seu plano atual</BannerTitle>
              <BannerLine>{currentSubscription.plan?.name || 'Assinatura'}</BannerLine>
              {renewLabel && currentSubscription.status === 'active' && (
                <Renew>Renova em {renewLabel}</Renew>
              )}
            </BannerLeft>
            <StatusBadge $color={s.color}>{s.text}</StatusBadge>
          </CurrentBanner>
        );
      })()}

      {plansLoading ? (
        <SkeletonGrid aria-busy="true" aria-label="Carregando planos">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </SkeletonGrid>
      ) : plans.length === 0 ? (
        <EmptyState>
          <Text $color="secondary">Nenhum plano disponível no momento.</Text>
        </EmptyState>
      ) : (
        <PlansGrid $count={plans.length}>
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;
            const isPopular = plan.slug === 'professional';
            const subStatus = isCurrentPlan ? currentSubscription?.status : undefined;
            const s = subStatus ? statusLabel(subStatus) : null;

            return (
              <PlanCard
                key={plan.id}
                $variant="elevated"
                $isPopular={isPopular}
                $isCurrent={isCurrentPlan}
                $status={subStatus}
              >
                <PlanInner>
                  <BadgeRow>
                    {isPopular && <PlanBadge $tone="brand">Mais popular</PlanBadge>}
                    {isCurrentPlan && s && (
                      <PlanBadge $tone="ok" style={{ background: s.color }}>
                        ✓ {s.text}
                      </PlanBadge>
                    )}
                  </BadgeRow>

                  <PlanTitle>{plan.name}</PlanTitle>
                  <PlanSubtitle>{plan.description}</PlanSubtitle>

                  <PriceRow>
                    <PriceTag>{formatPrice(plan.price_monthly)}</PriceTag>
                    <PriceUnit>/mês</PriceUnit>
                  </PriceRow>

                  <Features>
                    {plan.features.map((feature, index) => (
                      <Feature key={index}>
                        <Check aria-hidden>✓</Check>
                        <span>{feature}</span>
                      </Feature>
                    ))}
                  </Features>

                  <CtaBlock>
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading || isCurrentPlan}
                      $variant={isPopular ? 'primary' : 'secondary'}
                      $fullWidth
                    >
                      {loading && selectedPlan === plan.id
                        ? 'Abrindo checkout…'
                        : isCurrentPlan
                          ? subStatus === 'pending'
                            ? '⏳ Aguardando pagamento'
                            : '✓ Plano ativo'
                          : 'Assinar este plano'}
                    </Button>
                  </CtaBlock>
                </PlanInner>
              </PlanCard>
            );
          })}
        </PlansGrid>
      )}

      <FaqSection>
        <FaqHeading $level={2}>Perguntas frequentes</FaqHeading>
        <FaqGrid>
          <FaqItem>
            <FaqQ>Posso cancelar a qualquer momento?</FaqQ>
            <FaqA>Sim. Cancele quando quiser, sem multa de fidelidade.</FaqA>
          </FaqItem>
          <FaqItem>
            <FaqQ>Como funciona o período de teste?</FaqQ>
            <FaqA>14 dias grátis para validar recursos; nada é cobrado nesse intervalo.</FaqA>
          </FaqItem>
          <FaqItem>
            <FaqQ>Posso mudar de plano depois?</FaqQ>
            <FaqA>Sim, upgrade ou downgrade conforme sua necessidade.</FaqA>
          </FaqItem>
          <FaqItem>
            <FaqQ>Formas de pagamento</FaqQ>
            <FaqA>Cartão, PIX e outras opções exibidas no checkout do seu provedor.</FaqA>
          </FaqItem>
        </FaqGrid>
      </FaqSection>
    </DashboardShell>
  );
};

const HeaderBlock = styled.header<{ $centered: boolean }>`
  margin-bottom: ${(p) => p.theme.spacing[8]};
  text-align: ${(p) => (p.$centered ? 'center' : 'left')};
  max-width: ${(p) => (p.$centered ? '640px' : 'none')};
  margin-left: ${(p) => (p.$centered ? 'auto' : '0')};
  margin-right: ${(p) => (p.$centered ? 'auto' : '0')};
`;

const Lead = styled(Text).attrs({ $size: 'lg', $color: 'secondary' })<{ $centered: boolean }>`
  display: block;
  margin-top: ${(p) => p.theme.spacing[3]};
  line-height: 1.55;
  max-width: ${(p) => (p.$centered ? '36rem' : '40rem')};
  margin-left: ${(p) => (p.$centered ? 'auto' : '0')};
  margin-right: ${(p) => (p.$centered ? 'auto' : '0')};
`;

const ProviderChip = styled.p`
  margin: ${(p) => p.theme.spacing[4]} 0 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: ${(p) => p.theme.radii.full};
  font-size: ${(p) => p.theme.typography.fontSizes.sm};
  color: ${(p) => p.theme.colors.text.secondary};
  background: ${(p) => p.theme.colors.background.secondary};
  border: 1px solid ${(p) => p.theme.colors.border.primary};
`;

const CurrentBanner = styled.div<{ $status?: string }>`
  margin-bottom: ${(p) => p.theme.spacing[7]};
  padding: ${(p) => p.theme.spacing[4]} ${(p) => p.theme.spacing[5]};
  border-radius: ${(p) => p.theme.radii.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${(p) => p.theme.spacing[4]};
  border: 1px solid ${(p) =>
    p.$status === 'active' ? '#22c55e' :
    p.$status === 'trialing' ? '#3b82f6' :
    p.$status === 'pending' ? '#f59e0b' :
    p.theme.colors.primary.main};
  background: linear-gradient(
    180deg,
    ${(p) => p.theme.colors.background.elevated} 0%,
    ${(p) => p.theme.colors.background.tertiary} 100%
  );
`;

const BannerLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.theme.spacing[1]};
`;

const BannerTitle = styled.div`
  font-size: ${(p) => p.theme.typography.fontSizes.xs};
  font-weight: ${(p) => p.theme.typography.fontWeights.semibold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${(p) => p.theme.colors.text.tertiary};
`;

const BannerLine = styled.div`
  font-size: ${(p) => p.theme.typography.fontSizes.lg};
  font-weight: ${(p) => p.theme.typography.fontWeights.semibold};
  color: ${(p) => p.theme.colors.text.primary};
`;

const Renew = styled.span`
  font-size: ${(p) => p.theme.typography.fontSizes.sm};
  font-weight: ${(p) => p.theme.typography.fontWeights.normal};
  color: ${(p) => p.theme.colors.text.tertiary};
`;

const StatusBadge = styled.span<{ $color: string }>`
  flex-shrink: 0;
  padding: 0.35rem 0.85rem;
  border-radius: ${(p) => p.theme.radii.full};
  font-size: ${(p) => p.theme.typography.fontSizes.sm};
  font-weight: ${(p) => p.theme.typography.fontWeights.semibold};
  color: #fff;
  background: ${(p) => p.$color};
`;

const PlansGrid = styled.div<{ $count: number }>`
  display: grid;
  width: 100%;
  gap: ${(p) => p.theme.spacing[5]};
  align-items: stretch;
  grid-template-columns: 1fr;

  /* Colunas iguais: evita 1 cartão largo + 2 estreitos (auto-fit). */
  @media (min-width: ${(p) => p.theme.breakpoints.md}) {
    grid-template-columns: repeat(
      ${(p) => Math.min(Math.max(p.$count, 1), 2)},
      minmax(0, 1fr)
    );
    gap: ${(p) => p.theme.spacing[6]};
  }

  @media (min-width: ${(p) => p.theme.breakpoints.lg}) {
    grid-template-columns: repeat(
      ${(p) => Math.min(Math.max(p.$count, 1), 3)},
      minmax(0, 1fr)
    );
  }
`;

const PlanCard = styled(Card)<{ $isPopular?: boolean; $isCurrent?: boolean; $status?: string }>`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: ${(p) => p.theme.transitions.base};

  ${(p) =>
    p.$isPopular &&
    css`
      border: 2px solid var(--bs-brand-main, ${p.theme.colors.primary.main});
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    `}

  ${(p) =>
    p.$isCurrent &&
    p.$status === 'active' &&
    css`
      border: 2px solid #22c55e;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
    `}

  ${(p) =>
    p.$isCurrent &&
    p.$status === 'trialing' &&
    css`
      border: 2px solid #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    `}

  ${(p) =>
    p.$isCurrent &&
    p.$status === 'pending' &&
    css`
      border: 2px solid #f59e0b;
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
    `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${(p) => p.theme.shadows.xl};
  }
`;

const PlanInner = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: ${(p) => p.theme.spacing[5]} ${(p) => p.theme.spacing[5]}
    ${(p) => p.theme.spacing[6]};
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: ${(p) => p.theme.spacing[4]};
`;

const PlanBadge = styled.span<{ $tone: 'brand' | 'ok' }>`
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: ${(p) => p.theme.radii.full};
  font-size: ${(p) => p.theme.typography.fontSizes.xs};
  font-weight: ${(p) => p.theme.typography.fontWeights.bold};
  letter-spacing: 0.02em;
  text-transform: uppercase;
  ${(p) =>
    p.$tone === 'brand'
      ? css`
          color: ${p.theme.colors.text.inverse};
          background: linear-gradient(
            135deg,
            var(--bs-brand-main, ${p.theme.colors.primary.main}) 0%,
            var(--bs-brand-light, ${p.theme.colors.primary.light}) 100%
          );
        `
      : css`
          color: ${p.theme.colors.text.inverse};
          background: linear-gradient(
            135deg,
            ${p.theme.colors.success.main} 0%,
            #25a244 100%
          );
        `}
`;

const PlanTitle = styled.h3`
  margin: 0 0 ${(p) => p.theme.spacing[2]};
  font-size: ${(p) => p.theme.typography.fontSizes['2xl']};
  font-weight: ${(p) => p.theme.typography.fontWeights.bold};
  color: ${(p) => p.theme.colors.text.primary};
`;

const PlanSubtitle = styled.p`
  margin: 0 0 ${(p) => p.theme.spacing[5]};
  font-size: ${(p) => p.theme.typography.fontSizes.sm};
  line-height: 1.5;
  color: ${(p) => p.theme.colors.text.tertiary};
  min-height: 2.75rem;
`;

const PriceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.5rem;
  margin-bottom: ${(p) => p.theme.spacing[5]};
`;

const PriceTag = styled.div`
  font-size: clamp(1.75rem, 4vw, ${(p) => p.theme.typography.fontSizes['4xl']});
  font-weight: ${(p) => p.theme.typography.fontWeights.extrabold};
  line-height: 1;
  background: linear-gradient(
    135deg,
    var(--bs-brand-main, ${(p) => p.theme.colors.primary.main}) 0%,
    var(--bs-brand-light, ${(p) => p.theme.colors.primary.light}) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PriceUnit = styled.span`
  font-size: ${(p) => p.theme.typography.fontSizes.sm};
  color: ${(p) => p.theme.colors.text.tertiary};
`;

const Features = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 ${(p) => p.theme.spacing[4]};
  flex: 1 1 auto;
`;

const Feature = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${(p) => p.theme.spacing[3]};
  padding: ${(p) => p.theme.spacing[2]} 0;
  font-size: ${(p) => p.theme.typography.fontSizes.sm};
  line-height: 1.45;
  color: ${(p) => p.theme.colors.text.secondary};

  &:not(:last-child) {
    border-bottom: 1px solid ${(p) => p.theme.colors.border.primary};
  }
`;

const Check = styled.span`
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.1rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
  color: ${(p) => p.theme.colors.text.inverse};
  background: ${(p) => p.theme.colors.success.main};
`;

const CtaBlock = styled.div`
  margin-top: auto;
  padding-top: ${(p) => p.theme.spacing[4]};
`;

const FaqSection = styled.section`
  margin-top: ${(p) => p.theme.spacing[10]};
  padding-top: ${(p) => p.theme.spacing[8]};
  border-top: 1px solid ${(p) => p.theme.colors.border.primary};
`;

const FaqHeading = styled(Heading)`
  text-align: center;
  margin: 0 0 ${(p) => p.theme.spacing[7]};
`;

const FaqGrid = styled.div`
  display: grid;
  gap: ${(p) => p.theme.spacing[5]};
  grid-template-columns: 1fr;

  @media (min-width: ${(p) => p.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${(p) => p.theme.spacing[6]} ${(p) => p.theme.spacing[8]};
  }
`;

const FaqItem = styled.div`
  padding: 0;
`;

const FaqQ = styled.h4`
  margin: 0 0 ${(p) => p.theme.spacing[2]};
  font-size: ${(p) => p.theme.typography.fontSizes.base};
  font-weight: ${(p) => p.theme.typography.fontWeights.semibold};
  color: ${(p) => p.theme.colors.text.primary};
`;

const FaqA = styled.p`
  margin: 0;
  font-size: ${(p) => p.theme.typography.fontSizes.sm};
  line-height: 1.55;
  color: ${(p) => p.theme.colors.text.secondary};
`;

const SkeletonGrid = styled.div`
  display: grid;
  gap: ${(p) => p.theme.spacing[5]};
  grid-template-columns: 1fr;
  @media (min-width: ${(p) => p.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: ${(p) => p.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const SkeletonCard = styled.div`
  height: 420px;
  border-radius: ${(p) => p.theme.radii.xl};
  background: linear-gradient(
    90deg,
    ${(p) => p.theme.colors.background.elevated} 25%,
    ${(p) => p.theme.colors.background.tertiary} 50%,
    ${(p) => p.theme.colors.background.elevated} 75%
  );
  background-size: 200% 100%;
  animation: shimmerPlan 1.2s ease-in-out infinite;
  @keyframes shimmerPlan {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const EmptyState = styled.div`
  padding: ${(p) => p.theme.spacing[10]};
  text-align: center;
  border-radius: ${(p) => p.theme.radii.lg};
  border: 1px dashed ${(p) => p.theme.colors.border.primary};
  background: ${(p) => p.theme.colors.background.secondary};
`;

export default PricingPage;
