import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[8]};
  min-height: 100vh;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[8]};
  padding-bottom: ${props => props.theme.spacing[6]};
  border-bottom: 2px solid ${props => props.theme.colors.primary.main};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSizes['3xl']};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing[4]};
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSizes.base};
`;

const LastUpdated = styled.p`
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  margin-top: ${props => props.theme.spacing[2]};
`;

const Content = styled.div`
  line-height: 1.8;
  color: ${props => props.theme.colors.text.primary};

  h2 {
    font-size: ${props => props.theme.typography.fontSizes['2xl']};
    margin-top: ${props => props.theme.spacing[8]};
    margin-bottom: ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.primary.main};
    font-weight: 600;
    border-bottom: 1px solid ${props => props.theme.colors.border.main};
    padding-bottom: ${props => props.theme.spacing[2]};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSizes.xl};
    margin-top: ${props => props.theme.spacing[6]};
    margin-bottom: ${props => props.theme.spacing[3]};
    font-weight: 600;
  }

  h4 {
    font-size: ${props => props.theme.typography.fontSizes.lg};
    margin-top: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[2]};
    font-weight: 600;
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
    font-size: ${props => props.theme.typography.fontSizes.sm};
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

  strong {
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
  }

  a {
    color: ${props => props.theme.colors.primary.main};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  hr {
    border: none;
    border-top: 1px solid ${props => props.theme.colors.border.main};
    margin: ${props => props.theme.spacing[6]} 0;
  }
`;

const BackButton = styled.button`
  margin-top: ${props => props.theme.spacing[8]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  cursor: pointer;
  font-size: ${props => props.theme.typography.fontSizes.base};
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.theme.colors.primary.dark};
  }
`;

const WarningBox = styled.div`
  background: ${props => props.theme.colors.warning.light || '#FFF3CD'};
  border-left: 4px solid ${props => props.theme.colors.warning.main || '#FFC107'};
  padding: ${props => props.theme.spacing[4]};
  margin: ${props => props.theme.spacing[6]} 0;
  border-radius: ${props => props.theme.radii.md};
`;

const InfoBox = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
  padding: ${props => props.theme.spacing[4]};
  margin: ${props => props.theme.spacing[6]} 0;
  border-radius: ${props => props.theme.radii.md};
`;

const NoMarginParagraph = styled.p`
  margin-bottom: 0;
`;

const TightList = styled.ul`
  margin-bottom: 0;
`;

const FinalNote = styled.p`
  text-align: center;
  margin-top: ${props => props.theme.spacing[12]};
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: #999;
`;

