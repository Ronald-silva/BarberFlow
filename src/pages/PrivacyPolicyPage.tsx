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

const ContactBox = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-left: 4px solid ${props => props.theme.colors.primary.main};
  padding: ${props => props.theme.spacing[4]};
  margin: ${props => props.theme.spacing[6]} 0;
  border-radius: ${props => props.theme.radii.md};
`;

const FinalNote = styled.p`
  text-align: center;
  margin-top: ${props => props.theme.spacing[12]};
  color: #666;
`;

const CopyrightNote = styled.p`
  text-align: center;
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: #999;
`;

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <Header>
        <Title>Política de Privacidade</Title>
        <Subtitle>
          Saiba como protegemos seus dados pessoais em conformidade com a LGPD
        </Subtitle>
        <LastUpdated>Última atualização: 30 de dezembro de 2025 | Versão 1.0</LastUpdated>
      </Header>

      <Content>
        <h2>1. INFORMAÇÕES GERAIS</h2>
        <p>
          A presente Política de Privacidade ("<strong>Política</strong>") descreve como o{' '}
          <strong>Shafar</strong> ("<strong>nós</strong>", "<strong>nosso</strong>" ou{' '}
          "<strong>Plataforma</strong>"), coleta, usa, armazena, trata e protege os dados pessoais
          dos usuários ("<strong>você</strong>" ou "<strong>Usuário</strong>") em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
        </p>

        <h3>1.1. Controlador de Dados</h3>
        <ContactBox>
          <p><strong>Razão Social:</strong> Shafar Tecnologia</p>
          <p><strong>CNPJ:</strong> (A ser preenchido)</p>
          <p><strong>Endereço:</strong> (A ser preenchido)</p>
          <p><strong>E-mail de contato:</strong> privacy@shafar.com.br</p>
          <p><strong>DPO (Encarregado de Dados):</strong> (A ser preenchido)</p>
          <p><strong>E-mail do DPO:</strong> dpo@shafar.com.br</p>
        </ContactBox>

        <h3>1.2. Aceitação da Política</h3>
        <p>
          Ao se cadastrar e utilizar a Plataforma Shafar, você declara estar ciente e concordar
          integralmente com os termos desta Política de Privacidade.
        </p>
        <p>
          Se você <strong>não concordar</strong> com qualquer disposição desta Política,{' '}
          <strong>não utilize</strong> a Plataforma.
        </p>

        <hr />

        <h2>2. QUAIS DADOS COLETAMOS</h2>

        <h3>2.1. Dados Coletados de Administradores de Barbearias</h3>
        <p>Quando você se cadastra como <strong>administrador de uma barbearia</strong>, coletamos:</p>

        <h4>Dados de Identificação:</h4>
        <ul>
          <li>Nome completo</li>
          <li>E-mail de login</li>
          <li>Senha (armazenada com criptografia)</li>
        </ul>

        <h4>Dados da Barbearia:</h4>
        <ul>
          <li>Nome da barbearia</li>
          <li>Endereço completo</li>
          <li>Telefone de contato</li>
          <li>E-mail comercial</li>
          <li>Logo (imagem - opcional)</li>
          <li>URL/slug personalizado</li>
        </ul>

        <h4>Dados de Pagamento:</h4>
        <ul>
          <li>Informações de faturamento (processadas pelo Stripe)</li>
          <li>Histórico de assinaturas e pagamentos</li>
        </ul>

        <h4>Dados de Uso:</h4>
        <ul>
          <li>Endereço IP</li>
          <li>Logs de acesso</li>
          <li>Horários de utilização</li>
          <li>Ações realizadas na plataforma</li>
          <li>Dispositivo e navegador utilizados</li>
        </ul>

        <h3>2.2. Dados que NÃO Coletamos</h3>
        <p>O Shafar <strong>NÃO coleta</strong>:</p>
        <ul>
          <li>
            Dados sensíveis (origem racial/étnica, opiniões políticas, religiosas, filiação sindical,
            dados genéticos, biométricos, saúde, vida sexual)
          </li>
          <li>Dados de crianças e adolescentes menores de 18 anos</li>
          <li>Dados de cartão de crédito (processados diretamente pelo Stripe)</li>
        </ul>

        <hr />

        <h2>3. COMO USAMOS SEUS DADOS</h2>

        <h3>3.1. Finalidades do Tratamento</h3>
        <p>Seus dados pessoais são tratados para as seguintes finalidades:</p>

        <h4>a) Prestação do Serviço (Base Legal: Execução de Contrato)</h4>
        <ul>
          <li>Criar e gerenciar sua conta</li>
          <li>Permitir login e autenticação</li>
          <li>Processar agendamentos</li>
          <li>Enviar notificações sobre agendamentos</li>
          <li>Gerenciar profissionais e serviços</li>
          <li>Gerar relatórios e estatísticas</li>
        </ul>

        <h4>b) Cobrança e Pagamentos (Base Legal: Execução de Contrato)</h4>
        <ul>
          <li>Processar pagamentos de assinaturas</li>
          <li>Emitir faturas</li>
          <li>Prevenir fraudes</li>
          <li>Gerenciar inadimplência</li>
        </ul>

        <h4>c) Segurança (Base Legal: Obrigação Legal e Interesse Legítimo)</h4>
        <ul>
          <li>Prevenir fraudes e abusos</li>
          <li>Proteger a segurança da plataforma</li>
          <li>Detectar e prevenir ataques cibernéticos</li>
          <li>Cumprir obrigações legais</li>
        </ul>

        <h3>3.2. Compartilhamento de Dados</h3>
        <p>Seus dados podem ser compartilhados com:</p>

        <h4>a) Provedores de Serviço (Operadores):</h4>
        <ul>
          <li><strong>Supabase Inc.</strong> (hospedagem de banco de dados - EUA)</li>
          <li><strong>Vercel Inc.</strong> (hospedagem da aplicação - EUA)</li>
          <li><strong>Stripe Inc.</strong> (processamento de pagamentos - EUA)</li>
          <li><strong>SendGrid/Twilio</strong> (envio de e-mails - EUA)</li>
          <li><strong>Sentry</strong> (monitoramento de erros - EUA)</li>
        </ul>

        <p>
          <strong>Importante:</strong> Todos os provedores foram selecionados por adotarem medidas de
          segurança adequadas e estarem em conformidade com leis de proteção de dados.
        </p>

        <h4>b) Transferência Internacional de Dados</h4>
        <p>
          Seus dados podem ser transferidos e armazenados em servidores localizados nos{' '}
          <strong>Estados Unidos</strong> e em outros países.
        </p>
        <p>Garantimos que essas transferências são realizadas com base em:</p>
        <ul>
          <li>Cláusulas contratuais padrão aprovadas pela ANPD</li>
          <li>Adequação do país destinatário (Privacy Shield, adequacy decisions)</li>
          <li>Consentimento específico do titular</li>
        </ul>

        <h3>3.3. Retenção de Dados</h3>
        <p>Seus dados são mantidos pelo tempo necessário para as finalidades descritas:</p>

        <table>
          <thead>
            <tr>
              <th>Tipo de Dado</th>
              <th>Prazo de Retenção</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dados de cadastro (conta ativa)</td>
              <td>Enquanto a conta estiver ativa</td>
            </tr>
            <tr>
              <td>Dados de cadastro (conta inativa)</td>
              <td>6 meses após inatividade</td>
            </tr>
            <tr>
              <td>Histórico de agendamentos</td>
              <td>5 anos (fins contábeis/fiscais)</td>
            </tr>
            <tr>
              <td>Dados de pagamento</td>
              <td>5 anos (obrigação legal)</td>
            </tr>
            <tr>
              <td>Logs de acesso</td>
              <td>6 meses</td>
            </tr>
            <tr>
              <td>Dados anonimizados</td>
              <td>Indefinidamente</td>
            </tr>
          </tbody>
        </table>

        <p>
          Após o término desses prazos, os dados são <strong>excluídos permanentemente</strong> ou{' '}
          <strong>anonimizados</strong>.
        </p>

        <hr />

        <h2>4. SEUS DIREITOS (LGPD)</h2>
        <p>De acordo com a LGPD, você tem os seguintes direitos:</p>

        <h3>4.1. Direito de Confirmação e Acesso (Art. 18, I e II)</h3>
        <p>
          Você pode solicitar a confirmação da existência de tratamento de seus dados pessoais e ter
          acesso aos dados que mantemos sobre você.
        </p>

        <h3>4.2. Direito de Correção (Art. 18, III)</h3>
        <p>
          Você pode solicitar a correção de dados incompletos, inexatos ou desatualizados.
        </p>

        <h3>4.3. Direito de Anonimização, Bloqueio ou Eliminação (Art. 18, IV)</h3>
        <p>
          Você pode solicitar a anonimização, bloqueio ou eliminação de dados desnecessários,
          excessivos ou tratados em desconformidade com a LGPD.
        </p>

        <h3>4.4. Direito de Portabilidade (Art. 18, V)</h3>
        <p>
          Você pode solicitar a portabilidade de seus dados a outro fornecedor de serviço, mediante
          requisição expressa.
        </p>

        <h3>4.5. Direito de Eliminação (Art. 18, VI)</h3>
        <p>
          Você pode solicitar a eliminação de dados tratados com base em consentimento.
        </p>
        <p>
          <strong>Observação:</strong> Alguns dados não podem ser eliminados imediatamente devido a
          obrigações legais (ex: dados fiscais devem ser mantidos por 5 anos).
        </p>

        <h3>4.6. Direito de Revogação (Art. 18, IX)</h3>
        <p>
          Você pode revogar seu consentimento a qualquer momento.
        </p>

        <h3>4.7. Como Exercer Seus Direitos</h3>
        <ContactBox>
          <p>Para exercer qualquer um dos direitos acima, entre em contato conosco:</p>
          <p><strong>E-mail:</strong> privacy@shafar.com.br</p>
          <p><strong>E-mail do DPO:</strong> dpo@shafar.com.br</p>
          <p><strong>Assunto:</strong> "LGPD - Solicitação de [descrever o direito]"</p>
          <p><strong>Prazo de resposta:</strong> Responderemos em até <strong>15 dias úteis</strong>.</p>
        </ContactBox>

        <hr />

        <h2>5. SEGURANÇA DOS DADOS</h2>
        <p>
          Adotamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais
          contra acesso não autorizado, perda, destruição ou qualquer forma de tratamento inadequado.
        </p>

        <h3>5.1. Medidas Técnicas</h3>
        <ul>
          <li><strong>Criptografia:</strong> Todos os dados em trânsito são criptografados via HTTPS/TLS 1.3</li>
          <li><strong>Senhas:</strong> Armazenadas com hash bcrypt (não reversível)</li>
          <li><strong>Autenticação:</strong> Sistema de autenticação seguro (Supabase Auth)</li>
          <li><strong>Firewall:</strong> Proteção contra ataques DDoS e invasões</li>
          <li><strong>Backups:</strong> Backups automáticos diários</li>
          <li><strong>RLS (Row Level Security):</strong> Isolamento de dados entre barbearias</li>
          <li><strong>Monitoramento:</strong> Logs de acesso e auditoria</li>
        </ul>

        <h3>5.2. Notificação de Incidentes</h3>
        <p>
          Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares,
          notificaremos:
        </p>
        <ul>
          <li><strong>Você (titular):</strong> Em prazo razoável</li>
          <li><strong>ANPD (Autoridade Nacional):</strong> Conforme determina a LGPD</li>
        </ul>

        <hr />

        <h2>6. COOKIES E TECNOLOGIAS SIMILARES</h2>

        <h3>6.1. O que são Cookies</h3>
        <p>
          Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um
          site.
        </p>

        <h3>6.2. Tipos de Cookies Utilizados</h3>

        <h4>a) Cookies Essenciais (Estritamente Necessários)</h4>
        <ul>
          <li><strong>Finalidade:</strong> Permitir funcionamento básico da plataforma</li>
          <li><strong>Exemplo:</strong> Sessão de login, autenticação</li>
          <li><strong>Base legal:</strong> Interesse legítimo</li>
          <li><strong>Podem ser desabilitados?</strong> <strong>Não</strong> (sem eles, a plataforma não funciona)</li>
        </ul>

        <h4>b) Cookies de Desempenho</h4>
        <ul>
          <li><strong>Finalidade:</strong> Analisar uso da plataforma, identificar problemas</li>
          <li><strong>Base legal:</strong> Consentimento</li>
          <li><strong>Podem ser desabilitados?</strong> <strong>Sim</strong></li>
        </ul>

        <h3>6.3. Gerenciamento de Cookies</h3>
        <p>Você pode gerenciar cookies através das configurações do seu navegador.</p>

        <hr />

        <h2>7. ALTERAÇÕES NESTA POLÍTICA</h2>
        <p>
          Podemos atualizar esta Política periodicamente para refletir mudanças nas práticas de
          tratamento de dados, alterações na legislação ou novos recursos da plataforma.
        </p>

        <p>Quando houver alterações <strong>substanciais</strong>, notificaremos você através de:</p>
        <ul>
          <li>E-mail cadastrado</li>
          <li>Aviso na plataforma</li>
          <li>Pop-up ao fazer login</li>
        </ul>

        <hr />

        <h2>8. CONTATO</h2>
        <ContactBox>
          <p>Para questões relacionadas a esta Política de Privacidade ou ao tratamento de dados pessoais:</p>
          <p><strong>E-mail geral:</strong> privacy@shafar.com.br</p>
          <p><strong>DPO (Encarregado de Dados):</strong> dpo@shafar.com.br</p>
          <p><strong>Endereço:</strong> (A ser preenchido)</p>
          <p><strong>Telefone:</strong> (A ser preenchido)</p>
          <p><strong>Horário de atendimento:</strong> Segunda a sexta, das 9h às 18h (horário de Brasília)</p>
        </ContactBox>

        <h3>8.1. Autoridade Nacional de Proteção de Dados (ANPD)</h3>
        <p>
          Você também pode apresentar reclamações ou denúncias perante a Autoridade Nacional de
          Proteção de Dados:
        </p>
        <ContactBox>
          <p><strong>ANPD - Autoridade Nacional de Proteção de Dados</strong></p>
          <p><strong>Website:</strong> <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer">https://www.gov.br/anpd/pt-br</a></p>
        </ContactBox>

        <hr />

        <FinalNote>
          <strong>
            Ao utilizar o Shafar, você declara ter lido, compreendido e concordado com esta
            Política de Privacidade.
          </strong>
        </FinalNote>

        <CopyrightNote>
          © 2025 Shafar. Todos os direitos reservados.
        </CopyrightNote>
      </Content>

      <BackButton onClick={() => navigate(-1)}>
        ← Voltar
      </BackButton>
    </Container>
  );
}
