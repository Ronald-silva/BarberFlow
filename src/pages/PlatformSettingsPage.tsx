import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { PageContainer, Card, CardContent, Heading, Text } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Input, Label, FormGroup } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabaseApi as api } from '../services/supabaseApi';

const SettingsSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  padding-bottom: ${props => props.theme.spacing[3]};
  border-bottom: 1px solid ${props => props.theme.colors.border.primary};
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.theme.colors.background.tertiary};
    transition: ${props => props.theme.transitions.base};
    border-radius: ${props => props.theme.radii.full};

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: ${props => props.theme.transitions.base};
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${props => props.theme.colors.primary};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing[3]};
  background: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
`;

const SettingInfo = styled.div`
  flex: 1;
  margin-right: ${props => props.theme.spacing[4]};
`;

const SettingTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[1]};
`;

const SettingDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
`;

const DangerZone = styled(Card)`
  border: 2px solid ${props => props.theme.colors.error};
  background: ${props => props.theme.colors.errorLight}10;
`;

const STORAGE_KEY = 'shafar_platform_settings';

interface PlatformLocalSettings {
  platformName: string;
  supportEmail: string;
  phone: string;
  emailNotifications: boolean;
  autoRenew: boolean;
  maintenanceMode: boolean;
  trialDays: number;
  gracePeriod: number;
}

const PlatformSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToastContext();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [platformAdminName, setPlatformAdminName] = useState('');
  const [settings, setSettings] = useState<PlatformLocalSettings>({
    platformName: 'Shafar',
    supportEmail: 'suporte@shafar.com',
    phone: '+55 11 99999-9999',
    emailNotifications: true,
    autoRenew: true,
    maintenanceMode: false,
    trialDays: 14,
    gracePeriod: 3,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<PlatformLocalSettings>;
        setSettings((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (error) {
        console.error('Erro ao carregar configurações locais da plataforma:', error);
      }
    }

    if (user) {
      setPlatformAdminName(user.name);
    }
    setLoading(false);
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const success = await api.updateCurrentUserProfile(user.id, { name: platformAdminName.trim() });
      if (!success) {
        throw new Error('Falha ao atualizar perfil');
      }
      toast.success('Perfil do administrador atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveLocalSettings = () => {
    setSavingSettings(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success('Configurações operacionais salvas localmente.');
    } catch (error) {
      console.error('Erro ao salvar configurações locais:', error);
      toast.error('Não foi possível salvar as configurações locais.');
    } finally {
      setSavingSettings(false);
    }
  };

  const reloadLocalSettings = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        toast.info('Nenhuma configuração local salva para recarregar.');
        return;
      }
      const parsed = JSON.parse(stored) as Partial<PlatformLocalSettings>;
      setSettings((prev) => ({ ...prev, ...parsed }));
      toast.success('Configurações locais recarregadas.');
    } catch (error) {
      console.error('Erro ao recarregar configurações locais:', error);
      toast.error('Falha ao recarregar configurações locais.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Text>Carregando configurações da plataforma...</Text>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <Heading $level={1} $gradient>
          Configurações da Plataforma ⚙️
        </Heading>
        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
          Gerencie configurações globais da plataforma Shafar
        </Text>
      </div>

      <Card $variant="elevated" style={{ marginBottom: '1.5rem' }}>
        <CardContent>
          <SettingsSection>
            <SectionHeader>
              <Heading $level={3} $color="primary">
                Informações da Plataforma
              </Heading>
              <Text $size="sm" $color="tertiary">
                Dados básicos sobre sua plataforma SaaS
              </Text>
            </SectionHeader>

            <SettingsGrid>
              <FormGroup>
                <Label htmlFor="platform-name">Nome da Plataforma (Local)</Label>
                <Input
                  id="platform-name"
                  type="text"
                  value={settings.platformName}
                  placeholder="Nome da plataforma"
                  onChange={(e) => setSettings((prev) => ({ ...prev, platformName: e.target.value }))}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="platform-admin-name">Nome do Administrador</Label>
                <Input
                  id="platform-admin-name"
                  type="text"
                  value={platformAdminName}
                  placeholder="Nome do administrador"
                  onChange={(e) => setPlatformAdminName(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="platform-email">Email do Administrador</Label>
                <Input
                  id="platform-email"
                  type="email"
                  value={user?.email || ''}
                  placeholder="Email de contato"
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="support-email">Email de Suporte (Local)</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={settings.supportEmail}
                  placeholder="Email de suporte"
                  onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  placeholder="Telefone de contato"
                  onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </FormGroup>
            </SettingsGrid>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button $variant="primary" onClick={saveProfile} disabled={savingProfile || !platformAdminName.trim()}>
                {savingProfile ? 'Salvando perfil...' : 'Salvar Perfil do Admin'}
              </Button>
              <Button $variant="secondary" onClick={saveLocalSettings} disabled={savingSettings}>
                {savingSettings ? 'Salvando...' : 'Salvar Configurações Locais'}
              </Button>
              <Button $variant="secondary" onClick={reloadLocalSettings}>
                Recarregar Configurações Locais
              </Button>
            </div>
            <Text $size="sm" $color="tertiary" style={{ marginTop: '0.75rem' }}>
              Campos marcados como local são salvos somente neste navegador/ambiente.
            </Text>
          </SettingsSection>

          <SettingsSection>
            <SectionHeader>
              <Heading $level={3} $color="primary">
                Notificações
              </Heading>
              <Text $size="sm" $color="tertiary">
                Configure como você recebe notificações da plataforma
              </Text>
            </SectionHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SettingItem>
                <SettingInfo>
                  <SettingTitle>Notificações por Email</SettingTitle>
                  <SettingDescription>
                    Receba emails sobre novos cadastros, cancelamentos e problemas
                  </SettingDescription>
                </SettingInfo>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingItem>
            </div>
          </SettingsSection>

          <SettingsSection>
            <SectionHeader>
              <Heading $level={3} $color="primary">
                Assinaturas
              </Heading>
              <Text $size="sm" $color="tertiary">
                Configure o comportamento de assinaturas
              </Text>
            </SectionHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SettingItem>
                <SettingInfo>
                  <SettingTitle>Renovação Automática</SettingTitle>
                  <SettingDescription>
                    Renovar automaticamente assinaturas ao final do período
                  </SettingDescription>
                </SettingInfo>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={settings.autoRenew}
                    onChange={(e) => setSettings((prev) => ({ ...prev, autoRenew: e.target.checked }))}
                  />
                  <span></span>
                </ToggleSwitch>
              </SettingItem>

              <SettingsGrid style={{ marginTop: '1rem' }}>
                <FormGroup>
                  <Label htmlFor="trial-days">Dias de Trial Gratuito</Label>
                  <Input
                    id="trial-days"
                    type="number"
                    value={settings.trialDays}
                    min="0"
                    max="90"
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, trialDays: Number(e.target.value || 0) }))
                    }
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="grace-period">Período de Graça (dias)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    value={settings.gracePeriod}
                    min="0"
                    max="30"
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, gracePeriod: Number(e.target.value || 0) }))
                    }
                  />
                </FormGroup>
              </SettingsGrid>
            </div>
          </SettingsSection>

          <SettingsSection>
            <SectionHeader>
              <Heading $level={3} $color="primary">
                Manutenção
              </Heading>
              <Text $size="sm" $color="tertiary">
                Controle de manutenção da plataforma
              </Text>
            </SectionHeader>

            <SettingItem>
              <SettingInfo>
                <SettingTitle>Modo de Manutenção</SettingTitle>
                <SettingDescription>
                  Ativar página de manutenção para todos os usuários
                </SettingDescription>
              </SettingInfo>
              <ToggleSwitch>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
                />
                <span></span>
              </ToggleSwitch>
            </SettingItem>
          </SettingsSection>
        </CardContent>
      </Card>

      <DangerZone>
        <CardContent>
          <Heading $level={3} style={{ color: 'var(--error)', marginBottom: '1rem' }}>
            ⚠️ Zona de Perigo
          </Heading>
          <Text $color="secondary" style={{ marginBottom: '1.5rem' }}>
            Ações irreversíveis que afetam toda a plataforma
          </Text>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button $variant="secondary" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
              Resetar Todas as Estatísticas
            </Button>
            <Button $variant="secondary" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
              Exportar Todos os Dados
            </Button>
          </div>
        </CardContent>
      </DangerZone>

      <Card $variant="elevated" style={{ marginTop: '1.5rem' }}>
        <CardContent>
          <Heading $level={3} $color="primary" style={{ marginBottom: '1rem' }}>
            🚀 Próximas Implementações
          </Heading>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
            <li>Integração com gateway de pagamento (Stripe/Mercado Pago)</li>
            <li>Configuração de emails transacionais (SMTP/SendGrid)</li>
            <li>Webhooks para integrações externas</li>
            <li>Logs de auditoria de alterações</li>
            <li>Backups automáticos configuráveis</li>
            <li>Gerenciamento de API keys</li>
          </ul>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default PlatformSettingsPage;
