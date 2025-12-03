import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { paymentService, PaymentData, PaymentResponse, PaymentMethod } from '../services/paymentService';

// Simple SVG Icons
const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CopyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ClockIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

const CheckCircleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22,4 12,14.01 9,11.01"></polyline>
  </svg>
);

const AlertCircleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentData;
  onPaymentSuccess: (paymentId: string) => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const PaymentMethodSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const PaymentMethodButton = styled.button<{ $selected: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$selected ? '#eff6ff' : 'white'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const PaymentMethodIcon = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const PaymentMethodName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const PaymentDetails = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const QRCodeContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const QRCodeImage = styled.img`
  max-width: 250px;
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const PaymentCode = styled.div`
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  margin-bottom: 12px;
  position: relative;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: #2563eb;
  }
`;

const StatusContainer = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#fef3c7';
      case 'approved': return '#d1fae5';
      case 'expired': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#92400e';
      case 'approved': return '#065f46';
      case 'expired': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const CountdownTimer = styled.div`
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 16px;
`;

const PaymentInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const PaymentLabel = styled.span`
  color: #6b7280;
`;

const PaymentValue = styled.span`
  font-weight: 500;
  color: #111827;
`;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('selecting');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (paymentResponse && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPaymentStatus('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentResponse, timeLeft]);

  // Monitor payment status
  useEffect(() => {
    if (paymentResponse && paymentStatus === 'pending') {
      const checkStatus = async () => {
        try {
          const status = await paymentService.checkPaymentStatus(paymentResponse.paymentId);
          if (status === 'approved') {
            setPaymentStatus('approved');
            onPaymentSuccess(paymentResponse.paymentId);
          } else if (status === 'expired') {
            setPaymentStatus('expired');
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      };

      const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [paymentResponse, paymentStatus, onPaymentSuccess]);

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const response = await paymentService.createPayment(paymentData, selectedMethod);
      setPaymentResponse(response);
      setPaymentStatus('pending');
      
      // Set countdown timer
      if (response.expiresAt) {
        const expiresAt = new Date(response.expiresAt).getTime();
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado!');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <ClockIcon size={20} />;
      case 'approved':
        return <CheckCircleIcon size={20} />;
      case 'expired':
        return <AlertCircleIcon size={20} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Aguardando pagamento...';
      case 'approved':
        return 'Pagamento confirmado!';
      case 'expired':
        return 'Pagamento expirado';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Pagamento do Agendamento</ModalTitle>
          <CloseButton onClick={onClose}>
            <XIcon size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {paymentStatus === 'selecting' && (
            <>
              <PaymentMethodSelector>
                <PaymentMethodButton
                  $selected={selectedMethod === 'pix'}
                  onClick={() => setSelectedMethod('pix')}
                >
                  <PaymentMethodIcon>🏦</PaymentMethodIcon>
                  <PaymentMethodName>PIX</PaymentMethodName>
                </PaymentMethodButton>
                
                <PaymentMethodButton
                  $selected={selectedMethod === 'bitcoin'}
                  onClick={() => setSelectedMethod('bitcoin')}
                >
                  <PaymentMethodIcon>₿</PaymentMethodIcon>
                  <PaymentMethodName>Bitcoin</PaymentMethodName>
                </PaymentMethodButton>
              </PaymentMethodSelector>

              <PaymentDetails>
                <PaymentInfo>
                  <PaymentLabel>Serviço:</PaymentLabel>
                  <PaymentValue>{paymentData.description}</PaymentValue>
                </PaymentInfo>
                <PaymentInfo>
                  <PaymentLabel>Cliente:</PaymentLabel>
                  <PaymentValue>{paymentData.clientName}</PaymentValue>
                </PaymentInfo>
                <PaymentInfo>
                  <PaymentLabel>Valor:</PaymentLabel>
                  <PaymentValue>{formatCurrency(paymentData.amount)}</PaymentValue>
                </PaymentInfo>
              </PaymentDetails>

              <button
                onClick={handleCreatePayment}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Processando...' : `Pagar com ${selectedMethod.toUpperCase()}`}
              </button>
            </>
          )}

          {paymentResponse && paymentStatus !== 'selecting' && (
            <>
              <StatusContainer $status={paymentStatus}>
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </StatusContainer>

              {paymentStatus === 'pending' && timeLeft > 0 && (
                <CountdownTimer>
                  Tempo restante: {formatTime(timeLeft)}
                </CountdownTimer>
              )}

              {selectedMethod === 'pix' && paymentResponse.qrCode && (
                <>
                  <QRCodeContainer>
                    <QRCodeImage src={paymentResponse.qrCode} alt="QR Code PIX" />
                  </QRCodeContainer>
                  
                  {paymentResponse.pixCode && (
                    <PaymentCode>
                      {paymentResponse.pixCode}
                      <CopyButton onClick={() => copyToClipboard(paymentResponse.pixCode!)}>
                        <CopyIcon size={12} />
                        Copiar
                      </CopyButton>
                    </PaymentCode>
                  )}
                </>
              )}

              {selectedMethod === 'bitcoin' && paymentResponse.bitcoinQrCode && (
                <>
                  <QRCodeContainer>
                    <QRCodeImage src={paymentResponse.bitcoinQrCode} alt="QR Code Bitcoin" />
                  </QRCodeContainer>
                  
                  <PaymentDetails>
                    <PaymentInfo>
                      <PaymentLabel>Endereço:</PaymentLabel>
                      <PaymentValue style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                        {paymentResponse.bitcoinAddress}
                      </PaymentValue>
                    </PaymentInfo>
                    <PaymentInfo>
                      <PaymentLabel>Valor em BTC:</PaymentLabel>
                      <PaymentValue>{paymentResponse.bitcoinAmount?.toFixed(8)} BTC</PaymentValue>
                    </PaymentInfo>
                    <PaymentInfo>
                      <PaymentLabel>Valor em BRL:</PaymentLabel>
                      <PaymentValue>{formatCurrency(paymentData.amount)}</PaymentValue>
                    </PaymentInfo>
                  </PaymentDetails>

                  {paymentResponse.bitcoinAddress && (
                    <CopyButton 
                      onClick={() => copyToClipboard(paymentResponse.bitcoinAddress!)}
                      style={{ position: 'static', width: '100%', marginTop: '12px' }}
                    >
                      <CopyIcon size={16} />
                      Copiar Endereço Bitcoin
                    </CopyButton>
                  )}
                </>
              )}

              {paymentStatus === 'approved' && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '12px 24px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Continuar
                  </button>
                </div>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};