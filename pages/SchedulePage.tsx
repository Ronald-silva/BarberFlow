import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockApi';
import { User, Service } from '../types';
// Fix: Removed `parseISO` and `startOfHour` as they are not found in the module.
import { format, addHours } from 'date-fns';

interface AppointmentWithDetails {
    id: string;
    startDateTime: string;
    endDateTime: string;
    clientName: string;
    professionalId: string;
    services: Service[];
}

const SchedulePage: React.FC = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    
    const timeSlots = useMemo(() => {
        return Array.from({ length: 14 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);
    }, []);
    
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setLoading(true);
                const [profs, apps] = await Promise.all([
                    api.getProfessionalsByBarbershop(user.barbershopId),
                    api.getAppointmentsForDate(user.barbershopId, selectedDate)
                ]);
                
                if(user.role === 'member') {
                    setProfessionals(profs.filter(p => p.id === user.id));
                } else {
                    setProfessionals(profs);
                }

                setAppointments(apps);
                setLoading(false);
            }
        };
        fetchData();
    }, [user, selectedDate]);
    
    const getAppointmentPosition = (app: AppointmentWithDetails) => {
        // Fix: Replaced `parseISO` with `new Date()`
        const start = new Date(app.startDateTime);
        // Fix: Replaced `parseISO` with `new Date()`
        const end = new Date(app.endDateTime);
        const top = (start.getHours() - 8 + start.getMinutes() / 60) * 60; // 60px per hour
        const height = ((end.getTime() - start.getTime()) / (1000 * 60)) * 1; // 1px per minute
        return { top, height };
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Agenda</h1>
                <input 
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
                    className="bg-brand-secondary border border-gray-700 rounded-lg p-2 text-white"
                />
            </div>

            {loading ? <p>Carregando agenda...</p> : (
            <div className="bg-brand-secondary rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-1" style={{gridTemplateColumns: `60px repeat(${professionals.length}, 1fr)`}}>
                    {/* Header */}
                    <div className="p-3 border-b border-r border-gray-700"></div>
                    {professionals.map(prof => (
                        <div key={prof.id} className="p-3 text-center font-semibold border-b border-gray-700">
                            {prof.name}
                        </div>
                    ))}

                    {/* Body */}
                    <div className="relative col-span-full grid" style={{gridTemplateColumns: `60px repeat(${professionals.length}, 1fr)`}}>
                        {/* Time Column */}
                        <div className="border-r border-gray-700">
                            {timeSlots.map(time => (
                                <div key={time} className="h-[60px] text-xs text-center text-gray-400 border-b border-gray-800 p-1">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Professional Columns */}
                        {professionals.map((prof, colIndex) => (
                             <div key={prof.id} className="relative border-r border-gray-700">
                                 {timeSlots.map((_, rowIndex) => (
                                     <div key={rowIndex} className="h-[60px] border-b border-gray-800"></div>
                                 ))}
                                 {appointments.filter(a => a.professionalId === prof.id).map(app => {
                                     const { top, height } = getAppointmentPosition(app);
                                     return (
                                        <div key={app.id} className="absolute w-full px-1" style={{ top: `${top}px` }}>
                                             <div className="bg-brand-primary text-brand-secondary rounded-lg p-2 text-xs overflow-hidden" style={{ height: `${height}px` }}>
                                                 <p className="font-bold">{app.clientName}</p>
                                                 <p>{app.services.map(s => s.name).join(', ')}</p>
                                             </div>
                                         </div>
                                     );
                                 })}
                             </div>
                        ))}
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default SchedulePage;