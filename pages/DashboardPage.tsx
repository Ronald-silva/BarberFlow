
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockApi';

interface DashboardData {
    totalAppointments: number;
    faturamentoPrevisto: number;
    nextClientName: string;
}

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                const result = await api.getDashboardData(user.barbershopId, new Date());
                setData(result);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-6">Visão Geral de Hoje</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-gray-400 text-sm font-medium">Total de Agendamentos</h2>
                    <p className="text-3xl font-bold text-white mt-2">{data?.totalAppointments}</p>
                </div>
                <div className="bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-gray-400 text-sm font-medium">Faturamento Previsto</h2>
                    <p className="text-3xl font-bold text-white mt-2">R$ {data?.faturamentoPrevisto.toFixed(2)}</p>
                </div>
                <div className="bg-brand-secondary p-6 rounded-lg shadow-lg">
                    <h2 className="text-gray-400 text-sm font-medium">Próximo Cliente</h2>
                    <p className="text-3xl font-bold text-white mt-2">{data?.nextClientName}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
