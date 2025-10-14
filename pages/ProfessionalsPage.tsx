import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockApi';
import { User } from '../types';

const ProfessionalsPage: React.FC = () => {
    const { user } = useAuth();
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfessionals = async () => {
            if (user) {
                setLoading(true);
                const result = await api.getProfessionalsByBarbershop(user.barbershopId);
                setProfessionals(result);
                setLoading(false);
            }
        };
        fetchProfessionals();
    }, [user]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Profissionais</h1>
                <button className="bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600">
                    Adicionar Profissional
                </button>
            </div>
             <div className="bg-brand-secondary rounded-lg shadow-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan={3} className="p-4 text-center">Carregando...</td></tr>
                        ) : (
                            professionals.map(prof => (
                                <tr key={prof.id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-4">{prof.name}</td>
                                    <td className="p-4">{prof.email}</td>
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

export default ProfessionalsPage;