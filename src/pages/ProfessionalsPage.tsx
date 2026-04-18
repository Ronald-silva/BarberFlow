import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { supabaseApi } from '../services/supabaseApi';
import { User, UserRole } from '../types';
import { DashboardShell, Heading, Text, Card, CardContent } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Input, Label, FormGroup } from '../components/ui/Input';
import { BackButton } from '../components/ui/BackButton';
import { TeamIcon } from '../components/icons';

// Styled Components
const ProfessionalsHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${(props) => props.theme.spacing[4]};
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing[6]};

  @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: ${(props) => props.theme.spacing[5]};
  }
`;

const ProfessionalsList = styled.div<{ $count: number }>`
  width: 100%;
  display: grid;
  gap: ${(p) => p.theme.spacing[5]};
  grid-template-columns: 1fr;

  @media (min-width: ${(p) => p.theme.breakpoints.lg}) {
    grid-template-columns: ${(p) =>
      p.$count >= 2 ? 'repeat(2, minmax(0, 1fr))' : '1fr'};
  }
`;

const ProfessionalCard = styled(Card)`
  transition: ${props => props.theme.transitions.base};
  min-width: 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--bs-brand-main, #c8922a), var(--bs-brand-light, #e8b84b));
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
`;

const ProfessionalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.radii.full};
  background: linear-gradient(
    135deg,
    var(--bs-brand-main, ${props => props.theme.colors.primary.main}) 0%,
    var(--bs-brand-light, ${props => props.theme.colors.primary.light}) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.inverse};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  font-size: ${props => props.theme.typography.fontSizes.lg};
`;

const ProfessionalInfo = styled.div`
  flex: 1;
`;

const ProfessionalName = styled.h3`
  font-size: ${props => props.theme.typography.fontSizes.lg};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.spacing[1]} 0;
`;

const ProfessionalEmail = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  margin: 0;
`;

const RoleBadge = styled.span<{ $role: UserRole }>`
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.typography.fontSizes.xs};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => props.$role === UserRole.ADMIN ? `
    background-color: color-mix(in srgb, var(--bs-brand-main, ${props.theme.colors.primary.main}) 14%, transparent);
    color: var(--bs-brand-light, ${props.theme.colors.primary.light});
    border: 1px solid color-mix(in srgb, var(--bs-brand-main, ${props.theme.colors.primary.main}) 35%, transparent);
  ` : `
    background-color: ${props.theme.colors.infoLight};
    color: ${props.theme.colors.info};
    border: 1px solid ${props.theme.colors.info}40;
  `}
`;

const WorkHours = styled.div`
  margin: ${props => props.theme.spacing[3]} 0;
  padding: ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const WorkHoursTitle = styled.h4`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.semibold};
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 ${props => props.theme.spacing[2]} 0;
`;

const WorkHoursList = styled.div`
  display: grid;
  gap: ${(props) => props.theme.spacing[2]};
  grid-template-columns: 1fr;

  @media (min-width: ${(props) => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: ${(props) => props.theme.spacing[6]};
  }
`;

const WorkHourItem = styled.div`
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  color: ${(props) => props.theme.colors.text.secondary};
  padding: ${(props) => props.theme.spacing[2]} 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};

  &:last-child {
    border-bottom: none;
  }
`;

const ProfessionalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal};
  padding: ${props => props.theme.spacing[4]};
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.radii.xl};
  padding: ${props => props.theme.spacing[6]};
  width: 100%;
  max-width: 600px;
  border: 1px solid ${props => props.theme.colors.border.primary};
  box-shadow: ${props => props.theme.shadows['2xl']};
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: ${props => props.theme.colors.background.tertiary};
  border: 1px solid ${props => props.theme.colors.border.primary};
  color: ${props => props.theme.colors.text.tertiary};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: ${props => props.theme.transitions.base};
  flex-shrink: 0;

  &:hover {
    background-color: ${props => props.theme.colors.interactive.hover};
    color: ${props => props.theme.colors.text.primary};
    border-color: ${props => props.theme.colors.border.secondary};
  }
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing[6]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing[8]};
  color: ${props => props.theme.colors.text.tertiary};
