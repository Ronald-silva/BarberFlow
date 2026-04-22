import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { supabase } from "../services/supabase";
import type { Database } from "../services/supabase";
import { logMultipleConsents } from "../services/consentLogger";
import { maskPhone, maskCPFCNPJ } from "../utils/formatters";
import { isValidPhone, isValidCPFCNPJ } from "../utils/validators";

// ============================================================
// SHAFAR — Registration Page v2.0
// Mobile-first, 2-step wizard, premium dark aesthetic
// ============================================================

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: #0D0D0D;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 1.25rem 1.25rem 4rem;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(200, 146, 42, 0.045) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent);
    pointer-events: none;
  }

  @media (min-width: 768px) {
    padding: 2.5rem 1.25rem 5rem;
    justify-content: center;
  }
`;

/* ===== TOP NAV STRIP ===== */
const TopBar = styled.div`
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    margin-bottom: 2.5rem;
  }
`;

const LogoText = styled.div`
  font-size: 1.125rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: #6B6B6B;
  font-size: 0.875rem;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0;
  transition: color 150ms;
  min-height: auto;

  &:hover { color: #ABABAB; }
`;

/* ===== CARD ===== */
const Card = styled.div`
  width: 100%;
  max-width: 520px;
  background: #141414;
  border: 1px solid #1E1E1E;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const CardHead = styled.div`
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid #1A1A1A;
`;

const StepTrack = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 1.75rem;
`;

const StepDot = styled.div<{ $state: 'done' | 'active' | 'idle' }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 300ms ease;

  ${p => p.$state === 'done' && `
    background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
    color: #0D0D0D;
    box-shadow: 0 4px 12px rgba(200, 146, 42, 0.4);
  `}
  ${p => p.$state === 'active' && `
    background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
    color: #0D0D0D;
    box-shadow: 0 4px 16px rgba(200, 146, 42, 0.5);
  `}
  ${p => p.$state === 'idle' && `
    background: #1E1E1E;
    color: #4A4A4A;
    border: 1px solid #2A2A2A;
  `}
`;

const StepBar = styled.div<{ $filled: boolean }>`
  flex: 1;
  height: 2px;
  background: ${p => p.$filled
    ? 'linear-gradient(90deg, #C8922A 0%, #E8B84B 100%)'
    : '#1E1E1E'};
  transition: background 400ms ease;
  margin: 0 8px;
`;


const HeadTitle = styled.h1`
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #F5F5F5;
  margin-bottom: 0.375rem;

  @media (min-width: 480px) {
    font-size: 1.5rem;
  }
`;

const HeadSub = styled.p`
  font-size: 0.875rem;
  color: #6B6B6B;
`;

/* ===== FORM BODY ===== */
const FormBody = styled.div`
  padding: 1.75rem 2rem;
  animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #ABABAB;
  letter-spacing: 0.01em;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: #0D0D0D;
  border: 1px solid #2A2A2A;
  border-radius: 12px;
  color: #F5F5F5;
  font-size: 0.9375rem;
  font-family: "Inter", sans-serif;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  min-height: 52px;

  &::placeholder { color: #3D3D3D; }

  &:focus {
    border-color: rgba(200, 146, 42, 0.5);
    box-shadow: 0 0 0 3px rgba(200, 146, 42, 0.1);
    outline: none;
  }

  &:hover:not(:focus) { border-color: #363636; }
`;

// PasswordField — encapsula Input + toggle olhinho (mesmos estilos do Input local)
const PasswordInputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordInputStyled = styled(Input)`
  padding-right: 3rem;
`;

const RegEyeBtn = styled.button`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  background: none;
  border: none;
  padding: 0.3rem;
  cursor: pointer;
  color: #6B6B6B;
  opacity: 0;
  transition: opacity 180ms ease;
  border-radius: 4px;
  z-index: 2;

  ${PasswordInputWrap}:hover & { opacity: 0.5; }
  ${PasswordInputWrap}:hover &:hover { opacity: 0.9; }
  &:focus-visible { outline: 2px solid rgba(200,146,42,0.6); outline-offset: 2px; opacity: 0.7; }
`;

const RegPasswordField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { id: string }> = ({ id, ...props }) => {
  const [vis, setVis] = React.useState(false);
  return (
    <PasswordInputWrap>
      <PasswordInputStyled id={id} type={vis ? 'text' : 'password'} {...props} />
      <RegEyeBtn type="button" onClick={() => setVis(v => !v)}
        aria-label={vis ? 'Ocultar senha' : 'Mostrar senha'} tabIndex={-1}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {vis ? (
            <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
          ) : (
            <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
          )}
        </svg>
      </RegEyeBtn>
    </PasswordInputWrap>
  );
};


const HelperText = styled.p`
  font-size: 0.75rem;
  color: #4A4A4A;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

/* ===== LEGAL SECTION ===== */
const LegalBox = styled.div`
  background: rgba(200, 146, 42, 0.04);
  border: 1px solid rgba(200, 146, 42, 0.12);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
`;

const LegalTitle = styled.p`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #ABABAB;
  margin-bottom: 0.375rem;
`;

const LegalDesc = styled.p`
  font-size: 0.8125rem;
  color: #6B6B6B;
  line-height: 1.6;
`;

const ConsentItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  background: #0D0D0D;
  border: 1px solid #1E1E1E;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 150ms ease;
  margin-bottom: 0.625rem;

  &:hover { border-color: #2A2A2A; }

  &:last-child { margin-bottom: 0; }
`;

const CustomCheckbox = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 6px;
  border: 1.5px solid ${p => p.$checked ? '#C8922A' : '#2A2A2A'};
  background: ${p => p.$checked ? 'linear-gradient(135deg, #C8922A 0%, #E8B84B 100%)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #0D0D0D;
  font-weight: 900;
  transition: all 200ms ease;
  margin-top: 1px;
  box-shadow: ${p => p.$checked ? '0 2px 8px rgba(200, 146, 42, 0.35)' : 'none'};
`;

const ConsentText = styled.span`
  font-size: 0.875rem;
  color: #6B6B6B;
  line-height: 1.55;

  a {
    color: #C8922A;
    text-decoration: none;
    font-weight: 600;
    &:hover { color: #E8B84B; }
  }
`;

/* ===== FOOTER ACTIONS ===== */
const Actions = styled.div`
  padding: 1.25rem 2rem 1.75rem;
  border-top: 1px solid #1A1A1A;
  display: flex;
  gap: 0.75rem;
`;

const ErrorAlert = styled.div`
  margin: 0 2rem 1rem;
  padding: 0.875rem 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  color: #EF4444;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.5;
`;

/* ===== COMPONENT ===== */
interface BarbershopData {
  name: string; slug: string; address: string; phone: string; email: string; cpfCnpj: string;
}
interface AdminData {
  name: string; email: string; password: string;
}

// formatCpfCnpjInput substituído por maskCPFCNPJ de ../utils/formatters


const BarbershopRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [shop, setShop] = useState<BarbershopData>({ name: "", slug: "", address: "", phone: "", email: "", cpfCnpj: "" });
  const [admin, setAdmin] = useState<AdminData>({ name: "", email: "", password: "" });

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-").trim();

  const handleShopChange = (field: keyof BarbershopData, value: string) => {
    setShop(prev => {
      let formattedValue = value;
      if (field === "cpfCnpj") formattedValue = maskCPFCNPJ(value);
      if (field === "phone") formattedValue = maskPhone(value);
      const u = { ...prev, [field]: formattedValue };
      if (field === "name") u.slug = generateSlug(value);
      return u;
    });
  };

  const cpfCnpjClean = shop.cpfCnpj.replace(/\D/g, '');
  const cpfCnpjValid = !shop.cpfCnpj || isValidCPFCNPJ(shop.cpfCnpj);
  const phoneValid = isValidPhone(shop.phone);
  const step1Valid = shop.name && shop.slug && shop.address && phoneValid && shop.email && cpfCnpjValid;
  const step2Valid = admin.name && admin.email && admin.password.length >= 6 && acceptedTerms && acceptedPrivacy;

  const handleSubmit = async () => {
    if (!step2Valid) return;
    setLoading(true);
    setError("");

    try {
      // Cadastro público: insert em barbershops só passa RLS como anônimo (ou política estendida).
      await supabase.auth.signOut();

      const { data: slugAvailable, error: slugCheckErr } = await supabase.rpc(
        'is_barbershop_slug_available',
        { p_slug: shop.slug }
      );

      if (slugCheckErr) {
        console.error(slugCheckErr);
        setError("Não foi possível verificar se a URL está disponível. Tente de novo.");
        setLoading(false);
        return;
      }
      if (!slugAvailable) {
        setError(
          "Esta URL (slug) já está em uso — muitas vezes por um cadastro anterior que parou no meio. Altere o nome da barbearia/slug ou apague a linha órfã em public.barbershops no Supabase e tente de novo."
        );
        setLoading(false);
        return;
      }

      const insertBarbershop: Database['public']['Tables']['barbershops']['Insert'] = {
        name: shop.name,
        slug: shop.slug,
        address: shop.address,
        phone: shop.phone,
        email: shop.email,
        ...(cpfCnpjClean ? { cpf_cnpj: cpfCnpjClean } : {}),
      };
      const { data: barbershop, error: bErr } = await supabase
        .from('barbershops')
        .insert(insertBarbershop)
        .select()
        .single();

      if (bErr) throw bErr;
      if (!barbershop) throw new Error('Falha ao criar barbearia');

      const { data: authUser, error: authErr } = await supabase.auth.signUp({
        email: admin.email, password: admin.password,
        options: { emailRedirectTo: window.location.origin + '/login', data: { name: admin.name, barbershop_id: barbershop.id, role: "admin" } },
      });

      if (authErr) throw authErr;
      if (!authUser.user) throw new Error('Falha ao criar usuário');

      const insertUser: Database['public']['Tables']['users']['Insert'] = {
        id: authUser.user.id,
        email: admin.email,
        name: admin.name,
        barbershop_id: barbershop.id,
        role: 'admin',
        work_hours: [
          { day: 1, start: '09:00', end: '18:00' }, { day: 2, start: '09:00', end: '18:00' },
          { day: 3, start: '09:00', end: '18:00' }, { day: 4, start: '09:00', end: '18:00' },
          { day: 5, start: '09:00', end: '20:00' }, { day: 6, start: '08:00', end: '16:00' },
        ],
      };
      const { error: uErr } = await supabase.from('users').insert(insertUser);

      if (uErr) throw uErr;

      const seedServices: Database['public']['Tables']['services']['Insert'][] = [
        { name: 'Corte de Cabelo', price: 40.0, duration: 45, barbershop_id: barbershop.id },
        { name: 'Barba', price: 30.0, duration: 30, barbershop_id: barbershop.id },
        { name: 'Corte e Barba', price: 65.0, duration: 75, barbershop_id: barbershop.id },
        { name: 'Pezinho', price: 15.0, duration: 15, barbershop_id: barbershop.id },
      ];
      await supabase.from('services').insert(seedServices);

      await logMultipleConsents(authUser.user.id, ['terms', 'privacy']);

      navigate("/login", { state: { message: "Barbearia criada com sucesso! Faça login.", email: admin.email } });
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("User already registered")) setError("Este email já tem cadastro. Faça login ou use outro email.");
      else if (err.code === "23505") setError("URL ou email já cadastrado. Verifique os dados.");
      else if (msg.includes("row-level security") && msg.includes("barbershops")) {
        setError(
          "Permissão negada ao criar a barbearia (RLS). Saia da conta no app ou execute no SQL Editor: supabase/migrations/20260419_rls_barbershops_insert_registration.sql — depois tente de novo."
        );
      } else if (msg.includes("row-level security") && msg.includes("users")) {
        setError(
          "Permissão negada ao criar seu perfil (RLS em users). No Supabase SQL Editor execute: supabase/migrations/20260418_rls_users_insert_own_profile.sql — depois tente cadastrar de novo."
        );
      }
      else if (msg.includes("barbershops") && msg.includes("schema cache")) {
        setError(
          "O schema da tabela barbershops no Supabase está desatualizado em relação ao app. No SQL Editor, execute os arquivos: supabase/migrations/20260416_barbershops_email_column.sql e supabase/migrations/20260417_barbershops_phone_address.sql (ou o trecho equivalente em database/SETUP_COMPLETO.sql) e tente de novo."
        );
      } else setError(msg || "Erro ao criar barbearia. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const stepState = (n: number): 'done' | 'active' | 'idle' =>
    n < step ? 'done' : n === step ? 'active' : 'idle';

  const stepTitles = ['Sua Barbearia', 'Sua Conta'];
  const stepSubs = ['Dados básicos da sua barbearia', 'Crie seu acesso de administrador'];

  return (
    <Page>
      <TopBar>
        <LogoText>Shafar</LogoText>
        <BackBtn onClick={() => navigate('/login')}>
          ← Voltar ao login
        </BackBtn>
      </TopBar>

      <Card>
        <CardHead>
          {/* Step tracker */}
          <StepTrack>
            <StepDot $state={stepState(1)}>
              {step > 1 ? '✓' : '1'}
            </StepDot>
            <StepBar $filled={step > 1} />
            <StepDot $state={stepState(2)}>2</StepDot>
          </StepTrack>

          <HeadTitle>{stepTitles[step - 1]}</HeadTitle>
          <HeadSub>{stepSubs[step - 1]} — Passo {step} de 2</HeadSub>
        </CardHead>

        {/* STEP 1 */}
        {step === 1 && (
          <FormBody key="step1">
            <FieldGroup>
              <Field>
                <Label htmlFor="shopName">Nome da barbearia</Label>
                <Input id="shopName" placeholder="Ex: Navalha Dourada" value={shop.name}
                  onChange={e => handleShopChange("name", e.target.value)} />
              </Field>

              <Field>
                <Label htmlFor="shopSlug">URL da barbearia</Label>
                <Input id="shopSlug" placeholder="navalha-dourada" value={shop.slug}
                  onChange={e => handleShopChange("slug", e.target.value)} />
                <HelperText>🔗 shafar.com.br/{shop.slug || 'sua-barbearia'}</HelperText>
              </Field>

              <Field>
                <Label htmlFor="shopAddress">Endereço</Label>
                <Input id="shopAddress" placeholder="Rua das Tesouras, 123 — Centro" value={shop.address}
                  autoComplete="street-address" onChange={e => handleShopChange("address", e.target.value)} />
              </Field>

              <Field>
                <Label htmlFor="shopPhone">Telefone</Label>
                <Input id="shopPhone" type="tel" placeholder="(11) 99999-9999" value={shop.phone}
                  autoComplete="tel" inputMode="numeric" maxLength={15}
                  onChange={e => handleShopChange("phone", e.target.value)} />
                {shop.phone && !isValidPhone(shop.phone) && shop.phone.replace(/\D/g,'').length >= 10 && (
                  <HelperText style={{ color: '#EF4444' }}>Telefone inválido — insira DDD + número</HelperText>
                )}
              </Field>

              <Field>
                <Label htmlFor="shopEmail">Email da barbearia</Label>
                <Input id="shopEmail" type="email" placeholder="contato@barbearia.com" value={shop.email}
                  autoComplete="email" onChange={e => handleShopChange("email", e.target.value)} />
              </Field>

              <Field>
                <Label htmlFor="shopCpfCnpj">CPF / CNPJ do responsável <span style={{ color: '#6b7280', fontWeight: 400 }}>(opcional)</span></Label>
                <Input id="shopCpfCnpj" placeholder="000.000.000-00 ou 00.000.000/0001-00" value={shop.cpfCnpj}
                  inputMode="numeric" maxLength={18}
                  onChange={e => handleShopChange("cpfCnpj", e.target.value)} />
                {shop.cpfCnpj && !cpfCnpjValid && (
                  <HelperText style={{ color: '#EF4444' }}>CPF (11 dígitos) ou CNPJ (14 dígitos)</HelperText>
                )}
              </Field>
            </FieldGroup>
          </FormBody>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <FormBody key="step2">
            <FieldGroup>
              <Field>
                <Label htmlFor="adminName">Seu nome completo</Label>
                <Input id="adminName" placeholder="João Silva" value={admin.name}
                  autoComplete="name" onChange={e => setAdmin(p => ({ ...p, name: e.target.value }))} />
              </Field>

              <Field>
                <Label htmlFor="adminEmail">Email de acesso</Label>
                <Input id="adminEmail" type="email" placeholder="joao@barbearia.com" value={admin.email}
                  autoComplete="email" onChange={e => setAdmin(p => ({ ...p, email: e.target.value }))} />
                <HelperText>💡 Será usado para fazer login no sistema</HelperText>
              </Field>

              <Field>
                <Label htmlFor="adminPass">Senha</Label>
                <RegPasswordField
                  id="adminPass"
                  placeholder="Mínimo 6 caracteres"
                  value={admin.password}
                  autoComplete="new-password"
                  onChange={e => setAdmin(p => ({ ...p, password: e.target.value }))} />
              </Field>
            </FieldGroup>

            {/* Legal */}
            <LegalBox>
              <LegalTitle>📋 Conformidade LGPD</LegalTitle>
              <LegalDesc>Leia e aceite os termos antes de prosseguir.</LegalDesc>
            </LegalBox>

            <ConsentItem onClick={() => setAcceptedTerms(v => !v)}>
              <CustomCheckbox $checked={acceptedTerms}>
                {acceptedTerms && '✓'}
              </CustomCheckbox>
              <ConsentText>
                Li e aceito os <Link to="/terms" target="_blank" onClick={e => e.stopPropagation()}>Termos de Uso</Link>
              </ConsentText>
            </ConsentItem>

            <ConsentItem onClick={() => setAcceptedPrivacy(v => !v)} style={{ marginBottom: '1.5rem' }}>
              <CustomCheckbox $checked={acceptedPrivacy}>
                {acceptedPrivacy && '✓'}
              </CustomCheckbox>
              <ConsentText>
                Li e aceito a{' '}
                <Link to="/privacy" target="_blank" onClick={e => e.stopPropagation()}>Política de Privacidade</Link>
                {' '}e autorizo o tratamento dos meus dados (LGPD)
              </ConsentText>
            </ConsentItem>
          </FormBody>
        )}

        {/* Error */}
        {error && (
          <ErrorAlert>
            <span>⚠️</span>
            <span>{error}</span>
          </ErrorAlert>
        )}

        {/* Actions */}
        <Actions>
          {step === 1 ? (
            <Button $variant="ghost" $size="md" onClick={() => navigate('/login')} style={{ flexShrink: 0 }}>
              Cancelar
            </Button>
          ) : (
            <Button $variant="secondary" $size="md" onClick={() => setStep(1)} style={{ flexShrink: 0 }}>
              ← Voltar
            </Button>
          )}

          {step === 1 ? (
            <Button $size="md" $fullWidth disabled={!step1Valid} onClick={() => setStep(2)}>
              Continuar →
            </Button>
          ) : (
            <Button $size="md" $fullWidth disabled={!step2Valid || loading} $loading={loading} onClick={handleSubmit}>
              {loading ? 'Criando...' : 'Criar barbearia'}
            </Button>
          )}
        </Actions>
      </Card>
    </Page>
  );
};

export default BarbershopRegistrationPage;
