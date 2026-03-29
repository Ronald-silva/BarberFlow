# 📄 Documentos Legais - Shafar

## 🎯 Visão Geral

Esta pasta contém todos os **documentos legais obrigatórios** para operação do Shafar em conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)** e legislação brasileira aplicável.

**⚠️ CRÍTICO**: É **ILEGAL** operar o Shafar sem estes documentos implementados. Violação pode resultar em multas de até **R$ 50 milhões**.

---

## 📋 Documentos Incluídos

| Documento | Descrição | Status |
|-----------|-----------|--------|
| [POLITICA_DE_PRIVACIDADE.md](POLITICA_DE_PRIVACIDADE.md) | Política de Privacidade completa (LGPD) | ✅ Pronto |
| [TERMOS_DE_USO.md](TERMOS_DE_USO.md) | Termos de Uso do serviço | ✅ Pronto |
| [TERMO_DE_CONSENTIMENTO_LGPD.md](TERMO_DE_CONSENTIMENTO_LGPD.md) | Termo de consentimento para tratamento de dados | ✅ Pronto |
| [GUIA_DE_IMPLEMENTACAO.md](GUIA_DE_IMPLEMENTACAO.md) | Guia técnico de implementação | ✅ Pronto |

---

## ⚡ Quick Start

### 1. **ANTES de lançar em produção**:

1. **Preencha os dados da empresa** (marcados com `[INSERIR ...]`):
   - Razão social
   - CNPJ
   - Endereço completo
   - Telefone
   - Nome do DPO (Encarregado de Dados)
   - Cidade do foro

2. **Configure os e-mails**:
   - privacy@shafar.com.br
   - dpo@shafar.com.br
   - legal@shafar.com.br

3. **Implemente na plataforma** seguindo [GUIA_DE_IMPLEMENTACAO.md](GUIA_DE_IMPLEMENTACAO.md)

4. **Consulte um advogado especializado em LGPD** para revisar os documentos

---

## 📖 Resumo dos Documentos

### 1. Política de Privacidade

**O que é**: Documento que informa como os dados pessoais são coletados, usados, armazenados e protegidos.

**Principais seções**:
- Quais dados coletamos
- Como usamos os dados
- Com quem compartilhamos
- Direitos dos titulares (LGPD Art. 18)
- Segurança dos dados
- Cookies e tecnologias
- Prazo de retenção

**Obrigatoriedade**: ✅ **OBRIGATÓRIO** por lei (LGPD Art. 9º)

---

### 2. Termos de Uso

**O que é**: Contrato entre o Shafar e o usuário que define regras de uso, responsabilidades e limitações.

**Principais seções**:
- Descrição do serviço
- Planos e pagamentos
- Uso aceitável da plataforma
- Propriedade intelectual
- Limitação de responsabilidade
- Rescisão e cancelamento

**Obrigatoriedade**: ✅ **OBRIGATÓRIO** (Lei nº 12.965/2014 - Marco Civil da Internet)

---

### 3. Termo de Consentimento LGPD

**O que é**: Documento específico para obter consentimento livre, informado e inequívoco dos usuários.

**Principais elementos**:
- Checkbox de aceite
- Informações claras sobre tratamento de dados
- Direitos do titular
- Possibilidade de revogação

**Obrigatoriedade**: ✅ **OBRIGATÓRIO** quando o tratamento se baseia em consentimento (LGPD Art. 8º)

---

### 4. Guia de Implementação

**O que é**: Documentação técnica para desenvolvedores implementarem os documentos legais na plataforma.

**Conteúdo**:
- Código de exemplo (React/TypeScript)
- Estrutura de banco de dados (consent_logs)
- Componentes de UI (modals, checkboxes)
- Fluxo de aceite e registro
- Checklist de implementação

---

## ⚠️ Dados a Preencher

Procure por `[INSERIR ...]` em todos os documentos e substitua pelos dados reais:

### Na Política de Privacidade:
```markdown
[INSERIR RAZÃO SOCIAL DA EMPRESA] → Ex: "Shafar Tecnologia LTDA"
[INSERIR CNPJ] → Ex: "12.345.678/0001-90"
[INSERIR ENDEREÇO COMPLETO] → Ex: "Rua Exemplo, 123 - Centro - São Paulo/SP - CEP 01234-567"
[INSERIR NOME DO DPO] → Ex: "João Silva"
[INSERIR CIDADE] → Ex: "São Paulo"
```

