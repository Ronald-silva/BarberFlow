# 📋 GUIA DE IMPLEMENTAÇÃO - DOCUMENTOS LEGAIS LGPD

## 🎯 Objetivo

Este guia descreve **como implementar corretamente** os documentos legais (Política de Privacidade, Termos de Uso, Consentimento LGPD) na plataforma Shafar para garantir **conformidade total com a LGPD**.

---

## ✅ Checklist de Implementação

Antes de lançar em produção, certifique-se de implementar:

- [ ] Páginas estáticas para Política de Privacidade e Termos de Uso
- [ ] Checkbox de aceite no cadastro (obrigatório)
- [ ] Armazenamento de logs de consentimento (data, hora, IP, versão)
- [ ] Link "Política de Privacidade" no rodapé de todas as páginas
- [ ] Link "Termos de Uso" no rodapé de todas as páginas
- [ ] Modal de consentimento de cookies (primeira visita)
- [ ] Seção "Meus Dados" para exercício de direitos LGPD
- [ ] E-mail configurado para privacy@ e dpo@
- [ ] Banner de alterações quando documentos forem atualizados

---

## 1. CRIAR PÁGINAS ESTÁTICAS

### 1.1. Criar Componente de Política de Privacidade

**Arquivo**: `src/pages/PrivacyPolicyPage.tsx`

```typescript
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[8]};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const LastUpdated = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const Content = styled.div`
  line-height: 1.8;
  color: ${props => props.theme.colors.text.primary};

  h2 {
    font-size: ${props => props.theme.typography.fontSizes['2xl']};
    margin-top: ${props => props.theme.spacing[8]};
    margin-bottom: ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.primary.main};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSizes.xl};
    margin-top: ${props => props.theme.spacing[6]};
    margin-bottom: ${props => props.theme.spacing[3]};
  }

  p {
    margin-bottom: ${props => props.theme.spacing[4]};
  }

  ul, ol {
    margin-left: ${props => props.theme.spacing[6]};
    margin-bottom: ${props => props.theme.spacing[4]};
  }

  li {
    margin-bottom: ${props => props.theme.spacing[2]};
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: ${props => props.theme.spacing[4]} 0;
  }

  th, td {
    border: 1px solid ${props => props.theme.colors.border.main};
    padding: ${props => props.theme.spacing[3]};
    text-align: left;
  }

  th {
    background: ${props => props.theme.colors.background.secondary};
    font-weight: bold;
  }
`;

const BackButton = styled.button`
  margin-top: ${props => props.theme.spacing[8]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSizes.base};

  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
`;

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <Title>Política de Privacidade</Title>
        <LastUpdated>Última atualização: 30 de dezembro de 2025</LastUpdated>
      </Header>

      <Content>
        {/* COLE AQUI O CONTEÚDO DO ARQUIVO POLITICA_DE_PRIVACIDADE.md */}
        {/* Converta Markdown para JSX ou use biblioteca react-markdown */}

        <h2>1. INFORMAÇÕES GERAIS</h2>
        <p>
          A presente Política de Privacidade ("Política") descreve como o Shafar...
        </p>

        {/* ... resto do conteúdo ... */}
      </Content>

      <BackButton onClick={() => navigate(-1)}>
        Voltar
      </BackButton>
    </Container>
  );
}
```

### 1.2. Criar Componente de Termos de Uso

**Arquivo**: `src/pages/TermsOfServicePage.tsx`

```typescript
// Similar ao PrivacyPolicyPage.tsx
// Cole o conteúdo de TERMOS_DE_USO.md
```

### 1.3. Adicionar Rotas

**Arquivo**: `src/App.tsx`

```typescript
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';

// Dentro do Router:
<Route path="/privacy" element={<PrivacyPolicyPage />} />
<Route path="/terms" element={<TermsOfServicePage />} />
```

---

## 2. CHECKBOX DE ACEITE NO CADASTRO

### 2.1. Atualizar Página de Registro

