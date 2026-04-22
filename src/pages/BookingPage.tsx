import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Barbershop, Service, User } from '../types';
import { supabaseApi } from '../services/supabaseApi';
import { supabase } from '../services/supabase';
import { paymentService, type PaymentResponse } from '../services/paymentService';
import { useToastContext } from '../contexts/ToastContext';
import { maskPhone, formatBRL, formatDateBR, formatDateTimeBR } from '../utils/formatters';
import { getAvailableSlots } from '../utils/timeSlots';
import Calendar from 'react-calendar';
import { addDays, format, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button } from '../components/ui/Button';
import { Input, Label, FormGroup } from '../components/ui/Input';
import { Text } from '../components/ui/Container';
import { ProgressIndicator } from '../components/booking/ProgressIndicator';
import {
  BookingContainer,
  BookingCard,
  BarbershopHeader,
  BarbershopLogo,
  BarbershopInfo,
  BarbershopName,
  BarbershopAddress,
  BookingContent,
  StepHeader,
  StepTitle,
  StepDescription,
  ServiceGrid,
  ServiceCard,
  ServiceInfo,
  ServiceName,
  ServicePrice,
  ServiceDuration,
  ProfessionalGrid,
  ProfessionalCard,
  ProfessionalName,
  DateTimeContainer,
  CalendarContainer,
  CalendarShell,
  TimeSlotContainer,
  TimeSlotPanel,
  TimeSlotHeader,
  TimeSlotSub,
  TimeSlotGrid,
  TimeSlotButton,
  ClientForm,
  StepNavigation,
  ReviewContainer,
  ReviewSection,
  ReviewSectionTitle,
  ReviewItem,
  ReviewLabel,
  ReviewValue,
  ReviewTotalSection,
  ReviewTotal,
  ReviewTotalLabel,
  ReviewTotalValue,
  EditButton,
  PaymentOptionsGrid,
  PaymentOptionCard,
  PaymentOptionHeader,
  PaymentOptionName,
  PaymentOptionBadge,
  PaymentOptionDescription,
  PaymentOptionFeatures,
  PaymentOptionFeature,
  PaymentPlanBadge,
  InlineInfoBox,
  SuccessStatusCard,
  SuccessContainer,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  SuccessDetails,
  LoadingContainer,
  LoadingSpinner,
} from '../components/booking/BookingComponents';

// ── MP PIX styled components ────────────────────────────────────────────────

const pixSpin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const PixContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 0;
`;

const PixQrImage = styled.img`
  width: 220px;
  height: 220px;
  border-radius: 12px;
  border: 3px solid #22c55e;
  background: #fff;
  display: block;
`;

const PixCopyBox = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${p => p.theme.colors.background.secondary};
  border: 1px solid ${p => p.theme.colors.border.primary};
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-family: monospace;
  font-size: 0.7rem;
  word-break: break-all;
  color: ${p => p.theme.colors.text.secondary};
  cursor: pointer;
  text-align: left;
  line-height: 1.5;
`;

