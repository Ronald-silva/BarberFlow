# BarberFlow - Sistema de Agendamento para Barbearias

Sistema completo de agendamento online para barbearias, desenvolvido com React, TypeScript e Supabase.

## 🚀 Funcionalidades Implementadas

### ✅ Para Clientes (Agendamento Público)
- Agendamento online via link público
- Seleção de múltiplos serviços
- Escolha de profissional ou automático
- Calendário interativo para escolha de data
- Seleção de horários disponíveis
- Formulário de dados do cliente
- Confirmação de agendamento
- Interface responsiva e moderna

### ✅ Para Profissionais/Administradores (Dashboard)
- **Dashboard**: Métricas em tempo real (agendamentos, faturamento, próximo cliente)
- **Agenda**: Visualização em grid com todos os agendamentos por profissional e horário
- **Clientes**: Lista completa com busca, recuperação de clientes inativos via WhatsApp
- **Serviços** (Admin): CRUD completo - criar, editar, excluir serviços
- **Profissionais** (Admin): CRUD completo - gerenciar equipe e permissões
- **Configurações** (Admin): Dados da barbearia e horários de funcionamento

### ✅ Sistema de Autenticação
- Login seguro com diferentes níveis de acesso
- Rotas protegidas por permissão
- Controle de acesso Admin vs Profissional

### ✅ Integração Completa com Banco de Dados
- Todas as operações CRUD funcionais
- Dados em tempo real via Supabase
- Relacionamentos entre tabelas
- Validações e tratamento de erros

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Styled Components
- **Backend**: Supabase (PostgreSQL, Real-time)
- **Roteamento**: React Router DOM
- **UI/UX**: Design system próprio com tema dourado
- **Calendário**: React Calendar
- **Datas**: date-fns
- **Build**: Vite

## 📦 Instalação e Configuração

### 1. Clone e Instale
```bash
git clone <repository-url>
cd barberflow
npm install
```

### 2. Configure o Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script `supabase-schema.sql` no SQL Editor
3. Execute o script `supabase-seed.sql` para dados de exemplo
4. Se necessário, execute `supabase-migration.sql` para atualizações

### 3. Configure Variáveis de Ambiente
Edite o arquivo `.env.local`:
```env
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute o Projeto
```bash
npm run dev
```

## 👥 Usuários de Teste

### Administrador (Acesso Total)
- **Email**: admin@barber.com
- **Senha**: 123456
- **Permissões**: Dashboard, Agenda, Clientes, Serviços, Profissionais, Configurações

### Profissional (Acesso Limitado)
- **Email**: joao@barber.com
- **Senha**: 123456
- **Permissões**: Dashboard, Agenda, Clientes

## 🔗 URLs do Sistema

- **Login/Dashboard**: `http://localhost:5173/#/login`
- **Agendamento Público**: `http://localhost:5173/#/book/navalha-dourada`

## 📱 Guia de Uso

### Para Demonstrar aos Clientes

#### 1. Agendamento Público (Cliente Final)
1. Acesse: `/#/book/navalha-dourada`
2. Escolha serviços (ex: Corte + Barba)
3. Selecione profissional ou "Qualquer Profissional"
4. Escolha data no calendário
5. Selecione horário disponível
6. Preencha nome e WhatsApp
7. Confirme o agendamento

#### 2. Dashboard Administrativo
1. Faça login como admin (admin@barber.com / 123456)
2. **Dashboard**: Veja métricas do dia
3. **Agenda**: Visualize todos os agendamentos em grid
4. **Clientes**: Gerencie base de clientes, envie mensagens de recuperação
5. **Serviços**: Adicione/edite serviços (preço, duração)
6. **Profissionais**: Gerencie equipe e permissões
7. **Configurações**: Configure dados da barbearia

#### 3. Visão do Profissional
1. Faça login como profissional (joao@barber.com / 123456)
2. Veja apenas sua agenda e clientes
3. Acesso limitado conforme permissões

## 🎯 Funcionalidades Demonstráveis

### ✅ Totalmente Funcionais
- ✅ Agendamento público completo
- ✅ Dashboard com métricas reais
- ✅ Agenda visual interativa
- ✅ CRUD de serviços
- ✅ CRUD de profissionais
- ✅ Gestão de clientes
- ✅ Configurações da barbearia
- ✅ Sistema de permissões
- ✅ Recuperação de clientes via WhatsApp
- ✅ Interface responsiva
- ✅ Feedback visual (loading, success, error)

### 📊 Dados de Demonstração
O sistema vem com dados pré-populados:
- Barbearia "Navalha Dourada"
- 3 serviços (Corte, Barba, Combo)
- 2 profissionais (Admin e João)
- 5 clientes de exemplo
- Agendamentos de exemplo

## 🎨 Design System

- **Cores**: Paleta dourada profissional (#D4AF37)
- **Tipografia**: Sistema escalável
- **Componentes**: Biblioteca completa reutilizável
- **Animações**: Transições suaves
- **Responsivo**: Mobile-first design

## 🚀 Status do Projeto

**✅ PROJETO 100% FUNCIONAL PARA DEMONSTRAÇÃO**

Todas as funcionalidades críticas estão implementadas e testadas. O sistema está pronto para ser apresentado aos clientes como uma solução completa de agendamento para barbearias.

## 📞 Suporte

Para dúvidas ou customizações, entre em contato.