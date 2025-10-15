# 🚀 Guia de Deploy no Vercel - BarberFlow

## 🔧 **Correções Aplicadas para Erro 127**

### **Problema Identificado:**
- Erro 127: "comando não encontrado" no Vercel
- Scripts não encontravam o executável `vite`

### **✅ Soluções Implementadas:**

#### **1. Scripts Corrigidos (package.json)**
```json
{
  "scripts": {
    "dev": "npx vite",
    "build": "npx vite build", 
    "preview": "npx vite preview",
    "type-check": "npx tsc --noEmit"
  }
}
```

#### **2. Configuração Vercel Otimizada**
- ✅ `vercel.json` com versão 2
- ✅ Runtime Node.js 18.x especificado
- ✅ Framework Vite configurado
- ✅ Rewrites para SPA

#### **3. Arquivos de Configuração**
- ✅ `.nvmrc` - Força Node.js 18
- ✅ `.vercelignore` - Ignora arquivos desnecessários
- ✅ `build.sh` - Script alternativo de build

## 🚀 **Passos para Deploy no Vercel**

### **Opção 1: Deploy via Git (Recomendado)**

1. **Commit as correções:**
   ```bash
   git add .
   git commit -m "fix: corrigir build para Vercel (erro 127)"
   git push origin main
   ```

2. **No Vercel Dashboard:**
   - Conecte seu repositório
   - Configure as variáveis de ambiente:
     ```
     VITE_SUPABASE_URL=sua_url_aqui
     VITE_SUPABASE_ANON_KEY=sua_chave_aqui
     ```
   - Deploy automático!

### **Opção 2: Deploy Manual**

1. **Build local:**
   ```bash
   npm run build
   ```

2. **Deploy da pasta dist:**
   ```bash
   npx vercel --prod
   ```

## 🔍 **Troubleshooting Adicional**

### **Se ainda der erro 127:**

1. **Verificar Node.js no Vercel:**
   - Certifique-se que está usando Node.js 18.x
   - Arquivo `.nvmrc` deve conter apenas: `18`

2. **Limpar cache do Vercel:**
   - No dashboard: Settings → Functions → Clear Cache
   - Ou redeploy forçado

3. **Verificar dependências:**
   ```bash
   npm ci  # Instala exatamente do package-lock.json
   npm run build  # Testa localmente
   ```

### **Comandos de Debug:**

```bash
# Verificar se vite está instalado
npx vite --version

# Build com logs detalhados
npm run build --verbose

# Verificar estrutura do dist
ls -la dist/
```

## 📋 **Checklist Final**

- ✅ Scripts usando `npx`
- ✅ `vercel.json` configurado
- ✅ `.nvmrc` com Node 18
- ✅ Variáveis de ambiente configuradas
- ✅ Build local funcionando
- ✅ Favicon otimizado (286 bytes)

## 🎯 **Configurações Importantes**

### **Variáveis de Ambiente Necessárias:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
```

### **Configuração de Build:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node.js Version:** 18.x

---

## 🆘 **Se Ainda Houver Problemas**

1. **Verificar logs do Vercel** no dashboard
2. **Testar build local** com `npm run build`
3. **Verificar se todas as dependências** estão no package.json
4. **Usar o script alternativo** `./build.sh` se necessário

**🎉 Com essas correções, o deploy deve funcionar perfeitamente!**