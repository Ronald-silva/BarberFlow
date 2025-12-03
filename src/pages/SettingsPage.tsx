import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  PageContainer,
  Heading,
  Text,
  Card,
  CardContent,
  Grid,
} from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Input, Label, FormGroup } from "../components/ui/Input";
import { SettingsIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { supabaseApi } from "../services/supabaseApi";

// Styled Components
const SettingsContainer = styled.div`
  max-width: 800px;
`;

const SettingsSection = styled(Card)`
  margin-bottom: ${(props) => props.theme.spacing[6]};
`;

const SectionHeader = styled.div`
  padding: ${(props) => props.theme.spacing[5]}
    ${(props) => props.theme.spacing[6]} ${(props) => props.theme.spacing[4]};
  border-bottom: 1px solid ${(props) => props.theme.colors.border.primary};
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.colors.background.elevated} 0%,
    ${(props) => props.theme.colors.background.tertiary} 100%
  );
`;

const SectionTitle = styled.h2`
  font-size: ${(props) => props.theme.typography.fontSizes.lg};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text.primary};
  margin: 0 0 ${(props) => props.theme.spacing[1]} 0;
`;

const SectionDescription = styled.p`
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  color: ${(props) => props.theme.colors.text.tertiary};
  margin: 0;
`;

const SectionContent = styled.div`
  padding: ${(props) => props.theme.spacing[6]};
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing[4]};
`;

const FileInputContainer = styled.div`
  position: relative;
`;

const FileInput = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing[3]}
    ${(props) => props.theme.spacing[4]};
  background-color: ${(props) => props.theme.colors.background.secondary};
  border: 1px solid ${(props) => props.theme.colors.border.primary};
  border-radius: ${(props) => props.theme.radii.lg};
  color: ${(props) => props.theme.colors.text.primary};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  transition: ${(props) => props.theme.transitions.base};

  &:focus {
    border-color: ${(props) => props.theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.interactive.focus};
    background-color: ${(props) => props.theme.colors.background.tertiary};
  }

  &::file-selector-button {
    background: linear-gradient(
      135deg,
      ${(props) => props.theme.colors.primary} 0%,
      ${(props) => props.theme.colors.primaryDark} 100%
    );
    color: ${(props) => props.theme.colors.text.inverse};
    border: none;
    border-radius: ${(props) => props.theme.radii.md};
    padding: ${(props) => props.theme.spacing[2]}
      ${(props) => props.theme.spacing[3]};
    font-size: ${(props) => props.theme.typography.fontSizes.xs};
    font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
    margin-right: ${(props) => props.theme.spacing[3]};
    cursor: pointer;
    transition: ${(props) => props.theme.transitions.base};

    &:hover {
      background: linear-gradient(
        135deg,
        ${(props) => props.theme.colors.primaryHover} 0%,
        ${(props) => props.theme.colors.primaryDark} 100%
      );
    }
  }
`;

const WorkingHoursGrid = styled.div`
  display: grid;
  gap: ${(props) => props.theme.spacing[3]};
`;

const DayRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 1fr auto;
  gap: ${(props) => props.theme.spacing[3]};
  align-items: center;
  padding: ${(props) => props.theme.spacing[3]};
  background-color: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.border.primary};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${(props) => props.theme.spacing[2]};
  }
`;

const DayLabel = styled.div`
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  color: ${(props) => props.theme.colors.text.secondary};
`;

const TimeInput = styled(Input)`
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleSlider = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${(props) => props.theme.colors.primary};
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSliderSpan = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) => props.theme.colors.border.secondary};
  transition: ${(props) => props.theme.transitions.base};
  border-radius: ${(props) => props.theme.radii.full};

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: ${(props) => props.theme.transitions.base};
    border-radius: 50%;
  }
`;

const SaveButton = styled(Button)`
  align-self: flex-start;
  min-width: 200px;
`;

const SuccessMessage = styled.div<{ show: boolean }>`
  padding: ${(props) => props.theme.spacing[3]}
    ${(props) => props.theme.spacing[4]};
  background-color: ${(props) => props.theme.colors.successLight};
  color: ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.success}40;
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  margin-top: ${(props) => props.theme.spacing[4]};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transform: translateY(${(props) => (props.show ? "0" : "-10px")});
  transition: ${(props) => props.theme.transitions.base};
`;

