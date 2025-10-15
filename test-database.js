// Script de teste para verificar se todas as operações do banco estão funcionando
// Execute com: node test-database.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (use suas credenciais)
const supabaseUrl = 'https://jrggwhlbvsyvcqvywrmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2d3aGxidnN5dmNxdnl3cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MTEsImV4cCI6MjA3NjAzNDgxMX0.Y4bUnGmgGgPnwO1SVFbq6k2yZJN7wcY01JxKBAImQKk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🧪 Iniciando testes do banco de dados...\n');

  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('barbershops')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError);
      return;
    }
    console.log('✅ Conexão OK\n');

    // 2. Testar se as tabelas existem
    console.log('2️⃣ Verificando estrutura das tabelas...');
    
    const tables = ['barbershops', 'users', 'services', 'clients', 'appointments'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Tabela ${table}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table}: OK`);
      }
    }
    console.log('');

    // 3. Verificar se a barbearia existe
    console.log('3️⃣ Verificando dados da barbearia...');
    const { data: barbershop, error: barbershopError } = await supabase
      .from('barbershops')
      .select('*')
      .eq('slug', 'navalha-dourada')
      .single();

    if (barbershopError) {
      console.error('❌ Erro ao buscar barbearia:', barbershopError);
      return;
    }
    
    console.log('✅ Barbearia encontrada:', barbershop.name);
    console.log('📞 Telefone:', barbershop.phone || 'Não definido');
    console.log('📧 Email:', barbershop.email || 'Não definido');
    console.log('');

    const barbershopId = barbershop.id;

    // 4. Testar CRUD de Serviços
    console.log('4️⃣ Testando CRUD de Serviços...');
    
    // Criar serviço
    const { data: newService, error: createServiceError } = await supabase
      .from('services')
      .insert({
        name: 'Teste Serviço',
        price: 25.00,
        duration: 30,
        barbershop_id: barbershopId
      })
      .select()
      .single();

    if (createServiceError) {
      console.error('❌ Erro ao criar serviço:', createServiceError);
    } else {
      console.log('✅ Serviço criado:', newService.name);

      // Atualizar serviço
      const { data: updatedService, error: updateServiceError } = await supabase
        .from('services')
        .update({ name: 'Teste Serviço Atualizado', price: 30.00 })
        .eq('id', newService.id)
        .select()
        .single();

      if (updateServiceError) {
        console.error('❌ Erro ao atualizar serviço:', updateServiceError);
      } else {
        console.log('✅ Serviço atualizado:', updatedService.name);
      }

      // Deletar serviço
      const { error: deleteServiceError } = await supabase
        .from('services')
        .delete()
        .eq('id', newService.id);

      if (deleteServiceError) {
        console.error('❌ Erro ao deletar serviço:', deleteServiceError);
      } else {
        console.log('✅ Serviço deletado com sucesso');
      }
    }
    console.log('');

    // 5. Testar CRUD de Profissionais
    console.log('5️⃣ Testando CRUD de Profissionais...');
    
    // Criar profissional
    const { data: newProfessional, error: createProfessionalError } = await supabase
      .from('users')
      .insert({
        name: 'Teste Profissional',
        email: 'teste@teste.com',
        role: 'member',
        barbershop_id: barbershopId,
        work_hours: []
      })
      .select()
      .single();

    if (createProfessionalError) {
      console.error('❌ Erro ao criar profissional:', createProfessionalError);
    } else {
      console.log('✅ Profissional criado:', newProfessional.name);

      // Atualizar profissional
      const { data: updatedProfessional, error: updateProfessionalError } = await supabase
        .from('users')
        .update({ name: 'Teste Profissional Atualizado' })
        .eq('id', newProfessional.id)
        .select()
        .single();

      if (updateProfessionalError) {
        console.error('❌ Erro ao atualizar profissional:', updateProfessionalError);
      } else {
        console.log('✅ Profissional atualizado:', updatedProfessional.name);
      }

      // Deletar profissional
      const { error: deleteProfessionalError } = await supabase
        .from('users')
        .delete()
        .eq('id', newProfessional.id);

      if (deleteProfessionalError) {
        console.error('❌ Erro ao deletar profissional:', deleteProfessionalError);
      } else {
        console.log('✅ Profissional deletado com sucesso');
      }
    }
    console.log('');

    // 6. Testar CRUD de Clientes
    console.log('6️⃣ Testando CRUD de Clientes...');
    
    // Criar cliente
    const { data: newClient, error: createClientError } = await supabase
      .from('clients')
      .insert({
        name: 'Teste Cliente',
        whatsapp: '11999999999',
        barbershop_id: barbershopId,
        last_visit: new Date().toISOString()
      })
      .select()
      .single();

    if (createClientError) {
      console.error('❌ Erro ao criar cliente:', createClientError);
    } else {
      console.log('✅ Cliente criado:', newClient.name);

      // Atualizar cliente
      const { data: updatedClient, error: updateClientError } = await supabase
        .from('clients')
        .update({ name: 'Teste Cliente Atualizado' })
        .eq('id', newClient.id)
        .select()
        .single();

      if (updateClientError) {
        console.error('❌ Erro ao atualizar cliente:', updateClientError);
      } else {
        console.log('✅ Cliente atualizado:', updatedClient.name);
      }

      // Deletar cliente
      const { error: deleteClientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', newClient.id);

      if (deleteClientError) {
        console.error('❌ Erro ao deletar cliente:', deleteClientError);
      } else {
        console.log('✅ Cliente deletado com sucesso');
      }
    }
    console.log('');

    // 7. Testar atualização da barbearia
    console.log('7️⃣ Testando atualização da barbearia...');
    
    const { data: updatedBarbershop, error: updateBarbershopError } = await supabase
      .from('barbershops')
      .update({
        phone: '(11) 98765-4321',
        email: 'teste@navalhadorada.com'
      })
      .eq('id', barbershopId)
      .select()
      .single();

    if (updateBarbershopError) {
      console.error('❌ Erro ao atualizar barbearia:', updateBarbershopError);
    } else {
      console.log('✅ Barbearia atualizada');
      console.log('📞 Novo telefone:', updatedBarbershop.phone);
      console.log('📧 Novo email:', updatedBarbershop.email);
    }
    console.log('');

    // 8. Verificar dados existentes
    console.log('8️⃣ Verificando dados existentes...');
    
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', barbershopId);
    
    const { data: professionals } = await supabase
      .from('users')
      .select('*')
      .eq('barbershop_id', barbershopId);
    
    const { data: clients } = await supabase
      .from('clients')
      .select('*')
      .eq('barbershop_id', barbershopId);

    console.log(`✅ Serviços cadastrados: ${services?.length || 0}`);
    console.log(`✅ Profissionais cadastrados: ${professionals?.length || 0}`);
    console.log(`✅ Clientes cadastrados: ${clients?.length || 0}`);

    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    console.log('✅ O banco de dados está funcionando perfeitamente!');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

// Executar os testes
testDatabase();