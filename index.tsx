
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importando CSS com Tailwind
import App from './App';
import { initSentry } from './src/lib/sentry';

// Inicializar Sentry antes de renderizar o app
initSentry();

// Evita tela de erro quando chunks com hash mudam após novo deploy.
// Nesse caso, força reload para sincronizar HTML + assets da versão atual.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
