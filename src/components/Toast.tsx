// Componente Toast para exibir mensagens de feedback
import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <ToastWrapper type={toast.type} role="alert" aria-live="polite">
      <ToastIcon>{getIcon()}</ToastIcon>
      <ToastMessage>{toast.message}</ToastMessage>
      <CloseButton onClick={() => onClose(toast.id)} aria-label="Fechar notificação">
        ×
      </CloseButton>
    </ToastWrapper>
  );
}

interface ToastContainerListProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerListProps) {
  return (
    <ToastListContainer>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </ToastListContainer>
  );
}

// ============================================
// ESTILOS
// ============================================

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const getToastColor = (type: ToastType['type']) => {
  switch (type) {
    case 'success':
      return '#10b981'; // Green
    case 'error':
      return '#ef4444'; // Red
    case 'warning':
      return '#f59e0b'; // Orange
    case 'info':
    default:
      return '#3b82f6'; // Blue
  }
};

const ToastListContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const ToastWrapper = styled.div<{ type: ToastType['type'] }>`
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-left: 4px solid ${(props) => getToastColor(props.type)};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const ToastIcon = styled.span`
  font-size: 24px;
  flex-shrink: 0;
`;

const ToastMessage = styled.p`
  flex: 1;
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
