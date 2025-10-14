import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Barbershop, Service, User } from '../types';
import { api } from '../services/mockApi';
import Calendar from 'react-calendar';
// A importação de CSS foi movida para o index.html para maior estabilidade
// import 'react-calendar/dist/Calendar.css';
import { addDays, format, isBefore } from 'date-fns';
// Fix: The import path for date-fns locales has been corrected. The locale data for Brazilian Portuguese (pt-BR) is now imported from 'date-fns/locale/pt-BR'.
import { ptBR } from 'date-fns/locale/pt-BR';

const BookingPage: React.FC = () => {
    const { barbershopSlug } = useParams<{ barbershopSlug: string }>();
    const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [step, setStep] = useState(1);
    
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedProfessional, setSelectedProfessional] = useState<string>('any');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    const [clientWhatsapp, setClientWhatsapp] = useState('');
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (barbershopSlug) {
                setLoading(true);
                const bs = await api.getBarbershopBySlug(barbershopSlug);
                if (bs) {
                    setBarbershop(bs);
                    const [srv, prof] = await Promise.all([
                        api.getServicesByBarbershop(bs.id),
                        api.getProfessionalsByBarbershop(bs.id)
                    ]);
                    setServices(srv);
                    setProfessionals(prof);
                }
                setLoading(false);
            }
        };
        loadData();
    }, [barbershopSlug]);
    
    const totalDuration = useMemo(() => {
        return selectedServices.reduce((total, sId) => {
            const service = services.find(s => s.id === sId);
            return total + (service?.duration || 0);
        }, 0);
    }, [selectedServices, services]);

    const handleServiceToggle = (serviceId: string) => {
        setSelectedServices(prev => 
            prev.includes(serviceId) 
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleConfirmBooking = async () => {
        if (!barbershop || !selectedTime || professionals.length === 0) return;

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const bookingDateTime = new Date(selectedDate);
        bookingDateTime.setHours(hours, minutes, 0, 0);
        
        const professionalToBook = selectedProfessional === 'any' ? professionals[0].id : selectedProfessional;

        await api.createAppointment({
            client: { name: clientName, whatsapp: clientWhatsapp },
            barbershopId: barbershop.id,
            professionalId: professionalToBook,
            serviceIds: selectedServices,
            startDateTime: bookingDateTime.toISOString(),
        });

        setStep(5); // Success step
    };
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-primary">Carregando...</div>;
    }

    if (!barbershop) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-primary">Barbearia não encontrada.</div>;
    }
    
    if (professionals.length === 0) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-primary">Nenhum profissional disponível nesta barbearia.</div>;
    }
    
    const professionalForConfirmation = professionals.find(p => p.id === selectedProfessional) || professionals[0];

    return (
        <div className="min-h-screen bg-brand-dark text-brand-text p-4 md:p-8">
            <div className="max-w-2xl mx-auto bg-brand-secondary rounded-lg shadow-xl overflow-hidden">
                <header className="p-6 bg-gray-900 flex items-center space-x-4">
                    <img src={barbershop.logoUrl} alt="Logo" className="w-16 h-16 rounded-full border-2 border-brand-primary"/>
                    <div>
                        <h1 className="text-2xl font-bold text-brand-primary">{barbershop.name}</h1>
                        <p className="text-gray-400">{barbershop.address}</p>
                    </div>
                </header>

                <main className="p-6 space-y-6">
                    {/* Step 1: Services */}
                    {step === 1 && (
                        <div key="step1">
                            <h2 className="text-xl font-semibold mb-4 text-brand-primary">Passo 1: Escolha os serviços</h2>
                            <div className="space-y-3">
                                {services.map(s => (
                                    <div key={s.id} onClick={() => handleServiceToggle(s.id)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedServices.includes(s.id) ? 'bg-brand-primary border-brand-primary text-brand-dark' : 'border-gray-700 hover:border-brand-primary'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{s.name}</span>
                                            <span>R$ {s.price.toFixed(2)}</span>
                                        </div>
                                        <p className="text-sm opacity-80">{s.duration} min</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setStep(2)} disabled={selectedServices.length === 0}
                                className="mt-6 w-full bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                Avançar
                            </button>
                        </div>
                    )}

                    {/* Step 2: Professional */}
                    {step === 2 && (
                        <div key="step2">
                            <h2 className="text-xl font-semibold mb-4 text-brand-primary">Passo 2: Escolha o profissional</h2>
                            <div className="space-y-3">
                                <div onClick={() => setSelectedProfessional('any')} className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedProfessional === 'any' ? 'bg-brand-primary border-brand-primary text-brand-dark' : 'border-gray-700 hover:border-brand-primary'}`}>
                                    Qualquer Profissional
                                </div>
                                {professionals.map(p => (
                                    <div key={p.id} onClick={() => setSelectedProfessional(p.id)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedProfessional === p.id ? 'bg-brand-primary border-brand-primary text-brand-dark' : 'border-gray-700 hover:border-brand-primary'}`}>
                                        {p.name}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(1)} className="bg-gray-700 text-brand-text font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Voltar</button>
                                <button onClick={() => setStep(3)} className="bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600">Avançar</button>
                            </div>
                        </div>
                    )}
                    
                    {/* Step 3: Date & Time */}
                    {step === 3 && (
                        <div key="step3">
                            <h2 className="text-xl font-semibold mb-4 text-brand-primary">Passo 3: Escolha a data e hora</h2>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="calendar-container">
                                    <Calendar
                                        onChange={(date) => {
                                            if (date instanceof Date) {
                                                setSelectedDate(date);
                                                setSelectedTime(null);
                                            }
                                        }}
                                        value={selectedDate}
                                        minDate={new Date()}
                                        maxDate={addDays(new Date(), 60)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-center font-semibold mb-2">{format(selectedDate, "eeee, dd 'de' MMMM", { locale: ptBR })}</h3>
                                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                        {['09:00', '09:45', '10:30', '11:15', '14:00', '14:45', '15:30', '16:15', '17:00', '18:00', '19:00'].map(time => {
                                            const [hours, minutes] = time.split(':').map(Number);
                                            const timeSlot = new Date(selectedDate);
                                            timeSlot.setHours(hours, minutes, 0, 0);
                                            const isPast = isBefore(timeSlot, new Date());
                                            const isBooked = Math.random() > 0.7; // Fake booking logic
                                            const isDisabled = isPast || isBooked;

                                            return (
                                                <button key={time} onClick={() => setSelectedTime(time)} disabled={isDisabled}
                                                    className={`p-2 rounded-lg text-sm transition-colors ${selectedTime === time ? 'bg-brand-primary text-brand-secondary' : 'bg-gray-700 text-brand-text'} ${isDisabled ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'hover:bg-brand-primary hover:text-brand-secondary'}`}>
                                                    {time}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(2)} className="bg-gray-700 text-brand-text font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Voltar</button>
                                <button onClick={() => setStep(4)} disabled={!selectedTime} className="bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed">Avançar</button>
                            </div>
                        </div>
                    )}
                    
                    {/* Step 4: Client Info */}
                    {step === 4 && (
                        <div key="step4">
                             <h2 className="text-xl font-semibold mb-4 text-brand-primary">Passo 4: Seus dados</h2>
                             <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nome Completo</label>
                                    <input type="text" id="name" value={clientName} onChange={e => setClientName(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                                 <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300">Número do WhatsApp</label>
                                    <input type="tel" id="whatsapp" value={clientWhatsapp} onChange={e => setClientWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary"/>
                                </div>
                             </div>
                             <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(3)} className="bg-gray-700 text-brand-text font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Voltar</button>
                                <button onClick={handleConfirmBooking} disabled={!clientName || !clientWhatsapp} className="bg-brand-primary text-brand-secondary font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed">Confirmar Agendamento</button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Success */}
                    {step === 5 && (
                        <div key="step5" className="text-center p-8">
                             <h2 className="text-2xl font-bold mb-4 text-brand-primary">Agendamento Confirmado!</h2>
                             <p className="text-lg">Pronto, <span className="font-bold">{clientName}</span>!</p>
                             <p className="mt-2 text-gray-300">
                                Seu horário foi agendado para <span className="font-semibold text-white">{format(selectedDate, "dd/MM/yyyy")}</span> às <span className="font-semibold text-white">{selectedTime}</span> com <span className="font-semibold text-white">{professionalForConfirmation.name}</span>.
                             </p>
                             <p className="mt-4 text-sm text-gray-400">Você receberá um lembrete no seu WhatsApp.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BookingPage;