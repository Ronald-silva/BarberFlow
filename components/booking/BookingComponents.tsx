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