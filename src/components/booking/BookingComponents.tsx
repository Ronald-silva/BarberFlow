import styled, { css } from 'styled-components';
import { Card } from '../ui/Container';

const bookingFont = `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif`;


/** Fluxo público de agendamento — fundo com profundidade (referência: Calendly / Cal.com) */
export const BookingContainer = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  font-family: ${bookingFont};
  background:
    radial-gradient(ellipse 120% 80% at 50% -30%, rgba(200, 146, 42, 0.14), transparent 55%),
    radial-gradient(ellipse 80% 50% at 100% 100%, rgba(200, 146, 42, 0.06), transparent 45%),
    linear-gradient(165deg, #080808 0%, #121212 40%, #0c0c0c 100%);
  padding: ${(props) => props.theme.spacing[3]};
  padding-bottom: max(${(props) => props.theme.spacing[6]}, env(safe-area-inset-bottom, 0px));

  @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
    padding: ${(props) => props.theme.spacing[5]};
    padding-bottom: max(${(props) => props.theme.spacing[8]}, env(safe-area-inset-bottom, 0px));
  }

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    padding: ${(props) => props.theme.spacing[8]};
  }
`;

export const BookingCard = styled(Card)`
  font-family: ${bookingFont};
  max-width: 100%;
  margin: 0 auto;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(26, 26, 26, 0.98) 0%, rgba(18, 18, 18, 0.99) 100%);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.4),
    0 24px 48px -12px rgba(0, 0, 0, 0.65),
    0 0 80px -20px rgba(200, 146, 42, 0.12);

  @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
    max-width: 560px;
    border-radius: 1.35rem;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    max-width: 640px;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.lg}) {
    max-width: 720px;
  }
`;

export const BarbershopHeader = styled.div`
  padding: 1.25rem 1.25rem 1.35rem;
  background: linear-gradient(
    135deg,
    rgba(200, 146, 42, 0.1) 0%,
    rgba(255, 255, 255, 0.02) 50%,
    rgba(0, 0, 0, 0.15) 100%
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    padding: 1.5rem 1.75rem;
    gap: 1.125rem;
  }
`;

export const BarbershopLogo = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 2px solid color-mix(in srgb, var(--bs-brand-main, #c8922a) 70%, transparent);
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    width: 60px;
    height: 60px;
    border-radius: 16px;
  }
`;

export const BarbershopInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const BarbershopName = styled.h1`
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #fafafa;
  margin: 0 0 0.25rem 0;
  line-height: 1.15;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    font-size: 1.45rem;
  }
`;

export const BarbershopAddress = styled.p`
  font-size: 0.8125rem;
  color: rgba(245, 245, 245, 0.5);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    font-size: 0.875rem;
  }
`;

export const BookingContent = styled.div`
  padding: 1.25rem 1.25rem 1.5rem;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    padding: 1.5rem 1.75rem 1.75rem;
  }
`;

export const StepHeader = styled.div`
  margin-bottom: 1.25rem;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    margin-bottom: 1.5rem;
  }
`;

export const StepTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #fafafa;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    font-size: 1.35rem;
  }
`;

export const StepDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(245, 245, 245, 0.55);
  margin: 0;
  line-height: 1.5;
  max-width: 38rem;
`;

export const ServiceGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.875rem;
  }
`;

export const ServiceCard = styled.div<{ selected?: boolean }>`
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.lg};
  border: 2px solid transparent;
  border-color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.border.primary};
  background-color: ${props => props.selected
    ? 'rgba(200, 146, 42, 0.10)'
    : props.theme.colors.background.secondary};
  box-shadow: ${props => props.selected
    ? 'inset 0 0 0 1px rgba(200, 146, 42, 0.35), 0 6px 24px rgba(200, 146, 42, 0.18)'
    : 'none'};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  outline: none;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.selected
      ? 'inset 0 0 0 1px rgba(200, 146, 42, 0.45), 0 8px 28px rgba(200, 146, 42, 0.22)'
      : '0 4px 16px rgba(200, 146, 42, 0.08)'};
  }
`;

export const ServiceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
`;

export const ServiceName = styled.h3`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #f5f5f5;
  margin: 0;
  line-height: 1.3;
`;

export const ServicePrice = styled.span`
  font-size: 0.9375rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--bs-brand-light, #e8b84b);
  white-space: nowrap;
`;

export const ServiceDuration = styled.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(245, 245, 245, 0.45);
  margin: 0;
  letter-spacing: 0.02em;
`;

export const ProfessionalGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

export const ProfessionalCard = styled(ServiceCard)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
`;

export const ProfessionalName = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #f0f0f0;
  margin: 0;
  line-height: 1.35;
`;

// Calendário e horários — duas colunas só em telas largas; em md a coluna da direita ficava estreita e sumia a grade.
export const DateTimeContainer = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
`;

export const CalendarContainer = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;
  width: 100%;
`;

/** Cartão ao redor do calendário (contraste e área de toque) */
export const CalendarShell = styled.div`
  width: 100%;
  max-width: 22rem;
  margin: 0 auto;
  padding: 1rem 1rem 1.1rem;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  .react-calendar {
    width: 100% !important;
    background: transparent !important;
  }
`;

export const TimeSlotPanel = styled.div`
  padding: 1rem 1rem 1.1rem;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

export const TimeSlotContainer = styled.div`
  min-width: 0;
  width: 100%;
`;

