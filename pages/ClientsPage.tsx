import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockApi';
import { Client } from '../types';
// Fix: Removed `parseISO` from import as it is not found.
import { format, differenceInDays } from 'date-fns';

const ClientsPage: React.FC = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            if (user) {
                setLoading(true);
                const result = await api.getClientsByBarbershop(user.barbershopId);
                setClients(result);
                setLoading(false);
            }
        };
        fetchClients();
    }, [user]);

    const filteredClients = showInactive
        // Fix: Replaced `parseISO` with `new Date()`
        ? clients.filter(c => differenceInDays(new Date(), new Date(c.lastVisit)) > 90)
        : clients;

    const handleRecoveryMessage = (clientName: string, clientWhatsapp: string) => {
        const link = `${window.location.origin}/#/book/navalha-dourada`; // Mock link
        const message = `Olá, ${clientName}, tudo bem? Sentimos sua falta aqui na Navalha Dourada! Como incentivo para você voltar, estamos oferecendo 10% de desconto no seu próximo corte. Que tal? Agende em: ${link}`;
        alert(`Mensagem para ${clientWhatsapp}:\n\n${message}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Clientes</h1>
                <button
                    onClick={() => setShowInactive(!showInactive)}
                    className="bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600"
                >
                    {showInactive ? 'Mostrar Todos' : 'Recuperar Clientes'}
                </button>
            </div>
            
            <div className="bg-brand-secondary rounded-lg shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">WhatsApp</th>
                            <th className="p-4">Última Visita</th>
                            {showInactive && <th className="p-4">Ação</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={showInactive ? 4 : 3} className="p-4 text-center">Carregando...</td></tr>
                        ) : (
                            filteredClients.map(client => (
                                <tr key={client.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-4">{client.name}</td>
                                    <td className="p-4">{client.whatsapp}</td>
                                    {/* Fix: Replaced `parseISO` with `new Date()` */}
                                    <td className="p-4">{format(new Date(client.lastVisit), 'dd/MM/yyyy')}</td>
                                    {showInactive && (
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleRecoveryMessage(client.name, client.whatsapp)}
                                                className="bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-green-500"
                                            >
                                                Enviar Mensagem
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsPage;