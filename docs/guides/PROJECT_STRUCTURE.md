# 📁 Estrutura do Projeto BarberFlow

## 🏗️ Organização Geral

```
barberflow/
├── 📁 src/                    # Código fonte principal
│   ├── 📁 components/         # Componentes React reutilizáveis
│   ├── 📁 pages/             # Páginas da aplicação
│   ├── 📁 services/          # APIs e serviços externos
│   ├── 📁 contexts/          # Contextos React (estado global)
│   ├── 📁 styles/            # Temas e estilos globais
│   ├── 📁 types/             # Definições TypeScript
│   └── 📁 utils/             # Funções utilitárias
├── 📁 docs/                   # Documentação do projeto
│   ├── 📁 guides/            # Guias e tutoriais
│   ├── 📁 setup/             # Configuração inicial
│   └── 📁 sql/               # Scripts SQL do banco
├── 📁 public/                 # Arquivos estáticos
├── 📁 scripts/               # Scripts de automação
└── 📄 Arquivos de configuração
```

## 📂 Detalhamento das Pastas

### `/src` - Código Fonte

#### `/src/components` - Componentes React
```
components/
├── 📁 ui/                    # Componentes base (Button, Input, etc.)
├── 📁 booking/               # Componentes específicos de agendamento
├── 📁 icons/                 # Ícones customizados
├── 📄 icons.tsx              # Biblioteca de ícones
├── 📄 LoadingSpinner.tsx     # Componente de loading
└── 📄 PaymentModal.tsx       # Modal de pagamento
```

#### `/src/pages` - Páginas da Aplicação
```
pages/
├── 📄 LandingPage.tsx        # Página inicial pública
├── 📄 LoginPage.tsx          # Página de login
├── 📄 BarbershopRegistrationPage.tsx  # Cadastro de barbearias
├── 📄 BookingPage.tsx        # Página de agendamento (cliente)
├── 📄 DashboardLayout.tsx    # Layout do dashboard
├── 📄 DashboardPage.tsx      # Dashboard principal
├── 📄 SchedulePage.tsx       # Agenda de horários
├── 📄 ServicesPage.tsx       # Gerenciamento de serviços
├── 📄 ProfessionalsPage.tsx  # Gerenciamento de profissionais
├── 📄 ClientsPage.tsx        # Gerenciamento de clientes
└── 📄 SettingsPage.tsx       # Configurações da barbearia
```

#### `/src/services` - APIs e Serviços
```
services/
├── 📄 supabase.ts           # Configuração do Supabase
├── 📄 supabaseApi.ts        # API principal do Supabase
├── 📄 mockApi.ts            # API mock para desenvolvimento
├── 📄 paymentService.ts     # Serviço de pagamentos (PIX/Bitcoin)
└── 📄 notificationService.ts # Serviço de notificações
```

#### `/src/contexts` - Contextos React
```
contexts/
└── 📄 AuthContext.tsx       # Contexto de autenticação
```

#### `/src/styles` - Estilos e Temas
```
styles/
├── 📄 GlobalStyle.ts        # Estilos globais
└── 📄 theme.ts              # Definições do tema
```

#### `/src/types` - Definições TypeScript
```
types/
└── 📄 index.ts              # Todas as interfaces e types
```

### `/docs` - Documentação

#### `/docs/guides` - Guias e Tutoriais
```
guides/
├── 📄 SUPABASE_SETUP.md     # Configuração do Supabase
├── 📄 PAYMENT_SETUP.md      # Configuração de pagamentos
├── 📄 LOGO_UPLOAD_GUIDE.md  # Guia de upload de logo
├── 📄 VERCEL_DEPLOY_GUIDE.md # Deploy na Vercel
├── 📄 MULTI_TENANT_ARCHITECTURE.md # Arquitetura multi-tenant
├── 📄 ONBOARDING_GUIDE.md   # Guia de onboarding
├── 📄 MOBILE_IMPROVEMENTS.md # Melhorias mobile
├── 📄 ENVIRONMENT_SETUP.md  # Configuração de ambiente
├── 📄 STORAGE_SETUP_MANUAL.md # Setup manual do storage
└── 📄 DEPLOY_GUIDE.md       # Guia geral de deploy
```

