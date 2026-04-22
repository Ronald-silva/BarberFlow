import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  DashboardShell,
  Heading,
  Text,
  Card,
} from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import { Input, Label, FormGroup } from "../components/ui/Input";
import { BackButton } from "../components/ui/BackButton";
import { useAuth } from "../contexts/AuthContext";
import { supabaseApi, formatPostgrestError } from "../services/supabaseApi";
import { maskPhone } from "../utils/formatters";
import {
  DEFAULT_BRAND_MAIN_HEX,
  defaultBrandMainHex,
  normalizeBrandHex,
} from "../lib/barbershopBranding";
import type { DaySchedule, WorkInterval } from "../types";
import { DEFAULT_WORKING_HOURS } from "../utils/timeSlots";

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
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;

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
  max-width: 100%;
  overflow: hidden;
`;

const FileInput = styled.input`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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
    background-color: var(--bs-brand-main, #c8922a);
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
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    width: 100%;
  }
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
  border-top: 3px solid var(--bs-brand-main, #c8922a);
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

const MpTokenRow = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing[3]};
  align-items: stretch;
  flex-wrap: wrap;

  input {
    flex: 1 1 200px;
    min-width: 0;
  }

  button {
    flex: 0 0 auto;
  }
`;

const MpBadge = styled.span<{ $ok?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  border-radius: ${(props) => props.theme.radii.full};
  font-size: ${(props) => props.theme.typography.fontSizes.xs};
  font-weight: ${(props) => props.theme.typography.fontWeights.semibold};
  background: ${(props) =>
    props.$ok
      ? props.theme.colors.success.light
      : props.theme.colors.background.tertiary};
  color: ${(props) =>
    props.$ok
      ? props.theme.colors.success.main
      : props.theme.colors.text.tertiary};
  border: 1px solid ${(props) =>
    props.$ok
      ? props.theme.colors.success.border
      : props.theme.colors.border.secondary};
`;

const MpToggleRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing[4]};
  cursor: pointer;
  padding: ${(props) => props.theme.spacing[4]};
  background: ${(props) => props.theme.colors.background.secondary};
  border-radius: ${(props) => props.theme.radii.lg};
  border: 1px solid ${(props) => props.theme.colors.border.primary};
  transition: ${(props) => props.theme.transitions.base};

  &:hover {
    border-color: var(--bs-brand-main, #c8922a);
  }
`;

const MpToggleText = styled.div`
  flex: 1;
`;

const MpInfoBox = styled.div`
  margin-top: ${(props) => props.theme.spacing[4]};
  padding: ${(props) => props.theme.spacing[4]};
  border-radius: ${(props) => props.theme.radii.lg};
  border: 1px solid ${(props) => props.theme.colors.border.secondary};
  background: ${(props) => props.theme.colors.background.secondary};
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  color: ${(props) => props.theme.colors.text.tertiary};
  line-height: 1.55;
`;

const IntervalRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing[2]};
  flex-wrap: wrap;
`;

const IntervalSep = styled.span`
  font-size: ${(props) => props.theme.typography.fontSizes.sm};
  color: ${(props) => props.theme.colors.text.tertiary};
  white-space: nowrap;
`;

const AddIntervalBtn = styled.button`
  background: none;
  border: 1px dashed ${(props) => props.theme.colors.border.secondary};
  color: var(--bs-brand-main, #c8922a);
  border-radius: ${(props) => props.theme.radii.md};
  padding: ${(props) => props.theme.spacing[1]} ${(props) => props.theme.spacing[3]};
  font-size: ${(props) => props.theme.typography.fontSizes.xs};
  cursor: pointer;
  transition: ${(props) => props.theme.transitions.base};
  white-space: nowrap;

  &:hover {
    border-color: var(--bs-brand-main, #c8922a);
    background: color-mix(in srgb, var(--bs-brand-main, #c8922a) 8%, transparent);
  }
`;

const RemoveIntervalBtn = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text.tertiary};
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0 2px;
  transition: color 0.15s;

  &:hover { color: ${(props) => props.theme.colors.error}; }
