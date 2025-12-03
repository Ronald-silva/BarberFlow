# 🚀 BarberFlow - Sistema Inteligente de Agendamento

> **Status**: ✅ Pronto para Produção | **Build**: ✅ Sucesso | **Última atualização**: 2025-12-02

## 📋 Sobre o Projeto

BarberFlow é um sistema completo de agendamento para barbearias com arquitetura multi-tenant, sistema de pagamentos integrado (PIX + Bitcoin) e interface moderna e responsiva.

## ✨ Funcionalidades Principais

### 🏪 Multi-Tenant
- Sistema para múltiplas barbearias
- URLs únicas por barbearia (`/book/slug-da-barbearia`)
- Isolamento completo de dados
- Gerenciamento independente

### 💰 Sistema de Pagamentos
- **PIX**: Integração completa com QR Code
- **Bitcoin**: Pagamentos em criptomoeda
- **Monitoramento**: Confirmação automática
- **Marketing**: Diferenciação competitiva

### 📱 Interface Moderna
- Design responsivo (mobile-first)
- Componentes reutilizáveis
- Tema consistente
- Experiência otimizada

### 🔐 Autenticação e Segurança
- Supabase Auth
- Row Level Security (RLS)
- Políticas de acesso granulares
- Upload seguro de arquivos

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **Styled Components** para estilização
- **React Router** para navegação
- **Vite** como bundler

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **APIs RESTful** auto-geradas
- **Real-time** subscriptions
- **Storage** para arquivos

### Estrutura de Pastas
```
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # APIs e serviços
│   ├── contexts/      # Contextos React
│   ├── styles/        # Temas e estilos globais
│   ├── types/         # Definições TypeScript
│   └── utils/         # Utilitários
├── docs/
│   ├── guides/        # Guias e documentação
│   ├── setup/         # Configuração inicial
│   └── sql/           # Scripts SQL
└── public/            # Arquivos estáticos
```

## 🚀 Início Rápido

### 1. Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### 2. Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]
cd barberflow

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Configuração do Supabase
```bash
# Execute os scripts SQL na ordem:
# 1. docs/sql/supabase-schema.sql
# 2. docs/sql/supabase-seed.sql
# 3. docs/sql/supabase-storage-setup.sql
```

### 4. Execução
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

### 📖 Guias Principais
- **[Arquitetura da Plataforma](docs/guides/PLATFORM_ARCHITECTURE.md)** - Nova arquitetura multi-tenant
- **[Resumo da Arquitetura](docs/guides/ARCHITECTURE_SUMMARY.md)** - Visão executiva das mudanças
- **[Estrutura do Projeto](docs/guides/PROJECT_STRUCTURE.md)** - Organização completa dos arquivos

### ⚙️ Configuração e Setup
- **[Setup do Supabase](docs/guides/SUPABASE_SETUP.md)** - Configuração do banco
- **[Configuração de Pagamentos](docs/guides/PAYMENT_SETUP.md)** - PIX e Bitcoin
- **[Deploy na Vercel](docs/guides/VERCEL_DEPLOY_GUIDE.md)** - Guia de deploy
- **[Upload de Logo](docs/guides/LOGO_UPLOAD_GUIDE.md)** - Configuração de storage

### 🏗️ Arquitetura e Desenvolvimento
- **[Multi-Tenant](docs/guides/MULTI_TENANT_ARCHITECTURE.md)** - Arquitetura multi-inquilino
- **[Onboarding](docs/guides/ONBOARDING_GUIDE.md)** - Fluxo de cadastro
- **[Melhorias Mobile](docs/guides/MOBILE_IMPROVEMENTS.md)** - Otimizações mobile

### 🗄️ Banco de Dados
- **[Scripts SQL](docs/sql/)** - Todos os scripts do banco
- **[Configuração Inicial](docs/setup/)** - Setup do ambiente

### 📋 Relatórios
- **[Relatório de Limpeza](docs/guides/CLEANUP_REPORT.md)** - Organização do projeto

## 🛠️ Tecnologias

### Core
- React 18
- TypeScript
- Styled Components
- React Router DOM

### Backend/Database
- Supabase
- PostgreSQL
- Row Level Security

### Pagamentos
- PIX (QR Code)
- Bitcoin (Blockchain APIs)

### Deploy
- Vercel
- Supabase Hosting

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run type-check   # Verificação de tipos
npm run pre-deploy   # Verificação pré-deploy

# Alternância entre APIs
npm run api:mock     # Usar dados mock (desenvolvimento)
npm run api:supabase # Usar Supabase (produção)
```

## 📊 Status do Projeto

### ✅ Implementado
- [x] Sistema multi-tenant completo
- [x] Autenticação e autorização
- [x] CRUD de barbearias, serviços, profissionais
- [x] Sistema de agendamentos
- [x] Pagamentos PIX + Bitcoin
- [x] Upload de logos
- [x] Interface responsiva
- [x] Deploy automatizado

### 🚧 Em Desenvolvimento
- [ ] Notificações WhatsApp
- [ ] Relatórios avançados
- [ ] App mobile nativo
- [ ] Integração com calendários

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [issue](../../issues)
- Consulte a [documentação](docs/)
- Entre em contato via email

---

**Desenvolvido com ❤️ para revolucionar o agendamento em barbearias**