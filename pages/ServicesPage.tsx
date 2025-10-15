import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/supabaseApi";
import { Service } from "../types";
import {
  PageContainer,
  Heading,
  Text,
  Grid,
  Card,
  CardContent,
} from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Input, Label, FormGroup } from "../components/ui/Input";
import { ScissorsIcon } from "../components/icons";

// Styled Components
const ServicesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing[6]};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${(props) => props.theme.spacing[4]};
    align-items: stretch;
  }
`;

const ServiceCard = styled(Card)`
  transition: ${(props) => props.theme.transitions.base};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${(props) => props.theme.shadows.xl};
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${(props) => props.theme.spacing[3]};
`;

const ServiceName = styled.h3`
  font-size: ${(props) => props.theme.typography.fontSizes.lg};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text.primary};
  margin: 0;
`;

const ServicePrice = styled.div`
  font-size: ${(props) => props.theme.typography.fontSizes.xl};
  font-weight: ${(props) => props.theme.typography.fontWeights.bold};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.primary} 0%,
    ${(props) => props.theme.colors.primaryLight} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ServiceDuration = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing[2]};
  color: ${(props) => props.theme.colors.text.tertiary};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  margin-bottom: ${(props) => props.theme.spacing[4]};
`;

const ServiceActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing[2]};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: ${(props) => props.theme.zIndex.modal};
  padding: ${(props) => props.theme.spacing[4]};
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.colors.background.elevated};
  border-radius: ${(props) => props.theme.radii.xl};
  padding: ${(props) => props.theme.spacing[6]};
  width: 100%;
  max-width: 500px;
  border: 1px solid ${(props) => props.theme.colors.border.primary};
  box-shadow: ${(props) => props.theme.shadows["2xl"]};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing[6]};
`;

const ModalTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSizes.xl};
  font-weight: ${(props) => props.theme.typography.fontWeights.bold};
  color: ${(props) => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text.tertiary};
  font-size: ${(props) => props.theme.typography.fontSizes.xl};
  cursor: pointer;
  padding: ${(props) => props.theme.spacing[1]};
  border-radius: ${(props) => props.theme.radii.md};

  &:hover {
    background-color: ${(props) => props.theme.colors.interactive.hover};
    color: ${(props) => props.theme.colors.text.primary};
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing[4]};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing[3]};
  justify-content: flex-end;
  margin-top: ${(props) => props.theme.spacing[6]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing[8]};
  color: ${(props) => props.theme.colors.text.tertiary};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing[4]};
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${(props) => props.theme.colors.border.primary};
  border-top: 3px solid ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SuccessMessage = styled.div<{ $show: boolean }>`
  padding: ${(props) => props.theme.spacing[3]} ${(props) => props.theme.spacing[4]};
  background-color: ${(props) => props.theme.colors.successLight};
  color: ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.success}40;
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  margin-bottom: ${(props) => props.theme.spacing[4]};
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: translateY(${(props) => (props.$show ? "0" : "-10px")});
  transition: ${(props) => props.theme.transitions.base};
  display: ${(props) => (props.$show ? "block" : "none")};
`;

const ErrorMessage = styled.div<{ $show: boolean }>`
  padding: ${(props) => props.theme.spacing[3]} ${(props) => props.theme.spacing[4]};
  background-color: ${(props) => props.theme.colors.errorLight};
  color: ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.error}40;
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  margin-bottom: ${(props) => props.theme.spacing[4]};
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: translateY(${(props) => (props.$show ? "0" : "-10px")});
  transition: ${(props) => props.theme.transitions.base};
  display: ${(props) => (props.$show ? "block" : "none")};
`;