### Nos Termos de Uso:
```markdown
[INSERIR RAZÃO SOCIAL DA EMPRESA]
[INSERIR CNPJ]
[INSERIR ENDEREÇO COMPLETO]
[INSERIR TELEFONE] → Ex: "(11) 3456-7890"
[INSERIR CIDADE] → Ex: "São Paulo"
```

**Ferramenta útil**: Use `Ctrl+H` (find & replace) no editor de texto para substituir rapidamente.

---

## 🔍 Validação

### Checklist de Validação Jurídica

Antes de considerar os documentos finalizados:

- [ ] **Todos** os campos `[INSERIR ...]` foram preenchidos
- [ ] Dados da empresa estão **corretos e atualizados**
- [ ] E-mails de contato estão **funcionando**
- [ ] DPO foi **nomeado oficialmente**
- [ ] Advogado especializado **revisou os documentos**
- [ ] Documentos estão em **português brasileiro** (LGPD Art. 9º, §5º)
- [ ] Linguagem é **clara e acessível** (não apenas "juridiquês")
- [ ] Informações sobre **direitos dos titulares** estão completas

### Checklist de Implementação Técnica

- [ ] Páginas `/privacy` e `/terms` criadas
- [ ] Checkbox obrigatório no cadastro
- [ ] Links no rodapé de **todas as páginas**
- [ ] Modal de cookies implementado
- [ ] Tabela `consent_logs` criada no banco
- [ ] Logs de consentimento sendo salvos
- [ ] Seção "Meus Dados" para usuários
- [ ] Exportação de dados funcional
- [ ] Exclusão de conta funcional

---

## 🚨 Principais Riscos de Não Conformidade

### 1. Multas LGPD

**Valor**: Até **R$ 50 milhões** por infração ou **2% do faturamento**

**Aplicadas pela**: ANPD (Autoridade Nacional de Proteção de Dados)

**Infrações comuns**:
- Tratar dados sem consentimento
- Não informar sobre coleta de dados
- Não respeitar direitos dos titulares
- Não proteger adequadamente os dados

### 2. Ações Judiciais

**Riscos**:
- Ações individuais de usuários
- Ações coletivas (Ministério Público, Procon)
- Danos morais e materiais

**Causas comuns**:
- Vazamento de dados
- Uso indevido de informações
- Negativa de acesso ou exclusão de dados

### 3. Danos Reputacionais

- Perda de confiança dos clientes
- Cancelamento em massa de assinaturas
- Impacto negativo na marca
- Dificuldade de captar novos clientes

### 4. Bloqueio de Operação

- ANPD pode determinar suspensão do tratamento de dados
- Proibição de fazer novos cadastros
- Impossibilidade de operar legalmente

---

## 📚 Base Legal

Estes documentos foram elaborados em conformidade com:

- **Lei nº 13.709/2018** - Lei Geral de Proteção de Dados (LGPD)
- **Lei nº 12.965/2014** - Marco Civil da Internet
- **Lei nº 8.078/1990** - Código de Defesa do Consumidor
- **Código Civil Brasileiro** (Lei nº 10.406/2002)

**Referências da ANPD**:
- Guia Orientativo para Tratamento de Dados Pessoais
- Guia Orientativo sobre Privacidade desde a Concepção
- Guia de Boas Práticas para Pequenas e Médias Empresas

---

## 🔄 Manutenção e Atualização

### Quando Atualizar

Os documentos devem ser revisados e atualizados:

**Obrigatoriamente**:
- [ ] A cada **mudança significativa** no tratamento de dados
- [ ] A cada **novo recurso** que colete dados pessoais
- [ ] A cada **alteração na legislação** (LGPD, Marco Civil, etc.)
- [ ] Quando **compartilhar dados** com novos fornecedores

**Recomendado**:
- [ ] **Anualmente**, mesmo sem mudanças (boas práticas)
- [ ] Após **incidentes de segurança**
- [ ] Quando **mudar de plano de negócio** (ex: adicionar publicidade)

### Como Atualizar

1. **Edite os documentos** com as alterações necessárias
2. **Incremente a versão** (ex: 1.0 → 1.1 ou 2.0)
3. **Atualize a data** de "Última atualização"
4. **Notifique usuários** (e-mail + banner na plataforma)
5. **Dê prazo de 30 dias** antes da entrada em vigor
6. **Registre novos consentimentos** (se aplicável)
7. **Mantenha versões antigas** arquivadas por 5 anos