**Arquivo**: `src/pages/BarbershopRegistrationPage.tsx`

```typescript
import { useState } from 'react';

const [acceptedTerms, setAcceptedTerms] = useState(false);
const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

// No JSX, antes do botão "Criar Barbearia":

<CheckboxContainer>
  <Checkbox
    type="checkbox"
    id="terms"
    checked={acceptedTerms}
    onChange={(e) => setAcceptedTerms(e.target.checked)}
    required
  />
  <Label htmlFor="terms">
    Eu li e concordo com os{' '}
    <Link to="/terms" target="_blank">Termos de Uso</Link>
  </Label>
</CheckboxContainer>

<CheckboxContainer>
  <Checkbox
    type="checkbox"
    id="privacy"
    checked={acceptedPrivacy}
    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
    required
  />
  <Label htmlFor="privacy">
    Eu li e concordo com a{' '}
    <Link to="/privacy" target="_blank">Política de Privacidade</Link>
    {' '}e autorizo o tratamento de meus dados pessoais conforme a LGPD
  </Label>
</CheckboxContainer>

<Button
  type="submit"
  disabled={!acceptedTerms || !acceptedPrivacy || loading}
>
  Criar Barbearia
</Button>
```

**Styled Components**:

```typescript
const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const Checkbox = styled.input`
  margin-top: 4px;
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;

  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
```

---

## 3. ARMAZENAR LOGS DE CONSENTIMENTO

### 3.1. Criar Tabela de Logs

**SQL**: `database/consent-logs-schema.sql`

```sql
-- Tabela para registrar consentimentos LGPD
CREATE TABLE IF NOT EXISTS consent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'cookies'
    consent_version VARCHAR(20) NOT NULL, -- Ex: '1.0', '2.0'
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_info JSONB,
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT
);

-- Índices
CREATE INDEX idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX idx_consent_logs_type ON consent_logs(consent_type);
CREATE INDEX idx_consent_logs_consented_at ON consent_logs(consented_at);

-- RLS
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios logs
CREATE POLICY "Users can view own consent logs"
    ON consent_logs FOR SELECT
    USING (user_id = auth.uid());

-- Apenas system pode inserir (via Edge Function)
CREATE POLICY "System can insert consent logs"
    ON consent_logs FOR INSERT
    WITH CHECK (true);

-- Platform admins podem ver todos
CREATE POLICY "Platform admins can view all consent logs"
    ON consent_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'platform_admin'
        )
    );
```

### 3.2. Função para Registrar Consentimento

**Arquivo**: `src/services/consentLogger.ts`

```typescript
import { supabase } from './supabase';

interface ConsentLog {
  userId: string;
  consentType: 'terms' | 'privacy' | 'cookies';
  consentVersion: string;
}

export async function logConsent({ userId, consentType, consentVersion }: ConsentLog) {
  try {
    // Obter informações do navegador
    const userAgent = navigator.userAgent;
    const deviceInfo = {
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Obter IP (será preenchido pelo backend/edge function)
    // Frontend não consegue obter IP real devido a NAT/proxies

    const { error } = await supabase.from('consent_logs').insert({
      user_id: userId,
      consent_type: consentType,
      consent_version: consentVersion,
      ip_address: '0.0.0.0', // Será atualizado por Edge Function
      user_agent: userAgent,
      device_info: deviceInfo,
    });

    if (error) {
      console.error('Erro ao registrar consentimento:', error);
      // Não bloquear cadastro por erro de log
    }
  } catch (err) {
    console.error('Erro inesperado ao registrar consentimento:', err);
  }
}
```

### 3.3. Chamar ao Criar Conta

**Arquivo**: `src/pages/BarbershopRegistrationPage.tsx`

```typescript
import { logConsent } from '../services/consentLogger';

// Após criar usuário com sucesso:
const handleSubmit = async (e) => {
  e.preventDefault();

  // ... código de criação de conta ...

  if (authData.user) {
    // Registrar consentimentos
    await Promise.all([
      logConsent({
        userId: authData.user.id,
        consentType: 'terms',
        consentVersion: '1.0',
      }),
      logConsent({
        userId: authData.user.id,
        consentType: 'privacy',
        consentVersion: '1.0',
      }),
    ]);

    // Continuar com cadastro...
  }
};
```

---

## 4. LINKS NO RODAPÉ

### 4.1. Criar Componente de Rodapé

**Arquivo**: `src/components/Footer.tsx`

```typescript
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.background.secondary};
  border-top: 1px solid ${props => props.theme.colors.border.main};
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[4]};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
`;

const Links = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[6]};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing[3]};
  }
`;

const FooterLink = styled(Link)`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  text-decoration: none;

  &:hover {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: underline;
  }
`;

export function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          © {new Date().getFullYear()} Shafar. Todos os direitos reservados.
        </Copyright>

        <Links>
          <FooterLink to="/privacy">Política de Privacidade</FooterLink>
          <FooterLink to="/terms">Termos de Uso</FooterLink>
          <FooterLink to="/contact">Contato</FooterLink>
          <FooterLink to="/help">Ajuda</FooterLink>
        </Links>
      </FooterContent>
    </FooterContainer>
  );
}
```

### 4.2. Adicionar no Layout Principal

**Arquivo**: `src/App.tsx` ou `src/components/Layout.tsx`

```typescript
import { Footer } from './components/Footer';

// No componente principal:
<>
  <Header />
  <Main>
    <Outlet /> {/* ou children */}
  </Main>
  <Footer />
</>
```

---

## 5. MODAL DE COOKIES (PRIMEIRA VISITA)

### 5.1. Criar Componente de Cookie Consent

**Arquivo**: `src/components/CookieConsent.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.background.elevated};
  border-top: 2px solid ${props => props.theme.colors.primary.main};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing[6]};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Text = styled.p`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};

  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[3]};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary.main};
    color: white;
    border: none;

    &:hover {
      background: ${props.theme.colors.primary.dark};
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.secondary};
    border: 1px solid ${props.theme.colors.border.main};

    &:hover {
      background: ${props.theme.colors.background.secondary};
    }
  `}
`;

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar se já aceitou cookies
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShow(false);
    // Desabilitar cookies não essenciais (implementar conforme necessário)
  };

  if (!show) return null;

  return (
    <Banner>
      <Content>
        <Text>
          Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de desempenho
          para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
          <Link to="/privacy">Política de Privacidade</Link> e uso de cookies.
        </Text>

        <Buttons>
          <Button variant="secondary" onClick={handleReject}>
            Apenas Essenciais
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            Aceitar Todos
          </Button>
        </Buttons>
      </Content>
    </Banner>
  );
}
```

### 5.2. Adicionar no App Principal

**Arquivo**: `src/App.tsx`

```typescript
import { CookieConsent } from './components/CookieConsent';

// Dentro do componente principal:
<>
  {/* Rotas e conteúdo */}
  <CookieConsent />
</>
```

---

## 6. SEÇÃO "MEUS DADOS" (DIREITOS LGPD)

### 6.1. Criar Página de Dados Pessoais

**Arquivo**: `src/pages/MyDataPage.tsx`

```typescript
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['2xl']};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const Section = styled.div`
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  margin-bottom: ${props => props.theme.spacing[4]};
  color: ${props => props.theme.colors.primary.main};
`;

const DataItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[3]} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.main};

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
`;

const Value = styled.span`
  color: ${props => props.theme.colors.text.primary};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSizes.base};

  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
`;

const DangerButton = styled(Button)`
  background: ${props => props.theme.colors.error.main};

  &:hover {
    background: ${props => props.theme.colors.error.dark};
  }
`;

