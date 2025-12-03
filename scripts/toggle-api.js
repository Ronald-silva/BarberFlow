#!/usr/bin/env node

/**
 * Script para alternar entre Mock API e Supabase API
 * 
 * Uso:
 * npm run api:mock    - Usar dados mock
 * npm run api:supabase - Usar Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_TYPE = process.argv[2]; // 'mock' ou 'supabase'

if (!API_TYPE || !['mock', 'supabase'].includes(API_TYPE)) {
  console.error('❌ Uso: node toggle-api.js [mock|supabase]');
  process.exit(1);
}

const authContextPath = path.join(__dirname, '../src/contexts/AuthContext.tsx');
const platformDashboardPath = path.join(__dirname, '../src/pages/PlatformDashboardPage.tsx');

function updateImports(filePath, fromApi, toApi) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Atualizar import
    content = content.replace(
      `import { ${fromApi} } from '../services/${fromApi === 'api' ? 'mockApi' : 'supabaseApi'}';`,
      `import { ${toApi} } from '../services/${toApi === 'api' ? 'mockApi' : 'supabaseApi'}';`
    );
    
    // Atualizar chamadas da API
    content = content.replace(new RegExp(`${fromApi}\\.`, 'g'), `${toApi}.`);
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Atualizado: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${filePath}:`, error.message);
  }
}

console.log(`🔄 Alternando para ${API_TYPE.toUpperCase()} API...\n`);

if (API_TYPE === 'mock') {
  // Trocar de supabaseApi para api (mock)
  updateImports(authContextPath, 'supabaseApi', 'api');
  updateImports(platformDashboardPath, 'supabaseApi', 'api');
  
  console.log('\n🎭 Sistema configurado para usar MOCK API');
  console.log('📝 Dados simulados serão usados');
  console.log('🔑 Login: qualquer email/senha funciona');
  
} else if (API_TYPE === 'supabase') {
  // Trocar de api para supabaseApi
  updateImports(authContextPath, 'api', 'supabaseApi');
  updateImports(platformDashboardPath, 'api', 'supabaseApi');
  
  console.log('\n🚀 Sistema configurado para usar SUPABASE API');
  console.log('📊 Dados reais do banco serão usados');
  console.log('🔑 Login: apenas usuários cadastrados no Supabase');
  console.log('📖 Veja docs/guides/SUPABASE_SETUP.md para configuração');
}

console.log('\n🔄 Reinicie o servidor de desenvolvimento (npm run dev)');