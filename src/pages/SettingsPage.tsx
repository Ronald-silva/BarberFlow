import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  DashboardShell,
  Heading,
  Text,
  Card,
  CardContent,
} from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Input, Label, FormGroup } from "../components/ui/Input";
import { SettingsIcon } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import { supabaseApi, formatPostgrestError } from "../services/supabaseApi";
import {
  DEFAULT_BRAND_MAIN_HEX,
  defaultBrandMainHex,
  normalizeBrandHex,
} from "../lib/barbershopBranding";

// Styled Components
const SettingsContainer = styled.div`
  width: 100%;
  max-width: 100%;
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
  padding: ${(props) => props.theme.spacing[5]};

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing[7]};
  }
`;

/** Ocupa as duas colunas do formulário em desktop. */
const FormRowFull = styled.div`
  grid-column: 1 / -1;
`;

const BarbershopForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${(props) => props.theme.spacing[4]}
    ${(props) => props.theme.spacing[5]};
  align-items: start;

  @media (min-width: ${(props) => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${(props) => props.theme.spacing[5]}
      ${(props) => props.theme.spacing[6]};
  }
`;

const WorkingHoursForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing[4]};
`;

const LinkFieldRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing[3]};
  align-items: stretch;
  margin-top: ${(props) => props.theme.spacing[2]};

  input {
    flex: 1 1 220px;
    min-width: 0;
  }
`;

const LinkTipBox = styled.div`
  margin-top: ${(props) => props.theme.spacing[5]};
  padding: ${(props) => props.theme.spacing[4]};
  border-radius: ${(props) => props.theme.radii.lg};
  border: 1px solid ${(props) => props.theme.colors.success.border};
  background: ${(props) => props.theme.colors.success.light};
`;

const LinkTipList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  color: ${(props) => props.theme.colors.text.secondary};
  line-height: 1.55;
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
      var(--bs-brand-main, ${(props) => props.theme.colors.primary.main}) 0%,
      var(--bs-brand-light, ${(props) => props.theme.colors.primary.light}) 100%
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
        var(--bs-brand-light, ${(props) => props.theme.colors.primary.light}) 0%,
        var(--bs-brand-main, ${(props) => props.theme.colors.primary.main}) 100%
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

const SuccessMessage = styled.div<{ $show: boolean }>`
  padding: ${(props) => props.theme.spacing[3]}
    ${(props) => props.theme.spacing[4]};
  background-color: ${(props) => props.theme.colors.successLight};
  color: ${(props) => props.theme.colors.success};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.success}40;
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  margin-top: ${(props) => props.theme.spacing[4]};
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: translateY(${(props) => (props.$show ? "0" : "-10px")});
  transition: ${(props) => props.theme.transitions.base};
`;

const ErrorMessage = styled.div<{ $show: boolean }>`
  padding: ${(props) => props.theme.spacing[3]}
    ${(props) => props.theme.spacing[4]};
  background-color: ${(props) => props.theme.colors.errorLight};
  color: ${(props) => props.theme.colors.error};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.error}40;
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  font-weight: ${(props) => props.theme.typography.fontWeights.medium};
  margin-top: ${(props) => props.theme.spacing[4]};
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transform: translateY(${(props) => (props.$show ? "0" : "-10px")});
  transition: ${(props) => props.theme.transitions.base};
`;

const NoteMessage = styled.div<{ $show: boolean }>`
  padding: ${(props) => props.theme.spacing[3]}
    ${(props) => props.theme.spacing[4]};
  margin-top: ${(props) => props.theme.spacing[3]};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid ${(props) => props.theme.colors.warning.border};
  background: ${(props) => props.theme.colors.warningLight};
  color: ${(props) => props.theme.colors.warning.main};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  line-height: 1.45;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  max-height: ${(props) => (props.$show ? "240px" : "0")};
  overflow: hidden;
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

function normalizeBarbershopSlug(slug: string, businessName: string): string {
  const fromField = slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (fromField) return fromField.slice(0, 50);
  const fromName = businessName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return (fromName || "barbearia").slice(0, 50);
}