export function MyDataPage() {
  const { user, barbershop } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleExportData = async () => {
    // Implementar exportação de dados (JSON)
    alert('Seus dados serão enviados por e-mail em até 24 horas.');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível!')) {
      // Implementar exclusão de conta
      alert('Solicitação de exclusão enviada. Processaremos em até 72 horas.');
    }
  };

  return (
    <Container>
      <Title>Meus Dados Pessoais (LGPD)</Title>

      <Section>
        <SectionTitle>Informações da Conta</SectionTitle>
        <DataItem>
          <Label>Nome:</Label>
          <Value>{user?.name}</Value>
        </DataItem>
        <DataItem>
          <Label>E-mail:</Label>
          <Value>{user?.email}</Value>
        </DataItem>
        <DataItem>
          <Label>Barbearia:</Label>
          <Value>{barbershop?.name}</Value>
        </DataItem>
        <DataItem>
          <Label>Função:</Label>
          <Value>{user?.role === 'admin' ? 'Administrador' : 'Membro'}</Value>
        </DataItem>
      </Section>

      <Section>
        <SectionTitle>Seus Direitos (LGPD)</SectionTitle>
        <p>De acordo com a Lei Geral de Proteção de Dados, você tem direito a:</p>
        <ul>
          <li>Confirmar a existência de tratamento de seus dados</li>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incompletos ou inexatos</li>
          <li>Solicitar portabilidade de dados</li>
          <li>Eliminar dados tratados com consentimento</li>
          <li>Revogar consentimento</li>
        </ul>
      </Section>

      <Section>
        <SectionTitle>Ações Disponíveis</SectionTitle>

        <DataItem>
          <div>
            <strong>Exportar Meus Dados</strong>
            <p>Receba uma cópia de todos os seus dados em formato JSON.</p>
          </div>
          <Button onClick={handleExportData} disabled={loading}>
            Exportar
          </Button>
        </DataItem>

        <DataItem>
          <div>
            <strong>Excluir Minha Conta</strong>
            <p>Solicitar exclusão permanente de todos os seus dados.</p>
          </div>
          <DangerButton onClick={handleDeleteAccount} disabled={loading}>
            Excluir Conta
          </DangerButton>
        </DataItem>
      </Section>

      <Section>
        <SectionTitle>Contato</SectionTitle>
        <p>
          Para exercer seus direitos ou tirar dúvidas sobre tratamento de dados:
        </p>
        <p>
          <strong>E-mail:</strong> privacy@shafar.com.br<br />
          <strong>DPO:</strong> dpo@shafar.com.br
        </p>
      </Section>
    </Container>
  );
}
```

### 6.2. Adicionar Rota

```typescript
<Route path="/my-data" element={<MyDataPage />} />
```

### 6.3. Adicionar Link no Menu do Usuário

```typescript
<MenuItem onClick={() => navigate('/my-data')}>
  Meus Dados (LGPD)
</MenuItem>
```

---

## 7. CONFIGURAR E-MAILS

### 7.1. E-mails Necessários

Configure os seguintes e-mails no seu provedor (Google Workspace, etc.):

- **privacy@shafar.com.br**: Para solicitações de privacidade
- **dpo@shafar.com.br**: Para o Encarregado de Dados (DPO)
- **legal@shafar.com.br**: Para questões jurídicas
- **contato@shafar.com.br**: Para contato geral

### 7.2. Respostas Automáticas (Opcional)

Configure resposta automática informando:

```
Obrigado por entrar em contato!

Recebemos sua mensagem e responderemos em até 15 dias úteis, conforme determina a LGPD.

Para urgências, ligue para [TELEFONE].

Atenciosamente,
Equipe Shafar
```

---

## 8. BANNER DE ALTERAÇÕES

### 8.1. Criar Sistema de Notificação

**Arquivo**: `src/components/PolicyUpdateBanner.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Banner = styled.div`
  background: ${props => props.theme.colors.warning.light};
  border-bottom: 2px solid ${props => props.theme.colors.warning.main};
  padding: ${props => props.theme.spacing[4]};
  text-align: center;
`;

