# 🚀 Deploy Rápido no Vercel

## ⚡ **Deploy em 3 Passos**

### **1. Preparar o Projeto**
```bash
# Verificar se está tudo pronto
npm run pre-deploy

# Build local para testar
npm run build
npm run preview
```

### **2. Configurar Variáveis**
No painel do Vercel, adicione:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
NODE_ENV=production
```

### **3. Deploy**
```bash
# Via CLI
npx vercel --prod

# Ou conecte no GitHub via interface web
```

## 🔧 **Configurações Automáticas**

✅ **Framework**: Vite detectado automaticamente  
✅ **Build Command**: `npm run build`  
✅ **Output Directory**: `dist`  
✅ **Node Version**: 18.x (recomendado)  
✅ **SPA Routing**: Configurado no vercel.json  

## 📊 **Performance Esperada**

- ⚡ **Build**: ~2 minutos
- 🚀 **Deploy**: ~30 segundos  
- 📱 **Lighthouse**: 95+ mobile
- 🖥️ **Lighthouse**: 98+ desktop

## 🔗 **Links Úteis**

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com)
- [Documentação Vercel](https://vercel.com/docs)

---

**Status**: ✅ **PRONTO PARA DEPLOY**