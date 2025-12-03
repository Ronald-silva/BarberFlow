import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plan } from '../types';
import { SUBSCRIPTION_PLANS } from '../services/stripeService';
import { PageContainer, Card, CardContent, Heading, Text, Grid, Flex } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { supabase } from '../services/supabase';

const PricingPage: React.FC = () => {
  const { user, barbershop } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    if (user && barbershop) {
      fetchCurrentSubscription();
    }
  }, [user, barbershop]);

  const fetchCurrentSubscription = async () => {
    if (!barbershop) return;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .eq('barbershop_id', barbershop.id)
      .in('status', ['active', 'trialing'])
      .single();

    if (!error && data) {
      setCurrentSubscription(data);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user || !barbershop) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);

    try {
      // Criar sessão de checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          barbershopId: barbershop.id,
          successUrl: `${window.location.origin}/#/dashboard/overview?success=true`,
          cancelUrl: `${window.location.origin}/#/pricing?canceled=true`,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Heading $level={1} $gradient>
          Escolha o Plano Ideal
        </Heading>
        <Text $size="lg" $color="secondary" style={{ marginTop: '1rem' }}>
          Comece com 14 dias grátis. Cancele quando quiser.
        </Text>
      </HeaderSection>

      {currentSubscription && (
        <CurrentPlanBanner>
          <Text $weight="semibold">
            📌 Plano Atual: {currentSubscription.plan.name}
          </Text>
          <Text $size="sm" $color="tertiary">
            Válido até {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
          </Text>
        </CurrentPlanBanner>
      )}

      <Grid $columns={3} $responsive style={{ marginTop: '3rem' }}>
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan_id === plan.id;
          const isPopular = plan.id === 'pro';

          return (
            <PlanCard
              key={plan.id}
              $variant="elevated"
              $isPopular={isPopular}
              $isCurrent={isCurrentPlan}
            >
              {isPopular && <PopularBadge>Mais Popular</PopularBadge>}
              {isCurrentPlan && <CurrentBadge>Plano Atual</CurrentBadge>}

              <CardContent>
                <PlanName>{plan.name}</PlanName>
                <PlanDescription>{plan.description}</PlanDescription>

                <PriceSection>
                  <Price>{formatPrice(plan.price)}</Price>
                  <PriceInterval>/mês</PriceInterval>
                </PriceSection>

                <FeaturesList>
                  {plan.features.map((feature, index) => (
                    <FeatureItem key={index}>
                      <CheckIcon>✓</CheckIcon>
                      <span>{feature}</span>
                    </FeatureItem>
                  ))}
                </FeaturesList>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading || isCurrentPlan}
                  $variant={isPopular ? 'primary' : 'secondary'}
                  $fullWidth
                  style={{ marginTop: '2rem' }}
                >
                  {loading && selectedPlan === plan.id
                    ? 'Processando...'
                    : isCurrentPlan
                    ? 'Plano Atual'
                    : 'Começar Agora'}
                </Button>
              </CardContent>
            </PlanCard>
          );
        })}
      </Grid>

      <FAQSection>
        <Heading $level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Perguntas Frequentes
        </Heading>
        <Grid $columns={2} $responsive>
          <FAQItem>
            <FAQQuestion>Posso cancelar a qualquer momento?</FAQQuestion>
            <FAQAnswer>
              Sim! Você pode cancelar sua assinatura a qualquer momento sem multas.
            </FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>Como funciona o período de teste?</FAQQuestion>
            <FAQAnswer>
              Você tem 14 dias grátis para testar todas as funcionalidades. Não cobramos nada durante o período de teste.
            </FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>Posso mudar de plano depois?</FAQQuestion>
            <FAQAnswer>
              Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
            </FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>Quais formas de pagamento aceitam?</FAQQuestion>
            <FAQAnswer>
              Aceitamos cartão de crédito, PIX e opcionalmente Bitcoin e USDT.
            </FAQAnswer>
          </FAQItem>
        </Grid>
      </FAQSection>
    </PageContainer>
  );
};

// Styled Components
const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const CurrentPlanBanner = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
`;

const PlanCard = styled(Card)<{ $isPopular?: boolean; $isCurrent?: boolean }>`
  position: relative;
  transition: ${props => props.theme.transitions.base};
  border: 2px solid ${props =>
    props.$isPopular
      ? props.theme.colors.primary
      : props.$isCurrent
      ? props.theme.colors.success
      : props.theme.colors.border.primary};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  box-shadow: ${props => props.theme.shadows.md};
`;

const CurrentBadge = styled(PopularBadge)`
  background: linear-gradient(135deg, ${props => props.theme.colors.success}, #25A244);
`;

const PlanName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const PlanDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.text.tertiary};
  margin-bottom: 2rem;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const Price = styled.div`
  font-size: ${props => props.theme.typography.fontSizes['4xl']};
  font-weight: ${props => props.theme.typography.fontWeights.extrabold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PriceInterval = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.text.tertiary};
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.text.secondary};
`;

const CheckIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.theme.colors.success};
  color: white;
  font-weight: bold;
  flex-shrink: 0;
`;

const FAQSection = styled.div`
  margin-top: 6rem;
  padding-top: 4rem;
  border-top: 1px solid ${props => props.theme.colors.border.primary};
`;

const FAQItem = styled.div`
  margin-bottom: 2rem;
`;

const FAQQuestion = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const FAQAnswer = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.base};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
`;

export default PricingPage;
