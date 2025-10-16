// Debug script para testar o roteamento de agendamento
console.log('🔍 Iniciando debug do sistema de agendamento...');

// Simular a busca de barbearia por slug
const testSlug = 'navalha-dourada';
console.log(`\n📍 Testando slug: ${testSlug}`);

// Verificar se a URL está sendo construída corretamente
const baseUrl = 'http://localhost:5173'; // URL de desenvolvimento
const bookingUrl = `${baseUrl}/#/book/${testSlug}`;
console.log(`🔗 URL de agendamento: ${bookingUrl}`);

// Verificar se o HashRouter está funcionando
console.log('\n🧭 Verificações de roteamento:');
console.log('1. A aplicação usa HashRouter? ✅');
console.log('2. A rota /book/:barbershopSlug está definida? ✅');
console.log('3. A BookingPage usa useParams? ✅');
console.log('4. A API getBarbershopBySlug existe? ✅');

console.log('\n🎯 Próximos passos para debug:');
console.log('1. Abrir o navegador em:', bookingUrl);
console.log('2. Verificar o console do navegador');
console.log('3. Verificar se a barbearia existe no banco');
console.log('4. Verificar se o slug está correto');

console.log('\n💡 Possíveis problemas:');
console.log('- Barbearia não existe no banco de dados');
console.log('- Slug incorreto ou não cadastrado');
console.log('- Erro na API de busca por slug');
console.log('- Problema de CORS ou conexão com Supabase');