`;

const DAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

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

  const [workingHours, setWorkingHours] = useState<DaySchedule[]>(DEFAULT_WORKING_HOURS);

  const [mpAccessToken, setMpAccessToken] = useState('');
  const [mpShowToken, setMpShowToken] = useState(false);
  const [mpConfigured, setMpConfigured] = useState(false);
  const [requirePaymentBeforeBooking, setRequirePaymentBeforeBooking] = useState(false);
  const [mpSubmitting, setMpSubmitting] = useState(false);
  const [mpSuccess, setMpSuccess] = useState(false);
  const [mpError, setMpError] = useState('');

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
            setMpConfigured(barbershop.mercadopagoConfigured ?? false);
            setRequirePaymentBeforeBooking(barbershop.requirePaymentBeforeBooking ?? false);
            if (barbershop.workingHours && barbershop.workingHours.length > 0) {
              setWorkingHours(barbershop.workingHours);
            }
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
      // Upload da logo pendente (se existir) antes de salvar o resto
      if (logoFile) {
        const uploadedUrl = await supabaseApi.uploadBarbershopLogo(user.barbershopId!, logoFile);
        if (uploadedUrl) {
          barbershopData.logoUrl = uploadedUrl;
          setLogoFile(null);
        } else {
          throw new Error('Falha ao enviar a logo. Tente novamente.');
        }
      }

      const { brandSaved } = await supabaseApi.updateBarbershop(user.barbershopId!, {
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
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      await supabaseApi.updateBarbershop(user.barbershopId!, { workingHours });
      await reloadBarbershop();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      setError(formatPostgrestError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDayEnabled = useCallback((dayIndex: number) => {
    setWorkingHours((prev) =>
      prev.map((d) => d.day === dayIndex ? { ...d, enabled: !d.enabled } : d)
    );
  }, []);

  const updateInterval = useCallback(
    (dayIndex: number, intervalIdx: number, field: keyof WorkInterval, value: string) => {
      setWorkingHours((prev) =>
        prev.map((d) => {
          if (d.day !== dayIndex) return d;
          const intervals = d.intervals.map((iv, i) =>
            i === intervalIdx ? { ...iv, [field]: value } : iv
          );
          return { ...d, intervals };
        })
      );
    },
    []
  );

  const addInterval = useCallback((dayIndex: number) => {
    setWorkingHours((prev) =>
      prev.map((d) => {
        if (d.day !== dayIndex) return d;
        const last = d.intervals[d.intervals.length - 1];
        return { ...d, intervals: [...d.intervals, { start: last?.end ?? '14:00', end: '18:00' }] };
      })
    );
  }, []);

  const removeInterval = useCallback((dayIndex: number, intervalIdx: number) => {
    setWorkingHours((prev) =>
      prev.map((d) => {
        if (d.day !== dayIndex || d.intervals.length <= 1) return d;
        return { ...d, intervals: d.intervals.filter((_, i) => i !== intervalIdx) };
      })
    );
  }, []);

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


  const handleLogoRemove = async () => {
    if (!barbershopData.logoUrl || !user) return;

    setUploadingLogo(true);
    try {
      const success = await supabaseApi.removeBarbershopLogo(user.barbershopId!, barbershopData.logoUrl);
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

  const handleMpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMpSubmitting(true);
    setMpError('');
    try {
      await supabaseApi.updateBarbershop(user.barbershopId!, {
        ...(mpAccessToken.trim() ? { mercadopagoAccessToken: mpAccessToken.trim() } : {}),
        requirePaymentBeforeBooking,
      });
      await reloadBarbershop();
      if (mpAccessToken.trim()) setMpConfigured(true);
      setMpAccessToken('');
      setMpSuccess(true);
      setTimeout(() => setMpSuccess(false), 3000);
    } catch (err) {
      setMpError(formatPostgrestError(err));
    } finally {
      setMpSubmitting(false);
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
      <div style={{ marginBottom: '1rem' }}>
        <BackButton to="/dashboard/overview" label="Dashboard" />
      </div>
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
                      phone: maskPhone(e.target.value),
                    })
                  }
                  placeholder="(11) 99999-9999"
                  inputMode="numeric"
                  maxLength={15}
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
                  <Text $size="sm" $color="secondary" style={{ marginTop: '0.5rem' }}>
                    Nova logo pronta — clique em <strong>Salvar Informações</strong> para confirmar.
                  </Text>
                )}

                <Text $size="xs" $color="tertiary" style={{ marginTop: "0.5rem" }}>
                  Formatos aceitos: JPG, PNG, WebP, SVG. Tamanho máximo: 5MB.
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

        {/* Mercado Pago */}
        <SettingsSection
          $variant="elevated"
          className="slide-in"
          style={{ animationDelay: "0.08s" }}
        >
          <SectionHeader>
            <SectionTitle>Pagamento via PIX (Mercado Pago)</SectionTitle>
            <SectionDescription>
              Configure seu Access Token para receber pagamentos PIX diretamente na sua conta
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <form onSubmit={handleMpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FormGroup>
                <Label htmlFor="mpToken">
                  Access Token do Mercado Pago
                  {mpConfigured && (
                    <MpBadge $ok style={{ marginLeft: '0.5rem' }}>
                      ✓ configurado
                    </MpBadge>
                  )}
                </Label>
                <Text $size="sm" $color="tertiary" style={{ marginBottom: '0.5rem' }}>
                  {mpConfigured
                    ? 'Um token já está salvo. Cole um novo para substituí-lo.'
                    : 'Cole aqui o token obtido no painel do Mercado Pago (Credenciais → Access Token de produção ou TEST-...).'}
                </Text>
                <MpTokenRow>
                  <Input
                    id="mpToken"
                    type={mpShowToken ? 'text' : 'password'}
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    placeholder={mpConfigured ? '••••••••••••••••••••' : 'APP_USR-... ou TEST-...'}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <Button
                    type="button"
                    $variant="outline"
                    $size="sm"
                    onClick={() => setMpShowToken((v) => !v)}
                    style={{ flex: '0 0 auto', whiteSpace: 'nowrap' }}
                  >
                    {mpShowToken ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </MpTokenRow>
              </FormGroup>

              <FormGroup>
                <Label>Exigir pagamento PIX antes do agendamento</Label>
                <MpToggleRow as="label" htmlFor="requirePayment">
                  <MpToggleText>
                    <Text $size="sm" $weight="medium" $color="primary" style={{ margin: 0 }}>
                      Pagamento obrigatório
                    </Text>
                    <Text $size="xs" $color="tertiary" style={{ margin: '0.15rem 0 0' }}>
                      O agendamento só é confirmado após o cliente pagar o PIX
                    </Text>
                  </MpToggleText>
                  <ToggleSwitch>
                    <ToggleSlider
                      id="requirePayment"
                      type="checkbox"
                      checked={requirePaymentBeforeBooking}
                      onChange={(e) => setRequirePaymentBeforeBooking(e.target.checked)}
                    />
                    <ToggleSliderSpan />
                  </ToggleSwitch>
                </MpToggleRow>
              </FormGroup>

              <MpInfoBox>
                <strong>Como obter o Access Token:</strong>
                {' '}Acesse mercadopago.com.br → Seu negócio → Credenciais → Access Token.
                Para testes, use o token <code>TEST-...</code>; em produção, use <code>APP_USR-...</code>.
                <br />
                <strong>Webhook:</strong> configure no Mercado Pago a URL
                {' '}<code style={{ wordBreak: 'break-all' }}>
                  {`${window.location.origin.replace('localhost:5173', 'SEU_REF.supabase.co')}/functions/v1/mercadopago-webhook`}
                </code>.
              </MpInfoBox>

              <div>
                <SaveButton
                  type="submit"
                  $variant="primary"
                  $loading={mpSubmitting}
                  disabled={mpSubmitting}
                >
                  {mpSubmitting ? 'Salvando...' : 'Salvar configurações PIX'}
                </SaveButton>
                <SuccessMessage $show={mpSuccess}>
                  ✓ Configurações do Mercado Pago salvas!
                </SuccessMessage>
                <ErrorMessage $show={!!mpError}>✗ {mpError}</ErrorMessage>
              </div>
            </form>
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
                {workingHours.map((schedule) => (
                  <DayRow key={schedule.day} style={{ gridTemplateColumns: '120px 1fr auto', alignItems: 'start' }}>
                    <DayLabel style={{ paddingTop: '0.5rem' }}>{DAY_LABELS[schedule.day]}</DayLabel>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {schedule.intervals.map((iv, ivIdx) => (
                        <IntervalRow key={ivIdx}>
                          <TimeInput
                            type="time"
                            value={iv.start}
                            onChange={(e) => updateInterval(schedule.day, ivIdx, 'start', e.target.value)}
                            disabled={!schedule.enabled}
                            $size="sm"
                            style={{ width: 100 }}
                          />
                          <IntervalSep>até</IntervalSep>
                          <TimeInput
                            type="time"
                            value={iv.end}
                            onChange={(e) => updateInterval(schedule.day, ivIdx, 'end', e.target.value)}
                            disabled={!schedule.enabled}
                            $size="sm"
                            style={{ width: 100 }}
                          />
                          {schedule.intervals.length > 1 && (
                            <RemoveIntervalBtn
                              type="button"
                              title="Remover intervalo"
                              onClick={() => removeInterval(schedule.day, ivIdx)}
                              disabled={!schedule.enabled}
                            >
                              ×
                            </RemoveIntervalBtn>
                          )}
                        </IntervalRow>
                      ))}

                      {schedule.enabled && (
                        <AddIntervalBtn
                          type="button"
                          onClick={() => addInterval(schedule.day)}
                        >
                          + intervalo
                        </AddIntervalBtn>
                      )}
                    </div>

                    <ToggleSwitch style={{ marginTop: '0.35rem' }}>
                      <ToggleSlider
                        type="checkbox"
                        checked={schedule.enabled}
                        onChange={() => toggleDayEnabled(schedule.day)}
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
