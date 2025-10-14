import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
    <span className="ml-3 text-gray-400">Carregando...</span>
  </div>
);

export default LoadingSpinner;