`;

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

const SuccessMessage = styled.div<{ $show: boolean }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.successLight};
  color: ${props => props.theme.colors.success};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.success}40;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-bottom: ${props => props.theme.spacing[4]};
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '-10px'});
  transition: ${props => props.theme.transitions.base};
  display: ${props => props.$show ? 'block' : 'none'};
`;

const ErrorMessage = styled.div<{ $show: boolean }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.errorLight};
  color: ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.error}40;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  margin-bottom: ${props => props.theme.spacing[4]};
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '-10px'});
  transition: ${props => props.theme.transitions.base};
  display: ${props => props.$show ? 'block' : 'none'};
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.radii.lg};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: ${props => props.theme.transitions.base};
  
  &:focus {
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.interactive.focus};
    background-color: ${props => props.theme.colors.background.tertiary};
  }
  
  &:hover:not(:focus) {
    border-color: ${props => props.theme.colors.border.secondary};
  }
`;

const ProfessionalsPage: React.FC = () => {
    const { user } = useAuth();
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfessional, setEditingProfessional] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: UserRole.MEMBER as UserRole
    });

    const weekDays = [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Segunda-feira' },
        { value: 2, label: 'Terça-feira' },
        { value: 3, label: 'Quarta-feira' },
        { value: 4, label: 'Quinta-feira' },
        { value: 5, label: 'Sexta-feira' },
        { value: 6, label: 'Sábado' }
    ];

    useEffect(() => {
        const fetchProfessionals = async () => {
            if (user) {
                setLoading(true);
                try {
                    const result = await supabaseApi.getProfessionalsByBarbershop(user.barbershopId!);
                    setProfessionals(result);
                } catch (error) {
                    console.error('Erro ao carregar profissionais:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfessionals();
    }, [user]);

    const handleOpenModal = (professional?: User) => {
        if (professional) {
            setEditingProfessional(professional);
            setFormData({
                name: professional.name,
                email: professional.email,
                role: professional.role
            });
        } else {
            setEditingProfessional(null);
            setFormData({ name: '', email: '', role: UserRole.MEMBER });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProfessional(null);
        setFormData({ name: '', email: '', role: UserRole.MEMBER });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError('');
        try {
            if (editingProfessional) {
                const updatedProfessional = await supabaseApi.updateProfessional(editingProfessional.id, formData);
                setProfessionals(prev => prev.map(p => p.id === editingProfessional.id ? updatedProfessional : p));
                setSuccessMessage('Profissional atualizado com sucesso!');
            } else {
                const newProfessional = await supabaseApi.createProfessional({
                    ...formData,
                    barbershopId: user.barbershopId!
                });
                setProfessionals(prev => [...prev, newProfessional]);
                setSuccessMessage('Profissional criado com sucesso!');
            }
            handleCloseModal();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao salvar profissional:', error);
            setError('Erro ao salvar profissional. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (professionalId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
            try {
                await supabaseApi.deleteProfessional(professionalId);
                setProfessionals(prev => prev.filter(p => p.id !== professionalId));
                setSuccessMessage('Profissional excluído com sucesso!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error('Erro ao excluir profissional:', error);
                setError('Erro ao excluir profissional. Tente novamente.');
            }
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatWorkHours = (workHours: any[]) => {
        if (!workHours || workHours.length === 0) {
            return ['Horários não configurados'];
        }

        try {
            return workHours.map(wh => {
                const day = weekDays.find(d => d.value === wh.day);
                return `${day?.label || 'Dia inválido'}: ${wh.start || '00:00'} - ${wh.end || '00:00'}`;
            });
        } catch (error) {
            console.error('Erro ao formatar horários:', error);
            return ['Erro ao carregar horários'];
        }
    };

    if (loading) {
        return (
            <DashboardShell>
                <LoadingContainer>
                    <LoadingSpinner />
                    <Text $color="tertiary">Carregando profissionais...</Text>
                </LoadingContainer>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell className="fade-in">
            <div style={{ marginBottom: '1rem' }}>
                <BackButton to="/dashboard/overview" label="Dashboard" />
            </div>
            <ProfessionalsHeader>
                <div>
                    <Heading $level={1} $gradient>
                        Profissionais
                    </Heading>
                    <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
                        Gerencie a equipe da barbearia
                    </Text>
                </div>
                
                <Button
                    $variant="primary"
                    onClick={() => handleOpenModal()}
                >
                    Adicionar Profissional
                </Button>
            </ProfessionalsHeader>

            <SuccessMessage $show={!!successMessage}>
                ✓ {successMessage}
            </SuccessMessage>

            <ErrorMessage $show={!!error}>
                ✗ {error}
            </ErrorMessage>

            {professionals.length === 0 ? (
                <EmptyState>
                    <TeamIcon size={48} />
                    <Text $size="lg" $color="tertiary" style={{ marginTop: '1rem' }}>
                        Nenhum profissional cadastrado
                    </Text>
                    <Text $size="sm" $color="disabled" style={{ marginTop: '0.5rem' }}>
                        Adicione profissionais para gerenciar a equipe
                    </Text>
                </EmptyState>
            ) : (
                <ProfessionalsList
                  $count={professionals.length}
                  className="slide-in"
                >
                    {professionals.map(professional => (
                        <ProfessionalCard key={professional.id} $variant="elevated">
                            <CardContent>
                                <ProfessionalHeader>
                                    <Avatar>
                                        {getInitials(professional.name)}
                                    </Avatar>
                                    <ProfessionalInfo>
                                        <ProfessionalName>{professional.name}</ProfessionalName>
                                        <ProfessionalEmail>{professional.email}</ProfessionalEmail>
                                    </ProfessionalInfo>
                                    <RoleBadge $role={professional.role}>
                                        {professional.role === UserRole.ADMIN ? 'Admin' : 'Profissional'}
                                    </RoleBadge>
                                </ProfessionalHeader>
                                
                                <WorkHours>
                                    <WorkHoursTitle>Horários de Trabalho</WorkHoursTitle>
                                    <WorkHoursList>
                                        {formatWorkHours(professional.workHours).map((schedule, index) => (
                                            <WorkHourItem key={index}>
                                                {schedule}
                                            </WorkHourItem>
                                        ))}
                                    </WorkHoursList>
                                </WorkHours>
                                
                                <ProfessionalActions>
                                    <Button
                                        $variant="secondary"
                                        $size="sm"
                                        onClick={() => handleOpenModal(professional)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        $variant="danger"
                                        $size="sm"
                                        onClick={() => handleDelete(professional.id)}
                                    >
                                        Excluir
                                    </Button>
                                </ProfessionalActions>
                            </CardContent>
                        </ProfessionalCard>
                    ))}
                </ProfessionalsList>
            )}

            {/* Modal */}
            <Modal $isOpen={isModalOpen}>
                <ModalContent className="fade-in">
                    <ModalHeader>
                        <ModalTitle>
                            {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
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
                            <Label htmlFor="professionalName" $required>Nome Completo</Label>
                            <Input
                                id="professionalName"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nome do profissional"
                                required
                                disabled={submitting}
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="professionalEmail" $required>Email</Label>
                            <Input
                                id="professionalEmail"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@exemplo.com"
                                required
                                disabled={submitting}
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Label htmlFor="professionalRole" $required>Função</Label>
                            <Select
                                id="professionalRole"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                required
                                disabled={submitting}
                            >
                                <option value={UserRole.MEMBER}>Profissional</option>
                                <option value={UserRole.ADMIN}>Administrador</option>
                            </Select>
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
                                    ? (editingProfessional ? 'Salvando...' : 'Criando...') 
                                    : (editingProfessional ? 'Salvar Alterações' : 'Criar Profissional')
                                }
                            </Button>
                        </ModalActions>
                    </ModalForm>
                </ModalContent>
            </Modal>
        </DashboardShell>
    );
};

export default ProfessionalsPage;