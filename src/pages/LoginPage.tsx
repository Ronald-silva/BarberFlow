import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// ============================================================
// SHAFAR LoginPage v2.0 — Premium Dark, Mobile-First
// ============================================================

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0D0D0D;
  padding: 1.25rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(200, 146, 42, 0.06) 1px, transparent 1px);
    background-size: 36px 36px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(200, 146, 42, 0.05) 0%, transparent 65%);
    pointer-events: none;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: #141414;
  border: 1px solid #1E1E1E;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.7);
  animation: fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.96) translateY(12px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
`;

const CardTop = styled.div`
  padding: 2.5rem 2rem 2rem;
  background: linear-gradient(180deg, #1A1A1A 0%, #141414 100%);
  border-bottom: 1px solid #1E1E1E;
  text-align: center;
`;

const LogoMark = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #C8922A 0%, #E8B84B 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1.25rem;
  box-shadow: 0 8px 24px rgba(200, 146, 42, 0.35);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LogoText = styled.div`
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #C8922A 0%, #F5D78E 50%, #C8922A 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 5s linear infinite;
  margin-bottom: 0.375rem;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6B6B6B;
  font-weight: 400;
`;

const Form = styled.form`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #ABABAB;
  letter-spacing: 0.01em;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: #0D0D0D;
  border: 1px solid #2A2A2A;
  border-radius: 12px;
  color: #F5F5F5;
  font-size: 0.9375rem;
  font-weight: 400;
  font-family: "Inter", sans-serif;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  min-height: 52px;

  &::placeholder { color: #3D3D3D; }

  &:focus {
    border-color: rgba(200, 146, 42, 0.6);
    box-shadow: 0 0 0 3px rgba(200, 146, 42, 0.1);
    background: #0F0F0F;
  }

  &:hover:not(:focus) {
    border-color: #363636;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  color: #EF4444;
  line-height: 1.5;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #1E1E1E;
  }

  span {
    font-size: 0.75rem;
    color: #3D3D3D;
    white-space: nowrap;
  }
`;

const RegisterLink = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: none;
  border: 1px solid #1E1E1E;
  border-radius: 12px;
  color: #6B6B6B;
  font-size: 0.875rem;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  transition: all 150ms ease;
  min-height: 48px;

  strong { color: #ABABAB; font-weight: 600; }

  &:hover {
    border-color: #2A2A2A;
    background: #1A1A1A;
    color: #ABABAB;
  }
`;

const CardBottom = styled.div`
  padding: 1.25rem 2rem 2rem;
  border-top: 1px solid #1A1A1A;
`;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let timeoutId: number | undefined;

    try {
      const loginWithGuard = Promise.race<boolean>([
        login(email, password),
        new Promise<boolean>((_, reject) => {
          timeoutId = window.setTimeout(
            () => reject(new Error('Tempo de conexão esgotado. Verifique sua internet e tente novamente.')),
            20000
          );
        }),
      ]);

      const success = await loginWithGuard;
      if (success) {
        const userData = JSON.parse(localStorage.getItem('shafar_user') || '{}');
        if (userData.role === 'platform_admin') {
          navigate('/platform');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Email ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err: any) {
      const message = String(err?.message || '');
      if (message.toLowerCase().includes('invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique suas credenciais.');
      } else {
        setError(message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <CardTop>
          <LogoMark>
            <img src="/logo.png" alt="Shafar" />
          </LogoMark>
          <LogoText>Shafar</LogoText>
          <Subtitle>Acesse seu painel de gestão</Subtitle>
        </CardTop>

        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="email">Email</Label>
              <InputWrapper>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </InputWrapper>
            </Field>

            <Field>
              <Label htmlFor="password">Senha</Label>
              <InputWrapper>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </InputWrapper>
            </Field>
          </FieldGroup>

          {error && (
            <ErrorAlert>
              <span>⚠️</span>
              <span>{error}</span>
            </ErrorAlert>
          )}

          <Button
            type="submit"
            $size="lg"
            $fullWidth
            disabled={loading}
            $loading={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>

        <CardBottom>
          <Divider><span>Não tem conta?</span></Divider>
          <RegisterLink
            type="button"
            onClick={() => navigate('/register')}
            style={{ marginTop: '1rem' }}
          >
            <strong>Cadastrar nova barbearia</strong> →
          </RegisterLink>
        </CardBottom>
      </Card>
    </Page>
  );
};

export default LoginPage;
