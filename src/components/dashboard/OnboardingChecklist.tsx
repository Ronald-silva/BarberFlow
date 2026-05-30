import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Text } from '../ui/Container';
import { useToastContext } from '../../contexts/ToastContext';
import { bookUrl } from '../../lib/appUrl';

const ONBOARDING_DISMISS_KEY = 'shafar_onboarding_dismissed';

export type OnboardingBarbershop = {
  slug: string;
  workingHoursConfigured: boolean;
  mercadopagoConfigured: boolean;
  servicesCount: number;
};

type Props = {
  barbershopId: string;
  barbershop: OnboardingBarbershop;
};

const Card = styled.div`
  margin-bottom: ${(p) => p.theme.spacing[7]};
  padding: ${(p) => p.theme.spacing[5]} ${(p) => p.theme.spacing[6]};
  background: linear-gradient(
    135deg,
    ${(p) => p.theme.colors.background.elevated} 0%,
    ${(p) => p.theme.colors.background.tertiary} 100%
  );
  border: 1px solid ${(p) => p.theme.colors.border.primary};
  border-radius: ${(p) => p.theme.radii.xl};
`;

const StepList = styled.ul`
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StepRow = styled.li<{ $done?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: ${(p) => p.theme.radii.lg};
  background: ${(p) =>
    p.$done ? 'rgba(34, 197, 94, 0.08)' : p.theme.colors.background.secondary};
  border: 1px solid
    ${(p) => (p.$done ? 'rgba(34, 197, 94, 0.25)' : p.theme.colors.border.primary)};
`;

const StepIcon = styled.span<{ $done?: boolean }>`
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(p) =>
    p.$done
      ? p.theme.colors.success
      : 'color-mix(in srgb, var(--bs-brand-main, #c8922a) 20%, transparent)'};
  color: ${(p) => (p.$done ? '#0D0D0D' : 'var(--bs-brand-light, #e8b84b)')};
`;

const StepBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const StepActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

export function isOnboardingDismissed(barbershopId: string): boolean {
  try {
    const raw = localStorage.getItem(ONBOARDING_DISMISS_KEY);
    if (!raw) return false;
    const ids: string[] = JSON.parse(raw);
    return ids.includes(barbershopId);
  } catch {
    return false;
  }
}

function dismissOnboarding(barbershopId: string) {
  try {
    const raw = localStorage.getItem(ONBOARDING_DISMISS_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(barbershopId)) {
      ids.push(barbershopId);
      localStorage.setItem(ONBOARDING_DISMISS_KEY, JSON.stringify(ids));
    }
  } catch {
    localStorage.setItem(ONBOARDING_DISMISS_KEY, JSON.stringify([barbershopId]));
  }
}

export const OnboardingChecklist: React.FC<Props> = ({ barbershopId, barbershop }) => {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [linkCopied, setLinkCopied] = useState(false);
  const [dismissed, setDismissed] = useState(() => isOnboardingDismissed(barbershopId));

  const bookingLink = bookUrl(barbershop.slug);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      setLinkCopied(true);
      toast.success('Link de agendamento copiado!');
    } catch {
      toast.error('Não foi possível copiar. Selecione o link manualmente.');
    }
  }, [bookingLink, toast]);

  const steps = useMemo(
    () => [
      {
        id: 'link',
        title: 'Copiar link de agendamento',
        desc: 'Envie no WhatsApp, Instagram ou bio do perfil.',
        done: linkCopied,
        optional: false,
        action: (
          <Button type="button" $size="sm" $variant="secondary" onClick={() => void copyLink()}>
            {linkCopied ? 'Copiado ✓' : 'Copiar link'}
          </Button>
        ),
      },
      {
        id: 'hours',
        title: 'Horários de funcionamento',
        desc: 'Defina quando clientes podem agendar online.',
        done: barbershop.workingHoursConfigured,
        optional: false,
        action: (
          <Button
            type="button"
            $size="sm"
            $variant="secondary"
            onClick={() => navigate('/dashboard/settings')}
          >
            Configurar
          </Button>
        ),
      },
      {
        id: 'services',
        title: 'Serviços e preços',
        desc: 'Revise os serviços criados no cadastro.',
        done: barbershop.servicesCount > 0,
        optional: false,
        action: (
          <Button
            type="button"
            $size="sm"
            $variant="secondary"
            onClick={() => navigate('/dashboard/services')}
          >
            Ver serviços
          </Button>
        ),
      },
      {
        id: 'mp',
        title: 'Mercado Pago (opcional)',
        desc: 'Receba PIX na sua conta ao agendar online.',
        done: barbershop.mercadopagoConfigured,
        optional: true,
        action: (
          <Button
            type="button"
            $size="sm"
            $variant="secondary"
            onClick={() => navigate('/dashboard/settings')}
          >
            Conectar
          </Button>
        ),
      },
    ],
    [barbershop, copyLink, linkCopied, navigate]
  );

  const requiredDone = steps.filter((s) => !s.optional).every((s) => s.done);

  if (dismissed) return null;

  return (
    <Card>
      <HeaderRow>
        <div>
          <Text $weight="semibold" $color="primary" style={{ fontSize: '1.125rem' }}>
            Primeiros passos
          </Text>
          <Text $size="sm" $color="tertiary" style={{ marginTop: '0.35rem' }}>
            Configure o essencial para abrir o agendamento aos clientes.
          </Text>
        </div>
        {requiredDone && (
          <Button
            type="button"
            $size="sm"
            $variant="ghost"
            onClick={() => {
              dismissOnboarding(barbershopId);
              setDismissed(true);
            }}
          >
            Ocultar
          </Button>
        )}
      </HeaderRow>
      <StepList>
        {steps.map((step, index) => (
          <StepRow key={step.id} $done={step.done}>
            <StepIcon $done={step.done}>{step.done ? '✓' : index + 1}</StepIcon>
            <StepBody>
              <Text $size="sm" $weight="medium" $color="primary" style={{ margin: 0 }}>
                {step.title}
                {step.optional ? (
                  <Text as="span" $size="xs" $color="tertiary" style={{ marginLeft: '0.35rem' }}>
                    (opcional)
                  </Text>
                ) : null}
              </Text>
              <Text $size="xs" $color="tertiary" style={{ marginTop: '0.2rem' }}>
                {step.desc}
              </Text>
              {!step.done && <StepActions>{step.action}</StepActions>}
            </StepBody>
          </StepRow>
        ))}
      </StepList>
    </Card>
  );
};