const FinalNoteCompact = styled(FinalNote)`
  margin-top: ${props => props.theme.spacing[2]};
`;

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <Title>Termos de Uso</Title>
        <Subtitle>
          Regras e condições para utilização da plataforma Shafar
        </Subtitle>
        <LastUpdated>Última atualização: 30 de dezembro de 2025 | Versão 1.0</LastUpdated>
      </Header>

      <Content>
        <h2>1. ACEITAÇÃO DOS TERMOS</h2>
        <WarningBox>
          <NoMarginParagraph>
            <strong>Atenção:</strong> Ao se cadastrar, acessar ou utilizar a Plataforma Shafar,
            você declara ter lido e concordado com todos os termos deste documento. Se você{' '}
            <strong>não concordar</strong>, não utilize a Plataforma.
          </NoMarginParagraph>
        </WarningBox>

        <p>
          Estes Termos de Uso ("<strong>Termos</strong>") constituem um acordo legal entre você
          ("<strong>Usuário</strong>") e o <strong>Shafar</strong>.
        </p>

        <hr />

        <h2>2. INFORMAÇÕES DA EMPRESA</h2>
        <InfoBox>
          <p><strong>Razão Social:</strong> [INSERIR RAZÃO SOCIAL DA EMPRESA]</p>
          <p><strong>Nome Fantasia:</strong> Shafar</p>
          <p><strong>CNPJ:</strong> [INSERIR CNPJ]</p>
          <p><strong>Endereço:</strong> [INSERIR ENDEREÇO COMPLETO]</p>
          <p><strong>E-mail:</strong> contato@shafar.com.br</p>
          <p><strong>Telefone:</strong> [INSERIR TELEFONE]</p>
          <NoMarginParagraph><strong>Website:</strong> https://shafar.com.br</NoMarginParagraph>
        </InfoBox>

        <hr />

        <h2>3. DESCRIÇÃO DO SERVIÇO</h2>

        <h3>3.1. O que é o Shafar</h3>
        <p>
          O Shafar é uma <strong>plataforma SaaS (Software as a Service)</strong> que oferece
          ferramentas de gestão para barbearias, incluindo:
        </p>

        <ul>
          <li>Agendamento online de serviços</li>
          <li>Gestão de profissionais (barbeiros e equipe)</li>
          <li>Cadastro de serviços e preços</li>
          <li>Gestão de clientes e histórico</li>
          <li>Calendário de agendamentos</li>
          <li>Notificações automáticas</li>
          <li>Relatórios e estatísticas</li>
          <li>Página personalizada da barbearia</li>
        </ul>

        <h3>3.2. Modelo de Negócio</h3>
        <p>O Shafar opera no modelo <strong>SaaS por assinatura</strong>:</p>

        <ul>
          <li>Assinatura mensal ou anual para uso da Plataforma</li>
          <li>Diferentes planos com limites de profissionais e recursos</li>
          <li>Pagamento via cartão de crédito (processado pelo Stripe)</li>
          <li>Cobrança recorrente automática</li>
        </ul>

        <h3>3.3. Disponibilidade</h3>
        <p>
          Nos esforçamos para manter a Plataforma disponível <strong>24 horas por dia, 7 dias por
          semana</strong>.
        </p>

        <p>
          Porém, <strong>não garantimos</strong> disponibilidade ininterrupta devido a manutenções,
          atualizações ou problemas técnicos imprevistos.
        </p>

        <p><strong>Meta de disponibilidade:</strong> 99,5% ao mês (uptime)</p>

        <hr />

        <h2>4. CADASTRO E CONTA</h2>

        <h3>4.1. Requisitos de Cadastro</h3>
        <p>Para utilizar a Plataforma, você deve:</p>

        <ul>
          <li>Ser <strong>maior de 18 anos</strong></li>
          <li>Possuir <strong>CNPJ ativo</strong> (pessoa jurídica) ou CPF (pessoa física MEI)</li>
          <li>Fornecer <strong>e-mail válido</strong> e verificável</li>
          <li>Criar <strong>senha segura</strong> (mínimo 6 caracteres)</li>
          <li>Ter <strong>autorização</strong> para representar a barbearia</li>
        </ul>

        <h3>4.2. Responsabilidade pela Conta</h3>
        <WarningBox>
          <p><strong>Você é totalmente responsável por:</strong></p>
          <TightList>
            <li>Manter sigilo de sua senha</li>
            <li>Todas as atividades realizadas em sua conta</li>
            <li>Notificar imediatamente qualquer uso não autorizado</li>
            <li>Não compartilhar sua conta com terceiros</li>
          </TightList>
        </WarningBox>

        <p>
          <strong>IMPORTANTE:</strong> Não nos responsabilizamos por perdas ou danos decorrentes do
          uso não autorizado de sua conta.
        </p>

        <h3>4.3. Veracidade das Informações</h3>
        <p>
          Você declara que <strong>todas as informações fornecidas são verdadeiras, precisas e
          atualizadas</strong>.
        </p>

        <p>Informações falsas ou fraudulentas podem resultar em:</p>
        <ul>
          <li>Suspensão imediata da conta</li>
          <li>Cancelamento do serviço sem reembolso</li>
          <li>Responsabilização civil e criminal</li>
        </ul>

        <hr />

        <h2>5. PLANOS E PAGAMENTOS</h2>

        <h3>5.1. Planos Disponíveis</h3>

        <table>
          <thead>
            <tr>
              <th>Plano</th>
              <th>Preço</th>
              <th>Profissionais</th>
              <th>Recursos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Básico</strong></td>
              <td>R$ 79,00/mês</td>
              <td>Até 2</td>
              <td>Agendamentos ilimitados, Notificações WhatsApp, Suporte por e-mail</td>
            </tr>
            <tr>
              <td><strong>Pro</strong></td>
              <td>R$ 149,00/mês</td>
              <td>Até 5</td>
              <td>Tudo do Básico + Notificações SMS, Relatórios avançados, Suporte prioritário</td>
            </tr>
            <tr>
              <td><strong>Enterprise</strong></td>
              <td>R$ 299,00/mês</td>
              <td>Ilimitados</td>
              <td>Tudo do Pro + Relatórios personalizados, Suporte 24/7, API dedicada</td>
            </tr>
          </tbody>
        </table>

        <p><strong>Obs:</strong> Preços sujeitos a alteração mediante aviso prévio de 30 dias.</p>

        <h3>5.2. Período de Teste (Trial)</h3>
        <InfoBox>
          <p><strong>Oferecemos 14 dias de teste gratuito para novos usuários:</strong></p>
          <TightList>
            <li>Acesso completo a todas as funcionalidades</li>
            <li>Sem necessidade de cartão de crédito</li>
            <li>Sem compromisso de continuidade</li>
            <li>Após 14 dias, será necessário assinar um plano para continuar</li>
          </TightList>
        </InfoBox>

        <h3>5.3. Cobrança Recorrente</h3>
        <p>Ao assinar um plano, você autoriza:</p>

        <ul>
          <li><strong>Cobrança automática</strong> na periodicidade escolhida (mensal/anual)</li>
          <li><strong>Renovação automática</strong> ao final de cada período</li>
          <li><strong>Reajustes</strong> de preço conforme índices inflacionários (IPCA)</li>
        </ul>

        <h3>5.4. Cancelamento de Plano</h3>
        <p>Você pode cancelar sua assinatura a qualquer momento:</p>

        <ul>
          <li><strong>Cancelamento imediato:</strong> Acesso até o final do período pago</li>
          <li><strong>Sem multa ou taxa</strong> de cancelamento</li>
          <li><strong>Sem reembolso</strong> proporcional de período já pago</li>
          <li><strong>Dados excluídos</strong> após 30 dias do cancelamento</li>
        </ul>

        <h3>5.5. Reembolso</h3>
        <p>
          <strong>NÃO oferecemos reembolso</strong> exceto em caso de:
        </p>

        <ul>
          <li>Falha técnica grave que impeça uso da Plataforma por mais de 7 dias consecutivos</li>
          <li>Cobrança indevida (duplicada ou não autorizada)</li>
          <li>Determinação judicial</li>
        </ul>

        <hr />

        <h2>6. USO ACEITÁVEL DA PLATAFORMA</h2>

        <h3>6.1. Condutas Permitidas</h3>
        <p>Você pode utilizar a Plataforma para:</p>

        <ul>
          <li>Gerenciar agendamentos de sua barbearia</li>
          <li>Cadastrar profissionais e serviços</li>
          <li>Receber agendamentos de clientes</li>
          <li>Gerar relatórios de sua barbearia</li>
          <li>Personalizar página de agendamento</li>
        </ul>

        <h3>6.2. Condutas Proibidas</h3>
        <WarningBox>
          <p><strong>É estritamente proibido:</strong></p>
          <TightList>
            <li><strong>Uso fraudulento:</strong> Criar contas com dados falsos, usar cartões de terceiros</li>
            <li><strong>Violação de direitos:</strong> Infringir direitos autorais, marcas, patentes</li>
            <li><strong>Conteúdo ilegal:</strong> Publicar conteúdo ofensivo, discriminatório, pornográfico</li>
            <li><strong>Spam:</strong> Enviar mensagens não solicitadas em massa</li>
            <li><strong>Hacking:</strong> Tentar acessar sistemas ou dados de terceiros</li>
            <li><strong>Engenharia reversa:</strong> Descompilar ou fazer engenharia reversa do código</li>
            <li><strong>Revenda:</strong> Revender ou sublicenciar acesso à Plataforma</li>
            <li><strong>Compartilhamento de conta:</strong> Permitir acesso de terceiros não autorizados</li>
          </TightList>
        </WarningBox>

        <h3>6.3. Consequências de Violação</h3>
        <p>A violação destas regras pode resultar em:</p>

        <ul>
          <li>Advertência por e-mail</li>
          <li>Suspensão temporária da conta</li>
          <li>Cancelamento permanente sem reembolso</li>
          <li>Ação judicial por danos causados</li>
        </ul>

        <hr />

        <h2>7. LIMITAÇÃO DE RESPONSABILIDADE</h2>

        <h3>7.1. Uso por Sua Conta e Risco</h3>
        <p>
          Você utiliza a Plataforma <strong>por sua própria conta e risco</strong>.
        </p>

        <p>Não garantimos que a Plataforma:</p>
        <ul>
          <li>Será livre de erros ou bugs</li>
          <li>Funcionará ininterruptamente</li>
          <li>Atenderá suas expectativas específicas</li>
          <li>Será compatível com todos os dispositivos</li>
        </ul>

        <h3>7.2. Exclusão de Responsabilidade</h3>
        <p><strong>NÃO nos responsabilizamos por:</strong></p>

        <ul>
          <li><strong>Perda de dados:</strong> Recomendamos fazer backups regulares</li>
          <li><strong>Lucros cessantes:</strong> Perdas de receita ou oportunidades</li>
          <li><strong>Danos indiretos:</strong> Danos consequenciais ou punitivos</li>
          <li><strong>Erros de terceiros:</strong> Falhas de Stripe, Supabase, Vercel, etc.</li>
          <li><strong>Força maior:</strong> Desastres naturais, guerras, pandemias</li>
          <li><strong>Uso indevido:</strong> Consequências de violação destes Termos</li>
        </ul>

        <h3>7.3. Limite de Indenização</h3>
        <p>
          Em caso de responsabilização, nossa obrigação será limitada ao{' '}
          <strong>valor pago por você nos últimos 3 meses</strong> de assinatura.
        </p>

        <hr />

        <h2>8. PROPRIEDADE INTELECTUAL</h2>

        <h3>8.1. Propriedade do Shafar</h3>
        <p><strong>Nós</strong> somos proprietários exclusivos de:</p>

        <ul>
          <li>Código-fonte da Plataforma</li>
          <li>Design, layout e interface</li>
          <li>Marca "Shafar" e logo</li>
          <li>Documentação e conteúdo produzido por nós</li>
          <li>Algoritmos e funcionalidades</li>
        </ul>

        <p>
          <strong>Todos os direitos reservados.</strong> A Plataforma é protegida por leis de
          direitos autorais e propriedade intelectual.
        </p>

        <h3>8.2. Conteúdo do Usuário</h3>
        <p><strong>Você</strong> é proprietário do conteúdo que publica na Plataforma:</p>

        <ul>
          <li>Dados da barbearia</li>
          <li>Logos e imagens</li>
          <li>Descrições de serviços</li>
          <li>Informações de clientes</li>
        </ul>

        <p>
          Ao publicar conteúdo, você nos concede uma <strong>licença mundial, não exclusiva, livre de
          royalties</strong> para armazenar e processar seu conteúdo.
        </p>

        <hr />

        <h2>9. RESCISÃO</h2>

        <h3>9.1. Rescisão pelo Usuário</h3>
        <p>Você pode cancelar sua conta a qualquer momento através das configurações da conta.</p>

        <h3>9.2. Rescisão pelo Shafar</h3>
        <p>
          Podemos <strong>suspender ou cancelar sua conta imediatamente</strong>, sem aviso prévio,
          em caso de:
        </p>

        <ul>
          <li>Violação destes Termos</li>
          <li>Atividade fraudulenta</li>
          <li>Inadimplência superior a 30 dias</li>
          <li>Ordem judicial ou de autoridade competente</li>
          <li>Risco à segurança da Plataforma</li>
        </ul>

        <h3>9.3. Efeitos da Rescisão</h3>
        <p>Após a rescisão:</p>

        <ul>
          <li>Acesso à Plataforma será <strong>imediatamente bloqueado</strong></li>
          <li>Dados serão <strong>mantidos por 30 dias</strong> (para possível recuperação)</li>
          <li>Após 30 dias, dados serão <strong>excluídos permanentemente</strong></li>
          <li>Valores pagos <strong>não serão reembolsados</strong></li>
        </ul>

        <WarningBox>
          <NoMarginParagraph>
            <strong>Importante:</strong> Exporte seus dados antes de cancelar a conta!
          </NoMarginParagraph>
        </WarningBox>

        <hr />

        <h2>10. LEGISLAÇÃO E FORO</h2>

        <h3>10.1. Lei Aplicável</h3>
        <p>Estes Termos são regidos pelas leis da <strong>República Federativa do Brasil</strong>:</p>

        <ul>
          <li>Lei nº 13.709/2018 (LGPD)</li>
          <li>Lei nº 12.965/2014 (Marco Civil da Internet)</li>
          <li>Lei nº 8.078/1990 (Código de Defesa do Consumidor)</li>
          <li>Código Civil Brasileiro</li>
        </ul>

        <h3>10.2. Foro</h3>
        <p>
          Fica eleito o foro da comarca de <strong>[INSERIR CIDADE]</strong> para dirimir quaisquer
          questões oriundas destes Termos.
        </p>

        <hr />

        <h2>11. CONTATO</h2>
        <InfoBox>
          <p>Para questões relacionadas a estes Termos de Uso:</p>
          <p><strong>E-mail:</strong> contato@shafar.com.br</p>
          <p><strong>E-mail jurídico:</strong> legal@shafar.com.br</p>
          <p><strong>Telefone:</strong> [INSERIR TELEFONE]</p>
          <p><strong>Endereço:</strong> [INSERIR ENDEREÇO COMPLETO]</p>
          <NoMarginParagraph><strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h</NoMarginParagraph>
        </InfoBox>

        <hr />

        <h2>12. CONSENTIMENTO</h2>
        <WarningBox>
          <p><strong>Ao clicar em "Aceitar Termos" ou utilizar a Plataforma, você declara que:</strong></p>
          <TightList>
            <li>Leu e compreendeu integralmente estes Termos de Uso</li>
            <li>Leu e compreendeu a Política de Privacidade</li>
            <li>Concorda com todas as disposições aqui previstas</li>
            <li>Tem capacidade legal para contratar</li>
            <li>Forneceu informações verdadeiras e precisas</li>
            <li>Compromete-se a utilizar a Plataforma de forma responsável e legal</li>
          </TightList>
        </WarningBox>

        <hr />

        <FinalNote>
          <strong>Última atualização: 30 de dezembro de 2025 | Versão 1.0</strong>
        </FinalNote>

        <FinalNoteCompact>
          © 2025 Shafar. Todos os direitos reservados.
        </FinalNoteCompact>
      </Content>

      <BackButton onClick={() => navigate(-1)}>
        ← Voltar
      </BackButton>
    </Container>
  );
}
