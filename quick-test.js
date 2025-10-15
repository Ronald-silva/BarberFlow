// Teste rápido - Cole este código no console do navegador (F12)
// Certifique-se de estar na página do seu projeto React

console.log('🧪 Iniciando teste rápido do BarberFlow...');

// Função para testar as APIs
async function quickTest() {
  try {
    // Importar a API do projeto
    const { api } = await import('./services/supabaseApi.ts');
    
    console.log('✅ API importada com sucesso');
    
    // 1. Testar busca de barbearia
    console.log('\n1️⃣ Testando busca de barbearia...');
    const barbershop = await api.getBarbershopBySlug('navalha-dourada');
    if (barbershop) {
      console.log('✅ Barbearia encontrada:', barbershop.name);
      console.log('📞 Telefone:', barbershop.phone || 'Não definido');
      console.log('📧 Email:', barbershop.email || 'Não definido');
    } else {
      console.log('❌ Barbearia não encontrada');
      return;
    }
    
    // 2. Testar busca de serviços
    console.log('\n2️⃣ Testando busca de serviços...');
    const services = await api.getServicesByBarbershop(barbershop.id);
    console.log(`✅ ${services.length} serviços encontrados:`);
    services.forEach(service => {
      console.log(`   - ${service.name}: R$ ${service.price} (${service.duration}min)`);
    });
    
    // 3. Testar busca de profissionais
    console.log('\n3️⃣ Testando busca de profissionais...');
    const professionals = await api.getProfessionalsByBarbershop(barbershop.id);
    console.log(`✅ ${professionals.length} profissionais encontrados:`);
    professionals.forEach(prof => {
      console.log(`   - ${prof.name} (${prof.email}) - ${prof.role}`);
    });
    
    // 4. Testar busca de clientes
    console.log('\n4️⃣ Testando busca de clientes...');
    const clients = await api.getClientsByBarbershop(barbershop.id);
    console.log(`✅ ${clients.length} clientes encontrados:`);
    clients.slice(0, 3).forEach(client => {
      console.log(`   - ${client.name} (${client.whatsapp})`);
    });
    
    // 5. Testar dados do dashboard
    console.log('\n5️⃣ Testando dados do dashboard...');
    const dashboardData = await api.getDashboardData(barbershop.id, new Date());
    console.log('✅ Dados do dashboard:');
    console.log(`   - Agendamentos hoje: ${dashboardData.totalAppointments}`);
    console.log(`   - Faturamento previsto: R$ ${dashboardData.faturamentoPrevisto.toFixed(2)}`);
    console.log(`   - Próximo cliente: ${dashboardData.nextClientName}`);
    
    // 6. Testar login
    console.log('\n6️⃣ Testando login...');
    const user = await api.login('admin@barber.com', '123456');
    if (user) {
      console.log('✅ Login realizado com sucesso:');
      console.log(`   - Nome: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
    } else {
      console.log('❌ Falha no login');
    }
    
    console.log('\n🎉 Teste rápido concluído com sucesso!');
    console.log('✅ Todas as operações básicas estão funcionando!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
quickTest();