const SettingsPage: React.FC = () => {
  const { user, reloadBarbershop } = useAuth();
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

  const [useCustomBrandColor, setUseCustomBrandColor] = useState(false);
  const [brandColorHex, setBrandColorHex] = useState(DEFAULT_BRAND_MAIN_HEX);

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
  const [showBrandMigrationNote, setShowBrandMigrationNote] = useState(false);
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
              phone: barbershop.phone || "",
              email: barbershop.email || "",
              slug:
                barbershop.slug ||
                barbershop.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, ""),
              logoUrl: barbershop.logoUrl || "",
            });
            setLogoPreview(barbershop.logoUrl || "");
            const saved = normalizeBrandHex(barbershop.brandPrimaryColor ?? undefined);
            if (saved) {
              setUseCustomBrandColor(true);
              setBrandColorHex(saved);
            } else if (user?.barbershopId) {
              setUseCustomBrandColor(false);
              setBrandColorHex(defaultBrandMainHex(user.barbershopId));
            } else {
              setUseCustomBrandColor(false);
              setBrandColorHex(DEFAULT_BRAND_MAIN_HEX);
            }
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
    setShowBrandMigrationNote(false);
    try {
      const normalizedCustom = useCustomBrandColor
        ? normalizeBrandHex(brandColorHex)
        : null;
      if (useCustomBrandColor && !normalizedCustom) {
        setError("Cor inválida. Use um formato como #C8922A ou escolha no seletor.");
        return;
      }
      const slug = normalizeBarbershopSlug(
        barbershopData.slug,
        barbershopData.name
      );
      if (!slug) {
        setError("Informe o nome da barbearia para gerar o link de agendamento.");
        return;
      }
      const { brandSaved } = await supabaseApi.updateBarbershop(user.barbershopId, {
        ...barbershopData,
        slug,
        brandPrimaryColor: useCustomBrandColor ? normalizedCustom : null,
      });
      await reloadBarbershop();
      setBarbershopData((prev) => ({ ...prev, slug }));
      setShowSuccess(true);
      setShowBrandMigrationNote(!brandSaved);
      setTimeout(() => {
        setShowSuccess(false);
        setShowBrandMigrationNote(false);
      }, brandSaved ? 3000 : 8000);
    } catch (error) {
      console.error("Erro ao salvar dados da barbearia:", error);
      setError(formatPostgrestError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const colorPickerValue =
    normalizeBrandHex(brandColorHex) ?? DEFAULT_BRAND_MAIN_HEX;

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
        await reloadBarbershop();
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
        await reloadBarbershop();
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
      <DashboardShell>
        <LoadingContainer>
          <LoadingSpinner />
          <Text $color="tertiary">Carregando configurações...</Text>
        </LoadingContainer>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell className="fade-in">
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
            <BarbershopForm onSubmit={handleBarbershopSubmit}>
              <FormGroup>
                <Label htmlFor="barbershopName" $required>
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

              <FormRowFull>
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
              </FormRowFull>

              <FormRowFull>
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
              </FormRowFull>

              <FormRowFull>
              <FormGroup>
                <Label htmlFor="brandColor">Cor de destaque do painel</Label>
                <Text
                  $size="sm"
                  $color="tertiary"
                  style={{ marginBottom: "0.75rem" }}
                >
                  Aplicada na barra lateral, menu ativo e visão geral. Com a opção
                  desligada, usamos uma cor automática estável para a sua conta.
                </Text>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    marginBottom: "0.75rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useCustomBrandColor}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setUseCustomBrandColor(on);
                      if (!on && user?.barbershopId) {
                        setBrandColorHex(defaultBrandMainHex(user.barbershopId));
                      }
                    }}
                  />
                  <Text $size="sm" $color="secondary">
                    Usar cor personalizada
                  </Text>
                </label>
                {useCustomBrandColor && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <input
                      id="brandColor"
                      type="color"
                      value={colorPickerValue}
                      onChange={(e) => setBrandColorHex(e.target.value)}
                      aria-label="Seletor de cor"
                      style={{
                        width: 48,
                        height: 40,
                        padding: 0,
                        border: "1px solid var(--color-border-primary, #2a2a2a)",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "transparent",
                      }}
                    />
                    <Input
                      type="text"
                      value={brandColorHex}
                      onChange={(e) => setBrandColorHex(e.target.value)}
                      placeholder="#C8922A"
                      style={{ maxWidth: 140 }}
                      aria-label="Código hexadecimal da cor"
                    />
                  </div>
                )}
              </FormGroup>
              </FormRowFull>

              <FormRowFull>
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
              </FormRowFull>

              <FormRowFull>
              <SaveButton
                type="submit"
                $variant="primary"
                $loading={submitting}
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Salvar Informações"}
              </SaveButton>

              <SuccessMessage $show={showSuccess}>
                ✓ Configurações salvas com sucesso!
              </SuccessMessage>

              <NoteMessage $show={showBrandMigrationNote}>
                Os dados foram salvos, mas a <strong>cor personalizada</strong> não pôde
                ser gravada: o banco ainda não tem a coluna{" "}
                <code style={{ wordBreak: "break-all" }}>brand_primary_color</code>.
                No Supabase, execute o SQL da migração{" "}
                <code>20260420_barbershops_brand_primary_color.sql</code> e salve de
                novo.
              </NoteMessage>

              <ErrorMessage $show={!!error}>✗ {error}</ErrorMessage>
              </FormRowFull>
            </BarbershopForm>
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
            <FormGroup>
              <Label>Seu link de agendamento</Label>
              <LinkFieldRow>
                <Input
                  type="text"
                  value={`${window.location.origin}/#/book/${barbershopData.slug}`}
                  readOnly
                />
                <Button
                  type="button"
                  $variant="secondary"
                  onClick={() => {
                    const link = `${window.location.origin}/#/book/${barbershopData.slug}`;
                    navigator.clipboard.writeText(link);
                  }}
                  style={{ flex: "0 0 auto" }}
                >
                  Copiar
                </Button>
              </LinkFieldRow>
            </FormGroup>

            <LinkTipBox>
              <Text
                $size="sm"
                $weight="semibold"
                $color="secondary"
                style={{ marginBottom: "0.5rem" }}
              >
                Como usar
              </Text>
              <LinkTipList>
                <li>Redes sociais e bio</li>
                <li>WhatsApp Business</li>
                <li>Google Meu Negócio</li>
                <li>Cartão digital</li>
              </LinkTipList>
            </LinkTipBox>
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
            <WorkingHoursForm onSubmit={handleWorkingHoursSubmit}>
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
            </WorkingHoursForm>
          </SectionContent>
        </SettingsSection>
      </SettingsContainer>
    </DashboardShell>
  );
};

export default SettingsPage;