const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      if (user) {
        setLoading(true);
        try {
          const result = await api.getServicesByBarbershop(user.barbershopId);
          setServices(result);
        } catch (error) {
          console.error("Erro ao carregar serviços:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchServices();
  }, [user]);

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
      });
    } else {
      setEditingService(null);
      setFormData({ name: "", price: "", duration: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: "", price: "", duration: "" });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');
    try {
      const serviceData = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };

      if (editingService) {
        const updatedService = await api.updateService(editingService.id, serviceData);
        setServices(prev => prev.map(s => s.id === editingService.id ? updatedService : s));
        setSuccessMessage('Serviço atualizado com sucesso!');
      } else {
        const newService = await api.createService({
          ...serviceData,
          barbershopId: user.barbershopId
        });
        setServices(prev => [...prev, newService]);
        setSuccessMessage('Serviço criado com sucesso!');
      }
      handleCloseModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setError('Erro ao salvar serviço. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await api.deleteService(serviceId);
        setServices(prev => prev.filter(s => s.id !== serviceId));
        setSuccessMessage('Serviço excluído com sucesso!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        setError('Erro ao excluir serviço. Tente novamente.');
      }
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <Text $color="tertiary">Carregando serviços...</Text>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in">
      <ServicesHeader>
        <div>
          <Heading $level={1} $gradient>
            Serviços
          </Heading>
          <Text $color="secondary" style={{ marginTop: "0.5rem" }}>
            Gerencie os serviços oferecidos pela barbearia
          </Text>
        </div>

        <Button $variant="primary" onClick={() => handleOpenModal()}>
          Adicionar Serviço
        </Button>
      </ServicesHeader>

      <SuccessMessage $show={!!successMessage}>
        ✓ {successMessage}
      </SuccessMessage>

      <ErrorMessage $show={!!error}>
        ✗ {error}
      </ErrorMessage>

      {services.length === 0 ? (
        <EmptyState>
          <ScissorsIcon size={48} />
          <Text $size="lg" $color="tertiary" style={{ marginTop: "1rem" }}>
            Nenhum serviço cadastrado
          </Text>
          <Text $size="sm" $color="disabled" style={{ marginTop: "0.5rem" }}>
            Adicione serviços para começar a receber agendamentos
          </Text>
        </EmptyState>
      ) : (
        <Grid $columns={3} className="slide-in">
          {services.map((service) => (
            <ServiceCard key={service.id} $variant="elevated">
              <CardContent>
                <ServiceHeader>
                  <ServiceName>{service.name}</ServiceName>
                  <ServicePrice>R$ {service.price.toFixed(2)}</ServicePrice>
                </ServiceHeader>

                <ServiceDuration>
                  <span>⏱️</span>
                  <span>{formatDuration(service.duration)}</span>
                </ServiceDuration>

                <ServiceActions>
                  <Button
                    $variant="secondary"
                    $size="sm"
                    onClick={() => handleOpenModal(service)}
                  >
                    Editar
                  </Button>
                  <Button
                    $variant="danger"
                    $size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
                    Excluir
                  </Button>
                </ServiceActions>
              </CardContent>
            </ServiceCard>
          ))}
        </Grid>
      )}

      {/* Modal */}
      <Modal $isOpen={isModalOpen}>
        <ModalContent className="fade-in">
          <ModalHeader>
            <ModalTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </ModalTitle>
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
          </ModalHeader>

          <ModalForm onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage $show={true}>
                ✗ {error}
              </ErrorMessage>
            )}

            <FormGroup>
              <Label htmlFor="serviceName" required>
                Nome do Serviço
              </Label>
              <Input
                id="serviceName"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Corte de Cabelo"
                required
                disabled={submitting}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="servicePrice" required>
                Preço (R$)
              </Label>
              <Input
                id="servicePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0,00"
                required
                disabled={submitting}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="serviceDuration" required>
                Duração (minutos)
              </Label>
              <Input
                id="serviceDuration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="30"
                required
                disabled={submitting}
              />
            </FormGroup>

            <ModalActions>
              <Button
                type="button"
                $variant="secondary"
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                $variant="primary"
                $loading={submitting}
                disabled={submitting}
              >
                {submitting 
                  ? (editingService ? "Salvando..." : "Criando...") 
                  : (editingService ? "Salvar Alterações" : "Criar Serviço")
                }
              </Button>
            </ModalActions>
          </ModalForm>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};

export default ServicesPage;
