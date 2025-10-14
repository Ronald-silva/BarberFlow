import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-brand-text">
      {/* Header */}
      <header className="bg-brand-secondary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="text-2xl font-bold text-brand-primary">BarberFlow</div>
            <Link 
              to="/login" 
              className="bg-brand-primary text-brand-secondary px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Sistema Inteligente de <span className="text-brand-primary">Agendamento</span> para Barbearias
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Reduza o trabalho manual, diminua o no-show e aumente seu faturamento com nossa plataforma completa de gestão.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/book/navalha-dourada" 
              className="bg-brand-primary text-brand-secondary px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              Ver Demo do Agendamento
            </Link>
            <Link 
              to="/login" 
              className="border border-brand-primary text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-brand-primary hover:text-brand-secondary transition-colors"
            >
              Acessar Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-brand-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-brand-primary">Por que escolher o BarberFlow?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Agendamento Online</h3>
              <p className="text-gray-400">Seus clientes agendam 24/7 pelo celular, sem precisar ligar.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Lembretes Automáticos</h3>
              <p className="text-gray-400">WhatsApp automático reduz no-show em até 80%.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Relatórios Completos</h3>
              <p className="text-gray-400">Acompanhe faturamento e recupere clientes inativos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para revolucionar sua barbearia?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Teste grátis por 30 dias. Sem compromisso.
          </p>
          <Link 
            to="/login" 
            className="bg-brand-primary text-brand-secondary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition-colors"
          >
            Começar Agora - Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-secondary py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 BarberFlow. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;