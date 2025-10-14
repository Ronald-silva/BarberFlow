import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockApi';
import { Service } from '../types';

const ServicesPage: React.FC = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            if (user) {
                setLoading(true);
                const result = await api.getServicesByBarbershop(user.barbershopId);
                setServices(result);
                setLoading(false);
            }
        };
        fetchServices();
    }, [user]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Serviços</h1>
                <button className="bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600">
                    Adicionar Serviço
                </button>
            </div>
             <div className="bg-brand-secondary rounded-lg shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Duração (min)</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-4 text-center">Carregando...</td></tr>
                        ) : (
                            services.map(service => (
                                <tr key={service.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-4">{service.name}</td>
                                    <td className="p-4">R$ {service.price.toFixed(2)}</td>
                                    <td className="p-4">{service.duration}</td>
                                    <td className="p-4 space-x-2">
                                        <button className="text-blue-400 hover:text-blue-300">Editar</button>
                                        <button className="text-red-500 hover:text-red-400">Excluir</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicesPage;