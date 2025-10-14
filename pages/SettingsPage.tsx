import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
    const [name, setName] = useState('Navalha Dourada');
    const [address, setAddress] = useState('Rua das Tesouras, 123');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Em um aplicativo real, uma chamada de API seria feita aqui para salvar os dados.
        alert('Configurações salvas com sucesso! (Simulação)');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-6">Configurações</h1>
            <div className="max-w-lg bg-brand-secondary p-8 rounded-lg shadow-lg">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome da Barbearia</label>
                        <input 
                            type="text" 
                            id="name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-300">Endereço</label>
                        <input 
                            type="text" 
                            id="address" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                     <div>
                        <label htmlFor="logo" className="block text-sm font-medium text-gray-300">Logo</label>
                        <input 
                            type="file" 
                            id="logo"
                            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-brand-secondary hover:file:bg-yellow-600"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;