const Text = styled.p`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin: 0;

  a {
    color: ${props => props.theme.colors.primary.main};
    font-weight: bold;
    text-decoration: underline;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  font-size: 20px;
  position: absolute;
  right: 20px;
`;

export function PolicyUpdateBanner() {
  const [show, setShow] = useState(false);

  // Versão mais recente dos documentos
  const CURRENT_POLICY_VERSION = '1.0';
  const CURRENT_TERMS_VERSION = '1.0';

  useEffect(() => {
    const acceptedPolicyVersion = localStorage.getItem('accepted_policy_version');
    const acceptedTermsVersion = localStorage.getItem('accepted_terms_version');

    if (
      acceptedPolicyVersion !== CURRENT_POLICY_VERSION ||
      acceptedTermsVersion !== CURRENT_TERMS_VERSION
    ) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('accepted_policy_version', CURRENT_POLICY_VERSION);
    localStorage.setItem('accepted_terms_version', CURRENT_TERMS_VERSION);
    setShow(false);
  };

  if (!show) return null;

  return (
    <Banner>
      <CloseButton onClick={handleAccept}>×</CloseButton>
      <Text>
        ⚠️ Atualizamos nossa{' '}
        <Link to="/privacy" target="_blank">Política de Privacidade</Link>
        {' '}e{' '}
        <Link to="/terms" target="_blank">Termos de Uso</Link>.
        {' '}Por favor, revise as alterações.
      </Text>
    </Banner>
  );
}
```

---

## 9. CHECKLIST FINAL

Antes de ir para produção:

### Documentos Legais
- [ ] Política de Privacidade completa
- [ ] Termos de Uso completos
- [ ] Termo de Consentimento LGPD
- [ ] Todos com **dados reais da empresa** (CNPJ, endereço, etc.)

### Implementação Frontend
- [ ] Páginas `/privacy` e `/terms` funcionando
- [ ] Checkbox obrigatório no cadastro
- [ ] Links no rodapé de todas as páginas
- [ ] Modal de cookies na primeira visita
- [ ] Seção "Meus Dados" para exercício de direitos
- [ ] Banner de alterações (quando aplicável)

### Implementação Backend
- [ ] Tabela `consent_logs` criada
- [ ] RLS configurado
- [ ] Logs de consentimento sendo salvos
- [ ] Exportação de dados implementada
- [ ] Exclusão de conta implementada

### E-mails
- [ ] privacy@shafar.com.br configurado
- [ ] dpo@shafar.com.br configurado
- [ ] legal@shafar.com.br configurado
- [ ] Resposta automática configurada

### Compliance
- [ ] DPO nomeado (pode ser você ou terceirizado)
- [ ] Procedimento para responder solicitações LGPD
- [ ] Política de retenção de dados documentada
- [ ] Plano de resposta a incidentes de segurança

---

## 10. PRÓXIMOS PASSOS

Após implementação básica:

1. **Contratar advogado especializado em LGPD** para revisar documentos
2. **Nomear DPO oficial** (pode ser pessoa física ou jurídica)
3. **Fazer Relatório de Impacto (RIPD)** se coletar dados sensíveis
4. **Treinar equipe** sobre LGPD e privacidade
5. **Revisar contratos** com fornecedores (Supabase, Stripe, etc.)
6. **Implementar monitoramento** de acessos e logs
7. **Criar procedimento** de resposta a vazamentos
8. **Revisar anualmente** os documentos legais

---

## 11. RECURSOS ÚTEIS

- **ANPD**: https://www.gov.br/anpd/pt-br
- **Guia LGPD para Startups**: https://www.gov.br/anpd/pt-br/documentos-e-publicacoes
- **Modelo de RIPD**: Disponível no site da ANPD
- **Consultor LGPD**: Considere contratar se tiver dúvidas

---

**IMPORTANTE**: Este guia fornece orientações técnicas de implementação. Para garantir compliance total, **consulte um advogado especializado em LGPD** antes de lançar em produção.

---

© 2025 Shafar