#### `/docs/sql` - Scripts SQL
```
sql/
├── 📄 supabase-schema.sql   # Schema principal do banco
├── 📄 supabase-seed.sql     # Dados iniciais
├── 📄 supabase-payment-schema.sql # Schema de pagamentos
├── 📄 supabase-storage-setup.sql # Configuração do storage
├── 📄 supabase-rls-policies.sql # Políticas RLS
├── 📄 supabase-migration.sql # Migrações
├── 📄 verify-schema.sql     # Verificação do schema
├── 📄 fix-public-access.sql # Correção de acesso público
├── 📄 CHECK_SUPABASE_STATUS.sql # Verificação de status
└── 📄 ADD_NEW_BARBERSHOP_EXAMPLE.sql # Exemplo de nova barbearia
```

### `/public` - Arquivos Estáticos
```
public/
└── 📄 favicon-optimized.svg # Favicon otimizado
```

### `/scripts` - Scripts de Automação
```
scripts/
└── 📄 pre-deploy-check.js   # Verificações pré-deploy
```

## 📄 Arquivos de Configuração (Raiz)

```
├── 📄 package.json          # Dependências e scripts npm
├── 📄 tsconfig.json         # Configuração TypeScript
├── 📄 vite.config.js        # Configuração Vite
├── 📄 vercel.json           # Configuração Vercel
├── 📄 .env.example          # Template de variáveis de ambiente
├── 📄 .gitignore            # Arquivos ignorados pelo Git
├── 📄 App.tsx               # Componente raiz da aplicação
├── 📄 index.tsx             # Ponto de entrada da aplicação
├── 📄 index.html            # Template HTML
├── 📄 index.css             # Estilos base
├── 📄 README.md             # Documentação principal
├── 📄 PROJECT_STRUCTURE.md  # Este arquivo
└── 📄 build.sh              # Script de build
```

## 🎯 Convenções de Nomenclatura

### Arquivos e Pastas
- **Componentes**: PascalCase (`PaymentModal.tsx`)
- **Páginas**: PascalCase + "Page" (`SettingsPage.tsx`)
- **Serviços**: camelCase + "Service" (`paymentService.ts`)
- **Contextos**: PascalCase + "Context" (`AuthContext.tsx`)
- **Utilitários**: camelCase (`formatCurrency.ts`)
- **Pastas**: kebab-case (`multi-tenant/`)

### Código
- **Componentes**: PascalCase (`<PaymentModal />`)
- **Funções**: camelCase (`handleSubmit`)
- **Variáveis**: camelCase (`userName`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces**: PascalCase + "I" prefix (`IUser`)
- **Types**: PascalCase (`UserRole`)

## 🔄 Fluxo de Dados

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │───▶│     Services    │───▶│    Supabase     │
│   (UI Layer)    │    │  (API Layer)    │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Contexts     │    │     Utils       │    │     Storage     │
│ (State Layer)   │    │  (Helpers)      │    │   (Files)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Benefícios da Organização

### ✅ Vantagens
- **Escalabilidade**: Fácil adição de novas funcionalidades
- **Manutenibilidade**: Código organizado e fácil de encontrar
- **Reutilização**: Componentes e serviços modulares
- **Colaboração**: Estrutura clara para equipes
- **Performance**: Imports otimizados com path mapping

### 🎯 Padrões Seguidos
- **Separation of Concerns**: Cada pasta tem responsabilidade específica
- **DRY (Don't Repeat Yourself)**: Componentes reutilizáveis
- **Single Responsibility**: Cada arquivo tem uma função clara
- **Consistent Naming**: Convenções consistentes em todo projeto

---

**Esta estrutura segue as melhores práticas da comunidade React e facilita a manutenção e evolução do projeto.**