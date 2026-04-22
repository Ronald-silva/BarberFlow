import React from 'react';
import styled from 'styled-components';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const Shell = styled.div`
  margin-bottom: 1.75rem;
`;

const TopRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const Meta = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(245, 245, 245, 0.45);
`;

const Pct = styled.span`
  font-size: 0.75rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--bs-brand-light, #e8b84b);
`;

const BarTrack = styled.div`
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  margin-bottom: 0.75rem;
`;

const BarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--bs-brand-main, #c8922a),
    var(--bs-brand-light, #e8b84b)
  );
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const CurrentTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #fafafa;
  margin: 0 0 0.75rem 0;
  line-height: 1.25;
`;

const Dots = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
`;

const Dot = styled.span<{ $done: boolean; $current: boolean }>`
  width: ${(p) => (p.$current ? '22px' : '8px')};
  height: 8px;
  border-radius: 999px;
  transition:
    width 0.25s ease,
    background 0.2s ease,
    opacity 0.2s ease;
  background: ${(p) =>
    p.$done
      ? 'linear-gradient(90deg, var(--bs-brand-main, #c8922a), var(--bs-brand-light, #e8b84b))'
      : p.$current
        ? 'rgba(255, 255, 255, 0.35)'
        : 'rgba(255, 255, 255, 0.1)'};
  opacity: ${(p) => (p.$current ? 1 : p.$done ? 1 : 0.55)};
`;

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  const denom = Math.max(totalSteps - 1, 1);
  const pct = ((currentStep - 1) / denom) * 100;
  const label = steps[currentStep - 1] ?? '';

  return (
    <Shell role="navigation" aria-label="Progresso do agendamento">
      <TopRow>
        <Meta>
          Etapa {currentStep} de {totalSteps}
        </Meta>
        <Pct aria-hidden>{Math.round(pct)}%</Pct>
      </TopRow>
      <BarTrack aria-hidden>
        <BarFill $pct={pct} />
      </BarTrack>
      <CurrentTitle>{label}</CurrentTitle>
      <Dots aria-hidden>
        {steps.map((_, i) => {
          const n = i + 1;
          return <Dot key={i} $done={n < currentStep} $current={n === currentStep} />;
        })}
      </Dots>
    </Shell>
  );
};
