# 🔧 Troubleshooting - Sistema de Agendamento

## Problema: Link de agendamento não direciona para a página

### ✅ Verificações Realizadas
- [x] Rota `/book/:barbershopSlug` está configurada no App.tsx
- [x] BookingPage usa `useParams` corretamente
- [x] API `getBarbershopBySlug` existe e está implementada
- [x] Link está sendo gerado com hash: `/#/book/slug`
- [x] BookingPage tem tratamento para barbearia não encontrada

### 🔍 Possíveis Causas

#### 1. **Barbearia não existe no banco de dados**
**Solução:**
```bash
# Execute o seed no Supabase SQL Editor
# Arquivo: supabase-seed.sql
```

#### 2. **Configuração do Supabase**
**Verificar:**
- Arquivo `.env` com as variáveis corretas
- Conexão com o banco funcionando
- RLS (Row Level Security) configurado

#### 3. **Ambiente de desenvolvimento**
**Testar:**
```bash
npm run dev
# Abrir: http://localhost:5173/#/book/navalha-dourada
```

### 🧪 Testes para Executar

#### Teste 1: Verificar se a barbearia existe
```javascript
// No console do navegador (F12)
const api = await import('./services/supabaseApi.js');
const barbershop = await api.api.getBarbershopBySlug('navalha-dourada');
console.log('Barbearia:', barbershop);
```

#### Teste 2: Verificar roteamento
```javascript
// No console do navegador
console.log('Hash atual:', window.location.hash);
console.log('Parâmetros:', new URLSearchParams(window.location.search));
```

#### Teste 3: Verificar console de erros
- Abrir DevTools (F12)
- Ir para a aba Console
- Procurar por erros em vermelho

### 🎯 Soluções Rápidas

#### Solução 1: Executar seed no Supabase
1. Abrir Supabase Dashboard
2. Ir em SQL Editor
3. Executar conteúdo do `supabase-seed.sql`

#### Solução 2: Verificar variáveis de ambiente
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

#### Solução 3: Testar com slug diferente
- Criar nova barbearia no banco
- Usar slug simples como 'teste'

### 📋 Checklist de Debug

- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Supabase configurado e conectado
- [ ] Seed executado no banco
- [ ] Console sem erros JavaScript
- [ ] Network tab mostra requisições para Supabase
- [ ] Barbearia existe no banco com slug correto

### 🚀 Próximos Passos

1. **Executar ambiente de desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Testar URL diretamente**
   ```
   http://localhost:5173/#/book/navalha-dourada
   ```

3. **Verificar console do navegador**
   - Abrir F12
   - Procurar erros
   - Verificar requisições de rede

4. **Se ainda não funcionar**
   - Verificar se o seed foi executado
   - Testar conexão com Supabase
   - Verificar configuração RLS

### 💡 Dicas Importantes

- O sistema usa **HashRouter**, então URLs devem ter `#`
- A BookingPage mostra "Barbearia não encontrada" se o slug não existir
- Verificar sempre o console para erros de JavaScript
- O slug deve existir exatamente como cadastrado no banco