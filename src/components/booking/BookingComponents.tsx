import styled, { css } from 'styled-components';
import { Button } from '../ui/Button';
import { Card } from '../ui/Container';

// Container principal
export const BookingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.primary} 0%, ${props => props.theme.colors.background.secondary} 100%);
  padding: ${props => props.theme.spacing[3]};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[4]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[8]};
  }
`;

export const BookingCard = styled(Card)`
  max-width: 100%;
  margin: 0 auto;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border.primary};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    max-width: 600px;
    box-shadow: ${props => props.theme.shadows.xl};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    max-width: 700px;
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    max-width: 800px;
    box-shadow: ${props => props.theme.shadows['2xl']};
  }
`;

// Header da barbearia
export const BarbershopHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[5]};
    gap: ${props => props.theme.spacing[4]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]};
  }
`;

export const BarbershopLogo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.lg};
  border: 2px solid ${props => props.theme.colors.primary};
  object-fit: cover;
  flex-shrink: 0;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    width: 56px;
    height: 56px;
    border-radius: ${props => props.theme.radii.xl};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    width: 64px;
    height: 64px;
  }
`;

export const BarbershopInfo = styled.div`
  flex: 1;
  min-width: 0; /* Allow text truncation */
`;

export const BarbershopName = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
  line-height: 1.2;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSizes.xl};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.typography.fontSizes['2xl']};
  }
`;

export const BarbershopAddress = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.theme.colors.text.tertiary};
  margin: 0;
  line-height: 1.3;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSizes.sm};
  }
`;

// Conteúdo principal
export const BookingContent = styled.div`
  padding: ${props => props.theme.spacing[4]};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[5]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]};
  }
`;

export const StepHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    margin-bottom: ${props => props.theme.spacing[5]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    margin-bottom: ${props => props.theme.spacing[6]};
  }
`;

export const StepTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.primary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSizes.xl};
  }
`;

export const StepDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.typography.fontSizes.base};
  }
`;

// Seleção de serviços
export const ServiceGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[5]};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    margin-bottom: ${props => props.theme.spacing[6]};
  }
`;

export const ServiceCard = styled.div<{ selected?: boolean }>`
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.radii.lg};
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.border.primary};
  background-color: ${props => props.selected ? props.theme.colors.primary + '10' : props.theme.colors.background.secondary};
  cursor: pointer;
  transition: ${props => props.theme.transitions.base};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.selected && css`
    box-shadow: ${props => props.theme.shadows.glow};
  `}
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const ServiceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing[2]};
`;

export const ServiceName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

export const ServicePrice = styled.span`
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.primary};
`;

export const ServiceDuration = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  margin: 0;
`;

// Seleção de profissional
export const ProfessionalGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

export const ProfessionalCard = styled(ServiceCard)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

export const ProfessionalName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

// Calendário e horários
export const DateTimeContainer = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const CalendarContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const TimeSlotContainer = styled.div``;

export const TimeSlotHeader = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  text-align: center;
  margin: 0 0 ${props => props.theme.spacing[4]} 0;
`;

export const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing[2]};
  max-height: 300px;
  overflow-y: auto;
`;

export const TimeSlotButton = styled(Button)<{ selected?: boolean }>`
  ${props => props.selected && css`
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text.inverse};
  `}
`;

// Formulário de cliente
export const ClientForm = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

// Navegação entre steps
export const StepNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.border.primary};
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
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.border.primary};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

export const ReviewSectionTitle = styled.h4`
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