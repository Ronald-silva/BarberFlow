import React from 'react';
import styled from 'styled-components';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressContainer = styled.div`
  margin-bottom: 2.5rem;
  padding: 0 1rem;
`;

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 1rem;
`;

const ProgressLine = styled.div<{ progress: number }>`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: ${props => props.theme.colors.border.secondary};
  transform: translateY(-50%);
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
    transition: width 0.4s ease;
  }
`;

const StepCircle = styled.div<{ active: boolean; completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  z-index: 1;
  transition: all 0.3s ease;
  position: relative;

  ${props => props.completed && `
    background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primaryLight});
    color: white;
    box-shadow: ${props.theme.shadows.md};
  `}

  ${props => props.active && !props.completed && `
    background: ${props.theme.colors.background.elevated};
    border: 3px solid ${props.theme.colors.primary};
    color: ${props.theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
  `}

  ${props => !props.active && !props.completed && `
    background: ${props.theme.colors.background.secondary};
    border: 2px solid ${props.theme.colors.border.primary};
    color: ${props.theme.colors.text.tertiary};
  `}

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 32px;
    height: 32px;
    font-size: ${props => props.theme.typography.fontSizes.xs};
  }
`;

const StepLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const StepLabel = styled.div<{ active: boolean }>`
  flex: 1;
  text-align: center;
  font-size: ${props => props.theme.typography.fontSizes.xs};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.tertiary};
  font-weight: ${props => props.active ? props.theme.typography.fontWeights.semibold : props.theme.typography.fontWeights.normal};
  transition: all 0.3s ease;
  padding: 0 0.25rem;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: 0.65rem;
    display: ${props => props.active ? 'block' : 'none'};
  }
`;

const CurrentStepInfo = styled.div`
  text-align: center;
  margin-top: 1rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const CurrentStepText = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <ProgressContainer>
      <ProgressBar>
        <ProgressLine progress={progress} />
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <StepCircle
              key={stepNumber}
              active={isActive}
              completed={isCompleted}
            >
              {isCompleted ? '✓' : stepNumber}
            </StepCircle>
          );
        })}
      </ProgressBar>

      <StepLabels>
        {steps.map((step, index) => (
          <StepLabel key={index} active={index + 1 === currentStep}>
            {step}
          </StepLabel>
        ))}
      </StepLabels>

      <CurrentStepInfo>
        <CurrentStepText>
          Passo {currentStep} de {totalSteps}: {steps[currentStep - 1]}
        </CurrentStepText>
      </CurrentStepInfo>
    </ProgressContainer>
  );
};