### Versionamento

Use versionamento semântico:

- **MAJOR** (1.0 → 2.0): Mudanças substanciais (novos tipos de dados, novas finalidades)
- **MINOR** (1.0 → 1.1): Mudanças menores (novos fornecedores, ajustes de texto)
- **PATCH** (1.0.0 → 1.0.1): Correções (typos, erros gramaticais)

**Exemplo**:
```
Versão 1.0 (30/12/2025) - Versão inicial
Versão 1.1 (15/03/2026) - Adicionado processador de e-mails (SendGrid)
Versão 2.0 (01/06/2026) - Nova funcionalidade de análise de dados (requer novo consentimento)
```

---

## 🆘 Precisa de Ajuda?

### Recursos Gratuitos

- **ANPD**: https://www.gov.br/anpd/pt-br
  - Guias orientativos
  - Perguntas frequentes
  - Modelos de documentos

- **Sebrae**: Cursos gratuitos sobre LGPD
- **OAB**: Algumas seccionais oferecem consultoria gratuita para startups

### Serviços Profissionais

**Quando contratar**:
- ✅ Antes de lançar em produção
- ✅ Se tiver dúvidas sobre conformidade
- ✅ Após incidente de segurança
- ✅ Quando receber notificação da ANPD

**O que procurar**:
- Advogado especializado em Direito Digital e LGPD
- Consultoria em Privacidade e Proteção de Dados
- Serviço de DPO terceirizado

**Custo estimado**:
- Revisão de documentos: R$ 2.000 - R$ 5.000
- DPO terceirizado: R$ 500 - R$ 2.000/mês
- Consultoria completa: R$ 10.000 - R$ 50.000

---

## ✅ Status de Implementação

| Item | Status | Observações |
|------|--------|-------------|
| Documentos redigidos | ✅ Concluído | Revisar com advogado |
| Dados da empresa preenchidos | ⏳ Pendente | Preencher antes de produção |
| E-mails configurados | ⏳ Pendente | Criar privacy@, dpo@, legal@ |
| Implementação frontend | ⏳ Pendente | Ver GUIA_DE_IMPLEMENTACAO.md |
| Implementação backend | ⏳ Pendente | Criar tabela consent_logs |
| Revisão jurídica | ⏳ Pendente | Contratar advogado |
| Teste completo | ⏳ Pendente | Testar fluxo de aceite |
| Produção | ⏳ Pendente | Após todos os itens acima |

---

## 📞 Contato

Para dúvidas sobre estes documentos:

**E-mail**: legal@shafar.com.br
**DPO**: dpo@shafar.com.br

---

## 📝 Notas Importantes

1. **Estes documentos são modelos**: Devem ser adaptados à realidade específica do seu negócio

2. **Não substituem assessoria jurídica**: Consulte um advogado especializado antes de usar em produção

3. **Linguagem acessível**: A LGPD exige que documentos sejam claros e compreensíveis. Evite excesso de "juridiquês"

4. **Dados de menores**: Shafar não é destinado a menores de 18 anos. Se mudar isso, será necessário consentimento dos pais/responsáveis

5. **Dados sensíveis**: Se for coletar dados sensíveis (saúde, biometria, etc.), documentação adicional será necessária

6. **Transferência internacional**: Documentos informam sobre transferência de dados para EUA (Supabase, Stripe, etc.). Se mudar fornecedores, atualizar

---

## 🎯 Próximos Passos

1. [ ] **Ler todos os documentos** desta pasta
2. [ ] **Preencher dados da empresa** (procurar `[INSERIR ...]`)
3. [ ] **Configurar e-mails** (privacy@, dpo@, legal@)
4. [ ] **Implementar na plataforma** (seguir GUIA_DE_IMPLEMENTACAO.md)
5. [ ] **Testar fluxo completo** de cadastro e aceite
6. [ ] **Contratar advogado** para revisão
7. [ ] **Fazer ajustes** conforme orientação jurídica
8. [ ] **Lançar em produção** com documentos finalizados

---

**⚖️ Lembre-se: Conformidade com LGPD não é opcional. É obrigação legal.**

**🔒 Proteger dados de clientes é proteger seu negócio.**

---

© 2025 Shafar