export const TimeSlotHeader = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fafafa;
  text-align: center;
  margin: 0 0 0.35rem 0;
`;

export const TimeSlotSub = styled.p`
  margin: 0 0 1rem 0;
  text-align: center;
  font-size: 0.8125rem;
  color: rgba(245, 245, 245, 0.48);
  line-height: 1.45;
`;

export const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
  gap: 0.5rem;
  max-height: 280px;
  overflow-y: auto;
  padding: 0.15rem;
  scrollbar-gutter: stable;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
  }
`;

export const TimeSlotButton = styled.button<{ $active?: boolean }>`
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #f0f0f0;
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 0.65rem 0.45rem;
  border-radius: 999px;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.12s ease,
    box-shadow 0.18s ease;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: color-mix(in srgb, var(--bs-brand-main, #c8922a) 40%, transparent);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--bs-brand-main, #c8922a);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.28;
    cursor: not-allowed;
  }

  ${(p) =>
    p.$active &&
    css`
      background: linear-gradient(135deg, var(--bs-brand-main, #c8922a), var(--bs-brand-light, #e8b84b));
      border-color: transparent;
      color: #0d0d0d;
      box-shadow: 0 6px 20px color-mix(in srgb, var(--bs-brand-main, #c8922a) 35%, transparent);
    `}
`;

// Formulário de cliente
export const ClientForm = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

export const StepNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 0.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  & > button {
    min-height: 48px;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }
`;

// Página de sucesso
export const SuccessContainer = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[4]};
`;

export const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${props => props.theme.colors.success} 0%, #25A244 100%);
  border-radius: ${props => props.theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing[6]} auto;
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
`;

export const SuccessTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
`;

export const SuccessMessage = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  color: ${props => props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

export const SuccessDetails = styled.div`
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

// Loading
export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors.border.primary};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Review Booking Step
export const ReviewContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};
`;

export const ReviewSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 0.75rem;
`;

export const ReviewSectionTitle = styled.h4`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 ${props => props.theme.spacing[3]} 0;
`;

export const ReviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing[2]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.secondary};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

export const ReviewLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

export const ReviewValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
  text-align: right;
`;

export const ReviewTotalSection = styled(ReviewSection)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}15 0%, ${props => props.theme.colors.primaryLight}10 100%);
  border: 2px solid ${props => props.theme.colors.primary};
`;

export const ReviewTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ReviewTotalLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
`;

export const ReviewTotalValue = styled.span`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  font-weight: ${props => props.theme.typography.fontWeights.extrabold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.md};
  transition: ${props => props.theme.transitions.base};

  &:hover {
    background-color: ${props => props.theme.colors.primary}10;
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Payment Selection Step
export const PaymentOptionsGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

export const PaymentOptionCard = styled.div<{ selected?: boolean; disabled?: boolean }>`
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.lg};
  border: 2px solid ${props =>
    props.selected ? props.theme.colors.primary : props.theme.colors.border.primary};
  background-color: ${props =>
    props.disabled ? props.theme.colors.background.secondary + '80' :
    props.selected ? props.theme.colors.primary + '10' : props.theme.colors.background.secondary};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.base};
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover {
    border-color: ${props => props.disabled ? props.theme.colors.border.primary : props.theme.colors.primary};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : props.theme.shadows.md};
  }

  ${props => props.selected && css`
    box-shadow: ${props.theme.shadows.glow};
  `}
`;

export const PaymentOptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

export const PaymentOptionName = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

export const PaymentOptionBadge = styled.span<{ type: 'discount' | 'popular' | 'new' }>`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radii.full};
  text-transform: uppercase;
  letter-spacing: 0.3px;

  ${props => props.type === 'discount' && css`
    background: linear-gradient(135deg, ${props.theme.colors.success}, #25A244);
    color: white;
  `}

  ${props => props.type === 'popular' && css`
    background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primaryLight});
    color: white;
  `}

  ${props => props.type === 'new' && css`
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: white;
  `}
`;

export const PaymentOptionDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

export const PaymentOptionFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${props => props.theme.spacing[2]} 0 0 0;
`;

export const PaymentOptionFeature = styled.li`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.secondary};
  padding-left: ${props => props.theme.spacing[3]};
  position: relative;
  margin-bottom: ${props => props.theme.spacing[1]};

  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: ${props => props.theme.colors.success};
    font-weight: ${props => props.theme.typography.fontWeights.bold};
  }
`;

export const PaymentPlanBadge = styled.div<{ required?: boolean }>`
  display: inline-block;
  font-size: ${props => props.theme.typography.fontSizes['2xs']};
  padding: 0.15rem 0.5rem;
  border-radius: ${props => props.theme.radii.full};
  background: ${props => props.required ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)'};
  color: ${props => props.required ? '#EF4444' : '#8B5CF6'};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  margin-top: ${props => props.theme.spacing[2]};
`;

export const InlineInfoBox = styled.div`
  margin-bottom: 1.25rem;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(200, 146, 42, 0.12) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  border: 1px solid color-mix(in srgb, var(--bs-brand-main, #c8922a) 35%, transparent);
`;

export const SuccessStatusCard = styled.div`
  background: rgba(0, 195, 120, 0.06);
  border: 1px solid rgba(0, 195, 120, 0.2);
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing[5]};
  text-align: center;
`;