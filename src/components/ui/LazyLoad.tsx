import React, { Suspense } from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.border.primary};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin: 0;
`;

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback: React.FC = () => (
  <LoadingContainer>
    <LoadingSpinner />
    <LoadingText>Carregando...</LoadingText>
  </LoadingContainer>
);

const LazyLoad: React.FC<LazyLoadProps> = ({ children, fallback = <DefaultFallback /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyLoad;