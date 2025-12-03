
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.primary} 0%, ${props => props.theme.colors.background.secondary} 100%);
  padding: ${props => props.theme.spacing[4]};
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.radii['2xl']};
  box-shadow: ${props => props.theme.shadows['2xl']};
  border: 1px solid ${props => props.theme.colors.border.primary};
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
`;

const LoginHeader = styled.div`
  padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[8]} ${props => props.theme.spacing[6]};
  text-align: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
`;

const Logo = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['4xl']};
  font-weight: ${props => props.theme.typography.fontWeights.extrabold};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${props => props.theme.spacing[2]};
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
`;

const LoginForm = styled.form`
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[8]} ${props => props.theme.spacing[8]};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[6]};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const InputField = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[4]};
  background-color: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.radii.lg};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: ${props => props.theme.transitions.base};
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  &:focus {
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.interactive.focus};
    background-color: ${props => props.theme.colors.background.tertiary};
  }
  
  &:hover:not(:focus) {
    border-color: ${props => props.theme.colors.border.secondary};
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  text-align: center;
  padding: ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.colors.errorLight};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.error}40;
`;

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('admin@barber.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const success = await login(email, password);
            if (success) {
                // Redirecionar baseado no tipo de usuário
                const userData = JSON.parse(localStorage.getItem('barberflow_user') || '{}');
                if (userData.role === 'platform_admin') {
                    navigate('/platform');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError('Credenciais inválidas. Verifique seu email e senha.');
            }
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginContainer>
            <LoginCard className="fade-in">
                <LoginHeader>
                    <Logo>BarberFlow</Logo>
                    <Subtitle>Acesse seu painel administrativo</Subtitle>
                </LoginHeader>
                
                <LoginForm onSubmit={handleSubmit}>
                    <InputGroup>
                        <InputField>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                disabled={loading}
                            />
                        </InputField>
                        
                        <InputField>
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </InputField>
                    </InputGroup>
                    
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    
                    <Button
                        type="submit"
                        $variant="primary"
                        $size="lg"
                        $fullWidth
                        disabled={loading}
                        $loading={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </LoginForm>
                
                <div style={{ 
                    padding: '0 2rem 2rem', 
                    textAlign: 'center',
                    borderTop: '1px solid #374151',
                    marginTop: '1rem',
                    paddingTop: '1.5rem'
                }}>
                    <p style={{ 
                        color: '#9CA3AF', 
                        fontSize: '0.875rem',
                        marginBottom: '1rem'
                    }}>
                        Ainda não tem uma barbearia cadastrada?
                    </p>
                    <Button
                        $variant="outline"
                        $size="md"
                        onClick={() => navigate('/register')}
                        style={{ width: '100%' }}
                    >
                        Cadastrar Nova Barbearia
                    </Button>
                </div>
            </LoginCard>
        </LoginContainer>
    );
};

export default LoginPage;
