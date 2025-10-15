#!/usr/bin/env node

/**
 * Script de verificação pré-deploy
 * Verifica se o projeto está pronto para deploy no Vercel
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 Verificando projeto para deploy no Vercel...\n');

const checks = [
  {
    name: 'package.json existe',
    check: () => fs.existsSync(path.join(rootDir, 'package.json')),
    fix: 'Certifique-se de que o package.json existe na raiz do projeto'
  },
  {
    name: 'Build script configurado',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
      return pkg.scripts && pkg.scripts.build;
    },
    fix: 'Adicione "build": "vite build" nos scripts do package.json'
  },
  {
    name: 'vercel.json configurado',
    check: () => fs.existsSync(path.join(rootDir, 'vercel.json')),
    fix: 'Arquivo vercel.json criado automaticamente'
  },
  {
    name: 'index.html existe',
    check: () => fs.existsSync(path.join(rootDir, 'index.html')),
    fix: 'Certifique-se de que o index.html existe na raiz'
  },
  {
    name: '.env.example existe',
    check: () => fs.existsSync(path.join(rootDir, '.env.example')),
    fix: 'Arquivo .env.example criado para referência'
  },
  {
    name: '.gitignore configurado',
    check: () => {
      const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
      return gitignore.includes('.env') && gitignore.includes('dist') && gitignore.includes('node_modules');
    },
    fix: '.gitignore atualizado com configurações necessárias'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  
  if (!passed) {
    console.log(`   💡 ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 Projeto pronto para deploy no Vercel!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente no Vercel');
  console.log('2. Conecte seu repositório GitHub');
  console.log('3. Faça o deploy!');
  console.log('\n🔗 Guia completo: DEPLOY_GUIDE.md');
} else {
  console.log('⚠️  Alguns problemas precisam ser corrigidos antes do deploy');
  process.exit(1);
}

console.log('\n🚀 Deploy command: vercel --prod');
console.log('📖 Documentação: https://vercel.com/docs');