const PixStatusBadge = styled.div<{ $status: 'waiting' | 'approved' | 'cancelled' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  ${p =>
    p.$status === 'approved'
      ? `background: #dcfce7; color: #16a34a;`
      : p.$status === 'cancelled'
      ? `background: #fee2e2; color: #dc2626;`
      : `background: ${p.theme.colors.background.tertiary}; color: ${p.theme.colors.text.secondary};`}
`;

const PixSpinnerEl = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${pixSpin} 0.8s linear infinite;
  flex-shrink: 0;
`;

const PixTimer = styled.div`
  font-size: 0.8rem;
  color: ${p => p.theme.colors.text.tertiary};
`;

// ── end MP PIX styled components ────────────────────────────────────────────

const STEPS = [
  'Serviços',
  'Profissional',
  'Data/Hora',
  'Seus Dados',
  'Revisar',
  'Pagamento',
  'Confirmado'
];

// Feature Flags - Controle de funcionalidades
const FEATURES = {
  enableCryptoPayments: false, // Bitcoin e USDT desabilitados por padrão (baixa adoção + fricção)
  enablePixDiscount: true,
  pixDiscountPercentage: 5,
};

type PaymentMethod = 'in_person' | 'pix' | 'bitcoin' | 'usdt';

const BookingPage: React.FC = () => {
  const toast = useToastContext();
  const { barbershopSlug } = useParams<{ barbershopSlug: string }>();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [step, setStep] = useState(1);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('in_person');
  /** PIX Asaas gerado após criar o agendamento (exibido na etapa de sucesso). */
  const [pixBookingPayment, setPixBookingPayment] = useState<PaymentResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // MP PIX payment-first state
  const [mpPaymentId, setMpPaymentId] = useState<string | null>(null);
  const [mpQrCode, setMpQrCode] = useState<string | null>(null);
  const [mpQrCodeBase64, setMpQrCodeBase64] = useState<string | null>(null);
  const [mpTicketUrl, setMpTicketUrl] = useState<string | null>(null);
  const [mpExpiresAt, setMpExpiresAt] = useState<Date | null>(null);
  const [mpAppointmentId, setMpAppointmentId] = useState<string | null>(null);
  const [mpPollingStatus, setMpPollingStatus] = useState<'waiting' | 'approved' | 'cancelled'>('waiting');
  const [mpSecondsLeft, setMpSecondsLeft] = useState(30 * 60);

  useEffect(() => {
    const loadData = async () => {
      if (barbershopSlug) {
        setLoading(true);
        try {
          const bs = await supabaseApi.getBarbershopBySlug(barbershopSlug);
          if (bs) {
            setBarbershop(bs);
            const [srv, prof] = await Promise.all([
              supabaseApi.getPublicServicesByBarbershop(bs.id),
              supabaseApi.getPublicProfessionalsByBarbershop(bs.id)
            ]);
            setServices(srv);
            setProfessionals(prof);
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [barbershopSlug]);

  // Polling: check MP payment every 3s while on step 6 (payment-first flow)
  useEffect(() => {
    const isPaymentFirst = barbershop?.requirePaymentBeforeBooking;
    if (!isPaymentFirst || step !== 6 || !mpPaymentId || !mpAppointmentId || mpPollingStatus !== 'waiting') return;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('check-mercadopago-payment', {
          body: {
            payment_id: mpPaymentId,
            barbershop_id: barbershop!.id,
            appointment_id: mpAppointmentId,
          },
        });
        const status = (data as { status?: string })?.status;
        if (status === 'approved') {
          setMpPollingStatus('approved');
          clearInterval(interval);
          setTimeout(() => setStep(7), 800); // small delay so "Pago!" badge shows briefly
        } else if (status === 'cancelled' || status === 'rejected') {
          setMpPollingStatus('cancelled');
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, mpPaymentId, mpAppointmentId, mpPollingStatus, barbershop]);

  // Countdown timer for MP PIX expiration
  useEffect(() => {
    if (!mpExpiresAt || step !== 6) return;
    const tick = setInterval(() => {
      const left = Math.max(0, Math.floor((mpExpiresAt.getTime() - Date.now()) / 1000));
      setMpSecondsLeft(left);
      if (left === 0) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [mpExpiresAt, step]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((total, sId) => {
      const service = services.find(s => s.id === sId);
      return total + (service?.price || 0);
    }, 0);
  }, [selectedServices, services]);

  const discountedPrice = useMemo(() => {
    if (FEATURES.enablePixDiscount && paymentMethod === 'pix') {
      return totalPrice * (1 - FEATURES.pixDiscountPercentage / 100);
    }
    return totalPrice;
  }, [totalPrice, paymentMethod]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((total, sId) => {
      const service = services.find(s => s.id === sId);
      return total + (service?.duration || 0);
    }, 0);
  }, [selectedServices, services]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleConfirmBooking = async () => {
    if (!barbershop || !selectedTime || professionals.length === 0) return;

    setSubmitting(true);
    setPixBookingPayment(null);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      const professionalToBook = selectedProfessional === 'any' ? professionals[0].id : selectedProfessional;

      const appointment = await supabaseApi.createAppointment({
        client: { name: clientName, whatsapp: clientWhatsapp },
        barbershopId: barbershop.id,
        professionalId: professionalToBook,
        serviceIds: selectedServices,
        startDateTime: bookingDateTime.toISOString(),
        totalPrice: discountedPrice,
        paymentRequired: paymentMethod !== 'in_person',
        paymentStatus: paymentMethod === 'in_person' ? 'pending' : 'pending',
        paymentMethod,
      });

      if (paymentMethod === 'pix') {
        const serviceNames = selectedServices
          .map((id) => services.find((s) => s.id === id)?.name)
          .filter(Boolean)
          .join(', ');
        const pix = await paymentService.createPixPayment({
          appointmentId: appointment.id,
          barbershopId: barbershop.id,
          amount: discountedPrice,
          clientName,
          clientEmail: clientEmail.trim() || undefined,
          clientPhone: clientWhatsapp,
          description: `${barbershop.name} — ${serviceNames || 'Serviços'} — ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} ${selectedTime}`,
        });
        setPixBookingPayment(pix);
      } else {
        setPixBookingPayment(null);
      }

      setStep(7); // Success step
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      const msg = error instanceof Error ? error.message : 'Erro ao criar agendamento. Tente novamente.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Generate MP PIX before confirming appointment (payment-first flow)
  const handleGenerateMpPix = useCallback(async () => {
    if (!barbershop || !selectedTime || professionals.length === 0) return;
    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      const professionalToBook = selectedProfessional === 'any' ? professionals[0].id : selectedProfessional;

      const appointment = await supabaseApi.createAppointment({
        client: { name: clientName, whatsapp: clientWhatsapp },
        barbershopId: barbershop.id,
        professionalId: professionalToBook,
        serviceIds: selectedServices,
        startDateTime: bookingDateTime.toISOString(),
        totalPrice,
        paymentRequired: true,
        paymentStatus: 'pending_payment',
        paymentMethod: 'pix',
      });

      setMpAppointmentId(appointment.id);

      const serviceNames = selectedServices
        .map(id => services.find(s => s.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      const { data: pixData, error: pixErr } = await supabase.functions.invoke('create-mercadopago-pix', {
        body: {
          barbershop_id: barbershop.id,
          appointment_id: appointment.id,
          amount: totalPrice,
          description: `${barbershop.name} — ${serviceNames || 'Serviços'} — ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} ${selectedTime}`,
          client_name: clientName,
          client_email: clientEmail.trim() || undefined,
          client_phone: clientWhatsapp,
        },
      });

      const err = pixErr || (pixData as { error?: string })?.error;
      if (err) throw new Error(typeof err === 'string' ? err : 'Erro ao gerar PIX');

      const pd = pixData as {
        payment_id: string;
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
        expires_at?: string;
      };

      setMpPaymentId(pd.payment_id);
      setMpQrCode(pd.qr_code ?? null);
      setMpQrCodeBase64(pd.qr_code_base64 ?? null);
      setMpTicketUrl(pd.ticket_url ?? null);
      setMpExpiresAt(pd.expires_at ? new Date(pd.expires_at) : new Date(Date.now() + 30 * 60 * 1000));
      setMpSecondsLeft(30 * 60);
      setMpPollingStatus('waiting');
      setStep(6);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar PIX. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }, [barbershop, selectedTime, selectedDate, selectedProfessional, professionals, clientName, clientWhatsapp, clientEmail, selectedServices, services, totalPrice, ptBR]);

  const FALLBACK_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'];

  const timeSlots = useMemo(() => {
    const slotMin = totalDuration > 0 ? totalDuration : 30;
    const dynamic = getAvailableSlots(barbershop?.workingHours, selectedDate, slotMin);
    if (dynamic === null) return FALLBACK_SLOTS;
    return dynamic;
  }, [barbershop?.workingHours, selectedDate, totalDuration]);

  if (loading) {
    return (
      <BookingContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <Text $color="tertiary">Carregando informações da barbearia...</Text>
        </LoadingContainer>
      </BookingContainer>
    );
  }

  if (!barbershop) {
    return (
      <BookingContainer>
        <LoadingContainer>
          <Text $color="primary" $size="lg">Barbearia não encontrada</Text>
          <Text $color="tertiary">
            A barbearia "{barbershopSlug}" não existe ou não está disponível para agendamentos online.
          </Text>
        </LoadingContainer>
      </BookingContainer>
    );
  }

  if (professionals.length === 0) {
    return (
      <BookingContainer>
        <LoadingContainer>
          <Text $color="primary" $size="lg">Nenhum profissional disponível</Text>
          <Text $color="tertiary">Esta barbearia não possui profissionais cadastrados</Text>
        </LoadingContainer>
      </BookingContainer>
    );
  }

  const professionalForConfirmation = professionals.find(p => p.id === selectedProfessional) || professionals[0];

  return (
    <BookingContainer>
      <BookingCard $variant="glass" className="fade-in">
        <BarbershopHeader>
          <BarbershopLogo src={barbershop.logoUrl} alt={`Logo ${barbershop.name}`} />
          <BarbershopInfo>
            <BarbershopName>{barbershop.name}</BarbershopName>
            <BarbershopAddress>{barbershop.address}</BarbershopAddress>
          </BarbershopInfo>
        </BarbershopHeader>

        <BookingContent>
          {step < 7 && (
            <ProgressIndicator
              currentStep={step}
              totalSteps={7}
              steps={STEPS}
            />
          )}

          {/* Step 1: Services */}
          {step === 1 && (
            <div className="slide-in">
              <StepHeader>
                <StepTitle>Escolha os serviços</StepTitle>
                <StepDescription>Selecione um ou mais serviços que deseja realizar</StepDescription>
              </StepHeader>

              <ServiceGrid>
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    selected={selectedServices.includes(service.id)}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <ServiceInfo>
                      <ServiceName>{service.name}</ServiceName>
                      <ServicePrice>{formatBRL(service.price)}</ServicePrice>
                    </ServiceInfo>
                    <ServiceDuration>{service.duration} minutos</ServiceDuration>
                  </ServiceCard>
                ))}
              </ServiceGrid>

              {selectedServices.length > 0 && (
                <InlineInfoBox>
                  <Text $color="primary" $weight="semibold">
                    Total: {formatBRL(totalPrice)} • {totalDuration} min
                  </Text>
                </InlineInfoBox>
              )}

              <StepNavigation>
                <div></div>
                <Button
                  $variant="primary"
                  onClick={() => setStep(2)}
                  disabled={selectedServices.length === 0}
                >
                  Continuar
                </Button>
              </StepNavigation>
            </div>
          )}

          {/* Step 2: Professional */}
          {step === 2 && (
            <div className="slide-in">
              <StepHeader>
                <StepTitle>Escolha o profissional</StepTitle>
                <StepDescription>Selecione seu profissional preferido ou deixe que escolhamos para você</StepDescription>
              </StepHeader>

              <ProfessionalGrid>
                <ProfessionalCard
                  selected={selectedProfessional === 'any'}
                  onClick={() => setSelectedProfessional('any')}
                >
                  <ProfessionalName>⚡ Qualquer Profissional (Mais Rápido)</ProfessionalName>
                </ProfessionalCard>

                {professionals.map(professional => (
                  <ProfessionalCard
                    key={professional.id}
                    selected={selectedProfessional === professional.id}
                    onClick={() => setSelectedProfessional(professional.id)}
                  >
                    <ProfessionalName>👨‍💼 {professional.name}</ProfessionalName>
                  </ProfessionalCard>
                ))}
              </ProfessionalGrid>

              <StepNavigation>
                <Button $variant="secondary" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button $variant="primary" onClick={() => setStep(3)}>
                  Continuar
                </Button>
              </StepNavigation>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="slide-in">
              <StepHeader>
                <StepTitle>Escolha data e horário</StepTitle>
                <StepDescription>Selecione quando deseja ser atendido</StepDescription>
              </StepHeader>

              <DateTimeContainer>
                <CalendarContainer>
                  <CalendarShell>
                    <Calendar
                      onChange={(date) => {
                        if (date instanceof Date) {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }
                      }}
                      value={selectedDate}
                      minDate={new Date()}
                      maxDate={addDays(new Date(), 60)}
                      locale="pt-BR"
                    />
                  </CalendarShell>
                </CalendarContainer>

                <TimeSlotContainer>
                  <TimeSlotPanel>
                    <TimeSlotHeader>
                      {format(selectedDate, "eeee, dd 'de' MMMM", { locale: ptBR })}
                    </TimeSlotHeader>
                    {timeSlots.length > 0 && (
                      <TimeSlotSub>Toque em um horário livre para este dia.</TimeSlotSub>
                    )}
                    {timeSlots.length === 0 ? (
                      <Text
                        $size="sm"
                        $color="secondary"
                        style={{ marginTop: '0.5rem', lineHeight: 1.5, textAlign: 'center' }}
                      >
                        A barbearia não atende neste dia. Escolha outra data no calendário.
                      </Text>
                    ) : (
                      <TimeSlotGrid>
                        {timeSlots.map((time) => {
                          const [hours, minutes] = time.split(':').map(Number);
                          const timeSlot = new Date(selectedDate);
                          timeSlot.setHours(hours, minutes, 0, 0);
                          const isPast = isBefore(timeSlot, new Date());

                          return (
                            <TimeSlotButton
                              key={time}
                              type="button"
                              $active={selectedTime === time}
                              onClick={() => setSelectedTime(time)}
                              disabled={isPast}
                            >
                              {time}
                            </TimeSlotButton>
                          );
                        })}
                      </TimeSlotGrid>
                    )}
                  </TimeSlotPanel>
                </TimeSlotContainer>
              </DateTimeContainer>

              <StepNavigation>
                <Button $variant="secondary" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button
                  $variant="primary"
                  onClick={() => setStep(4)}
                  disabled={!selectedTime}
                >
                  Continuar
                </Button>
              </StepNavigation>
            </div>
          )}

          {/* Step 4: Client Info */}
          {step === 4 && (
            <div className="slide-in">
              <StepHeader>
                <StepTitle>Seus dados</StepTitle>
                <StepDescription>Precisamos de suas informações para confirmar o agendamento</StepDescription>
              </StepHeader>

              <ClientForm>
                <FormGroup>
                  <Label htmlFor="name" $required>Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Seu nome completo"
                    disabled={submitting}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="whatsapp" $required>WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={clientWhatsapp}
                    onChange={(e) => setClientWhatsapp(maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    inputMode="numeric"
                    maxLength={15}
                    disabled={submitting}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="para recibo / PIX — recomendado se pagar com PIX"
                    disabled={submitting}
                  />
                </FormGroup>
              </ClientForm>

              <StepNavigation>
                <Button $variant="secondary" onClick={() => setStep(3)} disabled={submitting}>
                  Voltar
                </Button>
                <Button
                  $variant="primary"
                  onClick={() => setStep(5)}
                  disabled={!clientName || !clientWhatsapp || submitting}
                >
                  Continuar
                </Button>
              </StepNavigation>
            </div>
          )}

          {/* Step 5: Review Booking */}
          {step === 5 && (
            <div className="slide-in">
              <StepHeader>
                <StepTitle>Revise seu agendamento</StepTitle>
                <StepDescription>Confira se está tudo certo antes de escolher o pagamento</StepDescription>
              </StepHeader>

              <ReviewContainer>
                <ReviewSection>
                  <ReviewSectionTitle>
                    Serviços
                    <EditButton onClick={() => setStep(1)}>Editar</EditButton>
                  </ReviewSectionTitle>
                  {selectedServices.map(sId => {
                    const service = services.find(s => s.id === sId);
                    return service ? (
                      <ReviewItem key={service.id}>
                        <ReviewLabel>{service.name}</ReviewLabel>
                        <ReviewValue>{formatBRL(service.price)}</ReviewValue>
                      </ReviewItem>
                    ) : null;
                  })}
                </ReviewSection>

                <ReviewSection>
                  <ReviewSectionTitle>
                    Profissional
                    <EditButton onClick={() => setStep(2)}>Editar</EditButton>
                  </ReviewSectionTitle>
                  <ReviewItem>
                    <ReviewLabel>Profissional</ReviewLabel>
                    <ReviewValue>
                      {selectedProfessional === 'any' ? 'Qualquer disponível' : professionalForConfirmation.name}
                    </ReviewValue>
                  </ReviewItem>
                </ReviewSection>

                <ReviewSection>
                  <ReviewSectionTitle>
                    Data e Horário
                    <EditButton onClick={() => setStep(3)}>Editar</EditButton>
                  </ReviewSectionTitle>
                  <ReviewItem>
                    <ReviewLabel>Data</ReviewLabel>
                    <ReviewValue>{formatDateBR(selectedDate)}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Horário</ReviewLabel>
                    <ReviewValue>{selectedTime}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Duração</ReviewLabel>
                    <ReviewValue>{totalDuration} minutos</ReviewValue>
                  </ReviewItem>
                </ReviewSection>

                <ReviewSection>
                  <ReviewSectionTitle>
                    Seus Dados
                    <EditButton onClick={() => setStep(4)}>Editar</EditButton>
                  </ReviewSectionTitle>
                  <ReviewItem>
                    <ReviewLabel>Nome</ReviewLabel>
                    <ReviewValue>{clientName}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>WhatsApp</ReviewLabel>
                    <ReviewValue>{clientWhatsapp}</ReviewValue>
                  </ReviewItem>
                  {clientEmail.trim() ? (
                    <ReviewItem>
                      <ReviewLabel>E-mail</ReviewLabel>
                      <ReviewValue>{clientEmail.trim()}</ReviewValue>
                    </ReviewItem>
                  ) : null}
                </ReviewSection>

                <ReviewTotalSection>
                  <ReviewTotal>
                    <ReviewTotalLabel>Total</ReviewTotalLabel>
                    <ReviewTotalValue>
                      {formatBRL(paymentMethod === 'pix' ? discountedPrice : totalPrice)}
                      {paymentMethod === 'pix' ? ' (PIX com desconto)' : ''}
                    </ReviewTotalValue>
                  </ReviewTotal>
                </ReviewTotalSection>
              </ReviewContainer>

              <StepNavigation>
                <Button $variant="secondary" onClick={() => setStep(4)}>
                  Voltar
                </Button>
                {barbershop?.requirePaymentBeforeBooking ? (
                  <Button
                    $variant="primary"
                    onClick={() => void handleGenerateMpPix()}
                    disabled={submitting}
                    $loading={submitting}
                  >
                    {submitting ? 'Gerando PIX...' : 'Pagar com PIX 💚'}
                  </Button>
                ) : (
                  <Button $variant="primary" onClick={() => setStep(6)}>
                    Escolher Pagamento
                  </Button>
                )}
              </StepNavigation>
            </div>
          )}

          {/* Step 6: MP PIX payment-first OR normal payment selection */}
          {step === 6 && barbershop?.requirePaymentBeforeBooking && (
            <div className="slide-in">
              <StepHeader>
                <StepTitle>Pague com PIX 💚</StepTitle>
                <StepDescription>Escaneie o QR Code ou copie o código para confirmar seu horário</StepDescription>
              </StepHeader>

              <PixContainer>
                {/* QR Code image */}
                {mpQrCodeBase64 ? (
                  <PixQrImage
                    src={`data:image/png;base64,${mpQrCodeBase64}`}
                    alt="QR Code PIX"
                  />
                ) : mpTicketUrl ? (
                  <Text $size="sm" $color="secondary">
                    <a href={mpTicketUrl} target="_blank" rel="noopener noreferrer">
                      Abrir página de pagamento
                    </a>
                  </Text>
                ) : null}

                {/* Status badge */}
                <PixStatusBadge $status={mpPollingStatus}>
                  {mpPollingStatus === 'approved' ? (
                    <>✓ PIX Pago! Confirmando agendamento...</>
                  ) : mpPollingStatus === 'cancelled' ? (
                    <>✗ Pagamento cancelado</>
                  ) : (
                    <><PixSpinnerEl /> Aguardando pagamento...</>
                  )}
                </PixStatusBadge>

                {/* Countdown */}
                {mpPollingStatus === 'waiting' && (
                  <PixTimer>
                    Válido por {Math.floor(mpSecondsLeft / 60)}:{String(mpSecondsLeft % 60).padStart(2, '0')} min
                  </PixTimer>
                )}

                {/* Copia-e-cola */}
                {mpQrCode && mpPollingStatus === 'waiting' && (
                  <>
                    <Text $size="xs" $color="tertiary">Toque para copiar o código PIX:</Text>
                    <PixCopyBox
                      onClick={() => {
                        void navigator.clipboard.writeText(mpQrCode);
                        toast.success('Código PIX copiado!');
                      }}
                      title="Clique para copiar"
                    >
                      {mpQrCode}
                    </PixCopyBox>
                    <Button
                      $variant="secondary"
                      $size="sm"
                      onClick={() => {
                        void navigator.clipboard.writeText(mpQrCode);
                        toast.success('Código PIX copiado!');
                      }}
                    >
                      Copiar código PIX
                    </Button>
                  </>
                )}

                {/* Payment cancelled — allow going back */}
                {mpPollingStatus === 'cancelled' && (
                  <Button $variant="secondary" onClick={() => setStep(5)}>
                    Voltar e tentar novamente
                  </Button>
                )}
              </PixContainer>
            </div>
          )}

          {step === 6 && !barbershop?.requirePaymentBeforeBooking && (
            <div className="slide-in">
              <StepHeader>
                <StepTitle>Forma de pagamento</StepTitle>
                <StepDescription>Escolha como deseja pagar pelo serviço</StepDescription>
              </StepHeader>

              <PaymentOptionsGrid>
                {/* Pay in Person */}
                <PaymentOptionCard
                  selected={paymentMethod === 'in_person'}
                  onClick={() => setPaymentMethod('in_person')}
                >
                  <PaymentOptionHeader>
                    <PaymentOptionName>💵 Pagar na Barbearia</PaymentOptionName>
                    <PaymentOptionBadge type="popular">Mais Usado</PaymentOptionBadge>
                  </PaymentOptionHeader>
                  <PaymentOptionDescription>
                    Pague diretamente na barbearia após o serviço
                  </PaymentOptionDescription>
                  <PaymentOptionFeatures>
                    <PaymentOptionFeature>Dinheiro ou cartão</PaymentOptionFeature>
                    <PaymentOptionFeature>Sem antecipação necessária</PaymentOptionFeature>
                    <PaymentOptionFeature>Flexibilidade total</PaymentOptionFeature>
                  </PaymentOptionFeatures>
                </PaymentOptionCard>

                {/* PIX */}
                <PaymentOptionCard
                  selected={paymentMethod === 'pix'}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <PaymentOptionHeader>
                    <PaymentOptionName>💚 PIX</PaymentOptionName>
                    <PaymentOptionBadge type="discount">{FEATURES.pixDiscountPercentage}% OFF</PaymentOptionBadge>
                  </PaymentOptionHeader>
                  <PaymentOptionDescription>
                    Pagamento instantâneo com desconto exclusivo!
                  </PaymentOptionDescription>
                  <PaymentOptionFeatures>
                    <PaymentOptionFeature>Desconto de {FEATURES.pixDiscountPercentage}%</PaymentOptionFeature>
                    <PaymentOptionFeature>Confirmação instantânea</PaymentOptionFeature>
                    <PaymentOptionFeature>QR Code fácil de pagar</PaymentOptionFeature>
                    <PaymentOptionFeature>Todos os bancos aceitam</PaymentOptionFeature>
                  </PaymentOptionFeatures>
                  {paymentMethod === 'pix' && (
                    <SuccessStatusCard style={{ marginTop: '0.75rem', padding: '0.75rem' }}>
                      <Text $size="sm" $color="success" $weight="bold">
                        💰 Você economiza {formatBRL(totalPrice - discountedPrice)}!
                      </Text>
                    </SuccessStatusCard>
                  )}
                </PaymentOptionCard>

                {/* Bitcoin - DESABILITADO (Feature Flag) */}
                {FEATURES.enableCryptoPayments && (
                  <PaymentOptionCard
                    selected={paymentMethod === 'bitcoin'}
                    onClick={() => setPaymentMethod('bitcoin')}
                  >
                    <PaymentOptionHeader>
                      <PaymentOptionName>₿ Bitcoin</PaymentOptionName>
                      <PaymentOptionBadge type="new">Novo</PaymentOptionBadge>
                    </PaymentOptionHeader>
                    <PaymentOptionDescription>
                      Pagamento em criptomoeda
                    </PaymentOptionDescription>
                    <PaymentOptionFeatures>
                      <PaymentOptionFeature>Taxas ultra baixas</PaymentOptionFeature>
                      <PaymentOptionFeature>Transação global</PaymentOptionFeature>
                      <PaymentOptionFeature>Confirmação em minutos</PaymentOptionFeature>
                    </PaymentOptionFeatures>
                    <PaymentPlanBadge>Planos Pro e Enterprise</PaymentPlanBadge>
                  </PaymentOptionCard>
                )}

                {/* USDT - DESABILITADO (Feature Flag) */}
                {FEATURES.enableCryptoPayments && (
                  <PaymentOptionCard
                    selected={paymentMethod === 'usdt'}
                    onClick={() => setPaymentMethod('usdt')}
                  >
                    <PaymentOptionHeader>
                      <PaymentOptionName>₮ USDT (Tether)</PaymentOptionName>
                      <PaymentOptionBadge type="new">Novo</PaymentOptionBadge>
                    </PaymentOptionHeader>
                    <PaymentOptionDescription>
                      Stablecoin estável em dólar
                    </PaymentOptionDescription>
                    <PaymentOptionFeatures>
                      <PaymentOptionFeature>Sem volatilidade</PaymentOptionFeature>
                      <PaymentOptionFeature>Taxas mínimas</PaymentOptionFeature>
                      <PaymentOptionFeature>Estável em USD</PaymentOptionFeature>
                    </PaymentOptionFeatures>
                    <PaymentPlanBadge>Planos Pro e Enterprise</PaymentPlanBadge>
                  </PaymentOptionCard>
                )}
              </PaymentOptionsGrid>

              <StepNavigation>
                <Button $variant="secondary" onClick={() => setStep(5)}>
                  Voltar
                </Button>
                <Button
                  $variant="primary"
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  $loading={submitting}
                >
                  {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                </Button>
              </StepNavigation>
            </div>
          )}

          {/* Step 7: Success */}
          {step === 7 && (
            <SuccessContainer className="fade-in">
              <SuccessIcon>✓</SuccessIcon>
              <SuccessTitle>Agendamento Confirmado!</SuccessTitle>
              <SuccessMessage>
                <Text $size="lg" $color="secondary">
                  Pronto, <strong>{clientName}</strong>!<br />
                  Seu horário foi agendado com sucesso.
                </Text>
              </SuccessMessage>

              <SuccessDetails>
                <Text $color="primary" $weight="semibold" style={{ marginBottom: '0.5rem' }}>
                  Detalhes do Agendamento:
                </Text>
                <Text $color="secondary">
                  📅 {formatDateBR(selectedDate)} às {selectedTime}
                </Text>
                <Text $color="secondary">
                  👨‍💼 {professionalForConfirmation.name}
                </Text>
                <Text $color="secondary">
                  💰 Total: {formatBRL(barbershop?.requirePaymentBeforeBooking ? totalPrice : discountedPrice)}
                  {!barbershop?.requirePaymentBeforeBooking && paymentMethod === 'pix' && ' (com 5% de desconto)'}
                </Text>
                <Text $color="secondary">
                  💳 Pagamento: {
                    barbershop?.requirePaymentBeforeBooking ? 'PIX (pago ✓)' :
                    paymentMethod === 'in_person' ? 'Na barbearia' :
                    paymentMethod === 'pix' ? 'PIX' :
                    paymentMethod === 'bitcoin' ? 'Bitcoin' :
                    'USDT'
                  }
                </Text>
                <Text $size="sm" $color="tertiary" style={{ marginTop: '1rem' }}>
                  📱 Você receberá um lembrete no seu WhatsApp 24h antes
                </Text>

                {paymentMethod === 'pix' && pixBookingPayment && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Text $color="primary" $weight="semibold" style={{ marginBottom: '0.75rem' }}>
                      Pague com PIX agora
                    </Text>
                    {pixBookingPayment.qrCode ? (
                      <img
                        src={
                          pixBookingPayment.qrCode.startsWith('data:') ||
                          pixBookingPayment.qrCode.startsWith('http')
                            ? pixBookingPayment.qrCode
                            : `data:image/png;base64,${pixBookingPayment.qrCode}`
                        }
                        alt="QR Code PIX"
                        style={{ maxWidth: 260, width: '100%', borderRadius: 8, margin: '0 auto 1rem' }}
                      />
                    ) : null}
                    {pixBookingPayment.paymentUrl ? (
                      <Text $size="sm" $color="secondary" style={{ marginBottom: '0.75rem' }}>
                        <a href={pixBookingPayment.paymentUrl} target="_blank" rel="noopener noreferrer">
                          Abrir link de pagamento
                        </a>
                      </Text>
                    ) : null}
                    {pixBookingPayment.pixCode ? (
                      <>
                        <Text $size="sm" $color="tertiary" style={{ marginBottom: '0.35rem' }}>
                          Copia e cola (PIX)
                        </Text>
                        <textarea
                          readOnly
                          value={pixBookingPayment.pixCode}
                          rows={4}
                          style={{
                            width: '100%',
                            maxWidth: 420,
                            margin: '0 auto 0.75rem',
                            fontSize: '0.75rem',
                            padding: '0.5rem',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Button
                          $variant="secondary"
                          type="button"
                          onClick={() => {
                            void navigator.clipboard.writeText(pixBookingPayment.pixCode!);
                            toast.success('Código PIX copiado.');
                          }}
                        >
                          Copiar código PIX
                        </Button>
                      </>
                    ) : null}
                  </div>
                )}
              </SuccessDetails>
            </SuccessContainer>
          )}
        </BookingContent>
      </BookingCard>
    </BookingContainer>
  );
};

export default BookingPage;
