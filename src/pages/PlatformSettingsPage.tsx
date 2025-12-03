import React, { useState } from 'react';
import styled from 'styled-components';
import { PageContainer, Card, CardContent, Heading, Text } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Input, Label, FormGroup } from '../components/ui/Input';

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

const PlatformSettingsPage: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoRenew, setAutoRenew] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <PageContainer className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <Heading $level={1} $gradient>
          Configurações da Plataforma ⚙️
        </Heading>
        <Text $color="secondary" style={{ marginTop: '0.5rem' }}>
          Gerencie configurações globais da plataforma BarberFlow
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
                <Label htmlFor="platform-name">Nome da Plataforma</Label>
                <Input
                  id="platform-name"
                  type="text"
                  defaultValue="BarberFlow"
                  placeholder="Nome da plataforma"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="platform-email">Email de Contato</Label>
                <Input
                  id="platform-email"
                  type="email"
                  defaultValue="contato@barberflow.com"
                  placeholder="Email de contato"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="support-email">Email de Suporte</Label>
                <Input
                  id="support-email"
                  type="email"
                  defaultValue="suporte@barberflow.com"
                  placeholder="Email de suporte"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue="+55 11 99999-9999"
                  placeholder="Telefone de contato"
                />
              </FormGroup>
            </SettingsGrid>

            <div style={{ marginTop: '1.5rem' }}>
              <Button $variant="primary">Salvar Informações</Button>
            </div>
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
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
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
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
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
                    defaultValue="14"
                    min="0"
                    max="90"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="grace-period">Período de Graça (dias)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    defaultValue="3"
                    min="0"
                    max="30"
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
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
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
