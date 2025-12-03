// Error Boundary Global
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import styled from 'styled-components';
import { logError, getErrorMessage } from '../utils/errors';

// ============================================
// COMPONENTE DE FALLBACK
// ============================================

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorContainer role="alert">
      <ErrorIcon>⚠️</ErrorIcon>
      <ErrorTitle>Oops! Algo deu errado</ErrorTitle>
      <ErrorMessage>{getErrorMessage(error)}</ErrorMessage>
      <ErrorDetails>
        <DetailsTitle>Detalhes técnicos:</DetailsTitle>
        <DetailsCode>{error.stack}</DetailsCode>
      </ErrorDetails>
      <ButtonGroup>
        <PrimaryButton onClick={resetErrorBoundary}>
          Tentar Novamente
        </PrimaryButton>
        <SecondaryButton onClick={() => window.location.href = '/'}>
          Voltar ao Início
        </SecondaryButton>
      </ButtonGroup>
    </ErrorContainer>
  );
}

// ============================================
// ERROR BOUNDARY WRAPPER
// ============================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const handleError = (error: Error, info: { componentStack: string }) => {
    logError(error, 'ErrorBoundary');
    console.error('Component Stack:', info.componentStack);

    // TODO: Enviar para Sentry
    // Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } });
  };

  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
}

// ============================================
// ESTILOS
// ============================================

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const ErrorDetails = styled.details`
  max-width: 800px;
  margin-bottom: 2rem;
  text-align: left;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DetailsTitle = styled.summary`
  font-weight: 600;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;

  &:hover {
    color: #333;
  }
`;

const DetailsCode = styled.pre`
  font-size: 0.85rem;
  color: #e74c3c;
  background: #f8f8f8;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #666;
  border: 2px solid #ddd;

  &:hover {
    border-color: #ff6b35;
    color: #ff6b35;
  }
`;

// ============================================
// MINI ERROR BOUNDARY (para componentes específicos)
// ============================================

interface MiniErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function MiniErrorFallback() {
  return (
    <MiniErrorContainer>
      <MiniErrorIcon>⚠️</MiniErrorIcon>
      <MiniErrorText>Erro ao carregar este componente</MiniErrorText>
    </MiniErrorContainer>
  );
}

export function MiniErrorBoundary({ children, fallback }: MiniErrorBoundaryProps) {
  const handleError = (error: Error) => {
    logError(error, 'MiniErrorBoundary');
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={() => (fallback ? <>{fallback}</> : <MiniErrorFallback />)}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}

const MiniErrorContainer = styled.div`
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MiniErrorIcon = styled.span`
  font-size: 1.5rem;
`;

const MiniErrorText = styled.p`
  color: #856404;
  margin: 0;
`;