const ErrorMessage = styled.div<{ show: boolean }>`
  padding: ${(props) => props.theme.spacing[3]}
    ${(props) => props.theme.spacing[4]};
  background-color: ${(props) => props.theme.colors.errorLight};
  color: ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.error}40;
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  margin-top: ${(props) => props.theme.spacing[4]};
  opacity: ${(props) => (props.show ? 1 : 0)};
  transform: translateY(${(props) => (props.show ? "0" : "-10px")});
  transition: ${(props) => props.theme.transitions.base};
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

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [barbershopData, setBarbershopData] = useState({
    name: "Navalha Dourada",
    address: "Rua das Tesouras, 123",
    phone: "(11) 99999-9999",
    email: "contato@navalhadorada.com",
    slug: "",
    logoUrl: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [workingHours, setWorkingHours] = useState([
    { day: "Segunda-feira", start: "09:00", end: "18:00", enabled: true },
    { day: "Terça-feira", start: "09:00", end: "18:00", enabled: true },
    { day: "Quarta-feira", start: "09:00", end: "18:00", enabled: true },
    { day: "Quinta-feira", start: "09:00", end: "18:00", enabled: true },
    { day: "Sexta-feira", start: "09:00", end: "20:00", enabled: true },
    { day: "Sábado", start: "08:00", end: "16:00", enabled: true },
    { day: "Domingo", start: "09:00", end: "15:00", enabled: false },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBarbershopData = async () => {
      if (user) {
        setLoading(true);
        try {
          const barbershop = await supabaseApi.getBarbershopById(user.barbershopId);
          if (barbershop) {
            setBarbershopData({
              name: barbershop.name,
              address: barbershop.address || "",
              phone: "",
              email: "",
              slug: barbershop.slug || barbershop.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              logoUrl: barbershop.logoUrl || "",
            });
            setLogoPreview(barbershop.logoUrl || "");
          }
        } catch (error) {
          console.error("Erro ao carregar dados da barbearia:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBarbershopData();
  }, [user]);

  const handleBarbershopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError("");
    try {
      await supabaseApi.updateBarbershop(user.barbershopId, barbershopData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar dados da barbearia:", error);
      setError("Erro ao salvar dados da barbearia. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWorkingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // Por enquanto apenas simula o salvamento
      console.log("Salvando horários de funcionamento:", workingHours);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      setError("Erro ao salvar horários. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateWorkingHour = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }

      setLogoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !user) return;

    setUploadingLogo(true);
    try {
      const logoUrl = await supabaseApi.uploadBarbershopLogo(user.barbershopId, logoFile);
      if (logoUrl) {
        setBarbershopData(prev => ({ ...prev, logoUrl }));
        setLogoFile(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError('Erro ao fazer upload da logo. Tente novamente.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Erro ao fazer upload da logo. Tente novamente.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!barbershopData.logoUrl || !user) return;

    setUploadingLogo(true);
    try {
      const success = await supabaseApi.removeBarbershopLogo(user.barbershopId, barbershopData.logoUrl);
      if (success) {
        setBarbershopData(prev => ({ ...prev, logoUrl: '' }));
        setLogoPreview('');
        setLogoFile(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError('Erro ao remover logo. Tente novamente.');
      }
    } catch (error) {
      console.error('Remove error:', error);
      setError('Erro ao remover logo. Tente novamente.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <Text $color="tertiary">Carregando configurações...</Text>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <Heading $level={1} $gradient>
          Configurações
        </Heading>
        <Text $color="secondary" style={{ marginTop: "0.5rem" }}>
          Gerencie as configurações da sua barbearia
        </Text>
      </div>

      <SettingsContainer>
        {/* Informações da Barbearia */}
        <SettingsSection $variant="elevated" className="slide-in">
          <SectionHeader>
            <SectionTitle>Informações da Barbearia</SectionTitle>
            <SectionDescription>
              Configure os dados básicos da sua barbearia
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <SettingsForm onSubmit={handleBarbershopSubmit}>
              <Grid $columns={2} $responsive>
                <FormGroup>
                  <Label htmlFor="barbershopName" required>
                    Nome da Barbearia
                  </Label>
                  <Input
                    id="barbershopName"
                    type="text"
                    value={barbershopData.name}
                    onChange={(e) =>
                      setBarbershopData({
                        ...barbershopData,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="barbershopPhone">Telefone</Label>
                  <Input
                    id="barbershopPhone"
                    type="tel"
                    value={barbershopData.phone}
                    onChange={(e) =>
                      setBarbershopData({
                        ...barbershopData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </FormGroup>
              </Grid>

              <FormGroup>
                <Label htmlFor="barbershopAddress">Endereço</Label>
                <Input
                  id="barbershopAddress"
                  type="text"
                  value={barbershopData.address}
                  onChange={(e) =>
                    setBarbershopData({
                      ...barbershopData,
                      address: e.target.value,
                    })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="barbershopEmail">Email</Label>
                <Input
                  id="barbershopEmail"
                  type="email"
                  value={barbershopData.email}
                  onChange={(e) =>
                    setBarbershopData({
                      ...barbershopData,
                      email: e.target.value,
                    })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="barbershopLogo">Logo da Barbearia</Label>
                
                {/* Preview da logo atual ou nova */}
                {logoPreview && (
                  <div style={{ 
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                  }}>
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid var(--color-border-primary)"
                      }}
                    />
                    <div>
                      <Text $size="sm" $color="secondary">
                        {logoFile ? 'Nova logo selecionada' : 'Logo atual'}
                      </Text>
                      {barbershopData.logoUrl && !logoFile && (
                        <Button
                          type="button"
                          $variant="outline"
                          $size="sm"
                          onClick={handleLogoRemove}
                          disabled={uploadingLogo}
                          style={{ marginTop: "0.5rem" }}
                        >
                          {uploadingLogo ? "Removendo..." : "🗑️ Remover"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <FileInputContainer>
                  <FileInput 
                    id="barbershopLogo" 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </FileInputContainer>

                {logoFile && (
                  <div style={{ 
                    marginTop: "1rem",
                    display: "flex",
                    gap: "0.75rem"
                  }}>
                    <Button
                      type="button"
                      $variant="primary"
                      $size="sm"
                      onClick={handleLogoUpload}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? "Enviando..." : "📤 Enviar Logo"}
                    </Button>
                    <Button
                      type="button"
                      $variant="outline"
                      $size="sm"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(barbershopData.logoUrl);
                        const input = document.getElementById('barbershopLogo') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                    >
                      ❌ Cancelar
                    </Button>
                  </div>
                )}

                <Text $size="xs" $color="tertiary" style={{ marginTop: "0.5rem" }}>
                  Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB.
                </Text>
              </FormGroup>

              <SaveButton
                type="submit"
                $variant="primary"
                $loading={submitting}
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Salvar Informações"}
              </SaveButton>

              <SuccessMessage show={showSuccess}>
                ✓ Configurações salvas com sucesso!
              </SuccessMessage>

              <ErrorMessage show={!!error}>✗ {error}</ErrorMessage>
            </SettingsForm>
          </SectionContent>
        </SettingsSection>

        {/* Link de Agendamento */}
        <SettingsSection
          $variant="elevated"
          className="slide-in"
          style={{ animationDelay: "0.05s" }}
        >
          <SectionHeader>
            <SectionTitle>Link de Agendamento</SectionTitle>
            <SectionDescription>
              Compartilhe este link para que seus clientes façam agendamentos online
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <div style={{ padding: "1.5rem" }}>
              <FormGroup>
                <Label>Seu Link de Agendamento</Label>
                <div style={{ 
                  display: "flex", 
                  gap: "0.75rem", 
                  alignItems: "center",
                  marginTop: "0.5rem"
                }}>
                  <Input
                    type="text"
                    value={`${window.location.origin}/#/book/${barbershopData.slug}`}
                    readOnly
                    style={{ 
                      flex: 1,
                      backgroundColor: "var(--color-background-secondary)",
                      color: "var(--color-text-primary)",
                      cursor: "text",
                      border: "1px solid var(--color-border-primary)"
                    }}
                  />
                  <Button
                    type="button"
                    $variant="secondary"
                    onClick={() => {
                      const link = `${window.location.origin}/#/book/${barbershopData.slug}`;
                      navigator.clipboard.writeText(link);
                      alert('Link copiado para a área de transferência!');
                    }}
                    style={{ minWidth: "100px" }}
                  >
                    📋 Copiar
                  </Button>
                </div>
              </FormGroup>
              
              <div style={{ 
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "#e8f5e8",
                borderRadius: "8px",
                border: "1px solid #4ade80"
              }}>
                <Text style={{ 
                  fontSize: "0.875rem",
                  color: "#166534",
                  fontWeight: "500",
                  marginBottom: "0.5rem"
                }}>
                  💡 Como usar seu link:
                </Text>
                <ul style={{ 
                  margin: 0,
                  paddingLeft: "1.25rem",
                  fontSize: "0.875rem",
                  color: "#166534"
                }}>
                  <li>Compartilhe nas suas redes sociais</li>
                  <li>Adicione no seu WhatsApp Business</li>
                  <li>Coloque no Google Meu Negócio</li>
                  <li>Use em cartões de visita digitais</li>
                </ul>
              </div>
            </div>
          </SectionContent>
        </SettingsSection>

        {/* Horários de Funcionamento */}
        <SettingsSection
          $variant="elevated"
          className="slide-in"
          style={{ animationDelay: "0.1s" }}
        >
          <SectionHeader>
            <SectionTitle>Horários de Funcionamento</SectionTitle>
            <SectionDescription>
              Configure os horários de funcionamento da barbearia
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <SettingsForm onSubmit={handleWorkingHoursSubmit}>
              <WorkingHoursGrid>
                {workingHours.map((schedule, index) => (
                  <DayRow key={schedule.day}>
                    <DayLabel>{schedule.day}</DayLabel>
                    <TimeInput
                      type="time"
                      value={schedule.start}
                      onChange={(e) =>
                        updateWorkingHour(index, "start", e.target.value)
                      }
                      disabled={!schedule.enabled}
                      $size="sm"
                    />
                    <TimeInput
                      type="time"
                      value={schedule.end}
                      onChange={(e) =>
                        updateWorkingHour(index, "end", e.target.value)
                      }
                      disabled={!schedule.enabled}
                      $size="sm"
                    />
                    <ToggleSwitch>
                      <ToggleSlider
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={(e) =>
                          updateWorkingHour(index, "enabled", e.target.checked)
                        }
                      />
                      <ToggleSliderSpan />
                    </ToggleSwitch>
                  </DayRow>
                ))}
              </WorkingHoursGrid>

              <SaveButton
                type="submit"
                $variant="primary"
                $loading={submitting}
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Salvar Horários"}
              </SaveButton>
            </SettingsForm>
          </SectionContent>
        </SettingsSection>
      </SettingsContainer>
    </PageContainer>
  );
};

export default SettingsPage;
