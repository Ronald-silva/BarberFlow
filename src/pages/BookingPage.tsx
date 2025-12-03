import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Barbershop, Service, User } from '../types';
import { supabaseApi } from '../services/supabaseApi';
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
  TimeSlotContainer,
  TimeSlotHeader,
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
  SuccessContainer,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  SuccessDetails,
  LoadingContainer,
  LoadingSpinner,
} from '../components/booking/BookingComponents';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('in_person');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (barbershopSlug) {
        setLoading(true);
        try {
          const bs = await supabaseApi.getBarbershopBySlug(barbershopSlug);
          if (bs) {
            setBarbershop(bs);
            const [srv, prof] = await Promise.all([
              supabaseApi.getServicesByBarbershop(bs.id),
              supabaseApi.getProfessionalsByBarbershop(bs.id)
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
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      const professionalToBook = selectedProfessional === 'any' ? professionals[0].id : selectedProfessional;

      await supabaseApi.createAppointment({
        client: { name: clientName, whatsapp: clientWhatsapp },
        barbershopId: barbershop.id,
        professionalId: professionalToBook,
        serviceIds: selectedServices,
        startDateTime: bookingDateTime.toISOString(),
        paymentRequired: paymentMethod !== 'in_person',
        paymentStatus: paymentMethod === 'in_person' ? 'pending' : 'pending',
        paymentMethod
      });

      setStep(7); // Success step
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = ['09:00', '09:45', '10:30', '11:15', '14:00', '14:45', '15:30', '16:15', '17:00', '18:00', '19:00'];

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
      <BookingCard className="fade-in">
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
                      <ServicePrice>R$ {service.price.toFixed(2)}</ServicePrice>
                    </ServiceInfo>
                    <ServiceDuration>{service.duration} minutos</ServiceDuration>
                  </ServiceCard>
                ))}
              </ServiceGrid>

              {selectedServices.length > 0 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <Text $color="primary" $weight="semibold">
                    Total: R$ {totalPrice.toFixed(2)} • {totalDuration} min
                  </Text>
                </div>
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
                </CalendarContainer>

                <TimeSlotContainer>
                  <TimeSlotHeader>
                    {format(selectedDate, "eeee, dd 'de' MMMM", { locale: ptBR })}
                  </TimeSlotHeader>
                  <TimeSlotGrid>
                    {timeSlots.map(time => {
                      const [hours, minutes] = time.split(':').map(Number);
                      const timeSlot = new Date(selectedDate);
                      timeSlot.setHours(hours, minutes, 0, 0);
                      const isPast = isBefore(timeSlot, new Date());
                      const isBooked = Math.random() > 0.7;
                      const isDisabled = isPast || isBooked;

                      return (
                        <TimeSlotButton
                          key={time}
                          $variant={selectedTime === time ? "primary" : "ghost"}
                          $size="sm"
                          onClick={() => setSelectedTime(time)}
                          disabled={isDisabled}
                          selected={selectedTime === time}
                        >
                          {time}
                        </TimeSlotButton>
                      );
                    })}
                  </TimeSlotGrid>
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
                  <Label htmlFor="name" required>Nome Completo</Label>
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
                  <Label htmlFor="whatsapp" required>WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={clientWhatsapp}
                    onChange={(e) => setClientWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
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
                    <EditButton onClick={() => setStep(1)} style={{ float: 'right' }}>Editar</EditButton>
                  </ReviewSectionTitle>
                  {selectedServices.map(sId => {
                    const service = services.find(s => s.id === sId);
                    return service ? (
                      <ReviewItem key={service.id}>
                        <ReviewLabel>{service.name}</ReviewLabel>
                        <ReviewValue>R$ {service.price.toFixed(2)}</ReviewValue>
                      </ReviewItem>
                    ) : null;
                  })}
                </ReviewSection>

                <ReviewSection>
                  <ReviewSectionTitle>
                    Profissional
                    <EditButton onClick={() => setStep(2)} style={{ float: 'right' }}>Editar</EditButton>
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
                    <EditButton onClick={() => setStep(3)} style={{ float: 'right' }}>Editar</EditButton>
                  </ReviewSectionTitle>
                  <ReviewItem>
                    <ReviewLabel>Data</ReviewLabel>
                    <ReviewValue>{format(selectedDate, "dd/MM/yyyy")}</ReviewValue>
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
                    <EditButton onClick={() => setStep(4)} style={{ float: 'right' }}>Editar</EditButton>
                  </ReviewSectionTitle>
                  <ReviewItem>
                    <ReviewLabel>Nome</ReviewLabel>
                    <ReviewValue>{clientName}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>WhatsApp</ReviewLabel>
                    <ReviewValue>{clientWhatsapp}</ReviewValue>
                  </ReviewItem>
                </ReviewSection>

                <ReviewTotalSection>
                  <ReviewTotal>
                    <ReviewTotalLabel>Total</ReviewTotalLabel>
                    <ReviewTotalValue>R$ {totalPrice.toFixed(2)}</ReviewTotalValue>
                  </ReviewTotal>
                </ReviewTotalSection>
              </ReviewContainer>

              <StepNavigation>
                <Button $variant="secondary" onClick={() => setStep(4)}>
                  Voltar
                </Button>
                <Button $variant="primary" onClick={() => setStep(6)}>
                  Escolher Pagamento
                </Button>
              </StepNavigation>
            </div>
          )}

          {/* Step 6: Payment Selection */}
          {step === 6 && (
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
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.5rem' }}>
                      <Text $size="sm" $color="success" $weight="bold">
                        💰 Você economiza R$ {(totalPrice - discountedPrice).toFixed(2)}!
                      </Text>
                    </div>
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
                  📅 {format(selectedDate, "dd/MM/yyyy")} às {selectedTime}
                </Text>
                <Text $color="secondary">
                  👨‍💼 {professionalForConfirmation.name}
                </Text>
                <Text $color="secondary">
                  💰 Total: R$ {discountedPrice.toFixed(2)}
                  {paymentMethod === 'pix' && ' (com 5% de desconto)'}
                </Text>
                <Text $color="secondary">
                  💳 Pagamento: {
                    paymentMethod === 'in_person' ? 'Na barbearia' :
                    paymentMethod === 'pix' ? 'PIX' :
                    paymentMethod === 'bitcoin' ? 'Bitcoin' :
                    'USDT'
                  }
                </Text>
                <Text $size="sm" $color="tertiary" style={{ marginTop: '1rem' }}>
                  📱 Você receberá um lembrete no seu WhatsApp 24h antes
                </Text>
              </SuccessDetails>
            </SuccessContainer>
          )}
        </BookingContent>
      </BookingCard>
    </BookingContainer>
  );
};

export default BookingPage;
